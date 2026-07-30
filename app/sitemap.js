export const dynamic = "force-static";

export default function sitemap() {
  const base = "https://dallugolf.com";
  const routes = [
    "",
    "/custom/Hole18",
    "/custom/Hole9",
    "/custom/Hole3",
    "/custom/hole",
    "/round",
    "/round/Hole9",
    "/round/Hole3",
    "/round/hole",
    "/guide",
  ];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-07-30"),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
