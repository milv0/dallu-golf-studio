// 스코어 계산 및 분류 유틸 (프레임워크 비의존, 순수 함수)

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

  const played = holes.filter(
    (h) => h && h.score != null && h.score !== "" && !Number.isNaN(Number(h.score))
  );

  const outScore = sum(front, "score");
  const inScore = sum(back, "score");
  const totalScore = outScore + inScore;

  const outPar = sum(front, "par");
  const inPar = sum(back, "par");
  const totalPar = outPar + inPar;

  // to-par: 스코어가 입력된 홀의 (score-par) 합
  const toPar = played.reduce((a, h) => a + (Number(h.score) - Number(h.par)), 0);

  return {
    outScore, inScore, totalScore,
    outPar, inPar, totalPar,
    toPar,
    thru: played.length,
    hasFront: front.some((h) => h.score != null && h.score !== ""),
    hasBack: back.some((h) => h.score != null && h.score !== ""),
  };
}

// 특정 범위(all/front/back) 통계: par합·score합·친홀수·to-par
export function rangeStats(holes, range = "all") {
  const [s, e] = range === "front" ? [0, 9] : range === "back" ? [9, 18] : [0, 18];
  let par = 0, score = 0, playedPar = 0, thru = 0;
  for (let i = s; i < e; i++) {
    const h = holes[i] || {};
    const p = Number(h.par);
    const hasP = h.par != null && h.par !== "" && !Number.isNaN(p);
    if (hasP) par += p;
    const sc = Number(h.score);
    const hasS = h.score != null && h.score !== "" && !Number.isNaN(sc);
    if (hasS) { score += sc; thru++; if (hasP) playedPar += p; }
  }
  return { par, score, thru, toPar: score - playedPar, hasAny: thru > 0, start: s, end: e };
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
    const hasScore =
      h && h.score != null && h.score !== "" && !Number.isNaN(Number(h.score));
    if (hasScore && h.par != null && h.par !== "") {
      t += Number(h.score) - Number(h.par);
    }
  }
  return t;
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
