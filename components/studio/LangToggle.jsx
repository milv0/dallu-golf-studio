"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "../../lib/i18n";
import { swapLangPath } from "../../lib/langRoutes";

const BASE_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-[11px] font-bold text-txt-soft transition active:border-accent active:text-txt";

export default function LangToggle({ className }) {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname() || "/";
  const target = swapLangPath(pathname);
  const nextLang = lang === "ko" ? "en" : "ko";
  const label = lang === "ko" ? "EN" : "KO";
  const cls = className || BASE_CLASS;

  // 영어 URL이 없는 라우트(관리자·플래그로 닫힌 화면)에서는 이동할 곳이 없으므로
  // 예전처럼 클라이언트 상태만 바꾼다.
  if (target === pathname) {
    return (
      <button type="button" onClick={() => setLang(nextLang)} aria-label={t("a11y.langToggle")} className={cls}>
        {label}
      </button>
    );
  }

  // <a>로 두면 크롤러가 반대 언어 페이지를 링크로 따라간다 — 상태 토글로는 발견되지 않는다.
  return (
    <Link href={target} hrefLang={nextLang} aria-label={t("a11y.langToggle")}
      onClick={() => setLang(nextLang)} className={cls}>
      {label}
    </Link>
  );
}
