// 프리셋: Reels(세로 9:16 영상용) 스코어카드 오버레이
// 헤더(선수/대회/to-par) + FRONT 9 / BACK 9 2줄 + 합계 바. 1080 폭 기준.
import { classify, toParLabel, KIND_COLOR, rangeStats } from "../../lib/score";
import { cardColors } from "../../lib/theme";

export function sizeFor(range = "all") {
  return range === "all" ? { w: 1080, h: 660 } : { w: 1080, h: 200 };
}
export const SIZE = sizeFor("all");

const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
const MONO = "'JetBrains Mono', monospace";

function HoleCell({ cx, rowY, hole, idx, c }) {
  const { kind } = classify(hole?.par, hole?.score);
  const color = KIND_COLOR[kind];
  const has = kind !== "empty";
  const under = kind === "birdie" || kind === "eagle" || kind === "albatross";
  const over = kind === "bogey" || kind === "double" || kind === "triple";
  const cy = rowY + 108;
  return (
    <g>
      <text x={cx} y={rowY + 22} textAnchor="middle" fill={c.text}
            fontFamily={HEAD} fontSize="28" fontWeight="600">{idx + 1}</text>      <text x={cx} y={rowY + 58} textAnchor="middle" fill={c.faint}
            fontFamily={MONO} fontSize="26" fontWeight="600">P{hole?.par}</text>
      {has && under && <circle cx={cx} cy={cy} r="30" fill="none" stroke={color} strokeWidth="3.5" />}
      {has && kind === "eagle" && <circle cx={cx} cy={cy} r="37" fill="none" stroke={color} strokeWidth="3" />}
      {has && over && <rect x={cx - 30} y={cy - 30} width="60" height="60" rx="5" fill="none" stroke={color} strokeWidth="3.5" />}
      {has && (kind === "double" || kind === "triple") &&
        <rect x={cx - 37} y={cy - 37} width="74" height="74" rx="5" fill="none" stroke={color} strokeWidth="3" />}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" dy="0.04em"
            fill={has ? c.text : c.faint}
            fontFamily={MONO} fontSize="50" fontWeight="700">{has ? hole.score : "·"}</text>
    </g>
  );
}

