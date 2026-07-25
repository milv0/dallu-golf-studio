// ─────────────────────────────────────────────────────────────
// 코스 DB 로직 (골프장 기준 nested) — KV(원격)가 유일한 소스
//   db = { "골프장": { nines: { "코스명": [9홀 par] }, combos: [{out,in}] } }
// ─────────────────────────────────────────────────────────────
import { COURSE_DIRECTORY } from "./courseDirectory.js";

const HOLES_BY_CLUB = new Map(COURSE_DIRECTORY.map((c) => [c.name, c.holes]));

// KV가 유일한 소스. 받은 데이터를 그대로 사용(로컬 seed 병합 없음).
export function effectiveDb(remote) {
  return remote && typeof remote === "object" && !Array.isArray(remote) ? remote : {};
}

function isSingleNineClub(club, c, nineNames, combos) {
  if (combos.length > 0 || nineNames.length !== 1) return false;
  const expectedHoles = HOLES_BY_CLUB.get(c?.orig || club);
  return expectedHoles == null || Math.round(expectedHoles / 9) === 1;
}

// db → 선택 가능한 코스 배열 [{name, club, out, in?, pars, holes}]
// 18홀 이상 구장은 combos 기준으로, 9홀 구장은 단일 나인 기준으로 노출한다.
export function coursesFromDb(db) {
  const out = [];
  for (const [club, c] of Object.entries(db || {})) {
    const nines = (c && c.nines) || {};
    const combos = (c && c.combos) || [];
    const nineNames = Object.keys(nines);

    for (const cb of combos) {
      const a = nines[cb.out];
      const b = nines[cb.in];
      if (a && b && a.length >= 9 && b.length >= 9) {
        out.push({
          name: `${club} ${cb.out}+${cb.in}`,
          club, out: cb.out, in: cb.in,
          holes: 18,
          pars: [...a.slice(0, 9), ...b.slice(0, 9)],
        });
      }
    }

    if (isSingleNineClub(club, c, nineNames, combos)) {
      const nine = nineNames[0];
      const pars = nines[nine];
      if (pars && pars.length >= 9) {
        out.push({
          name: `${club} ${nine}`,
          club, out: nine,
          holes: 9,
          pars: pars.slice(0, 9),
        });
      }
    }
  }
  return out;
}
