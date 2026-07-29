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
import { RelativeScoreHint, ScoreModeToggle } from "./ScoreInputs";
import { ClubAutocomplete, Field } from "./StudioFields";
import StudioShell from "./StudioShell";
import HoleCardForm from "./HoleCardForm";
import PanelHeader, { ResetButton } from "./PanelHeader";

// 미리보기 표시 높이 상한 — 세로 포맷(릴스)이 과도하게 커 보이지 않도록 균형
const PREVIEW_MAX_H = 380;
const PREVIEW_MOBILE_MAX_H = 460;
const COURSE_DB_ENABLED = false;
const DEFAULT_CUSTOM_PLAYER = "PLAYER";

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
  player: "", hole: "", par: "", distance: "", toPar: "", currentShot: "", club: "", unit: "m", showResultBanner: true,
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
  player: "",
  holes: Array.from({ length: 9 }, (_, i) => ({ hole: String(i + 1), par: "4", score: "" })),
});

const emptyLinkedThree = () => ({
  showHoleNumbers: false,
  holes: [0, 1, 2],
});

function BasicInfoPanel({ title = "기본 정보", data, setMeta, clubNameList }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-3 md:p-4">
      <div className="mb-2 font-head text-sm font-semibold uppercase tracking-widest text-txt-soft md:mb-3">
        {title}
      </div>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
        <Field label="선수명" full value={data.player}
               onChange={(v) => setMeta("player", v)} placeholder="선수 이름 입력" />
        <ClubAutocomplete value={data.course} onChange={(v) => setMeta("course", v)}
          onPick={(v) => setMeta("course", v)} options={clubNameList} />
        <Field label="날짜" type="date" value={data.date}
               onChange={(v) => setMeta("date", v)} />
      </div>
    </div>
  );
}

function CustomPlayerControl({ value, onChange }) {
  return (
    <label className="flex min-w-[160px] items-center gap-2 rounded-lg border border-line bg-panel-2 px-2 py-1">
      <span className="font-head text-[10px] font-semibold uppercase tracking-widest text-txt-faint">
        이름
      </span>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={DEFAULT_CUSTOM_PLAYER}
        className="min-w-0 flex-1 bg-transparent text-right font-head text-sm font-bold uppercase text-txt outline-none placeholder:text-txt-faint"
      />
    </label>
  );
}

function initialSourceMode(mode) {
  if (typeof window !== "undefined") {
    const source = new URLSearchParams(window.location.search).get("source");
    if (source === "linked") return "round";
    if (source === "custom") return "custom";
  }
  return mode === "round" ? "round" : "custom";
}

export default function StudioApp({ mode = "home" } = {}) {
  return mode === "home" ? <HomeHub /> : <StudioWorkspace mode={mode} />;
}

