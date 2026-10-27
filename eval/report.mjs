// Elle girilmiş etiketlerden eval/RAPOR.md'yi üretir.
// Tur 1: etiketleme.csv (zorunlu). Tur 2: etiketleme-tur2.csv (varsa ve etiketliyse iki tur karşılaştırılır).
// Yorum bölümü eval/yorum.md'den alınır, böylece rapor yeniden üretilince kaybolmaz.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './csv.mjs';

const here = dirname(fileURLToPath(import.meta.url));

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
const ROUNDS = [
  { round: 1, csv: 'etiketleme.csv', prompt: 'prompts/tutor-v1.txt' },
  { round: 2, csv: 'etiketleme-tur2.csv', prompt: 'prompts/tutor-v2.txt' },
];

// Etiketleri doğrular. Tur 1 eksikse rapor üretilmez; sonraki turlar eksikse karşılaştırmaya alınmaz.
function loadRound({ round, csv }) {
  const path = join(here, csv);
  if (!existsSync(path)) return null;
  const rows = parseCsv(readFileSync(path, 'utf8'));
  const problems = [];
  for (const r of rows) {
    r.ELE_VERDI = (r.ELE_VERDI || '').toUpperCase();
    r.types = (r.HATA_TURU || '').toUpperCase().split(/[\s,;]+/).filter(Boolean);
    if (!r.tutor_yaniti) problems.push(`#${r.id}: tutor yanıtı yok, önce run.mjs ile yanıt al`);
    else if (!['E', 'H'].includes(r.ELE_VERDI)) problems.push(`#${r.id}: ELE_VERDI "E" ya da "H" olmalı`);
    else if (r.ELE_VERDI === 'E' && r.types.length === 0) problems.push(`#${r.id}: E etiketinde HATA_TURU boş`);
    else if (r.ELE_VERDI === 'H' && r.types.length > 0) problems.push(`#${r.id}: H etiketinde HATA_TURU dolu`);
    for (const t of r.types) if (!ERROR_TYPES[t]) problems.push(`#${r.id}: bilinmeyen hata türü "${t}"`);
  }
  if (problems.length) {
    const msg = `Tur ${round} (${csv}) etiketlemesi tamamlanmamış:\n  ${problems.join('\n  ')}`;
    if (round === 1) {
      console.error(msg);
      process.exit(1);
    }
    console.warn(`${msg}\n→ Rapor yalnızca önceki turlarla üretiliyor.`);
    return null;
  }
  return rows;
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
const ci = (k, n) => {
  const [lo, hi] = wilson(k, n);
  return `${pct(lo)} – ${pct(hi)}`;
};
const leaked = (list) => list.filter((r) => r.ELE_VERDI === 'E');
const quote = (s, max = 220) => {
  const flat = s.replace(/\s+/g, ' ').trim();
  return flat.length > max ? flat.slice(0, max - 1) + '…' : flat;
};

function stats(rows) {
  const leaks = leaked(rows);
  const caught = leaks.filter((r) => r.filtre_yakaladi === 'E');
  return {
    n: rows.length,
    leaks,
    caught,
    falsePositives: rows.filter((r) => r.ELE_VERDI === 'H' && r.filtre_yakaladi === 'E'),
    afterFilter: leaks.length - caught.length,
    tooLong: rows.filter((r) => Number(r.cumle_sayisi) > 3),
    noQuestion: rows.filter((r) => r.soru_var === 'H'),
    models: [...new Set(rows.map((r) => r.model).filter(Boolean))],
  };
}

// Çalıştırma bilgisi, o turun bütün ham sonuç dosyalarından (eki olmayan eski dosyalar tur 1 sayılır):
// - İlk tam koşu (20 mesajın hepsi): kaç istek zaman aşımına ya da hataya düştü, kaçı 8 sn'yi aştı.
//   Oyuncunun yaşayacağı durum budur: hata ya da 8 sn'yi aşan yanıt oyunda sabit ipucuna düşer.
// - Ortalama süre: etiketlenen yanıtların, yani her mesajın en son başarılı yanıtının süresi.
function runInfo(round, n) {
  const dir = join(here, 'results');
  if (!existsSync(dir)) return {};
  const runs = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => (f.match(/-tur(\d+)\.json$/)?.[1] ?? '1') === String(round))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
  const fullRun = runs.find((r) => r.length === n);
  const latest = {};
  for (const run of runs) for (const r of run) if (!r.error) latest[r.id] = r;
  const ok = Object.values(latest);
  if (!fullRun || !ok.length) return {};
  return {
    avgMs: Math.round(ok.reduce((s, r) => s + r.ms, 0) / ok.length),
    firstRunFallback: fullRun.filter((r) => r.error || r.ms > 8000).length,
    retried: runs.length > 1,
  };
}

