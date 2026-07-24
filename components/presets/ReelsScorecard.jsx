// 프리셋: Reels(세로 9:16 영상용) 스코어카드 오버레이
// 헤더(선수/대회/to-par) + FRONT 9 / BACK 9 2줄 + 합계 바. 1080 폭 기준.
import { classify, toParLabel, KIND_COLOR } from "../../lib/score";

export const SIZE = { w: 1080, h: 660 };

const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
const MONO = "'JetBrains Mono', monospace";

function HoleCell({ cx, rowY, hole, idx }) {
  const { kind } = classify(hole?.par, hole?.score);
  const color = KIND_COLOR[kind];
  const has = kind !== "empty";
  const under = kind === "birdie" || kind === "eagle" || kind === "albatross";
  const over = kind === "bogey" || kind === "double" || kind === "triple";
  const cy = rowY + 92;
  return (
    <g>
      <text x={cx} y={rowY + 24} textAnchor="middle" fill="#c7d0db"
            fontFamily={HEAD} fontSize="26" fontWeight="600">{idx + 1}</text>
      <text x={cx} y={rowY + 50} textAnchor="middle" fill="#5f6b7a"
            fontFamily={MONO} fontSize="20">{hole?.par}</text>
      {has && under && <circle cx={cx} cy={cy} r="24" fill="none" stroke={color} strokeWidth="3" />}
      {has && kind === "eagle" && <circle cx={cx} cy={cy} r="30" fill="none" stroke={color} strokeWidth="2.5" />}
      {has && over && <rect x={cx - 24} y={cy - 24} width="48" height="48" rx="4" fill="none" stroke={color} strokeWidth="3" />}
      {has && (kind === "double" || kind === "triple") &&
        <rect x={cx - 30} y={cy - 30} width="60" height="60" rx="4" fill="none" stroke={color} strokeWidth="2.5" />}
      <text x={cx} y={cy + 12} textAnchor="middle"
            fill={has ? (kind === "par" ? "#eef2f6" : color) : "#38404d"}
            fontFamily={MONO} fontSize="36" fontWeight="700">{has ? hole.score : "·"}</text>
    </g>
  );
}

export default function ReelsScorecard({ round, summary }) {
  const { w, h } = SIZE;
  const pad = 40;
  const innerW = w - pad * 2;
  const cw = innerW / 9;
  const cx = (i) => pad + i * cw + cw / 2;

  const toPar = summary.toPar;
  const toParColor =
    summary.thru === 0 ? "#eef2f6" : toPar < 0 ? "#38e08b" : toPar > 0 ? "#e5484d" : "#eef2f6";

  const frontY = 250;
  const backY = 400;

  const totals = [
    ["OUT", summary.hasFront ? summary.outScore : "", "#9aa6b4"],
    ["IN", summary.hasBack ? summary.inScore : "", "#9aa6b4"],
    ["TOTAL", summary.thru > 0 ? summary.totalScore : "", "#eef2f6"],
    ["TO PAR", summary.thru > 0 ? toParLabel(toPar) : "", toParColor],
  ];
  const tY = 545;
  const tGap = 16;
  const tW = (innerW - tGap * 3) / 4;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="0" y="0" width={w} height={h} rx="24" fill="#0b0e12" opacity="0.92" />
      <rect x="0" y="0" width="6" height={h} rx="3" fill="#38e08b" />

      {/* 헤더 */}
      <text x={pad} y="70" fill="#38e08b" fontFamily={HEAD} fontSize="30" fontWeight="600"
            letterSpacing="4">
        {(round.course || "").toUpperCase()} {round.date ? `· ${round.date.replaceAll("-", ".")}` : ""}
      </text>
      <text x={pad} y="150" fill="#eef2f6" fontFamily={HEAD} fontSize="78" fontWeight="700"
            letterSpacing="1">
        {(round.player || "PLAYER").toUpperCase()}
      </text>

      <text x={w - pad} y="66" textAnchor="end" fill="#9aa6b4" fontFamily={HEAD}
            fontSize="26" letterSpacing="3">TO PAR</text>
      <text x={w - pad} y="150" textAnchor="end" fill={toParColor} fontFamily={HEAD}
            fontSize="86" fontWeight="700">
        {toParLabel(summary.thru === 0 ? null : toPar)}
      </text>
      <text x={w - pad} y="190" textAnchor="end" fill="#9aa6b4" fontFamily={HEAD}
            fontSize="26" letterSpacing="2">THRU {summary.thru}</text>

      <line x1={pad} y1="212" x2={w - pad} y2="212" stroke="#262e3a" strokeWidth="2" />

      {/* FRONT 9 */}
      <text x={pad} y={frontY - 8} fill="#5f6b7a" fontFamily={HEAD} fontSize="20"
            letterSpacing="2">HOLES 1–9</text>
      {round.holes.slice(0, 9).map((hole, i) => (
        <HoleCell key={i} cx={cx(i)} rowY={frontY} hole={hole} idx={i} />
      ))}

      {/* BACK 9 */}
      <text x={pad} y={backY - 8} fill="#5f6b7a" fontFamily={HEAD} fontSize="20"
            letterSpacing="2">HOLES 10–18</text>
      {round.holes.slice(9, 18).map((hole, i) => (
        <HoleCell key={i + 9} cx={cx(i)} rowY={backY} hole={hole} idx={i + 9} />
      ))}

      {/* 합계 바 */}
      {totals.map(([label, val, color], i) => {
        const x = pad + i * (tW + tGap);
        return (
          <g key={label}>
            <rect x={x} y={tY} width={tW} height="80" rx="10"
                  fill="#38e08b" opacity={i === 3 ? 0.14 : 0.07} />
            <text x={x + tW / 2} y={tY + 30} textAnchor="middle" fill="#9aa6b4"
                  fontFamily={HEAD} fontSize="20" letterSpacing="2">{label}</text>
            <text x={x + tW / 2} y={tY + 66} textAnchor="middle" fill={color}
                  fontFamily={MONO} fontSize="34" fontWeight="700">{val}</text>
          </g>
        );
      })}
    </svg>
  );
}
