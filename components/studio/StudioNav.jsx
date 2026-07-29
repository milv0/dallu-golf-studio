"use client";

import { Moon, Sun } from "lucide-react";
import { STUDIO_STORAGE_KEYS } from "../../lib/studioStorage";

export const LAST_ROUTE_KEY = {
  custom: STUDIO_STORAGE_KEYS.lastCustomRoute,
  round: STUDIO_STORAGE_KEYS.lastRoundRoute,
};

export const CUSTOM_LINKS = [
  { href: "/Hole18?source=custom", label: "18홀", id: "score18" },
  { href: "/Hole9?source=custom", label: "9홀", id: "score9" },
  { href: "/Hole3?source=custom", label: "3홀", id: "score3" },
  { href: "/hole?source=custom", label: "1홀", id: "hole" },
];

export const ROUND_LINKS = [
  { href: "/round", label: "18홀", id: "score18" },
  { href: "/Hole9?source=linked", label: "9홀", id: "score9" },
  { href: "/Hole3?source=linked", label: "3홀", id: "score3" },
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
  if (sourceMode === "round") return fallback;
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


function DisabledNavItem({ label }) {
  return (
    <span aria-disabled="true" title="현재 비활성화되어 있습니다"
      className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
      {label}
    </span>
  );
}

function ThemeButton({ theme, onToggleTheme }) {
  const nextThemeLabel = theme === "dark" ? "라이트 테마로 전환" : "다크 테마로 전환";
  return (
    <button type="button" onClick={onToggleTheme} aria-label={nextThemeLabel} title={nextThemeLabel}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-txt-soft transition active:border-accent active:text-txt">
      {theme === "dark" ? <Sun aria-hidden="true" size={18} strokeWidth={2.2} /> : <Moon aria-hidden="true" size={18} strokeWidth={2.2} />}
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

export function MobileAppBar({ active, sourceMode = "custom", currentUser, onLogout, theme, onToggleTheme }) {
  const links = linksFor(sourceMode);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] backdrop-blur">
      <div className="mx-auto max-w-[520px] md:max-w-[980px]">
        <div className="flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 transition active:opacity-80">
            <span className="font-head text-[13px] font-bold uppercase tracking-[0.15em] text-accent">
              Dallu Golf
            </span>
          </a>
          <TopActions currentUser={currentUser} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        </div>
        <nav className="mt-2 flex gap-1.5">
          {links.map((link) => (
            <a key={link.href} href={link.href}
              aria-current={active === link.id ? "page" : undefined}
              className={"flex-1 rounded-lg py-1.5 text-center font-head text-[14px] font-bold leading-none transition " +
                (active === link.id
                  ? "bg-accent text-[#06210f]"
                  : "text-txt-soft hover:bg-panel-2 hover:text-txt active:bg-panel-2")}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
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