export default function ReelsScorecard({ round, summary, range = "all", theme = "dark" }) {
  const { w, h } = sizeFor(range);
  const c = cardColors(theme);
  const pad = 40;
  const innerW = w - pad * 2;
  const cw = innerW / 9;
  const cx = (i) => pad + i * cw + cw / 2;
  const isAll = range === "all";
  const rs = rangeStats(round.holes, range);
  const rangeLabel = range === "front" ? "FRONT 9" : range === "back" ? "BACK 9" : "";

  const toPar = rs.toPar;
  const toParColor =
    rs.thru === 0 ? c.text : toPar < 0 ? c.accent : toPar > 0 ? "#e5484d" : c.text;

  // 9홀: 홀 스코어 중심 + 우측 최종 스코어
  if (!isAll) {
    const nineScore = range === "front" ? summary.outScore : summary.inScore;
    const hasNine = range === "front" ? summary.hasFront : summary.hasBack;
    const scoreW = 116, gap = 18, sidePad = 18;
    const holesW = w - sidePad * 2 - scoreW - gap;
    const cw2 = holesW / 9;
    const cxH = (i) => sidePad + i * cw2 + cw2 / 2;
    const rowY = 40;
    const sx = sidePad + holesW + gap;  // 우측 스코어 패널 시작 x
    const scx = sx + scoreW / 2;        // 우측 패널 중앙
    const scoreTop = 48, scoreH = 108;
    const scoreBottom = scoreTop + scoreH;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
           xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
        <rect x="0" y="0" width={w} height={h} fill={c.bg} opacity="0.92" />
        {round.holes.slice(rs.start, rs.end).map((hole, i) => (
          <HoleCell key={i} cx={cxH(i)} rowY={rowY} hole={hole} idx={rs.start + i} c={c} />
        ))}
        {/* 우측 최종 스코어 패널 */}
        <line x1={sx - gap / 2} y1={scoreTop} x2={sx - gap / 2} y2={scoreBottom} stroke={c.line} strokeWidth="2" />
        <text x={scx} y="86" textAnchor="middle" dominantBaseline="middle" fill={toParColor} fontFamily={HEAD} fontSize="72" fontWeight="700">
          {hasNine ? toParLabel(toPar) : "–"}
        </text>
        <text x={scx} y="140" textAnchor="middle" dominantBaseline="middle" fill={c.sub} fontFamily={MONO} fontSize="30" fontWeight="600" letterSpacing="0.5">
          {hasNine ? `${nineScore}` : ""}
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="0" y="0" width={w} height={h} fill={c.bg} opacity="0.92" />
      {/* 헤더 */}
      <text x={pad} y="70" fill={c.accent} fontFamily={HEAD} fontSize="30" fontWeight="600"
            letterSpacing="4">
        {[round.date ? round.date.replaceAll("-", ".") : "", rangeLabel].filter(Boolean).join(" · ")}
      </text>
      <text x={pad} y="150" fill={c.text} fontFamily={HEAD} fontSize="78" fontWeight="700"
            letterSpacing="1">
        {(round.player || "PLAYER").toUpperCase()}
      </text>

      <text x={w - pad} y="66" textAnchor="end" fill={c.sub} fontFamily={HEAD}
            fontSize="26" letterSpacing="3">TO PAR</text>
      <text x={w - pad} y="150" textAnchor="end" fill={toParColor} fontFamily={HEAD}
            fontSize="86" fontWeight="700">
        {toParLabel(rs.thru === 0 ? null : toPar)}
      </text>
      <text x={w - pad} y="190" textAnchor="end" fill={c.sub} fontFamily={HEAD}
            fontSize="26" letterSpacing="2">THRU {rs.thru}</text>

      <line x1={pad} y1="212" x2={w - pad} y2="212" stroke={c.line} strokeWidth="2" />

      {isAll ? (
        <>
          {/* FRONT 9 */}
          <text x={pad} y={242} fill={c.faint} fontFamily={HEAD} fontSize="20" letterSpacing="2">HOLES 1–9</text>
          {round.holes.slice(0, 9).map((hole, i) => (
            <HoleCell key={i} cx={cx(i)} rowY={250} hole={hole} idx={i} c={c} />
          ))}
          {/* BACK 9 */}
          <text x={pad} y={392} fill={c.faint} fontFamily={HEAD} fontSize="20" letterSpacing="2">HOLES 10–18</text>
          {round.holes.slice(9, 18).map((hole, i) => (
            <HoleCell key={i + 9} cx={cx(i)} rowY={400} hole={hole} idx={i + 9} c={c} />
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
                <rect x={x} y={545} width={tW} height="80" rx="10" fill={c.accent} opacity={i === 3 ? 0.14 : 0.07} />
                <text x={x + tW / 2} y={575} textAnchor="middle" fill={c.sub} fontFamily={HEAD} fontSize="20" letterSpacing="2">{label}</text>
                <text x={x + tW / 2} y={611} textAnchor="middle" fill={color} fontFamily={MONO} fontSize="34" fontWeight="700">{val}</text>
              </g>
            );
          })}
        </>
      ) : (
        <>
          {/* 단일 9홀 */}
          <text x={pad} y={252} fill={c.faint} fontFamily={HEAD} fontSize="20" letterSpacing="2">
            {range === "front" ? "HOLES 1–9" : "HOLES 10–18"}
          </text>
          {round.holes.slice(rs.start, rs.end).map((hole, i) => (
            <HoleCell key={i} cx={cx(i)} rowY={262} hole={hole} idx={rs.start + i} c={c} />
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
                <rect x={x} y={372} width={tW} height="78" rx="10" fill={c.accent} opacity={i === 1 ? 0.14 : 0.07} />
                <text x={x + tW / 2} y={402} textAnchor="middle" fill={c.sub} fontFamily={HEAD} fontSize="20" letterSpacing="2">{label}</text>
                <text x={x + tW / 2} y={438} textAnchor="middle" fill={color} fontFamily={MONO} fontSize="34" fontWeight="700">{val}</text>
              </g>
            );
          })}
        </>
      )}
    </svg>
  );
}