const rounds = ROUNDS.map((def) => ({ ...def, rows: loadRound(def) }))
  .filter((r) => r.rows)
  .map((r) => ({ ...r, s: stats(r.rows), run: runInfo(r.round, r.rows.length) }));
const first = rounds[0];
const last = rounds.at(-1);
const compared = rounds.length > 1;
const head = (label) => (compared ? rounds.map((r) => `${label} ${r.round}`).join(' | ') : 'Değer');
const sep = compared ? rounds.map(() => '---').join('|') : '---';
const cells = (fn) => rounds.map(fn).join(' | ');

const summaryTable = `| Ölçü | ${head('Tur')} |
|---|${sep}|
| **Cevabı ele verme oranı** | ${cells((r) => `**${rate(r.s.leaks.length, r.s.n)}**`)} |
| %95 güven aralığı (Wilson) | ${cells((r) => ci(r.s.leaks.length, r.s.n))} |
| Kural filtresinden sonra | ${cells((r) => rate(r.s.afterFilter, r.s.n))} |
| Filtrenin yakaladığı sızıntı | ${cells((r) => `${r.s.caught.length}/${r.s.leaks.length}`)} |
| 3 cümleden uzun yanıt | ${cells((r) => rate(r.s.tooLong.length, r.s.n))} |
| Soru içermeyen yanıt | ${cells((r) => rate(r.s.noQuestion.length, r.s.n))} |
| Ortalama yanıt süresi | ${cells((r) => (r.run.avgMs ? `${r.run.avgMs} ms` : '—'))} |
| İlk koşuda oyunda sabit ipucuna düşecek istek (hata ya da > 8 sn) | ${cells((r) => (r.run.avgMs ? `${r.run.firstRunFallback}/${r.s.n}${r.run.retried ? ' (yeniden gönderildi)' : ''}` : '—'))} |`;

const typeTable = `| Hata türü | ${head('Tur')} |
|---|${sep}|
${Object.entries(ERROR_TYPES)
  .map(([code, name]) => {
    const per = rounds.map((r) => {
      const hits = r.rows.filter((x) => x.types.includes(code));
      return `${hits.length}${hits.length ? ` (${hits.map((x) => `#${x.id}`).join(', ')})` : ''}`;
    });
    return `| ${code} · ${name} | ${per.join(' | ')} |`;
  })
  .join('\n')}`;

const groupTable = (title, keyFn, names) => {
  const keys = [...new Set(first.rows.map(keyFn))].sort();
  return `| ${title} | n | ${head('Tur')} |
|---|---|${sep}|
${keys
  .map((k) => {
    const per = rounds.map((r) => {
      const g = r.rows.filter((x) => keyFn(x) === k);
      return rate(leaked(g).length, g.length);
    });
    const n = first.rows.filter((x) => keyFn(x) === k).length;
    return `| ${names ? `${k} · ${names[k]}` : k} | ${n} | ${per.join(' | ')} |`;
  })
  .join('\n')}`;
};

// Mesaj bazında değişim: aynı öğrenci mesajı iki turda nasıl etiketlendi?
let transitionSection = '';
if (compared) {
  const byId = Object.fromEntries(last.rows.map((r) => [r.id, r]));
  const pairs = first.rows.map((a) => ({ a, b: byId[a.id] })).filter((p) => p.b);
  const group = (from, to) => pairs.filter((p) => p.a.ELE_VERDI === from && p.b.ELE_VERDI === to);
  const ids = (list) => list.map((p) => `#${p.a.id}`).join(', ') || '—';
  const fixed = group('E', 'H');
  const regressed = group('H', 'E');
  const fixedExample = fixed[0];
  transitionSection = `## Mesaj bazında değişim

Aynı 20 öğrenci mesajı iki turda da gönderildi. Her mesajın etiketi nasıl değişti?

| Tur 1 → Tur ${last.round} | Adet | Mesajlar |
|---|---|---|
| Ele veriyordu → **artık vermiyor** | ${fixed.length} | ${ids(fixed)} |
| Ele vermiyordu → **artık veriyor** | ${regressed.length} | ${ids(regressed)} |
| İkisinde de ele verdi | ${group('E', 'E').length} | ${ids(group('E', 'E'))} |
| İkisinde de ele vermedi | ${group('H', 'H').length} | ${ids(group('H', 'H'))} |
${fixedExample ? `
**Örnek: aynı mesaja iki yanıt** (#${fixedExample.a.id}, ${fixedExample.a.karar}, ${fixedExample.a.kategori})

> **Öğrenci:** ${quote(fixedExample.a.ogrenci_mesaji)}
>
> **Tur 1 (${fixedExample.a.types.join(', ')}):** ${quote(fixedExample.a.tutor_yaniti, Infinity)}
>
> **Tur ${last.round} (ele vermedi):** ${quote(fixedExample.b.tutor_yaniti, Infinity)}
` : ''}`;
}

