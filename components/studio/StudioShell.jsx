"use client";

import { MobileAppBar, MobileTabBar } from "./StudioNav";

function MobileUtilityBar({ currentUser, theme, onToggleTheme }) {
  return (
    <div className="mx-auto mb-4 flex max-w-[520px] items-center justify-between gap-2 md:max-w-[980px]">
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

export default function StudioShell({ active, sourceMode = "custom", currentUser, onLogout, theme, onToggleTheme, children }) {
  return (
    <>
      <MobileAppBar active={active} />
      <MobileTabBar active={active} sourceMode={sourceMode} />
      <main className="mobile-shell-main mx-auto max-w-[980px] px-4 pt-4 md:px-6 md:py-6">
        <MobileUtilityBar currentUser={currentUser} theme={theme} onToggleTheme={onToggleTheme} />
        {children}
      </main>
    </>
  );
}
