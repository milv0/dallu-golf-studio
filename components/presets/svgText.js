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

export function fitFontSize(text, { base, min, maxWidth }) {
  const units = Math.max(visualUnits(text), 1);
  const fitted = Math.floor(maxWidth / units);
  return Math.max(min, Math.min(base, fitted));
}
