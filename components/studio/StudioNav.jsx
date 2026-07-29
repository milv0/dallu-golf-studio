"use client";

import { STUDIO_STORAGE_KEYS } from "../../lib/studioStorage";

export const LAST_ROUTE_KEY = {
  custom: STUDIO_STORAGE_KEYS.lastCustomRoute,
  round: STUDIO_STORAGE_KEYS.lastRoundRoute,
};

export const CUSTOM_LINKS = [
  { href: "/score-18?source=custom", label: "18홀", id: "score18" },
  { href: "/score-9?source=custom", label: "9홀", id: "score9" },
  { href: "/score-3?source=custom", label: "3홀", id: "score3" },
  { href: "/hole?source=custom", label: "1홀", id: "hole" },
];

export const ROUND_LINKS = [
  { href: "/round", label: "18홀", id: "score18" },
  { href: "/score-9?source=linked", label: "9홀", id: "score9" },
  { href: "/score-3?source=linked", label: "3홀", id: "score3" },
  { href: "/hole?source=linked", label: "1홀", id: "hole" },
];

export function linksFor(sourceMode = "custom") {
  return sourceMode === "round" ? ROUND_LINKS : CUSTOM_LINKS;
}

export function defaultFlowHref(sourceMode = "custom") {
  return linksFor(sourceMode)[0]?.href || "/";
}

export function storedFlowHref(sourceMode = "custom") {
  const links = linksFor(sourceMode);
  const fallback = links[0]?.href || "/";
  if (typeof window === "undefined") return fallback;

  try {
    const storageKey = LAST_ROUTE_KEY[sourceMode];
    const savedHref = storageKey ? window.localStorage.getItem(storageKey) : "";
    return links.some((link) => link.href === savedHref) ? savedHref : fallback;
  } catch {
    return fallback;
  }
}

export function getActiveLabel(active) {
  return CUSTOM_LINKS.find((link) => link.id === active)?.label || (active === "records" ? "내 라운딩" : "작업");
}

function NavLink({ href, label, active }) {
  return (
    <a href={href}
      className={"rounded-lg border px-3.5 py-2 text-sm font-semibold transition " +
        (active
          ? "border-accent bg-accent text-[#06210f]"
          : "border-line bg-panel text-txt-soft hover:text-txt")}>
      {label}
    </a>
  );
}

export function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M3.5 11.5 12 4l8.5 7.5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.5V20h11v-9.5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MobileIconButton({ label, href, onClick, children }) {
  const className = "flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-txt-soft shadow-sm transition active:scale-95 active:border-accent active:text-txt";
  if (href) {
    return <a href={href} aria-label={label} title={label} className={className}>{children}</a>;
  }
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={className}>{children}</button>;
}

function DisabledNavItem({ label }) {
  return (
    <span aria-disabled="true" title="현재 비활성화되어 있습니다"
      className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
      {label}
    </span>
  );
}

function ThemeButton({ theme, onToggleTheme }) {
  return (
    <button type="button" onClick={onToggleTheme}
      className="rounded-full border border-line bg-panel px-2.5 py-1.5 text-xs font-bold text-txt-soft transition active:border-accent active:text-txt sm:px-3"
      title="라이트/다크 테마 전환">
      {theme === "dark" ? "라이트" : "다크"}
    </button>
  );
}

function LoginButton({ currentUser, onLogout }) {
  if (currentUser) {
    return (
      <button type="button" onClick={onLogout}
        className="rounded-full border border-line bg-panel px-2.5 py-1.5 text-xs font-semibold text-txt-soft transition active:border-accent active:text-txt sm:px-3">
        로그아웃
      </button>
    );
  }

  return (
    <button type="button" disabled title="로그인 기능은 현재 비활성화되어 있습니다"
      className="cursor-not-allowed rounded-full border border-line bg-panel px-2.5 py-1.5 text-xs font-semibold text-txt-faint opacity-70 sm:px-3">
      로그인
    </button>
  );
}

export function TopActions({ currentUser, onLogout, theme, onToggleTheme }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <ThemeButton theme={theme} onToggleTheme={onToggleTheme} />
      <LoginButton currentUser={currentUser} onLogout={onLogout} />
    </div>
  );
}

function MobileTabLink({ href, label, active }) {
  return (
    <a href={href}
      aria-current={active ? "page" : undefined}
      className={"flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-2 py-2 font-head text-[18px] font-bold leading-none transition " +
        (active
          ? "bg-accent text-[#06210f]"
          : "text-txt-soft active:bg-panel-2 active:text-txt")}>
      <span>{label}</span>
    </a>
  );
}

export function MobileAppBar({ active, currentUser, onLogout, theme, onToggleTheme }) {
  const refreshPage = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur">
      <div className="mx-auto grid max-w-[520px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 md:max-w-[980px]">
        <MobileIconButton label="홈" href="/">
          <HomeIcon />
        </MobileIconButton>
        <button type="button" onClick={refreshPage} aria-label="새로고침"
          className="min-w-0 px-3 text-center transition active:scale-[0.98] active:opacity-80">
          <div className="font-head text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            @Dallu_Golf
          </div>
          <div className="truncate font-head text-[24px] font-bold uppercase leading-none text-txt">
            {getActiveLabel(active)}
          </div>
        </button>
        <TopActions currentUser={currentUser} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
      </div>
    </header>
  );
}

export function MobileTabBar({ active, sourceMode = "custom" }) {
  const links = linksFor(sourceMode);
  return (
    <nav className="mobile-tab-bar">
      <div className="mx-auto flex max-w-[520px] gap-2 rounded-2xl border border-line bg-panel p-1.5 shadow-lg md:max-w-[720px]">
        {links.map((link) => (
          <MobileTabLink key={link.href} href={link.href} label={link.label} active={active === link.id} />
        ))}
      </div>
    </nav>
  );
}

export default function StudioNav({ active, sourceMode = "custom" }) {
  const links = linksFor(sourceMode);
  const secondaryLinks = [
    { href: "/records", label: "내 라운딩", id: "records", disabled: true },
  ];

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 hidden shrink-0 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint sm:inline">
          출력 선택
        </span>
        {links.map((link) => (
          <NavLink key={link.href} {...link} active={active === link.id} />
        ))}
      </div>
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {secondaryLinks.map((link) => (
          link.disabled
            ? <DisabledNavItem key={link.href} label={link.label} />
            : <NavLink key={link.href} {...link} active={active === link.id} />
        ))}
      </div>
    </nav>
  );
}
