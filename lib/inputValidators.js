// 선택 가능한 PAR 값. 버튼 목록과 검증 규칙이 갈라지지 않게 한 곳에서만 정의한다.
export const PAR_OPTIONS = [3, 4, 5, 6];

const PAR_PATTERN = new RegExp(`^[${PAR_OPTIONS.join("")}]$`);

export function validatePar(value) {
  return value === "" || PAR_PATTERN.test(value);
}

export function validateScore(value, max = 12) {
  if (value === "") return true;
  if (!/^\d+$/.test(value)) return false;
  return Number(value) >= 1 && Number(value) <= max;
}

export function validateHoleNumber(value) {
  if (value === "") return true;
  if (!/^\d{1,2}$/.test(value)) return false;
  const n = parseInt(value, 10);
  return n >= 1 && n <= 18;
}

export function validateNumericOnly(value) {
  return value === "" || /^\d+$/.test(value);
}

export function validateShot(value, par = 4) {
  if (value === "") return true;
  if (!/^\d+$/.test(value)) return false;
  const n = Number(value);
  return n >= 1 && n <= par * 2;
}
