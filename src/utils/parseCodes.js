// Парсинг кодов из текста: по одному на строку, берём похожие на КИ (начинаются с 01, длинные)
export function parseProductCodes(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const seen = new Set();
  const codes = [];
  for (const line of lines) {
    if (line.length < 20) continue;
    if (line.startsWith('01') && !/начиная|выдумай|марки|которы/i.test(line)) {
      if (!seen.has(line)) {
        seen.add(line);
        codes.push(line);
      }
    }
  }
  return codes;
}
