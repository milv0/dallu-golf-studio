"use client";

import { useLang } from "../../lib/i18n";

export default function LangToggle({ className }) {
  const { lang, setLang, t } = useLang();
  const toggle = () => setLang(lang === "ko" ? "en" : "ko");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("a11y.langToggle")}
      className={className || "flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-[11px] font-bold text-txt-soft transition active:border-accent active:text-txt"}
    >
      {lang === "ko" ? "EN" : "KO"}
    </button>
  );
}
