"use client";

// Capacitor 앱에서만 <html data-native>를 달아 CSS가 네이티브 전용 규칙을
// 스코프할 수 있게 한다 (텍스트 선택·롱프레스 콜아웃 억제 등). 웹에는 영향이 없다.
import { useEffect } from "react";
import { isNativeApp } from "../lib/nativePlatform.js";

export default function NativeAppMarker() {
  useEffect(() => {
    if (isNativeApp()) {
      document.documentElement.dataset.native = "true";
    }
  }, []);

  return null;
}
