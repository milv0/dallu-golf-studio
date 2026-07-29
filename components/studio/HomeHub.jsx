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
  ];

  return (
    <main className="mx-auto max-w-[980px] px-5 py-7 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-line pb-5 sm:mb-8 sm:flex-row sm:items-end sm:pb-6">
        <div>
          <div className="font-head text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-accent sm:text-[13px] sm:tracking-[0.28em]">
            Broadcast Overlay Maker · @dallu_golf
          </div>
          <a href="/" className="mt-1 block font-head text-[34px] font-bold uppercase leading-none text-txt transition hover:text-accent sm:text-[44px]">
            Dallu Golf <span className="text-accent">Studio</span>
          </a>
        </div>
        {currentUser ? (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <button type="button" disabled
              className="cursor-not-allowed rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-faint opacity-70 sm:px-3.5 sm:py-2 sm:text-sm">
              내 라운딩 준비 중
            </button>
            <button type="button" onClick={logout}
              className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:text-txt sm:px-3.5 sm:py-2 sm:text-sm">
              로그아웃
            </button>
          </div>
        ) : (
          <button type="button" disabled
            className="cursor-not-allowed rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-faint opacity-70 sm:px-3.5 sm:py-2 sm:text-sm">
            로그인 준비 중
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((item) => (
          <a key={item.href} href={item.href}
            className="rounded-xl border border-line bg-panel p-5 transition hover:border-accent hover:bg-panel-2">
            <div className="font-head text-[30px] font-bold uppercase leading-none text-txt sm:text-[34px]">{item.title}</div>
            <div className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
              {item.meta}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
