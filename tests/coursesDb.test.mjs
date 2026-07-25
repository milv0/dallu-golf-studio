import assert from "node:assert/strict";
import test from "node:test";
import { coursesFromDb, effectiveDb } from "../lib/coursesDb.js";
import { validateCourseDb } from "../lib/courseDbValidation.js";

const nineA = [4, 4, 3, 5, 4, 4, 3, 5, 4];
const nineB = [5, 4, 4, 3, 4, 5, 4, 3, 4];

test("effectiveDb accepts only plain object data", () => {
  assert.deepEqual(effectiveDb({ A: {} }), { A: {} });
  assert.deepEqual(effectiveDb(null), {});
  assert.deepEqual(effectiveDb([]), {});
});

test("coursesFromDb exposes 18-hole combo courses", () => {
  const courses = coursesFromDb({
    "테스트CC": {
      nines: { OUT: nineA, IN: nineB },
      combos: [{ out: "OUT", in: "IN" }],
    },
  });

  assert.deepEqual(courses, [
    {
      name: "테스트CC OUT+IN",
      club: "테스트CC",
      out: "OUT",
      in: "IN",
      holes: 18,
      pars: [...nineA, ...nineB],
    },
  ]);
});

test("coursesFromDb exposes a single 9-hole club without combos", () => {
  const courses = coursesFromDb({
    "직접추가9홀": {
      nines: { 퍼블릭: nineA },
      combos: [],
    },
  });

  assert.deepEqual(courses, [
    {
      name: "직접추가9홀 퍼블릭",
      club: "직접추가9홀",
      out: "퍼블릭",
      holes: 9,
      pars: nineA,
    },
  ]);
});

test("validateCourseDb rejects malformed par arrays and combo references", () => {
  const result = validateCourseDb({
    "잘못된CC": {
      nines: { OUT: [4, 4, 4], IN: [4, 4, 4, 4, 4, 4, 4, 4, 6] },
      combos: [{ out: "OUT", in: "MISSING" }],
    },
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /정확히 9개/);
  assert.match(result.errors.join("\n"), /3, 4, 5/);
  assert.match(result.errors.join("\n"), /등록된 나인명/);
});

test("validateCourseDb accepts valid 9-hole and 18-hole data", () => {
  const result = validateCourseDb({
    "테스트CC": {
      nines: { OUT: nineA, IN: nineB },
      combos: [{ out: "OUT", in: "IN" }],
    },
    "직접추가9홀": {
      nines: { 퍼블릭: nineA },
      combos: [],
    },
  });

  assert.deepEqual(result, { ok: true, errors: [] });
});
