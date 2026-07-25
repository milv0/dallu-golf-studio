// 프리셋: 릴스 3홀 카드 — 9홀 카드와 같은 레이아웃의 3홀 축소판
import { classify, KIND_COLOR } from "../../lib/score";
import { cardColors } from "../../lib/theme";

export const SIZE = { w: 520, h: 200 };

const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
const MONO = "'JetBrains Mono', monospace";

function totalToPar(holes) {
  let played = 0;
  let diff = 0;
  for (const h of holes) {
    const par = Number(h.par);
    const score = Number(h.score);
    if (!Number.isNaN(par) && !Number.isNaN(score)) {
      played++;
      diff += score - par;
    }
  }
  if (!played) return "";
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : String(diff);
}

function HoleCell({ cx, rowY, hole, c, showHoleNumbers }) {
  const { kind } = classify(hole?.par, hole?.score);
  const color = KIND_COLOR[kind];
  const has = kind !== "empty";
  const under = kind === "birdie" || kind === "eagle" || kind === "albatross";
  const over = kind === "bogey" || kind === "double" || kind === "triple";
  const parY = showHoleNumbers ? rowY + 58 : rowY + 26;
  const cy = showHoleNumbers ? rowY + 108 : rowY + 88;

  return (
    <g>
      {showHoleNumbers && (
        <text x={cx} y={rowY + 22} textAnchor="middle" fill={c.text}
              fontFamily={HEAD} fontSize="28" fontWeight="600">
          {hole?.hole || "–"}
        </text>
      )}
      <text x={cx} y={parY} textAnchor="middle" fill={c.faint}
            fontFamily={MONO} fontSize="26" fontWeight="600">
        P{hole?.par || "–"}
      </text>
      {has && under && <circle cx={cx} cy={cy} r="30" fill="none" stroke={color} strokeWidth="3.5" />}
      {has && kind === "eagle" && <circle cx={cx} cy={cy} r="37" fill="none" stroke={color} strokeWidth="3" />}
      {has && over && <rect x={cx - 30} y={cy - 30} width="60" height="60" rx="5" fill="none" stroke={color} strokeWidth="3.5" />}
      {has && (kind === "double" || kind === "triple") &&
        <rect x={cx - 37} y={cy - 37} width="74" height="74" rx="5" fill="none" stroke={color} strokeWidth="3" />}
      <text x={cx} y={cy + 16} textAnchor="middle"
            fill={has ? c.text : c.faint}
            fontFamily={MONO} fontSize="50" fontWeight="700">
        {has ? hole.score : "·"}
      </text>
    </g>
  );
}

export default function ReelsThreeHoleCard({ data, theme = "light" }) {
  const { w, h } = SIZE;
  const c = cardColors(theme);
  const holes = (data.holes || []).slice(0, 3);
  const showHoleNumbers = data.showHoleNumbers !== false;
  const toPar = data.toPar || totalToPar(holes);
  const toParColor = !toPar ? c.text : String(toPar).startsWith("-") ? c.accent : String(toPar).startsWith("+") ? "#e5484d" : c.text;

  const scoreW = 116, gap = 18, sidePad = 18;
  const holesW = w - sidePad * 2 - scoreW - gap;
  const cw = holesW / 3;
  const cx = (i) => sidePad + i * cw + cw / 2;
  const rowY = 40;
  const sx = sidePad + holesW + gap;
  const scx = sx + scoreW / 2;
  const scoreTop = 48, scoreH = 108;
  const scoreBottom = scoreTop + scoreH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="0" y="0" width={w} height={h} rx="24" fill={c.bg} opacity="0.92" />
      <rect x="0" y="0" width={w} height="6" rx="3" fill={c.accent} />
      {holes.map((hole, i) => (
        <HoleCell key={i} cx={cx(i)} rowY={rowY} hole={hole} c={c} showHoleNumbers={showHoleNumbers} />
      ))}
      <line x1={sx - gap / 2} y1={scoreTop} x2={sx - gap / 2} y2={scoreBottom} stroke={c.line} strokeWidth="2" />
      <text x={scx} y="104" textAnchor="middle" dominantBaseline="middle" fill={toParColor}
            fontFamily={HEAD} fontSize="82" fontWeight="700">
        {toPar || "–"}
      </text>
    </svg>
  );
}
