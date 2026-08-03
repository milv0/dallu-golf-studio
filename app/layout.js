import { Barlow_Condensed, Barlow, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "../components/studio/Providers";

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

export const metadata = {
  title: "Dallu Golf Studio",
  description: "골프 스코어카드를 투명 배경 PNG로 만들어 영상·릴스에 바로 올리세요.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-192.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Dallu Golf",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Dallu Golf Studio",
    url: "https://dallugolf.com",
    siteName: "Dallu Golf Studio",
    images: [{ url: "https://dallugolf.com/icon-512.png", width: 512, height: 512 }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dallu Golf Studio",
    images: ["https://dallugolf.com/icon-512.png"],
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning
      className={`${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        {/* 저장된 테마/언어를 페인트 전에 적용해 다크모드 흰 화면 깜빡임(FOUC)을 막는다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("sc-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);var l=localStorage.getItem("sc-lang");if(l==="en"||l==="ko")document.documentElement.lang=l;}catch(e){}})();`,
          }}
        />
        <Providers>{children}</Providers>
        <Script
          id="google-adsense"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4755795516057681"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
