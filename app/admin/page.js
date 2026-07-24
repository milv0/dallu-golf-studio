"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { COURSE_DIRECTORY } from "../../lib/courseDirectory";
import { COURSE_DB } from "../../lib/coursesDb";

const LS = "sc-pardb"; // { name: pars[18] } 형태를 배열로 저장: [{name, pars}]
const DEFAULT = () => Array(18).fill(4);

export default function Admin() {
  const [entries, setEntries] = useState([]); // 사용자가 입력한 par DB (localStorage)
  const [region, setRegion] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | done | todo
  const [club, setClub] = useState("");
  const [outC, setOutC] = useState("");
  const [inC, setInC] = useState("");
  const [pars, setPars] = useState(DEFAULT());

  // 표시 이름 자동 생성: 골프장 + 전반+후반 코스명
  const displayName = (club.trim() + (outC.trim() || inC.trim() ? ` ${outC.trim()}+${inC.trim()}` : "")).trim();

  useEffect(() => {
    try { setEntries(JSON.parse(localStorage.getItem(LS) || "[]")); } catch { setEntries([]); }
  }, []);
  const persist = (list) => { setEntries(list); localStorage.setItem(LS, JSON.stringify(list)); };

  const regions = useMemo(
    () => [...new Set(COURSE_DIRECTORY.map((c) => c.region))].sort(),
    []
  );
  const enteredClubs = useMemo(
    () => new Set([...entries.map((e) => e.club || e.name), ...COURSE_DB.map((c) => c.club || c.name)]),
    [entries]
  );
  const filtered = useMemo(() => {
    const kw = q.trim();
    return COURSE_DIRECTORY.filter((c) => {
      if (region && c.region !== region) return false;
      if (kw && !c.name.includes(kw)) return false;
      const done = enteredClubs.has(c.name);
      if (statusFilter === "done" && !done) return false;
      if (statusFilter === "todo" && done) return false;
      return true;
    }).slice(0, 400);
  }, [region, q, statusFilter, enteredClubs]);
  const doneCount = useMemo(
    () => COURSE_DIRECTORY.filter((c) => enteredClubs.has(c.name)).length,
    [enteredClubs]
  );

  // 디렉토리에서 골프장 클릭 → 클럽명 채우고, 그 클럽의 저장 항목이 있으면 로드
  const loadClub = (clubName) => {
    setClub(clubName);
    const found = entries.find((e) => (e.club || e.name) === clubName)
      || COURSE_DB.find((c) => (c.club || c.name) === clubName);
    if (found) {
      setOutC(found.out || "");
      setInC(found.in || "");
      setPars([...found.pars]);
    } else {
      setOutC(""); setInC(""); setPars(DEFAULT());
    }
  };
  const save = () => {
    if (!club.trim()) { alert("골프장(클럽) 이름을 입력하세요"); return; }
    const entry = { name: displayName, club: club.trim(), out: outC.trim(), in: inC.trim(), pars: pars.map(Number) };
    persist([entry, ...entries.filter((e) => e.name !== entry.name)]);
    alert(`저장: ${entry.name}`);
  };
  const remove = (nm) => persist(entries.filter((e) => e.name !== nm));

  const setPar = (i, v) => setPars((p) => p.map((x, idx) => (idx === i ? v : x)));
  const total = pars.reduce((a, b) => a + (Number(b) || 0), 0);
  const outP = pars.slice(0, 9).reduce((a, b) => a + (Number(b) || 0), 0);
  const inP = pars.slice(9).reduce((a, b) => a + (Number(b) || 0), 0);

  // coursesDb.js 에 붙여넣을 JS 배열 텍스트 생성 (기존 COURSE_DB + 입력분 병합, 이름 중복 시 입력분 우선)
  const exportText = useMemo(() => {
    const map = new Map();
    const put = (c) => map.set(c.name, c);
    for (const c of COURSE_DB) put(c);
    for (const e of entries) put(e);
    const lines = [...map.values()].map(
      (c) => `  { name: ${JSON.stringify(c.name)}, club: ${JSON.stringify(c.club || c.name)}, out: ${JSON.stringify(c.out || "")}, in: ${JSON.stringify(c.in || "")}, pars: [${c.pars.join(", ")}] },`
    );
    return "export const COURSE_DB = [\n" + lines.join("\n") + "\n];\n";
  }, [entries]);

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-6 flex items-end justify-between border-b border-line pb-4">
        <div>
          <div className="font-head text-[12px] font-semibold uppercase tracking-[0.28em] text-accent">Admin</div>
          <h1 className="font-head text-3xl font-bold text-txt">코스 PAR DB 관리</h1>
          <p className="mt-1 text-sm text-txt-soft">전국 골프장 {COURSE_DIRECTORY.length}곳 · PAR 입력분 {entries.length}곳 · 기본DB {COURSE_DB.length}곳</p>
        </div>
        <Link href="/" className="text-sm text-txt-soft hover:text-txt">← 메인으로</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* 디렉토리 검색 */}
        <section className="rounded-xl border border-line bg-panel p-4">
          <div className="mb-3 flex gap-2">
            <select value={region} onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-line-2 bg-panel-2 px-2 py-2 text-sm text-txt outline-none focus:border-accent">
              <option value="">전지역</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="골프장 검색"
              className="flex-1 rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
          </div>
          <div className="mb-2 flex items-center gap-1.5">
            {[["all", "전체"], ["done", "입력완료"], ["todo", "미입력"]].map(([k, lbl]) => (
              <button key={k} type="button" onClick={() => setStatusFilter(k)}
                className={"rounded-md px-2.5 py-1 text-xs font-semibold transition " +
                  (statusFilter === k ? "bg-accent text-[#06210f]" : "border border-line text-txt-soft hover:text-txt")}>
                {lbl}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-txt-faint">
              완료 <b className="text-accent">{doneCount}</b> / 전체 {COURSE_DIRECTORY.length}
            </span>
          </div>
          <div className="max-h-[56vh] overflow-auto rounded-lg border border-line">
            {filtered.map((c) => {
              const done = enteredClubs.has(c.name);
              return (
                <button key={c.name + c.address} type="button" onClick={() => loadClub(c.name)}
                  className={"flex w-full items-center justify-between border-b border-line px-3 py-2 text-left last:border-0 transition " +
                    (done ? "bg-accent/10 hover:bg-accent/15" : "hover:bg-panel-2")}>
                  <span className={"flex items-center gap-1.5 text-sm " + (done ? "text-txt" : "text-txt-soft")}>
                    <span className={"flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] " +
                      (done ? "bg-accent text-[#06210f]" : "border border-line-2 text-transparent")}>✓</span>
                    {c.name}
                  </span>
                  <span className="text-[11px] text-txt-faint">{c.region} · {c.holes}H</span>
                </button>
              );
            })}
            {filtered.length === 0 && <p className="p-3 text-sm text-txt-faint">결과 없음</p>}
          </div>
        </section>

        {/* PAR 편집 */}
        <section className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="block sm:col-span-1">
                <span className="mb-1 block text-[11px] uppercase tracking-widest text-txt-faint">골프장(클럽)</span>
                <input value={club} onChange={(e) => setClub(e.target.value)} placeholder="예: YJC골프클럽"
                  className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-widest text-txt-faint">전반(OUT) 코스명</span>
                <input value={outC} onChange={(e) => setOutC(e.target.value)} placeholder="예: ACE"
                  className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-widest text-txt-faint">후반(IN) 코스명</span>
                <input value={inC} onChange={(e) => setInC(e.target.value)} placeholder="예: CHALLENGE"
                  className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
              </label>
            </div>
            <p className="mb-3 text-[12px] text-txt-faint">저장 이름: <b className="text-txt">{displayName || "(골프장 입력)"}</b></p>

            {[0, 9].map((off) => (
              <div key={off} className="mb-3">
                <div className="mb-1 text-[11px] uppercase tracking-widest text-accent">{off === 0 ? "OUT (1–9)" : "IN (10–18)"}</div>
                <div className="grid grid-cols-9 gap-1.5">
                  {pars.slice(off, off + 9).map((p, i) => (
                    <div key={off + i} className="rounded-md border border-line bg-panel-2 p-1 text-center">
                      <div className="mb-1 font-mono text-[10px] text-txt-faint">{off + i + 1}</div>
                      <div className="flex overflow-hidden rounded border border-line">
                        {[3, 4, 5].map((v) => (
                          <button key={v} type="button" onClick={() => setPar(off + i, v)}
                            className={"flex-1 py-1 font-mono text-[12px] font-bold " +
                              (Number(p) === v ? "bg-accent text-[#06210f]" : "text-txt-faint hover:text-txt")}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
              <span className="text-txt-soft">
                PAR <b className={"font-mono " + (total === 72 ? "text-txt" : "text-[#ffb648]")}>OUT {outP} · IN {inP} · 합 {total}</b>
                {total !== 72 && <span className="ml-1 text-[#ffb648]">⚠</span>}
              </span>
              <div className="flex gap-2">
                {displayName && entries.some((e) => e.name === displayName) && (
                  <button type="button" onClick={() => { remove(displayName); }}
                    className="rounded-lg border border-line px-3 py-2 text-sm text-txt-soft hover:text-txt">삭제</button>
                )}
                <button type="button" onClick={save}
                  className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-[#06210f] hover:bg-accent-2">저장</button>
              </div>
            </div>
          </div>

          {/* 내보내기 */}
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
                lib/coursesDb.js 로 내보내기
              </span>
              <button type="button" onClick={() => navigator.clipboard?.writeText(exportText)}
                className="rounded-lg border border-accent px-3 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-[#06210f]">복사</button>
            </div>
            <p className="mb-2 text-[12px] text-txt-faint">
              입력한 PAR를 이 텍스트로 복사 → <code className="rounded bg-panel-2 px-1">lib/coursesDb.js</code> 전체를 교체하고 배포하면 기본 DB에 영구 반영됩니다.
            </p>
            <textarea readOnly value={exportText} rows={8}
              className="w-full rounded-md border border-line-2 bg-panel-2 px-3 py-2 font-mono text-[12px] text-txt outline-none" />
          </div>
        </section>
      </div>
    </main>
  );
}
