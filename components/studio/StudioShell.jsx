"use client";

import { MobileAppBar } from "./StudioNav";

export default function StudioShell({ active, sourceMode = "custom", currentUser, onLogout, children }) {
  return (
    <>
      <MobileAppBar active={active} sourceMode={sourceMode} currentUser={currentUser} onLogout={onLogout} />
      <main className="mobile-shell-main mx-auto max-w-[980px] px-4 pt-5 md:px-6 md:py-6">
        {children}
      </main>
    </>
  );
}
