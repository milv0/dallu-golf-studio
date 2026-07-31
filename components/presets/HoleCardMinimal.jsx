// 프리셋: 1홀 카드 미니멀 스타일 — 방송 로어서드 2줄 구조
// 상단: 이름 + TO PAR / 하단: 홀번호 + 거리 + SHOT
import { cardColors } from "../../lib/theme";
import { displayPlayerName } from "./svgText";
import { HEAD, MONO } from "./scorecardPrimitives";

export const SIZE = { w: 400, h: 110 };

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
  const r = 14;
  const pad = 16;
  const topH = 56;
  const player = displayPlayerName(data.player);
  const par = Number(data.par) || 4;
  const shots = Number(data.currentShot) || 0;
  const totalShots = Math.max(par, shots);
  const shotNums = Array.from({ length: totalShots }, (_, i) => i + 1);

  const toPar = data.toPar || "E";
  const toParColor = String(toPar).startsWith("-") ? c.accent : String(toPar).startsWith("+") ? "#e5484d" : c.text;

  const holeLabel = data.hole ? `${data.hole}${data.hole === "1" ? "ST" : data.hole === "2" ? "ND" : data.hole === "3" ? "RD" : "TH"}` : "";
  const dist = data.distance ? `${data.distance}${data.unit === "yd" ? "YDS" : "M"}` : "";

  const banner = bannerFor(data);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "transparent" }}>
      {/* 전체 배경 (둥근 모서리) */}
      <rect x="0" y="0" width={w} height={h} rx={r} ry={r} fill={c.bg} opacity="0.94" />

      {/* 상단: 이름 영역 배경 */}
      <rect x={pad - 4} y="8" width={w - pad * 2 - 60} height={topH - 20} rx="6" ry="6" fill={c.panel} />

      {/* 이름 */}
      <text x={pad + 6} y="26" dominantBaseline="middle" fill={c.text}
            fontFamily={HEAD} fontSize="28" fontWeight="700" letterSpacing="0.5">
        {player}
      </text>

      {/* TO PAR (우측) */}
      <text x={w - pad} y="26" textAnchor="end" dominantBaseline="middle" fill={toParColor}
            fontFamily={HEAD} fontSize="38" fontWeight="700">
        {toPar}
      </text>

      {/* 하단: 홀번호 + 거리 + SHOT */}
      <text x={pad} y="80" dominantBaseline="middle" fill={c.sub}
            fontFamily={HEAD} fontSize="18" fontWeight="600" letterSpacing="1">
        {holeLabel}
      </text>
      <text x={pad + (holeLabel.length * 12) + 10} y="80" dominantBaseline="middle" fill={c.faint}
            fontFamily={MONO} fontSize="18" fontWeight="600">
        {dist}
      </text>

      {/* SHOT 번호 */}
      {shotNums.map((n, i) => {
        const sx = pad + (holeLabel.length * 12) + 10 + (dist.length * 10) + 16 + i * 24;
        const active = n === shots;
        return (
          <g key={n}>
            {active && <circle cx={sx} cy="79" r="11" fill={c.accent} />}
            <text x={sx} y="80" textAnchor="middle" dominantBaseline="middle"
                  fill={active ? c.ink : c.faint} fontFamily={MONO}
                  fontSize="16" fontWeight="700">{n}</text>
          </g>
        );
      })}

      {/* 배너 텍스트 (있으면 우하단) */}
      {banner && (
        <text x={w - pad} y="80" textAnchor="end" dominantBaseline="middle"
              fill={banner.type === "good" ? c.accent : "#e5484d"}
              fontFamily={HEAD} fontSize="12" fontWeight="700" letterSpacing="0.5">
          {banner.text}
        </text>
      )}

      {/* 워터마크 */}
      <text x={w - pad} y={h - 5} textAnchor="end" fill={c.faint} opacity="0.4"
        fontFamily={HEAD} fontSize="8" fontWeight="600" letterSpacing="1">
        DALLU GOLF
      </text>
    </svg>
  );
}
