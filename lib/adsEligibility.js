// AdSense는 웹 전용이다. 네이티브 앱 WebView에 AdSense 코드를 넣는 것은
// Google 정책 위반이라(앱 광고는 AdMob) Capacitor 셸에서는 로드하지 않는다.
// JSX 없는 순수 모듈 — tests/adsEligibility.test.mjs가 직접 import한다.
export function shouldLoadAds({ nativeApp = false } = {}) {
  return !nativeApp;
}
