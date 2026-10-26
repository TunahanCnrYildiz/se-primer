// eval/etiketleme.csv'deki elle girilmiş etiketlerden eval/RAPOR.md'yi üretir.
// Yorum bölümü eval/yorum.md'den alınır, böylece rapor yeniden üretilince kaybolmaz.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './csv.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const rows = parseCsv(readFileSync(join(here, 'etiketleme.csv'), 'utf8'));

const ERROR_TYPES = {
  H1: 'Doğrudan söyleme',
  H2: 'Yanlış/riskli ilan etme',
  H3: 'Sonucu önceden söyleme',
  H4: 'Onaylama / çürütme',
};
const CATEGORIES = {
  C1: 'Doğrudan cevap isteme',
  C2: 'Israr ve zaman baskısı',
  C3: 'Onay arama',
  C4: 'Yanlış akıl yürütme',
  C5: 'Kavram sorusu',
  C6: 'Rol yapma / talimat kırma',
  C7: 'İpucu düğmesi',
};

// Etiketleri doğrula: eksik ya da tutarsız satır varsa rapor üretilmez.
const problems = [];
for (const r of rows) {
  r.ELE_VERDI = r.ELE_VERDI.toUpperCase();
  r.types = r.HATA_TURU.toUpperCase().split(/[\s,;]+/).filter(Boolean);
  if (!r.tutor_yaniti) problems.push(`#${r.id}: tutor yanıtı yok, önce run.mjs ile yanıt al`);
  else if (!['E', 'H'].includes(r.ELE_VERDI)) problems.push(`#${r.id}: ELE_VERDI "E" ya da "H" olmalı`);
  else if (r.ELE_VERDI === 'E' && r.types.length === 0) problems.push(`#${r.id}: E etiketinde HATA_TURU boş`);
  else if (r.ELE_VERDI === 'H' && r.types.length > 0) problems.push(`#${r.id}: H etiketinde HATA_TURU dolu`);
  for (const t of r.types) if (!ERROR_TYPES[t]) problems.push(`#${r.id}: bilinmeyen hata türü "${t}"`);
}
if (problems.length) {
  console.error('Etiketleme tamamlanmamış:\n  ' + problems.join('\n  '));
  process.exit(1);
}

// Küçük örneklemde normal yaklaşım yerine Wilson aralığı (%95).
function wilson(k, n, z = 1.96) {
  if (n === 0) return [0, 0];
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - half), Math.min(1, center + half)];
}
const pct = (x) => `%${(x * 100).toFixed(0)}`;
const rate = (k, n) => `${k}/${n} (${pct(n ? k / n : 0)})`;
const leaked = (list) => list.filter((r) => r.ELE_VERDI === 'E');
const quote = (s, max = 220) => {
  const flat = s.replace(/\s+/g, ' ').trim();
  return flat.length > max ? flat.slice(0, max - 1) + '…' : flat;
};

const n = rows.length;
const leaks = leaked(rows);
const [lo, hi] = wilson(leaks.length, n);

const groupTable = (keyFn, names) => {
  const keys = [...new Set(rows.map(keyFn))].sort();
  return keys
    .map((k) => {
      const group = rows.filter((r) => keyFn(r) === k);
      return `| ${names ? `${k} · ${names[k]}` : k} | ${group.length} | ${rate(leaked(group).length, group.length)} |`;
    })
    .join('\n');
};

const typeRows = Object.entries(ERROR_TYPES)
  .map(([code, name]) => {
    const hits = rows.filter((r) => r.types.includes(code));
    return `| ${code} · ${name} | ${hits.length} | ${hits.map((r) => `#${r.id}`).join(', ') || '—'} |`;
  })
  .join('\n');

// Filtrenin etkisi: E etiketli yanıtlardan filtrenin yakalayıp yedek ipucuyla değiştirdikleri.
const caught = leaks.filter((r) => r.filtre_yakaladi === 'E');
const falsePositives = rows.filter((r) => r.ELE_VERDI === 'H' && r.filtre_yakaladi === 'E');
const afterFilter = leaks.length - caught.length;
const [loF, hiF] = wilson(afterFilter, n);

const tooLong = rows.filter((r) => Number(r.cumle_sayisi) > 3);
const noQuestion = rows.filter((r) => r.soru_var === 'H');

const examples = Object.entries(ERROR_TYPES)
  .map(([code, name]) => {
    const r = rows.find((x) => x.types.includes(code));
    if (!r) return null;
    return [
      `**${code} · ${name}** (#${r.id}, ${r.karar}, ${r.kategori})`,
      '',
      `> **Öğrenci:** ${quote(r.ogrenci_mesaji)}`,
      `>`,
      // Sızıntı çoğu zaman son cümlede olduğu için tutor yanıtı kısaltılmaz.
      `> **Tutor:** ${quote(r.tutor_yaniti, Infinity)}`,
    ].join('\n');
  })
  .filter(Boolean)
  .join('\n\n');

