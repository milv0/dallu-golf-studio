// 코스 DB 로컬 캐시 (localStorage) — KV 오프라인 대비
// db = { "골프장": { nines:{...}, combos:[...] } }
const KEY = "sc-coursedb";

export function loadDb() {
  if (typeof window === "undefined") return {};
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "{}");
    return d && typeof d === "object" && !Array.isArray(d) ? d : {};
  } catch {
    return {};
  }
}

export function saveDb(db) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db || {}));
}
