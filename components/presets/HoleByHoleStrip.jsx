// 프리셋 1: 홀바이홀 스코어카드 스트립 (방송 스타일, 투명 배경 SVG)
// - 언더파 = 원, 오버파 = 사각형 (전통 스코어카드 마킹)
// - 버디=빨강, 보기 계열=파랑, 이글/알바=골드 (방송 색상 코드)
import { classify, toParLabel, rangeStats } from "../../lib/score";
import { cardColors } from "../../lib/theme";
import { displayPlayerName, fitFontSize } from "./svgText";
import { HEAD, MONO, ResultMarker, ScoreNumber } from "./scorecardPrimitives";

// 레이아웃 상수 (모듈 공유) — 칸 폭 고정, 9홀은 세로 동일 & 가로만 짧게
const H = 232;
const LP = 150;              // 좌측 선수 패널 폭 (course/player/TO PAR만)
const LABEL_W = 82;          // 행 라벨 컬럼
const TABLE_X = LP + LABEL_W;
const CW = 74;               // 칸 폭 (스코어 영역 확대)
const RM = 24;               // 우측 여백
const colsFor = (range) => (range === "all" ? 21 : 10);   // 21=9+OUT+9+IN+TOT / 10=9+SUM
export function sizeFor(range = "all") {
  return { w: TABLE_X + colsFor(range) * CW + RM, h: H };
}
export const SIZE = sizeFor("all");

