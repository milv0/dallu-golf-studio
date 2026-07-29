"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import HoleByHoleStrip, { sizeFor as ytSizeFor } from "../presets/HoleByHoleStrip";
import ReelsScorecard, { sizeFor as reelsSizeFor } from "../presets/ReelsScorecard";
import HoleCard, { sizeFor as holeSizeFor } from "../presets/HoleCard";
import ReelsThreeHoleCard, { SIZE as SIZE_REELS_THREE } from "../presets/ReelsThreeHoleCard";
import { emptyRound, summarize, toParLabel, cumulativeToPar } from "../../lib/score";
import { COURSE_DIRECTORY } from "../../lib/courseDirectory";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import HomeHub from "./HomeHub";
import CoursePresets from "./CoursePresets";
import { ManualNineForm, ThreeHoleForm, LinkedThreeHolePanel } from "./ManualScoreForms";
import PlacementPreview from "./PlacementPreview";
import RoundSourcePanel from "./RoundSourcePanel";
import HoleGroup from "./RoundScoreGrid";
import { RelativeScoreHint } from "./ScoreInputs";
import { ClubAutocomplete, Field } from "./StudioFields";
import StudioNav from "./StudioNav";
import HoleCardForm from "./HoleCardForm";

// 미리보기 표시 높이 상한 — 세로 포맷(릴스)이 과도하게 커 보이지 않도록 균형
const PREVIEW_MAX_H = 340;
const COURSE_DB_ENABLED = false;
const REELS_SOURCE_SWITCH_ENABLED = false;

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
  showHoleNumbers: false,
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
  showHoleNumbers: false,
  holes: [0, 1, 2],
});

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
  const [reelsSource, setReelsSource] = useState(() => (mode === "score9" || mode === "score3" ? "custom" : "linked")); // 'linked' | 'custom'
  const [cardTheme, setCardTheme] = useState("light"); // 카드(프리셋) 색 테마
  const [exportScale, setExportScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState("light");
  const [scoreMode, setScoreMode] = useState("relative"); // 'strokes' | 'relative' (기본: 파대비)
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
  const activeNav = isScore18 ? "score18" : isScore9 ? "score9" : isScore3 ? "score3" : isHole ? "hole" : "";
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
  const resetRound = () => {
    if (typeof window !== "undefined" && !window.confirm("18홀 스코어카드를 초기화할까요?")) return;
    const next = emptyRound();
    setRound(next);
    setHoleRange("all");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sc-round", JSON.stringify(next));
    }
  };

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

  // 코스 DB 자동 불러오기는 공개 배포 전까지 비활성화한다.
  const [builtinCourses, setBuiltinCourses] = useState([]);
  // 즐겨찾기 (코스 이름 배열, localStorage)
  const [favorites, setFavorites] = useState([]);
  // KV 동기화 상태
  const [dbStatus, setDbStatus] = useState({ state: "disabled", count: 0, at: null });
  const loadCourseDb = () => {
    setBuiltinCourses([]);
    setDbStatus({ state: "disabled", count: 0, at: null });
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
      if (th && Array.isArray(th.holes) && th.holes.length === 3) setThreeHole({ ...th, showHoleNumbers: false });
    } catch {}
    try {
      const mn = JSON.parse(localStorage.getItem("sc-manual-nine") || "null");
      if (mn && Array.isArray(mn.holes) && mn.holes.length === 9) setManualNine(mn);
    } catch {}
    try {
      const lt = JSON.parse(localStorage.getItem("sc-linked-three") || "null");
      if (lt && Array.isArray(lt.holes)) setLinkedThree({ ...lt, showHoleNumbers: false });
    } catch {}
    loadedRef.current = true;
  }, []);
  // 입력값 자동 저장 (새로고침해도 유지)
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-round", JSON.stringify(round)); }, [round]);
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-holecard", JSON.stringify(holeCard)); }, [holeCard]);
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-threehole", JSON.stringify(threeHole)); }, [threeHole]);
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-manual-nine", JSON.stringify(manualNine)); }, [manualNine]);
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-linked-three", JSON.stringify(linkedThree)); }, [linkedThree]);
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

  const Front = round.holes.slice(0, 9);
  const Back = round.holes.slice(9, 18);

  return (
    <main className="mx-auto max-w-[1500px] px-5 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-5 flex flex-col items-start justify-between gap-4 border-b border-line pb-5 sm:mb-6 sm:flex-row sm:items-end">
        <div>
          <div className="font-head text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-accent sm:text-[13px] sm:tracking-[0.28em]">
            Broadcast Overlay Maker · @dallu_golf
          </div>
          <a href="/" className="mt-1 block font-head text-[34px] font-bold uppercase leading-none tracking-tight text-txt transition hover:text-accent sm:text-[40px]">
            Dallu Golf <span className="text-accent">Studio</span>
          </a>
          <p className="mt-2 hidden text-sm text-txt-soft sm:block">
            골프 영상 편집용 스코어카드 오버레이를 메이저 대회 방송 스타일로 제작 · 투명 PNG로 내보내기
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
          {currentUser ? (
            <div className="hidden rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-txt-soft md:block">
              <span className="text-txt">{currentUser.name || currentUser.email}</span>
              <button type="button" onClick={logout} className="ml-2 text-txt-faint transition hover:text-txt">
                로그아웃
              </button>
            </div>
          ) : (
            <button type="button" disabled
              className="cursor-not-allowed rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-faint opacity-70 sm:px-3.5 sm:py-2 sm:text-sm">
              로그인 준비 중
            </button>
          )}
          <button onClick={toggleTheme} aria-label="테마 전환"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-txt-soft transition hover:text-txt sm:px-3.5 sm:py-2 sm:text-sm">
            <span className="text-base">{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "라이트" : "다크"}
          </button>
        </div>
      </div>

      <StudioNav active={activeNav} currentUser={currentUser} />

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
                  <div className="w-16 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">입력</div>
                  <div className="flex overflow-hidden rounded-lg border border-line">
                    {[["linked", "18홀 연동"], ["custom", "직접 입력"]].map(([key, label]) => (
                      <button key={key} disabled={!REELS_SOURCE_SWITCH_ENABLED}
                        onClick={() => REELS_SOURCE_SWITCH_ENABLED && setReelsSource(key)}
                        className={"px-4 py-1.5 text-sm font-semibold transition " +
                          (!REELS_SOURCE_SWITCH_ENABLED
                            ? reelsSource === key
                              ? "cursor-not-allowed bg-panel-2 text-txt-soft"
                              : "cursor-not-allowed bg-panel text-txt-faint opacity-60"
                            : reelsSource === key
                            ? "bg-accent text-[#06210f]"
                            : "bg-panel text-txt-soft hover:text-txt")}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-txt-faint">전환 준비 중</span>
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
                               disabled={!COURSE_DB_ENABLED}
                               dbStatus={dbStatus} onRefresh={COURSE_DB_ENABLED ? loadCourseDb : null}
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
                    <button type="button" disabled
                      className="cursor-not-allowed rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-txt-faint opacity-70">
                      기록 저장 준비 중
                    </button>
                    <button type="button" onClick={resetRound}
                      className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-txt-soft transition hover:border-[#ff6b57] hover:text-[#ff6b57]">
                      초기화
                    </button>
                  </div>
                </div>
                {scoreMode === "relative" && (
                  <RelativeScoreHint />
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
                    라운딩 기록 저장은 준비 중입니다.
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled
                      className="cursor-not-allowed rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-semibold text-txt-faint opacity-70">
                      내 라운딩 준비 중
                    </button>
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

          {isHole && (
            <HoleCardForm
              round={round}
              holeCard={holeCard}
              setHC={setHC}
              loadHoleFromRound={loadHoleFromRound}
            />
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
              색상: 버디=빨강 / 이글=골드 / 보기=파랑
            </div>
            {!canExport && exportBlockReason && (
              <div className="mt-2 rounded-md border border-[#ffb648]/40 bg-[#ffb648]/10 px-2.5 py-1.5 text-[12px] font-semibold text-[#ffb648]">
                {exportBlockReason}
              </div>
            )}
          </div>

          {/* 실제 화면 배치 미리보기 */}
          <div className="mt-6">
            <div className="mb-2 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft">
              실제 배치 미리보기
              <span className="ml-2 normal-case tracking-normal text-txt-faint">
                {format === "youtube" ? "16:9 영상 기준" : "9:16 영상 기준"}
              </span>
            </div>
            <PlacementPreview format={format} size={size} isHole={isHole}>
              {isHole
                ? <HoleCard data={holeData} theme={cardTheme} />
                : reelsV3
                ? <ReelsThreeHoleCard data={reelsCustom ? threeHole : linkedThreeData} theme={cardTheme} />
                : reelsCustom
                ? <ReelsScorecard round={manualNineRound} summary={manualNineSummary} range="front" theme={cardTheme} />
                : (() => { const C = FORMATS[format].Comp; return <C round={round} summary={summary} range={effRange} theme={cardTheme} />; })()}
            </PlacementPreview>
          </div>
        </section>
      </div>
    </main>
  );
}
