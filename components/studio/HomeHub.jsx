"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Pencil, Share2 } from "lucide-react";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import { defaultFlowHref, storedFlowHref, TopActions } from "./StudioNav";
import { useLang } from "../../lib/i18n";
import { FEATURE_FLAGS } from "../../lib/features.js";

export default function HomeHub() {
  const { t } = useLang();
  const [currentUser, setCurrentUser] = useState(null);
  const [flowHrefs, setFlowHrefs] = useState({
    round: defaultFlowHref("round"),
    custom: defaultFlowHref("custom"),
  });

  useEffect(() => {
    setCurrentUser(loadCurrentUser());
    setFlowHrefs({
      round: storedFlowHref("round"),
      custom: storedFlowHref("custom"),
    });
  }, []);

  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  const cards = [
    {
      href: flowHrefs.round,
      title: t("home.roundTitle"),
      desc: t("home.roundDesc"),
      icon: ClipboardList,
      accent: "border-t-[3px] border-t-accent",
      disabled: !FEATURE_FLAGS.myRound,
    },
    { href: flowHrefs.custom, title: t("home.customTitle"), desc: t("home.customDesc"), icon: Pencil, accent: "border-t-[3px] border-t-[#2bb673]" },
  ];

  return (
    <main className="mobile-home-main flex min-h-[100dvh] flex-col px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6">
      <header className="mx-auto flex w-full max-w-[520px] items-center justify-between py-3 md:max-w-[980px]">
        <div className="font-head text-[13px] font-bold uppercase tracking-[0.15em] text-accent">
          Dallu Golf
        </div>
        <TopActions currentUser={currentUser} onLogout={logout} />
      </header>

      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center pb-[env(safe-area-inset-bottom)] md:max-w-[980px]">
        <div className="mb-10 text-center">
          <h1 className="font-head text-[48px] font-bold uppercase leading-none text-txt md:text-[64px]">
            Golf Studio
          </h1>
          <p className="mt-3 text-sm text-txt-soft">{t("home.subtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div
                  key={item.title}
                  aria-disabled="true"
                  className={`cursor-not-allowed overflow-hidden rounded-2xl border border-line bg-panel p-6 opacity-50 md:p-8 ${item.accent}`}
                >
                  <Icon size={28} strokeWidth={1.8} className="mb-4 text-txt-faint" />
                  <div className="font-head text-[22px] font-bold leading-tight text-txt md:text-[26px]">
                    {item.title}
                  </div>
                  <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">
                    {item.desc}
                  </div>
                  <div className="mt-4 font-head text-[12px] font-semibold uppercase tracking-wider text-txt-faint">
                    {t("home.preparing")}
                  </div>
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href}
                className={`group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 transition hover:border-accent/60 hover:shadow-[0_0_30px_-8px_rgba(56,224,139,0.15)] active:scale-[0.98] md:p-8 ${item.accent}`}>
                <Icon size={28} strokeWidth={1.8} className="mb-4 text-accent" />
                <div className="font-head text-[22px] font-bold leading-tight text-txt md:text-[26px]">
                  {item.title}
                </div>
                <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">
                  {item.desc}
                </div>
                <div className="mt-4 inline-flex items-center gap-1 font-head text-[12px] font-semibold uppercase tracking-wider text-accent transition group-hover:gap-2">
                  {t("home.start")}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

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
          <Link href="/guide" className="text-[12px] font-semibold text-txt-faint underline transition hover:text-accent">
            {t("home.guideLink")}
          </Link>
        </div>

        <p className="mt-4 text-center text-[11px] text-txt-faint">
          {t("home.footer")}
        </p>
      </div>
    </main>
  );
}
