"use client";

export const OUTPUT_LINKS = [
  { href: "/score-18", label: "18홀", id: "score18" },
  { href: "/score-9?source=custom", label: "9홀", id: "score9" },
  { href: "/score-3?source=custom", label: "3홀", id: "score3" },
  { href: "/hole", label: "1홀", id: "hole" },
];

export function getActiveLabel(active) {
  return OUTPUT_LINKS.find((link) => link.id === active)?.label || (active === "records" ? "내 라운딩" : "작업");
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

export function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M15 18 9 12l6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
    <span className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
      {label} 준비 중
    </span>
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

export function MobileAppBar({ active, onBack }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-[520px] items-center justify-between">
        <MobileIconButton label="뒤로가기" onClick={onBack}>
          <BackIcon />
        </MobileIconButton>
        <div className="min-w-0 px-3 text-center">
          <div className="font-head text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            @Dallu Golf
          </div>
          <div className="truncate font-head text-[24px] font-bold uppercase leading-none text-txt">
            {getActiveLabel(active)}
          </div>
        </div>
        <MobileIconButton label="홈" href="/">
          <HomeIcon />
        </MobileIconButton>
      </div>
    </header>
  );
}

export function MobileTabBar({ active }) {
  return (
    <nav className="mobile-tab-bar md:hidden">
      <div className="mx-auto flex max-w-[520px] gap-2 rounded-2xl border border-line bg-panel p-1.5 shadow-lg">
        {OUTPUT_LINKS.map((link) => (
          <MobileTabLink key={link.href} href={link.href} label={link.label} active={active === link.id} />
        ))}
      </div>
    </nav>
  );
}

export default function StudioNav({ active }) {
  const secondaryLinks = [
    { href: "/records", label: "내 라운딩", id: "records", disabled: true },
  ];

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 hidden shrink-0 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint sm:inline">
          출력 선택
        </span>
        {OUTPUT_LINKS.map((link) => (
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
