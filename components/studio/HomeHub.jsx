"use client";

import { useEffect, useState } from "react";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";

export default function HomeHub() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);

  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  const cards = [
    { href: "/score-18", title: "18홀", meta: "수동 입력" },
    { href: "/score-9?source=custom", title: "9홀", meta: "수동 입력" },
    { href: "/score-3?source=custom", title: "3홀", meta: "수동 입력" },
    { href: "/hole", title: "1홀", meta: "수동 입력" },
  ];

  return (
    <>
      <main className="mx-auto hidden max-w-[980px] px-6 py-10 md:block">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="font-head text-[13px] font-semibold uppercase leading-tight tracking-[0.28em] text-accent">
              Broadcast Overlay Maker · @dallu_golf
            </div>
            <a href="/" className="mt-1 block font-head text-[44px] font-bold uppercase leading-none text-txt transition hover:text-accent">
              Dallu Golf <span className="text-accent">Studio</span>
            </a>
          </div>
          {currentUser ? (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled
                className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
                내 라운딩 준비 중
              </button>
              <button type="button" onClick={logout}
                className="rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-soft transition hover:text-txt">
                로그아웃
              </button>
            </div>
          ) : (
            <button type="button" disabled
              className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
              로그인 준비 중
            </button>
          )}
        </div>

        <FeatureNotice />
        <CardGrid cards={cards} desktop />
      </main>

      <main className="mx-auto min-h-dvh max-w-[520px] px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+1rem)] md:hidden">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-head text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              @Dallu Golf
            </div>
            <h1 className="truncate font-head text-[34px] font-bold uppercase leading-none text-txt">
              Studio
            </h1>
          </div>
          {currentUser ? (
            <button type="button" onClick={logout}
              className="shrink-0 rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-soft active:border-accent active:text-txt">
              로그아웃
            </button>
          ) : (
            <button type="button" disabled
              className="shrink-0 cursor-not-allowed rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-faint opacity-70">
              로그인 준비 중
            </button>
          )}
        </div>

        <FeatureNotice />
        <CardGrid cards={cards} />
      </main>
    </>
  );
}

function FeatureNotice() {
  return (
    <div className="mb-4 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-semibold leading-relaxed text-txt-soft">
      로그인, 코스 DB, 내 라운드 정보 저장 등의 기능은 준비 중입니다.
    </div>
  );
}

function CardGrid({ cards, desktop = false }) {
  return (
    <div className={desktop ? "grid gap-3 md:grid-cols-4" : "grid gap-3"}>
      {cards.map((item) => (
        <a key={item.href} href={item.href}
          className="rounded-xl border border-line bg-panel p-5 transition hover:border-accent hover:bg-panel-2 active:border-accent active:bg-panel-2">
          <div className={"font-head font-bold uppercase leading-none text-txt " + (desktop ? "text-[34px]" : "text-[42px]")}>
            {item.title}
          </div>
          <div className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
            {item.meta}
          </div>
        </a>
      ))}
    </div>
  );
}
