"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import HoleByHoleStrip, { SIZE as SIZE_YT } from "../components/presets/HoleByHoleStrip";
import ReelsScorecard, { SIZE as SIZE_REELS } from "../components/presets/ReelsScorecard";
import HoleCard, { SIZE as SIZE_HOLE } from "../components/presets/HoleCard";
import { emptyRound, summarize, toParLabel, cumulativeToPar } from "../lib/score";
import { coursesFromDb, effectiveDb } from "../lib/coursesDb";
import { loadDb, saveDb } from "../lib/nineStore";
import { fetchDb } from "../lib/api";
import { COURSE_DIRECTORY } from "../lib/courseDirectory";

const FORMATS = {
  youtube: { label: "YouTube", ratio: "가로 16:9", Comp: HoleByHoleStrip, size: SIZE_YT },
  reels: { label: "Instagram Reels", ratio: "세로 9:16", Comp: ReelsScorecard, size: SIZE_REELS },
};

const emptyHoleCard = () => ({
  hole: "", par: "", distance: "", toPar: "", currentShot: "", club: "",
});

// 파대비 상대값 파싱: "-1","0","1","+2","E" → 숫자 (유효하지 않으면 null)
function parseRel(v) {
  const s = String(v).trim().toUpperCase();
  if (s === "E") return 0;
  if (!/^[+-]?\d+$/.test(s)) return null;
  return parseInt(s, 10);
}
// 절대 스코어 → 파대비 표시 문자열 (음수만 -, 나머지는 그대로: -1 / 0 / 1 / 2)
function relDisplay(score, par) {
  if (score === "" || score == null || par === "" || par == null) return "";
  const n = Number(score) - Number(par);
  if (Number.isNaN(n)) return "";
  return String(n);
}

