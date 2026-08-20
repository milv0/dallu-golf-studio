// 프리셋: 1홀 카드 미니멀 스타일 — 2줄 로어서드
// 좌측 2줄: 이름(상) + 홀/거리/SHOT(하)
// 우측: TO PAR 크게 (전체 높이 중앙)
import { memo } from "react";
import { cardColors } from "../../lib/theme";
import { normalizeToParDisplay, toParColor } from "../../lib/score";
import { displayPlayerName } from "./svgText";
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
  const isCompactShotSequence = shotNums.length > 10;

  const toPar = normalizeToParDisplay(data.toPar, "–");
  const toParFill = toParColor(toPar, c);

  const holeLabel = data.hole ? `${data.hole}H` : "";
  const dist = data.distance ? `${data.distance}${data.unit === "yd" ? "YDS" : "M"}` : "";

  // html-to-image의 SVG 폰트 메트릭은 화면 브라우저와 달라질 수 있다.
  // 문자열 폭 추정으로 다음 x좌표를 계산하면 PNG에서 홀·거리가 붙으므로,
  // 각 정보에 고정 안전 구역을 배정해 미리보기와 내보내기를 동일하게 유지한다.
  const HOLE_FS = 16;
  const DIST_FS = 15;
  const SHOT_FS = 15;
  const SHOT_R_MAX = 10;
  const SHOT_STEP_MAX = 22;
  const distX = 48;
  // 최대 10타(PAR 5 × 2)까지 숫자 크기를 줄이지 않고 한 줄에 배치한다.
  const shotBaseX = 140;
  const shotZoneRight = 270;
  const shotAvail = Math.max(shotZoneRight - shotBaseX - SHOT_R_MAX, 0);
  const shotStep = shotNums.length > 1
    ? Math.min(SHOT_STEP_MAX, Math.max(10, shotAvail / (shotNums.length - 1)))
    : SHOT_STEP_MAX;
  const shotR = Math.min(SHOT_R_MAX, Math.max(5, shotStep * 0.45));

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
            {isCompactShotSequence && !active ? (
            <circle cx={sx} cy={row2Y} r="2.4" fill={c.sub} />
          ) : (
            <>
              {active && <circle cx={sx} cy={row2Y} r={shotR} fill={c.accent} />}
              <text x={sx} y={row2Y} textAnchor="middle" dominantBaseline="middle"
                    fill={active ? c.ink : c.sub} fontFamily={MONO}
                    fontSize={SHOT_FS} fontWeight="700">{n}</text>
            </>
          )}
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
