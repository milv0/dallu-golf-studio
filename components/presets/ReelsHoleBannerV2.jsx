// 프리셋: 릴스 v2 — 방송 로어서드 배너 (a.jpeg 레이아웃 + 우리 다크/라임 테마)
export const SIZE = { w: 1080, h: 300 };

const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const BG = "#0b0e12";        // 다크 바탕 (기존 스코어카드와 동일)
const PANEL = "#12181f";
const SEG = "#0a0d11";
const ACCENT = "#38e08b";    // 라임
const INK = "#06210f";
const TEXT = "#eef2f6";
const SUB = "#9aa6b4";

function ordinal(n) {
  const v = Number(n);
  if (!v) return String(n || "").toUpperCase();
  const s = ["TH", "ST", "ND", "RD"], m = v % 100;
  return v + (s[(m - 20) % 10] || s[m] || s[0]);
}

export default function ReelsHoleBannerV2({ data }) {
  const { w } = SIZE;
  const barH = 196;
  const par = Number(data.par) || 0;
  const shots = Number(data.currentShot) || 0;
  const count = Math.min(Math.max(par || 4, shots, 3), 7);
  const dist = String(data.distance || "").trim();
  const unitLabel = data.unit === "yd" ? "YARDS" : "M";
  const distText = dist ? (/[a-zA-Z]/.test(dist) ? dist.toUpperCase() : `${dist} ${unitLabel}`) : "";

  const redW = 210, redH = 150, redX = w - 36 - redW, redY = (barH - redH) / 2;
  const infoW = 690, whiteY = barH + 12, whiteH = 88;
  const shotX = infoW + 16;

  const infoParts = [ordinal(data.hole), par ? `PAR ${par}` : "", distText].filter(Boolean);

  return (
    <svg viewBox={`0 0 ${w} ${SIZE.h}`} width={w} height={SIZE.h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {/* 상단 바 (다크) + 라임 좌측 액센트 */}
      <rect x="0" y="0" width={w} height={barH} rx="16" fill={BG} opacity="0.94" />
      <rect x="0" y="0" width="6" height={barH} rx="3" fill={ACCENT} />

      {/* 좌측 엠블럼 */}
      <circle cx="100" cy={barH / 2} r="60" fill="none" stroke={ACCENT} strokeWidth="3" />
      <circle cx="100" cy={barH / 2} r="48" fill="none" stroke="#20303f" strokeWidth="1.5" />
      <text x="100" y={barH / 2 + 15} textAnchor="middle" fill={ACCENT} fontFamily={HEAD}
            fontSize="40" fontWeight="700" letterSpacing="1">dG</text>

      {/* 선수명 */}
      <text x="196" y={barH / 2 + 30} fill={TEXT} fontFamily={HEAD} fontSize="92"
            fontWeight="700" letterSpacing="1">{(data.player || "PLAYER").toUpperCase()}</text>

      {/* 우측 to-par 박스 (라임) */}
      <rect x={redX} y={redY} width={redW} height={redH} rx="8" fill={ACCENT} />
      <text x={redX + redW / 2} y={barH / 2 + 34} textAnchor="middle" fill={INK}
            fontFamily={HEAD} fontSize="100" fontWeight="700">{data.toPar || "E"}</text>

      {/* 하단 정보바 (다크 패널) */}
      <rect x="0" y={whiteY} width={infoW} height={whiteH} rx="10" fill={PANEL} />
      <text x="30" y={whiteY + whiteH / 2 + 15} fontFamily={HEAD} fontSize="46" fontWeight="700" letterSpacing="0.5">
        <tspan fill={ACCENT}>{infoParts[0]}</tspan>
        {infoParts.slice(1).map((p, i) => (
          <tspan key={i} fill={TEXT}>{"   ·   " + p}</tspan>
        ))}
      </text>

      {/* 샷 진행 세그먼트 */}
      <rect x={shotX} y={whiteY} width={w - shotX} height={whiteH} rx="10" fill={SEG} />
      {Array.from({ length: count }, (_, i) => i + 1).map((n, i) => {
        const cur = n === shots;
        return (
          <text key={n} x={shotX + 42 + i * 52} y={whiteY + whiteH / 2 + 16} textAnchor="middle"
                fill={cur ? ACCENT : SUB} fontFamily={MONO}
                fontSize={cur ? "50" : "38"} fontWeight="700">{n}</text>
        );
      })}
    </svg>
  );
}
