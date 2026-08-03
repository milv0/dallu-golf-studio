// 프리셋: 홀 카드 (현재 홀 라이브 오버레이) — 방송 로어서드 스타일, 우리 테마(다크+라임)
// 표시: 홀번호 · PAR · 거리 / 선수명 / 토탈(to-par) / SHOT(현재 타수 표시) / SELECTED CLUB / FOR X 배너
import { memo } from "react";
import { cardColors } from "../../lib/theme";
import { normalizeToParDisplay } from "../../lib/score";
import { displayPlayerName, fitFontSize } from "./svgText";
import { HEAD, MONO } from "./scorecardPrimitives";

export const SIZE = { w: 480, h: 292 };

const BAR_H = 212;

const RESULT_LABEL = {
  albatross: "ALBATROSS", eagle: "EAGLE", birdie: "BIRDIE",
  par: "PAR", bogey: "BOGEY", double: "DOUBLE BOGEY", triple: "+",
};

function bannerFor(data) {
  const par = Number(data.par) || null;
  const shots = Number(data.currentShot) || 0;
  if (data.showResultBanner === false || !par || shots <= 0) return null;
  // currentShot = 지금 치려는 타수. 이 샷이 들어가면 shots가 최종 스코어.
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

function bannerColor(banner, c) {
  if (!banner) return c.accent;
  if (banner.type === "bad") return "#4a6cf7";
  if (banner.type === "worse") return "#8b5cf6";
  return c.accent;
}

export function sizeFor(data) {
  return bannerFor(data) !== null ? SIZE : { w: SIZE.w, h: BAR_H };
}

function HoleCard({ data, theme = "dark" }) {
  const c = cardColors(theme);
  const size = sizeFor(data);
  const { w } = size;
  const barH = BAR_H;
  const segW = 112;            // 홀 세그먼트 폭
  const tpW = 104;             // 토탈(우측) 블록 폭
  const row2Y = 130;           // 2행 시작

  const shots = Number(data.currentShot) || 0;
  const player = displayPlayerName(data.player);
  const playerSize = fitFontSize(player, { base: 40, min: 24, maxWidth: w - tpW - segW - 96 });
  const club = (data.club || "").toUpperCase();
  const clubSize = club.length > 12 ? 24 : club.length > 8 ? 28 : 32;
  const banner = bannerFor(data);
  const toPar = normalizeToParDisplay(data.toPar, "–");

  const par = Number(data.par) || 4;
  const totalShots = Math.max(par, shots);
  const shotNums = Array.from({ length: totalShots }, (_, i) => i + 1);

  return (
    <svg viewBox={`0 0 ${w} ${size.h}`} width={w} height={size.h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "transparent" }}>
      {/* 메인 바 */}
      <rect x="0" y="0" width={w} height={barH} fill={c.bg} opacity="0.94" />
      {/* 홀 세그먼트 (더 어둡게) */}
      <rect x="0" y="0" width={segW} height={barH} fill={c.seg} />
      <line x1={segW} y1="18" x2={segW} y2={barH - 18} stroke={c.line} strokeWidth="2" />

      {/* 홀 번호 · PAR · 거리 */}
      <text x={segW / 2} y="84" textAnchor="middle" fill={c.text} fontFamily={HEAD}
            fontSize="72" fontWeight="700" className="score-meta-lock">{data.hole || "–"}</text>
      <text x={segW / 2} y="121" textAnchor="middle" fill={c.accent} fontFamily={HEAD}
            fontSize="26" fontWeight="700" letterSpacing="1" className="score-meta-lock">PAR {data.par || "–"}</text>
      <text x={segW / 2} y="160" textAnchor="middle" fill={c.sub} fontFamily={MONO}
            fontSize="26" fontWeight="700">{data.distance ? (/[a-zA-Z]/.test(String(data.distance)) ? String(data.distance).toUpperCase() : `${data.distance}${data.unit === "yd" ? "y" : "m"}`) : `- ${data.unit === "yd" ? "yd" : "m"}`}</text>

      {/* 선수명 (센터 상단) */}
      <circle cx={segW + 32} cy="61" r="22" fill="none" stroke={c.accent} strokeWidth="2.2" />
      <text x={segW + 32} y="70" textAnchor="middle" fill={c.accent} fontFamily={HEAD}
            fontSize="21" fontWeight="700">dG</text>
      <text x={segW + 63} y="61" dominantBaseline="middle" fill={c.text} fontFamily={HEAD}
            fontSize={playerSize} fontWeight="700" letterSpacing="0.5">{player}</text>

      {/* 토탈(to-par) 우측 블록 */}
      <rect x={w - tpW} y="0" width={tpW} height={row2Y - 2} fill={c.accent} />
      <text x={w - tpW / 2} y="91" textAnchor="middle" fill={c.ink} fontFamily={HEAD}
            fontSize="64" fontWeight="700">{toPar}</text>

      {/* 2행 구분선 */}
      <line x1={segW + 18} y1={row2Y} x2={w - 20} y2={row2Y} stroke={c.line} strokeWidth="1.5" />

      {/* SHOT */}
      <text x={segW + 20} y={row2Y + 26} fill={c.accent} fontFamily={HEAD} fontSize="21"
            fontWeight="700" fontStyle="italic" letterSpacing="1">SHOT</text>
      {shotNums.map((n, i) => {
        const cx = segW + 30 + i * 25;
        const active = n === shots;
        return (
          <g key={n}>
            {active && <circle cx={cx} cy={row2Y + 56} r="14" fill="none" stroke={c.accent} strokeWidth="2" />}
            <text x={cx} y={row2Y + 65} textAnchor="middle"
                  fill={active ? c.accent : c.faint} fontFamily={MONO}
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
          <rect x="184" y="228" width={w - 184} height="58" fill={bannerColor(banner, c)} />
          <text x={(184 + w) / 2} y="268" textAnchor="middle" fill={banner.type === "good" ? c.ink : "#ffffff"} fontFamily={HEAD}
                fontSize="35" fontWeight="700" letterSpacing="1">{banner.text}</text>
        </g>
      )}
      <text x={segW / 2} y={barH - 14} textAnchor="middle" fill={c.faint} opacity="0.5"
        fontFamily={HEAD} fontSize="10" fontWeight="600" letterSpacing="1">
        DALLU GOLF
      </text>
    </svg>
  );
}

export default memo(HoleCard);
