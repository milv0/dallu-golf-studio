// ko/en 두 개의 루트 레이아웃이 <html lang>만 다르고 나머지는 같다.
// <html lang>은 루트 레이아웃에서만 정할 수 있어서 라우트 그룹으로 레이아웃을 둘로 나눴고,
// 중복을 막기 위해 공통 부분을 여기로 모았다.
import { Barlow_Condensed, Barlow, JetBrains_Mono } from "next/font/google";
import Providers from "./studio/Providers";
import AdSenseLoader from "./AdSenseLoader";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const FONT_VARS = `${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable}`;

// 저장된 테마를 페인트 전에 적용해 다크모드 흰 화면 깜빡임(FOUC)을 막는다.
// 언어는 URL이 결정하므로 여기서 건드리지 않는다 — 저장값이 <html lang>을 덮어쓰면
// /en 페이지가 한국어로 표시된다.
const THEME_BOOTSTRAP =
  '(function(){try{var t=localStorage.getItem("sc-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();';

export default function RootShell({ lang, children }) {
  return (
    <html lang={lang} data-theme="light" suppressHydrationWarning className={FONT_VARS}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <Providers lang={lang}>{children}</Providers>
        {/* 웹 전용 — Capacitor 앱에서는 AdSenseLoader가 로드를 건너뛴다 */}
        <AdSenseLoader />
      </body>
    </html>
  );
}
