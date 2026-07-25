const VALID_PAR_VALUES = new Set([3, 4, 5]);

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function validateCourseDb(db) {
  const errors = [];

  if (!isPlainObject(db)) {
    return { ok: false, errors: ["DB는 객체여야 합니다"] };
  }

  for (const [club, clubData] of Object.entries(db)) {
    const prefix = club || "(빈 골프장명)";
    if (!club.trim()) errors.push(`${prefix}: 골프장명이 비어 있습니다`);
    if (!isPlainObject(clubData)) {
      errors.push(`${prefix}: 골프장 데이터는 객체여야 합니다`);
      continue;
    }
    if (clubData.orig != null && typeof clubData.orig !== "string") {
      errors.push(`${prefix}: orig는 문자열이어야 합니다`);
    }

    const nines = clubData.nines;
    if (!isPlainObject(nines)) {
      errors.push(`${prefix}: nines는 객체여야 합니다`);
      continue;
    }

    const nineNames = new Set(Object.keys(nines));
    for (const [nine, pars] of Object.entries(nines)) {
      const where = `${prefix}/${nine || "(빈 코스명)"}`;
      if (!nine.trim()) errors.push(`${where}: 코스명이 비어 있습니다`);
      if (!Array.isArray(pars)) {
        errors.push(`${where}: par는 배열이어야 합니다`);
        continue;
      }
      if (pars.length !== 9) {
        errors.push(`${where}: par 배열은 정확히 9개여야 합니다`);
      }
      pars.forEach((par, i) => {
        const n = Number(par);
        if (!Number.isInteger(n) || !VALID_PAR_VALUES.has(n)) {
          errors.push(`${where}: ${i + 1}번 홀 par는 3, 4, 5 중 하나여야 합니다`);
        }
      });
    }

    const combos = clubData.combos ?? [];
    if (!Array.isArray(combos)) {
      errors.push(`${prefix}: combos는 배열이어야 합니다`);
      continue;
    }
    combos.forEach((combo, i) => {
      const where = `${prefix}/combos[${i}]`;
      if (!isPlainObject(combo)) {
        errors.push(`${where}: 조합은 객체여야 합니다`);
        return;
      }
      if (typeof combo.out !== "string" || !nineNames.has(combo.out)) {
        errors.push(`${where}: out이 등록된 나인명이 아닙니다`);
      }
      if (typeof combo.in !== "string" || !nineNames.has(combo.in)) {
        errors.push(`${where}: in이 등록된 나인명이 아닙니다`);
      }
      if (combo.out === combo.in) {
        errors.push(`${where}: out과 in은 달라야 합니다`);
      }
    });
  }

  return { ok: errors.length === 0, errors };
}