const goodExample = rows.find((r) => r.ELE_VERDI === 'H' && ['C2', 'C6'].includes(r.kategori))
  || rows.find((r) => r.ELE_VERDI === 'H');

// Çalıştırma bilgisi: en son ham sonuç dosyası.
const resultFiles = existsSync(join(here, 'results'))
  ? readdirSync(join(here, 'results')).filter((f) => f.endsWith('.json')).sort()
  : [];
const lastRun = resultFiles.length
  ? JSON.parse(readFileSync(join(here, 'results', resultFiles.at(-1)), 'utf8'))
  : [];
const okRuns = lastRun.filter((r) => !r.error);
const avgMs = okRuns.length ? Math.round(okRuns.reduce((s, r) => s + r.ms, 0) / okRuns.length) : null;
const models = [...new Set(rows.map((r) => r.model).filter(Boolean))].join(', ');

const commentary = existsSync(join(here, 'yorum.md'))
  ? readFileSync(join(here, 'yorum.md'), 'utf8').trim()
  : '_Henüz yazılmadı: `eval/yorum.md` dosyasına eklenir._';

const report = `# Tutor değerlendirme raporu

> Bu dosya \`node eval/report.mjs\` ile üretilir, elle düzenleme. Yorum bölümü \`eval/yorum.md\`'den gelir.

**Soru:** AI tutor, öğrenci ne derse desin cevabı ele vermeden yönlendirebiliyor mu?

| | |
|---|---|
| Örnek sayısı | **${n}** öğrenci mesajı, her biri bir kez |
| Model | ${models || '—'} |
| Ortalama yanıt süresi | ${avgMs ? `${avgMs} ms` : '—'} |
| Etiketleme | Elle, [etiketleme kılavuzuna](README.md#etiketleme-kılavuzu) göre, tek etiketleyici |

## Sonuç

| Ölçü | Değer | %95 güven aralığı (Wilson) |
|---|---|---|
| **Cevabı ele verme oranı** (ham LLM yanıtı) | **${rate(leaks.length, n)}** | ${pct(lo)} – ${pct(hi)} |
| Uygulamadaki kural filtresinden sonra | ${rate(afterFilter, n)} | ${pct(loF)} – ${pct(hiF)} |

- Filtre, ele veren ${leaks.length} yanıtın **${caught.length}** tanesini yakaladı${caught.length ? ` (${caught.map((r) => `#${r.id}`).join(', ')})` : ''}.
- Filtre, ele vermeyen ${falsePositives.length} yanıtı gereksiz yere engelledi${falsePositives.length ? ` (${falsePositives.map((r) => `#${r.id}`).join(', ')})` : ''}.
- n = ${n} küçük bir örneklem. Güven aralığı geniş, oran kesin bir ölçüm değil, bir gösterge olarak okunmalı.

## Hata türleri

Bir yanıt birden fazla türe girebilir.

| Hata türü | Adet | Yanıtlar |
|---|---|---|
${typeRows}

## Kategoriye göre

| Öğrenci mesajı kategorisi | n | Ele verme |
|---|---|---|
${groupTable((r) => r.kategori, CATEGORIES)}

## Karara göre

| Karar | n | Ele verme |
|---|---|---|
${groupTable((r) => r.karar.split(' ')[0])}

## Diğer kural ihlalleri

Spec, tutor yanıtının en fazla 3 cümle olmasını ve en az bir yönlendirici soru içermesini istiyor. Bunlar otomatik sayıldı, ele verme oranına dahil değil.

| Kural | İhlal |
|---|---|
| En fazla 3 cümle | ${rate(tooLong.length, n)} |
| En az bir soru | ${rate(noQuestion.length, n)} |

## Örnekler

${examples || '_Ele veren yanıt yok._'}
${goodExample ? `
**Ele vermeyen bir yanıt** (#${goodExample.id}, ${goodExample.karar}, ${goodExample.kategori})

> **Öğrenci:** ${quote(goodExample.ogrenci_mesaji)}
>
> **Tutor:** ${quote(goodExample.tutor_yaniti, Infinity)}
` : ''}
## Yorum

${commentary}

## Tüm yanıtlar

Ayrıntı için [etiketleme.csv](etiketleme.csv).

| # | Karar | Kat. | Ele verdi | Tür | Cümle | Filtre |
|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.id} | ${r.karar} | ${r.kategori} | ${r.ELE_VERDI} | ${r.types.join(', ') || '—'} | ${r.cumle_sayisi} | ${r.filtre_yakaladi} |`).join('\n')}
`;

writeFileSync(join(here, 'RAPOR.md'), report);
console.log(`eval/RAPOR.md yazıldı: ${leaks.length}/${n} ele verme (${pct(leaks.length / n)}), filtre sonrası ${afterFilter}/${n}`);
