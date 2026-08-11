"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ClipboardList, Share2, X } from "lucide-react";
import { isStandaloneApp } from "../../lib/standaloneDisplayMode.js";
import { isNativeApp } from "../../lib/nativePlatform.js";
import { AppHeader, CUSTOM_LINKS } from "./StudioNav";
import { useLang } from "../../lib/i18n";
import { FEATURE_FLAGS } from "../../lib/features.js";

// 홈의 선택지는 실제 작업 라우트에서 파생한다. 별도 목록을 두면 탭을 추가할 때 홈만 빠질 수 있다.
const CARD_TYPES = CUSTOM_LINKS.map(({ href: path }) => {
  const slug = path.split("/").pop();
  return {
    path,
    holes: slug.replace("Hole", ""),
    labelKey: `home.type${slug}`,
  };
});

export default function HomeHub() {
  const { t, href } = useLang();
  const installDialogRef = useRef(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const displayMode = window.matchMedia?.("(display-mode: standalone)");
    const syncStandalone = () => {
      setStandalone(isStandaloneApp({
        displayModeStandalone: displayMode?.matches,
        navigatorStandalone: window.navigator.standalone,
        capacitorNative: isNativeApp(),
      }));
    };
    syncStandalone();
    displayMode?.addEventListener?.("change", syncStandalone);
    return () => displayMode?.removeEventListener?.("change", syncStandalone);
  }, []);

  return (
    <>
      <AppHeader />
      <main className="mobile-home-main flex min-h-[calc(100dvh-49px)] flex-col px-4 md:px-6">
        <div className="mx-auto w-full max-w-[520px] flex-1 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-9">
        <section aria-labelledby="home-create-title">
          <p className="font-head text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            {t("home.title")}
          </p>
          <h1 id="home-create-title" className="mt-2 font-head text-[30px] font-bold leading-tight text-txt">
            {t("home.createTitle")}
          </h1>
          <p className="mt-1.5 text-[13px] text-txt-soft">{t("home.createHint")}</p>

          {/* 앱 아이콘처럼 같은 크기의 선택지만 보여준다. 반복되는 설명과 시작하기 문구는 제거한다. */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {CARD_TYPES.map((type) => (
              <Link key={type.path} href={href(type.path)} aria-label={t(type.labelKey)}
                className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-[22px] border border-line bg-panel transition duration-200 hover:border-accent/60 hover:bg-panel-2 active:scale-[0.97]">
                <div className="font-head text-[58px] font-bold leading-none text-txt sm:text-[64px]">
                  {type.holes}
                  <span className="ml-1 text-[22px] font-semibold text-accent sm:text-[24px]">
                    {t("home.holesUnit")}
                  </span>
                </div>
                <ChevronRight aria-hidden="true" size={17}
                  className="absolute bottom-4 right-4 text-txt-faint transition group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </section>

        {/* 공개 전에도 기능의 존재는 알리되, 핵심 제작 선택지와 같은 위계로 보이지 않게 한 줄로 둔다. */}
        {FEATURE_FLAGS.myRound ? (
          <Link href={href("/round")}
            className="group mt-3 flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-panel px-4 transition hover:border-accent/60 hover:bg-panel-2 active:scale-[0.98]">
            <ClipboardList aria-hidden="true" size={20} strokeWidth={1.8} className="shrink-0 text-accent" />
            <span className="font-head text-[14px] font-bold text-txt">{t("home.roundTitle")}</span>
            <ChevronRight aria-hidden="true" size={16}
              className="ml-auto text-txt-faint transition group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ) : (
          <div aria-disabled="true"
            className="mt-3 flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-panel px-4 text-txt-faint">
            <ClipboardList aria-hidden="true" size={20} strokeWidth={1.8} className="shrink-0" />
            <span className="font-head text-[14px] font-bold">{t("home.roundTitle")}</span>
            <span className="ml-auto rounded-full bg-panel-2 px-2.5 py-1 font-head text-[10px] font-semibold uppercase tracking-wider">
              {t("home.preparing")}
            </span>
          </div>
        )}

        {/* iPhone 16의 짧은 실제 Safari 뷰포트에서도 핵심 UI가 잘리지 않도록
            설치 안내는 48px 버튼 하나만 두고, 절차는 화면 중앙 모달에서 연다. Q&A는 상단바에 있다. */}
        {!standalone && (
          <button type="button" onClick={() => installDialogRef.current?.showModal()}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-panel px-3 text-[12px] font-semibold text-txt transition hover:border-accent/60 hover:bg-panel-2 active:scale-[0.98] md:hidden">
            <Share2 aria-hidden="true" size={17} strokeWidth={1.8} className="shrink-0 text-accent" />
            {t("home.addToHome")}
          </button>
        )}
      </div>

      <dialog ref={installDialogRef}
        aria-labelledby="install-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="fixed left-[50vw] top-[50dvh] m-0 h-fit max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] border border-line bg-panel p-0 text-txt shadow-2xl backdrop:bg-bg/80 backdrop:backdrop-blur-sm">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-panel-2 text-accent">
              <Share2 aria-hidden="true" size={19} strokeWidth={1.8} />
            </div>
            <h2 id="install-dialog-title" className="font-head text-[17px] font-bold">
              {t("home.addToHome")}
            </h2>
            <form method="dialog" className="ml-auto">
              <button type="submit" aria-label={t("home.close")}
                className="flex size-9 items-center justify-center rounded-full text-txt-soft transition hover:bg-panel-2 hover:text-txt">
                <X aria-hidden="true" size={18} />
              </button>
            </form>
          </div>
          <p className="mt-4 rounded-xl bg-panel-2 px-4 py-3 text-[13px] leading-relaxed text-txt-soft">
            {t("home.installSteps")}
          </p>
        </div>
      </dialog>
      </main>
    </>
  );
}
