"use client";

import { useLang } from "../../lib/i18n";

export function ResetButton({ onClick, label }) {
  const { t } = useLang();
  const displayLabel = label || t("panel.reset");
  return (
    <button type="button" onClick={onClick}
      className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-txt-soft transition hover:border-[#ff6b57] hover:text-[#ff6b57]">
      {displayLabel}
    </button>
  );
}

export default function PanelHeader({ title, children }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        {title}
      </span>
      {children ? <div className="flex flex-wrap items-center gap-2.5">{children}</div> : null}
    </div>
  );
}
