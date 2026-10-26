import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { scenarioData } from './src/data/scenario.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser limit 4kb
app.use(express.json({ limit: '4kb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to extract client IP from the LAST value of X-Forwarded-For, or req.socket.remoteAddress
function getClientIp(req: express.Request): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim().length > 0) {
    const parts = xff.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  } else if (Array.isArray(xff) && xff.length > 0) {
    const allParts = xff
      .flatMap((item) => item.split(','))
      .map((p) => p.trim())
      .filter(Boolean);
    if (allParts.length > 0) {
      return allParts[allParts.length - 1];
    }
  }
  return req.socket.remoteAddress || 'unknown';
}

// In-memory per-IP rate limiting: max 20 requests per 10 minutes per client IP
const rateLimitWindowMs = 10 * 60 * 1000; // 10 minutes
const maxRequestsPerWindow = 20;
const ipRequestTimestamps = new Map<string, number[]>();

// In-memory global rate limiting: max 200 requests per hour total reaching Gemini call
const globalLimitWindowMs = 60 * 60 * 1000; // 1 hour
const maxGlobalRequestsPerHour = 200;
let globalRequestTimestamps: number[] = [];

// Periodically purge stale IP and global entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequestTimestamps.entries()) {
    const valid = timestamps.filter((t) => now - t < rateLimitWindowMs);
    if (valid.length === 0) {
      ipRequestTimestamps.delete(ip);
    } else {
      ipRequestTimestamps.set(ip, valid);
    }
  }
  globalRequestTimestamps = globalRequestTimestamps.filter(
    (t) => now - t < globalLimitWindowMs
  );
}, 5 * 60 * 1000);

function isTransientError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code;
  if (
    status === 503 ||
    status === 429 ||
    status === 'UNAVAILABLE' ||
    status === 'RESOURCE_EXHAUSTED'
  ) {
    return true;
  }
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota')
  );
}

const ALLOWED_DECISION_IDS = ['k1', 'k2', 'k3'] as const;
const ALLOWED_LEVELS = ['beginner', 'intermediate', 'experienced'] as const;
const ALLOWED_ROLES = ['backend', 'devops', 'qa'] as const;

