// 라우트(mode) + 데이터 출처(source) 조합에서 파생되는 화면 플래그를 한곳에서 계산한다.
// 순수 함수이므로 단위 테스트로 조합을 고정할 수 있다.
export function studioModeFlags({ mode = "home", source } = {}) {
  const sourceMode = source || (mode === "round" ? "round" : "custom");

  const isHole = mode === "hole";
  const isScore18 = mode === "score18" || mode === "round";
  const isScore3 = mode === "score3";
  const isScore9 = mode === "score9";
  const isReelsSizedScore = isScore9 || isScore3;
  const isFullCustom = sourceMode === "custom";
  const reelsCustom = isReelsSizedScore && isFullCustom;

  return {
    sourceMode,
    isHole,
    isScore18,
    isScore3,
    isScore9,
    isReelsSizedScore,
    isFullCustom,
    format: isReelsSizedScore ? "reels" : "youtube",
    reelsV3: isScore3,
    reelsCustom,
    isRoundEditor: isScore18,
    usesRoundSource: !isFullCustom && ((isReelsSizedScore && !reelsCustom) || isHole),
    activeNav: isScore18 ? "score18" : isScore9 ? "score9" : isScore3 ? "score3" : isHole ? "hole" : "",
  };
}

// 부분 업데이트 setter 팩토리 — 객체 필드용
export function makeFieldSetter(setState) {
  return (key, val) => setState((s) => ({ ...s, [key]: val }));
}

// 부분 업데이트 setter 팩토리 — holes[idx] 필드용
export function makeHoleSetter(setState) {
  return (idx, key, val) =>
    setState((s) => ({
      ...s,
      holes: s.holes.map((h, i) => (i === idx ? { ...h, [key]: val } : h)),
    }));
}
