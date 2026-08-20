import assert from "node:assert/strict";
import test from "node:test";
import { GUIDE_SECTION_IDS, guideContent, guideFor } from "../lib/guideContent.js";

const LANGS = ["ko", "en"];

function everyString(lang) {
  const g = guideContent[lang];
  const out = [[`${lang}.subtitle`, g.subtitle], [`${lang}.usageTitle`, g.usageTitle]];
  g.steps.forEach((s, i) => {
    out.push([`${lang}.steps[${i}].step`, s.step]);
    out.push([`${lang}.steps[${i}].title`, s.title]);
    out.push([`${lang}.steps[${i}].desc`, s.desc]);
  });
  g.sections.forEach((section) => {
    out.push([`${lang}.${section.id}.title`, section.title]);
    section.items.forEach((item, i) => {
      out.push([`${lang}.${section.id}[${i}].q`, item.q]);
      out.push([`${lang}.${section.id}[${i}].a`, item.a]);
    });
  });
  return out;
}

test("guide content exposes exactly the supported languages", () => {
  assert.deepEqual(Object.keys(guideContent).sort(), [...LANGS].sort());
});

test("sections match GUIDE_SECTION_IDS in the same order for both languages", () => {
  for (const lang of LANGS) {
    const ids = guideContent[lang].sections.map((s) => s.id);
    assert.deepEqual(ids, GUIDE_SECTION_IDS, `${lang} 섹션 구성이 다름`);
  }
});

test("each section has the same item count across languages", () => {
  for (const id of GUIDE_SECTION_IDS) {
    const counts = LANGS.map((lang) => {
      const section = guideContent[lang].sections.find((s) => s.id === id);
      return section.items.length;
    });
    assert.equal(counts[0], counts[1], `${id} 섹션 항목 수가 다름 (ko ${counts[0]} / en ${counts[1]})`);
  }
});

test("usage steps line up across languages", () => {
  const [ko, en] = LANGS.map((lang) => guideContent[lang].steps);
  assert.equal(ko.length, en.length);
  // 번호는 렌더링 key로도 쓰이므로 양쪽이 같아야 한다.
  assert.deepEqual(ko.map((s) => s.step), en.map((s) => s.step));
});

test("first guide step matches the direct card selection on home", () => {
  const [ko, en] = LANGS.map((lang) => guideContent[lang].steps[0].desc);
  assert.match(ko, /카드 형식.*18홀\/9홀\/3홀\/1홀/);
  assert.doesNotMatch(ko, /직접 만들기/);
  assert.match(en, /card format.*18\/9\/3\/1 hole/i);
  assert.doesNotMatch(en, /select ['"]?custom/i);
});

test("no guide string is empty", () => {
  for (const lang of LANGS) {
    for (const [path, value] of everyString(lang)) {
      assert.equal(typeof value, "string", `${path} 는 문자열이어야 함`);
      assert.notEqual(value.trim(), "", `${path} 값이 비어 있음`);
    }
  }
});

test("english guide strings carry no Hangul", () => {
  const hangul = /[ㄱ-ㆎ가-힣]/;
  const leaked = everyString("en").filter(([, value]) => hangul.test(value)).map(([path]) => path);
  assert.deepEqual(leaked, [], `영문 가이드에 한글이 남아 있음: ${leaked.join(", ")}`);
});

test("korean guide questions are unique so they stay usable as render keys", () => {
  for (const lang of LANGS) {
    for (const section of guideContent[lang].sections) {
      const qs = section.items.map((item) => item.q);
      assert.equal(new Set(qs).size, qs.length, `${lang}.${section.id} 에 중복 질문이 있음`);
    }
  }
});

test("guideFor falls back to Korean for unsupported languages", () => {
  assert.equal(guideFor("ko"), guideContent.ko);
  assert.equal(guideFor("en"), guideContent.en);
  assert.equal(guideFor("ja"), guideContent.ko);
  assert.equal(guideFor(undefined), guideContent.ko);
});
