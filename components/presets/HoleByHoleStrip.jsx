// 프리셋 1: 홀바이홀 스코어카드 스트립 (방송 스타일, 투명 배경 SVG)
// - 언더파 = 원, 오버파 = 사각형 (전통 스코어카드 마킹)
// - 버디=빨강, 보기 계열=파랑, 이글/알바=골드 (방송 색상 코드)
import { classify, toParLabel, KIND_COLOR, rangeStats } from "../../lib/score";

// 레이아웃 상수 (모듈 공유) — 칸 폭 고정, 9홀은 세로 동일 & 가로만 짧게
const H = 300;
const LP = 330;              // 좌측 선수 패널 폭
const LABEL_W = 84;          // 행 라벨 컬럼
const TABLE_X = LP + LABEL_W;
const CW = 63;               // 칸 폭 (18홀·9홀 동일)
const RM = 24;               // 우측 여백
const colsFor = (range) => (range === "all" ? 21 : 10);   // 21=9+OUT+9+IN+TOT / 10=9+SUM
export function sizeFor(range = "all") {
  return { w: TABLE_X + colsFor(range) * CW + RM, h: H };
}
export const SIZE = sizeFor("all");

export default function HoleByHoleStrip({ round, summary, range = "all" }) {
  const { w, h } = sizeFor(range);
  const labelW = LABEL_W;
  const tableX = TABLE_X;
  const tableW = w - tableX - RM;
  const top = 58;
  const rowH = 66;
  const yHole = top + 24;
  const yPar = yHole + rowH;
  const yScore = yPar + rowH;

  const rs = rangeStats(round.holes, range);
  const rangeLabel = range === "front" ? "FRONT 9" : range === "back" ? "BACK 9" : "";

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
    rs.thru === 0 ? "#eef2f6" : toPar < 0 ? "#38e08b" : toPar > 0 ? "#e5484d" : "#eef2f6";

  const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
  const MONO = "'JetBrains Mono', monospace";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* 카드 배경 */}
      <rect x="0" y="0" width={w} height={h} rx="20" fill="#0b0e12" opacity="0.92" />
      <rect x="0" y="0" width={w} height="6" rx="3" fill="#38e08b" />
      {/* 좌/우 구분선 */}
      <line x1={LP} y1="28" x2={LP} y2={h - 28} stroke="#262e3a" strokeWidth="2" />

      {/* ── 좌측 선수 패널 (섹션 구분) ── */}
      {/* 1) 골프장 · 날짜 */}
      <text x="32" y="42" fill="#38e08b" fontFamily={HEAD} fontSize="18" fontWeight="600"
            letterSpacing="2">
        {(round.course || "").toUpperCase()}{round.date ? `  ·  ${round.date.replaceAll("-", ".")}` : ""}{rangeLabel ? `  ·  ${rangeLabel}` : ""}
      </text>

      {/* 2) 선수명 */}
      <text x="32" y="88" fill="#eef2f6" fontFamily={HEAD} fontSize="44" fontWeight="700"
            letterSpacing="0.5">
        {(round.player || "PLAYER").toUpperCase()}
      </text>

      {/* 구분선 */}
      <line x1="32" y1="110" x2={LP - 24} y2="110" stroke="#262e3a" strokeWidth="1.5" />

      {/* 3) 하단 스탯: TO PAR(좌) · THRU(우) */}
      <text x="32" y="146" fill="#9aa6b4" fontFamily={HEAD} fontSize="18" letterSpacing="2">
        TO PAR
      </text>
      <text x="32" y="212" fill={toParColor} fontFamily={HEAD} fontSize="64" fontWeight="700">
        {toParLabel(rs.thru === 0 ? null : toPar)}
      </text>

      <line x1={LP - 112} y1="124" x2={LP - 112} y2={h - 30} stroke="#262e3a" strokeWidth="1.5" />
      <text x={LP - 24} y="146" textAnchor="end" fill="#9aa6b4" fontFamily={HEAD} fontSize="18"
            letterSpacing="2">THRU</text>
      <text x={LP - 24} y="208" textAnchor="end" fill="#eef2f6" fontFamily={HEAD} fontSize="46"
            fontWeight="700">{rs.thru}</text>

      {/* ── 홀 테이블 ── */}
      {/* 행 라벨 (좌측 작은 태그) */}
      {[["HOLE", yHole], ["PAR", yPar], ["SCORE", yScore]].map(([lbl, y]) => (
        <text key={lbl} x={tableX - 16} y={y + 6} textAnchor="end" fill="#5f6b7a"
              fontFamily={HEAD} fontSize="18" letterSpacing="1">
          {lbl}
        </text>
      ))}

      {cols.map((c, idx) => {
        const cx = colX(idx);
        const isSum = c.type === "sum";
        if (isSum) {
          const parVal =
            c.key === "out" ? summary.outPar : c.key === "in" ? summary.inPar : summary.totalPar;
          const scVal =
            c.key === "out" ? summary.outScore : c.key === "in" ? summary.inScore : summary.totalScore;
          const showSum =
            c.key === "out" ? summary.hasFront : c.key === "in" ? summary.hasBack : summary.thru > 0;
          return (
            <g key={idx}>
              <rect x={cx - cw / 2 + 3} y={top} width={cw - 6} height={rowH * 3 - 8} rx="8"
                    fill="#38e08b" opacity="0.10" />
              <text x={cx} y={yHole + 6} textAnchor="middle" fill="#38e08b"
                    fontFamily={HEAD} fontSize="26" fontWeight="700" letterSpacing="1">
                {c.label}
              </text>
              <text x={cx} y={yPar + 6} textAnchor="middle" fill="#9aa6b4"
                    fontFamily={MONO} fontSize="30">
                {parVal || ""}
              </text>
              <text x={cx} y={yScore + 10} textAnchor="middle" fill="#eef2f6"
                    fontFamily={MONO} fontSize="40" fontWeight="700">
                {showSum ? scVal : ""}
              </text>
            </g>
          );
        }
        const hole = round.holes[c.i];
        const { kind } = classify(hole?.par, hole?.score);
        const color = KIND_COLOR[kind];
        const hasScore = kind !== "empty";
        const under = kind === "birdie" || kind === "eagle" || kind === "albatross";
        const over = kind === "bogey" || kind === "double" || kind === "triple";
        return (
          <g key={idx}>
            <text x={cx} y={yHole + 6} textAnchor="middle" fill="#c7d0db"
                  fontFamily={HEAD} fontSize="30" fontWeight="600">
              {c.i + 1}
            </text>
            <text x={cx} y={yPar + 6} textAnchor="middle" fill="#5f6b7a"
                  fontFamily={MONO} fontSize="26">
              {hole?.par}
            </text>
            {/* 마커: 언더=원, 오버=사각형 (칸 폭에 맞게) */}
            {hasScore && under && (
              <circle cx={cx} cy={yScore} r="22" fill="none" stroke={color} strokeWidth="3" />
            )}
            {hasScore && kind === "eagle" && (
              <circle cx={cx} cy={yScore} r="27" fill="none" stroke={color} strokeWidth="2.5" />
            )}
            {hasScore && over && (
              <rect x={cx - 22} y={yScore - 22} width="44" height="44" rx="4"
                    fill="none" stroke={color} strokeWidth="3" />
            )}
            {hasScore && (kind === "double" || kind === "triple") && (
              <rect x={cx - 27} y={yScore - 27} width="54" height="54" rx="4"
                    fill="none" stroke={color} strokeWidth="2.5" />
            )}
            <text x={cx} y={yScore + 11} textAnchor="middle"
                  fill={hasScore ? (kind === "par" ? "#eef2f6" : color) : "#38404d"}
                  fontFamily={MONO} fontSize="38" fontWeight="700">
              {hasScore ? hole.score : "·"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
