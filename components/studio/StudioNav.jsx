"use client";

const OUTPUT_LINKS = [
  { href: "/score-18", label: "18홀", key: "score18" },
  { href: "/score-9", label: "9홀", key: "score9" },
  { href: "/score-3", label: "3홀", key: "score3" },
  { href: "/hole", label: "1홀", key: "hole" },
];

function NavLink({ href, label, active }) {
  return (
    <a key={href} href={href}
      className={"rounded-lg border px-3.5 py-2 text-sm font-semibold transition " +
        (active
          ? "border-accent bg-accent text-[#06210f]"
          : "border-line bg-panel text-txt-soft hover:text-txt")}>
      {label}
    </a>
  );
}

export default function StudioNav({ active, currentUser }) {
  const secondaryLinks = [
    { href: "/records", label: "내 라운딩", key: "records" },
    { href: "/admin", label: "코스 DB", key: "admin" },
    { href: "/login", label: currentUser ? "계정" : "로그인", key: "login" },
  ];

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
          출력 선택
        </span>
        {OUTPUT_LINKS.map((link) => (
          <NavLink key={link.href} {...link} active={active === link.key} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {secondaryLinks.map((link) => (
          <NavLink key={link.href} {...link} active={active === link.key} />
        ))}
      </div>
    </nav>
  );
}