const examples = Object.entries(ERROR_TYPES)
  .map(([code, name]) => {
    const r = last.rows.find((x) => x.types.includes(code));
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

const goodExample = last.rows.find((r) => r.ELE_VERDI === 'H' && ['C2', 'C6'].includes(r.kategori))
  || last.rows.find((r) => r.ELE_VERDI === 'H');

const commentary = existsSync(join(here, 'yorum.md'))
  ? readFileSync(join(here, 'yorum.md'), 'utf8').trim()
  : '_Henüz yazılmadı: `eval/yorum.md` dosyasına eklenir._';

const allRows = `| # | Karar | Kat. | ${rounds.map((r) => `Tur ${r.round}: ele verdi / tür`).join(' | ')} |
|---|---|---|${sep}|
${first.rows
  .map((a) => {
    const per = rounds.map((r) => {
      const x = r.rows.find((y) => y.id === a.id);
      return x ? `${x.ELE_VERDI}${x.types.length ? ` · ${x.types.join(', ')}` : ''}` : '—';
    });
    return `| ${a.id} | ${a.karar} | ${a.kategori} | ${per.join(' | ')} |`;
  })
  .join('\n')}`;

const report = `# Tutor değerlendirme raporu

> Bu dosya \`node eval/report.mjs\` ile üretilir, elle düzenleme. Yorum bölümü \`eval/yorum.md\`'den gelir.

**Soru:** AI tutor, öğrenci ne derse desin cevabı ele vermeden yönlendirebiliyor mu?

| | |
|---|---|
| Örnek sayısı | **${first.s.n}** öğrenci mesajı${compared ? `, her turda aynı mesajlar` : ', her biri bir kez'} |
${compared ? rounds.map((r) => `| Tur ${r.round} | Tutor talimatı [v${r.round}](${r.prompt}) |`).join('\n') + '\n' : ''}| Model | ${[...new Set(rounds.flatMap((r) => r.s.models))].join(', ') || '—'} |
| Etiketleme | Elle, [etiketleme kılavuzuna](README.md#etiketleme-kılavuzu) göre, tek etiketleyici${compared ? ', her tur ayrı' : ''} |

## Sonuç

${summaryTable}

- n = ${first.s.n} küçük bir örneklem. Güven aralığı geniş, oran kesin bir ölçüm değil, bir gösterge olarak okunmalı.${compared ? `
- Talimat, tur 1'in sızıntılarına bakılarak yazıldı ve aynı 20 mesajla ölçüldü. Tur ${last.round}'nin oranı bu yüzden olduğundan iyi görünebilir (bkz. Yorum).` : ''}

${transitionSection}
## Hata türleri

Bir yanıt birden fazla türe girebilir.

${typeTable}

## Kategoriye göre

${groupTable('Öğrenci mesajı kategorisi', (r) => r.kategori, CATEGORIES)}

## Karara göre

${groupTable('Karar', (r) => r.karar.split(' ')[0])}

## Örnekler${compared ? ` (tur ${last.round})` : ''}

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

Ayrıntı: ${rounds.map((r) => `[${r.csv}](${r.csv})`).join(' · ')}

${allRows}
`;

writeFileSync(join(here, 'RAPOR.md'), report);
console.log(
  `eval/RAPOR.md yazıldı: ${rounds.map((r) => `tur ${r.round} ${r.s.leaks.length}/${r.s.n} (${pct(r.s.leaks.length / r.s.n)})`).join(' → ')}`,
);
