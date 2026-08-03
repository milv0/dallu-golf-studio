// 프리셋: 1홀 카드 미니멀 스타일 — 2줄 로어서드
// 좌측 2줄: 이름(상) + 홀/거리/SHOT(하)
// 우측: TO PAR 크게 (전체 높이 중앙)
import { memo } from "react";
import { cardColors } from "../../lib/theme";
import { normalizeToParDisplay, toParColor } from "../../lib/score";
import { displayPlayerName, textWidth } from "./svgText";
import { HEAD, MONO } from "./scorecardPrimitives";

export const SIZE = { w: 380, h: 88 };


function HoleCardMinimal({ data, theme = "dark" }) {
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
  const hasPar = data.par !== "" && data.par != null;
  const totalShots = hasPar ? Math.max(par, shots) : 0;
  const shotNums = Array.from({ length: totalShots }, (_, i) => i + 1);

  const toPar = normalizeToParDisplay(data.toPar, "–");
  const toParFill = toParColor(toPar, c);

  const holeLabel = data.hole ? `${data.hole}H` : "";
  const dist = data.distance ? `${data.distance}${data.unit === "yd" ? "YDS" : "M"}` : "";

  // 하단 행 레이아웃: 홀 → 거리 → SHOT. SHOT 영역은 TO PAR 폭을 미리 비워 둔다.
  const HOLE_FS = 16;
  const DIST_FS = 15;
  const SHOT_R_MAX = 10;
  const SHOT_STEP_MAX = 22;
  const holeW = holeLabel ? textWidth(holeLabel, HOLE_FS, "head") : 0;
  const distW = dist ? textWidth(dist, DIST_FS, "mono") : 0;
  const distX = pad + holeW + (holeLabel ? 6 : 0);
  // 최소 3글자("+00") 폭은 항상 확보해 자릿수가 늘어도 겹치지 않게 한다.
  const toParW = Math.max(textWidth(toPar, 48, "head"), textWidth("+00", 48, "head"));
  const shotZoneRight = toParX - toParW - 10;
  const shotBaseX = distX + (dist ? distW + 14 : 0) + SHOT_R_MAX;
  const shotAvail = Math.max(shotZoneRight - shotBaseX - SHOT_R_MAX, 0);
  const shotStep = shotNums.length > 1
    ? Math.min(SHOT_STEP_MAX, Math.max(13, shotAvail / (shotNums.length - 1)))
    : SHOT_STEP_MAX;
  const shotR = Math.min(SHOT_R_MAX, shotStep * 0.45);
  const shotFs = Math.min(14, shotStep * 0.64);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "transparent" }}>
      <rect x="0" y="0" width={w} height={h} fill={c.bg} opacity="0.94" />

      {/* 이름 배경 박스 */}
      <rect x={pad - 2} y={row1Y - 16} width={leftW - pad + 2} height="32" rx="5" ry="5" fill={c.panel} />

      {/* 이름 (좌측 상단 행, 박스 내 중앙) */}
      <text x={pad + 8} y={row1Y} dominantBaseline="middle" fill={c.text}
            fontFamily={HEAD} fontSize="24" fontWeight="700" letterSpacing="0.5">
        {player}
      </text>

      {/* TO PAR (우측, 전체 높이 중앙) */}
      <text x={toParX} y={h / 2} textAnchor="end" dominantBaseline="middle" fill={toParFill}
            fontFamily={HEAD} fontSize="48" fontWeight="700">
        {toPar}
      </text>

      {/* 하단 행: 홀 + 거리 + SHOT */}
      <text x={pad} y={row2Y} dominantBaseline="middle" fill={c.sub}
            fontFamily={HEAD} fontSize={HOLE_FS} fontWeight="700" letterSpacing="0.5">
        {holeLabel}
      </text>
      {dist && (
        <text x={distX} y={row2Y} dominantBaseline="middle" fill={c.faint}
              fontFamily={MONO} fontSize={DIST_FS} fontWeight="600">
          {dist}
        </text>
      )}

      {/* SHOT 번호 */}
      {shotNums.map((n, i) => {
        const sx = shotBaseX + i * shotStep;
        const active = n === shots;
        return (
          <g key={n}>
            {active && <circle cx={sx} cy={row2Y} r={shotR} fill={c.accent} />}
            <text x={sx} y={row2Y} textAnchor="middle" dominantBaseline="middle"
                  fill={active ? c.ink : c.sub} fontFamily={MONO}
                  fontSize={shotFs} fontWeight="700">{n}</text>
          </g>
        );
      })}


      {/* 워터마크 */}
      <text x={w - pad} y={h - 4} textAnchor="end" fill={c.faint} opacity="0.4"
        fontFamily={HEAD} fontSize="7" fontWeight="600" letterSpacing="1">
        DALLU GOLF
      </text>
    </svg>
  );
}

export default memo(HoleCardMinimal);
