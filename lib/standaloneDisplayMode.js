// 설치된 PWA에서는 같은 설치 안내를 다시 보여줄 이유가 없다.
// display-mode는 표준 경로, navigator.standalone은 구형 iOS Safari 호환 경로,
// capacitorNative는 App Store용 Capacitor 셸 경로다 — 셋 다 "이미 앱"이므로 CTA를 숨긴다.
export function isStandaloneApp({
  displayModeStandalone = false,
  navigatorStandalone = false,
  capacitorNative = false,
} = {}) {
  return Boolean(displayModeStandalone || navigatorStandalone || capacitorNative);
}
