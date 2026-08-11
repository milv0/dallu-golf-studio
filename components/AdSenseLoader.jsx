"use client";

// AdSense 스크립트는 웹에서만 로드한다 — 판단 규칙은 lib/adsEligibility.js가 소유한다.
// 정적 HTML은 웹/앱이 동일하므로 hydration 후 환경을 보고 로드 여부를 정한다.
// afterInteractive 스크립트는 어차피 클라이언트에서 주입되므로 첫 페인트에는 영향이 없다.
import Script from "next/script";
import { useEffect, useState } from "react";
import { shouldLoadAds } from "../lib/adsEligibility.js";
import { isNativeApp } from "../lib/nativePlatform.js";

export default function AdSenseLoader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(shouldLoadAds({ nativeApp: isNativeApp() }));
  }, []);

  if (!enabled) return null;
  return (
    <Script
      id="google-adsense"
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4755795516057681"
      crossOrigin="anonymous"
    />
  );
}
