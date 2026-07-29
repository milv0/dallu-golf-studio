import "./globals.css";

export const metadata = {
  title: "Dallu Golf Studio — 골프 스코어카드 오버레이 메이커",
  description:
    "골프 영상 편집용 스코어카드 오버레이(투명 PNG)를 유튜브·릴스 포맷과 메이저 대회 방송 스타일로 제작. @dallu_golf",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Dallu Golf",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
