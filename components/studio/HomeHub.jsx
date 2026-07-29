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
  const refreshPage = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  const cards = [
    { href: "/rounds", title: "내 라운드 기록", meta: "라운드 기반" },
    { href: "/custom", title: "직접 만들기", meta: "수동 입력" },
  ];

  return (
    <main className="mobile-home-main mx-auto max-w-[520px] px-4 pt-[calc(env(safe-area-inset-top)+1rem)] md:max-w-[980px] md:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button type="button" onClick={refreshPage} aria-label="새로고침"
          className="min-w-0 text-left transition active:scale-[0.98] active:opacity-80">
          <div className="font-head text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            @Dallu_Golf
          </div>
          <h1 className="truncate font-head text-[34px] font-bold uppercase leading-none text-txt md:text-[44px]">
            Studio
          </h1>
        </button>
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
  );
}

function FeatureNotice() {
  return (
    <div className="mb-4 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-semibold leading-relaxed text-txt-soft">
      로그인, 코스 DB, 내 라운드 정보 저장 등의 기능은 준비 중입니다.
    </div>
  );
}

function CardGrid({ cards }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {cards.map((item) => (
        <a key={item.href} href={item.href}
          className="rounded-xl border border-line bg-panel p-5 transition hover:border-accent hover:bg-panel-2 active:border-accent active:bg-panel-2">
          <div className="font-head text-[42px] font-bold uppercase leading-none text-txt">
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
