"use client";

import { useLang } from "../../lib/i18n";

export default function LangToggle({ className }) {
  const { lang, setLang } = useLang();
  const toggle = () => setLang(lang === "ko" ? "en" : "ko");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lang === "ko" ? "Switch to English" : "한국어로 전환"}
      className={className || "flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-[11px] font-bold text-txt-soft transition active:border-accent active:text-txt"}
    >
      {lang === "ko" ? "EN" : "KO"}
    </button>
  );
}
