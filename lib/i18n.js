"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { dictionary } from "./i18nDictionary";

const STORAGE_KEY = "sc-lang";
const DEFAULT_LANG = "ko";

export { dictionary };

export const LangContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "ko") {
        setLangState(stored);
      }
    } catch {}
  }, []);

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

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
