"use client";

import { toParLabel } from "../../lib/score";

export default function RoundSourcePanel({ round, summary, requiresScores = false, hasRoundData = false, hasRoundScores = false }) {
  const toPar = summary.thru > 0 ? toParLabel(summary.toPar) : "";
  const needsInput = !hasRoundData || (requiresScores && !hasRoundScores);

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
          라운드 데이터
        </div>
        <a href="/score-18"
          className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:border-accent hover:text-txt">
          {hasRoundData ? "18홀 수정" : "18홀 입력"}
        </a>
      </div>

      {needsInput && (
        <div className="mb-3 rounded-lg border border-[#ffb648]/40 bg-[#ffb648]/10 px-3 py-2 text-sm text-txt-soft">
          <b className="text-[#ffb648]">
            {!hasRoundData ? "18홀 데이터 없음" : "18홀 스코어 없음"}
          </b>
          <span className="ml-2">
            {!hasRoundData ? "먼저 18홀 스코어를 입력하세요." : "연동에는 입력된 홀 스코어가 필요합니다."}
          </span>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span className="text-txt-faint">선수</span>
          <span className="truncate font-semibold text-txt">{round.player || "-"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span className="text-txt-faint">코스</span>
          <span className="truncate font-semibold text-txt">{round.course || "-"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span className="text-txt-faint">날짜</span>
          <span className="font-mono text-[13px] font-semibold text-txt">{round.date || "-"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-txt-faint">스코어</span>
          <span className="font-mono text-[13px] font-bold text-txt">
            {summary.thru > 0 ? `${summary.totalScore} · ${toPar} · ${summary.thru}/18` : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
