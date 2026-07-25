// 프리셋: 홀 카드 (현재 홀 라이브 오버레이) — 방송 로어서드 스타일, 우리 테마(다크+라임)
// 표시: 홀번호 · PAR · 거리 / 선수명 / 토탈(to-par) / SHOT(현재 타수 표시) / SELECTED CLUB / FOR X 배너
import { classify } from "../../lib/score";
import { cardColors } from "../../lib/theme";

export const SIZE = { w: 560, h: 292 };

const BAR_H = 212;
const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const RESULT_LABEL = {
  albatross: "ALBATROSS", eagle: "EAGLE", birdie: "BIRDIE",
  par: "PAR", bogey: "BOGEY", double: "DOUBLE BOGEY", triple: "+",
};

function bannerFor(data) {
  const par = Number(data.par) || null;
  const shots = Number(data.currentShot) || 0;
  if (data.showResultBanner === false || !par || shots <= 0) return "";
  const { kind } = classify(par, shots);
  return RESULT_LABEL[kind] ? `FOR ${RESULT_LABEL[kind]}` : "";
}

export function sizeFor(data) {
  return bannerFor(data) ? SIZE : { w: SIZE.w, h: BAR_H };
}

export default function HoleCard({ data, theme = "dark" }) {
  const c = cardColors(theme);
  const size = sizeFor(data);
  const { w } = size;
  const barH = BAR_H;
  const segW = 112;            // 홀 세그먼트 폭
  const tpW = 104;             // 토탈(우측) 블록 폭
  const row2Y = 130;           // 2행 시작

  const shots = Number(data.currentShot) || 0;
  const player = data.player || "PLAYER";
  const playerSize = player.length > 12 ? 32 : player.length > 9 ? 36 : 40;
  const club = (data.club || "").toUpperCase();
  const clubSize = club.length > 12 ? 24 : club.length > 8 ? 28 : 32;
  const banner = bannerFor(data);

  // SHOT 번호 렌더 (1..shots, 마지막 동그라미)
  const shotNums = [];
  for (let i = 1; i <= Math.min(shots || 0, 9); i++) shotNums.push(i);

  return (
    <svg viewBox={`0 0 ${w} ${size.h}`} width={w} height={size.h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {/* 메인 바 */}
      <rect x="0" y="0" width={w} height={barH} rx="16" fill={c.bg} opacity="0.94" />
      {/* 홀 세그먼트 (더 어둡게) */}
      <path d={`M18,0 H${segW} V${barH} H18 Q0,${barH} 0,${barH - 18} V18 Q0,0 18,0 Z`}
            fill={c.seg} />
      <line x1={segW} y1="18" x2={segW} y2={barH - 18} stroke={c.line} strokeWidth="2" />

      {/* 홀 번호 · PAR · 거리 */}
      <text x={segW / 2} y="84" textAnchor="middle" fill={c.text} fontFamily={HEAD}
            fontSize="72" fontWeight="700">{data.hole || "–"}</text>
      <text x={segW / 2} y="121" textAnchor="middle" fill={c.accent} fontFamily={HEAD}
            fontSize="26" fontWeight="700" letterSpacing="1">PAR {data.par || "–"}</text>
      <text x={segW / 2} y="160" textAnchor="middle" fill={c.sub} fontFamily={MONO}
            fontSize="26" fontWeight="700">{data.distance ? (/[a-zA-Z]/.test(String(data.distance)) ? String(data.distance).toUpperCase() : `${data.distance}${data.unit === "yd" ? "y" : "m"}`) : ""}</text>

      {/* 선수명 (센터 상단) */}
      <circle cx={segW + 32} cy="61" r="22" fill="none" stroke={c.accent} strokeWidth="2.2" />
      <text x={segW + 32} y="70" textAnchor="middle" fill={c.accent} fontFamily={HEAD}
            fontSize="21" fontWeight="700">dG</text>
      <text x={segW + 63} y="76" fill={c.text} fontFamily={HEAD} fontSize={playerSize} fontWeight="700"
            letterSpacing="0.5">{player}</text>

      {/* 토탈(to-par) 우측 블록 */}
      <path d={`M${w - tpW},0 H${w - 18} Q${w},0 ${w},18 V${row2Y - 20} Q${w},${row2Y - 2} ${w - 18},${row2Y - 2} H${w - tpW} Z`}
            fill={c.accent} />
      <text x={w - tpW / 2} y="91" textAnchor="middle" fill={c.ink} fontFamily={HEAD}
            fontSize="64" fontWeight="700">{data.toPar || "E"}</text>

      {/* 2행 구분선 */}
      <line x1={segW + 18} y1={row2Y} x2={w - 20} y2={row2Y} stroke={c.line} strokeWidth="1.5" />

      {/* SHOT */}
      <text x={segW + 20} y={row2Y + 26} fill={c.accent} fontFamily={HEAD} fontSize="21"
            fontWeight="700" fontStyle="italic" letterSpacing="1">SHOT</text>
      {shotNums.map((n, i) => {
        const cx = segW + 30 + i * 25;
        const last = i === shotNums.length - 1;
        return (
          <g key={n}>
            {last && <circle cx={cx} cy={row2Y + 56} r="14" fill="none" stroke={c.accent} strokeWidth="2" />}
            <text x={cx} y={row2Y + 65} textAnchor="middle"
                  fill={last ? c.accent : c.faint} fontFamily={MONO}
                  fontSize="23" fontWeight="700">{n}</text>
          </g>
        );
      })}

      {/* SELECTED CLUB */}
      <text x={w - 18} y={row2Y + 26} textAnchor="end" fill={c.accent} fontFamily={HEAD}
            fontSize="18" fontWeight="700" fontStyle="italic" letterSpacing="1">SELECTED CLUB</text>
      <text x={w - 18} y={row2Y + 66} textAnchor="end" fill={c.text} fontFamily={HEAD}
            fontSize={clubSize} fontWeight="700">{club}</text>

      {/* FOR X 배너 */}
      {banner && (
        <g>
          <rect x="224" y="228" width={w - 224} height="58" rx="10" fill={c.accent} />
          <text x={(224 + w) / 2} y="268" textAnchor="middle" fill={c.ink} fontFamily={HEAD}
                fontSize="35" fontWeight="700" letterSpacing="1">{banner}</text>
        </g>
      )}
    </svg>
  );
}
