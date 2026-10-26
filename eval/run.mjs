// 20 öğrenci mesajını yerel tutor'a gönderir, ham sonuçları ve etiketleme tablosunu yazar.
// Kullanım: node eval/run.mjs [--url=http://localhost:3000] [--only=4,11]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toCsv, parseCsv } from './csv.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')),
);
const baseUrl = args.url || 'http://localhost:3000';
const only = args.only ? new Set(args.only.split(',').map(Number)) : null;

const inputs = JSON.parse(readFileSync(join(here, 'inputs.json'), 'utf8'));
const csvPath = join(here, 'etiketleme.csv');

// app/src/services/tutor.ts içindeki violatesTutorRules ile aynı kalıplar.
// Uygulamadaki filtre yanıtı oyuncuya göstermeden önce bu kalıplarla eler.
const FILTER_PATTERNS = [
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
const filterHit = (text) => FILTER_PATTERNS.some((p) => p.test(text.toLowerCase()));

// Nokta, soru ve ünlem işaretine göre kaba cümle sayımı; "08:15" gibi saatleri bölmez.
const countSentences = (text) =>
  text.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter((s) => /\p{L}/u.test(s)).length;

async function ask(input) {
  const body = {
    decisionId: input.decisionId,
    k1Choice: input.k1Choice,
    level: input.level,
    role: input.role,
    isHintRequest: input.isHintRequest,
    message: input.message,
  };
  const started = Date.now();
  try {
    const res = await fetch(`${baseUrl}/api/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    return {
      status: res.status,
      text: res.ok ? (data.text || '').trim() : '',
      model: data.model || '',
      error: res.ok ? '' : data.error || `HTTP ${res.status}`,
      ms: Date.now() - started,
    };
  } catch (err) {
    return { status: 0, text: '', model: '', error: String(err.message || err), ms: Date.now() - started };
  }
}

const results = [];
for (const input of inputs) {
  if (only && !only.has(input.id)) continue;
  const r = await ask(input);
  results.push({ ...input, ...r });
  const label = r.error ? `HATA: ${r.error}` : `${r.model} ${r.ms} ms`;
  console.log(`#${String(input.id).padStart(2)} ${input.decisionId} ${input.category}  ${label}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
mkdirSync(join(here, 'results'), { recursive: true });
writeFileSync(join(here, 'results', `${stamp}.json`), JSON.stringify(results, null, 2));

// Etiketleme tablosu: yanıtı değişmeyen satırlardaki elle girilmiş etiketler korunur.
// Bu çalıştırmada yeni yanıt alan satırın etiketleri, eski yanıta ait oldukları için silinir.
const HEADERS = [
  'id', 'karar', 'kategori', 'seviye', 'rol', 'ogrenci_mesaji', 'tutor_yaniti',
  'model', 'cumle_sayisi', 'soru_var', 'filtre_yakaladi', 'ELE_VERDI', 'HATA_TURU',
];
const existing = existsSync(csvPath)
  ? Object.fromEntries(parseCsv(readFileSync(csvPath, 'utf8')).map((r) => [r.id, r]))
  : {};

const rows = inputs.map((input) => {
  const prev = existing[String(input.id)] || {};
  const fresh = results.find((r) => r.id === input.id && !r.error);
  const base = {
    id: input.id,
    karar: input.decisionId.toUpperCase() + (input.k1Choice ? ` (K1=${input.k1Choice})` : ''),
    kategori: input.category,
    seviye: input.level,
    rol: input.role,
    ogrenci_mesaji: input.isHintRequest ? '[İpucu iste düğmesi]' : input.message,
    ELE_VERDI: prev.ELE_VERDI || '',
    HATA_TURU: prev.HATA_TURU || '',
  };
  if (!fresh) return { ...prev, ...base };
  const answerChanged = fresh.text !== (prev.tutor_yaniti || '');
  return {
    ...base,
    ...(answerChanged && { ELE_VERDI: '', HATA_TURU: '' }),
    tutor_yaniti: fresh.text,
    model: fresh.model,
    cumle_sayisi: countSentences(fresh.text),
    soru_var: fresh.text.includes('?') ? 'E' : 'H',
    filtre_yakaladi: filterHit(fresh.text) ? 'E' : 'H',
  };
});
writeFileSync(csvPath, toCsv(HEADERS, rows));

const failed = results.filter((r) => r.error).map((r) => r.id);
console.log(`\n${results.length - failed.length}/${results.length} yanıt alındı → eval/etiketleme.csv`);
if (failed.length) console.log(`Hata alanları yeniden göndermek için: node eval/run.mjs --only=${failed.join(',')}`);
