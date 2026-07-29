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

function DisabledNavItem({ label }) {
  return (
    <span className="cursor-not-allowed rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-faint opacity-70">
      {label} 준비 중
    </span>
  );
}

export default function StudioNav({ active, currentUser }) {
  const secondaryLinks = [
    { href: "/records", label: "내 라운딩", id: "records", disabled: true },
  ];

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
          출력 선택
        </span>
        {OUTPUT_LINKS.map((link) => (
          <NavLink key={link.href} {...link} active={active === link.id} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {secondaryLinks.map((link) => (
          link.disabled
            ? <DisabledNavItem key={link.href} label={link.label} />
            : <NavLink key={link.href} {...link} active={active === link.id} />
        ))}
      </div>
    </nav>
  );
}
