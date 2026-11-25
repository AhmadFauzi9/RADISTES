export const UH_COLUMNS = Array.from({ length: 5 }, (_, index) => ({
  key: `uh${index + 1}`,
  label: `UH ${index + 1}`,
}));

const hasValue = value => value != null && String(value).trim() !== '';

export function calculateDknAverage(sts, uhScores, round = true) {
  if (!hasValue(sts)) return '';
  const scores = [sts, ...uhScores].filter(hasValue).map(value => Number(String(value).replace(',', '.')));
  if (scores.some(score => !Number.isFinite(score) || score < 0 || score > 100)) return '';
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return round ? Math.round(average) : average;
}

export function dknAverageFormula(sts, scores, round = true) {
  const average = `AVERAGE(${scores})`;
  return `IF(OR(NOT(ISNUMBER(${sts})),COUNT(${scores})<>COUNTA(${scores}),MIN(${scores})<0,MAX(${scores})>100),"",${round ? `ROUND(${average},0)` : average})`;
}

export function dknStatusFormula(average, kkm, passed = 'Tercapai', below = 'Perlu Bimbingan') {
  return `IF(${average}="","",IF(${average}>=${kkm},"${passed}","${below}"))`;
}
