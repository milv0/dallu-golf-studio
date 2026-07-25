"use client";

import { useState } from "react";
import { fetchRoundRecords } from "../../lib/api";
import { loadRoundHistory } from "../../lib/roundHistory";
import { toParLabel } from "../../lib/score";

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}

export default function RoundSourcePanel({
  round,
  summary,
  requiresScores = false,
  hasRoundData = false,
  hasRoundScores = false,
  currentUser = null,
  onLoadRound,
  loginNext = "/score-9",
}) {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("idle");
  const toPar = summary.thru > 0 ? toParLabel(summary.toPar) : "";
  const needsInput = !hasRoundData || (requiresScores && !hasRoundScores);

  const loadRecords = () => {
    if (!currentUser) {
      setOpen(true);
      return;
    }
    setOpen(true);
    setStatus("loading");
    fetchRoundRecords(currentUser)
      .then((items) => {
        setRecords(items);
        setStatus("ready");
      })
      .catch(() => {
        setRecords(loadRoundHistory(currentUser));
        setStatus("offline");
      });
  };

  const selectRecord = (record) => {
    onLoadRound?.(record.round, record);
    setOpen(false);
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
          라운드 연동
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={open ? () => setOpen(false) : loadRecords}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-[#06210f] transition hover:bg-accent-2">
            {open ? "닫기" : "내 라운딩 불러오기"}
          </button>
          <a href="/score-18"
            className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:border-accent hover:text-txt">
            {hasRoundData ? "18홀 수정" : "18홀 입력"}
          </a>
        </div>
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

      {open && (
        <div className="mt-4 border-t border-line pt-3">
          {!currentUser ? (
            <div className="rounded-lg border border-line bg-panel-2 px-3 py-3 text-sm text-txt-soft">
              <div className="font-semibold text-txt">로그인이 필요합니다</div>
              <div className="mt-1 text-xs text-txt-faint">이메일 기준으로 저장된 라운딩을 불러옵니다.</div>
              <a href={`/login?next=${encodeURIComponent(loginNext)}`}
                className="mt-3 inline-flex rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-[#06210f] transition hover:bg-accent-2">
                로그인
              </a>
            </div>
          ) : status === "loading" ? (
            <div className="rounded-lg border border-line bg-panel-2 px-3 py-3 text-sm text-txt-faint">
              라운딩 기록 불러오는 중...
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-lg border border-line bg-panel-2 px-3 py-3 text-sm text-txt-soft">
              저장된 라운딩이 없습니다.
              <a href="/score-18" className="ml-2 font-semibold text-accent hover:text-accent-2">18홀 입력</a>
            </div>
          ) : (
            <div className="space-y-2">
              {status === "offline" && (
                <div className="text-[11px] text-[#ffb648]">DB 연결 실패로 이 브라우저 저장 기록을 표시합니다.</div>
              )}
              {records.slice(0, 6).map((record) => (
                <button key={record.id} type="button" onClick={() => selectRecord(record)}
                  className="block w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-left transition hover:border-accent">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-txt">
                      {record.round?.course || "COURSE"}
                    </span>
                    <span className="shrink-0 font-mono text-[12px] font-bold text-accent">
                      {(record.summary?.thru || 0) > 0 ? toParLabel(record.summary.toPar) : "-"}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-txt-faint">
                    <span>{record.round?.player || "PLAYER"}</span>
                    <span className="font-mono">{formatDate(record.round?.date)}</span>
                    <span className="font-mono">{record.summary?.thru || 0}/18</span>
                  </div>
                </button>
              ))}
              {records.length > 6 && (
                <a href="/records" className="block text-right text-xs font-semibold text-txt-faint transition hover:text-accent">
                  전체 보기
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
