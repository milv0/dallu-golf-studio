// 프리셋: Reels(세로 9:16 영상용) 스코어카드 오버레이
// 헤더(선수/대회/to-par) + FRONT 9 / BACK 9 2줄 + 합계 바. 1080 폭 기준.
import { toParLabel, rangeStats } from "../../lib/score";
import { cardColors } from "../../lib/theme";
import { displayPlayerName, fitFontSize } from "./svgText";
import { CompactHoleCell, CompactScorecard, HEAD, MONO } from "./scorecardPrimitives";

export function sizeFor(range = "all") {
  return range === "all" ? { w: 1080, h: 660 } : { w: 1080, h: 200 };
}
export const SIZE = sizeFor("all");

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
  const playerName = displayPlayerName(round.player);
  const playerSize = fitFontSize(playerName, { base: 78, min: 42, maxWidth: w - pad * 2 - 210 });

  const toPar = rs.toPar;
  const toParColor =
    rs.thru === 0 ? c.text : toPar < 0 ? c.accent : toPar > 0 ? "#e5484d" : c.text;

  if (!isAll) {
    const nineScore = range === "front" ? summary.outScore : summary.inScore;
    const hasNine = range === "front" ? summary.hasFront : summary.hasBack;
    return (
      <CompactScorecard
        w={w}
        h={h}
        c={c}
        holes={round.holes.slice(rs.start, rs.end)}
        startIndex={rs.start}
        showHoleNumbers={true}
        toPar={hasNine ? toParLabel(toPar) : ""}
        toParColor={toParColor}
        scoreDetail={hasNine ? String(nineScore) : ""}
      />
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "transparent" }}>
      <rect x="0" y="0" width={w} height={h} fill={c.bg} opacity="0.92" />
      <text x={pad} y="70" fill={c.accent} fontFamily={HEAD} fontSize="30" fontWeight="600"
            letterSpacing="4">
        {[round.date ? round.date.replaceAll("-", ".") : "", rangeLabel].filter(Boolean).join(" · ")}
      </text>
      <text x={pad} y="132" dominantBaseline="middle" fill={c.text} fontFamily={HEAD}
            fontSize={playerSize} fontWeight="700" letterSpacing="1">
        {playerName}
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

      <text x={pad} y={242} fill={c.faint} fontFamily={HEAD} fontSize="20" letterSpacing="2" className="score-meta-lock">HOLES 1-9</text>
      {round.holes.slice(0, 9).map((hole, i) => (
        <CompactHoleCell key={i} cx={cx(i)} rowY={250} hole={hole} index={i} c={c} />
      ))}
      <text x={pad} y={392} fill={c.faint} fontFamily={HEAD} fontSize="20" letterSpacing="2" className="score-meta-lock">HOLES 10-18</text>
      {round.holes.slice(9, 18).map((hole, i) => (
        <CompactHoleCell key={i + 9} cx={cx(i)} rowY={400} hole={hole} index={i + 9} c={c} />
      ))}
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
            <rect x={x} y={545} width={tW} height="80" fill={c.accent} opacity={i === 3 ? 0.14 : 0.07} />
            <text x={x + tW / 2} y={575} textAnchor="middle" fill={c.sub} fontFamily={HEAD} fontSize="20" letterSpacing="2">{label}</text>
            <text x={x + tW / 2} y={611} textAnchor="middle" fill={color} fontFamily={MONO} fontSize="34" fontWeight="700">{val}</text>
          </g>
        );
      })}
      <text x={w - 40} y={h - 12} textAnchor="end" fill={c.faint} opacity="0.5"
        fontFamily={HEAD} fontSize="14" fontWeight="600" letterSpacing="1">
        DALLU GOLF
      </text>
    </svg>
  );
}
