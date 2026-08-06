// URL이 언어를 결정한다 — `/경로`는 한국어, `/en/경로`는 영어.
// 언어를 localStorage로만 바꾸면 ko/en이 같은 URL을 공유해 검색엔진이 영어 페이지를
// 색인할 방법이 없다. 그래서 공개 라우트는 언어별 URL을 따로 내보낸다.
// JSX 없는 순수 모듈이라 tests/langRoutes.test.mjs가 직접 import한다.

export const EN_PREFIX = "/en";
export const DEFAULT_LANG = "ko";
export const LANGS = ["ko", "en"];

// 영어 URL을 함께 내보내는 라우트. 여기 없는 경로는 한국어 전용이다
// (myRound 플래그로 닫힌 라우트와 관리자 화면은 색인 대상이 아니다).
export const MIRRORED_ROUTES = [
  "/",
  "/guide",
  "/custom/Hole18",
  "/custom/Hole9",
  "/custom/Hole3",
  "/custom/Hole1",
];

// 뒤쪽 슬래시를 떼어 "/guide"와 "/guide/"를 같은 경로로 취급한다.
function normalize(path) {
  if (typeof path !== "string" || path === "") return "/";
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function langFromPath(pathname) {
  const p = normalize(pathname);
  return p === EN_PREFIX || p.startsWith(`${EN_PREFIX}/`) ? "en" : "ko";
}

// /en 접두어를 떼어 한국어 기준 경로로 되돌린다. 모든 비교의 기준이 되는 형태다.
export function basePath(pathname) {
  const p = normalize(pathname);
  if (p === EN_PREFIX) return "/";
  if (p.startsWith(`${EN_PREFIX}/`)) return p.slice(EN_PREFIX.length);
  return p;
}

export function isMirrored(pathname) {
  return MIRRORED_ROUTES.includes(basePath(pathname));
}

// 언어 트리 안에서 내부 링크를 만든다. 미러가 없는 경로는 한국어 트리로 떨어뜨린다 —
// 존재하지 않는 /en/records 같은 링크를 만들면 404가 된다.
export function withLang(path, lang) {
  const base = basePath(path);
  if (lang !== "en" || !MIRRORED_ROUTES.includes(base)) return base;
  return base === "/" ? EN_PREFIX : `${EN_PREFIX}${base}`;
}

// 언어 토글이 이동할 경로. 미러가 없는 라우트에서는 같은 경로를 돌려주고,
// 그때는 호출한 쪽이 이동 대신 클라이언트 상태만 바꾼다.
export function swapLangPath(pathname) {
  const target = langFromPath(pathname) === "en" ? "ko" : "en";
  return withLang(pathname, target);
}

// hreflang용 절대 URL 묶음. 양쪽 URL이 서로를 가리켜야 구글이 같은 문서의
// 언어 변형으로 인식한다.
export function alternateUrls(base, path) {
  const p = basePath(path);
  if (!MIRRORED_ROUTES.includes(p)) return null;
  const koPath = p === "/" ? "" : p;
  const enPath = p === "/" ? EN_PREFIX : `${EN_PREFIX}${p}`;
  return {
    ko: `${base}${koPath}`,
    en: `${base}${enPath}`,
    // 언어가 안 맞을 때 구글이 기본으로 보여줄 버전
    "x-default": `${base}${koPath}`,
  };
}
