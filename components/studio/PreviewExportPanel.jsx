"use client";

import { useState } from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { useLang } from "../../lib/i18n";

const QUALITY = [
  { scale: 1, label: "Reels", desc: "Instagram / TikTok" },
  { scale: 2, label: "YouTube", desc: "4K video overlay" },
  { scale: 3, label: "MAX", desc: "Max resolution" },
];

export default function PreviewExportPanel({
  isScore9,
  reelsCustom,
  availableRanges,
  effRange,
  setHoleRange,
  cardTheme,
  setCardTheme,
  exportScale,
  setExportScale,
  size,
  busy,
  canExport,
  canBatchExport,
  hasBatchScores,
  batchProgressCount,
  exportBlockReason,
  exportError,
  handleShareExport,
  handleExport,
  handleBatchExport,
  captureRef,
  previewMaxWidth,
  previewMobileMaxWidth,
  previewNode,
}) {
  const { t } = useLang();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
    <section className="order-1">
      {isScore9 && !reelsCustom && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">{t("preview.range")}</div>
          <div className="flex overflow-hidden rounded-lg border border-line">
            {availableRanges.map(([key, labelKey]) => (
              <button key={key} onClick={() => setHoleRange(key)}
                className={"px-4 py-1.5 text-sm font-semibold transition " +
                  (effRange === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-line bg-panel p-2 md:p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 md:gap-2">
          <button type="button" onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed} aria-controls="preview-body"
            className="flex items-center gap-1.5 md:pointer-events-none">
            <span className="font-head text-xs font-semibold uppercase tracking-widest text-txt-soft md:text-sm">
              {t("preview.title")}
            </span>
            <ChevronDown size={14} className={"text-txt-faint transition md:hidden " + (collapsed ? "-rotate-90" : "")} />
          </button>
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <div className="flex overflow-hidden rounded-lg border border-line" role="group" aria-label={t("a11y.cardTheme")}>
              {[["dark", Moon], ["light", Sun]].map(([key, Icon]) => (
                <button key={key} onClick={() => setCardTheme(key)}
                  aria-label={key === "dark" ? t("a11y.cardDark") : t("a11y.cardLight")} aria-pressed={cardTheme === key}
                  className={"flex items-center justify-center px-2 py-1 md:px-2.5 md:py-1.5 " +
                    (cardTheme === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                  <Icon size={14} strokeWidth={2.2} />
                </button>
              ))}
            </div>
            <div className={"flex overflow-hidden rounded-lg border border-line " + (collapsed ? "hidden md:flex" : "")}
              role="group" aria-label={t("a11y.outputQuality")}>
              {QUALITY.map((qz) => (
                <button key={qz.scale} onClick={() => setExportScale(qz.scale)}
                  title={`${qz.desc} · ${size.w * qz.scale}x${size.h * qz.scale}px`} aria-pressed={exportScale === qz.scale}
                  className={"px-2 py-1 text-[11px] font-bold md:px-3 md:py-1.5 md:text-xs " +
                    (exportScale === qz.scale ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                  {qz.label}
                </button>
              ))}
            </div>
            <button onClick={handleShareExport} disabled={busy || !canExport}
              title={!canExport ? t("preview.inputFirst") : t("preview.iphoneHint")}
              className="rounded-lg bg-accent px-3 py-1 font-head text-xs font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60 md:hidden">
              {busy ? t("preview.generating") : !canExport ? t("preview.inputRequired") : t("preview.share")}
            </button>
            <button onClick={handleExport} disabled={busy || !canExport}
              title={!canExport ? t("preview.inputFirst") : t("preview.download")}
              className="hidden rounded-lg bg-accent px-4 py-1.5 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60 md:inline-block">
              {busy ? t("preview.generating") : !canExport ? t("preview.inputRequired") : t("preview.download")}
            </button>
            {batchProgressCount > 0 && (
              <button onClick={handleBatchExport} disabled={busy || !canBatchExport}
                title={!hasBatchScores ? t("preview.allScoresRequired") : t("preview.batchToZip")}
                className="hidden rounded-lg border border-line bg-panel-2 px-4 py-1.5 font-head text-sm font-bold uppercase tracking-wide text-txt-soft transition hover:border-accent hover:text-txt disabled:opacity-60 md:inline-block">
                {busy ? t("preview.generating") : t("preview.batchSave", { n: batchProgressCount })}
              </button>
            )}
          </div>
        </div>

        <div className={"transition-all duration-200 " + (collapsed ? "hidden md:block" : "")}>
          <div className="checker overflow-hidden rounded-lg border border-line p-1 md:rounded-xl md:p-3">
            <div ref={captureRef} className="preview-frame preview-svg mx-auto w-full"
                 style={{ "--preview-max-desktop": `${previewMaxWidth}px`, "--preview-max-mobile": `${previewMobileMaxWidth}px` }}>
              {previewNode}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-txt-soft md:gap-x-2 md:text-sm">
            <b className="text-txt">{t("preview.output")}</b>
            <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[12px] font-bold text-accent">
              {(QUALITY.find((x) => x.scale === exportScale) || {}).label}
            </span>
            <span className="font-mono text-[11px] md:text-[13px]">{t("preview.pngSpec", { w: size.w * exportScale, h: size.h * exportScale })}</span>
          </div>
        </div>
        {!canExport && exportBlockReason && (
          <div className="mt-2 rounded-md border border-[#ffb648]/40 bg-[#ffb648]/10 px-2.5 py-1.5 text-[12px] font-semibold text-[#ffb648]">
            {exportBlockReason}
          </div>
        )}
        {exportError && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-[#e5484d]/40 bg-[#e5484d]/10 px-2.5 py-1.5">
            <span className="text-[12px] font-semibold text-[#e5484d]">{exportError}</span>
            <button type="button" onClick={handleExport}
              className="rounded-md bg-[#e5484d] px-2 py-0.5 text-[11px] font-bold text-white transition hover:bg-[#c93c3c]">
              {t("preview.retryBtn")}
            </button>
          </div>
        )}
      </div>

    </section>
    </>
  );
}
