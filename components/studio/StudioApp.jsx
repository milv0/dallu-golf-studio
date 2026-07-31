"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import RoundSourcePanel from "./RoundSourcePanel";
import HoleGroup from "./RoundScoreGrid";
import { RelativeScoreHint, ScoreModeToggle } from "./ScoreInputs";
import { ClubAutocomplete, Field } from "./StudioFields";
import BasicInfoPanel from "./BasicInfoPanel";
import { LAST_ROUTE_KEY, linksFor } from "./StudioNav";
import StudioShell from "./StudioShell";
import HoleCardForm from "./HoleCardForm";
import PanelHeader, { ResetButton } from "./PanelHeader";
import { ConfirmDialog, Toast } from "./Feedback";
import PreviewExportPanel from "./PreviewExportPanel";
import useStudioPersistence from "./useStudioPersistence";
import useStudioExport from "./useStudioExport";
import { DEFAULT_CUSTOM_PLAYER, emptyCustomRound, emptyHoleCard, emptyLinkedThree, emptyManualNine, emptyThreeHoleCard } from "./studioDefaults";
import { STUDIO_STORAGE_KEYS, writeJsonStorage } from "../../lib/studioStorage";
import { useLang } from "../../lib/i18n";

// 미리보기 표시 높이 상한 — 세로 포맷(릴스)이 과도하게 커 보이지 않도록 균형
const PREVIEW_MAX_H = 440;
const PREVIEW_MOBILE_MAX_H = 560;
const COURSE_DB_ENABLED = false;
const FORMATS = {
  youtube: { Comp: HoleByHoleStrip, sizeFor: ytSizeFor },
  reels: { Comp: ReelsScorecard, sizeFor: reelsSizeFor },
};

const RANGES = [["all", "전체 18홀"], ["front", "전반 OUT 9"], ["back", "후반 IN 9"]];

function roundWithScoresThrough(round, startIndex, count, progress) {
  const endIndex = startIndex + count;
  return {
    ...round,
    holes: (round.holes || []).map((hole, idx) => ({
      ...hole,
      score: idx >= startIndex && idx < endIndex && idx >= startIndex + progress ? "" : hole.score,
    })),
  };
}

function threeHoleWithScoresThrough(data, progress) {
  return {
    ...data,
    total: "",
    toPar: "",
    holes: (data.holes || []).slice(0, 3).map((hole, idx) => ({
      ...hole,
      score: idx >= progress ? "" : hole.score,
    })),
  };
}

function hasAnyScore(holes = []) {
  return holes.some((hole) => hole?.score !== "" && hole?.score != null);
}

function hasAllScores(holes = [], count = holes.length) {
  if (!holes.length || count <= 0) return false;
  return holes.slice(0, count).every((hole) => hole?.score !== "" && hole?.score != null);
}


