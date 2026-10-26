import { DecisionData, scenarioData } from '../data/scenario';
import { Level, Role, Choice } from '../types';

export interface TutorRequestBody {
  decisionId: 'k1' | 'k2' | 'k3';
  k1Choice: 'A' | 'B' | null;
  level: Level;
  role: Role;
  isHintRequest: boolean;
  message: string;
}

export interface AskTutorParams {
  decision: DecisionData;
  decisionId: 'k1' | 'k2' | 'k3';
  k1Choice?: Choice | null;
  level: Level;
  role: Role;
  userQuestion?: string;
  isHintRequest?: boolean;
  hintIndex: number;
}

export interface TutorResponse {
  text: string;
  isFallback: boolean;
}

// Rule filter checking for forbidden answers (KÖ-5 & Spec §5)
// 1) Saying A or B as direct recommendation ("A'yı seç", "A'yı öneririm", "B seçmelisin")
// 2) Declaring an option clearly wrong ("B hata olur", "A seçeneği yanlış")
// 3) Giving away the outcome directly before decision
function violatesTutorRules(text: string): boolean {
  const normalized = text.toLowerCase();
  const forbiddenPatterns = [
    /\ba['’]yı\s+seç/i,
    /\bb['’]yi\s+seç/i,
    /\ba\s+seçeneğini\s+seç/i,
    /\bb\s+seçeneğini\s+seç/i,
    /\ba\s+seçeneği\s+doğru/i,
    /\bb\s+seçeneği\s+doğru/i,
    /\ba\s+seçeneği\s+yanlış/i,
    /\bb\s+seçeneği\s+yanlış/i,
    /\ba\s+şıkkı\b/i,
    /\bb\s+şıkkı\b/i,
    /\bdoğru\s+cevap\s+a\b/i,
    /\bdoğru\s+cevap\s+b\b/i,
    /\bcevabımız\s+a\b/i,
    /\bcevabımız\s+b\b/i,
  ];

  return forbiddenPatterns.some((pattern) => pattern.test(normalized));
}

export async function askTutor({
  decision,
  decisionId,
  k1Choice = null,
  level,
  role,
  userQuestion,
  isHintRequest = false,
  hintIndex,
}: AskTutorParams): Promise<TutorResponse> {
  const fallbackHint =
    decision.hints[hintIndex % decision.hints.length] ||
    decision.hints[0] ||
    "Kararın getireceği teknik sonucu düşün.";

  const payload: TutorRequestBody = {
    decisionId,
    k1Choice: k1Choice ?? null,
    level,
    role,
    isHintRequest: Boolean(isHintRequest),
    message: isHintRequest ? '' : (userQuestion || '').trim(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, scenarioData.tutor.timeoutMs || 8000);

    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Any non-200 response (including 400, 429, 500, 503) must silently fall back to the next fixed hint
    if (!res.ok) {
      console.warn(`Tutor API returned HTTP ${res.status}, silently falling back to fixed hint.`);
      return { text: fallbackHint, isFallback: true };
    }

    const data = await res.json();
    const generatedText = (data.text || '').trim();

    if (!generatedText) {
      console.warn('Tutor API returned empty text, using fallback.');
      return { text: fallbackHint, isFallback: true };
    }

    // Check if the generated response violates the 3 Socratic rules
    if (violatesTutorRules(generatedText)) {
      console.warn('Tutor response contained forbidden suggestion, using Socratic fallback.');
      return { text: fallbackHint, isFallback: true };
    }

    return { text: generatedText, isFallback: false };
  } catch (error) {
    // If call throws, network breaks, aborts, or times out > 8000ms:
    // Never show an error to the player (spec KÖ-7). Return the next fixed hint.
    console.warn('Tutor call failed or timed out, gracefully falling back to fixed hint:', error);
    return { text: fallbackHint, isFallback: true };
  }
}
