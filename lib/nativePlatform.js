// Capacitor 네이티브 셸(App Store 앱)에서 실행 중인지 판별한다.
// @capacitor/core는 웹 번들에서도 동작하며 네이티브 브리지가 없으면 false를 돌려주므로
// 웹과 앱이 같은 정적 빌드를 공유해도 안전하다.
import { Capacitor } from "@capacitor/core";

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}
