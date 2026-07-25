"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import HoleByHoleStrip, { sizeFor as ytSizeFor } from "../presets/HoleByHoleStrip";
import ReelsScorecard, { sizeFor as reelsSizeFor } from "../presets/ReelsScorecard";
import HoleCard, { sizeFor as holeSizeFor } from "../presets/HoleCard";
import ReelsThreeHoleCard, { SIZE as SIZE_REELS_THREE } from "../presets/ReelsThreeHoleCard";
import { emptyRound, summarize, toParLabel, cumulativeToPar } from "../../lib/score";
import { coursesFromDb, effectiveDb } from "../../lib/coursesDb";
import { loadDb, saveDb } from "../../lib/nineStore";
import { createRoundRecordRemote, fetchDb } from "../../lib/api";
import { COURSE_DIRECTORY } from "../../lib/courseDirectory";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import { saveRoundRecord } from "../../lib/roundHistory";
import HomeHub from "./HomeHub";

// 미리보기 표시 높이 상한 — 세로 포맷(릴스)이 과도하게 커 보이지 않도록 균형
const PREVIEW_MAX_H = 340;

const FORMATS = {
  youtube: { Comp: HoleByHoleStrip, sizeFor: ytSizeFor },
  reels: { Comp: ReelsScorecard, sizeFor: reelsSizeFor },
};

const RANGES = [["all", "전체 18홀"], ["front", "전반 OUT 9"], ["back", "후반 IN 9"]];

// 내보내기 품질 프리셋 — 최종 영상 해상도에 맞춤
const QUALITY = [
  { scale: 1, label: "FHD", desc: "1080p 영상용" },
  { scale: 2, label: "4K", desc: "2160p 영상용 · iPhone 16" },
  { scale: 3, label: "MAX", desc: "초고화질" },
];

const emptyHoleCard = () => ({
  hole: "", par: "", distance: "", toPar: "", currentShot: "", club: "", unit: "m", showResultBanner: true,
});

const emptyThreeHoleCard = () => ({
  showHoleNumbers: true,
  total: "",
  toPar: "",
  holes: [
    { hole: "1", par: "4", score: "" },
    { hole: "2", par: "4", score: "" },
    { hole: "3", par: "4", score: "" },
  ],
});

const emptyManualNine = () => ({
  holes: Array.from({ length: 9 }, (_, i) => ({ hole: String(i + 1), par: "4", score: "" })),
});

