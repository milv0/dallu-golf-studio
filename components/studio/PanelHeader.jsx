"use client";

export function ResetButton({ onClick, label = "초기화" }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-txt-soft transition hover:border-[#ff6b57] hover:text-[#ff6b57]">
      {label}
    </button>
  );
}

export default function PanelHeader({ title, children }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        {title}
      </span>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
