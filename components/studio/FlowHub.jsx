"use client";

import { useEffect, useState } from "react";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import { MobileTabBar } from "./StudioNav";

const FLOW_CONFIG = {
  custom: {
    eyebrow: "Direct Builder",
    title: "직접 만들기",
    notice: "라운드 저장과 분리된 직접 입력 작업입니다. 18홀, 9홀, 3홀, 1홀은 같은 커스텀 정보를 공유합니다.",
    source: "custom",
  },
  round: {
    eyebrow: "Round Source",
    title: "내 라운드 기록",
    notice: "18홀 라운드 정보를 기준으로 18홀, 9홀, 3홀, 1홀 출력물을 연동합니다.",
    source: "round",
  },
};

export default function FlowHub({ flow = "custom" }) {
  const config = FLOW_CONFIG[flow] || FLOW_CONFIG.custom;
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);

  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  return (
    <>
      <main className="mx-auto hidden max-w-[980px] px-6 py-10 md:block">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="font-head text-[13px] font-semibold uppercase leading-tight tracking-[0.28em] text-accent">
              {config.eyebrow} · @dallu_golf
            </div>
            <a href="/" className="mt-1 block font-head text-[44px] font-bold uppercase leading-none text-txt transition hover:text-accent">
              {config.title}
            </a>
          </div>
          {currentUser ? (
            <button type="button" onClick={logout}
              className="rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-soft transition hover:text-txt">
              로그아웃
            </button>
          ) : (
            <button type="button" disabled
              className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
              로그인 준비 중
            </button>
          )}
        </div>
        <FlowNotice text={config.notice} />
      </main>

      <main className="mobile-home-main mx-auto max-w-[520px] px-4 pt-[calc(env(safe-area-inset-top)+1rem)] md:hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <a href="/" className="min-w-0 text-left transition active:scale-[0.98] active:opacity-80">
            <div className="font-head text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              @Dallu_Golf
            </div>
            <h1 className="truncate font-head text-[34px] font-bold uppercase leading-none text-txt">
              {config.title}
            </h1>
          </a>
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
        <MobileTabBar sourceMode={config.source} />
        <FlowNotice text={config.notice} />
      </main>
    </>
  );
}

function FlowNotice({ text }) {
  return (
    <div className="mb-4 rounded-xl border border-line bg-panel px-4 py-3 text-sm font-semibold leading-relaxed text-txt-soft">
      {text}
    </div>
  );
}
