"use client";

import { MobileAppBar, MobileTabBar } from "./StudioNav";

export default function StudioShell({ active, sourceMode = "custom", currentUser, onLogout, theme, onToggleTheme, children }) {
  return (
    <>
      <MobileAppBar active={active} currentUser={currentUser} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
      <MobileTabBar active={active} sourceMode={sourceMode} />
      <main className="mobile-shell-main mx-auto max-w-[980px] px-4 pt-4 md:px-6 md:py-6">
        {children}
      </main>
    </>
  );
}
