"use client";

const OUTPUT_LINKS = [
  { href: "/score-18", label: "18홀", id: "score18" },
  { href: "/score-9?source=custom", label: "9홀", id: "score9" },
  { href: "/score-3?source=custom", label: "3홀", id: "score3" },
  { href: "/hole", label: "1홀", id: "hole" },
];

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

function NavAction({ href, label, onClick }) {
  const content = (
    <span className="rounded-lg border border-line bg-panel px-3 py-2 text-sm font-semibold text-txt-soft transition hover:text-txt">
      {label}
    </span>
  );

  if (href) return <a href={href}>{content}</a>;
  return (
    <button type="button" onClick={onClick}>
      {content}
    </button>
  );
}

function DisabledNavItem({ label }) {
  return (
    <span className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
      {label} 준비 중
    </span>
  );
}

export default function StudioNav({ active, currentUser }) {
  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };
  const secondaryLinks = [
    { href: "/records", label: "내 라운딩", id: "records", disabled: true },
  ];

  return (
    <nav className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <NavAction label="뒤로" onClick={goBack} />
        <NavAction href="/" label="홈" />
      </div>
      <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
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
