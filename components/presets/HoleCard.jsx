// 프리셋: 홀 카드 (현재 홀 라이브 오버레이) — 방송 로어서드 스타일, 우리 테마(다크+라임)
// 표시: 홀번호 · PAR · 거리 / 선수명 / 토탈(to-par) / SHOT(현재 타수 표시) / SELECTED CLUB / FOR X 배너
import { classify } from "../../lib/score";
import { cardColors } from "../../lib/theme";

export const SIZE = { w: 780, h: 340 };

const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const RESULT_LABEL = {
  albatross: "ALBATROSS", eagle: "EAGLE", birdie: "BIRDIE",
  par: "PAR", bogey: "BOGEY", double: "DOUBLE BOGEY", triple: "+",
};

export default function HoleCard({ data, theme = "dark" }) {
  const c = cardColors(theme);
  const { w } = SIZE;
  const barH = 250;
  const segW = 150;            // 홀 세그먼트 폭
  const tpW = 150;             // 토탈(우측) 블록 폭
  const row2Y = 160;           // 2행 시작

  const par = Number(data.par) || null;
  const shots = Number(data.currentShot) || 0;

  // 이번 샷을 홀아웃하면 나오는 결과 → FOR X
  let banner = "";
  if (par && shots > 0) {
    const { kind } = classify(par, shots);
    banner = RESULT_LABEL[kind] ? `FOR ${RESULT_LABEL[kind]}` : "";
  }

  // SHOT 번호 렌더 (1..shots, 마지막 동그라미)
  const shotNums = [];
  for (let i = 1; i <= Math.min(shots || 0, 9); i++) shotNums.push(i);

  return (
    <svg viewBox={`0 0 ${w} ${SIZE.h}`} width={w} height={SIZE.h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {/* 메인 바 */}
      <rect data-export-bg="true" x="0" y="0" width={w} height={barH} rx="18" fill={c.bg} opacity="0.94" />
      {/* 홀 세그먼트 (더 어둡게) */}
      <path data-export-bg="true" d={`M18,0 H${segW} V${barH} H18 Q0,${barH} 0,${barH - 18} V18 Q0,0 18,0 Z`}
            fill={c.seg} />
      <line x1={segW} y1="20" x2={segW} y2={barH - 20} stroke={c.line} strokeWidth="2" />

      {/* 홀 번호 · PAR · 거리 */}
      <text x={segW / 2} y="96" textAnchor="middle" fill={c.text} fontFamily={HEAD}
            fontSize="84" fontWeight="700">{data.hole || "–"}</text>
      <text x={segW / 2} y="140" textAnchor="middle" fill={c.accent} fontFamily={HEAD}
            fontSize="30" fontWeight="700" letterSpacing="1">PAR {data.par || "–"}</text>
      <text x={segW / 2} y="182" textAnchor="middle" fill={c.sub} fontFamily={MONO}
            fontSize="30" fontWeight="700">{data.distance ? (/[a-zA-Z]/.test(String(data.distance)) ? String(data.distance).toUpperCase() : `${data.distance}${data.unit === "yd" ? "y" : "m"}`) : ""}</text>

      {/* 선수명 (센터 상단) */}
      <circle cx={segW + 36} cy="76" r="28" fill="none" stroke={c.accent} strokeWidth="2.5" />
      <text x={segW + 36} y="87" textAnchor="middle" fill={c.accent} fontFamily={HEAD}
            fontSize="27" fontWeight="700">dG</text>
      <text x={segW + 76} y="92" fill={c.text} fontFamily={HEAD} fontSize="48" fontWeight="700"
            letterSpacing="0.5">{data.player || "PLAYER"}</text>

      {/* 토탈(to-par) 우측 블록 */}
      <path d={`M${w - tpW},0 H${w - 18} Q${w},0 ${w},18 V${row2Y - 20} Q${w},${row2Y - 2} ${w - 18},${row2Y - 2} H${w - tpW} Z`}
            fill={c.accent} />
      <text x={w - tpW / 2} y="104" textAnchor="middle" fill={c.ink} fontFamily={HEAD}
            fontSize="66" fontWeight="700">{data.toPar || "E"}</text>

      {/* 2행 구분선 */}
      <line x1={segW + 20} y1={row2Y} x2={w - 24} y2={row2Y} stroke={c.line} strokeWidth="1.5" />

      {/* SHOT */}
      <text x={segW + 24} y={row2Y + 28} fill={c.accent} fontFamily={HEAD} fontSize="22"
            fontWeight="700" fontStyle="italic" letterSpacing="1">SHOT</text>
      {shotNums.map((n, i) => {
        const cx = segW + 36 + i * 34;
        const last = i === shotNums.length - 1;
        return (
          <g key={n}>
            {last && <circle cx={cx} cy={row2Y + 58} r="17" fill="none" stroke={c.accent} strokeWidth="2.2" />}
            <text x={cx} y={row2Y + 67} textAnchor="middle"
                  fill={last ? c.accent : c.faint} fontFamily={MONO}
                  fontSize="26" fontWeight="700">{n}</text>
          </g>
        );
      })}

      {/* SELECTED CLUB */}
      <text x={w - 24} y={row2Y + 28} textAnchor="end" fill={c.accent} fontFamily={HEAD}
            fontSize="22" fontWeight="700" fontStyle="italic" letterSpacing="1">SELECTED CLUB</text>
      <text x={w - 24} y={row2Y + 68} textAnchor="end" fill={c.text} fontFamily={HEAD}
            fontSize="36" fontWeight="700">{(data.club || "").toUpperCase()}</text>

      {/* FOR X 배너 */}
      {banner && (
        <g>
          <rect x="330" y="266" width={w - 330} height="70" rx="12" fill={c.accent} />
          <text x={(330 + w) / 2} y="314" textAnchor="middle" fill={c.ink} fontFamily={HEAD}
                fontSize="42" fontWeight="700" letterSpacing="1">{banner}</text>
        </g>
      )}
    </svg>
  );
}
