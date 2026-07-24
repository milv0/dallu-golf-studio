// ─────────────────────────────────────────────────────────────
// 코스 DB 로직 (골프장 기준 nested) — KV(원격)가 유일한 소스
//   db = { "골프장": { nines: { "코스명": [9홀 par] }, combos: [{out,in}] } }
// ─────────────────────────────────────────────────────────────

// KV가 유일한 소스. 받은 데이터를 그대로 사용(로컬 seed 병합 없음).
export function effectiveDb(remote) {
  return remote && typeof remote === "object" && !Array.isArray(remote) ? remote : {};
}

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