export default function Home() {
  const [round, setRound] = useState(emptyRound);
  const [holeCard, setHoleCard] = useState(emptyHoleCard);
  const [layout, setLayout] = useState("round"); // 'round' | 'hole'
  const [format, setFormat] = useState("youtube");
  const [exportScale, setExportScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [scoreMode, setScoreMode] = useState("relative"); // 'strokes' | 'relative' (기본: 파대비)
  const captureRef = useRef(null);
  const scoreRefs = useRef([]);

  const isHole = layout === "hole";
  const size = isHole ? SIZE_HOLE : FORMATS[format].size;

  useEffect(() => {
    setTheme(localStorage.getItem("sc-theme") || "dark");
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sc-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const summary = useMemo(() => summarize(round.holes), [round]);

  const setMeta = (key, val) => setRound((r) => ({ ...r, [key]: val }));
  const setHC = (key, val) => setHoleCard((s) => ({ ...s, [key]: val }));

  // 하이브리드: 라운드에서 홀 선택 → PAR·누적 to-par·(입력된)스코어 자동 채움
  const loadHoleFromRound = (n) => {
    if (!n) return;
    const idx = Number(n) - 1;
    const h = round.holes[idx];
    if (!h) return;
    setHoleCard((s) => ({
      ...s,
      hole: String(n),
      par: String(h.par ?? ""),
      currentShot: h.score !== "" && h.score != null ? String(h.score) : s.currentShot,
      toPar: toParLabel(cumulativeToPar(round.holes, idx)),
    }));
  };
  const setHole = (i, key, val) =>
    setRound((r) => ({
      ...r,
      holes: r.holes.map((h, idx) => (idx === i ? { ...h, [key]: val } : h)),
    }));

  const handleScoreKey = (e, idx) => {
    if (e.key === "Enter") {
      e.preventDefault();
      scoreRefs.current[idx + 1]?.focus();
    }
  };

  // OpenGolfAPI 코스 상세 → 홀별 par + 골프장명 자동 채움 (미국 코스)
  const applyCourse = (d) => {
    const hd = d.holes_data || [];
    setRound((r) => {
      const holes = r.holes.map((h, i) =>
        hd[i] != null && hd[i].par != null ? { ...h, par: String(hd[i].par) } : h
      );
      return { ...r, course: d.course_name || d.club_name || r.course, holes };
    });
  };

  // 코스(조합) 선택 → par 채움. 골프장명은 club으로 유지(코스 섹션이 계속 그 골프장 조합을 보여주도록)
  const applyPreset = (c) => {
    setRound((r) => ({
      ...r,
      course: c.club || c.name || r.course,
      holes: r.holes.map((h, i) => ({ ...h, par: String(c.pars?.[i] ?? h.par) })),
    }));
  };

  // 코스 DB (localStorage seed + 편집분 병합)
  const [builtinCourses, setBuiltinCourses] = useState([]);
  // 즐겨찾기 (코스 이름 배열, localStorage)
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    (async () => {
      let remote;
      try { remote = await fetchDb(); saveDb(remote); }   // KV → 로컬 캐시
      catch { remote = loadDb(); }                          // 오프라인/로컬: 캐시 사용
      setBuiltinCourses(coursesFromDb(effectiveDb(remote)));
    })();
    try { setFavorites(JSON.parse(localStorage.getItem("sc-favorites") || "[]")); }
    catch { setFavorites([]); }
  }, []);
  const toggleFav = (name) => {
    setFavorites((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [name, ...prev];
      localStorage.setItem("sc-favorites", JSON.stringify(next));
      return next;
    });
  };

  // 골프장(클럽) 이름 자동완성 목록 — 디렉토리 541곳 + DB 클럽 (조합명 제외)
  const clubNameList = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const c of [...builtinCourses.map((x) => x.club).filter(Boolean), ...COURSE_DIRECTORY.map((x) => x.name)]) {
      if (c && !seen.has(c)) { seen.add(c); out.push(c); }
    }
    return out;
  }, [builtinCourses]);
  // 골프장 이름이 DB 코스명과 정확히 일치하면 par 자동 로드
  const maybeLoadCourse = (name) => {
    const key = (name || "").trim();
    const c = builtinCourses.find((x) => x.name === key);
    if (c) applyPreset(c);
  };

  async function handleExport() {
    if (!captureRef.current) return;
    setBusy(true);
    try {
      await document.fonts?.ready;
      const dataUrl = await toPng(captureRef.current, {
        canvasWidth: size.w * exportScale,
        canvasHeight: size.h * exportScale,
        width: size.w,
        height: size.h,
        cacheBust: true,
        style: { maxWidth: "none", width: `${size.w}px`, height: `${size.h}px` },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      const name = (round.player || "scorecard").replace(/\s+/g, "_");
      a.download = `${name}_${isHole ? "hole" : format}.png`;
      a.click();
    } catch (e) {
      alert("내보내기 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  const Front = round.holes.slice(0, 9);
  const Back = round.holes.slice(9, 18);
  const holeData = { player: round.player, ...holeCard };

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="font-head text-[13px] font-semibold uppercase tracking-[0.28em] text-accent">
            Broadcast Overlay Maker · @dallu_golf
          </div>
          <h1 className="mt-1 font-head text-[40px] font-bold uppercase leading-none tracking-tight text-txt">
            Dallu Golf <span className="text-accent">Studio</span>
          </h1>
          <p className="mt-2 text-sm text-txt-soft">
            골프 영상 편집용 스코어카드 오버레이를 메이저 대회 방송 스타일로 제작 · 투명 PNG로 내보내기
          </p>
        </div>
        <button onClick={toggleTheme} aria-label="테마 전환"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-soft transition hover:text-txt">
          <span className="text-base">{theme === "dark" ? "☀️" : "🌙"}</span>
          {theme === "dark" ? "라이트" : "다크"}
        </button>
      </div>

      {/* 레이아웃 선택 */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
          레이아웃
        </span>
        {[["round", "라운드 스코어카드"], ["hole", "홀 카드 (현재 홀)"]].map(([key, label]) => (
          <button key={key} onClick={() => setLayout(key)}
            className={"rounded-lg border px-4 py-2 text-sm font-semibold transition " +
              (layout === key
                ? "border-accent bg-accent text-[#06210f]"
                : "border-line bg-panel text-txt-soft hover:text-txt")}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[680px_1fr]">
        {/* ── 입력 패널 ── */}
        <section className="space-y-6">
          {/* 기본 정보 */}
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
              기본 정보
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="선수명" full value={round.player}
                     onChange={(v) => setMeta("player", v)} placeholder="선수 이름 입력" />
              {!isHole && (
                <>
                  <ClubAutocomplete value={round.course} onChange={(v) => setMeta("course", v)}
                    onPick={(v) => setMeta("course", v)} options={clubNameList} />
                  <Field label="날짜" type="date" value={round.date}
                         onChange={(v) => setMeta("date", v)} />
                </>
              )}
            </div>
          </div>

          {/* 라운드 스코어카드: 홀별 입력 */}
          {!isHole && (
            <>
              {/* OpenGolfAPI 코스 검색(미국)은 한국 배포용으로 임시 숨김 — 나중에 복구
              <CourseSearch onPick={applyCourse} /> */}
              <CoursePresets builtin={builtinCourses} favorites={favorites}
                             selectedClub={round.course}
                             onToggleFav={toggleFav} onLoad={applyPreset} />
              <div className="rounded-xl border border-line bg-panel p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
                    홀별 Par · 스코어
                  </span>
                  <div className="flex overflow-hidden rounded-lg border border-line">
                    {[["strokes", "타수"], ["relative", "파대비"]].map(([key, label]) => (
                      <button key={key} type="button" onClick={() => setScoreMode(key)}
                        className={"px-3 py-1 text-xs font-semibold transition " +
                          (scoreMode === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {scoreMode === "relative" && (
                  <p className="mb-2 text-[11px] text-txt-faint">
                    파대비 입력 — 버디 <b className="text-txt-soft">-1</b> · 파 <b className="text-txt-soft">0</b> · 보기 <b className="text-txt-soft">1</b> 또는 <b className="text-txt-soft">+1</b>
                  </p>
                )}
                <HoleGroup label="FRONT 9" holes={Front} offset={0} setHole={setHole}
                           scoreRefs={scoreRefs} onScoreKey={handleScoreKey} scoreMode={scoreMode} />
                <HoleGroup label="BACK 9" holes={Back} offset={9} setHole={setHole}
                           scoreRefs={scoreRefs} onScoreKey={handleScoreKey} scoreMode={scoreMode} />
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-[12px] text-txt-soft">
                  <span>
                    PAR{" "}
                    <b className={"font-mono " + (summary.totalPar === 72 ? "text-txt" : "text-[#ffb648]")}>
                      OUT {summary.outPar} · IN {summary.inPar} · 합 {summary.totalPar}
                    </b>
                    {summary.totalPar !== 72 && (
                      <span className="ml-1.5 font-semibold text-[#ffb648]">
                        ⚠ 표준 파72와 다름 (확인)
                      </span>
                    )}
                  </span>
                  {summary.thru > 0 && (
                    <span>
                      스코어{" "}
                      <b className="font-mono text-txt">{summary.totalScore}</b>{" "}
                      <span className="text-accent">{toParLabel(summary.toPar)}</span>
                      <span className="text-txt-faint"> · {summary.thru}홀</span>
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 홀 카드: 현재 홀 정보 */}
          {isHole && (
            <div className="rounded-xl border border-line bg-panel p-4">
              <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
                현재 홀 정보
              </div>
              {/* 라운드에서 홀 불러오기 — 1~18 탭 (하이브리드) */}
              <div className="mb-3">
                <span className="mb-1.5 block font-head text-[11px] uppercase tracking-widest text-accent">
                  홀 선택 (PAR·토탈 자동 연동)
                </span>
                <div className="grid grid-cols-9 gap-1">
                  {round.holes.map((h, i) => {
                    const n = i + 1;
                    const active = String(n) === String(holeCard.hole);
                    const has = h.score !== "" && h.score != null;
                    return (
                      <button key={i} type="button" onClick={() => loadHoleFromRound(n)}
                        title={`${n}번 홀 · Par ${h.par}${has ? ` · ${h.score}타` : ""}`}
                        className={"rounded-md py-1.5 text-center font-mono text-[13px] font-bold transition " +
                          (active
                            ? "bg-accent text-[#06210f]"
                            : has
                              ? "border border-accent/40 bg-panel-2 text-accent hover:border-accent"
                              : "border border-line bg-panel-2 text-txt-faint hover:text-txt")}>
                        {n}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1 text-[11px] text-txt-faint">
                  라임 = 선택된 홀 · 초록 테두리 = 스코어 입력된 홀
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="홀 번호" value={holeCard.hole} onChange={(v) => setHC("hole", v)} placeholder="1" />
                <Field label="PAR" value={holeCard.par} onChange={(v) => setHC("par", v)} placeholder="4" />
                <Field label="거리" value={holeCard.distance} onChange={(v) => setHC("distance", v)} placeholder="350M" />
                <Field label="토탈 (E, -2...)" value={holeCard.toPar} onChange={(v) => setHC("toPar", v)} placeholder="E" />
                <Field label="현재 샷" value={holeCard.currentShot} onChange={(v) => setHC("currentShot", v)} placeholder="4" />
                <Field label="선택 클럽" value={holeCard.club} onChange={(v) => setHC("club", v)} placeholder="PUTTER" />
              </div>
              <p className="mt-2 text-[12px] text-txt-faint">
                선수명·PAR·토탈은 라운드에서 자동 연동 · 거리/클럽/샷은 직접 입력 · FOR 배너는 자동 계산
              </p>
            </div>
          )}
        </section>

        {/* ── 미리보기 & 내보내기 ── */}
        <section>
          {/* 포맷(라운드 전용) */}
          {!isHole && (
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">포맷</div>
              <div className="flex overflow-hidden rounded-lg border border-line">
                {Object.entries(FORMATS).map(([key, f]) => (
                  <button key={key} onClick={() => setFormat(key)}
                    className={"px-4 py-1.5 text-sm font-semibold transition " +
                      (format === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                    {f.label}<span className="ml-1.5 text-[11px] opacity-70">{f.ratio}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
              미리보기 <span className="text-txt-faint">(투명 배경)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex overflow-hidden rounded-lg border border-line">
                {[1, 2, 3].map((s) => (
                  <button key={s} onClick={() => setExportScale(s)}
                    className={"px-3 py-1.5 text-xs font-semibold " +
                      (exportScale === s ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                    {s}x
                  </button>
                ))}
              </div>
              <button onClick={handleExport} disabled={busy}
                className="rounded-lg bg-accent px-5 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60">
                {busy ? "생성 중…" : "PNG 다운로드"}
              </button>
            </div>
          </div>

          <div className="checker overflow-hidden rounded-xl border border-line p-6">
            <div ref={captureRef} className="preview-svg mx-auto w-full"
                 style={{ maxWidth: size.w }}>
              {isHole
                ? <HoleCard data={holeData} />
                : (() => { const C = FORMATS[format].Comp; return <C round={round} summary={summary} />; })()}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-panel p-4 text-sm text-txt-soft">
            <b className="text-txt">출력</b>: 투명 PNG · {size.w}×{size.h} ×{exportScale} = {size.w * exportScale}×{size.h * exportScale}px
            <div className="mt-2 text-[13px] text-txt-faint">
              색상: 버디=빨강 / 이글=골드 / 보기=파랑 · 방송 관례 기준
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// 스코어카드 이미지 업로드 + 미리보기 + 추출
// par 빠른 지정: 3/4/5 인라인 세그먼트 — 회색 명도로 구분 (초록X)
// Tab 이동은 스코어 칸끼리만 되도록 par 버튼은 tabIndex=-1
const PAR_STYLE = {
  3: { background: "#2f3947", color: "#ffffff" }, // 진한
  4: { background: "#475162", color: "#ffffff" }, // 중간
  5: { background: "#616d7d", color: "#ffffff" }, // 연한 (모두 어두운 바탕 + 흰 글씨)
};
// par 셀: 클릭(왼쪽=3/가운데=4/오른쪽=5) + 키보드(3·4·5, ←→). 드래그 없음.
function ParCell({ par, onSet }) {
  const cur = Number(par) || 4;
  const clamp = (n) => Math.max(3, Math.min(5, n));
  const st = PAR_STYLE[par];

  const onClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    onSet(String(rx < 0.38 ? 3 : rx > 0.62 ? 5 : 4));
  };
  const onKeyDown = (e) => {
    if (["3", "4", "5"].includes(e.key)) { e.preventDefault(); onSet(e.key); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); onSet(String(clamp(cur - 1))); }
    else if (e.key === "ArrowRight") { e.preventDefault(); onSet(String(clamp(cur + 1))); }
  };

  return (
    <button type="button" tabIndex={-1} onClick={onClick} onKeyDown={onKeyDown}
      style={st ? { background: st.background, color: st.color } : undefined}
      title="클릭: 왼쪽=파3·가운데=파4·오른쪽=파5 (클릭 후 3·4·5 키도 가능)"
      className={"mb-1.5 w-full select-none rounded-md py-1.5 text-center font-mono text-base font-bold leading-none outline-none transition focus-visible:ring-2 focus-visible:ring-accent " +
        (st ? "" : "text-txt-faint hover:text-txt")}>
      {par || "–"}
    </button>
  );
}

// 내 코스 저장/불러오기 — 기본 DB(coursesDb) + 사용자가 저장한 코스
// 골프장명 자동완성 — 입력하면 연관 골프장만 드롭다운
function ClubAutocomplete({ value, onChange, onPick, options }) {
  const [open, setOpen] = useState(false);
  const q = (value || "").trim();
  const matches = q ? options.filter((o) => o.includes(q)).slice(0, 8) : [];
  return (
    <label className="relative col-span-2 block">
      <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">골프장</span>
      <input value={value} placeholder="골프장 이름 검색"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent" />
      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-line-2 bg-panel shadow-lg">
          {matches.map((m) => (
            <li key={m}>
              <button type="button" onMouseDown={() => { (onPick || onChange)(m); setOpen(false); }}
                className="block w-full px-3 py-2 text-left text-sm text-txt hover:bg-panel-2">
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

// 코스: 즐겨찾기 + 골프장 DB. 기본정보에서 고른 골프장(selectedClub)의 조합을 자동 표시.
function CoursePresets({ builtin = [], favorites = [], selectedClub = "", onToggleFav, onLoad }) {
  const [browseClub, setBrowseClub] = useState("");
  const clubs = [...new Set(builtin.map((c) => c.club || c.name))];
  // 기본정보에서 고른 골프장이 DB에 있으면 그 골프장, 아니면 수동 브라우즈 선택
  const sel = (selectedClub || "").trim();
  const activeClub = clubs.includes(sel) ? sel : browseClub;
  const clubCourses = builtin.filter((c) => (c.club || c.name) === activeClub);
  const favCourses = builtin.filter((c) => favorites.includes(c.name));

  const Star = ({ name }) => (
    <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFav(name); }}
      className="px-1 text-sm"
      style={{ color: favorites.includes(name) ? "#ffb648" : "var(--color-txt-faint)" }}
      title="즐겨찾기">★</button>
  );

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-2 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">코스</div>

      {favCourses.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-[11px] uppercase tracking-widest text-[#ffb648]">★ 즐겨찾기</div>
          <div className="flex flex-wrap gap-2">
            {favCourses.map((c) => (
              <span key={c.name} className="flex items-center gap-0.5 rounded-full border border-line-2 bg-panel-2 py-1 pl-3 pr-1 text-sm">
                <button type="button" onClick={() => onLoad(c)} className="text-txt hover:text-accent">{c.name}</button>
                <Star name={c.name} />
              </span>
            ))}
          </div>
        </div>
      )}

      {activeClub ? (
        // 선택된 골프장의 조합 자동 표시
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[12px] text-txt-soft">{activeClub} · 조합 선택</span>
            {!clubs.includes(sel) && (
              <button type="button" onClick={() => setBrowseClub("")} className="text-[12px] text-txt-faint hover:text-txt">← 목록</button>
            )}
          </div>
          {clubCourses.length === 0 ? (
            <p className="text-[12px] text-txt-faint">등록된 조합이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {clubCourses.map((c) => (
                <span key={c.name} className="flex items-center gap-0.5 rounded-full border border-line-2 bg-panel-2 py-1 pl-3 pr-1 text-sm">
                  <button type="button" onClick={() => onLoad(c)} className="text-txt hover:text-accent">
                    {c.out && c.in ? `${c.out}+${c.in}` : c.name}
                  </button>
                  <Star name={c.name} />
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        // 골프장 미선택 시: 골프장 목록 브라우즈
        clubs.length > 0 && (
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-widest text-accent">골프장 DB</div>
            <div className="flex flex-wrap gap-2">
              {clubs.map((cl) => (
                <button key={cl} type="button" onClick={() => setBrowseClub(cl)}
                  className="rounded-full border border-line-2 bg-panel-2 px-3 py-1 text-sm text-txt transition hover:border-accent hover:text-accent">
                  {cl}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function CourseSearch({ onPick }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/course?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setResults(d.courses || []);
    } catch (e) {
      alert("코스 검색 실패: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const pick = async (c) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/course?id=${encodeURIComponent(c.id)}`);
      const d = await r.json();
      onPick(d);
      setResults([]);
      setQ(c.course_name || c.name || "");
    } catch (e) {
      alert("코스 불러오기 실패: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-1 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        코스 불러오기 <span className="normal-case tracking-normal text-txt-faint">(OpenGolfAPI)</span>
      </div>
      <p className="mb-3 text-[12px] text-txt-faint">
        미국 코스만 지원 · 선택 시 홀별 PAR 자동 채움 (한국 코스는 수기 입력)
      </p>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="예: Pebble Beach"
          className="flex-1 rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent" />
        <button type="button" onClick={search} disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60">
          {loading ? "…" : "검색"}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="mt-2 max-h-48 overflow-auto rounded-lg border border-line">
          {results.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => pick(c)}
                className="flex w-full flex-col items-start gap-0.5 border-b border-line px-3 py-2 text-left transition last:border-0 hover:bg-panel-2">
                <span className="text-sm text-txt">{c.course_name || c.name}</span>
                <span className="text-[11px] text-txt-faint">
                  {[c.city, c.state].filter(Boolean).join(", ")}{c.par ? ` · Par ${c.par}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, value, onChange, onBlur, placeholder, full, type = "text", list }) {
  return (
    <label className={"block " + (full ? "col-span-2" : "")}>
      <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">
        {label}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur} list={list} placeholder={placeholder}
        onClick={type === "date" ? (e) => { try { e.currentTarget.showPicker?.(); } catch {} } : undefined}
        className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent [color-scheme:dark]" />
    </label>
  );
}

function HoleGroup({ label, holes, offset, setHole, scoreRefs, onScoreKey, scoreMode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 font-head text-[11px] uppercase tracking-widest text-accent">{label}</div>
      <div className="grid grid-cols-9 gap-2">
        {holes.map((h, i) => {
          const idx = offset + i;
          return (
            <div key={idx} className="rounded-lg border border-line bg-panel-2 p-2 text-center">
              <div className="mb-1 font-mono text-xs text-txt-faint">{idx + 1}</div>
              <ParCell par={h.par} onSet={(v) => setHole(idx, "par", v)} />
              <ScoreInput idx={idx} par={h.par} score={h.score} mode={scoreMode}
                setHole={setHole} scoreRefs={scoreRefs} onScoreKey={onScoreKey} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 타수/파대비 겸용 스코어 입력. 내부 저장은 항상 절대 타수.
function ScoreInput({ idx, par, score, mode, setHole, scoreRefs, onScoreKey }) {
  const display = mode === "relative" ? relDisplay(score, par) : (score ?? "");
  const [buf, setBuf] = useState(display);

  useEffect(() => { setBuf(display); }, [display, mode]);

  const handle = (v) => {
    setBuf(v);
    if (v === "") { setHole(idx, "score", ""); return; }
    if (mode === "relative") {
      if (v === "-" || v === "+") return;            // 입력 도중 대기
      const rel = parseRel(v);
      if (rel == null) return;                        // 유효하지 않으면 버퍼만 유지
      const p = Number(par);
      if (Number.isNaN(p)) return;
      setHole(idx, "score", String(p + rel));
    } else {
      if (!/^\d+$/.test(v)) return;
      setHole(idx, "score", v);
    }
  };

  return (
    <input
      aria-label={`홀 ${idx + 1} 스코어`}
      value={buf}
      inputMode={mode === "relative" ? "text" : "numeric"}
      ref={(el) => { if (scoreRefs) scoreRefs.current[idx] = el; }}
      onKeyDown={(e) => onScoreKey && onScoreKey(e, idx)}
      onChange={(e) => handle(e.target.value)}
      placeholder="–"
      className="w-full rounded-md bg-panel px-1 py-2 text-center font-mono text-xl font-bold text-txt outline-none placeholder:text-txt-faint focus:ring-2 focus:ring-accent"
    />
  );
}
