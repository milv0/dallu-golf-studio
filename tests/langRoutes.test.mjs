import assert from "node:assert/strict";
import test from "node:test";
import {
  alternateUrls,
  basePath,
  EN_PREFIX,
  isMirrored,
  langFromPath,
  MIRRORED_ROUTES,
  swapLangPath,
  withLang,
} from "../lib/langRoutes.js";

test("langFromPath reads the language off the URL", () => {
  assert.equal(langFromPath("/"), "ko");
  assert.equal(langFromPath("/guide"), "ko");
  assert.equal(langFromPath("/custom/Hole18"), "ko");
  assert.equal(langFromPath("/en"), "en");
  assert.equal(langFromPath("/en/"), "en");
  assert.equal(langFromPath("/en/guide"), "en");
  assert.equal(langFromPath("/en/custom/Hole1"), "en");
});

test("langFromPath does not mistake lookalike paths for the en tree", () => {
  // /english, /entry 같은 경로가 영어 트리로 잡히면 잘못된 사전이 로드된다.
  assert.equal(langFromPath("/english"), "ko");
  assert.equal(langFromPath("/entry"), "ko");
  assert.equal(langFromPath("/enroll/x"), "ko");
});

test("basePath strips the en prefix", () => {
  assert.equal(basePath("/en"), "/");
  assert.equal(basePath("/en/"), "/");
  assert.equal(basePath("/en/guide"), "/guide");
  assert.equal(basePath("/guide"), "/guide");
  assert.equal(basePath("/guide/"), "/guide");
  assert.equal(basePath(""), "/");
  assert.equal(basePath(undefined), "/");
});

test("withLang prefixes mirrored routes and leaves ko alone", () => {
  for (const route of MIRRORED_ROUTES) {
    assert.equal(withLang(route, "ko"), route);
    const expected = route === "/" ? EN_PREFIX : `${EN_PREFIX}${route}`;
    assert.equal(withLang(route, "en"), expected, route);
  }
});

test("withLang keeps unmirrored routes in the korean tree", () => {
  // /en/records 같은 링크를 만들면 존재하지 않는 페이지라 404가 된다.
  for (const route of ["/records", "/login", "/round", "/round/Hole9", "/rounds", "/admin"]) {
    assert.equal(withLang(route, "en"), route, route);
    assert.equal(withLang(route, "ko"), route, route);
  }
});

test("withLang is idempotent so links never gain a double prefix", () => {
  assert.equal(withLang("/en/guide", "en"), "/en/guide");
  assert.equal(withLang(withLang("/guide", "en"), "en"), "/en/guide");
  // 영어 경로를 한국어로 되돌릴 때도 접두어가 남지 않아야 한다.
  assert.equal(withLang("/en/guide", "ko"), "/guide");
});

test("swapLangPath moves between the two trees", () => {
  assert.equal(swapLangPath("/"), EN_PREFIX);
  assert.equal(swapLangPath("/guide"), "/en/guide");
  assert.equal(swapLangPath("/custom/Hole18"), "/en/custom/Hole18");
  assert.equal(swapLangPath("/en"), "/");
  assert.equal(swapLangPath("/en/guide"), "/guide");
  assert.equal(swapLangPath("/en/custom/Hole18"), "/custom/Hole18");
});

test("swapLangPath returns the same path when there is no counterpart", () => {
  // 호출한 쪽이 이걸 보고 이동 대신 상태만 바꾸도록 신호로 쓴다.
  for (const route of ["/records", "/login", "/round"]) {
    assert.equal(swapLangPath(route), route, route);
  }
});

test("isMirrored matches only the exported public routes", () => {
  assert.equal(isMirrored("/"), true);
  assert.equal(isMirrored("/en/guide"), true);
  assert.equal(isMirrored("/records"), false);
  assert.equal(isMirrored("/admin"), false);
});

test("alternateUrls points both languages at each other", () => {
  assert.deepEqual(alternateUrls("https://x.com", "/"), {
    ko: "https://x.com",
    en: "https://x.com/en",
    "x-default": "https://x.com",
  });
  assert.deepEqual(alternateUrls("https://x.com", "/guide"), {
    ko: "https://x.com/guide",
    en: "https://x.com/en/guide",
    "x-default": "https://x.com/guide",
  });
  // 영어 경로로 물어도 같은 쌍이 나와야 양쪽 페이지의 hreflang이 일치한다.
  assert.deepEqual(
    alternateUrls("https://x.com", "/en/guide"),
    alternateUrls("https://x.com", "/guide")
  );
});

test("alternateUrls returns null for routes with no english version", () => {
  assert.equal(alternateUrls("https://x.com", "/records"), null);
  assert.equal(alternateUrls("https://x.com", "/admin"), null);
});
