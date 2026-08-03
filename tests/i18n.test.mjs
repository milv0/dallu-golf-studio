import assert from "node:assert/strict";
import test from "node:test";
import { dictionary } from "../lib/i18nDictionary.js";

const LANGS = ["ko", "en"];
const PLACEHOLDER = /\$\{([a-zA-Z0-9_]+)\}/g;

function placeholders(value) {
  return new Set(String(value).match(PLACEHOLDER) || []);
}

test("dictionary exposes exactly the supported languages", () => {
  assert.deepEqual(Object.keys(dictionary).sort(), [...LANGS].sort());
});

test("ko and en have identical key sets", () => {
  const ko = Object.keys(dictionary.ko).sort();
  const en = Object.keys(dictionary.en).sort();
  const missingInEn = ko.filter((k) => !dictionary.en[k] && dictionary.en[k] !== "");
  const missingInKo = en.filter((k) => !dictionary.ko[k] && dictionary.ko[k] !== "");
  assert.deepEqual(missingInEn, [], `en 누락 키: ${missingInEn.join(", ")}`);
  assert.deepEqual(missingInKo, [], `ko 누락 키: ${missingInKo.join(", ")}`);
  assert.deepEqual(ko, en);
});

test("no translation value is empty", () => {
  for (const lang of LANGS) {
    for (const [key, value] of Object.entries(dictionary[lang])) {
      assert.equal(typeof value, "string", `${lang}.${key} 는 문자열이어야 함`);
      assert.notEqual(value.trim(), "", `${lang}.${key} 값이 비어 있음`);
    }
  }
});

test("interpolation placeholders match across languages", () => {
  for (const key of Object.keys(dictionary.ko)) {
    const koVars = placeholders(dictionary.ko[key]);
    const enVars = placeholders(dictionary.en[key] ?? "");
    assert.deepEqual(
      [...enVars].sort(),
      [...koVars].sort(),
      `${key} 의 치환 변수가 다름 (ko: ${[...koVars]} / en: ${[...enVars]})`
    );
  }
});

test("english values carry no Hangul", () => {
  const hangul = /[ㄱ-ㆎ가-힣]/;
  const leaked = Object.entries(dictionary.en)
    .filter(([, value]) => hangul.test(value))
    .map(([key]) => key);
  assert.deepEqual(leaked, [], `영문 사전에 한글이 남아 있음: ${leaked.join(", ")}`);
});
