// 첫 화면의 언어 결정 규칙. 웹은 URL이 언어를 소유하지만(SEO),
// Capacitor 앱은 항상 한국어 트리(index.html)에서 시작하므로
// 사용자가 저장한 언어(sc-lang)가 URL보다 우선해야 재시작 후에도 선택이 유지된다.
// JSX 없는 순수 모듈 — tests/appLanguage.test.mjs가 직접 import한다.
import { DEFAULT_LANG } from "./langRoutes.js";

export function resolveInitialLang({ routeLang, storedLang, nativeApp = false } = {}) {
  const stored = storedLang === "en" || storedLang === "ko" ? storedLang : null;
  if (nativeApp && stored) return stored;
  if (routeLang) return routeLang;
  return stored || DEFAULT_LANG;
}
