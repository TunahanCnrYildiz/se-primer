// Excel'in Türkçe ayarlarıyla açılabilen CSV: ";" ayraç, UTF-8 BOM.
export const SEP = ';';
const BOM = '﻿';

function escapeCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers, rows) {
  const lines = [headers.map(escapeCell).join(SEP)];
  for (const row of rows) lines.push(headers.map((h) => escapeCell(row[h])).join(SEP));
  return BOM + lines.join('\r\n') + '\r\n';
}

// Tırnak içinde ayraç, tırnak ve satır sonu taşıyan hücreleri destekler.
// Excel bazen "," ile kaydedebildiği için ayraç başlık satırından tespit edilir.
export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.slice(0, text.search(/\r?\n/));
  const sep = firstLine.split(';').length >= firstLine.split(',').length ? ';' : ',';

  const records = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c !== '')) records.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); if (row.some((c) => c !== '')) records.push(row); }

  const [headers, ...data] = records;
  return data.map((r) => Object.fromEntries(headers.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}
