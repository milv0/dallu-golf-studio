import { FEATURE_FLAGS } from "../lib/features.js";

export const dynamic = "force-static";

export default function sitemap() {
  const base = "https://dallugolf.com";
  const publicRoutes = [
    "",
    "/custom/Hole18",
    "/custom/Hole9",
    "/custom/Hole3",
    "/custom/Hole1",
    "/guide",
  ];
  const roundRoutes = ["/round", "/round/Hole9", "/round/Hole3", "/round/Hole1"];
  const routes = FEATURE_FLAGS.myRound ? [...publicRoutes, ...roundRoutes] : publicRoutes;
  // 정적 export이므로 빌드 시점이 곧 실제 최종 수정 시각이다.
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
