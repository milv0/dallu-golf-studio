// 설치된 PWA에서는 같은 설치 안내를 다시 보여줄 이유가 없다.
// display-mode는 표준 경로, navigator.standalone은 구형 iOS Safari 호환 경로다.
export function isStandaloneApp({ displayModeStandalone = false, navigatorStandalone = false } = {}) {
  return Boolean(displayModeStandalone || navigatorStandalone);
}
