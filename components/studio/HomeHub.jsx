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
    <main className="mx-auto max-w-[980px] px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="font-head text-[13px] font-semibold uppercase tracking-[0.28em] text-accent">
            Broadcast Overlay Maker · @dallu_golf
          </div>
          <a href="/" className="mt-1 block font-head text-[44px] font-bold uppercase leading-none text-txt transition hover:text-accent">
            Dallu Golf <span className="text-accent">Studio</span>
          </a>
        </div>
        {currentUser ? (
          <div className="flex items-center gap-2">
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

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((item) => (
          <a key={item.href} href={item.href}
            className="rounded-xl border border-line bg-panel p-5 transition hover:border-accent hover:bg-panel-2">
            <div className="font-head text-[34px] font-bold uppercase leading-none text-txt">{item.title}</div>
            <div className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
              {item.meta}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
