import { FEATURE_FLAGS } from "../lib/features.js";

export const dynamic = "force-static";

export default function sitemap() {
  const base = "https://dallugolf.com";
  const publicRoutes = [
    "",
    "/custom/Hole18",
    "/custom/Hole9",
    "/custom/Hole3",
    "/custom/hole",
    "/guide",
  ];
  const roundRoutes = ["/round", "/round/Hole9", "/round/Hole3", "/round/hole"];
  const routes = FEATURE_FLAGS.myRound ? [...publicRoutes, ...roundRoutes] : publicRoutes;
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-07-30"),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