export default function HoleByHoleStrip({ round, summary, range = "all", theme = "dark" }) {
  const { w, h } = sizeFor(range);
  const c = cardColors(theme);
  const labelW = LABEL_W;
  const tableX = TABLE_X;
  const tableW = w - tableX - RM;
  const top = 34;
  const rowH = 60;
  const yHole = top + 24;
  const yPar = yHole + rowH;
  const yScore = yPar + rowH;

  const rs = rangeStats(round.holes, range);
  const rangeLabel = range === "front" ? "FRONT 9" : range === "back" ? "BACK 9" : "";
  const playerName = displayPlayerName(round.player);
  const playerSize = fitFontSize(playerName, { base: 32, min: 18, maxWidth: LP - 28 });
  const playerY = rangeLabel ? 63 : 50;

  // 컬럼 정의 (범위에 따라)
  const cols = [];
  if (range === "all") {
    for (let i = 0; i < 9; i++) cols.push({ type: "hole", i });
    cols.push({ type: "sum", key: "out", label: "OUT" });
    for (let i = 9; i < 18; i++) cols.push({ type: "hole", i });
    cols.push({ type: "sum", key: "in", label: "IN" });
    cols.push({ type: "sum", key: "tot", label: "TOT" });
  } else {
    for (let i = rs.start; i < rs.end; i++) cols.push({ type: "hole", i });
    cols.push({ type: "sum", key: range === "front" ? "out" : "in", label: range === "front" ? "OUT" : "IN" });
  }
  const cw = tableW / cols.length;
  const colX = (idx) => tableX + idx * cw + cw / 2;

  const toPar = rs.toPar;
  const toParColor =
    rs.thru === 0 ? c.text : toPar < 0 ? c.accent : toPar > 0 ? "#e5484d" : c.text;


  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", background: "transparent" }}
    >
      {/* 카드 배경 */}
      <rect x="0" y="0" width={w} height={h} fill={c.bg} opacity="0.92" />
      {/* 좌/우 구분선 */}
      <line x1={LP} y1="28" x2={LP} y2={h - 28} stroke={c.line} strokeWidth="2" />

      {/* ── 좌측 선수 패널 (섹션 구분) ── */}
      {/* 1) 범위 라벨 */}
      <text x={LP / 2} y="30" textAnchor="middle" fill={c.accent} fontFamily={HEAD} fontSize="14" fontWeight="600"
            letterSpacing="1">
        {rangeLabel}
      </text>

      {/* 2) dG 로고 + 선수명 */}
      <circle cx="24" cy={playerY} r="12" fill="none" stroke={c.accent} strokeWidth="1.5" opacity="0.7" />
      <text x="24" y={playerY + 1} textAnchor="middle" dominantBaseline="middle" fill={c.accent}
            fontFamily={HEAD} fontSize="11" fontWeight="700" opacity="0.7">dG</text>
      <text x={LP / 2 + 10} y={playerY} textAnchor="middle" dominantBaseline="middle" fill={c.text}
            fontFamily={HEAD} fontSize={playerSize} fontWeight="700" letterSpacing="0.5">
        {playerName}
      </text>

      {/* 구분선 */}
      <line x1="24" y1="86" x2={LP - 16} y2="86" stroke={c.line} strokeWidth="1.5" />

      {/* 3) TO PAR (중앙 정렬) */}
      <text x={LP / 2} y="116" textAnchor="middle" fill={c.sub} fontFamily={HEAD} fontSize="15" letterSpacing="2">
        TO PAR
      </text>
      <text x={LP / 2} y="182" textAnchor="middle" fill={toParColor} fontFamily={HEAD} fontSize="56" fontWeight="700">
        {toParLabel(rs.thru === 0 ? null : toPar)}
      </text>

      {/* ── 홀 테이블 ── */}
      {/* 행 라벨 (좌측 작은 태그) */}
      {[["HOLE", yHole], ["PAR", yPar], ["SCORE", yScore]].map(([lbl, y]) => (
        <text key={lbl} x={tableX - 16} y={y + 6} textAnchor="end" fill={c.faint}
              fontFamily={HEAD} fontSize="16" letterSpacing="0.8"
              className={lbl === "SCORE" ? undefined : "score-meta-lock"}>
          {lbl}
        </text>
      ))}

      {cols.map((col, idx) => {
        const cx = colX(idx);
        const isSum = col.type === "sum";
        if (isSum) {
          const parVal =
            col.key === "out" ? summary.outPar : col.key === "in" ? summary.inPar : summary.totalPar;
          const scVal =
            col.key === "out" ? summary.outScore : col.key === "in" ? summary.inScore : summary.totalScore;
          const showSum =
            col.key === "out" ? summary.hasFront : col.key === "in" ? summary.hasBack : summary.thru > 0;
          return (
            <g key={idx}>
              <rect x={cx - cw / 2 + 3} y={top} width={cw - 6} height={rowH * 3 - 8}
                    fill={c.accent} opacity="0.10" />
              <text x={cx} y={yHole + 6} textAnchor="middle" fill={c.accent}
                    fontFamily={HEAD} fontSize="27" fontWeight="700" letterSpacing="1" className="score-meta-lock">
                {col.label}
              </text>
              <text x={cx} y={yPar + 6} textAnchor="middle" fill={c.sub}
                    fontFamily={MONO} fontSize="34" className="score-meta-lock">
                {parVal || ""}
              </text>
              <ScoreNumber x={cx} y={yScore} value={scVal} hasValue={showSum} empty=""
                fill={c.text} emptyFill={c.text} fontSize="46" />
            </g>
          );
        }
        const hole = round.holes[col.i];
        const { kind } = classify(hole?.par, hole?.score);
        const hasScore = kind !== "empty";
        return (
          <g key={idx}>
            <text x={cx} y={yHole + 6} textAnchor="middle" fill={c.text}
                  fontFamily={HEAD} fontSize="32" fontWeight="600" className="score-meta-lock">
              {col.i + 1}
            </text>
            <text x={cx} y={yPar + 6} textAnchor="middle" fill={c.faint}
                  fontFamily={MONO} fontSize="28" className="score-meta-lock">
              {hole?.par}
            </text>
            <ResultMarker kind={kind} cx={cx} cy={yScore} size={27} />
            <ScoreNumber x={cx} y={yScore} value={hole.score} hasValue={hasScore} empty="·"
              fill={c.text} emptyFill={c.faint} fontSize="46" />
          </g>
        );
      })}
    </svg>
  );
}
