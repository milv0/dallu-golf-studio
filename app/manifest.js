export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "Dallu Golf Studio",
    short_name: "Dallu Golf",
    description: "골프 스코어카드 오버레이 제작 도구",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#eef1f5",
    theme_color: "#eef1f5",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
