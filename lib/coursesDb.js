// ─────────────────────────────────────────────────────────────
// 골프장 코스 DB
//   nines:  { club, nine, pars:[9] }        ← 나인별 PAR (par 데이터)
//   combos: { club, out, in }               ← 골프장이 제공하는 전/후반 조합(순서)
//   → coursesFromDb: 조합마다 나인 par를 합쳐 18홀 코스 생성 → 사용자에게 제공
//
// 실제 데이터는 /admin 에서 입력 → localStorage("sc-coursedb")에 저장 → 메인 앱이 실시간 사용.
// ─────────────────────────────────────────────────────────────

// db = { nines: [...], combos: [...] } → 18홀 코스 배열
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
