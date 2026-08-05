import assert from "node:assert/strict";
import test from "node:test";
import {
  PAR_OPTIONS,
  validateHoleNumber,
  validateNumericOnly,
  validatePar,
  validateScore,
  validateShot,
} from "../lib/inputValidators.js";

test("validatePar accepts only PAR 3-6 and empty", () => {
  for (const ok of ["", "3", "4", "5", "6"]) assert.equal(validatePar(ok), true, ok);
  for (const bad of ["0", "1", "2", "7", "44", "-4", "4.5", "x", " 4"]) {
    assert.equal(validatePar(bad), false, bad);
  }
});

test("PAR_OPTIONS is exactly the set validatePar accepts", () => {
  // 버튼 목록과 검증 규칙이 갈라지면 고를 수 없는 값이나 막히는 버튼이 생긴다.
  const accepted = Array.from({ length: 10 }, (_, n) => n)
    .filter((n) => validatePar(String(n)));
  assert.deepEqual(PAR_OPTIONS, accepted);
});

test("validateScore bounds strokes to 1..max", () => {
  assert.equal(validateScore(""), true);
  assert.equal(validateScore("1"), true);
  assert.equal(validateScore("12"), true);
  assert.equal(validateScore("0"), false);
  assert.equal(validateScore("13"), false);
  assert.equal(validateScore("-3"), false);
  assert.equal(validateScore("2a"), false);
  // 커스텀 상한
  assert.equal(validateScore("15", 20), true);
  assert.equal(validateScore("21", 20), false);
});

test("validateHoleNumber allows 1..18 only", () => {
  assert.equal(validateHoleNumber(""), true);
  assert.equal(validateHoleNumber("1"), true);
  assert.equal(validateHoleNumber("18"), true);
  assert.equal(validateHoleNumber("0"), false);
  assert.equal(validateHoleNumber("19"), false);
  assert.equal(validateHoleNumber("100"), false);
  assert.equal(validateHoleNumber("1a"), false);
});

test("validateNumericOnly rejects signs, decimals and spaces", () => {
  assert.equal(validateNumericOnly(""), true);
  assert.equal(validateNumericOnly("0"), true);
  assert.equal(validateNumericOnly("450"), true);
  assert.equal(validateNumericOnly("-1"), false);
  assert.equal(validateNumericOnly("45.5"), false);
  assert.equal(validateNumericOnly("45 "), false);
  assert.equal(validateNumericOnly("4e2"), false);
});

test("validateShot caps at double par", () => {
  assert.equal(validateShot("", 4), true);
  assert.equal(validateShot("1", 4), true);
  assert.equal(validateShot("8", 4), true);
  assert.equal(validateShot("9", 4), false);
  assert.equal(validateShot("10", 5), true);
  assert.equal(validateShot("11", 5), false);
  assert.equal(validateShot("0", 4), false);
  // par 기본값은 4
  assert.equal(validateShot("8"), true);
  assert.equal(validateShot("9"), false);
});
