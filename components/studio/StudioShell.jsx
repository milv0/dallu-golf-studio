"use client";

import StudioNav, { MobileAppBar, MobileTabBar } from "./StudioNav";

function DesktopHeader({ currentUser, onLogout, theme, onToggleTheme }) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-line pb-5 md:flex-row md:items-end">
      <div>
        <div className="font-head text-[13px] font-semibold uppercase leading-tight tracking-[0.28em] text-accent">
          Broadcast Overlay Maker · @dallu_golf
        </div>
        <a href="/" className="mt-1 block font-head text-[40px] font-bold uppercase leading-none tracking-tight text-txt transition hover:text-accent">
          Dallu Golf <span className="text-accent">Studio</span>
        </a>
        <p className="mt-2 text-sm text-txt-soft">
          골프 영상 편집용 스코어카드 오버레이를 메이저 대회 방송 스타일로 제작 · 투명 PNG로 내보내기
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {currentUser ? (
          <div className="rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-txt-soft">
            <span className="text-txt">{currentUser.name || currentUser.email}</span>
            <button type="button" onClick={onLogout} className="ml-2 text-txt-faint transition hover:text-txt">
              로그아웃
            </button>
          </div>
        ) : (
          <button type="button" disabled
            className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
            로그인 준비 중
          </button>
        )}
        <button onClick={onToggleTheme} aria-label="테마 전환"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-soft transition hover:text-txt">
          <span>{theme === "dark" ? "라이트" : "다크"}</span>
        </button>
      </div>
    </div>
  );
}

function MobileUtilityBar({ currentUser, theme, onToggleTheme }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2 md:hidden">
      <div className="min-w-0 rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-faint">
        {currentUser ? currentUser.name || currentUser.email : "로그인 준비 중"}
      </div>
      <button type="button" onClick={onToggleTheme}
        className="shrink-0 rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-bold text-txt-soft active:border-accent active:text-txt">
        {theme === "dark" ? "라이트" : "다크"}
      </button>
    </div>
  );
}

export default function StudioShell({ active, currentUser, onLogout, theme, onToggleTheme, children }) {
  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  return (
    <>
      <MobileAppBar active={active} onBack={goBack} />
      <main className="mx-auto max-w-[1500px] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 md:px-6 md:py-8">
        <div className="hidden md:block">
          <DesktopHeader
            currentUser={currentUser}
            onLogout={onLogout}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
          <StudioNav active={active} />
        </div>
        <MobileUtilityBar currentUser={currentUser} theme={theme} onToggleTheme={onToggleTheme} />
        {children}
      </main>
      <MobileTabBar active={active} />
    </>
  );
}