function CustomPlayerControl({ value, onChange }) {
  const { t } = useLang();
  return (
    <label className="flex w-[128px] shrink-0 items-center gap-2 rounded-lg border border-line bg-panel-2 px-2 py-1">
      <span className="font-head text-[10px] font-semibold uppercase tracking-widest text-txt-faint">
        {t("label.name")}
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

export default function StudioApp({ mode = "home", source } = {}) {
  return mode === "home" ? <HomeHub /> : <StudioWorkspace mode={mode} source={source} />;
}

function StudioWorkspace({ mode, source }) {
  const { t } = useLang();
  const [round, setRound] = useState(emptyRound);
  const [customRound, setCustomRound] = useState(emptyCustomRound);
  const [holeCard, setHoleCard] = useState(emptyHoleCard);
  const [customHoleCard, setCustomHoleCard] = useState(emptyHoleCard);
  const [threeHole, setThreeHole] = useState(emptyThreeHoleCard);
  const [manualNine, setManualNine] = useState(emptyManualNine);
  const [linkedThree, setLinkedThree] = useState(emptyLinkedThree);
  const [holeRange, setHoleRange] = useState("all"); // 'all' | 'front' | 'back'
  const [sourceMode, setSourceMode] = useState(source || (mode === "round" ? "round" : "custom"));
  const [cardTheme, setCardTheme] = useState("light"); // 카드(프리셋) 색 테마
  const [exportScale, setExportScale] = useState(mode === "score3" ? 1 : 2);
  const [theme, setTheme] = useState("light");
  const [scoreMode, setScoreMode] = useState("strokes"); // 'strokes' | 'relative' (기본: 타수)
  const [parLocked, setParLocked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState("");
  const [confirmRequest, setConfirmRequest] = useState(null);
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
  const previewScale = isHole ? 0.38 : reelsV3 ? 0.38 : 1;
  const previewMobileScale = isHole ? 0.48 : reelsV3 ? 0.48 : 1;
  const previewMaxWidth = Math.min(size.w, PREVIEW_MAX_H * (size.w / size.h)) * previewScale;
  const previewMobileMaxWidth = Math.min(size.w, PREVIEW_MOBILE_MAX_H * (size.w / size.h)) * previewMobileScale;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);
  useEffect(() => {
    if (typeof window === "undefined" || !activeNav) return;
    const currentLink = linksFor(sourceMode).find((link) => link.id === activeNav);
    const storageKey = LAST_ROUTE_KEY[sourceMode];
    if (currentLink && storageKey) {
      window.localStorage.setItem(storageKey, currentLink.href);
    }
  }, [activeNav, sourceMode]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };
  const showToast = useCallback((message) => {
    setToast(message);
  }, []);
  const requestConfirm = useCallback((message, onConfirm) => {
    setConfirmRequest({ message, onConfirm });
  }, []);
  const closeConfirm = useCallback(() => {
    setConfirmRequest(null);
  }, []);
  const runConfirm = useCallback(() => {
    const action = confirmRequest?.onConfirm;
    setConfirmRequest(null);
    action?.();
  }, [confirmRequest]);

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
      ? t("block.needScores")
      : !linkedThreeReady
      ? t("block.needThreeHoles")
      : mode === "hole" && !hasRoundData && !hasHoleCardData
      ? t("block.needHoleInfo")
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
  const batchProgressCount = isScore18 ? 18 : isScore9 ? 9 : isScore3 ? 3 : 0;
  const hasBatchScores = isScore18
    ? activeSummary.thru === 18
    : isScore9
    ? reelsCustom ? manualNineSummary.thru === 9 : activeSummary.thru >= 9
    : isScore3
    ? reelsCustom ? hasAllScores(threeHole.holes, 3) : hasAllScores(linkedThreeData.holes, 3)
    : false;
  const canBatchExport = !isHole && batchProgressCount > 0 && hasBatchScores && linkedThreeReady;
  const {
    busy,
    exportError,
    captureRef,
    batchCaptureRef,
    batchExportStep,
    handleExport,
    handleBatchExport,
    handleShareExport,
  } = useStudioExport({
    canExport,
    canBatchExport,
    batchProgressCount,
    size,
    exportScale,
    isHole,
    isScore3,
    isScore9,
    showToast,
  });

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
  const resetRound = () => {
    requestConfirm(t("toast.reset18").replace(".", "?"), () => {
      const next = emptyRound();
      setRound(next);
      setHoleRange("all");
      writeJsonStorage(STUDIO_STORAGE_KEYS.round, next);
      showToast(t("toast.reset18"));
    });
  };
  const resetCustomRound = () => {
    requestConfirm(t("toast.resetCustom18").replace(".", "?"), () => {
      const next = emptyCustomRound();
      setCustomRound((prev) => ({
        ...next,
        player: prev.player,
      }));
      setHoleRange("all");
      showToast(t("toast.resetCustom18"));
    });
  };
  const resetManualNine = () => {
    requestConfirm(t("toast.reset9").replace(".", "?"), () => {
      setManualNine(emptyManualNine());
      showToast(t("toast.reset9"));
    });
  };
  const resetThreeHole = () => {
    requestConfirm(t("toast.reset3").replace(".", "?"), () => {
      setThreeHole(emptyThreeHoleCard());
      showToast(t("toast.reset3"));
    });
  };
  const resetHoleCard = () => {
    requestConfirm(t("toast.reset1").replace(".", "?"), () => {
      const next = emptyHoleCard();
      setHoleCard(next);
      writeJsonStorage(STUDIO_STORAGE_KEYS.holeCard, next);
      showToast(t("toast.reset1"));
    });
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
    setParLocked(true);
  };

  const { builtinCourses, favorites, dbStatus, loadCourseDb, toggleFav } = useStudioPersistence({
    round,
    setRound,
    holeCard,
    setHoleCard,
    linkedThree,
    setLinkedThree,
    customRound,
    setCustomRound,
    customHoleCard,
    setCustomHoleCard,
    manualNine,
    setManualNine,
    threeHole,
    setThreeHole,
  });

  // 골프장(클럽) 이름 자동완성 목록 — 디렉토리 541곳 + DB 클럽 (조합명 제외)
  const clubNameList = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const c of [...builtinCourses.map((x) => x.club).filter(Boolean), ...COURSE_DIRECTORY.map((x) => x.name)]) {
      if (c && !seen.has(c)) { seen.add(c); out.push(c); }
    }
    return out;
  }, [builtinCourses]);
  function renderBatchExportCard(step) {
    if (!step || isHole) return null;
    if (isScore3) {
      const data = threeHoleWithScoresThrough(reelsCustom ? threeHole : linkedThreeData, step);
      return <ReelsThreeHoleCard data={data} theme={cardTheme} />;
    }
    if (isScore9) {
      const startIndex = reelsCustom ? 0 : effRange === "back" ? 9 : 0;
      const batchRound = roundWithScoresThrough(reelsCustom ? manualNineRound : scoreRound, startIndex, 9, step);
      return (
        <ReelsScorecard
          round={batchRound}
          summary={summarize(batchRound.holes)}
          range={reelsCustom ? "front" : effRange}
          theme={cardTheme}
        />
      );
    }
    const batchRound = roundWithScoresThrough(scoreRound, 0, 18, step);
    const C = FORMATS[format].Comp;
    return <C round={batchRound} summary={summarize(batchRound.holes)} range="all" theme={cardTheme} />;
  }

  const Front = scoreRound.holes.slice(0, 9);
  const Back = scoreRound.holes.slice(9, 18);
  const setScoreHole = isFullCustom ? setCustomHole : setHole;
  const resetScoreRound = isFullCustom ? resetCustomRound : resetRound;
  const renderActiveCard = () => {
    if (isHole) return <HoleCard data={holeData} theme={cardTheme} />;
    if (reelsV3) return <ReelsThreeHoleCard data={reelsCustom ? threeHole : linkedThreeData} theme={cardTheme} />;
    if (reelsCustom) return <ReelsScorecard round={manualNineRound} summary={manualNineSummary} range="front" theme={cardTheme} />;
    const C = FORMATS[format].Comp;
    return <C round={scoreRound} summary={activeSummary} range={effRange} theme={cardTheme} />;
  };

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
            <div className="order-[5] grid items-start gap-3 grid-cols-1 md:grid-cols-2">
              <BasicInfoPanel
                data={scoreRound}
                setMeta={setMeta}
                clubNameList={clubNameList}
              />
              <CoursePresets builtin={builtinCourses} favorites={favorites}
                             selectedClub={round.course}
                             disabled={!COURSE_DB_ENABLED}
                             dbStatus={dbStatus} onRefresh={COURSE_DB_ENABLED ? loadCourseDb : null}
                             onToggleFav={toggleFav} onLoad={applyPreset} />
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
                <PanelHeader title={t("label.scoreInput")}>
                  {isFullCustom && (
                    <CustomPlayerControl
                      value={customRound.player}
                      onChange={(v) => setCustomMeta("player", v)}
                    />
                  )}
                  {!isFullCustom && parLocked && (
                    <button type="button" onClick={() => setParLocked(false)}
                      className="rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-bold text-txt-soft transition hover:border-accent hover:text-txt">
                      {t("label.parEdit")}
                    </button>
                  )}
                  <ScoreModeToggle value={scoreMode} onChange={setScoreMode} />
                  <ResetButton onClick={resetScoreRound} />
                </PanelHeader>
                {scoreMode === "relative" && (
                  <RelativeScoreHint />
                )}
                <HoleGroup label="FRONT 9" holes={Front} offset={0} setHole={setScoreHole}
                           scoreRefs={scoreRefs} onScoreKey={handleScoreKey} scoreMode={scoreMode} parLocked={!isFullCustom && parLocked} />
                <HoleGroup label="BACK 9" holes={Back} offset={9} setHole={setScoreHole}
                           scoreRefs={scoreRefs} onScoreKey={handleScoreKey} scoreMode={scoreMode} parLocked={!isFullCustom && parLocked} />
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2 text-[11px] text-txt-soft">
                  <span>
                    PAR{" "}
                    <b className={"font-mono " + (activeSummary.outPar === 36 && activeSummary.inPar === 36 ? "text-txt" : "text-[#ffb648]")}>
                      {t("label.parTotal", { out: activeSummary.outPar, in: activeSummary.inPar, total: activeSummary.totalPar })}
                    </b>
                    {scoreRound.holes.slice(0, 9).every((h) => h.par !== "" && h.par != null) && activeSummary.outPar !== 36 && (
                      <span className="ml-1.5 font-semibold text-[#ffb648]">
                        {t("label.parWarning")}
                      </span>
                    )}
                    {scoreRound.holes.slice(9, 18).every((h) => h.par !== "" && h.par != null) && activeSummary.inPar !== 36 && (
                      <span className="ml-1.5 font-semibold text-[#ffb648]">
                        {t("label.parWarning")}
                      </span>
                    )}
                  </span>
                  {activeSummary.thru > 0 && activeSummary.thru < 18 && (
                    <span className="text-accent">{t("label.progress", { n: activeSummary.thru })}</span>
                  )}
                </div>
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
                linked={!isFullCustom}
                onReset={isFullCustom ? () => {
                  requestConfirm(t("toast.resetCustom1").replace(".", "?"), () => {
                    setCustomHoleCard(emptyHoleCard());
                    showToast(t("toast.resetCustom1"));
                  });
                } : resetHoleCard}
              />
            </div>
          )}

        </section>

        <PreviewExportPanel
          isScore9={isScore9}
          reelsCustom={reelsCustom}
          availableRanges={availableRanges}
          effRange={effRange}
          setHoleRange={setHoleRange}
          cardTheme={cardTheme}
          setCardTheme={setCardTheme}
          exportScale={exportScale}
          setExportScale={setExportScale}
          size={size}
          busy={busy}
          canExport={canExport}
          canBatchExport={canBatchExport}
          hasBatchScores={hasBatchScores}
          batchProgressCount={batchProgressCount}
          exportBlockReason={exportBlockReason}
          exportError={exportError}
          handleShareExport={handleShareExport}
          handleExport={handleExport}
          handleBatchExport={handleBatchExport}
          captureRef={captureRef}
          previewMaxWidth={previewMaxWidth}
          previewMobileMaxWidth={previewMobileMaxWidth}
          previewNode={renderActiveCard()}
        />
      </div>
      {batchExportStep != null && (
        <div className="pointer-events-none fixed left-[-10000px] top-0 z-[-1]" aria-hidden="true">
          <div ref={batchCaptureRef}>
            {renderBatchExportCard(batchExportStep)}
          </div>
        </div>
      )}
      <Toast message={toast} onClose={() => setToast("")} />
      <ConfirmDialog request={confirmRequest} onCancel={closeConfirm} onConfirm={runConfirm} />
    </StudioShell>
  );
}
