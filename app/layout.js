import "./globals.css";

export const metadata = {
  title: "Studio Dallu — 골프 스코어카드 오버레이 메이커",
  description:
    "골프 영상 편집용 스코어카드 오버레이(투명 PNG)를 유튜브·릴스 포맷과 메이저 대회 방송 스타일로 제작. @dallu_golf",
};

export default function RootLayout({ children }) {
  const noFlash = `(function(){try{var t=localStorage.getItem('sc-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
  return (
    <html lang="ko" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
