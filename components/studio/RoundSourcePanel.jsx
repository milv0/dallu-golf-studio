"use client";

import { toParLabel } from "../../lib/score";
import { useLang } from "../../lib/i18n";

export default function RoundSourcePanel({
  round,
  summary,
  requiresScores = false,
  hasRoundData = false,
  hasRoundScores = false,
}) {
  const { t } = useLang();
  const toPar = summary.thru > 0 ? toParLabel(summary.toPar) : "";
  const needsInput = !hasRoundData || (requiresScores && !hasRoundScores);

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
          {t("source.selected")}
        </div>
        <div className="text-xs font-semibold text-txt-faint">
          18홀 입력값 연동
        </div>
      </div>

      {needsInput && (
        <div className="mb-3 rounded-lg border border-[#ffb648]/40 bg-[#ffb648]/10 px-3 py-2 text-sm text-txt-soft">
          <b className="text-[#ffb648]">
            {!hasRoundData ? "18홀 데이터 없음" : "18홀 스코어 없음"}
          </b>
          <span className="ml-2">
            {t("source.needScores")}
          </span>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span className="text-txt-faint">{t("info.player")}</span>
          <span className="truncate font-semibold text-txt">{round.player || "-"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span className="text-txt-faint">{t("field.course")}</span>
          <span className="truncate font-semibold text-txt">{round.course || "-"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span className="text-txt-faint">{t("info.date")}</span>
          <span className="font-mono text-[13px] font-semibold text-txt">{round.date || "-"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-txt-faint">Score</span>
          <span className="font-mono text-[13px] font-bold text-txt">
            {summary.thru > 0 ? `${summary.totalScore} · ${toPar} · ${summary.thru}/18` : "-"}
          </span>
        </div>
      </div>
      <div className="mt-3 border-t border-line pt-3 text-right">
        <a href="/round" className="text-xs font-semibold text-txt-faint transition hover:text-accent">
          {t("source.editLink")}
        </a>
      </div>
    </div>
  );
}