const emptyLinkedThree = () => ({
  showHoleNumbers: true,
  holes: [0, 1, 2],
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

export default function StudioApp({ mode = "home" } = {}) {
  return mode === "home" ? <HomeHub /> : <StudioWorkspace mode={mode} />;
}

function StudioWorkspace({ mode }) {
  const [round, setRound] = useState(emptyRound);
  const [holeCard, setHoleCard] = useState(emptyHoleCard);
  const [threeHole, setThreeHole] = useState(emptyThreeHoleCard);
  const [manualNine, setManualNine] = useState(emptyManualNine);
  const [linkedThree, setLinkedThree] = useState(emptyLinkedThree);
  const [holeRange, setHoleRange] = useState("all"); // 'all' | 'front' | 'back'
  const [reelsVer, setReelsVer] = useState("v1");    // 릴스 레이아웃 v1(9홀) | v3(3홀)
  const [reelsSource, setReelsSource] = useState("linked"); // 'linked' | 'custom'
  const [cardTheme, setCardTheme] = useState("light"); // 카드(프리셋) 색 테마
  const [exportScale, setExportScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState("light");
  const [scoreMode, setScoreMode] = useState("relative"); // 'strokes' | 'relative' (기본: 파대비)
  const [savedRoundAt, setSavedRoundAt] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const captureRef = useRef(null);
  const scoreRefs = useRef([]);

  const isHole = mode === "hole";
  const isLegacyReels = mode === "reels";
  const isScore18 = mode === "score18" || mode === "round";
  const isScore3 = mode === "score3" || (isLegacyReels && reelsVer === "v3");
  const isScore9 = mode === "score9" || (isLegacyReels && reelsVer !== "v3");
  const isReelsSizedScore = isScore9 || isScore3;
  const format = isReelsSizedScore ? "reels" : "youtube";
  const reelsV3 = isScore3;
  const reelsCustom = isReelsSizedScore && reelsSource === "custom";
  const isRoundEditor = isScore18;
  const usesRoundSource = (isReelsSizedScore && !reelsCustom) || mode === "hole";
  const holeData = { player: round.player, ...holeCard };
  // 18홀은 전체 고정, 9홀만 전반/후반을 선택한다.
  const availableRanges = RANGES.filter(([k]) => k !== "all");
  const effRange = isScore18 ? "all" : isReelsSizedScore && holeRange === "all" ? "front" : holeRange;
  const size = isHole ? holeSizeFor(holeData) : reelsV3 ? SIZE_REELS_THREE : FORMATS[format].sizeFor(effRange);
  const previewMaxWidth = Math.min(size.w, PREVIEW_MAX_H * (size.w / size.h)) * (reelsV3 ? 0.72 : 1);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);
  useEffect(() => {
    if (!isReelsSizedScore || typeof window === "undefined") return;
    const source = new URLSearchParams(window.location.search).get("source");
    if (source === "custom" || source === "linked") setReelsSource(source);
  }, [isReelsSizedScore]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  const summary = useMemo(() => summarize(round.holes), [round]);
  const hasRoundMeta = Boolean((round.player || "").trim() || (round.course || "").trim() || (round.date || "").trim());
  const hasRoundScores = summary.thru > 0;
  const hasRoundData = hasRoundMeta || hasRoundScores;
  const linkedThreeCount = Array.isArray(linkedThree.holes) ? Math.min(linkedThree.holes.length, 3) : 0;
  const linkedThreeReady = !reelsV3 || reelsCustom || linkedThreeCount === 3;
  const hasHoleCardData = Boolean(holeCard.hole || holeCard.par || holeCard.distance || holeCard.currentShot || holeCard.club || holeCard.toPar);
  const canExport =
    !(isReelsSizedScore && !reelsCustom && !hasRoundScores) &&
    linkedThreeReady &&
    !(mode === "hole" && !hasRoundData && !hasHoleCardData);
  const exportBlockReason =
    isReelsSizedScore && !reelsCustom && !hasRoundScores
      ? "18홀 스코어에서 홀 스코어를 먼저 입력하세요."
      : !linkedThreeReady
      ? "3홀은 정확히 3개 홀을 선택해야 합니다."
      : mode === "hole" && !hasRoundData && !hasHoleCardData
      ? "현재 홀 정보를 먼저 입력하세요."
      : "";
  const canSaveRound = isRoundEditor && hasRoundScores && Boolean(currentUser);
  const manualNineRound = useMemo(() => ({
    player: "",
    country: "",
    course: "",
    date: "",
    holes: [
      ...manualNine.holes.map((h) => ({ par: h.par, score: h.score })),
      ...Array.from({ length: 9 }, () => ({ par: 4, score: "" })),
    ],
  }), [manualNine]);
  const manualNineSummary = useMemo(() => summarize(manualNineRound.holes), [manualNineRound]);
  const linkedThreeData = useMemo(() => {
    const holes = (linkedThree.holes || []).slice(0, 3).map((idx) => {
      const h = round.holes[idx] || {};
      return { hole: String(idx + 1), par: h.par ?? "", score: h.score ?? "" };
    });
    while (holes.length < 3) holes.push({ hole: "", par: "", score: "" });
    return { showHoleNumbers: linkedThree.showHoleNumbers !== false, holes };
  }, [linkedThree, round.holes]);

  const setMeta = (key, val) => setRound((r) => ({ ...r, [key]: val }));
  const setHC = (key, val) => setHoleCard((s) => ({ ...s, [key]: val }));
  const setTH = (key, val) => setThreeHole((s) => ({ ...s, [key]: val }));
  const setTHHole = (idx, key, val) =>
    setThreeHole((s) => ({
      ...s,
      holes: s.holes.map((h, i) => (i === idx ? { ...h, [key]: val } : h)),
    }));
  const setManualNineHole = (idx, key, val) =>
    setManualNine((s) => ({
      ...s,
      holes: s.holes.map((h, i) => (i === idx ? { ...h, [key]: val } : h)),
    }));
  const setLinkedThreeField = (key, val) => setLinkedThree((s) => ({ ...s, [key]: val }));
  const selectLinkedThreeGroup = (startIdx) =>
    setLinkedThree((s) => ({
      ...s,
      holes: [startIdx, startIdx + 1, startIdx + 2],
    }));

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

  // 코스(18홀 조합/단일 9홀) 선택 → par 채움. 단일 9홀은 OUT/IN에 같은 par를 적용한다.
  const applyPreset = (c) => {
    const source = Array.isArray(c.pars) ? c.pars.slice(0, 18) : [];
    const pars = source.length >= 18 ? source : source.length >= 9 ? [...source.slice(0, 9), ...source.slice(0, 9)] : source;
    if (c.holes === 9) setHoleRange("front");
    setRound((r) => ({
      ...r,
      course: c.club || c.name || r.course,
      holes: r.holes.map((h, i) => ({ ...h, par: String(pars[i] ?? h.par) })),
    }));
  };

  // 코스 DB (KV 원격)
  const [builtinCourses, setBuiltinCourses] = useState([]);
  // 즐겨찾기 (코스 이름 배열, localStorage)
  const [favorites, setFavorites] = useState([]);
  // KV 동기화 상태
  const [dbStatus, setDbStatus] = useState({ state: "loading", count: 0, at: null });
  const loadCourseDb = async () => {
    setDbStatus((s) => ({ ...s, state: "loading" }));
    try {
      const remote = await fetchDb();
      saveDb(remote);
      const courses = coursesFromDb(effectiveDb(remote));
      setBuiltinCourses(courses);
      setDbStatus({ state: "online", count: courses.length, at: new Date() });
    } catch {
      const courses = coursesFromDb(effectiveDb(loadDb()));
      setBuiltinCourses(courses);
      setDbStatus({ state: "offline", count: courses.length, at: new Date() });
    }
  };
  const loadedRef = useRef(false);
  useEffect(() => {
    loadCourseDb();
    try { setFavorites(JSON.parse(localStorage.getItem("sc-favorites") || "[]")); }
    catch { setFavorites([]); }
    // 라운드 스코어·홀카드 입력 복원
    try { const r = JSON.parse(localStorage.getItem("sc-round") || "null"); if (r && Array.isArray(r.holes)) setRound(r); } catch {}
    try { const hc = JSON.parse(localStorage.getItem("sc-holecard") || "null"); if (hc && typeof hc === "object") setHoleCard(hc); } catch {}
    try {
      const th = JSON.parse(localStorage.getItem("sc-threehole") || "null");
      if (th && Array.isArray(th.holes) && th.holes.length === 3) setThreeHole(th);
    } catch {}
    try {
      const mn = JSON.parse(localStorage.getItem("sc-manual-nine") || "null");
      if (mn && Array.isArray(mn.holes) && mn.holes.length === 9) setManualNine(mn);
    } catch {}
    try {
      const lt = JSON.parse(localStorage.getItem("sc-linked-three") || "null");
      if (lt && Array.isArray(lt.holes)) setLinkedThree(lt);
    } catch {}
    loadedRef.current = true;
  }, []);
  // 입력값 자동 저장 (새로고침해도 유지)
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-round", JSON.stringify(round)); }, [round]);
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-holecard", JSON.stringify(holeCard)); }, [holeCard]);
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-threehole", JSON.stringify(threeHole)); }, [threeHole]);
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-manual-nine", JSON.stringify(manualNine)); }, [manualNine]);
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-linked-three", JSON.stringify(linkedThree)); }, [linkedThree]);
  useEffect(() => { if (loadedRef.current) setSavedRoundAt(""); }, [round]);
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
  async function handleExport() {
    if (!captureRef.current) return;
    if (!canExport) return;
    const exportNode = captureRef.current.querySelector("svg") || captureRef.current;
    setBusy(true);
    try {
      await document.fonts?.ready;
      const dataUrl = await toPng(exportNode, {
        canvasWidth: size.w * exportScale,
        canvasHeight: size.h * exportScale,
        width: size.w,
        height: size.h,
        backgroundColor: "rgba(0,0,0,0)",
        cacheBust: true,
        style: { background: "transparent", maxWidth: "none", width: `${size.w}px`, height: `${size.h}px` },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      const name = ((reelsV3 ? "threehole" : round.player) || "scorecard").replace(/\s+/g, "_");
      a.download = `${name}_${isHole ? "hole" : reelsV3 ? "score_3hole" : isScore9 ? `score_9hole_${effRange}` : "score_18hole"}.png`;
      a.click();
    } catch (e) {
      alert("내보내기 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  const handleSaveRoundRecord = () => {
    if (!canSaveRound) return;
    createRoundRecordRemote(currentUser, round)
      .then((record) => setSavedRoundAt(record.savedAt))
      .catch(() => {
        const record = saveRoundRecord(round, currentUser);
        setSavedRoundAt(record.savedAt);
      });
  };

  const Front = round.holes.slice(0, 9);
  const Back = round.holes.slice(9, 18);

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="font-head text-[13px] font-semibold uppercase tracking-[0.28em] text-accent">
            Broadcast Overlay Maker · @dallu_golf
          </div>
          <a href="/" className="mt-1 block font-head text-[40px] font-bold uppercase leading-none tracking-tight text-txt transition hover:text-accent">
            Dallu Golf <span className="text-accent">Studio</span>
          </a>
          <p className="mt-2 text-sm text-txt-soft">
            골프 영상 편집용 스코어카드 오버레이를 메이저 대회 방송 스타일로 제작 · 투명 PNG로 내보내기
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {currentUser ? (
            <div className="hidden rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-txt-soft md:block">
              <span className="text-txt">{currentUser.name || currentUser.email}</span>
              <button type="button" onClick={logout} className="ml-2 text-txt-faint transition hover:text-txt">
                로그아웃
              </button>
            </div>
          ) : (
            <a href={`/login?next=${encodeURIComponent(isScore18 ? "/score-18" : isScore9 ? "/score-9" : isScore3 ? "/score-3" : "/hole")}`}
              className="rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-soft transition hover:text-txt">
              로그인
            </a>
          )}
          <button onClick={loadCourseDb} title="코스 DB 새로고침"
            className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold transition hover:text-txt">
            <span className={"inline-block h-2 w-2 rounded-full " +
              (dbStatus.state === "online" ? "bg-accent" : dbStatus.state === "offline" ? "bg-[#ffb648]" : "bg-txt-faint animate-pulse")} />
            <span className="text-txt-soft">
              {dbStatus.state === "online" ? `코스 DB 동기화됨 · ${dbStatus.count}` :
               dbStatus.state === "offline" ? "오프라인(캐시)" : "동기화 중…"}
            </span>
            <span className="text-txt-faint">↻</span>
          </button>
          <button onClick={toggleTheme} aria-label="테마 전환"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-soft transition hover:text-txt">
            <span className="text-base">{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "라이트" : "다크"}
          </button>
        </div>
      </div>

      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
            출력 선택
          </span>
          {[
            ["/score-18", "18홀"],
            ["/score-9", "9홀"],
            ["/score-3", "3홀"],
            ["/hole", "1홀"],
          ].map(([href, label]) => (
            <a key={href} href={href}
              className={"rounded-lg border px-3.5 py-2 text-sm font-semibold transition " +
                ((isScore18 && href === "/score-18") ||
                 (isScore9 && href === "/score-9") ||
                 (isScore3 && href === "/score-3") ||
                 (mode === "hole" && href === "/hole")
                  ? "border-accent bg-accent text-[#06210f]"
                  : "border-line bg-panel text-txt-soft hover:text-txt")}>
              {label}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            ["/records", "내 라운딩"],
            ["/admin", "코스 DB"],
            ["/login", currentUser ? "계정" : "로그인"],
          ].map(([href, label]) => (
            <a key={href} href={href}
              className="rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-txt-soft transition hover:text-txt">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(440px,500px)_1fr]">
        {/* ── 입력 패널 ── */}
        <section className="space-y-6">
          {isReelsSizedScore && (
            <div className="rounded-xl border border-line bg-panel p-4">
              <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
                스코어카드 설정
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-16 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">방식</div>
                  <div className="flex overflow-hidden rounded-lg border border-line">
                    {[["linked", "라운드 연동"], ["custom", "직접 입력"]].map(([key, label]) => (
                      <button key={key} onClick={() => setReelsSource(key)}
                        className={"px-4 py-1.5 text-sm font-semibold transition " +
                          (reelsSource === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {isLegacyReels && (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-16 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">종류</div>
                    <div className="flex overflow-hidden rounded-lg border border-line">
                      {[["v1", "9홀"], ["v3", "3홀"]].map(([key, label]) => (
                        <button key={key} onClick={() => setReelsVer(key)}
                          className={"px-4 py-1.5 text-sm font-semibold transition " +
                            (reelsVer === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 기본 정보 + 코스 (좌우 배치) */}
          {reelsCustom ? (
            reelsV3 ? (
              <ThreeHoleForm data={threeHole} setField={setTH} setHole={setTHHole} />
            ) : (
              <ManualNineForm data={manualNine} setHole={setManualNineHole} />
            )
          ) : isRoundEditor ? (
            <div className={!isHole ? "grid items-start gap-4 md:grid-cols-2" : ""}>
              <div className="rounded-xl border border-line bg-panel p-4">
                <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
                  기본 정보
                </div>
                <div className="grid grid-cols-1 gap-3">
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
              {!isHole && (
                <CoursePresets builtin={builtinCourses} favorites={favorites}
                               selectedClub={round.course}
                               onToggleFav={toggleFav} onLoad={applyPreset} />
              )}
            </div>
          ) : usesRoundSource ? (
            <RoundSourcePanel
              round={round}
              summary={summary}
              requiresScores={isReelsSizedScore}
              hasRoundData={hasRoundData}
              hasRoundScores={hasRoundScores}
            />
          ) : null}

          {/* 라운드 스코어카드: 홀별 입력 */}
          {isRoundEditor && !isHole && !reelsCustom && (
            <>
              <div className="rounded-xl border border-line bg-panel p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
                    스코어 입력
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex overflow-hidden rounded-lg border border-line">
                      {[["strokes", "타수"], ["relative", "파대비"]].map(([key, label]) => (
                        <button key={key} type="button" onClick={() => setScoreMode(key)}
                          className={"px-3 py-1 text-xs font-semibold transition " +
                            (scoreMode === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {currentUser ? (
                      <button type="button" onClick={handleSaveRoundRecord} disabled={!canSaveRound}
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-[#06210f] transition hover:bg-accent-2 disabled:opacity-50">
                        기록 저장
                      </button>
                    ) : (
                      <a href="/login?next=/score-18"
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-[#06210f] transition hover:bg-accent-2">
                        로그인 후 저장
                      </a>
                    )}
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
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <div className="text-[12px] text-txt-faint">
                    {!currentUser
                      ? "로그인하면 이메일 기준으로 라운딩 기록이 분리됩니다."
                      : savedRoundAt
                      ? `내 라운딩에 저장됨 · ${new Date(savedRoundAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
                      : "스코어를 입력한 뒤 라운딩 기록으로 저장할 수 있습니다."}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="/records"
                      className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:border-accent hover:text-txt">
                      내 라운딩
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
          {!isHole && reelsV3 && !reelsCustom && (
            <LinkedThreeHolePanel
              round={round}
              selected={linkedThree.holes || []}
              showHoleNumbers={linkedThree.showHoleNumbers !== false}
              onSelect={selectLinkedThreeGroup}
              onShowHoleNumbers={(v) => setLinkedThreeField("showHoleNumbers", v)}
            />
          )}

          {/* 홀 카드: 현재 홀 정보 (홀 카드 레이아웃 전용) */}
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
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-head text-[11px] uppercase tracking-widest text-txt-faint">거리</span>
                    <div className="flex overflow-hidden rounded-md border border-line">
                      {[["m", "M"], ["yd", "YD"]].map(([u, l]) => (
                        <button key={u} type="button" onClick={() => setHC("unit", u)}
                          className={"px-2 py-0.5 text-[11px] font-bold transition " +
                            (holeCard.unit === u ? "bg-accent text-[#06210f]" : "bg-panel-2 text-txt-soft hover:text-txt")}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input value={holeCard.distance} onChange={(e) => setHC("distance", e.target.value)}
                    placeholder={holeCard.unit === "yd" ? "212" : "195"}
                    className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none focus:border-accent" />
                </div>
                <Field label="토탈 (E, -2...)" value={holeCard.toPar} onChange={(v) => setHC("toPar", v)} placeholder="E" />
                <Field label="현재 타수" value={holeCard.currentShot} onChange={(v) => setHC("currentShot", v)} placeholder="4" />
                <ClubField value={holeCard.club} onChange={(v) => setHC("club", v)} />
              </div>
              <label className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-txt-soft">
                <input
                  type="checkbox"
                  checked={holeCard.showResultBanner !== false}
                  onChange={(e) => setHC("showResultBanner", e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                FOR EAGLE/BIRDIE 배너 표시
              </label>
              {/* 현재 타수 선택 */}
              <div className="mt-3">
                <span className="mb-1.5 block font-head text-[11px] uppercase tracking-widest text-accent">
                  현재 타수 (지금까지 친 횟수)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: Math.min(Math.max((Number(holeCard.par) || 4) + 2, 6), 9) }, (_, i) => i + 1).map((n) => (
                    <button key={n} type="button" onClick={() => setHC("currentShot", String(n))}
                      className={"h-9 w-9 rounded-md font-mono text-sm font-bold transition " +
                        (String(n) === String(holeCard.currentShot)
                          ? "bg-accent text-[#06210f]"
                          : "border border-line bg-panel-2 text-txt-soft hover:text-txt")}>
                      {n}
                    </button>
                  ))}
                  <button type="button" onClick={() => setHC("currentShot", "")}
                    className="h-9 rounded-md border border-line bg-panel-2 px-3 text-xs font-semibold text-txt-faint hover:text-txt">
                    없음
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[12px] text-txt-faint">
                홀 선택 → PAR·토탈·타수 자동 반영 · 거리/클럽은 직접 입력
              </p>
            </div>
          )}
        </section>

        {/* ── 미리보기 & 내보내기 ── */}
        <section>
          {/* 9홀 범위 */}
          {isScore9 && !reelsCustom && (
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">범위</div>
              <div className="flex overflow-hidden rounded-lg border border-line">
                {availableRanges.map(([key, label]) => (
                  <button key={key} onClick={() => setHoleRange(key)}
                    className={"px-4 py-1.5 text-sm font-semibold transition " +
                      (effRange === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-panel px-3 py-2">
            <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
              미리보기 <span className="text-txt-faint">(투명 배경)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-line">
                {[["dark", "다크"], ["light", "라이트"]].map(([key, label]) => (
                  <button key={key} onClick={() => setCardTheme(key)}
                    className={"px-3 py-1.5 text-xs font-bold " +
                      (cardTheme === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex overflow-hidden rounded-lg border border-line">
                {QUALITY.map((qz) => (
                  <button key={qz.scale} onClick={() => setExportScale(qz.scale)}
                    title={`${qz.desc} · ${size.w * qz.scale}×${size.h * qz.scale}px`}
                    className={"px-3 py-1.5 text-xs font-bold " +
                      (exportScale === qz.scale ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                    {qz.label}
                  </button>
                ))}
              </div>
              <button onClick={handleExport} disabled={busy || !canExport}
                title={!canExport ? "필수 입력을 먼저 완료하세요" : "PNG 다운로드"}
                className="rounded-lg bg-accent px-4 py-1.5 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60">
                {busy ? "생성 중…" : !canExport ? "입력 필요" : "PNG 다운로드"}
              </button>
            </div>
          </div>

          <div className="checker overflow-hidden rounded-xl border border-line p-6">
            <div ref={captureRef} className="preview-svg mx-auto w-full"
                 style={{ maxWidth: previewMaxWidth }}>
              {isHole
                ? <HoleCard data={holeData} theme={cardTheme} />
                : reelsV3
                ? <ReelsThreeHoleCard data={reelsCustom ? threeHole : linkedThreeData} theme={cardTheme} />
                : reelsCustom
                ? <ReelsScorecard round={manualNineRound} summary={manualNineSummary} range="front" theme={cardTheme} />
                : (() => { const C = FORMATS[format].Comp; return <C round={round} summary={summary} range={effRange} theme={cardTheme} />; })()}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-panel p-4 text-sm text-txt-soft">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <b className="text-txt">출력</b>
              <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[12px] font-bold text-accent">
                {(QUALITY.find((x) => x.scale === exportScale) || {}).label}
              </span>
              <span className="font-mono text-[13px]">투명 PNG · {size.w * exportScale}×{size.h * exportScale}px</span>
            </div>
            <div className="mt-2 text-[12px] text-txt-faint">
              색상: 버디=빨강 / 이글=골드 / 보기=파랑 · 방송 관례 기준
            </div>
            {!canExport && exportBlockReason && (
              <div className="mt-2 rounded-md border border-[#ffb648]/40 bg-[#ffb648]/10 px-2.5 py-1.5 text-[12px] font-semibold text-[#ffb648]">
                {exportBlockReason}
              </div>
            )}
          </div>

          {/* 실제 화면 배치 미리보기 */}
          {!isHole && (
            <div className="mt-6">
              <div className="mb-2 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
                실제 배치 미리보기
                <span className="ml-2 normal-case tracking-normal text-txt-faint">
                  {format === "youtube" ? "16:9 영상 기준" : "9:16 영상 기준"}
                </span>
              </div>
              <PlacementPreview format={format} size={size}>
                {reelsV3
                  ? <ReelsThreeHoleCard data={reelsCustom ? threeHole : linkedThreeData} theme={cardTheme} />
                  : reelsCustom
                  ? <ReelsScorecard round={manualNineRound} summary={manualNineSummary} range="front" theme={cardTheme} />
                  : (() => { const C = FORMATS[format].Comp; return <C round={round} summary={summary} range={effRange} theme={cardTheme} />; })()}
              </PlacementPreview>
              <p className="mt-2 text-[12px] text-txt-faint">
                실제 영상 위 배치 예시입니다 — 편집 프로그램에서 크기·위치는 자유롭게 조절하세요. (권장: 하단 배치)
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// 스코어카드 이미지 업로드 + 미리보기 + 추출
// par 빠른 지정: 3/4/5 인라인 세그먼트 — 회색 명도로 구분 (초록X)
// 실제 화면 배치 미리보기: 유튜브(16:9)/릴스(9:16) 목업 위에 오버레이를 여백 둔 예시 크기로 배치
function PlacementPreview({ format, size, children }) {
  const isYt = format === "youtube";
  // 유튜브 9홀 카드는 18홀보다 가로가 짧으므로 배치 폭도 비례
  const overlayPct = isYt ? 82 * (size.w / 1761) : 88 * (size.w / 1080);
  // 유튜브: 좌측 상단 / 릴스: 상단(인스타 상단 버튼과 안 겹치게 더 아래로)
  const pos = isYt
    ? { left: "3%", top: "5%" }
    : { left: "50%", top: "14%", transform: "translateX(-50%)" };
  return (
    <div className={"mx-auto w-full " + (isYt ? "max-w-[560px]" : "max-w-[300px]")}>
      <div className="relative overflow-hidden rounded-2xl border border-line shadow-xl"
           style={{ aspectRatio: isYt ? "16 / 9" : "9 / 16",
                    background: "linear-gradient(150deg,#1b2733 0%,#0e151d 45%,#161f2b 100%)" }}>
        {/* 영상 자리 표시 */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-txt-faint">
          <span className="text-2xl opacity-40">▶</span>
          <span className="font-mono text-[10px] tracking-widest opacity-50">{isYt ? "1920 × 1080" : "1080 × 1920"}</span>
        </div>
        {/* 릴스 UI 힌트(우측 액션 · 하단 캡션바) */}
        {!isYt && (
          <>
            <div className="pointer-events-none absolute bottom-24 right-2 flex flex-col items-center gap-3 opacity-40">
              {["♥", "💬", "↗", "⋯"].map((s, i) => <span key={i} className="text-lg">{s}</span>)}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        )}
        {isYt && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-black/40" />
        )}
        {/* 오버레이 (여백 둔 예시 배치) */}
        <div className="preview-svg absolute" style={{ ...pos, width: overlayPct + "%" }}>
          {children}
        </div>
      </div>
    </div>
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

// 코스: 즐겨찾기 + 기본정보에서 고른 골프장(selectedClub)의 코스만 표시.
function CoursePresets({ builtin = [], favorites = [], selectedClub = "", onToggleFav, onLoad }) {
  const clubs = [...new Set(builtin.map((c) => c.club || c.name))];
  const sel = (selectedClub || "").trim();
  const activeClub = clubs.includes(sel) ? sel : "";
  const clubCourses = builtin.filter((c) => (c.club || c.name) === activeClub);
  const favCourses = builtin.filter((c) => favorites.includes(c.name));
  const courseLabel = (c) => (c.out && c.in ? `${c.out}+${c.in}` : c.out || c.name);
  const courseMeta = (c) => c.holes === 9 ? "9H · OUT/IN 반복" : "18H";

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
                <button type="button" onClick={() => onLoad(c)} className="text-txt hover:text-accent">
                  {c.name}
                  <span className="ml-1 font-mono text-[10px] text-txt-faint">{courseMeta(c)}</span>
                </button>
                <Star name={c.name} />
              </span>
            ))}
          </div>
        </div>
      )}

      {!activeClub ? (
        <p className="text-[12px] text-txt-faint">기본 정보에서 <b className="text-txt-soft">골프장을 선택</b>하면 코스가 표시됩니다.</p>
      ) : clubCourses.length === 0 ? (
        <p className="text-[12px] text-txt-faint">{activeClub} · 등록된 코스가 없습니다.</p>
      ) : (
        <div>
          <div className="mb-1.5 text-[12px] text-txt-soft">{activeClub} · 코스 선택</div>
          <div className="flex flex-col gap-1.5">
            {clubCourses.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-2 rounded-lg border border-line-2 bg-panel-2 py-1.5 pl-3 pr-1.5 text-sm">
                <button type="button" onClick={() => onLoad(c)} className="flex-1 text-left font-semibold text-txt hover:text-accent">
                  {courseLabel(c)}
                  <span className="ml-2 font-mono text-[10px] font-medium text-txt-faint">{courseMeta(c)}</span>
                </button>
                <Star name={c.name} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoundSourcePanel({ round, summary, requiresScores = false, hasRoundData = false, hasRoundScores = false }) {
  const toPar = summary.thru > 0 ? toParLabel(summary.toPar) : "";
  const needsInput = !hasRoundData || (requiresScores && !hasRoundScores);

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
          라운드 데이터
        </div>
        <a href="/score-18"
          className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:border-accent hover:text-txt">
          {hasRoundData ? "18홀 수정" : "18홀 입력"}
        </a>
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
    </div>
  );
}

function ThreeHoleForm({ data, setField, setHole }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        3홀 카드 수동 입력
      </div>
      <label className="mb-3 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-txt-soft">
        <input type="checkbox" checked={data.showHoleNumbers !== false}
          onChange={(e) => setField("showHoleNumbers", e.target.checked)}
          className="h-4 w-4 accent-[var(--color-accent)]" />
        홀 번호 표시
      </label>

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-[54px_repeat(3,minmax(0,1fr))] border-b border-line bg-panel-2 text-center font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
          <div className="py-2">입력</div>
          {[1, 2, 3].map((n) => <div key={n} className="border-l border-line py-2">Hole {n}</div>)}
        </div>
        {[
          ["hole", "홀", "1"],
          ["par", "PAR", "4"],
          ["score", "타수", "4"],
        ].map(([key, label, placeholder]) => (
          <div key={key} className="grid grid-cols-[54px_repeat(3,minmax(0,1fr))] border-b border-line last:border-b-0">
            <div className="flex items-center justify-center bg-panel-2 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
              {label}
            </div>
            {data.holes.map((hole, i) => (
              <input key={i} value={hole[key] || ""} onChange={(e) => setHole(i, key, e.target.value)}
                placeholder={placeholder}
                inputMode={key === "hole" ? "text" : "numeric"}
                className="border-l border-line bg-transparent px-2 py-2.5 text-center font-mono text-sm font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent" />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Field label="TO PAR 직접입력" value={data.toPar} onChange={(v) => setField("toPar", v)} placeholder="자동 계산" />
      </div>
    </div>
  );
}

function LinkedThreeHolePanel({ round, selected, showHoleNumbers, onSelect, onShowHoleNumbers }) {
  const selectedStart = Array.isArray(selected) && selected.length === 3 ? Math.min(...selected) : 0;
  const groupLabel = (start) => {
    const a = start + 1;
    const b = start + 2;
    const c = start + 3;
    return c <= 9 ? `${a}${b}${c}` : `${a}-${c}`;
  };
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
            3홀 선택
          </div>
          <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-bold text-accent">
            {groupLabel(selectedStart)}
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-txt-soft">
          <input type="checkbox" checked={showHoleNumbers}
            onChange={(e) => onShowHoleNumbers(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]" />
          홀 번호 표시
        </label>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {round.holes.map((h, i) => {
          const start = Math.min(i, Math.max(round.holes.length - 3, 0));
          const active = Array.isArray(selected) && selected.includes(i);
          const has = h.score !== "" && h.score != null;
          return (
            <button key={i} type="button" onClick={() => onSelect(start)}
              title={`${start + 1}-${start + 3}번 홀 묶음 선택`}
              className={"rounded-md py-1.5 text-center font-mono text-[13px] font-bold transition " +
                (active
                  ? "bg-accent text-[#06210f]"
                  : has
                  ? "border border-accent/40 bg-panel-2 text-accent hover:border-accent"
                  : "border border-line bg-panel-2 text-txt-faint hover:text-txt")}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-[11px] text-txt-faint">
        시작 홀을 누르면 연속된 3홀이 선택됩니다. 예: 2번 선택 → 234.
      </div>
    </div>
  );
}

function ManualNineForm({ data, setHole }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="mb-3 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
        9홀 직접 입력
      </div>
      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid" style={{ gridTemplateColumns: "54px repeat(9, minmax(0,1fr))" }}>
          <div className="flex items-center justify-center bg-panel-2 py-2 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
            홀
          </div>
          {data.holes.map((hole, i) => (
            <input key={i} value={hole.hole || ""} onChange={(e) => setHole(i, "hole", e.target.value)}
              placeholder={String(i + 1)}
              className="border-l border-line bg-panel-2 px-1 py-2 text-center font-mono text-[12px] font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10" />
          ))}
          <div className="flex items-center justify-center border-t border-line bg-panel-2 py-2 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
            PAR
          </div>
          {data.holes.map((hole, i) => (
            <input key={i} value={hole.par || ""} onChange={(e) => setHole(i, "par", e.target.value)}
              placeholder="4" inputMode="numeric"
              className="border-l border-t border-line bg-transparent px-1 py-2 text-center font-mono text-sm font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10" />
          ))}
          <div className="flex items-center justify-center border-t border-line bg-panel-2 py-2 font-head text-[11px] font-semibold uppercase tracking-widest text-txt-faint">
            타수
          </div>
          {data.holes.map((hole, i) => (
            <input key={i} value={hole.score || ""} onChange={(e) => setHole(i, "score", e.target.value)}
              placeholder="-" inputMode="numeric"
              className="border-l border-t border-line bg-transparent px-1 py-2 text-center font-mono text-sm font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

const CLUB_DEFAULTS = ["Driver", "Wood", "Hybrid", "Iron", "Wedge", "Putter"];
const CLUB_OPTIONS = [
  "Driver",
  "3 Wood", "5 Wood", "7 Wood",
  "2 Hybrid", "3 Hybrid", "4 Hybrid", "5 Hybrid", "6 Hybrid",
  "3 Iron", "4 Iron", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron", "10 Iron",
  "Pitching Wedge", "Gap Wedge", "Sand Wedge", "Lob Wedge",
  "Putter",
];

function clubSuggestions(value) {
  const q = String(value || "").trim().toLowerCase();
  if (!q) return CLUB_DEFAULTS;
  const number = q.match(/\d+/)?.[0];
  if (number) return [`${number} Wood`, `${number} Hybrid`, `${number} Iron`];
  const compact = q.replace(/\s+/g, "");
  return CLUB_OPTIONS.filter((club) => {
    const s = club.toLowerCase();
    return s.includes(q) || s.replace(/\s+/g, "").includes(compact);
  }).slice(0, 6);
}

function ClubField({ value, onChange }) {
  const suggestions = clubSuggestions(value);
  return (
    <label className="col-span-2 block">
      <span className="mb-1 block font-head text-[11px] uppercase tracking-widest text-txt-faint">
        선택 클럽
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="3, Driver, Putter"
        className="w-full rounded-lg border border-line-2 bg-panel-2 px-3 py-2 text-sm text-txt outline-none transition placeholder:text-txt-faint focus:border-accent" />
      <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
        {suggestions.map((club) => (
          <button key={club} type="button" onClick={() => onChange(club)}
            className={"shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition " +
              (String(value).toLowerCase() === club.toLowerCase()
                ? "border-accent bg-accent text-[#06210f]"
                : "border-line bg-panel-2 text-txt-soft hover:border-accent hover:text-txt")}>
            {club}
          </button>
        ))}
      </div>
    </label>
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
  const isBack = offset === 9;
  const parSum = holes.reduce((a, h) => a + (Number(h.par) || 0), 0);
  const scoreSum = holes.reduce((a, h) => a + (Number(h.score) || 0), 0);
  const hasScore = holes.some((h) => h.score !== "" && h.score != null);
  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-line last:mb-0">
      <div className="grid" style={{ gridTemplateColumns: "46px repeat(9, minmax(0,1fr)) 50px" }}>
        {/* 홀 번호 헤더 (칸 위) */}
        <div className="flex items-center justify-center bg-panel py-1.5 font-head text-[10px] font-bold uppercase tracking-wider text-accent">
          {isBack ? "IN" : "OUT"}
        </div>
        {holes.map((h, i) => (
          <div key={"n" + i} className="flex items-center justify-center border-l border-line bg-panel py-1.5 font-mono text-[11px] font-semibold text-txt-soft">
            {offset + i + 1}
          </div>
        ))}
        <div className="flex items-center justify-center border-l border-line bg-panel py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-txt-faint">
          합
        </div>

        {/* PAR 행 */}
        <div className="flex items-center justify-center border-t border-line bg-panel-2 py-1 font-mono text-[10px] uppercase tracking-wider text-txt-faint">
          PAR
        </div>
        {holes.map((h, i) => (
          <div key={"p" + i} className="flex items-center justify-center border-l border-t border-line bg-panel-2 py-1 font-mono text-sm font-semibold text-txt-soft">
            {h.par || "–"}
          </div>
        ))}
        <div className="flex items-center justify-center border-l border-t border-line bg-panel-2 py-1 font-mono text-sm font-bold text-txt">
          {parSum || "–"}
        </div>

        {/* 스코어 입력 행 */}
        <div className="flex items-center justify-center border-t border-line py-1 font-mono text-[10px] uppercase tracking-wider text-txt-faint">
          {scoreMode === "relative" ? "파대비" : "타수"}
        </div>
        {holes.map((h, i) => {
          const idx = offset + i;
          return (
            <div key={"s" + i} className="border-l border-t border-line">
              <ScoreInput idx={idx} par={h.par} score={h.score} mode={scoreMode}
                setHole={setHole} scoreRefs={scoreRefs} onScoreKey={onScoreKey} />
            </div>
          );
        })}
        <div className="flex items-center justify-center border-l border-t border-line font-mono text-base font-bold text-txt">
          {hasScore ? scoreSum : "–"}
        </div>
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
      className="w-full bg-transparent py-2.5 text-center font-mono text-lg font-bold text-txt outline-none placeholder:text-txt-faint focus:bg-accent/10 focus:ring-1 focus:ring-inset focus:ring-accent"
    />
  );
}
