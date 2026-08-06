import assert from "node:assert/strict";
import test from "node:test";
import { MIRRORED_ROUTES } from "../lib/langRoutes.js";
import { guideContent } from "../lib/guideContent.js";
import sitemap from "../app/sitemap.js";
import {
  faqJsonLd,
  PAGE_SEO,
  pageMetadata,
  seoFor,
  SITE_URL,
  webAppJsonLd,
} from "../lib/seo.js";

const LANGS = ["ko", "en"];

test("every mirrored route has SEO copy in both languages", () => {
  // 빠진 라우트는 title이 사이트 기본값으로 떨어져 중복 title이 된다.
  assert.deepEqual(Object.keys(PAGE_SEO).sort(), [...MIRRORED_ROUTES].sort());
  for (const route of MIRRORED_ROUTES) {
    for (const lang of LANGS) {
      const copy = PAGE_SEO[route][lang];
      assert.ok(copy, `${route}.${lang} 누락`);
      assert.notEqual(copy.title.trim(), "", `${route}.${lang}.title 비어 있음`);
      assert.notEqual(copy.description.trim(), "", `${route}.${lang}.description 비어 있음`);
    }
  }
});

test("titles are unique per language so pages do not compete with each other", () => {
  for (const lang of LANGS) {
    const titles = MIRRORED_ROUTES.map((r) => PAGE_SEO[r][lang].title);
    assert.equal(new Set(titles).size, titles.length, `${lang} title 중복`);
  }
});

test("english SEO copy carries no Hangul", () => {
  const hangul = /[ㄱ-ㆎ가-힣]/;
  const leaked = [];
  for (const route of MIRRORED_ROUTES) {
    const { title, description } = PAGE_SEO[route].en;
    if (hangul.test(title)) leaked.push(`${route}.title`);
    if (hangul.test(description)) leaked.push(`${route}.description`);
  }
  assert.deepEqual(leaked, [], `영문 메타데이터에 한글이 남아 있음: ${leaked.join(", ")}`);
});

test("descriptions stay inside the length search engines display", () => {
  // 160자를 넘으면 잘린다. 너무 짧으면 설명이 무시되고 본문에서 임의로 발췌된다.
  for (const route of MIRRORED_ROUTES) {
    for (const lang of LANGS) {
      const { description } = PAGE_SEO[route][lang];
      assert.ok(description.length >= 50, `${route}.${lang} description이 너무 짧음 (${description.length})`);
      assert.ok(description.length <= 160, `${route}.${lang} description이 너무 김 (${description.length})`);
    }
  }
});

test("canonical points at the page's own language URL", () => {
  assert.equal(pageMetadata("/", "ko").alternates.canonical, SITE_URL);
  assert.equal(pageMetadata("/", "en").alternates.canonical, `${SITE_URL}/en`);
  assert.equal(pageMetadata("/guide", "ko").alternates.canonical, `${SITE_URL}/guide`);
  assert.equal(pageMetadata("/guide", "en").alternates.canonical, `${SITE_URL}/en/guide`);
});

test("both languages of a page advertise the same hreflang pair", () => {
  // 한쪽만 상대를 가리키면 구글이 언어 변형으로 묶지 않는다.
  for (const route of MIRRORED_ROUTES) {
    const ko = pageMetadata(route, "ko").alternates.languages;
    const en = pageMetadata(route, "en").alternates.languages;
    assert.deepEqual(ko, en, route);
    assert.equal(ko["x-default"], ko.ko, `${route} x-default는 한국어여야 함`);
  }
});

test("pageMetadata is empty for routes with no english version", () => {
  // 존재하지 않는 hreflang을 내보내는 대신 아무것도 넣지 않는다.
  assert.deepEqual(pageMetadata("/records", "ko"), {});
  assert.deepEqual(pageMetadata("/admin", "ko"), {});
  assert.equal(seoFor("/records", "ko"), null);
});

test("seoFor falls back to Korean for unsupported languages", () => {
  assert.equal(seoFor("/", "ja").title, PAGE_SEO["/"].ko.title);
});

test("webAppJsonLd describes the tool in the requested language", () => {
  const en = webAppJsonLd("en");
  assert.equal(en["@type"], "WebApplication");
  assert.equal(en.url, `${SITE_URL}/en`);
  assert.equal(en.inLanguage, "en");
  assert.equal(webAppJsonLd("ko").url, SITE_URL);
});

test("faqJsonLd carries every guide question", () => {
  for (const lang of LANGS) {
    const guide = guideContent[lang];
    const expected = guide.sections.reduce((n, s) => n + s.items.length, 0);
    const ld = faqJsonLd(guide);
    assert.equal(ld["@type"], "FAQPage");
    assert.equal(ld.mainEntity.length, expected, lang);
    for (const entry of ld.mainEntity) {
      assert.notEqual(entry.name.trim(), "");
      assert.notEqual(entry.acceptedAnswer.text.trim(), "");
    }
  }
});

test("sitemap covers both language trees with hreflang", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);
  assert.equal(urls.length, new Set(urls).size, "중복 URL");
  assert.equal(urls.length, MIRRORED_ROUTES.length * 2, "ko/en 양쪽이 다 실려야 함");

  for (const route of MIRRORED_ROUTES) {
    const koPath = route === "/" ? "" : route;
    const enPath = route === "/" ? "/en" : `/en${route}`;
    assert.ok(urls.includes(`${SITE_URL}${koPath}`), `ko 누락: ${route}`);
    assert.ok(urls.includes(`${SITE_URL}${enPath}`), `en 누락: ${route}`);
  }

  for (const entry of entries) {
    const languages = entry.alternates?.languages;
    assert.ok(languages, `alternates 누락: ${entry.url}`);
    assert.equal(languages["x-default"], languages.ko);
    // 사이트맵에 실린 URL은 자기 자신을 hreflang 목록 안에서 찾을 수 있어야 한다.
    assert.ok(Object.values(languages).includes(entry.url), entry.url);
  }
});

test("sitemap omits flag-gated round routes", () => {
  for (const entry of sitemap()) {
    assert.ok(!entry.url.includes("/round"), entry.url);
  }
});

test("every page title carries the brand explicitly", () => {
  // title.template은 레이아웃과 같은 세그먼트의 페이지(홈)에 적용되지 않으므로
  // pageMetadata가 absolute로 직접 붙여야 한다.
  for (const route of MIRRORED_ROUTES) {
    for (const lang of LANGS) {
      const title = pageMetadata(route, lang).title;
      assert.equal(typeof title?.absolute, "string", `${route}.${lang}`);
      assert.ok(title.absolute.endsWith(" · Dallu Golf Studio"), `${route}.${lang}: ${title.absolute}`);
    }
  }
});
