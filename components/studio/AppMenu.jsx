"use client";

// Capacitor 앱 전용 상단 메뉴. 웹은 헤더에 컨트롤을 펼쳐 두지만(발견성·SEO),
// 앱은 3줄 버거 하나로 수납해 헤더를 브랜드 중심으로 비운다.
// 로그인은 공개 배포에서 비활성 기능이라 앱 메뉴에는 아예 싣지 않는다.
import { useRef } from "react";
import Link from "next/link";
import { Check, CircleHelp, Globe, Menu, Moon, Sun, X } from "lucide-react";
import { useLang } from "../../lib/i18n";
import { useTheme } from "../../lib/themeContext";
import { LANGS } from "../../lib/langRoutes";

// 언어 이름은 번역하지 않는다 — 영어 UI에 갇힌 한국어 사용자가 "Korean"보다
// "한국어"를 찾기 쉽다. 언어 선택기의 표준 관례라 사전을 거치지 않는다.
const LANGUAGE_NAMES = { ko: "한국어", en: "English" };

const ITEM_CLASS =
  "flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-[14px] font-semibold text-txt transition hover:bg-panel-2 active:bg-panel-2";

export default function AppMenu() {
  const { lang, setLang, t, href } = useLang();
  const { theme, toggleTheme } = useTheme();
  const dialogRef = useRef(null);

  const close = () => dialogRef.current?.close();
  const themeLabel = theme === "dark" ? t("theme.toLight") : t("theme.toDark");

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()}
        aria-label={t("a11y.appMenu")}
        className="flex size-8 items-center justify-center rounded-full border border-line bg-panel text-txt-soft transition hover:border-accent hover:text-txt active:scale-95">
        <Menu aria-hidden="true" size={18} strokeWidth={2.2} />
      </button>

      <dialog ref={dialogRef} aria-label={t("a11y.appMenu")}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="fixed left-[50vw] top-[50dvh] m-0 h-fit max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] border border-line bg-panel p-0 text-txt shadow-2xl backdrop:bg-bg/80 backdrop:backdrop-blur-sm">
        <div className="p-3">
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="font-head text-[13px] font-bold uppercase tracking-[0.15em] text-accent">Dallu Golf</span>
            <form method="dialog">
              <button type="submit" aria-label={t("home.close")}
                className="flex size-9 items-center justify-center rounded-full text-txt-soft transition hover:bg-panel-2 hover:text-txt">
                <X aria-hidden="true" size={18} />
              </button>
            </form>
          </div>

          <nav className="mt-2 flex flex-col gap-1">
            <Link href={href("/guide")} onClick={close} className={ITEM_CLASS}>
              <CircleHelp aria-hidden="true" size={19} strokeWidth={2} className="text-accent" />
              {t("home.guideLink")}
            </Link>
            <button type="button" onClick={() => { toggleTheme(); close(); }} className={ITEM_CLASS}>
              {theme === "dark"
                ? <Sun aria-hidden="true" size={19} strokeWidth={2.2} className="text-accent" />
                : <Moon aria-hidden="true" size={19} strokeWidth={2.2} className="text-accent" />}
              {themeLabel}
            </button>
            <div className="px-4 py-2">
              <div className="flex items-center gap-3 text-[14px] font-semibold text-txt">
                <Globe aria-hidden="true" size={19} strokeWidth={2.2} className="text-accent" />
                {t("menu.language")}
              </div>
              <div className="mt-2.5 flex gap-2" role="group" aria-label={t("menu.language")}>
                {LANGS.map((code) => (
                  <button key={code} type="button" aria-pressed={lang === code}
                    onClick={() => { setLang(code); close(); }}
                    className={"flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border text-[14px] font-semibold transition " +
                      (lang === code
                        ? "border-accent bg-accent/10 text-txt"
                        : "border-line bg-panel text-txt-soft hover:border-accent hover:text-txt")}>
                    {lang === code && <Check aria-hidden="true" size={15} strokeWidth={2.5} className="text-accent" />}
                    {LANGUAGE_NAMES[code]}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}
