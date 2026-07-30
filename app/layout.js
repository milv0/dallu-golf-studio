import { Barlow_Condensed, Barlow, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "Dallu Golf Studio — 골프 스코어카드 오버레이 메이커",
  description:
    "골프 영상 편집용 스코어카드 오버레이(투명 PNG)를 유튜브·릴스 포맷과 메이저 대회 방송 스타일로 제작. @dallu_golf",
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
    title: "Dallu Golf Studio — 골프 스코어카드 오버레이 메이커",
    description: "골프 영상 편집용 스코어카드 오버레이(투명 PNG)를 유튜브·릴스 포맷과 메이저 대회 방송 스타일로 제작.",
    url: "https://dallugolf.com",
    siteName: "Dallu Golf Studio",
    images: [{ url: "https://dallugolf.com/icon-512.png", width: 512, height: 512 }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dallu Golf Studio",
    description: "골프 스코어카드 오버레이 메이커",
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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4755795516057681" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
