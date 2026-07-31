// 프리셋: 1홀 카드 미니멀 스타일 — 2줄 로어서드
// 좌측 2줄: 이름(상) + 홀/거리/SHOT(하)
// 우측: TO PAR 크게 (전체 높이 중앙)
import { cardColors } from "../../lib/theme";
import { displayPlayerName } from "./svgText";
import { HEAD, MONO } from "./scorecardPrimitives";

export const SIZE = { w: 360, h: 88 };

function bannerFor(data) {
  const par = Number(data.par) || null;
  const shots = Number(data.currentShot) || 0;
  if (data.showResultBanner === false || !par || shots <= 0) return null;
  const diff = shots - par;
  if (par >= 5) {
    if (diff === -2) return { text: "FOR EAGLE", type: "good" };
    if (diff === -1) return { text: "FOR BIRDIE", type: "good" };
  } else if (par === 4) {
    if (diff === -1) return { text: "FOR BIRDIE", type: "good" };
  } else if (par === 3) {
    if (diff === -1) return { text: "FOR BIRDIE", type: "good" };
  }
  if (diff === 1) return { text: "FOR BOGEY", type: "bad" };
  if (diff === 2) return { text: "FOR DOUBLE BOGEY", type: "worse" };
  return null;
}

export default function HoleCardMinimal({ data, theme = "dark" }) {
  const c = cardColors(theme);
  const { w, h } = SIZE;
  const pad = 16;
  const row1Y = h * 0.34;
  const row2Y = h * 0.72;
  const toParX = w - pad - 10;
  const leftW = w - 90;

  const player = displayPlayerName(data.player);
  const par = Number(data.par) || 4;
  const shots = Number(data.currentShot) || 0;
  const totalShots = Math.max(par, shots);
  const shotNums = Array.from({ length: totalShots }, (_, i) => i + 1);

  const toPar = data.toPar || "E";
  const toParColor = String(toPar).startsWith("-") ? c.accent : String(toPar).startsWith("+") ? "#e5484d" : c.text;

  const holeLabel = data.hole ? `${data.hole}H` : "";
  const dist = data.distance ? `${data.distance}${data.unit === "yd" ? "YDS" : "M"}` : "";
  const banner = bannerFor(data);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "transparent" }}>
      <rect x="0" y="0" width={w} height={h} rx="14" ry="14" fill={c.bg} opacity="0.94" />

      {/* 이름 배경 박스 */}
      <rect x={pad - 2} y={row1Y - 16} width={leftW - pad + 2} height="32" rx="5" ry="5" fill={c.panel} />

      {/* 이름 (좌측 상단 행, 박스 내 중앙) */}
      <text x={pad + 8} y={row1Y} dominantBaseline="middle" fill={c.text}
            fontFamily={HEAD} fontSize="24" fontWeight="700" letterSpacing="0.5">
        {player}
      </text>

      {/* TO PAR (우측, 전체 높이 중앙) */}
      <text x={toParX} y={h / 2} textAnchor="end" dominantBaseline="middle" fill={toParColor}
            fontFamily={HEAD} fontSize="48" fontWeight="700">
        {toPar}
      </text>

      {/* 하단 행: 홀 + 거리 + SHOT */}
      <text x={pad} y={row2Y} dominantBaseline="middle" fill={c.sub}
            fontFamily={HEAD} fontSize="16" fontWeight="700" letterSpacing="0.5">
        {holeLabel}
      </text>
      {dist && (
        <text x={pad + holeLabel.length * 11 + 8} y={row2Y} dominantBaseline="middle" fill={c.faint}
              fontFamily={MONO} fontSize="15" fontWeight="600">
          {dist}
        </text>
      )}

      {/* SHOT 번호 */}
      {shotNums.map((n, i) => {
        const baseX = pad + (holeLabel.length * 11 + 8) + (dist ? dist.length * 9 + 12 : 0);
        const sx = baseX + i * 22;
        const active = n === shots;
        return (
          <g key={n}>
            {active && <circle cx={sx} cy={row2Y} r="10" fill={c.accent} />}
            <text x={sx} y={row2Y} textAnchor="middle" dominantBaseline="middle"
                  fill={active ? c.ink : c.sub} fontFamily={MONO}
                  fontSize="14" fontWeight="700">{n}</text>
          </g>
        );
      })}

      {/* 배너 (하단 행 우측) */}
      {banner && !dist && (
        <text x={leftW} y={row2Y} textAnchor="end" dominantBaseline="middle"
              fill={banner.type === "good" ? c.accent : "#e5484d"}
              fontFamily={HEAD} fontSize="11" fontWeight="700" letterSpacing="0.5">
          {banner.text}
        </text>
      )}

      {/* 워터마크 */}
      <text x={w - pad} y={h - 4} textAnchor="end" fill={c.faint} opacity="0.4"
        fontFamily={HEAD} fontSize="7" fontWeight="600" letterSpacing="1">
        DALLU GOLF
      </text>
    </svg>
  );
}
