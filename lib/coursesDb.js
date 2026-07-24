// ─────────────────────────────────────────────────────────────
// 코스 DB 로직
//   SEED_DB (lib/seedDb.js): 코드에 박힌 시드 (모든 사용자 공유)
//   loadDb (localStorage):   admin 실시간 편집분 (이 브라우저)
//   → mergeDb 로 합쳐서 coursesFromDb 로 18홀 코스 생성
// ─────────────────────────────────────────────────────────────
import { SEED_DB } from "./seedDb";
export { SEED_DB };

// db = { nines:[{club,nine,pars:[9]}], combos:[{club,out,in}] } → 18홀 코스 배열
export function coursesFromDb(db) {
  const nines = (db && db.nines) || [];
  const combos = (db && db.combos) || [];
  const map = {};
  for (const n of nines) {
    if (n && n.club && n.nine && Array.isArray(n.pars)) map[n.club + "\u0000" + n.nine] = n.pars;
  }
  const out = [];
  for (const c of combos) {
    if (!c || !c.club) continue;
    const a = map[c.club + "\u0000" + c.out];
    const b = map[c.club + "\u0000" + c.in];
    if (a && b && a.length >= 9 && b.length >= 9) {
      out.push({
        name: `${c.club} ${c.out}+${c.in}`,
        club: c.club, out: c.out, in: c.in,
        pars: [...a.slice(0, 9), ...b.slice(0, 9)],
      });
    }
  }
  return out;
}

// 시드 + 편집분 병합 (b가 우선)
export function mergeDb(a = {}, b = {}) {
  const nkey = (n) => n.club + "\u0000" + n.nine;
  const nines = [...(a.nines || [])];
  for (const n of b.nines || []) {
    const i = nines.findIndex((x) => nkey(x) === nkey(n));
    if (i >= 0) nines[i] = n; else nines.push(n);
  }
  const ckey = (c) => [c.club, c.out, c.in].join("\u0000");
  const combos = [...(a.combos || [])];
  const seen = new Set(combos.map(ckey));
  for (const c of b.combos || []) if (!seen.has(ckey(c))) { combos.push(c); seen.add(ckey(c)); }
  return { nines, combos };
}
