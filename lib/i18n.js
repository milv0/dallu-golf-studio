"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionary } from "./i18nDictionary";
import { DEFAULT_LANG, withLang } from "./langRoutes";

const STORAGE_KEY = "sc-lang";

export { dictionary };

export const LangContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
  href: (path) => path,
});

// routeLang이 주어지면 URL이 언어를 결정한다 — 저장값이 URL을 덮어쓰면 /en 페이지가
// 한국어로 렌더링되고, 정적 HTML(영어)과 화면(한국어)이 어긋난다.
export function LangProvider({ children, lang: routeLang }) {
  const [lang, setLangState] = useState(routeLang || DEFAULT_LANG);

  useEffect(() => {
    if (routeLang) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "ko") setLangState(stored);
    } catch {}
  }, [routeLang]);

  // <html lang>을 실제 언어와 동기화 (스크린리더 발음/번역 힌트)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    const value = next === "en" ? "en" : "ko";
    setLangState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {}
  }, []);

  const t = useCallback(
    (key, params) => {
      const dict = dictionary[lang] || dictionary[DEFAULT_LANG];
      let str = dict[key] ?? dictionary[DEFAULT_LANG][key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`\${${k}}`, String(v));
        }
      }
      return str;
    },
    [lang]
  );

  // 내부 링크가 현재 언어 트리를 벗어나지 않게 한다. /en에서 href="/guide"를 쓰면
  // 한국어 페이지로 튕긴다.
  const href = useCallback((path) => withLang(path, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, href }), [lang, setLang, t, href]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
