// 카드(프리셋) 색상 테마 — 다크 / 라이트
export function cardColors(theme = "dark") {
  return theme === "light"
    ? {
        bg: "#ffffff", panel: "#eef1f4", seg: "#e6eaee",
        text: "#0b0e12", sub: "#3a4652", faint: "#97a0ab",
        line: "#d7dce2", accent: "#12a150", ink: "#ffffff",
      }
    : {
        bg: "#0b0e12", panel: "#12181f", seg: "#0a0d11",
        text: "#ffffff", sub: "#c7d0db", faint: "#5f6b7a",
        line: "#262e3a", accent: "#38e08b", ink: "#06210f",
      };
}
