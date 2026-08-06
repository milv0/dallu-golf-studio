export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // myRound 플래그로 닫힌 라우트는 "/"로 리다이렉트만 하므로 색인되면 홈의
        // 중복 문서가 된다. 플래그를 켤 때 /round 항목을 뺀다.
        disallow: ["/admin", "/admin/", "/login", "/records", "/rounds", "/round"],
      },
    ],
    sitemap: "https://dallugolf.com/sitemap.xml",
    host: "https://dallugolf.com",
  };
}
