import { classify, KIND_COLOR } from "../../lib/score";

export const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export function hasNumericValue(value) {
  return value != null && value !== "" && !Number.isNaN(Number(value));
}

export function toParForPlayedHoles(holes) {
  let played = 0;
  let diff = 0;
  for (const h of holes || []) {
    if (!hasNumericValue(h?.par) || !hasNumericValue(h?.score)) continue;
    played++;
    diff += Number(h.score) - Number(h.par);
  }
  if (!played) return "";
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : String(diff);
}

export function ResultMarker({ kind, cx, cy, size = 30 }) {
  const color = KIND_COLOR[kind];
  const under = kind === "birdie" || kind === "eagle" || kind === "albatross";
  const over = kind === "bogey" || kind === "double" || kind === "triple";
  const outer = size + 7;
  if (!color || kind === "empty") return null;
  return (
    <>
      {under && <circle cx={cx} cy={cy} r={size} fill="none" stroke={color} strokeWidth="3.5" />}
      {kind === "eagle" && <circle cx={cx} cy={cy} r={outer} fill="none" stroke={color} strokeWidth="3" />}
      {over && <rect x={cx - size} y={cy - size} width={size * 2} height={size * 2} fill="none" stroke={color} strokeWidth="3.5" />}
      {(kind === "double" || kind === "triple") &&
        <rect x={cx - outer} y={cy - outer} width={outer * 2} height={outer * 2} fill="none" stroke={color} strokeWidth="3" />}
    </>
  );
}

export function ScoreNumber({ x, y, value, hasValue = true, empty = "·", fill, emptyFill, fontSize, fontFamily = MONO, fontWeight = "700" }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" dy="0.04em"
      fill={hasValue ? fill : emptyFill} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
      {hasValue ? value : empty}
    </text>
  );
}

export function CompactHoleCell({ cx, rowY, hole, index, c, showHoleNumbers = true, metaMode = "holePar", unit = "m" }) {
  const { kind } = classify(hole?.par, hole?.score);
  const has = kind !== "empty";
  const hasMeta = metaMode === "holePar" ? showHoleNumbers : true;
  const parY = hasMeta ? rowY + 58 : rowY + 26;
  const scoreY = hasMeta ? rowY + 108 : rowY + 88;

  const renderMeta = () => {
    if (metaMode === "parDist") {
      const dist = hole?.distance ? `${hole.distance}${unit === "yd" ? "y" : "m"}` : "";
      return (
        <>
          <text x={cx} y={rowY + 22} textAnchor="middle" fill={c.faint}
            fontFamily={MONO} fontSize="26" fontWeight="600" className="score-meta-lock">
            {hole?.par ? `P${hole.par}` : "P"}
          </text>
          <text x={cx} y={rowY + 50} textAnchor="middle" fill={c.sub}
            fontFamily={MONO} fontSize="18" fontWeight="600" className="score-meta-lock">
            {dist}
          </text>
        </>
      );
    }
    if (metaMode === "par") {
      return null;
    }
    // default: holePar
    return showHoleNumbers ? (
      <text x={cx} y={rowY + 22} textAnchor="middle" fill={c.text}
        fontFamily={HEAD} fontSize="28" fontWeight="600" className="score-meta-lock">
        {hole?.hole || index + 1}
      </text>
    ) : null;
  };

  return (
    <g>
      {renderMeta()}
      {metaMode !== "parDist" && (
        <text x={cx} y={parY} textAnchor="middle" fill={c.faint}
          fontFamily={MONO} fontSize="26" fontWeight="600" className="score-meta-lock">
          {hole?.par ? `P${hole.par}` : "P"}
        </text>
      )}
      <ResultMarker kind={kind} cx={cx} cy={scoreY} size={30} />
      <ScoreNumber x={cx} y={scoreY} value={hole?.score} hasValue={has} empty="·"
        fill={c.text} emptyFill={c.faint} fontSize="50" />
    </g>
  );
}

export function CompactScorecard({ w, h, c, holes, startIndex = 0, showHoleNumbers = true, metaMode = "holePar", unit = "m", toPar, toParColor, scoreDetail = "" }) {
  const scoreW = 116;
  const gap = 18;
  const sidePad = 18;
  const holesW = w - sidePad * 2 - scoreW - gap;
  const cw = holesW / Math.max((holes || []).length, 1);
  const cx = (i) => sidePad + i * cw + cw / 2;
  const rowY = 40;
  const sx = sidePad + holesW + gap;
  const scx = sx + scoreW / 2;
  const scoreTop = 48;
  const scoreH = 108;
  const scoreBottom = scoreTop + scoreH;
  const hasDetail = scoreDetail !== "" && scoreDetail != null;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
      xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "transparent" }}>
      <rect x="0" y="0" width={w} height={h} fill={c.bg} opacity="0.92" />
      {(holes || []).map((hole, i) => (
        <CompactHoleCell key={i} cx={cx(i)} rowY={rowY} hole={hole} index={startIndex + i} c={c} showHoleNumbers={showHoleNumbers} metaMode={metaMode} unit={unit} />
      ))}
      <line x1={sx - gap / 2} y1={scoreTop} x2={sx - gap / 2} y2={scoreBottom} stroke={c.line} strokeWidth="2" />
      <text x={scx} y={hasDetail ? 86 : 104} textAnchor="middle" dominantBaseline="middle" fill={toParColor}
        fontFamily={HEAD} fontSize={hasDetail ? "72" : "82"} fontWeight="700">
        {toPar || "–"}
      </text>
      {hasDetail && (
        <text x={scx} y="140" textAnchor="middle" dominantBaseline="middle" fill={c.sub}
          fontFamily={MONO} fontSize="30" fontWeight="600" letterSpacing="0.5">
          {scoreDetail}
        </text>
      )}
    </svg>
  );
}
