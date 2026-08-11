"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "../../lib/i18n";
import { swapLangPath } from "../../lib/langRoutes";
import { shouldNavigateForLanguage } from "../../lib/languageNavigation.js";
import { isNativeApp } from "../../lib/nativePlatform.js";

const BASE_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-[11px] font-bold text-txt-soft transition active:border-accent active:text-txt";

export default function LangToggle({ className }) {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname() || "/";
  const target = swapLangPath(pathname);
  const nextLang = lang === "ko" ? "en" : "ko";
  const label = lang === "ko" ? "EN" : "KO";
  const cls = className || BASE_CLASS;

  const [nativeApp, setNativeApp] = useState(false);

  // 첫 SSR/수화면은 웹과 동일하게 유지하고, 수화 뒤에만 Capacitor 여부를 확정한다.
  // 이렇게 해야 서버·클라이언트 마크업이 어긋나지 않는다.
  useEffect(() => {
    setNativeApp(isNativeApp());
  }, []);

  const shouldNavigate = shouldNavigateForLanguage({ nativeApp, target, pathname });

  // 앱은 정적 export 파일 경로로 이동하지 않는다. 언어 상태만 바꿔 같은 WebView에서 즉시 번역한다.
  if (!shouldNavigate) {
    return (
      <button type="button" onClick={() => setLang(nextLang)} aria-label={t("a11y.langToggle")} className={cls}>
        {label}
      </button>
    );
  }

  // 웹은 URL을 바꿔야 ko/en 양쪽 페이지가 검색·hreflang 대상이 된다.
  return (
    <Link href={target} hrefLang={nextLang} aria-label={t("a11y.langToggle")}
      onClick={() => setLang(nextLang)} className={cls}>
      {label}
    </Link>
  );
}