app.post('/api/tutor', async (req, res) => {
  const reqStart = Date.now();
  const deadline = reqStart + 7000; // Total server attempt budget: 7000ms

  // 1. Per-IP Rate Limiting Check (LAST value of X-Forwarded-For or req.socket.remoteAddress)
  const clientIp = getClientIp(req);

  const timestamps = (ipRequestTimestamps.get(clientIp) || []).filter(
    (t) => reqStart - t < rateLimitWindowMs
  );

  if (timestamps.length >= maxRequestsPerWindow) {
    console.warn('Tutor rejected status=429 reason=Rate limit exceeded');
    return res.status(429).json({ error: 'Rate limit exceeded. Max 20 requests per 10 minutes.' });
  }

  // Record this request timestamp for client IP
  timestamps.push(reqStart);
  ipRequestTimestamps.set(clientIp, timestamps);

  // 2. Body Validation
  const body = req.body || {};
  const { decisionId, k1Choice, level, role, isHintRequest, message } = body;

  if (!ALLOWED_DECISION_IDS.includes(decisionId)) {
    console.warn(`Tutor rejected status=400 reason=Invalid decisionId (${decisionId})`);
    return res.status(400).json({ error: 'Invalid decisionId' });
  }

  if (!ALLOWED_LEVELS.includes(level)) {
    console.warn(`Tutor rejected status=400 reason=Invalid level (${level})`);
    return res.status(400).json({ error: 'Invalid level' });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    console.warn(`Tutor rejected status=400 reason=Invalid role (${role})`);
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (decisionId === 'k2' && k1Choice !== 'A' && k1Choice !== 'B') {
    console.warn(`Tutor rejected status=400 reason=k1Choice must be A or B for decision k2`);
    return res.status(400).json({ error: 'k1Choice must be A or B for decision k2' });
  }

  const rawMessage = typeof message === 'string' ? message : '';
  const trimmedMessage = rawMessage.trim();

  if (trimmedMessage.length > 500) {
    console.warn('Tutor rejected status=400 reason=Message exceeds 500 characters');
    return res.status(400).json({ error: 'Message exceeds 500 characters' });
  }

  const isHint = Boolean(isHintRequest);
  if (!isHint && trimmedMessage.length === 0) {
    console.warn('Tutor rejected status=400 reason=Message is empty for non-hint request');
    return res.status(400).json({ error: 'Message cannot be empty when isHintRequest is false' });
  }

  if (!ai) {
    console.warn('GEMINI_API_KEY not configured or invalid on server');
    return res.status(503).json({ error: 'AI tutor service unavailable' });
  }
  const genAI = ai;

  // 3. Server Builds the System Instruction and Prompt
  const decision = scenarioData.decisions.find((d) => d.id === decisionId);
  if (!decision) {
    console.warn(`Tutor rejected status=400 reason=Decision not found in scenario data`);
    return res.status(400).json({ error: 'Decision not found' });
  }

  // 4. Global Rate Limiting (count only requests that passed validation and reach Gemini call)
  const now = Date.now();
  globalRequestTimestamps = globalRequestTimestamps.filter(
    (t) => now - t < globalLimitWindowMs
  );
  if (globalRequestTimestamps.length >= maxGlobalRequestsPerHour) {
    console.warn('Tutor rejected status=429 reason=Global limit exceeded');
    return res.status(429).json({ error: 'Global rate limit exceeded' });
  }
  globalRequestTimestamps.push(now);

  let narrative = '';
  if (decisionId === 'k1') {
    narrative = decision.narrative?.[role] || '';
  } else if (decisionId === 'k2') {
    narrative = decision.narrativeByK1?.[k1Choice as 'A' | 'B']?.[role] || '';
  } else if (decisionId === 'k3') {
    const baseNarrative = decision.narrative?.[role] || '';
    narrative = decision.logLine ? `${baseNarrative} ${decision.logLine}` : baseNarrative;
  }

  const levelOption = scenarioData.onboarding.questions[0].options.find((o) => o.id === level);
  const roleOption = scenarioData.onboarding.questions[1].options.find((o) => o.id === role);
  const levelLabel = levelOption?.label || level;
  const roleLabel = roleOption?.label || role;

  const systemInstruction = scenarioData.tutor.systemPrompt
    .replace('{decisionLabel}', decision.label)
    .replace('{narrative}', narrative)
    .replace('{optionA}', decision.options.A.title)
    .replace('{optionB}', decision.options.B.title)
    .replace('{level}', levelLabel)
    .replace('{role}', roleLabel);

  const promptContent = isHint
    ? 'Lütfen bu durum için bir sonraki Sokratik ipucunu ver.'
    : trimmedMessage;

  // 5. Model Call with Retries and Fallback
  const primaryModel = 'gemini-3.1-flash-lite';
  const alternativeModel = 'gemini-3.8-flash';

  async function callModel(modelId: string, signal: AbortSignal): Promise<string> {
    const isLite = modelId === 'gemini-3.1-flash-lite';
    const config: any = {
      systemInstruction,
      maxOutputTokens: 300,
      temperature: 0.7,
      abortSignal: signal,
      httpOptions: { signal },
    };

    if (isLite) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
    } else {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
    }

    const response = await genAI.models.generateContent({
      model: modelId,
      contents: promptContent,
      config,
    });

    return response.text?.trim() || '';
  }

  async function attempt(modelId: string): Promise<string> {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 300) {
      throw new Error('Server deadline exceeded');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error('Server attempt budget exceeded'));
    }, remainingMs);

    try {
      const callPromise = callModel(modelId, controller.signal);
      const timeoutPromise = new Promise<string>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Server attempt budget exceeded'));
        });
      });

      return await Promise.race([callPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  let text = '';
  let successModel = '';
  let lastError: any = null;

  try {
    // 1. First attempt with primary lightweight model
    try {
      text = await attempt(primaryModel);
      successModel = primaryModel;
    } catch (err: any) {
      lastError = err;
      console.warn(`Primary model ${primaryModel} failed:`, err?.message || err);

      // On 503 or 429, retry once after ~800ms
      if (isTransientError(err) && Date.now() + 800 < deadline) {
        await new Promise((r) => setTimeout(r, 800));
        try {
          text = await attempt(primaryModel);
          successModel = primaryModel;
        } catch (retryErr: any) {
          lastError = retryErr;
          console.warn(`Retry of ${primaryModel} failed:`, retryErr?.message || retryErr);
        }
      }
    }

    // 2. If primary still failed and time remains, try alternative Flash model
    if (!text && Date.now() + 300 < deadline) {
      try {
        console.log(`Trying alternative Flash model ${alternativeModel}...`);
        text = await attempt(alternativeModel);
        successModel = alternativeModel;
      } catch (altErr: any) {
        lastError = altErr;
        console.warn(`Alternative model ${alternativeModel} failed:`, altErr?.message || altErr);
      }
    }

    if (text) {
      const duration = Date.now() - reqStart;
      console.log(`Tutor OK model=${successModel} ms=${duration}`);
      return res.json({ text, model: successModel });
    }

    throw lastError || new Error('All tutor model attempts failed');
  } catch (err: any) {
    const duration = Date.now() - reqStart;
    console.error(`Tutor error after ${duration}ms:`, err?.message || err);
    return res.status(500).json({ error: err?.message || 'Error processing tutor request' });
  }
});

// Mount Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`SE Primer server running on port ${port}`);
});
