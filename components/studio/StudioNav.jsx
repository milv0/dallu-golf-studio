"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import { STUDIO_STORAGE_KEYS } from "../../lib/studioStorage";
import { useLang } from "../../lib/i18n";
import LangToggle from "./LangToggle";
import ThemeToggle from "./ThemeToggle";

export const LAST_CUSTOM_ROUTE_KEY = STUDIO_STORAGE_KEYS.lastCustomRoute;

export const CUSTOM_LINKS = [
  { href: "/custom/Hole18", labelKey: "tab.hole18", id: "score18" },
  { href: "/custom/Hole9", labelKey: "tab.hole9", id: "score9" },
  { href: "/custom/Hole3", labelKey: "tab.hole3", id: "score3" },
  { href: "/custom/Hole1", labelKey: "tab.hole1", id: "hole" },
];

export const ROUND_LINKS = [
  { href: "/round", labelKey: "tab.hole18", id: "score18" },
  { href: "/round/Hole9", labelKey: "tab.hole9", id: "score9" },
  { href: "/round/Hole3", labelKey: "tab.hole3", id: "score3" },
  { href: "/round/Hole1", labelKey: "tab.hole1", id: "hole" },
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
    const savedHref = window.localStorage.getItem(LAST_CUSTOM_ROUTE_KEY) || "";
    return links.some((link) => link.href === savedHref) ? savedHref : fallback;
  } catch {
    return fallback;
  }
}

function NavLink({ href, label, active }) {
  return (
    <Link href={href}
      className={"rounded-lg border px-3.5 py-2 text-sm font-semibold transition " +
        (active
          ? "border-accent bg-accent text-[#06210f]"
          : "border-line bg-panel text-txt-soft hover:text-txt")}>
      {label}
    </Link>
  );
}

function DisabledNavItem({ label, disabledTitle }) {
  return (
    <span aria-disabled="true" title={disabledTitle}
      className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
      {label}
    </span>
  );
}

function LoginButton({ currentUser, onLogout, t }) {
  if (currentUser) {
    return (
      <button type="button" onClick={onLogout}
        className="rounded-full border border-line bg-panel px-2.5 py-1.5 text-xs font-semibold text-txt-soft transition active:border-accent active:text-txt sm:px-3">
        {t("nav.logout")}
      </button>
    );
  }

  return (
    <button type="button" disabled title={t("nav.loginDisabled")}
      className="cursor-not-allowed rounded-full border border-line bg-panel px-2.5 py-1.5 text-xs font-semibold text-txt-faint opacity-70 sm:px-3">
      {t("nav.login")}
    </button>
  );
}

export function TopActions({ currentUser, onLogout }) {
  const { t } = useLang();
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <ThemeToggle />
      <LangToggle />
      <LoginButton currentUser={currentUser} onLogout={onLogout} t={t} />
    </div>
  );
}

// 모든 공개 화면의 첫 행은 이 컴포넌트를 쓴다. 높이·safe area·컨트롤 순서가
// 화면마다 달라지면 앱 안에서 다른 사이트로 이동한 것처럼 느껴진다.
export function AppHeader({ currentUser, onLogout, children }) {
  const { t, href } = useLang();
  const pathname = usePathname() || "/";
  const guideHref = href("/guide");
  const isGuidePage = pathname === guideHref;
  const [localUser, setLocalUser] = useState(null);
  const ownsUserState = currentUser === undefined;

  useEffect(() => {
    if (ownsUserState) setLocalUser(loadCurrentUser());
  }, [ownsUserState]);

  const activeUser = ownsUserState ? localUser : currentUser;
  const logout = onLogout || (() => {
    clearCurrentUser();
    setLocalUser(null);
  });

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] backdrop-blur md:px-6">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="flex min-h-8 items-center justify-between gap-3">
          <Link href={href("/")} className="font-head text-[13px] font-bold uppercase tracking-[0.15em] text-accent transition active:opacity-80">
            Dallu Golf
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link href={guideHref} aria-label={t("home.guideLink")} title={t("home.guideLink")}
              aria-current={isGuidePage ? "page" : undefined}
              className={"flex size-8 items-center justify-center rounded-full border transition active:scale-95 " +
                (isGuidePage
                  ? "border-accent bg-panel-2 text-accent"
                  : "border-line bg-panel text-txt-soft hover:border-accent hover:text-txt")}>
              <CircleHelp aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
            <TopActions currentUser={activeUser} onLogout={logout} />
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}

export function MobileAppBar({ active, sourceMode = "custom", currentUser, onLogout }) {
  const { t, href } = useLang();
  const links = linksFor(sourceMode);
  return (
    <AppHeader currentUser={currentUser} onLogout={onLogout}>
      <nav aria-label={t("a11y.cardFormatNav")} className="mt-2 flex gap-1.5">
        {links.map((link) => (
          <Link key={link.href} href={href(link.href)}
            aria-current={active === link.id ? "page" : undefined}
            className={"flex-1 rounded-lg py-1.5 text-center font-head leading-none transition " +
              (active === link.id
                ? "bg-accent text-[#06210f] text-[15px] font-bold"
                : "text-txt-soft text-[13px] font-semibold hover:bg-panel-2 hover:text-txt active:bg-panel-2")}>
            {t(link.labelKey)}
          </Link>
        ))}
      </nav>
    </AppHeader>
  );
}

export default function StudioNav({ active, sourceMode = "custom" }) {
  const { t, href } = useLang();
  const links = linksFor(sourceMode);
  const secondaryLinks = [
    { href: "/records", label: t("records.title"), id: "records", disabled: true },
  ];

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 hidden shrink-0 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint sm:inline">
          {t("nav.outputSelect")}
        </span>
        {links.map((link) => (
          <NavLink key={link.href} href={href(link.href)} label={t(link.labelKey)} active={active === link.id} />
        ))}
      </div>
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {secondaryLinks.map((link) => (
          link.disabled
            ? <DisabledNavItem key={link.href} label={link.label} disabledTitle={t("nav.preparing")} />
            : <NavLink key={link.href} {...link} active={active === link.id} />
        ))}
      </div>
    </nav>
  );
}
