// 스코어 계산 및 분류 유틸 (프레임워크 비의존, 순수 함수)

export function hasNumericValue(value) {
  return value != null && value !== "" && !Number.isNaN(Number(value));
}

export function hasAnyScore(holes = []) {
  return holes.some((hole) => hasNumericValue(hole?.score));
}

export function hasAllScores(holes = [], count = holes.length) {
  if (!Array.isArray(holes) || holes.length < count || count <= 0) return false;
  return holes.slice(0, count).every((hole) => hasNumericValue(hole?.score));
}

export function holesForRange(holes = [], range = "all") {
  if (range === "front") return holes.slice(0, 9);
  if (range === "back") return holes.slice(9, 18);
  return holes.slice(0, 18);
}

// 홀 결과 분류: 방송 관례 색상 코드에 맞춘 종류 반환
// albatross(-3↓), eagle(-2), birdie(-1), par(0), bogey(+1), double(+2), triple+(+3↑)
export function classify(par, score) {
  if (par == null || score == null || score === "" || Number.isNaN(Number(score)))
    return { kind: "empty", diff: null };
  const diff = Number(score) - Number(par);
  let kind;
  if (diff <= -3) kind = "albatross";
  else if (diff === -2) kind = "eagle";
  else if (diff === -1) kind = "birdie";
  else if (diff === 0) kind = "par";
  else if (diff === 1) kind = "bogey";
  else if (diff === 2) kind = "double";
  else kind = "triple";
  return { kind, diff };
}

// to-par 표기 문자열: -3 → "-3", 0 → "E", +2 → "+2"
export function toParLabel(n) {
  if (n == null) return "–";
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `${n}`;
}

export function normalizeToParDisplay(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  if (text.toUpperCase() === "E") return "E";
  if (/^[+-]?\d+$/.test(text)) return toParLabel(Number(text));
  return text;
}

// TO PAR 표시값(숫자 또는 "E"/"-3"/"+2"/""/null)에 맞는 색상 반환.
// 언더파=accent, 오버파=빨강, 이븐/빈값=기본 텍스트.
export function toParColor(value, c) {
  if (value == null || value === "" || value === "–") return c.text;
  const s = String(value);
  if (s.startsWith("-") || Number(s) < 0) return c.accent;
  if (s.startsWith("+") || Number(s) > 0) return "#e5484d";
  return c.text;
}

export function toParForPlayedHoles(holes = []) {
  let played = 0;
  let diff = 0;
  for (const hole of holes) {
    if (!hasNumericValue(hole?.par) || !hasNumericValue(hole?.score)) continue;
    played++;
    diff += Number(hole.score) - Number(hole.par);
  }
  return played > 0 ? toParLabel(diff) : "";
}

// 기본 par: 전 홀 4 (수동 입력 전제, 합 72). 필요 시 3/4/5 버튼으로 조정.
export const DEFAULT_PARS = Array(18).fill(4);

// 라운드 요약 계산
export function summarize(holes) {
  const front = holes.slice(0, 9);
  const back = holes.slice(9, 18);

  const sum = (arr, key) =>
    arr.reduce((a, h) => {
      const v = h?.[key];
      return v == null || v === "" || Number.isNaN(Number(v)) ? a : a + Number(v);
    }, 0);

  const played = holes.filter((hole) => hasNumericValue(hole?.score));

  const outScore = sum(front, "score");
  const inScore = sum(back, "score");
  const totalScore = outScore + inScore;

  const outPar = sum(front, "par");
  const inPar = sum(back, "par");
  const totalPar = outPar + inPar;

  // to-par: 스코어와 PAR 모두 입력된 홀의 (score-par) 합
  const playedWithPar = played.filter((hole) => hasNumericValue(hole.par));
  const toPar = playedWithPar.length > 0
    ? playedWithPar.reduce((a, h) => a + (Number(h.score) - Number(h.par)), 0)
    : null;

  return {
    outScore, inScore, totalScore,
    outPar, inPar, totalPar,
    toPar,
    thru: played.length,
    hasFront: front.some((hole) => hasNumericValue(hole?.score)),
    hasBack: back.some((hole) => hasNumericValue(hole?.score)),
  };
}

// 특정 범위(all/front/back) 통계: par합·score합·친홀수·to-par
export function rangeStats(holes, range = "all") {
  const [s, e] = range === "front" ? [0, 9] : range === "back" ? [9, 18] : [0, 18];
  let par = 0, score = 0, playedPar = 0, thru = 0;
  for (let i = s; i < e; i++) {
    const h = holes[i] || {};
    const p = Number(h.par);
    const hasP = hasNumericValue(h.par);
    if (hasP) par += p;
    const sc = Number(h.score);
    const hasS = hasNumericValue(h.score);
    if (hasS) { score += sc; thru++; if (hasP) playedPar += p; }
  }
  return { par, score, thru, toPar: playedPar > 0 ? score - playedPar : null, hasAny: thru > 0, start: s, end: e };
}

// 빈 라운드 생성
export function emptyRound() {
  return {
    player: "",
    country: "",
    course: "",
    date: "",
    holes: DEFAULT_PARS.map((par) => ({ par, score: "" })),
  };
}

// 특정 홀(인덱스 포함)까지의 누적 to-par
export function cumulativeToPar(holes, uptoIndex) {
  let t = 0;
  for (let i = 0; i <= uptoIndex && i < holes.length; i++) {
    const h = holes[i];
    const hasScore = hasNumericValue(h?.score);
    if (hasScore && hasNumericValue(h.par)) {
      t += Number(h.score) - Number(h.par);
    }
  }
  return t;
}

export function roundWithScoresThrough(round, startIndex, count, progress) {
  const endIndex = startIndex + count;
  return {
    ...round,
    holes: (round.holes || []).map((hole, idx) => ({
      ...hole,
      score: idx >= startIndex && idx < endIndex && idx >= startIndex + progress ? "" : hole.score,
    })),
  };
}

export function threeHoleWithScoresThrough(data, progress) {
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

// 홀 결과 색상 (SVG/미리보기 공용). 방송 관례: 버디=빨강, 보기 계열=파랑
export const KIND_COLOR = {
  albatross: "#f4c542",
  eagle: "#f4c542",
  birdie: "#e5484d",
  par: "#e8ecf1",
  bogey: "#4a6cf7",
  double: "#3550c9",
  triple: "#2a3fa0",
  empty: "#5f6b7a",
};
