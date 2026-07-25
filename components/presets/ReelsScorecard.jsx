// 프리셋: Reels(세로 9:16 영상용) 스코어카드 오버레이
// 헤더(선수/대회/to-par) + FRONT 9 / BACK 9 2줄 + 합계 바. 1080 폭 기준.
import { classify, toParLabel, KIND_COLOR, rangeStats } from "../../lib/score";

export function sizeFor(range = "all") {
  return range === "all" ? { w: 1080, h: 660 } : { w: 1080, h: 320 };
}
export const SIZE = sizeFor("all");

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
      <text x={cx} y={rowY + 52} textAnchor="middle" fill="#8b96a5"
            fontFamily={MONO} fontSize="24" fontWeight="600">P{hole?.par}</text>
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

export default function ReelsScorecard({ round, summary, range = "all" }) {
  const { w, h } = sizeFor(range);
  const pad = 40;
  const innerW = w - pad * 2;
  const cw = innerW / 9;
  const cx = (i) => pad + i * cw + cw / 2;
  const isAll = range === "all";
  const rs = rangeStats(round.holes, range);
  const rangeLabel = range === "front" ? "FRONT 9" : range === "back" ? "BACK 9" : "";

  const toPar = rs.toPar;
  const toParColor =
    rs.thru === 0 ? "#eef2f6" : toPar < 0 ? "#38e08b" : toPar > 0 ? "#e5484d" : "#eef2f6";

  // 9홀: 홀 스코어 중심 + 우측 최종 스코어
  if (!isAll) {
    const label = range === "front" ? "HOLES 1–9" : "HOLES 10–18";
    const nineScore = range === "front" ? summary.outScore : summary.inScore;
    const hasNine = range === "front" ? summary.hasFront : summary.hasBack;
    const scoreW = 220, gap = 22;
    const holesW = innerW - scoreW - gap;
    const cw2 = holesW / 9;
    const cxH = (i) => pad + i * cw2 + cw2 / 2;
    const rowY = 104;
    const sx = pad + holesW + gap;      // 우측 스코어 패널 시작 x
    const scx = sx + scoreW / 2;        // 우측 패널 중앙
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
           xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
        <rect x="0" y="0" width={w} height={h} rx="24" fill="#0b0e12" opacity="0.92" />
        <rect x="0" y="0" width="6" height={h} rx="3" fill="#38e08b" />
        <text x={pad} y="52" fill="#38e08b" fontFamily={HEAD} fontSize="30" fontWeight="700" letterSpacing="3">
          {label}
        </text>
        {round.holes.slice(rs.start, rs.end).map((hole, i) => (
          <HoleCell key={i} cx={cxH(i)} rowY={rowY} hole={hole} idx={rs.start + i} />
        ))}
        {/* 구분선 */}
        <line x1={sx - gap / 2} y1="72" x2={sx - gap / 2} y2={h - 32} stroke="#262e3a" strokeWidth="2" />
        {/* 우측 최종 스코어 */}
        <text x={scx} y="140" textAnchor="middle" fill="#9aa6b4" fontFamily={HEAD} fontSize="24" letterSpacing="3">SCORE</text>
        <text x={scx} y="240" textAnchor="middle" fill="#eef2f6" fontFamily={HEAD} fontSize="104" fontWeight="700">
          {hasNine ? nineScore : "–"}
        </text>
        <text x={scx} y="292" textAnchor="middle" fill={toParColor} fontFamily={HEAD} fontSize="42" fontWeight="700">
          {hasNine ? toParLabel(toPar) : ""}
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="0" y="0" width={w} height={h} rx="24" fill="#0b0e12" opacity="0.92" />
      <rect x="0" y="0" width="6" height={h} rx="3" fill="#38e08b" />

      {/* 헤더 */}
      <text x={pad} y="70" fill="#38e08b" fontFamily={HEAD} fontSize="30" fontWeight="600"
            letterSpacing="4">
        {(round.course || "").toUpperCase()} {round.date ? `· ${round.date.replaceAll("-", ".")}` : ""}{rangeLabel ? ` · ${rangeLabel}` : ""}
      </text>
      <text x={pad} y="150" fill="#eef2f6" fontFamily={HEAD} fontSize="78" fontWeight="700"
            letterSpacing="1">
        {(round.player || "PLAYER").toUpperCase()}
      </text>

      <text x={w - pad} y="66" textAnchor="end" fill="#9aa6b4" fontFamily={HEAD}
            fontSize="26" letterSpacing="3">TO PAR</text>
      <text x={w - pad} y="150" textAnchor="end" fill={toParColor} fontFamily={HEAD}
            fontSize="86" fontWeight="700">
        {toParLabel(rs.thru === 0 ? null : toPar)}
      </text>
      <text x={w - pad} y="190" textAnchor="end" fill="#9aa6b4" fontFamily={HEAD}
            fontSize="26" letterSpacing="2">THRU {rs.thru}</text>

      <line x1={pad} y1="212" x2={w - pad} y2="212" stroke="#262e3a" strokeWidth="2" />

      {isAll ? (
        <>
          {/* FRONT 9 */}
          <text x={pad} y={242} fill="#5f6b7a" fontFamily={HEAD} fontSize="20" letterSpacing="2">HOLES 1–9</text>
          {round.holes.slice(0, 9).map((hole, i) => (
            <HoleCell key={i} cx={cx(i)} rowY={250} hole={hole} idx={i} />
          ))}
          {/* BACK 9 */}
          <text x={pad} y={392} fill="#5f6b7a" fontFamily={HEAD} fontSize="20" letterSpacing="2">HOLES 10–18</text>
          {round.holes.slice(9, 18).map((hole, i) => (
            <HoleCell key={i + 9} cx={cx(i)} rowY={400} hole={hole} idx={i + 9} />
          ))}
          {/* 합계 바 (4) */}
          {[
            ["OUT", summary.hasFront ? summary.outScore : "", "#9aa6b4"],
            ["IN", summary.hasBack ? summary.inScore : "", "#9aa6b4"],
            ["TOTAL", summary.thru > 0 ? summary.totalScore : "", "#eef2f6"],
            ["TO PAR", summary.thru > 0 ? toParLabel(summary.toPar) : "", summary.thru === 0 ? "#eef2f6" : summary.toPar < 0 ? "#38e08b" : summary.toPar > 0 ? "#e5484d" : "#eef2f6"],
          ].map(([label, val, color], i) => {
            const tW = (innerW - 16 * 3) / 4;
            const x = pad + i * (tW + 16);
            return (
              <g key={label}>
                <rect x={x} y={545} width={tW} height="80" rx="10" fill="#38e08b" opacity={i === 3 ? 0.14 : 0.07} />
                <text x={x + tW / 2} y={575} textAnchor="middle" fill="#9aa6b4" fontFamily={HEAD} fontSize="20" letterSpacing="2">{label}</text>
                <text x={x + tW / 2} y={611} textAnchor="middle" fill={color} fontFamily={MONO} fontSize="34" fontWeight="700">{val}</text>
              </g>
            );
          })}
        </>
      ) : (
        <>
          {/* 단일 9홀 */}
          <text x={pad} y={252} fill="#5f6b7a" fontFamily={HEAD} fontSize="20" letterSpacing="2">
            {range === "front" ? "HOLES 1–9" : "HOLES 10–18"}
          </text>
          {round.holes.slice(rs.start, rs.end).map((hole, i) => (
            <HoleCell key={i} cx={cx(i)} rowY={262} hole={hole} idx={rs.start + i} />
          ))}
          {/* 합계 바 (2) */}
          {[
            [range === "front" ? "OUT" : "IN",
             range === "front" ? (summary.hasFront ? summary.outScore : "") : (summary.hasBack ? summary.inScore : ""),
             "#eef2f6"],
            ["TO PAR", rs.thru > 0 ? toParLabel(toPar) : "", toParColor],
          ].map(([label, val, color], i) => {
            const tW = (innerW - 16) / 2;
            const x = pad + i * (tW + 16);
            return (
              <g key={label}>
                <rect x={x} y={372} width={tW} height="78" rx="10" fill="#38e08b" opacity={i === 1 ? 0.14 : 0.07} />
                <text x={x + tW / 2} y={402} textAnchor="middle" fill="#9aa6b4" fontFamily={HEAD} fontSize="20" letterSpacing="2">{label}</text>
                <text x={x + tW / 2} y={438} textAnchor="middle" fill={color} fontFamily={MONO} fontSize="34" fontWeight="700">{val}</text>
              </g>
            );
          })}
        </>
      )}
    </svg>
  );
}
