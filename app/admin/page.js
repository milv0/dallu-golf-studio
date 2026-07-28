"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { COURSE_DIRECTORY } from "../../lib/courseDirectory";
import { loadDb, saveDb } from "../../lib/nineStore";
import { fetchDb, pushDb, verifyAdminToken } from "../../lib/api";
import { effectiveDb } from "../../lib/coursesDb";

const DEFAULT9 = () => Array(9).fill("4");
const sum = (a) => a.reduce((s, x) => s + (Number(x) || 0), 0);

// 나인 한 행 (모듈 최상위 정의 — Admin 내부에 두면 리렌더마다 remount되어 입력 포커스가 풀림)
const PAR_COLOR = { 3: "text-[#7fd1ff]", 4: "text-txt", 5: "text-[#ffd27f]" };
function NineRow({ n, pars, onName, onPar, onDel, isNew, isEditing, onEdit, onDone }) {
  const total = sum(pars);
  const bad = total !== 36;
  const canEdit = isNew || isEditing;
  const setByPos = (e, i) => {
    if (!canEdit) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    onPar(i, rx < 0.38 ? "3" : rx > 0.62 ? "5" : "4");
  };
  return (
    <div className="flex items-center gap-2 border-t border-line px-3 py-2 first:border-t-0">
      {isNew ? (
        <input value={n} onChange={(e) => onName(e.target.value)} placeholder="새 코스명"
          className="w-28 shrink-0 rounded border border-dashed border-line-2 bg-panel-2 px-2 py-1.5 text-sm text-txt outline-none focus:border-accent" />
      ) : isEditing ? (
        <input key={n} defaultValue={n} onBlur={(e) => onName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-28 shrink-0 rounded border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-txt outline-none hover:border-line focus:border-accent focus:bg-panel-2" />
      ) : (
        <div className="w-28 shrink-0 truncate rounded border border-transparent px-2 py-1.5 text-sm font-semibold text-txt">
          {n}
        </div>
      )}
      <div className="grid flex-1 grid-cols-9 gap-1">
        {pars.map((p, i) => (
          <button key={i} type="button" onClick={(e) => setByPos(e, i)}
            disabled={!canEdit}
            title={canEdit ? "왼쪽=3 · 가운데=4 · 오른쪽=5" : "Edit을 누르면 수정할 수 있습니다"}
            className={"select-none rounded bg-panel py-1.5 text-center font-mono text-sm font-bold outline-none transition " +
              (canEdit ? "hover:ring-2 hover:ring-accent focus:ring-2 focus:ring-accent " : "cursor-default opacity-75 ") +
              (PAR_COLOR[Number(p)] || "text-txt")}>
            {p || "–"}
          </button>
        ))}
      </div>
      <span className={"w-12 shrink-0 text-center font-mono text-xs " + (bad ? "text-[#ffb648]" : "text-txt-faint")} title="9홀 합(기대 36)">
        {total}{bad ? "⚠" : ""}
      </span>
      {isNew ? (
        <button onClick={onDel} className="w-24 shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-[#06210f] hover:bg-accent-2">추가</button>
      ) : (
        <div className="flex w-24 shrink-0 items-center justify-end gap-1">
          <button onClick={isEditing ? onDone : onEdit}
            className={"rounded-md px-2 py-1.5 text-[11px] font-semibold transition " +
              (isEditing ? "bg-accent text-[#06210f] hover:bg-accent-2" : "border border-line text-txt-soft hover:border-accent hover:text-txt")}>
            {isEditing ? "완료" : "Edit"}
          </button>
          <button onClick={onDel} className="rounded-md border border-line px-2 py-1.5 text-[11px] font-semibold text-txt-soft hover:border-[#ff6b57] hover:text-[#ff6b57]">삭제</button>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [db, setDb] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [conn, setConn] = useState({ state: "loading", at: null });
  const [adminReady, setAdminReady] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authToken, setAuthToken] = useState("");
  const [authError, setAuthError] = useState("");

  const [region, setRegion] = useState("");
  const [q, setQ] = useState("");
  const [club, setClub] = useState("");

  const [newNine, setNewNine] = useState("");
  const [newPars, setNewPars] = useState(DEFAULT9());
  const [cOut, setCOut] = useState("");
  const [cIn, setCIn] = useState("");
  const [editingNine, setEditingNine] = useState("");

  const authenticate = async (token, { silent = false } = {}) => {
    const nextToken = String(token || "").trim();
    if (!nextToken) {
      setAuthChecking(false);
      if (!silent) setAuthError("관리자 토큰을 입력하세요.");
      return;
    }
    setAuthChecking(true);
    setAuthError("");
    try {
      await verifyAdminToken(nextToken);
      localStorage.setItem("sc-admin-token", nextToken);
      sessionStorage.setItem("sc-admin-ok", "1");
      setAdminReady(true);
    } catch (e) {
      sessionStorage.removeItem("sc-admin-ok");
      setAdminReady(false);
      if (!silent) setAuthError(e.message || "관리자 인증 실패");
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("sc-admin-token") || "";
    setAuthToken(stored);
    if (sessionStorage.getItem("sc-admin-ok") === "1" && stored) {
      authenticate(stored, { silent: true });
    } else {
      setAuthChecking(false);
    }
  }, []);

  const reload = async () => {
    setConn((c) => ({ ...c, state: "loading" }));
    try {
      const remote = await fetchDb();
      setDb(effectiveDb(remote)); saveDb(remote);
      setDirty(false);
      setConn({ state: "online", at: new Date() });
    } catch {
      setDb(effectiveDb(loadDb()));
      setConn({ state: "offline", at: new Date() });
    }
  };
  useEffect(() => { if (adminReady) reload(); }, [adminReady]);
  const persist = (next) => { setDb(next); saveDb(next); setDirty(true); };
  const saveAll = async () => {
    setSyncing(true);
    try {
      let token = localStorage.getItem("sc-admin-token") || "";
      try { await pushDb(db, token); }
      catch (e) {
        if (String(e.message).includes("인증")) {
          token = prompt("관리자 토큰(ADMIN_TOKEN)") || "";
          localStorage.setItem("sc-admin-token", token);
          await pushDb(db, token);
        } else throw e;
      }
      setDirty(false);
      setConn({ state: "online", at: new Date() });
      alert("KV에 저장 완료 — 모든 사용자에게 반영됩니다");
    } catch (e) { alert("서버 저장 실패(로컬엔 저장됨): " + e.message); }
    finally { setSyncing(false); }
  };

  const regions = useMemo(() => [...new Set(COURSE_DIRECTORY.map((c) => c.region))].sort(), []);
  const holesByClub = useMemo(() => {
    const m = {};
    for (const c of COURSE_DIRECTORY) m[c.name] = c.holes;
    return m;
  }, []);
  const clubsWithNines = useMemo(() => Object.keys(db), [db]);
  const enteredClubs = useMemo(() => new Set(Object.keys(db)), [db]);
  const nineCount = useMemo(() => Object.values(db).reduce((s, c) => s + Object.keys(c.nines || {}).length, 0), [db]);
  const comboCount = useMemo(() => Object.values(db).reduce((s, c) => s + (c.combos || []).length, 0), [db]);
  // 완성도: 나인 개수(홀수 대비) 충족 + (나인 2개↑일 때만) 제공 조합 필요.
  // 9홀 구장(나인 1개)은 조합 개념이 없으므로 조합 없이도 완비.
  const clubStatus = (name) => {
    const c = db[name];
    if (!c) return "none";
    const nineN = Object.keys(c.nines || {}).length;
    const comboN = (c.combos || []).length;
    if (nineN === 0 && comboN === 0) return "none";
    const dirName = c.orig || name;   // 이름 바꿨어도 원본 디렉토리명으로 홀수 판정
    const exp = holesByClub[dirName] ? Math.round(holesByClub[dirName] / 9) : null;
    const okNines = exp == null ? nineN > 0 : nineN === exp;
    const needCombo = nineN >= 2;     // 나인 1개(9홀)면 조합 불필요
    return okNines && (!needCombo || comboN > 0) ? "complete" : "incomplete";
  };
  // 원본 디렉토리명 → 사용자가 바꾼 이름(별칭)
  const aliasByOrig = useMemo(() => {
    const m = {};
    for (const [k, c] of Object.entries(db)) if (c && c.orig) m[c.orig] = k;
    return m;
  }, [db]);

  const filtered = useMemo(() => {
    const kw = q.trim();
    return COURSE_DIRECTORY.filter((c) => {
      if (region && c.region !== region) return false;
      if (!kw) return true;
      const alias = aliasByOrig[c.name];
      return c.name.includes(kw) || (alias && alias.includes(kw));   // 원본명·별칭 둘 다 검색
    }).slice(0, 400);
  }, [region, q, aliasByOrig]);
  // 디렉토리에도 없고 별칭(orig)도 아닌 = 순수 직접 추가한 골프장
  const dbOnly = useMemo(() => {
    const kw = q.trim();
    const dir = new Set(COURSE_DIRECTORY.map((c) => c.name));
    return Object.keys(db).filter((c) => !dir.has(c) && !(db[c] && db[c].orig) && (!kw || c.includes(kw)));
  }, [db, q]);

  const selClub = club.trim();
  useEffect(() => { setEditingNine(""); }, [selClub]);
  const cur = db[selClub] || { nines: {}, combos: [] };
  const nines = Object.entries(cur.nines || {}).map(([nine, pars]) => ({ nine, pars }));
  const combos = cur.combos || [];
  // 홀 수(디렉토리) 대비 나인 개수 검증: 27홀=3나인, 36홀=4나인, 18홀=2나인
  const expectedHoles = holesByClub[cur.orig || selClub] || null;
  const expectedNines = expectedHoles ? Math.round(expectedHoles / 9) : null;
  const nineMismatch = expectedNines != null && nines.length !== expectedNines;

  // ---- 나인 편집 (인라인) ----
  const writeClub = (nextNines, nextCombos) =>
    persist({ ...db, [selClub]: { ...(db[selClub] || {}), nines: nextNines, combos: nextCombos } });

  const updatePar = (nn, i, v) => {
    const arr = [...(cur.nines[nn] || DEFAULT9().map(Number))];
    arr[i] = Number(v) || 0;
    writeClub({ ...cur.nines, [nn]: arr }, combos);
  };
  const renameNine = (orig, next) => {
    const nn = (next || "").trim();
    if (!nn || nn === orig) return orig;
    if (cur.nines[nn]) { alert("이미 같은 이름의 코스가 있습니다"); return orig; }
    const nx = {};
    for (const k of Object.keys(cur.nines)) nx[k === orig ? nn : k] = cur.nines[k];
    const nc = combos.map((x) => ({ out: x.out === orig ? nn : x.out, in: x.in === orig ? nn : x.in }));
    writeClub(nx, nc);
    return nn;
  };
  const deleteNine = (nn) => {
    if (!confirm(`'${nn}' 코스를 삭제할까요?`)) return;
    const nx = { ...cur.nines }; delete nx[nn];
    const nc = combos.filter((x) => x.out !== nn && x.in !== nn);
    const next = { ...db };
    if (Object.keys(nx).length === 0 && nc.length === 0) delete next[selClub];
    else next[selClub] = { ...(db[selClub] || {}), nines: nx, combos: nc };
    if (editingNine === nn) setEditingNine("");
    persist(next);
  };
  const addNine = () => {
    const nn = newNine.trim();
    if (!nn) { alert("코스(나인) 이름을 입력하세요"); return; }
    if (cur.nines[nn]) { alert("이미 있는 코스 이름"); return; }
    writeClub({ ...cur.nines, [nn]: newPars.map((x) => Number(x) || 0) }, combos);
    setNewNine(""); setNewPars(DEFAULT9());
  };

  const addCombo = () => {
    if (!cOut || !cIn || cOut === cIn) { alert("서로 다른 전/후반 코스를 고르세요"); return; }
    if (combos.some((x) => x.out === cOut && x.in === cIn)) { alert("이미 있는 조합"); return; }
    writeClub(cur.nines, [{ out: cOut, in: cIn }, ...combos]);
    setCOut(""); setCIn("");
  };
  const removeCombo = (cb) => writeClub(cur.nines, combos.filter((x) => !(x.out === cb.out && x.in === cb.in)));

  const renameClub = () => {
    const nn = (prompt("골프장 이름 수정 (네이버식 등 친숙한 이름)", selClub) || "").trim();
    if (!nn || nn === selClub) return;
    if (db[nn]) { alert("이미 같은 이름의 골프장이 있습니다"); return; }
    const src = db[selClub] || { nines: {}, combos: [] };
    // 원본 디렉토리명 보존: 이미 별칭이면 기존 orig 유지, 아니면 현재(디렉토리)명을 orig로
    const orig = src.orig || (holesByClub[selClub] ? selClub : undefined);
    const next = {};
    for (const k of Object.keys(db)) if (k !== selClub) next[k] = db[k];
    next[nn] = orig ? { ...src, orig } : { ...src };
    persist(next); setClub(nn);
  };
  const deleteClub = () => {
    if (!confirm(`골프장 '${selClub}' 전체(나인·조합)를 삭제할까요?`)) return;
    const next = { ...db }; delete next[selClub]; persist(next); setClub("");
  };

  const backup = JSON.stringify(db);
  const importBackup = () => {
    const t = prompt("백업 JSON 붙여넣기"); if (!t) return;
    try { const d = JSON.parse(t); persist(d && typeof d === "object" ? d : {}); alert("가져오기 완료"); }
    catch { alert("JSON 파싱 실패"); }
  };
  const downloadSeed = () => {
    const qs = (s) => JSON.stringify(s ?? "");
    const clubs = Object.keys(db);
    let body = "";
    clubs.forEach((cl, ci) => {
      const c = db[cl];
      const nk = Object.keys(c.nines || {});
      const nl = nk.map((nn, i) => `      ${qs(nn)}: [${(c.nines[nn] || []).join(", ")}]${i < nk.length - 1 ? "," : ""}`).join("\n");
      const cb = (c.combos || []).map((x) => `{ "out": ${qs(x.out)}, "in": ${qs(x.in)} }`).join(", ");
      body += `  ${qs(cl)}: {\n    "nines": {\n${nl}\n    },\n    "combos": [${cb}]\n  }${ci < clubs.length - 1 ? "," : ""}\n`;
    });
    const text = "// 코스 시드 DB (nested) — lib/seedDb.js 교체 후 배포\nexport const SEED_DB = {\n" + body + "};\n";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    a.download = "seedDb.js"; a.click();
  };

  const ghost = "rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:border-line-2 hover:text-txt";

  if (!adminReady) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[520px] items-center px-6 py-12">
        <form onSubmit={(e) => { e.preventDefault(); authenticate(authToken); }}
          className="w-full rounded-xl border border-line bg-panel p-6">
          <div className="font-head text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Admin</div>
          <h1 className="mt-1 font-head text-2xl font-bold text-txt">관리자 인증</h1>
          <p className="mt-2 text-sm text-txt-soft">코스 관리 화면은 관리자 토큰 확인 후 표시됩니다.</p>
          <label className="mt-5 block">
            <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">ADMIN TOKEN</span>
            <input type="password" value={authToken} onChange={(e) => setAuthToken(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
          </label>
          {authError && <div className="mt-2 text-sm font-semibold text-[#ff6b57]">{authError}</div>}
          <div className="mt-5 flex items-center justify-between gap-3">
            <Link href="/" className={ghost}>← 메인</Link>
            <button type="submit" disabled={authChecking}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60">
              {authChecking ? "확인 중..." : "관리자 화면 열기"}
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-16">
      <div className="sticky top-0 z-40 -mx-6 mb-6 border-b border-line bg-bg/85 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-head text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Admin · Course DB</div>
            <h1 className="font-head text-2xl font-bold leading-tight text-txt">코스 DB 관리</h1>
            <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-txt-faint">
              <button onClick={reload} title="KV 새로고침" className="flex items-center gap-1.5 rounded border border-line px-2 py-0.5 hover:text-txt">
                <span className={"inline-block h-2 w-2 rounded-full " +
                  (conn.state === "online" ? "bg-accent" : conn.state === "offline" ? "bg-[#ffb648]" : "bg-txt-faint animate-pulse")} />
                {conn.state === "online" ? "KV 연결됨" : conn.state === "offline" ? "오프라인" : "연결 중…"}
                {conn.at && conn.state !== "loading" ? " · " + conn.at.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
                <span className="text-txt-faint">↻</span>
              </button>
              <span>골프장 {clubsWithNines.length} · 나인 {nineCount} · 조합 {comboCount}</span>
              <span className={dirty ? "text-[#ffb648]" : "text-accent"}>· {syncing ? "저장 중…" : dirty ? "⚠ 미저장" : "동기화됨"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={saveAll} disabled={syncing}
              className={"rounded-lg px-4 py-2 text-sm font-bold transition disabled:opacity-60 " + (dirty ? "bg-accent text-[#06210f] hover:bg-accent-2" : "border border-line text-txt-soft")}>
              {syncing ? "저장 중…" : "KV 저장"}
            </button>
            <details className="relative">
              <summary className={ghost + " list-none"}>⋯</summary>
              <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-line bg-panel p-1 shadow-lg">
                <button onClick={downloadSeed} className="block w-full rounded px-3 py-2 text-left text-sm text-txt hover:bg-panel-2">seedDb.js 다운로드</button>
                <button onClick={() => navigator.clipboard?.writeText(backup)} className="block w-full rounded px-3 py-2 text-left text-sm text-txt hover:bg-panel-2">백업 복사</button>
                <button onClick={importBackup} className="block w-full rounded px-3 py-2 text-left text-sm text-txt hover:bg-panel-2">백업 가져오기</button>
              </div>
            </details>
            <Link href="/" className={ghost}>← 메인</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* 골프장 목록 */}
        <section className="rounded-2xl border border-line bg-panel p-4">
          <div className="mb-3 flex gap-2">
            <select value={region} onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
              <option value="">전지역</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="골프장 검색"
              className="flex-1 rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
          </div>
          <div className="max-h-[64vh] overflow-auto rounded-xl border border-line">
            {dbOnly.length > 0 && (
              <div className="border-b border-line-2 bg-panel-2/60">
                <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">직접 추가한 골프장</div>
                {dbOnly.map((cl) => {
                  const st = clubStatus(cl);
                  return (
                    <button key={"o-" + cl} type="button" onClick={() => setClub(cl)}
                      className={"flex w-full items-center justify-between border-b border-line px-3 py-2 text-left transition " + (selClub === cl ? "bg-accent/15" : "hover:bg-panel-2")}>
                      <span className="flex items-center gap-1.5 text-sm text-txt">
                        <span className={"flex h-4 w-4 items-center justify-center rounded-full text-[10px] " +
                          (st === "incomplete" ? "bg-[#ffb648] text-[#2a1a00]" : "bg-accent text-[#06210f]")}>
                          {st === "incomplete" ? "!" : "✓"}
                        </span>{cl}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {filtered.map((c) => {
              const alias = aliasByOrig[c.name];
              const key = alias || c.name;              // 별칭 있으면 그게 DB 키/표시명
              const st = clubStatus(key);
              const done = st !== "none";
              const active = selClub === key;
              return (
                <button key={c.name + c.address} type="button" onClick={() => setClub(key)}
                  className={"flex w-full items-center justify-between border-b border-line px-3 py-2 text-left last:border-0 transition " + (active ? "bg-accent/15" : done ? "bg-accent/[0.06] hover:bg-accent/10" : "hover:bg-panel-2")}>
                  <span className={"flex min-w-0 items-center gap-1.5 text-sm " + (done ? "text-txt" : "text-txt-soft")}>
                    <span className={"flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] " +
                      (st === "complete" ? "bg-accent text-[#06210f]" : st === "incomplete" ? "bg-[#ffb648] text-[#2a1a00]" : "border border-line-2 text-transparent")}>
                      {st === "incomplete" ? "!" : "✓"}
                    </span>
                    <span className="truncate">{key}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-txt-faint">{c.region}·{c.holes}H</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          {!selClub ? (
            <div className="rounded-2xl border border-dashed border-line-2 bg-panel/50 p-10 text-center">
              <div className="mb-2 text-3xl">⛳</div>
              <p className="text-sm text-txt-soft">좌측에서 <b className="text-txt">골프장을 선택</b>하면 편집을 시작합니다.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-col">
                  <h2 className="font-head text-xl font-bold leading-tight text-txt">{selClub}</h2>
                  {cur.orig && <span className="font-mono text-[11px] text-txt-faint">문체부 원본: {cur.orig}</span>}
                </div>
                {(() => { const st = clubStatus(selClub); return (
                  <span className={"flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold " +
                    (st === "complete" ? "bg-accent/20 text-accent" : "bg-[#ffb648]/20 text-[#ffb648]")}>
                    {st === "complete" ? "✓ 완비" : "! 미완성"}
                  </span>
                ); })()}
                <button onClick={renameClub} className={ghost}>이름 수정</button>
                <button onClick={deleteClub} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-txt-soft hover:border-[#ff6b57] hover:text-[#ff6b57]">골프장 삭제</button>
                <button onClick={() => setClub("")} className="ml-auto text-[12px] text-txt-faint hover:text-txt">다른 골프장</button>
              </div>

              {/* 나인 (인라인 편집 테이블) */}
              <div className="rounded-2xl border border-line bg-panel p-0">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
                    나인 (9홀 코스)
                    {expectedNines != null && (
                      <span className={"ml-2 font-mono text-[11px] normal-case tracking-normal " + (nineMismatch ? "text-[#ffb648]" : "text-accent")}>
                        {nines.length}/{expectedNines}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[11px] text-txt-faint">기존 코스는 Edit 후 수정 · PAR 칸 클릭: 왼쪽3·중간4·오른쪽5</span>
                </div>
                {nineMismatch && (
                  <div className="border-b border-line bg-[#ffb648]/10 px-4 py-2 text-[12px] text-[#ffb648]">
                    ⚠ 이 골프장은 <b>{expectedHoles}홀</b>이라 나인이 <b>{expectedNines}개</b> 필요한데 현재 <b>{nines.length}개</b>입니다.
                    {nines.length < expectedNines ? ` ${expectedNines - nines.length}개 더 추가하세요.` : " 초과된 코스를 확인하세요."}
                  </div>
                )}
                {/* 홀 헤더 */}
                <div className="flex items-center gap-2 px-3 py-1.5 text-txt-faint">
                  <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-widest">코스</span>
                  <div className="grid flex-1 grid-cols-9 gap-1 text-center font-mono text-[10px]">
                    {Array.from({ length: 9 }, (_, i) => <span key={i}>{i + 1}</span>)}
                  </div>
                  <span className="w-12 shrink-0 text-center font-mono text-[10px]">합</span>
                  <span className="w-24 shrink-0" />
                </div>
                {nines.length === 0 && <p className="px-4 py-3 font-mono text-[12px] text-txt-faint">아직 코스가 없습니다. 아래에서 추가하세요.</p>}
                {nines.map((n) => (
                  <NineRow key={n.nine} n={n.nine} pars={n.pars.map(String)}
                    isEditing={editingNine === n.nine}
                    onEdit={() => setEditingNine(n.nine)}
                    onDone={() => setEditingNine("")}
                    onName={(v) => {
                      const nextName = renameNine(n.nine, v);
                      if (nextName) setEditingNine(nextName);
                    }}
                    onPar={(i, v) => updatePar(n.nine, i, v)}
                    onDel={() => deleteNine(n.nine)} />
                ))}
                {/* 추가 행 */}
                <div className="border-t-2 border-dashed border-line-2 bg-panel-2/40">
                  <NineRow n={newNine} pars={newPars} isNew
                    onName={setNewNine} onPar={(i, v) => setNewPars((p) => p.map((x, idx) => (idx === i ? v : x)))} onDel={addNine} />
                </div>
              </div>

              {/* 조합 */}
              <div className="rounded-2xl border border-line bg-panel p-5">
                <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">제공 조합 (전/후반)</div>
                {nines.length < 2 ? (
                  <p className="font-mono text-[12px] text-txt-faint">9홀 구장은 전/후반 조합이 필요 없습니다. (나인 1개면 완비)</p>
                ) : (
                <>
                <div className="mb-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                  <select value={cOut} onChange={(e) => setCOut(e.target.value)} className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
                    <option value="">전반</option>
                    {nines.map((n) => <option key={n.nine} value={n.nine}>{n.nine}</option>)}
                  </select>
                  <select value={cIn} onChange={(e) => setCIn(e.target.value)} className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
                    <option value="">후반</option>
                    {nines.map((n) => <option key={n.nine} value={n.nine}>{n.nine}</option>)}
                  </select>
                  <button onClick={addCombo} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#06210f] hover:bg-accent-2">추가</button>
                </div>
                {combos.length === 0 ? (
                  <p className="font-mono text-[12px] text-txt-faint">정의된 조합 없음 — 추가하면 사용자에게 제공됩니다.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {combos.map((c, i) => {
                      const t = sum(cur.nines[c.out] || []) + sum(cur.nines[c.in] || []);
                      return (
                        <span key={i} className="flex items-center gap-2 rounded-full border border-line-2 bg-panel-2 py-1 pl-3 pr-1 text-[13px]">
                          <b className="text-txt">{c.out}+{c.in}</b>
                          <span className={"font-mono text-[11px] " + (t === 72 ? "text-txt-faint" : "text-[#ffb648]")}>{t}{t === 72 ? "" : "⚠"}</span>
                          <button onClick={() => removeCombo(c)} className="flex h-5 w-5 items-center justify-center rounded-full text-txt-faint hover:bg-line hover:text-txt">×</button>
                        </span>
                      );
                    })}
                  </div>
                )}
                </>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
