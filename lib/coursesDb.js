// ─────────────────────────────────────────────────────────────
// 코스 DB 로직 (골프장 기준 nested)
//   db = { "골프장": { nines: { "코스명": [9홀 par] }, combos: [{out,in}] } }
//   SEED_DB: 코드 시드 / KV(원격): 실시간 편집분 → mergeDb 후 coursesFromDb
// ─────────────────────────────────────────────────────────────
import { SEED_DB } from "./seedDb";
export { SEED_DB };

// db → 18홀 코스 배열 [{name, club, out, in, pars}]
export function coursesFromDb(db) {
  const out = [];
  for (const [club, c] of Object.entries(db || {})) {
    const nines = (c && c.nines) || {};
    for (const cb of (c && c.combos) || []) {
      const a = nines[cb.out];
      const b = nines[cb.in];
      if (a && b && a.length >= 9 && b.length >= 9) {
        out.push({
          name: `${club} ${cb.out}+${cb.in}`,
          club, out: cb.out, in: cb.in,
          pars: [...a.slice(0, 9), ...b.slice(0, 9)],
        });
      }
    }
  }
  return out;
}

// 시드 + 편집분 병합 (b가 우선)
export function mergeDb(a = {}, b = {}) {
  const out = {};
  for (const src of [a, b]) {
    for (const [club, c] of Object.entries(src || {})) {
      const cur = out[club] || { nines: {}, combos: [] };
      cur.nines = { ...cur.nines, ...((c && c.nines) || {}) };
      const seen = new Set(cur.combos.map((x) => x.out + "\u0000" + x.in));
      for (const cb of (c && c.combos) || []) {
        const k = cb.out + "\u0000" + cb.in;
        if (!seen.has(k)) { cur.combos.push({ out: cb.out, in: cb.in }); seen.add(k); }
      }
      out[club] = cur;
    }
  }
  return out;
}
