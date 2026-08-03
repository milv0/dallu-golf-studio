export function displayPlayerName(value) {
  const name = String(value || "PLAYER").trim() || "PLAYER";
  return name.toUpperCase();
}

function visualUnits(text) {
  return Array.from(String(text || "")).reduce((sum, ch) => {
    if (/\s/.test(ch)) return sum + 0.35;
    if (/[^\x00-\x7F]/.test(ch)) return sum + 0.92;
    return sum + 0.58;
  }, 0);
}

// 문자열의 대략적인 렌더 폭(px). SVG 측정 없이 레이아웃을 잡을 때 사용.
// mono는 등폭 advance(≈0.6em), head는 비례폭 평균(≈0.45em) 기준.
export function textWidth(text, fontSize, kind = "mono") {
  const perEm = kind === "mono" ? 0.6 : 0.45;
  return visualUnits(text) / 0.58 * fontSize * perEm;
}

export function fitFontSize(text, { base, min, maxWidth }) {
  const units = Math.max(visualUnits(text), 1);
  const fitted = Math.floor(maxWidth / units);
  return Math.max(min, Math.min(base, fitted));
}
