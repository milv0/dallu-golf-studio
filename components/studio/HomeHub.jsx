"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun, ClipboardList, Pencil } from "lucide-react";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import { defaultFlowHref, storedFlowHref } from "./StudioNav";

export default function HomeHub() {
  const [currentUser, setCurrentUser] = useState(null);
  const [flowHrefs, setFlowHrefs] = useState({
    round: defaultFlowHref("round"),
    custom: defaultFlowHref("custom"),
  });
  const [theme, setTheme] = useState("light");

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
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const cards = [
    { href: flowHrefs.round, title: "내 라운드 기록", desc: "18홀 라운드를 입력하고 9·3·1홀 카드를 자동 생성", icon: ClipboardList, accent: "border-t-[3px] border-t-accent", disabled: true },
    { href: flowHrefs.custom, title: "직접 만들기", desc: "원하는 홀 수만큼 자유롭게 스코어카드 제작", icon: Pencil, accent: "border-t-[3px] border-t-[#2bb673]" },
  ];

  return (
    <main className="mobile-home-main flex min-h-[100dvh] flex-col px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6">
      <header className="mx-auto flex w-full max-w-[520px] items-center justify-between py-3 md:max-w-[980px]">
        <div className="font-head text-[13px] font-bold uppercase tracking-[0.15em] text-accent">
          Dallu Golf
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme}
            aria-label={theme === "dark" ? "라이트 테마로 전환" : "다크 테마로 전환"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-txt-soft transition hover:border-accent hover:text-txt active:scale-95">
            {theme === "dark" ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
          </button>
          {currentUser ? (
            <button type="button" onClick={logout}
              className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:border-accent hover:text-txt">
              로그아웃
            </button>
          ) : (
            <button type="button" disabled title="로그인 기능은 현재 비활성화되어 있습니다"
              className="cursor-not-allowed rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-faint opacity-60">
              로그인
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center pb-[env(safe-area-inset-bottom)] md:max-w-[980px]">
        <div className="mb-10 text-center">
          <h1 className="font-head text-[48px] font-bold uppercase leading-none text-txt md:text-[64px]">
            Golf Studio
          </h1>
          <p className="mt-3 text-sm text-txt-soft">골프 스코어카드를 이미지로 만들어 공유하세요</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div key={item.title}
                  className={`relative overflow-hidden rounded-2xl border border-line bg-panel p-6 opacity-50 cursor-not-allowed md:p-8 ${item.accent}`}>
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/5" />
                  <Icon size={28} strokeWidth={1.8} className="mb-4 text-txt-faint" />
                  <div className="font-head text-[22px] font-bold leading-tight text-txt md:text-[26px]">
                    {item.title}
                  </div>
                  <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">
                    {item.desc}
                  </div>
                  <div className="mt-4 font-head text-[12px] font-semibold uppercase tracking-wider text-txt-faint">
                    준비 중
                  </div>
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href}
                className={`group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 transition hover:border-accent/60 hover:shadow-[0_0_30px_-8px_rgba(56,224,139,0.15)] active:scale-[0.98] md:p-8 ${item.accent}`}>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/5 transition group-hover:bg-accent/10" />
                <Icon size={28} strokeWidth={1.8} className="mb-4 text-accent" />
                <div className="font-head text-[22px] font-bold leading-tight text-txt md:text-[26px]">
                  {item.title}
                </div>
                <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">
                  {item.desc}
                </div>
                <div className="mt-4 inline-flex items-center gap-1 font-head text-[12px] font-semibold uppercase tracking-wider text-accent transition group-hover:gap-2">
                  시작하기
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl border border-line bg-panel p-4 md:p-6">
          <div className="mb-3 font-head text-[12px] font-semibold uppercase tracking-widest text-txt-faint">사용 방법</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-head text-[16px] font-bold text-accent">1</div>
              <div className="text-[12px] font-semibold text-txt-soft">스코어 입력</div>
            </div>
            <div>
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-head text-[16px] font-bold text-accent">2</div>
              <div className="text-[12px] font-semibold text-txt-soft">미리보기 확인</div>
            </div>
            <div>
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-head text-[16px] font-bold text-accent">3</div>
              <div className="text-[12px] font-semibold text-txt-soft">공유 / 다운로드</div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-txt-faint">
          로그인 · 코스 DB · 라운드 저장 기능은 준비 중입니다
        </p>
      </div>
    </main>
  );
}
