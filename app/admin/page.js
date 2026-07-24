"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { COURSE_DIRECTORY } from "../../lib/courseDirectory";
import { loadDb, saveDb } from "../../lib/nineStore";

const DEFAULT9 = () => Array(9).fill("4");

export default function Admin() {
  const [db, setDb] = useState({ nines: [], combos: [] });
  useEffect(() => { setDb(loadDb()); }, []);
  const persist = (next) => { setDb(next); saveDb(next); };

  // 디렉토리 검색
  const [region, setRegion] = useState("");
  const [q, setQ] = useState("");

  // 나인 입력
  const [club, setClub] = useState("");
  const [nine, setNine] = useState("");
  const [pars, setPars] = useState(DEFAULT9());
  const parRefs = useRef([]);

  // 조합 입력
  const [cClub, setCClub] = useState("");
  const [cOut, setCOut] = useState("");
  const [cIn, setCIn] = useState("");

  const regions = useMemo(() => [...new Set(COURSE_DIRECTORY.map((c) => c.region))].sort(), []);
  const clubsWithNines = useMemo(() => [...new Set(db.nines.map((n) => n.club))], [db.nines]);
  const enteredClubs = useMemo(() => new Set(db.nines.map((n) => n.club)), [db.nines]);
  const filtered = useMemo(() => {
    const kw = q.trim();
    return COURSE_DIRECTORY.filter((c) => (!region || c.region === region) && (!kw || c.name.includes(kw))).slice(0, 400);
  }, [region, q]);
  const ninesOf = (cl) => db.nines.filter((n) => n.club === cl);

  const setPar = (i, v) => setPars((p) => p.map((x, idx) => (idx === i ? v : x)));
  const onParKey = (e, i) => {
    if (e.key === "Enter") { e.preventDefault(); parRefs.current[i + 1]?.focus(); }
  };

  const saveNine = () => {
    if (!club.trim() || !nine.trim()) { alert("골프장과 코스(나인) 이름을 입력하세요"); return; }
    const entry = { club: club.trim(), nine: nine.trim(), pars: pars.map((x) => Number(x) || 0) };
    const next = { ...db, nines: [entry, ...db.nines.filter((n) => !(n.club === entry.club && n.nine === entry.nine))] };
    persist(next);
    setNine(""); setPars(DEFAULT9());
  };
  const removeNine = (cl, nn) => persist({
    ...db,
    nines: db.nines.filter((n) => !(n.club === cl && n.nine === nn)),
    combos: db.combos.filter((c) => !(c.club === cl && (c.out === nn || c.in === nn))),
  });
  const loadNine = (cl, nn) => {
    const n = db.nines.find((x) => x.club === cl && x.nine === nn);
    if (!n) return;
    setClub(cl); setNine(nn); setPars(n.pars.map(String));
  };

  const addCombo = () => {
    if (!cClub || !cOut || !cIn || cOut === cIn) { alert("골프장과 서로 다른 전/후반 코스를 선택하세요"); return; }
    const exists = db.combos.some((c) => c.club === cClub && c.out === cOut && c.in === cIn);
    if (exists) { alert("이미 있는 조합"); return; }
    persist({ ...db, combos: [{ club: cClub, out: cOut, in: cIn }, ...db.combos] });
  };
  const removeCombo = (c) => persist({ ...db, combos: db.combos.filter((x) => !(x.club === c.club && x.out === c.out && x.in === c.in)) });

  const total = pars.reduce((a, b) => a + (Number(b) || 0), 0);

  // 백업(JSON)
  const backup = JSON.stringify(db);
  const importBackup = () => {
    const t = prompt("백업 JSON 붙여넣기");
    if (!t) return;
    try { const d = JSON.parse(t); persist({ nines: d.nines || [], combos: d.combos || [] }); alert("가져오기 완료"); }
    catch { alert("JSON 파싱 실패"); }
  };

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="mb-6 flex items-end justify-between border-b border-line pb-4">
        <div>
          <div className="font-head text-[12px] font-semibold uppercase tracking-[0.28em] text-accent">Admin</div>
          <h1 className="font-head text-3xl font-bold text-txt">코스 DB 관리</h1>
          <p className="mt-1 text-sm text-txt-soft">나인 {db.nines.length}개 · 조합 {db.combos.length}개 · 골프장 {clubsWithNines.length}곳 (localStorage 실시간 연동)</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button onClick={importBackup} className="text-txt-soft hover:text-txt">백업 가져오기</button>
          <button onClick={() => navigator.clipboard?.writeText(backup)} className="text-txt-soft hover:text-txt">백업 복사</button>
          <Link href="/" className="text-txt-soft hover:text-txt">← 메인</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* 디렉토리 */}
        <section className="rounded-xl border border-line bg-panel p-4">
          <div className="mb-2 flex gap-2">
            <select value={region} onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
              <option value="">전지역</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="골프장 검색"
              className="flex-1 rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
          </div>
          <div className="max-h-[60vh] overflow-auto rounded-lg border border-line">
            {filtered.map((c) => {
              const done = enteredClubs.has(c.name);
              return (
                <button key={c.name + c.address} type="button" onClick={() => setClub(c.name)}
                  className={"flex w-full items-center justify-between border-b border-line px-3 py-2 text-left last:border-0 transition " + (done ? "bg-accent/10 hover:bg-accent/15" : "hover:bg-panel-2")}>
                  <span className={"flex items-center gap-1.5 text-sm " + (done ? "text-txt" : "text-txt-soft")}>
                    <span className={"flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] " + (done ? "bg-accent text-[#06210f]" : "border border-line-2 text-transparent")}>✓</span>
                    {c.name}
                  </span>
                  <span className="text-[11px] text-txt-faint">{c.region} · {c.holes}H</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          {/* 1) 나인 입력 */}
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">1. 나인(9홀) PAR 입력</div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-widest text-txt-faint">골프장</span>
                <input value={club} onChange={(e) => setClub(e.target.value)} list="clubdir" placeholder="골프장 (좌측에서 선택 가능)"
                  className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
                <datalist id="clubdir">{COURSE_DIRECTORY.map((c) => <option key={c.name + c.address} value={c.name} />)}</datalist>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-widest text-txt-faint">코스(나인) 이름</span>
                <input value={nine} onChange={(e) => setNine(e.target.value)} placeholder="예: LAKE"
                  className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
              </label>
            </div>
            <div className="grid grid-cols-9 gap-1.5">
              {pars.map((p, i) => (
                <div key={i} className="rounded-md border border-line bg-panel-2 p-1 text-center">
                  <div className="mb-1 font-mono text-[10px] text-txt-faint">{i + 1}</div>
                  <input
                    ref={(el) => (parRefs.current[i] = el)}
                    value={p} inputMode="numeric" maxLength={1}
                    onChange={(e) => setPar(i, e.target.value.replace(/[^0-9]/g, ""))}
                    onKeyDown={(e) => onParKey(e, i)}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded bg-panel py-1.5 text-center font-mono text-lg font-bold text-txt outline-none focus:ring-2 focus:ring-accent" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-txt-soft">합 <b className="font-mono text-txt">{total}</b> (9홀)</span>
              <button onClick={saveNine} className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-[#06210f] hover:bg-accent-2">나인 저장</button>
            </div>
            <p className="mt-1.5 text-[11px] text-txt-faint">숫자 입력 후 Tab/Enter로 다음 홀 이동. 저장하면 아래 목록에 추가됩니다.</p>
          </div>

          {/* 나인 목록 */}
          {clubsWithNines.length > 0 && (
            <div className="rounded-xl border border-line bg-panel p-4">
              <div className="mb-2 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">저장된 나인</div>
              {clubsWithNines.map((cl) => (
                <div key={cl} className="mb-2">
                  <div className="mb-1 text-[12px] text-accent">{cl}</div>
                  <div className="flex flex-wrap gap-2">
                    {ninesOf(cl).map((n) => (
                      <span key={n.nine} className="flex items-center gap-1 rounded-full border border-line-2 bg-panel-2 py-1 pl-3 pr-1 text-[13px]">
                        <button onClick={() => loadNine(cl, n.nine)} className="text-txt hover:text-accent" title="불러와 수정">
                          {n.nine} <span className="font-mono text-txt-faint">({n.pars.reduce((a, b) => a + b, 0)})</span>
                        </button>
                        <button onClick={() => removeNine(cl, n.nine)} className="flex h-5 w-5 items-center justify-center rounded-full text-txt-faint hover:bg-line hover:text-txt">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2) 조합 정의 */}
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">2. 제공 조합(전/후반) 정의</div>
            <div className="mb-3 grid grid-cols-4 gap-2">
              <select value={cClub} onChange={(e) => { setCClub(e.target.value); setCOut(""); setCIn(""); }}
                className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
                <option value="">골프장</option>
                {clubsWithNines.map((cl) => <option key={cl} value={cl}>{cl}</option>)}
              </select>
              <select value={cOut} onChange={(e) => setCOut(e.target.value)}
                className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
                <option value="">전반</option>
                {ninesOf(cClub).map((n) => <option key={n.nine} value={n.nine}>{n.nine}</option>)}
              </select>
              <select value={cIn} onChange={(e) => setCIn(e.target.value)}
                className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
                <option value="">후반</option>
                {ninesOf(cClub).map((n) => <option key={n.nine} value={n.nine}>{n.nine}</option>)}
              </select>
              <button onClick={addCombo} className="rounded-lg bg-accent px-3 py-2 text-sm font-bold text-[#06210f] hover:bg-accent-2">조합 추가</button>
            </div>
            {db.combos.length === 0 ? (
              <p className="text-[12px] text-txt-faint">정의된 조합이 없습니다. 조합을 추가하면 사용자에게 그 조합이 제공됩니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {db.combos.map((c, i) => (
                  <span key={i} className="flex items-center gap-1 rounded-full border border-line-2 bg-panel-2 py-1 pl-3 pr-1 text-[13px]">
                    <span className="text-txt">{c.club} <b className="text-accent">{c.out}+{c.in}</b></span>
                    <button onClick={() => removeCombo(c)} className="flex h-5 w-5 items-center justify-center rounded-full text-txt-faint hover:bg-line hover:text-txt">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
