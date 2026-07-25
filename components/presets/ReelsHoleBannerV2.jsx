// 프리셋: 릴스 v2 — 방송 로어서드 배너 (a.jpeg 스타일: 네이비 바 + 빨강 to-par + 흰 정보바)
import { classify } from "../../lib/score";

export const SIZE = { w: 1080, h: 300 };

const HEAD = "'Barlow Condensed', 'Pretendard', sans-serif";
const NAVY = "#1e3a5f";
const RED = "#c8102e";
const WHITE = "#f2f2ef";

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
  const distText = dist ? (/[a-zA-Z]/.test(dist) ? dist.toUpperCase() : `${dist} YARDS`) : "";

  const redW = 210, redH = 150, redX = w - 36 - redW, redY = (barH - redH) / 2;

  const infoW = 690, whiteY = barH + 12, whiteH = 88;
  const shotX = infoW + 16;

  const infoParts = [ordinal(data.hole), par ? `PAR ${par}` : "", distText].filter(Boolean);

  return (
    <svg viewBox={`0 0 ${w} ${SIZE.h}`} width={w} height={SIZE.h}
         xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {/* 상단 네이비 바 */}
      <rect x="0" y="0" width={w} height={barH} rx="14" fill={NAVY} />

      {/* 좌측 엠블럼 */}
      <circle cx="96" cy={barH / 2} r="60" fill="none" stroke="#a9bcd4" strokeWidth="3" />
      <circle cx="96" cy={barH / 2} r="48" fill="none" stroke="#a9bcd4" strokeWidth="1.5" />
      <text x="96" y={barH / 2 + 16} textAnchor="middle" fill="#ffffff" fontFamily={HEAD}
            fontSize="40" fontWeight="700" letterSpacing="1">dG</text>

      {/* 선수명 */}
      <text x="196" y={barH / 2 + 30} fill="#ffffff" fontFamily={HEAD} fontSize="92"
            fontWeight="700" letterSpacing="1">{(data.player || "PLAYER").toUpperCase()}</text>

      {/* 우측 빨강 to-par 박스 */}
      <rect x={redX} y={redY} width={redW} height={redH} rx="6" fill={RED} />
      <text x={redX + redW / 2} y={barH / 2 + 34} textAnchor="middle" fill="#ffffff"
            fontFamily={HEAD} fontSize="100" fontWeight="700">{data.toPar || "E"}</text>

      {/* 하단 흰색 정보바 */}
      <rect x="0" y={whiteY} width={infoW} height={whiteH} rx="8" fill={WHITE} />
      <text x="34" y={whiteY + whiteH / 2 + 15} fill={NAVY} fontFamily={HEAD} fontSize="46"
            fontWeight="700" letterSpacing="0.5">{infoParts.join("   ·   ")}</text>

      {/* 샷 진행 세그먼트 */}
      <rect x={shotX} y={whiteY} width={w - shotX} height={whiteH} rx="8" fill="#dcdcd8" />
      {Array.from({ length: count }, (_, i) => i + 1).map((n, i) => {
        const cur = n === shots;
        return (
          <text key={n} x={shotX + 40 + i * 52} y={whiteY + whiteH / 2 + 16} textAnchor="middle"
                fill={cur ? NAVY : "#9aa0a6"} fontFamily={HEAD}
                fontSize={cur ? "52" : "40"} fontWeight="700">{n}</text>
        );
      })}
    </svg>
  );
}
