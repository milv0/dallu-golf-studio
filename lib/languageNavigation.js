// 웹은 ko/en을 별도 URL로 내보내 SEO·hreflang을 유지해야 한다.
// Capacitor 앱은 정적 파일 URL 이동 대신 같은 WebView에서 언어 상태만 바꾼다.
export function shouldNavigateForLanguage({ nativeApp = false, target, pathname } = {}) {
  return !nativeApp && Boolean(target) && target !== pathname;
}
