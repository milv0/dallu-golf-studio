"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteRoundRecord, loadRoundHistory } from "../../lib/roundHistory";
import { toParLabel } from "../../lib/score";

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", ".");
}

function formatSavedAt(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function RoundRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setRecords(loadRoundHistory());
  }, []);

  const stats = useMemo(() => {
    const played = records.reduce((sum, record) => sum + (record.summary?.thru || 0), 0);
    const completed = records.filter((record) => (record.summary?.thru || 0) >= 18).length;
    const best = records
      .filter((record) => (record.summary?.thru || 0) > 0)
      .map((record) => record.summary.toPar)
      .sort((a, b) => a - b)[0];
    return { played, completed, best };
  }, [records]);

  const openRecord = (record) => {
    window.localStorage.setItem("sc-round", JSON.stringify(record.round));
    window.location.href = "/round";
  };

  const removeRecord = (id) => {
    if (!window.confirm("이 라운딩 기록을 삭제할까요?")) return;
    setRecords(deleteRoundRecord(id));
  };

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="font-head text-[13px] font-semibold uppercase tracking-[0.28em] text-accent">
            Round Archive · @dallu_golf
          </div>
          <a href="/" className="mt-1 block font-head text-[40px] font-bold uppercase leading-none tracking-tight text-txt transition hover:text-accent">
            Dallu Golf <span className="text-accent">Studio</span>
          </a>
          <p className="mt-2 text-sm text-txt-soft">저장한 라운딩 기록을 다시 불러와 오버레이로 사용할 수 있습니다.</p>
        </div>
        <a href="/round"
          className="rounded-lg bg-accent px-4 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2">
          라운드 입력
        </a>
      </div>

      <nav className="mb-6 flex flex-wrap items-center gap-2">
        {[
          ["/round", "라운드"],
          ["/reels", "릴스"],
          ["/hole", "홀 카드"],
          ["/records", "내 라운딩"],
          ["/admin", "코스 DB"],
        ].map(([href, label]) => (
          <a key={href} href={href}
            className={"rounded-lg border px-3.5 py-2 text-sm font-semibold transition " +
              (href === "/records"
                ? "border-accent bg-accent text-[#06210f]"
                : "border-line bg-panel text-txt-soft hover:text-txt")}>
            {label}
          </a>
        ))}
      </nav>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Stat label="저장 라운드" value={records.length} />
        <Stat label="완주 라운드" value={completedLabel(stats.completed)} />
        <Stat label="베스트" value={stats.best == null ? "-" : toParLabel(stats.best)} />
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-8 text-center">
          <div className="font-head text-2xl font-bold text-txt">저장된 라운딩이 없습니다</div>
          <p className="mt-2 text-sm text-txt-soft">라운드 탭에서 선수, 코스, 날짜, 스코어를 입력한 뒤 기록으로 저장하세요.</p>
          <a href="/round"
            className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#06210f] transition hover:bg-accent-2">
            라운드 입력하기
          </a>
        </div>
      ) : (
        <div className="grid gap-3">
          {records.map((record) => (
            <article key={record.id} className="rounded-xl border border-line bg-panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-head text-2xl font-bold uppercase leading-tight text-txt">
                    {record.round?.course || "COURSE"}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-txt-soft">
                    <span>{record.round?.player || "PLAYER"}</span>
                    <span className="font-mono">{formatDate(record.round?.date)}</span>
                    <span className="text-txt-faint">저장 {formatSavedAt(record.savedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => openRecord(record)}
                    className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-[#06210f] transition hover:bg-accent-2">
                    불러오기
                  </button>
                  <button type="button" onClick={() => removeRecord(record.id)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:border-[#ff6b57] hover:text-[#ff6b57]">
                    삭제
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[12px]">
                <Badge label="SCORE" value={(record.summary?.thru || 0) > 0 ? record.summary.totalScore : "-"} />
                <Badge label="TO PAR" value={(record.summary?.thru || 0) > 0 ? toParLabel(record.summary.toPar) : "-"} />
                <Badge label="THRU" value={`${record.summary?.thru || 0}/18`} />
                <Badge label="PAR" value={record.summary?.totalPar || "-"} />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function completedLabel(value) {
  return value || "-";
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-txt">{value}</div>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <span className="rounded-md border border-line bg-panel-2 px-2 py-1">
      <span className="mr-1 text-txt-faint">{label}</span>
      <b className="text-txt">{value}</b>
    </span>
  );
}
