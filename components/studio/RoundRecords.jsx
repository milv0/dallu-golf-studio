"use client";

import { useEffect, useMemo, useState } from "react";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import { createRoundRecordRemote, deleteRoundRecordRemote, fetchRoundRecords } from "../../lib/api";
import { deleteRoundRecord, migrateLegacyRoundHistory } from "../../lib/roundHistory";
import { toParLabel } from "../../lib/score";
import StudioNav from "./StudioNav";

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
  const [currentUser, setCurrentUser] = useState(null);
  const [source, setSource] = useState("local");

  useEffect(() => {
    const user = loadCurrentUser();
    setCurrentUser(user);
    if (!user) return;

    const local = migrateLegacyRoundHistory(user);
    fetchRoundRecords(user)
      .then(async (remote) => {
        if (remote.length === 0 && local.length > 0) {
          const uploaded = [];
          for (const record of local) {
            try { uploaded.push(await createRoundRecordRemote(user, record.round)); }
            catch {}
          }
          if (uploaded.length > 0) {
            setRecords(uploaded);
            setSource("server");
            return;
          }
        }
        setRecords(remote.length > 0 ? remote : local);
        setSource(remote.length > 0 ? "server" : "local");
      })
      .catch(() => {
        setRecords(local);
        setSource("local");
      });
  }, []);

  const stats = useMemo(() => {
    const completed = records.filter((record) => (record.summary?.thru || 0) >= 18).length;
    const best = records
      .filter((record) => (record.summary?.thru || 0) > 0)
      .map((record) => record.summary.toPar)
      .sort((a, b) => a - b)[0];
    return { completed, best };
  }, [records]);

  const openRecord = (record) => {
    window.localStorage.setItem("sc-round", JSON.stringify(record.round));
    window.location.href = "/score-18";
  };

  const removeRecord = (id) => {
    if (!window.confirm("이 라운딩 기록을 삭제할까요?")) return;
    deleteRoundRecordRemote(currentUser, id)
      .then(() => setRecords((prev) => prev.filter((record) => record.id !== id)))
      .catch(() => setRecords(deleteRoundRecord(id, currentUser)));
  };

  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    setRecords([]);
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
          {currentUser && (
            <p className="mt-1 text-xs text-txt-faint">
              저장 위치: {source === "server" ? "Cloudflare DB" : "이 브라우저"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-txt-soft">
              <span className="text-txt">{currentUser.name || currentUser.email}</span>
              <button type="button" onClick={logout} className="ml-2 text-txt-faint transition hover:text-txt">로그아웃</button>
            </div>
          ) : null}
          <a href="/score-18"
            className="rounded-lg bg-accent px-4 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2">
            18홀 입력
          </a>
        </div>
      </div>

      <StudioNav active="records" currentUser={currentUser} />

      {!currentUser ? (
        <div className="rounded-xl border border-line bg-panel p-8 text-center">
          <div className="font-head text-2xl font-bold text-txt">내 라운딩 준비 중</div>
          <p className="mt-2 text-sm text-txt-soft">사용자 인증과 기록 저장 기능은 정식 인증 구조를 붙이기 전까지 닫아두었습니다.</p>
          <button type="button" disabled
            className="mt-5 inline-flex cursor-not-allowed rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm font-bold text-txt-faint opacity-70">
            로그인 준비 중
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <Stat label="저장 라운드" value={records.length} />
            <Stat label="완주 라운드" value={completedLabel(stats.completed)} />
            <Stat label="베스트" value={stats.best == null ? "-" : toParLabel(stats.best)} />
          </div>

          {records.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-8 text-center">
          <div className="font-head text-2xl font-bold text-txt">저장된 라운딩이 없습니다</div>
          <p className="mt-2 text-sm text-txt-soft">18홀 스코어에서 선수, 코스, 날짜, 스코어를 입력한 뒤 기록으로 저장하세요.</p>
          <a href="/score-18"
            className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#06210f] transition hover:bg-accent-2">
            18홀 입력하기
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
        </>
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
