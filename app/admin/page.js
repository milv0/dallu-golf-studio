"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { COURSE_DIRECTORY } from "../../lib/courseDirectory";
import { loadDb, saveDb } from "../../lib/nineStore";
import { fetchDb, pushDb } from "../../lib/api";
import { mergeDb, effectiveDb, SEED_DB } from "../../lib/coursesDb";

const DEFAULT9 = () => Array(9).fill("4");
const sum = (a) => a.reduce((s, x) => s + (Number(x) || 0), 0);

export default function Admin() {
  const [db, setDb] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [region, setRegion] = useState("");
  const [q, setQ] = useState("");
  const [club, setClub] = useState("");

  const [newNine, setNewNine] = useState("");
  const [newPars, setNewPars] = useState(DEFAULT9());
  const [cOut, setCOut] = useState("");
  const [cIn, setCIn] = useState("");

  useEffect(() => {
    (async () => {
      let remote;
      try { remote = await fetchDb(); } catch { remote = loadDb(); }
      setDb(effectiveDb(remote));
    })();
  }, []);
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
      alert("KV에 저장 완료 — 모든 사용자에게 반영됩니다");
    } catch (e) { alert("서버 저장 실패(로컬엔 저장됨): " + e.message); }
    finally { setSyncing(false); }
  };

  const regions = useMemo(() => [...new Set(COURSE_DIRECTORY.map((c) => c.region))].sort(), []);
  const clubsWithNines = useMemo(() => Object.keys(db), [db]);
  const enteredClubs = useMemo(() => new Set(Object.keys(db)), [db]);
  const nineCount = useMemo(() => Object.values(db).reduce((s, c) => s + Object.keys(c.nines || {}).length, 0), [db]);
  const comboCount = useMemo(() => Object.values(db).reduce((s, c) => s + (c.combos || []).length, 0), [db]);
  const filtered = useMemo(() => {
    const kw = q.trim();
    return COURSE_DIRECTORY.filter((c) => (!region || c.region === region) && (!kw || c.name.includes(kw))).slice(0, 400);
  }, [region, q]);
  const dbOnly = useMemo(() => {
    const kw = q.trim();
    const dir = new Set(COURSE_DIRECTORY.map((c) => c.name));
    return clubsWithNines.filter((c) => !dir.has(c) && (!kw || c.includes(kw)));
  }, [clubsWithNines, q]);

  const selClub = club.trim();
  const cur = db[selClub] || { nines: {}, combos: [] };
  const nines = Object.entries(cur.nines || {}).map(([nine, pars]) => ({ nine, pars }));
  const combos = cur.combos || [];

  // ---- 나인 편집 (인라인) ----
  const writeClub = (nextNines, nextCombos) =>
    persist({ ...db, [selClub]: { nines: nextNines, combos: nextCombos } });

  const updatePar = (nn, i, v) => {
    const arr = [...(cur.nines[nn] || DEFAULT9().map(Number))];
    arr[i] = Number(v) || 0;
    writeClub({ ...cur.nines, [nn]: arr }, combos);
  };
  const renameNine = (orig, next) => {
    const nn = (next || "").trim();
    if (!nn || nn === orig) return;
    if (cur.nines[nn]) { alert("이미 같은 이름의 코스가 있습니다"); return; }
    const nx = {};
    for (const k of Object.keys(cur.nines)) nx[k === orig ? nn : k] = cur.nines[k];
    const nc = combos.map((x) => ({ out: x.out === orig ? nn : x.out, in: x.in === orig ? nn : x.in }));
    writeClub(nx, nc);
  };
  const deleteNine = (nn) => {
    if (!confirm(`'${nn}' 코스를 삭제할까요?`)) return;
    const nx = { ...cur.nines }; delete nx[nn];
    const nc = combos.filter((x) => x.out !== nn && x.in !== nn);
    const next = { ...db };
    if (Object.keys(nx).length === 0 && nc.length === 0) delete next[selClub];
    else next[selClub] = { nines: nx, combos: nc };
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
    const nn = (prompt("골프장 이름 수정", selClub) || "").trim();
    if (!nn || nn === selClub) return;
    if (db[nn]) { alert("이미 같은 이름의 골프장이 있습니다"); return; }
    const next = {};
    for (const k of Object.keys(db)) next[k === selClub ? nn : k] = db[k];
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
  const cell = "w-full rounded bg-panel py-1.5 text-center font-mono text-sm font-bold text-txt outline-none focus:ring-2 focus:ring-accent";

  const NineRow = ({ n, pars, onName, onPar, onDel, isNew }) => {
    const total = sum(pars);
    const bad = total !== 36;
    return (
      <div className="flex items-center gap-2 border-t border-line px-3 py-2 first:border-t-0">
        {isNew ? (
          <input value={n} onChange={(e) => onName(e.target.value)} placeholder="새 코스명"
            className="w-28 shrink-0 rounded border border-dashed border-line-2 bg-panel-2 px-2 py-1.5 text-sm text-txt outline-none focus:border-accent" />
        ) : (
          <input key={n} defaultValue={n} onBlur={(e) => onName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="w-28 shrink-0 rounded border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-txt outline-none hover:border-line focus:border-accent focus:bg-panel-2" />
        )}
        <div className="grid flex-1 grid-cols-9 gap-1">
          {pars.map((p, i) => (
            <input key={i} value={p} inputMode="numeric" maxLength={1}
              onChange={(e) => onPar(i, e.target.value.replace(/[^0-9]/g, ""))}
              onFocus={(e) => e.target.select()} className={cell} />
          ))}
        </div>
        <span className={"w-12 shrink-0 text-center font-mono text-xs " + (bad ? "text-[#ffb648]" : "text-txt-faint")} title="9홀 합(기대 36)">
          {total}{bad ? "⚠" : ""}
        </span>
        {isNew ? (
          <button onClick={onDel} className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-[#06210f] hover:bg-accent-2">추가</button>
        ) : (
          <button onClick={onDel} className="shrink-0 rounded-md border border-line px-2 py-1.5 text-[11px] font-semibold text-txt-soft hover:border-[#ff6b57] hover:text-[#ff6b57]">삭제</button>
        )}
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-16">
      <div className="sticky top-0 z-40 -mx-6 mb-6 border-b border-line bg-bg/85 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-head text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Admin · Course DB</div>
            <h1 className="font-head text-2xl font-bold leading-tight text-txt">코스 DB 관리</h1>
            <div className="mt-0.5 font-mono text-[11px] text-txt-faint">
              골프장 {clubsWithNines.length} · 나인 {nineCount} · 조합 {comboCount}
              <span className={dirty ? "text-[#ffb648]" : "text-accent"}> · {syncing ? "저장 중…" : dirty ? "⚠ 미저장" : "동기화됨"}</span>
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
                <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">내 DB (커스텀·변경됨)</div>
                {dbOnly.map((cl) => (
                  <button key={"o-" + cl} type="button" onClick={() => setClub(cl)}
                    className={"flex w-full items-center justify-between border-b border-line px-3 py-2 text-left transition " + (selClub === cl ? "bg-accent/15" : "hover:bg-panel-2")}>
                    <span className="flex items-center gap-1.5 text-sm text-txt"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-[#06210f]">✓</span>{cl}</span>
                    <span className="font-mono text-[10px] text-txt-faint">custom</span>
                  </button>
                ))}
              </div>
            )}
            {filtered.map((c) => {
              const done = enteredClubs.has(c.name);
              const active = selClub === c.name;
              return (
                <button key={c.name + c.address} type="button" onClick={() => setClub(c.name)}
                  className={"flex w-full items-center justify-between border-b border-line px-3 py-2 text-left last:border-0 transition " + (active ? "bg-accent/15" : done ? "bg-accent/[0.06] hover:bg-accent/10" : "hover:bg-panel-2")}>
                  <span className={"flex items-center gap-1.5 text-sm " + (done ? "text-txt" : "text-txt-soft")}>
                    <span className={"flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] " + (done ? "bg-accent text-[#06210f]" : "border border-line-2 text-transparent")}>✓</span>
                    {c.name}
                  </span>
                  <span className="font-mono text-[10px] text-txt-faint">{c.region}·{c.holes}H</span>
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
                <h2 className="font-head text-xl font-bold text-txt">{selClub}</h2>
                <button onClick={renameClub} className={ghost}>이름 수정</button>
                <button onClick={deleteClub} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-txt-soft hover:border-[#ff6b57] hover:text-[#ff6b57]">골프장 삭제</button>
                <button onClick={() => setClub("")} className="ml-auto text-[12px] text-txt-faint hover:text-txt">다른 골프장</button>
              </div>

              {/* 나인 (인라인 편집 테이블) */}
              <div className="rounded-2xl border border-line bg-panel p-0">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">나인 (9홀 코스)</span>
                  <span className="font-mono text-[11px] text-txt-faint">이름·PAR 직접 수정 · Enter 확정</span>
                </div>
                {/* 홀 헤더 */}
                <div className="flex items-center gap-2 px-3 py-1.5 text-txt-faint">
                  <span className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-widest">코스</span>
                  <div className="grid flex-1 grid-cols-9 gap-1 text-center font-mono text-[10px]">
                    {Array.from({ length: 9 }, (_, i) => <span key={i}>{i + 1}</span>)}
                  </div>
                  <span className="w-12 shrink-0 text-center font-mono text-[10px]">합</span>
                  <span className="w-12 shrink-0" />
                </div>
                {nines.length === 0 && <p className="px-4 py-3 font-mono text-[12px] text-txt-faint">아직 코스가 없습니다. 아래에서 추가하세요.</p>}
                {nines.map((n) => (
                  <NineRow key={n.nine} n={n.nine} pars={n.pars.map(String)}
                    onName={(v) => renameNine(n.nine, v)} onPar={(i, v) => updatePar(n.nine, i, v)} onDel={() => deleteNine(n.nine)} />
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
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
