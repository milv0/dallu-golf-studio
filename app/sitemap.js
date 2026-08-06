import { FEATURE_FLAGS } from "../lib/features.js";
import { alternateUrls, MIRRORED_ROUTES, withLang } from "../lib/langRoutes.js";
import { SITE_URL } from "../lib/seo.js";

export const dynamic = "force-static";

export default function sitemap() {
  // 라우트 목록은 langRoutes 하나에서만 온다 — 사이트맵과 메타데이터가 서로 어긋나면
  // 색인되지 않는 URL이나 존재하지 않는 URL이 사이트맵에 실린다.
  const koRoutes = MIRRORED_ROUTES;
  const enRoutes = MIRRORED_ROUTES.map((route) => withLang(route, "en"));
  const roundRoutes = ["/round", "/round/Hole9", "/round/Hole3", "/round/Hole1"];
  const routes = [...koRoutes, ...enRoutes, ...(FEATURE_FLAGS.myRound ? roundRoutes : [])];
  // 정적 export이므로 빌드 시점이 곧 실제 최종 수정 시각이다.
  const lastModified = new Date();

  return routes.map((route) => {
    const languages = alternateUrls(SITE_URL, route);
    const path = route === "/" ? "" : route;
    return {
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly",
      priority: path === "" || path === "/en" ? 1 : 0.8,
      // 사이트맵에도 hreflang을 넣어 ko/en이 같은 문서의 언어 변형임을 한 번 더 알린다.
      ...(languages ? { alternates: { languages } } : {}),
    };
  });
}
