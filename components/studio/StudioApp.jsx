"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HoleByHoleStrip, { sizeFor as ytSizeFor } from "../presets/HoleByHoleStrip";
import ReelsScorecard, { sizeFor as reelsSizeFor } from "../presets/ReelsScorecard";
import HoleCard, { sizeFor as holeSizeFor } from "../presets/HoleCard";
import HoleCardMinimal, { SIZE as SIZE_HOLE_MINIMAL } from "../presets/HoleCardMinimal";
import ReelsThreeHoleCard, { SIZE as SIZE_REELS_THREE } from "../presets/ReelsThreeHoleCard";
import {
  cumulativeToPar,
  emptyRound,
  hasAllScores,
  hasAnyScore,
  hasNumericValue,
  holesForRange,
  roundWithScoresThrough,
  summarize,
  threeHoleWithScoresThrough,
  toParLabel,
} from "../../lib/score";
import { COURSE_DIRECTORY } from "../../lib/courseDirectory";
import { clearCurrentUser, loadCurrentUser } from "../../lib/auth";
import HomeHub from "./HomeHub";
import CoursePresets from "./CoursePresets";
import { ManualNineForm, ThreeHoleForm, LinkedThreeHolePanel } from "./ManualScoreForms";
import RoundSourcePanel from "./RoundSourcePanel";
import { RelativeScoreHint, ScoreModeToggle, useScoreInputRefs } from "./ScoreInputs";
import { PlayerNameControl } from "./StudioFields";
import BasicInfoPanel from "./BasicInfoPanel";
import { LAST_CUSTOM_ROUTE_KEY, linksFor } from "./StudioNav";
import StudioShell from "./StudioShell";
import HoleCardForm from "./HoleCardForm";
import PanelHeader, { ResetButton } from "./PanelHeader";
import { ConfirmDialog, Toast } from "./Feedback";
import PreviewExportPanel from "./PreviewExportPanel";
import ScoreEntryGrid from "./ScoreEntryGrid";
import useStudioPersistence from "./useStudioPersistence";
import useStudioExport from "./useStudioExport";
import useStudioResets from "./useStudioResets";
import {
  DEFAULT_CUSTOM_PLAYER,
  emptyCustomRound,
  emptyHoleCard,
  emptyLinkedThree,
  emptyManualNine,
  emptyThreeHoleCard,
} from "./studioDefaults";
import { makeFieldSetter, makeHoleSetter, studioModeFlags } from "../../lib/studioModes";
import { useLang } from "../../lib/i18n";

// 미리보기 표시 높이 상한 — 세로 포맷(릴스)이 과도하게 커 보이지 않도록 균형
const PREVIEW_MAX_H = 440;
const PREVIEW_MOBILE_MAX_H = 560;
const COURSE_DB_ENABLED = false;
const FORMATS = {
  youtube: { Comp: HoleByHoleStrip, sizeFor: ytSizeFor },
  reels: { Comp: ReelsScorecard, sizeFor: reelsSizeFor },
};

