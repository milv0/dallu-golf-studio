// 코스 DB 공용 저장소 (localStorage) — admin과 메인 앱이 공유
// db = { nines: [{club,nine,pars:[9]}], combos: [{club,out,in}] }
const KEY = "sc-coursedb";

export function loadDb() {
  if (typeof window === "undefined") return { nines: [], combos: [] };
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { nines: d.nines || [], combos: d.combos || [] };
  } catch {
    return { nines: [], combos: [] };
  }
}

export function saveDb(db) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ nines: db.nines || [], combos: db.combos || [] }));
}
