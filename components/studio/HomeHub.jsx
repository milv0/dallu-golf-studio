"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Share2 } from "lucide-react";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import { CUSTOM_LINKS, TopActions } from "./StudioNav";
import { useLang } from "../../lib/i18n";
import { FEATURE_FLAGS } from "../../lib/features.js";

// 홈의 메인 그리드는 카드 종류(18/9/3/1홀) 자체다. 목록은 CUSTOM_LINKS에서 파생시킨다 —
// 라우트 목록을 두 곳에 두면 한쪽만 늘어나 링크가 빠진 채로 남는다.
// 사전 키는 경로 끝(Hole18…)에서 만든다.
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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);

  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  return (
    <main className="mobile-home-main flex min-h-[100dvh] flex-col px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6">
      <header className="mx-auto flex w-full max-w-[520px] items-center justify-between py-3 md:max-w-[980px]">
        <div className="font-head text-[13px] font-bold uppercase tracking-[0.15em] text-accent">
          Dallu Golf
        </div>
        <TopActions currentUser={currentUser} onLogout={logout} />
      </header>

      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center pb-[env(safe-area-inset-bottom)] md:max-w-[980px]">
        {/* 큰 로고 타이포는 브랜드 표시일 뿐 페이지 주제가 아니다 — h1은 아래 문구가 갖는다.
            "Golf Studio"를 h1으로 두면 검색엔진이 읽는 제목에 키워드가 하나도 없다.
            Tailwind preflight가 heading의 크기·굵기를 초기화하므로 보이는 모양은 그대로다. */}
        <div className="mb-10 text-center">
          <p className="font-head text-[48px] font-bold uppercase leading-none text-txt md:text-[64px]">
            Golf Studio
          </p>
          <h1 className="mt-3 text-sm text-txt-soft">{t("home.subtitle")}</h1>
        </div>

        {/* 만들 수 있는 카드 4종이 곧 홈이다. 중간 허브("직접 만들기")를 거치지 않고
            바로 원하는 카드로 들어간다 — 설명과 목적지가 한 곳에 있어 겹치는 안내가 필요 없다. */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {CARD_TYPES.map((type) => (
            <Link key={type.path} href={href(type.path)} aria-label={t(type.labelKey)}
              className="group relative flex aspect-square flex-col overflow-hidden rounded-2xl border border-line border-t-[3px] border-t-[#2bb673] bg-panel p-5 transition hover:border-accent/60 hover:shadow-[0_0_30px_-8px_rgba(56,224,139,0.15)] active:scale-[0.98] md:p-7">
              {/* 시각 제목은 "18홀"이면 충분하다. 전체 이름("18홀 스코어카드")은 aria-label이 갖는다.
                  숫자는 남는 세로 공간의 가운데, 시작하기는 바닥에 붙인다. */}
              <div className="flex flex-1 items-center justify-center font-head text-[64px] font-bold leading-none text-txt md:text-[72px]">
                {type.holes}
                <span className="ml-1 text-[26px] text-accent md:text-[30px]">{t("home.holesUnit")}</span>
              </div>
              <div className="inline-flex items-center justify-center gap-1 font-head text-[11px] font-semibold uppercase tracking-wider text-accent transition group-hover:gap-2">
                {t("home.start")}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* 내 라운드 기록은 플래그가 꺼진 동안에도 카드로 보여준다 —
            한 줄 텍스트로는 이런 기능이 있다는 것 자체가 안 보인다.
            4종 그리드와 구분되도록 전체 폭의 가로형 카드로 둔다. */}
        {FEATURE_FLAGS.myRound ? (
          <Link href={href("/round")}
            className="group mt-3 flex items-center gap-4 overflow-hidden rounded-2xl border border-line border-t-[3px] border-t-accent bg-panel p-5 transition hover:border-accent/60 hover:shadow-[0_0_30px_-8px_rgba(56,224,139,0.15)] active:scale-[0.98] md:mt-4 md:p-6">
            <ClipboardList size={24} strokeWidth={1.8} className="shrink-0 text-accent" />
            <div className="min-w-0 font-head text-[16px] font-bold leading-tight text-txt md:text-[18px]">
              {t("home.roundTitle")}
            </div>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-head text-[11px] font-semibold uppercase tracking-wider text-accent transition group-hover:gap-2">
              {t("home.start")}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ) : (
          <div aria-disabled="true"
            className="mt-3 flex cursor-not-allowed items-center gap-4 overflow-hidden rounded-2xl border border-line border-t-[3px] border-t-accent bg-panel p-5 opacity-60 md:mt-4 md:p-6">
            <ClipboardList size={24} strokeWidth={1.8} className="shrink-0 text-txt-faint" />
            <div className="min-w-0 font-head text-[16px] font-bold leading-tight text-txt md:text-[18px]">
              {t("home.roundTitle")}
            </div>
            <span className="ml-auto shrink-0 font-head text-[11px] font-semibold uppercase tracking-wider text-txt-faint">
              {t("home.preparing")}
            </span>
          </div>
        )}

        {/* Chrome/Safari 경로가 동일하므로 한 줄로 합친다. 좁은 화면에서 줄바꿈되도
            중앙 정렬이 흐트러지지 않게 flex 대신 블록 + text-center를 쓴다. */}
        <div className="mx-auto mt-5 w-full max-w-[380px] border-y border-line px-3 py-3 md:hidden">
          <div className="flex items-center justify-center gap-1.5">
            <Share2 aria-hidden="true" size={14} className="shrink-0 text-accent" />
            <span className="font-head text-[12px] font-semibold text-txt">{t("home.addToHome")}</span>
          </div>
          <div className="mt-1 text-balance text-center text-[11px] leading-relaxed text-txt-soft">
            {t("home.installSteps")}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href={href("/guide")} className="text-[12px] font-semibold text-txt-faint underline transition hover:text-accent">
            {t("home.guideLink")}
          </Link>
        </div>

        <p className="mt-4 text-center text-[11px] text-txt-faint">
          {t("home.footer")}
        </p>
      </div>

      {/* 첫 화면 아래에 두는 안내 본문. 크롤러가 이 사이트의 주제를 판단할 유일한 문단이라
          지우지 않는다. 카드 목록·링크는 위 메인 그리드가 가지므로 여기는 문단 하나만 남긴다. */}
      <section className="mx-auto w-full max-w-[520px] border-t border-line py-8 text-center">
        <h2 className="font-head text-[13px] font-bold uppercase tracking-[0.1em] text-txt-soft">
          {t("home.aboutTitle")}
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-txt-faint">{t("home.aboutBody")}</p>
      </section>
    </main>
  );
}