const RANGES = [["all", "range.all"], ["front", "range.front"], ["back", "range.back"]];


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
  const [cardTheme, setCardTheme] = useState("light"); // 카드(프리셋) 색 테마
  const [holeCardStyle, setHoleCardStyle] = useState("minimal"); // 'classic' | 'minimal'
  const [exportScale, setExportScale] = useState(mode === "score3" ? 1 : 2);
  const [scoreMode, setScoreMode] = useState("strokes"); // 'strokes' | 'relative' (기본: 타수)
  const [parLocked, setParLocked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState("");
  const [confirmRequest, setConfirmRequest] = useState(null);
  const { scoreRefs, handleScoreKey } = useScoreInputRefs();

  const {
    sourceMode,
    isHole,
    isScore18,
    isScore3,
    isScore9,
    isReelsSizedScore,
    isFullCustom,
    format,
    reelsV3,
    reelsCustom,
    isRoundEditor,
    usesRoundSource,
    activeNav,
  } = useMemo(() => studioModeFlags({ mode, source }), [mode, source]);
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
    const hasScore = hasNumericValue(h.score);
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
  // 18홀은 전체 고정, 9홀만 전반/후반을 선택한다.
  const availableRanges = RANGES.filter(([k]) => k !== "all");
  const effRange = isScore18 ? "all" : isReelsSizedScore && holeRange === "all" ? "front" : holeRange;
  const size = isHole ? (holeCardStyle === "minimal" ? SIZE_HOLE_MINIMAL : holeSizeFor(holeData)) : reelsV3 ? SIZE_REELS_THREE : FORMATS[format].sizeFor(effRange);
  const previewScale = isHole ? (holeCardStyle === "minimal" ? 0.7 : 0.38) : reelsV3 ? 0.38 : 1;
  const previewMobileScale = isHole ? (holeCardStyle === "minimal" ? 0.85 : 0.48) : reelsV3 ? 0.48 : 1;
  const previewMaxWidth = Math.min(size.w, PREVIEW_MAX_H * (size.w / size.h)) * previewScale;
  const previewMobileMaxWidth = Math.min(size.w, PREVIEW_MOBILE_MAX_H * (size.w / size.h)) * previewMobileScale;

  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);
  useEffect(() => {
    if (typeof window === "undefined" || !activeNav || sourceMode !== "custom") return;
    const currentLink = linksFor(sourceMode).find((link) => link.id === activeNav);
    if (currentLink) {
      try {
        window.localStorage.setItem(LAST_CUSTOM_ROUTE_KEY, currentLink.href);
      } catch {}
    }
  }, [activeNav, sourceMode]);
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

  const summary = useMemo(() => summarize(round.holes), [round.holes]);
  const customSummary = useMemo(() => summarize(customRound.holes), [customRound.holes]);
  const activeSummary = isFullCustom ? customSummary : summary;
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
  const selectedNineHoles = useMemo(
    () => holesForRange(scoreRound.holes, effRange),
    [scoreRound.holes, effRange]
  );
  const hasRoundMeta = isFullCustom
    ? Boolean((customRound.player || "").trim())
    : Boolean((scoreRound.player || "").trim() || (scoreRound.course || "").trim() || (scoreRound.date || "").trim());
  const hasRoundScores = activeSummary.thru > 0;
  const hasRoundData = hasRoundMeta || hasRoundScores;
  const linkedThreeIndices = Array.isArray(linkedThree.holes) ? linkedThree.holes.slice(0, 3) : [];
  const linkedThreeReady = !reelsV3 || reelsCustom || (
    linkedThreeIndices.length === 3 &&
    linkedThreeIndices.every((idx, i) => Number.isInteger(idx) && idx >= 0 && idx < 18 && (i === 0 || idx === linkedThreeIndices[i - 1] + 1))
  );
  const hasHoleCardData = Boolean(activeHoleCard.hole || activeHoleCard.par || activeHoleCard.distance || activeHoleCard.currentShot || activeHoleCard.club || activeHoleCard.toPar);
  const hasLinkedOutputScores = isScore9
    ? hasAnyScore(selectedNineHoles)
    : isScore3
    ? hasAnyScore(linkedThreeData.holes)
    : hasRoundScores;
  const missingLinkedScores = isReelsSizedScore && !reelsCustom && !hasLinkedOutputScores;
  const canExport =
    !missingLinkedScores &&
    linkedThreeReady &&
    !(mode === "hole" && !hasRoundData && !hasHoleCardData);
  const exportBlockReason =
    missingLinkedScores
      ? t("block.needScores")
      : !linkedThreeReady
      ? t("block.needThreeHoles")
      : mode === "hole" && !hasRoundData && !hasHoleCardData
      ? t("block.needHoleInfo")
      : "";
  const batchProgressCount = isScore18 ? 18 : isScore9 ? 9 : isScore3 ? 3 : 0;
  const hasBatchScores = isScore18
    ? hasAllScores(scoreRound.holes, 18)
    : isScore9
    ? reelsCustom ? hasAllScores(manualNine.holes, 9) : hasAllScores(selectedNineHoles, 9)
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

  const setMeta = makeFieldSetter(setRound);
  const setCustomMeta = makeFieldSetter(setCustomRound);
  const setHC = makeFieldSetter(setHoleCard);
  const setCustomHC = makeFieldSetter(setCustomHoleCard);
  const setTH = makeFieldSetter(setThreeHole);
  const setManualNineField = makeFieldSetter(setManualNine);
  const setLinkedThreeField = makeFieldSetter(setLinkedThree);
  const setTHHole = makeHoleSetter(setThreeHole);
  const setManualNineHole = makeHoleSetter(setManualNine);
  const setHole = makeHoleSetter(setRound);
  const setCustomHole = makeHoleSetter(setCustomRound);
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
      currentShot: hasNumericValue(h.score) ? String(h.score) : "",
      toPar: hasNumericValue(h.score) ? toParLabel(cumulativeToPar(round.holes, idx)) : "",
    }));
  };
  const loadCustomHoleStandalone = (n) => {
    if (!n) return;
    setCustomHoleCard((s) => ({
      ...s,
      hole: String(n),
    }));
  };
  const {
    resetRound,
    resetCustomRound,
    resetManualNine,
    resetThreeHole,
    resetHoleCard,
    resetCustomHoleCard,
  } = useStudioResets({
    t,
    requestConfirm,
    showToast,
    setRound,
    setCustomRound,
    setManualNine,
    setThreeHole,
    setHoleCard,
    setCustomHoleCard,
    setHoleRange,
  });

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
    parLocked,
    setParLocked,
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
    if (isHole) return holeCardStyle === "minimal"
      ? <HoleCardMinimal data={holeData} theme={cardTheme} />
      : <HoleCard data={holeData} theme={cardTheme} />;
    if (reelsV3) return <ReelsThreeHoleCard data={reelsCustom ? threeHole : linkedThreeData} theme={cardTheme} />;
    if (reelsCustom) return <ReelsScorecard round={manualNineRound} summary={manualNineSummary} range="front" theme={cardTheme} />;
    const C = FORMATS[format].Comp;
    return <C round={scoreRound} summary={activeSummary} range={effRange} theme={cardTheme} />;
  };
  const activeCard = renderActiveCard();

  return (
    <StudioShell
      active={activeNav}
      sourceMode={sourceMode}
      currentUser={currentUser}
      onLogout={logout}
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
                    <PlayerNameControl
                      value={customRound.player}
                      onChange={(v) => setCustomMeta("player", v)}
                      placeholder={DEFAULT_CUSTOM_PLAYER}
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
                <ScoreEntryGrid holes={Front} offset={0} setHole={setScoreHole}
                  scoreRefs={scoreRefs} onScoreKey={handleScoreKey} scoreMode={scoreMode}
                  parLocked={!isFullCustom && parLocked} showSum />
                <ScoreEntryGrid holes={Back} offset={9} setHole={setScoreHole}
                  scoreRefs={scoreRefs} onScoreKey={handleScoreKey} scoreMode={scoreMode}
                  parLocked={!isFullCustom && parLocked} showSum />
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
              <div className="mb-3 flex items-center justify-between">
                <div className="flex overflow-hidden rounded-lg border border-line">
                  {[["classic", "Classic"], ["minimal", "Minimal"]].map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setHoleCardStyle(key)}
                      className={"px-3 py-1 text-[11px] font-bold transition " +
                        (holeCardStyle === key ? "bg-accent text-[#06210f]" : "bg-panel text-txt-soft hover:text-txt")}>
                      {label}
                    </button>
                  ))}
                </div>
                {isFullCustom && (
                  <PlayerNameControl
                    value={customHoleCard.player}
                    onChange={(v) => setCustomHC("player", v)}
                    maxLength={9}
                    placeholder={DEFAULT_CUSTOM_PLAYER}
                  />
                )}
              </div>
              <HoleCardForm
                round={isFullCustom ? customHoleSelectorRound : scoreRound}
                holeCard={activeHoleCard}
                setHC={isFullCustom ? setCustomHC : setHC}
                loadHoleFromRound={isFullCustom ? loadCustomHoleStandalone : loadHoleFromRound}
                linked={!isFullCustom}
                cardStyle={holeCardStyle}
                onReset={isFullCustom ? resetCustomHoleCard : resetHoleCard}
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
          previewNode={activeCard}
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
