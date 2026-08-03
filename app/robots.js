export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/login", "/records", "/rounds"],
      },
    ],
    sitemap: "https://dallugolf.com/sitemap.xml",
    host: "https://dallugolf.com",
  };
}