function StudioWorkspace({ mode }) {
  const [round, setRound] = useState(emptyRound);
  const [customRound, setCustomRound] = useState(emptyRound);
  const [holeCard, setHoleCard] = useState(emptyHoleCard);
  const [customHoleCard, setCustomHoleCard] = useState(emptyHoleCard);
  const [threeHole, setThreeHole] = useState(emptyThreeHoleCard);
  const [manualNine, setManualNine] = useState(emptyManualNine);
  const [linkedThree, setLinkedThree] = useState(emptyLinkedThree);
  const [holeRange, setHoleRange] = useState("all"); // 'all' | 'front' | 'back'
  const [sourceMode, setSourceMode] = useState(() => initialSourceMode(mode)); // 'round' | 'custom'
  const [cardTheme, setCardTheme] = useState("light"); // 카드(프리셋) 색 테마
  const [exportScale, setExportScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState("light");
  const [scoreMode, setScoreMode] = useState("strokes"); // 'strokes' | 'relative' (기본: 타수)
  const [currentUser, setCurrentUser] = useState(null);
  const captureRef = useRef(null);
  const scoreRefs = useRef([]);

  const isHole = mode === "hole";
  const isScore18 = mode === "score18" || mode === "round";
  const isScore3 = mode === "score3";
  const isScore9 = mode === "score9";
  const isReelsSizedScore = isScore9 || isScore3;
  const isFullCustom = sourceMode === "custom";
  const format = isReelsSizedScore ? "reels" : "youtube";
  const reelsV3 = isScore3;
  const reelsCustom = isReelsSizedScore && isFullCustom;
  const isRoundEditor = isScore18;
  const usesRoundSource = !isFullCustom && ((isReelsSizedScore && !reelsCustom) || mode === "hole");
  const customDisplayRound = useMemo(() => ({
    ...customRound,
    player: (customRound.player || "").trim() || DEFAULT_CUSTOM_PLAYER,
    course: "",
    date: "",
  }), [customRound]);
  const scoreRound = isFullCustom ? customDisplayRound : round;
  const linkedHoleCard = useMemo(() => {
    const n = Number(holeCard.hole);
    if (!n) return holeCard;
    const idx = n - 1;
    const h = round.holes[idx];
    if (!h) return holeCard;
    const hasScore = h.score !== "" && h.score != null;
    return {
      ...holeCard,
      par: String(h.par ?? holeCard.par ?? ""),
      currentShot: hasScore ? String(h.score) : holeCard.currentShot,
      toPar: hasScore ? toParLabel(cumulativeToPar(round.holes, idx)) : holeCard.toPar,
    };
  }, [holeCard, round.holes]);
  const activeHoleCard = isFullCustom ? customHoleCard : linkedHoleCard;
  const holeData = {
    ...activeHoleCard,
    player: isFullCustom ? ((customHoleCard.player || "").trim() || DEFAULT_CUSTOM_PLAYER) : scoreRound.player,
  };
  const customHoleSelectorRound = useMemo(() => ({
    holes: Array.from({ length: 18 }, () => ({ par: "4", score: "" })),
  }), []);
  const activeNav = isScore18 ? "score18" : isScore9 ? "score9" : isScore3 ? "score3" : isHole ? "hole" : "";
  // 18홀은 전체 고정, 9홀만 전반/후반을 선택한다.
  const availableRanges = RANGES.filter(([k]) => k !== "all");
  const effRange = isScore18 ? "all" : isReelsSizedScore && holeRange === "all" ? "front" : holeRange;
  const size = isHole ? holeSizeFor(holeData) : reelsV3 ? SIZE_REELS_THREE : FORMATS[format].sizeFor(effRange);
  const previewMaxWidth = Math.min(size.w, PREVIEW_MAX_H * (size.w / size.h)) * (reelsV3 ? 0.9 : 1);
  const previewMobileMaxWidth = Math.min(size.w, PREVIEW_MOBILE_MAX_H * (size.w / size.h));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const source = new URLSearchParams(window.location.search).get("source");
    if (source === "custom") {
      setSourceMode("custom");
      return;
    }
    if (source === "linked") {
      setSourceMode("round");
      return;
    }
    setSourceMode(mode === "round" ? "round" : "custom");
  }, [mode]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  const summary = useMemo(() => summarize(round.holes), [round]);
  const customSummary = useMemo(() => summarize(customRound.holes), [customRound]);
  const activeSummary = isFullCustom ? customSummary : summary;
  const hasRoundMeta = isFullCustom
    ? Boolean((customRound.player || "").trim())
    : Boolean((scoreRound.player || "").trim() || (scoreRound.course || "").trim() || (scoreRound.date || "").trim());
  const hasRoundScores = activeSummary.thru > 0;
  const hasRoundData = hasRoundMeta || hasRoundScores;
  const linkedThreeCount = Array.isArray(linkedThree.holes) ? Math.min(linkedThree.holes.length, 3) : 0;
  const linkedThreeReady = !reelsV3 || reelsCustom || linkedThreeCount === 3;
  const hasHoleCardData = Boolean(activeHoleCard.hole || activeHoleCard.par || activeHoleCard.distance || activeHoleCard.currentShot || activeHoleCard.club || activeHoleCard.toPar);
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
    player: (manualNine.player || "").trim() || DEFAULT_CUSTOM_PLAYER,
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
  const setCustomMeta = (key, val) => setCustomRound((r) => ({ ...r, [key]: val }));
  const setHC = (key, val) => setHoleCard((s) => ({ ...s, [key]: val }));
  const setCustomHC = (key, val) => setCustomHoleCard((s) => ({ ...s, [key]: val }));
  const setTH = (key, val) => setThreeHole((s) => ({ ...s, [key]: val }));
  const setManualNineField = (key, val) => setManualNine((s) => ({ ...s, [key]: val }));
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
  const loadCustomHoleStandalone = (n) => {
    if (!n) return;
    setCustomHoleCard((s) => ({
      ...s,
      hole: String(n),
    }));
  };
  const setHole = (i, key, val) =>
    setRound((r) => ({
      ...r,
      holes: r.holes.map((h, idx) => (idx === i ? { ...h, [key]: val } : h)),
    }));
  const setCustomHole = (i, key, val) =>
    setCustomRound((r) => ({
      ...r,
      holes: r.holes.map((h, idx) => (idx === i ? { ...h, [key]: val } : h)),
    }));
  const confirmReset = (message) => typeof window === "undefined" || window.confirm(message);
  const resetRound = () => {
    if (!confirmReset("18홀 스코어카드를 초기화할까요?")) return;
    const next = emptyRound();
    setRound(next);
    setHoleRange("all");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sc-round", JSON.stringify(next));
    }
  };
  const resetCustomRound = () => {
    if (!confirmReset("커스텀 18홀 스코어카드를 초기화할까요?")) return;
    const next = emptyRound();
    setCustomRound((prev) => ({
      ...next,
      player: prev.player,
      country: "",
      course: "",
      date: "",
    }));
    setHoleRange("all");
  };
  const resetManualNine = () => {
    if (!confirmReset("9홀 스코어카드를 초기화할까요?")) return;
    const next = emptyManualNine();
    setManualNine(next);
  };
  const resetThreeHole = () => {
    if (!confirmReset("3홀 스코어카드를 초기화할까요?")) return;
    const next = emptyThreeHoleCard();
    setThreeHole(next);
  };
  const resetHoleCard = () => {
    if (!confirmReset("1홀 정보를 초기화할까요?")) return;
    const next = emptyHoleCard();
    setHoleCard(next);
    if (typeof window !== "undefined") window.localStorage.setItem("sc-holecard", JSON.stringify(next));
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
      const cs = JSON.parse(localStorage.getItem("sc-custom-session") || "null");
      if (cs && typeof cs === "object") {
        if (cs.round && Array.isArray(cs.round.holes)) {
          setCustomRound({ ...cs.round, country: "", course: "", date: "" });
        }
        if (cs.holeCard && typeof cs.holeCard === "object") setCustomHoleCard(cs.holeCard);
        if (cs.threeHole && Array.isArray(cs.threeHole.holes) && cs.threeHole.holes.length === 3) setThreeHole(cs.threeHole);
        if (cs.manualNine && Array.isArray(cs.manualNine.holes) && cs.manualNine.holes.length === 9) setManualNine(cs.manualNine);
      }
    } catch {}
    try {
      localStorage.removeItem("sc-threehole");
      localStorage.removeItem("sc-manual-nine");
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
  useEffect(() => { if (loadedRef.current) localStorage.setItem("sc-linked-three", JSON.stringify(linkedThree)); }, [linkedThree]);
  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem("sc-custom-session", JSON.stringify({
      round: customRound,
      manualNine,
      threeHole,
      holeCard: customHoleCard,
    }));
  }, [customRound, customHoleCard, manualNine, threeHole]);
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
      const baseName = isHole
        ? holeData.player
        : reelsV3
        ? "threehole"
        : reelsCustom
        ? manualNineRound.player
        : scoreRound.player;
      const name = (baseName || "scorecard").replace(/\s+/g, "_");
      a.download = `${name}_${isHole ? "hole" : reelsV3 ? "score_3hole" : isScore9 ? `score_9hole_${effRange}` : "score_18hole"}.png`;
      a.click();
    } catch (e) {
      alert("내보내기 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  const Front = scoreRound.holes.slice(0, 9);
  const Back = scoreRound.holes.slice(9, 18);
  const setScoreHole = isFullCustom ? setCustomHole : setHole;
  const resetScoreRound = isFullCustom ? resetCustomRound : resetRound;

  return (
    <StudioShell
      active={activeNav}
      sourceMode={sourceMode}
      currentUser={currentUser}
      onLogout={logout}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      <div className="mx-auto grid w-full max-w-[980px] grid-cols-1 gap-5">
        {/* ── 입력 패널 ── */}
        <section className="order-2 flex flex-col gap-5">
          {/* 기본 정보 + 코스 (좌우 배치) */}
          {reelsCustom ? (
            <div className="order-[10]">
              {reelsV3 ? (
                <ThreeHoleForm data={threeHole} setField={setTH} setHole={setTHHole} onReset={resetThreeHole} />
              ) : (
                <ManualNineForm data={manualNine} setField={setManualNineField} setHole={setManualNineHole} onReset={resetManualNine} />
              )}
            </div>
          ) : isRoundEditor && !isFullCustom ? (
            <div className={"order-[20] " + (!isHole ? "grid items-start gap-4 md:grid-cols-2" : "")}>
              <BasicInfoPanel
                title="기본 정보"
                data={scoreRound}
                setMeta={setMeta}
                clubNameList={clubNameList}
              />
              {!isHole && (
                <CoursePresets builtin={builtinCourses} favorites={favorites}
                               selectedClub={round.course}
                               disabled={!COURSE_DB_ENABLED}
                               dbStatus={dbStatus} onRefresh={COURSE_DB_ENABLED ? loadCourseDb : null}
                               onToggleFav={toggleFav} onLoad={applyPreset} />
              )}
            </div>
          ) : usesRoundSource ? (
            <div className="order-[20]">
              <RoundSourcePanel
                round={round}
                summary={summary}
                requiresScores={isReelsSizedScore}
                hasRoundData={hasRoundData}
                hasRoundScores={hasRoundScores}
              />
            </div>
          ) : null}

          {/* 라운드 스코어카드: 홀별 입력 */}
          {isRoundEditor && !isHole && !reelsCustom && (
            <div className="order-[10]">
              <div className="rounded-xl border border-line bg-panel p-3 md:p-4">
                <PanelHeader title="스코어 입력">
                  {isFullCustom && (
                    <CustomPlayerControl
                      value={customRound.player}
                      onChange={(v) => setCustomMeta("player", v)}
                    />
                  )}
                  <ScoreModeToggle value={scoreMode} onChange={setScoreMode} />
                  <button type="button" disabled
                    className="cursor-not-allowed rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-txt-faint opacity-70">
                    기록 저장 준비 중
                  </button>
                  <ResetButton onClick={resetScoreRound} />
                </PanelHeader>
                {scoreMode === "relative" && (
                  <RelativeScoreHint />
                )}
                <HoleGroup label="FRONT 9" holes={Front} offset={0} setHole={setScoreHole}
                           scoreRefs={scoreRefs} onScoreKey={handleScoreKey} scoreMode={scoreMode} />
                <HoleGroup label="BACK 9" holes={Back} offset={9} setHole={setScoreHole}
                           scoreRefs={scoreRefs} onScoreKey={handleScoreKey} scoreMode={scoreMode} />
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2 text-[11px] text-txt-soft">
                  <span>
                    PAR{" "}
                    <b className={"font-mono " + (activeSummary.totalPar === 72 ? "text-txt" : "text-[#ffb648]")}>
                      OUT {activeSummary.outPar} · IN {activeSummary.inPar} · 합 {activeSummary.totalPar}
                    </b>
                    {activeSummary.totalPar !== 72 && (
                      <span className="ml-1.5 font-semibold text-[#ffb648]">
                        ⚠ 표준 파72와 다름 (확인)
                      </span>
                    )}
                  </span>
                  {activeSummary.thru > 0 && (
                    <span>
                      스코어{" "}
                      <b className="font-mono text-txt">{activeSummary.totalScore}</b>{" "}
                      <span className="text-accent">{toParLabel(activeSummary.toPar)}</span>
                      <span className="text-txt-faint"> · {activeSummary.thru}홀</span>
                    </span>
                  )}
                </div>
                {!isFullCustom && (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
                    <div className="text-[11px] text-txt-faint">
                      라운딩 기록 저장은 준비 중입니다.
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled
                        className="cursor-not-allowed rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-semibold text-txt-faint opacity-70">
                        내 라운딩 준비 중
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {!isHole && reelsV3 && !reelsCustom && (
            <div className="order-[10]">
              <LinkedThreeHolePanel
                round={round}
                selected={linkedThree.holes || []}
                showHoleNumbers={linkedThree.showHoleNumbers !== false}
                onSelect={selectLinkedThreeGroup}
                onShowHoleNumbers={(v) => setLinkedThreeField("showHoleNumbers", v)}
              />
            </div>
          )}

          {isHole && (
            <div className="order-[10]">
              {isFullCustom && (
                <div className="mb-3 flex justify-end">
                  <CustomPlayerControl
                    value={customHoleCard.player}
                    onChange={(v) => setCustomHC("player", v)}
                  />
                </div>
              )}
              <HoleCardForm
                round={isFullCustom ? customHoleSelectorRound : scoreRound}
                holeCard={activeHoleCard}
                setHC={isFullCustom ? setCustomHC : setHC}
                loadHoleFromRound={isFullCustom ? loadCustomHoleStandalone : loadHoleFromRound}
                onReset={isFullCustom ? () => {
                  if (!confirmReset("커스텀 1홀 정보를 초기화할까요?")) return;
                  setCustomHoleCard(emptyHoleCard());
                } : resetHoleCard}
              />
            </div>
          )}

        </section>

        {/* ── 미리보기 & 내보내기 ── */}
        <section className="order-1">
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

          <div className="rounded-xl border border-line bg-panel p-2 md:p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 md:gap-2">
              <div className="font-head text-xs font-semibold uppercase tracking-widest text-txt-soft md:text-sm">
                미리보기 <span className="hidden text-txt-faint sm:inline">(투명 배경)</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                <div className="flex overflow-hidden rounded-lg border border-line">
                  {[["dark", "다크"], ["light", "라이트"]].map(([key, label]) => (
                    <button key={key} onClick={() => setCardTheme(key)}
                      className={"px-2 py-1 text-[11px] font-bold md:px-3 md:py-1.5 md:text-xs " +
                        (cardTheme === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex overflow-hidden rounded-lg border border-line">
                  {QUALITY.map((qz) => (
                    <button key={qz.scale} onClick={() => setExportScale(qz.scale)}
                      title={`${qz.desc} · ${size.w * qz.scale}×${size.h * qz.scale}px`}
                      className={"px-2 py-1 text-[11px] font-bold md:px-3 md:py-1.5 md:text-xs " +
                        (exportScale === qz.scale ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                      {qz.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleExport} disabled={busy || !canExport}
                  title={!canExport ? "필수 입력을 먼저 완료하세요" : "PNG 다운로드"}
                  className="rounded-lg bg-accent px-2.5 py-1 font-head text-xs font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 disabled:opacity-60 md:px-4 md:py-1.5 md:text-sm">
                  {busy ? "생성 중…" : !canExport ? "입력 필요" : "PNG 다운로드"}
                </button>
              </div>
            </div>

            <div className="checker overflow-hidden rounded-lg border border-line p-1 md:rounded-xl md:p-3">
              <div ref={captureRef} className="preview-frame preview-svg mx-auto w-full"
                   style={{ "--preview-max-desktop": `${previewMaxWidth}px`, "--preview-max-mobile": `${previewMobileMaxWidth}px` }}>
                {isHole
                  ? <HoleCard data={holeData} theme={cardTheme} />
                  : reelsV3
                  ? <ReelsThreeHoleCard data={reelsCustom ? threeHole : linkedThreeData} theme={cardTheme} />
                  : reelsCustom
                  ? <ReelsScorecard round={manualNineRound} summary={manualNineSummary} range="front" theme={cardTheme} />
                  : (() => { const C = FORMATS[format].Comp; return <C round={scoreRound} summary={activeSummary} range={effRange} theme={cardTheme} />; })()}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-txt-soft md:gap-x-2 md:text-sm">
              <b className="text-txt">출력</b>
              <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[12px] font-bold text-accent">
                {(QUALITY.find((x) => x.scale === exportScale) || {}).label}
              </span>
              <span className="font-mono text-[11px] md:text-[13px]">투명 PNG · {size.w * exportScale}×{size.h * exportScale}px</span>
              <span className="hidden text-[12px] text-txt-faint md:inline">버디=빨강 / 이글=골드 / 보기=파랑</span>
            </div>
            {!canExport && exportBlockReason && (
              <div className="mt-2 rounded-md border border-[#ffb648]/40 bg-[#ffb648]/10 px-2.5 py-1.5 text-[12px] font-semibold text-[#ffb648]">
                {exportBlockReason}
              </div>
            )}
          </div>
        </section>

        {/* 실제 화면 배치 미리보기: 데스크탑 전용, 전체 작업 화면 최하단 */}
        <section className="order-3 hidden md:block">
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
              : (() => { const C = FORMATS[format].Comp; return <C round={scoreRound} summary={activeSummary} range={effRange} theme={cardTheme} />; })()}
          </PlacementPreview>
        </section>
      </div>
    </StudioShell>
  );
}
