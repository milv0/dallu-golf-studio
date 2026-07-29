"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PlacementPreview from "./PlacementPreview";

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
  handleShareExport,
  handleExport,
  handleBatchExport,
  captureRef,
  previewMaxWidth,
  previewMobileMaxWidth,
  previewNode,
  placementPreviewNode,
  format,
  isHole,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
    <section className="order-1">
      {isScore9 && !reelsCustom && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">범위</div>
          <div className="flex overflow-hidden rounded-lg border border-line">
            {availableRanges.map(([key, label]) => (
              <button key={key} onClick={() => setHoleRange(key)}
                className={"px-4 py-1.5 text-sm font-semibold transition " +
                  (effRange === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-line bg-panel p-2 md:p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 md:gap-2">
          <button type="button" onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 md:pointer-events-none">
            <span className="font-head text-xs font-semibold uppercase tracking-widest text-txt-soft md:text-sm">
              미리보기
            </span>
            <ChevronDown size={14} className={"text-txt-faint transition md:hidden " + (collapsed ? "-rotate-90" : "")} />
          </button>
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <div className="flex overflow-hidden rounded-lg border border-line">
              {[["dark", "다크"], ["light", "라이트"]].map(([key, label]) => (
                <button key={key} onClick={() => setCardTheme(key)}
                  className={"px-2 py-1 text-[11px] font-bold md:px-3 md:py-1.5 md:text-xs " +
                    (cardTheme === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                  {label}
                </button>
              ))}
            </div>
            <div className={"flex overflow-hidden rounded-lg border border-line " + (collapsed ? "hidden md:flex" : "")}>
              {QUALITY.map((qz) => (
                <button key={qz.scale} onClick={() => setExportScale(qz.scale)}
                  title={`${qz.desc} · ${size.w * qz.scale}x${size.h * qz.scale}px`}
                  className={"flex flex-col items-center px-2 py-1 text-[11px] font-bold leading-tight md:px-3 md:py-1.5 md:text-xs " +
                    (exportScale === qz.scale ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                  <span>{qz.label}</span>
                  <span className={"text-[8px] font-semibold " + (exportScale === qz.scale ? "text-[#06210f]/70" : "text-txt-faint")}>
                    {size.w * qz.scale}x{size.h * qz.scale}
                  </span>
                </button>
              ))}
            </div>
            <button onClick={handleShareExport} disabled={busy || !canExport}
              title={!canExport ? "필수 입력을 먼저 완료하세요" : "iPhone에서는 공유 시트에서 이미지 저장을 선택하세요"}
              className="rounded-lg bg-accent px-3 py-1 font-head text-xs font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60 md:hidden">
              {busy ? "생성 중..." : !canExport ? "입력 필요" : "공유"}
            </button>
            <button onClick={handleExport} disabled={busy || !canExport}
              title={!canExport ? "필수 입력을 먼저 완료하세요" : "PNG 다운로드"}
              className="hidden rounded-lg bg-accent px-4 py-1.5 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60 md:inline-block">
              {busy ? "생성 중..." : !canExport ? "입력 필요" : "PNG 다운로드"}
            </button>
            {batchProgressCount > 0 && (
              <button onClick={handleBatchExport} disabled={busy || !canBatchExport}
                title={!hasBatchScores ? "모든 스코어를 입력해야 합니다" : "홀별 PNG를 ZIP으로 저장합니다"}
                className="hidden rounded-lg border border-line bg-panel-2 px-4 py-1.5 font-head text-sm font-bold uppercase tracking-wide text-txt-soft transition hover:border-accent hover:text-txt disabled:opacity-60 md:inline-block">
                {busy ? "생성 중..." : `홀별 ${batchProgressCount}장 저장`}
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
            <b className="text-txt">출력</b>
            <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[12px] font-bold text-accent">
              {(QUALITY.find((x) => x.scale === exportScale) || {}).label}
            </span>
            <span className="font-mono text-[11px] md:text-[13px]">투명 PNG · {size.w * exportScale}x{size.h * exportScale}px</span>
            <span className="hidden text-[12px] text-txt-faint md:inline">버디=빨강 / 이글=골드 / 보기=파랑</span>
          </div>
        </div>
        {!canExport && exportBlockReason && (
          <div className="mt-2 rounded-md border border-[#ffb648]/40 bg-[#ffb648]/10 px-2.5 py-1.5 text-[12px] font-semibold text-[#ffb648]">
            {exportBlockReason}
          </div>
        )}
      </div>

    </section>
    <section className="order-3 hidden md:block">
      <div className="mb-2 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        실제 배치 미리보기
        <span className="ml-2 normal-case tracking-normal text-txt-faint">
          {format === "youtube" ? "16:9 영상 기준" : "9:16 영상 기준"}
        </span>
      </div>
      <PlacementPreview format={format} size={size} isHole={isHole}>
        {placementPreviewNode}
      </PlacementPreview>
    </section>
    </>
  );
}
