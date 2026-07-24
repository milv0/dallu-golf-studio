"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { COURSE_DIRECTORY } from "../../lib/courseDirectory";
import { loadDb, saveDb } from "../../lib/nineStore";
import { fetchDb, pushDb } from "../../lib/api";
import { mergeDb, SEED_DB } from "../../lib/coursesDb";

const DEFAULT9 = () => Array(9).fill("4");

export default function Admin() {
  const [db, setDb] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [region, setRegion] = useState("");
  const [q, setQ] = useState("");

  const [club, setClub] = useState("");
  const [nine, setNine] = useState("");
  const [pars, setPars] = useState(DEFAULT9());
  const [editingNine, setEditingNine] = useState(null); // 수정 중인 원래 나인명
  const parRefs = useRef([]);
  const editorRef = useRef(null);

  const [cOut, setCOut] = useState("");
  const [cIn, setCIn] = useState("");

  useEffect(() => {
    (async () => {
      let remote;
      try { remote = await fetchDb(); } catch { remote = loadDb(); }
      setDb(mergeDb(SEED_DB, remote));
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
  const ninesOf = (cl) => Object.entries((db[cl] && db[cl].nines) || {}).map(([nine, pars]) => ({ nine, pars }));
  const combosOf = (cl) => (db[cl] && db[cl].combos) || [];

  const setPar = (i, v) => setPars((p) => p.map((x, idx) => (idx === i ? v : x)));
  const onParKey = (e, i) => { if (e.key === "Enter") { e.preventDefault(); parRefs.current[i + 1]?.focus(); } };
  const focusEditor = () => { editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); parRefs.current[0]?.focus(); };

  const resetEditor = () => { setNine(""); setPars(DEFAULT9()); setEditingNine(null); };

  const saveNine = () => {
    const cl = club.trim(), nn = nine.trim();
    if (!cl || !nn) { alert("골프장과 코스(나인) 이름을 입력하세요"); return; }
    const c = db[cl] || { nines: {}, combos: [] };
    const nines = { ...c.nines };
    let combos = [...(c.combos || [])];
    if (editingNine && editingNine !== nn) {   // 이름 변경 → 이전 나인 제거 + 조합 갱신
      delete nines[editingNine];
      combos = combos.map((x) => ({ out: x.out === editingNine ? nn : x.out, in: x.in === editingNine ? nn : x.in }));
    }
    nines[nn] = pars.map((x) => Number(x) || 0);
    persist({ ...db, [cl]: { nines, combos } });
    resetEditor();
  };
  const removeNine = (cl, nn) => {
    if (!confirm(`${cl} / ${nn} 삭제?`)) return;
    const c = db[cl]; if (!c) return;
    const nines = { ...c.nines }; delete nines[nn];
    const combos = (c.combos || []).filter((x) => x.out !== nn && x.in !== nn);
    const next = { ...db };
    if (Object.keys(nines).length === 0 && combos.length === 0) delete next[cl];
    else next[cl] = { nines, combos };
    persist(next);
    if (editingNine === nn) resetEditor();
  };
  const editNine = (cl, nn) => {
    const pars9 = db[cl] && db[cl].nines && db[cl].nines[nn];
    if (!pars9) return;
    setClub(cl); setNine(nn); setPars(pars9.map(String)); setEditingNine(nn);
    focusEditor();
  };
  const renameClub = () => {
    const cur = club.trim(); if (!cur) return;
    const nn = (prompt("골프장 이름 수정", cur) || "").trim();
    if (!nn || nn === cur) return;
    if (db[nn]) { alert("이미 같은 이름의 골프장이 있습니다"); return; }
    const next = {};
    for (const k of Object.keys(db)) next[k === cur ? nn : k] = db[k];
    if (!next[nn] && db[cur]) next[nn] = db[cur];
    persist(next);
    setClub(nn); resetEditor();
  };

  const addCombo = () => {
    const cl = club.trim();
    if (!cl || !cOut || !cIn || cOut === cIn) { alert("골프장을 선택하고 서로 다른 전/후반 코스를 고르세요"); return; }
    const c = db[cl] || { nines: {}, combos: [] };
    if ((c.combos || []).some((x) => x.out === cOut && x.in === cIn)) { alert("이미 있는 조합"); return; }
    persist({ ...db, [cl]: { nines: c.nines || {}, combos: [{ out: cOut, in: cIn }, ...(c.combos || [])] } });
    setCOut(""); setCIn("");
  };
  const removeCombo = (cl, cb) => {
    const c = db[cl]; if (!c) return;
    persist({ ...db, [cl]: { nines: c.nines || {}, combos: (c.combos || []).filter((x) => !(x.out === cb.out && x.in === cb.in)) } });
  };

  const total = pars.reduce((a, b) => a + (Number(b) || 0), 0);
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

  const selClub = club.trim();
  const btnGhost = "rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:border-line-2 hover:text-txt";

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-16">
      {/* 스티키 헤더 */}
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
              className={"rounded-lg px-4 py-2 text-sm font-bold transition disabled:opacity-60 " +
                (dirty ? "bg-accent text-[#06210f] hover:bg-accent-2" : "border border-line text-txt-soft")}>
              {syncing ? "저장 중…" : "KV 저장"}
            </button>
            <details className="relative">
              <summary className={btnGhost + " list-none"}>⋯</summary>
              <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-line bg-panel p-1 shadow-lg">
                <button onClick={downloadSeed} className="block w-full rounded px-3 py-2 text-left text-sm text-txt hover:bg-panel-2">seedDb.js 다운로드</button>
                <button onClick={() => navigator.clipboard?.writeText(backup)} className="block w-full rounded px-3 py-2 text-left text-sm text-txt hover:bg-panel-2">백업 복사</button>
                <button onClick={importBackup} className="block w-full rounded px-3 py-2 text-left text-sm text-txt hover:bg-panel-2">백업 가져오기</button>
              </div>
            </details>
            <Link href="/" className={btnGhost}>← 메인</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* 골프장 디렉토리 */}
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
                {dbOnly.map((cl) => {
                  const active = selClub === cl;
                  return (
                    <button key={"dbonly-" + cl} type="button" onClick={() => { setClub(cl); resetEditor(); }}
                      className={"flex w-full items-center justify-between border-b border-line px-3 py-2 text-left transition " + (active ? "bg-accent/15" : "hover:bg-panel-2")}>
                      <span className="flex items-center gap-1.5 text-sm text-txt">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] text-[#06210f]">✓</span>
                        {cl}
                      </span>
                      <span className="font-mono text-[10px] text-txt-faint">custom</span>
                    </button>
                  );
                })}
              </div>
            )}
            {filtered.map((c) => {
              const done = enteredClubs.has(c.name);
              const active = selClub === c.name;
              return (
                <button key={c.name + c.address} type="button" onClick={() => { setClub(c.name); resetEditor(); }}
                  className={"flex w-full items-center justify-between border-b border-line px-3 py-2 text-left last:border-0 transition " +
                    (active ? "bg-accent/15" : done ? "bg-accent/[0.06] hover:bg-accent/10" : "hover:bg-panel-2")}>
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
              {/* 선택된 골프장 */}
              <div className="flex items-center gap-2">
                <h2 className="font-head text-xl font-bold text-txt">{selClub}</h2>
                <button onClick={renameClub} className="rounded-md border border-line px-2 py-1 text-[11px] font-semibold text-txt-soft hover:border-accent hover:text-txt">이름 수정</button>
                <button onClick={() => { setClub(""); resetEditor(); }} className="text-[12px] text-txt-faint hover:text-txt">변경</button>
              </div>

              {/* ① 나인 입력 */}
              <div ref={editorRef} className="rounded-2xl border border-line bg-panel p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-[#06210f]">1</span>
                  <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">나인(9홀) PAR</span>
                  {editingNine && <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[11px] text-[#ffb648]">수정 중: {editingNine}</span>}
                </div>
                <input value={nine} onChange={(e) => setNine(e.target.value)} placeholder="코스(나인) 이름 · 예: LAKE"
                  className="mb-3 w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
                <div className="grid grid-cols-9 gap-1.5">
                  {pars.map((p, i) => (
                    <div key={i} className="rounded-lg border border-line bg-panel-2 p-1 text-center">
                      <div className="mb-1 font-mono text-[10px] text-txt-faint">{i + 1}</div>
                      <input ref={(el) => (parRefs.current[i] = el)} value={p} inputMode="numeric" maxLength={1}
                        onChange={(e) => setPar(i, e.target.value.replace(/[^0-9]/g, ""))}
                        onKeyDown={(e) => onParKey(e, i)} onFocus={(e) => e.target.select()}
                        className="w-full rounded bg-panel py-2 text-center font-mono text-lg font-bold text-txt outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-sm text-txt-soft">합 <b className="text-txt">{total}</b></span>
                  <div className="flex gap-2">
                    {editingNine && <button onClick={resetEditor} className={btnGhost}>취소</button>}
                    <button onClick={saveNine} className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-[#06210f] hover:bg-accent-2">
                      {editingNine ? "수정 저장" : "나인 추가"}
                    </button>
                  </div>
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-txt-faint">숫자 입력 → Tab/Enter로 다음 홀</p>
              </div>

              {/* 저장된 코스 (스코어카드) */}
              {ninesOf(selClub).length > 0 && (
                <div className="rounded-2xl border border-line bg-panel p-5">
                  <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">저장된 코스</div>
                  <div className="space-y-2">
                    {ninesOf(selClub).map((n) => (
                      <div key={n.nine} className="overflow-hidden rounded-xl border border-line">
                        <div className="flex items-center justify-between bg-panel-2 px-3 py-1.5">
                          <span className="text-sm font-semibold text-txt">{n.nine} <span className="font-mono text-[11px] text-txt-faint">· 합 {n.pars.reduce((a, b) => a + b, 0)}</span></span>
                          <div className="flex gap-1">
                            <button onClick={() => editNine(selClub, n.nine)} className="rounded-md border border-line px-2 py-1 text-[11px] font-semibold text-txt-soft hover:border-accent hover:text-txt">수정</button>
                            <button onClick={() => removeNine(selClub, n.nine)} className="rounded-md border border-line px-2 py-1 text-[11px] font-semibold text-txt-soft hover:border-[#ff6b57] hover:text-[#ff6b57]">삭제</button>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-center">
                            <tbody>
                              <tr>
                                <td className="px-2 py-1 font-mono text-[10px] text-txt-faint">홀</td>
                                {n.pars.map((_, i) => <td key={i} className="border-l border-line px-2 py-1 font-mono text-[11px] text-txt-faint">{i + 1}</td>)}
                              </tr>
                              <tr className="border-t border-line">
                                <td className="px-2 py-1 font-mono text-[10px] text-txt-faint">PAR</td>
                                {n.pars.map((p, i) => <td key={i} className="border-l border-line px-2 py-1 font-mono text-sm font-bold text-txt">{p}</td>)}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ② 조합 정의 */}
              <div className="rounded-2xl border border-line bg-panel p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-[#06210f]">2</span>
                  <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">제공 조합(전/후반)</span>
                </div>
                <div className="mb-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                  <select value={cOut} onChange={(e) => setCOut(e.target.value)}
                    className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
                    <option value="">전반</option>
                    {ninesOf(selClub).map((n) => <option key={n.nine} value={n.nine}>{n.nine}</option>)}
                  </select>
                  <select value={cIn} onChange={(e) => setCIn(e.target.value)}
                    className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
                    <option value="">후반</option>
                    {ninesOf(selClub).map((n) => <option key={n.nine} value={n.nine}>{n.nine}</option>)}
                  </select>
                  <button onClick={addCombo} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#06210f] hover:bg-accent-2">추가</button>
                </div>
                {combosOf(selClub).length === 0 ? (
                  <p className="font-mono text-[12px] text-txt-faint">정의된 조합 없음 — 추가하면 사용자에게 제공됩니다.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {combosOf(selClub).map((c, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full border border-line-2 bg-panel-2 py-1 pl-3 pr-1 text-[13px]">
                        <b className="text-txt">{c.out}+{c.in}</b>
                        <button onClick={() => removeCombo(selClub, c)} className="flex h-5 w-5 items-center justify-center rounded-full text-txt-faint hover:bg-line hover:text-txt">×</button>
                      </span>
                    ))}
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
