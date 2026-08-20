// 페이지별 검색 메타데이터. 순수 데이터 모듈이라 tests/seo.test.mjs가 직접 import해서
// 미러 라우트마다 ko/en이 다 있는지, 영문에 한글이 남았는지 검사한다.
//
// 모든 페이지가 같은 title을 쓰면 검색엔진이 중복 문서로 취급하고, 검색어와 맞물릴
// 단어가 title에 하나도 없다. 그래서 라우트마다 다른 title·description을 준다.

import { alternateUrls, basePath, MIRRORED_ROUTES } from "./langRoutes.js";

export const SITE_URL = "https://dallugolf.com";
export const SITE_NAME = "Dallu Golf Studio";

export const PAGE_SEO = {
  "/": {
    ko: {
      title: "골프 스코어카드 오버레이 만들기",
      description:
        "골프 스코어카드를 투명 배경 PNG로 만들어 유튜브·릴스 영상에 바로 올리세요. 18홀·9홀·3홀·1홀 카드를 무료로 만들 수 있습니다.",
    },
    en: {
      title: "Golf Scorecard Overlay Maker",
      description:
        "Create golf scorecards as transparent PNG overlays for YouTube videos and Instagram Reels. Free 18, 9, 3 and 1-hole cards.",
    },
  },
  "/guide": {
    ko: {
      title: "사용 방법 · 자주 묻는 질문",
      description:
        "달루 골프 스튜디오 사용 방법과 자주 묻는 질문. 스코어 입력, 투명 PNG 저장, 홀별 저장, 카드 종류를 안내합니다.",
    },
    en: {
      title: "Guide & FAQ",
      description:
        "How to use Dallu Golf Studio, plus answers on score entry, saving transparent PNGs, batch export and card types.",
    },
  },
  "/custom/Hole18": {
    ko: {
      title: "18홀 골프 스코어카드 만들기",
      description:
        "18홀 전체 스코어를 넣어 좌우로 긴 스코어카드 오버레이를 투명 배경 PNG로 내보냅니다. 가로 영상 편집용.",
    },
    en: {
      title: "18-Hole Golf Scorecard Maker",
      description:
        "Enter a full 18-hole round and export a wide scorecard overlay as a transparent PNG for landscape video editing.",
    },
  },
  "/custom/Hole9": {
    ko: {
      title: "9홀 골프 스코어카드 만들기",
      description:
        "9홀 스코어카드를 투명 배경 PNG로 만듭니다. 릴스·틱톡 같은 짧은 영상 오버레이에 맞는 크기입니다.",
    },
    en: {
      title: "9-Hole Golf Scorecard Maker",
      description:
        "Create a 9-hole scorecard as a transparent PNG overlay, sized for Reels and TikTok short videos.",
    },
  },
  "/custom/Hole3": {
    ko: {
      title: "3홀 골프 스코어카드 만들기",
      description:
        "세 홀만 담은 작은 스코어카드 띠를 투명 배경 PNG로 만듭니다. 짧은 영상 클립에 올리기 좋은 크기입니다.",
    },
    en: {
      title: "3-Hole Golf Scorecard Maker",
      description:
        "Make a compact three-hole scorecard band as a transparent PNG overlay for short clips.",
    },
  },
  "/custom/Hole1": {
    ko: {
      title: "1홀 골프 스코어카드 · 방송용 오버레이",
      description:
        "현재 홀의 PAR·거리·타수를 방송 스타일 로어서드로 만듭니다. 투명 배경 PNG로 저장됩니다.",
    },
    en: {
      title: "1-Hole Golf Scorecard · Broadcast Overlay",
      description:
        "Build a broadcast-style lower third with the current hole's PAR, distance and shot count as a transparent PNG.",
    },
  },
};

const OG_LOCALE = { ko: "ko_KR", en: "en_US" };

export function seoFor(path, lang) {
  const entry = PAGE_SEO[basePath(path)];
  if (!entry) return null;
  return entry[lang] || entry.ko;
}

// Next.js의 페이지 metadata 객체를 만든다. canonical과 hreflang을 함께 넣어
// ko/en이 중복 문서가 아니라 같은 문서의 언어 변형으로 인식되게 한다.
export function pageMetadata(path, lang) {
  const copy = seoFor(path, lang);
  if (!copy) return {};
  const base = basePath(path);
  const languages = alternateUrls(SITE_URL, base);
  const canonical = lang === "en" ? languages.en : languages.ko;

  return {
    // absolute로 고정한다. Next의 title.template은 레이아웃과 같은 세그먼트에 있는
    // 페이지(여기서는 각 트리의 홈)에는 적용되지 않아서, 그냥 두면 홈만 브랜드가 빠진다.
    title: { absolute: `${copy.title} · ${SITE_NAME}` },
    description: copy.description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${copy.title} · ${SITE_NAME}`,
      description: copy.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang] || OG_LOCALE.ko,
      type: "website",
      images: [{ url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 }],
    },
    twitter: {
      card: "summary",
      title: `${copy.title} · ${SITE_NAME}`,
      description: copy.description,
      images: [`${SITE_URL}/icon-512.png`],
    },
  };
}

// 루트 레이아웃 viewport. viewport-fit=cover가 없으면 Capacitor 앱과 PWA 전체화면에서
// env(safe-area-inset-*)가 0이 되어 상단바가 Dynamic Island(상태바) 뒤에 깔린다.
export function rootViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

// 루트 레이아웃 metadata. 페이지가 title만 주면 template이 브랜드를 뒤에 붙인다.
export function rootMetadata(lang) {
  const copy = seoFor("/", lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${copy.title} · ${SITE_NAME}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: copy.description,
    applicationName: SITE_NAME,
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-192.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "Dallu Golf", statusBarStyle: "default" },
    formatDetection: { telephone: false },
  };
}

// 홈에 넣는 구조화 데이터. 무엇을 하는 도구인지 검색엔진에 명시적으로 알린다.
export function webAppJsonLd(lang) {
  const copy = seoFor("/", lang);
  const languages = alternateUrls(SITE_URL, "/");
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: lang === "en" ? languages.en : languages.ko,
    description: copy.description,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    inLanguage: lang,
    // 무료 도구임을 명시하면 검색결과에 가격 정보가 붙는다.
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  };
}

// 가이드 페이지의 Q&A를 FAQPage로 노출한다. 검색결과에 아코디언이 붙어 클릭률이 올라간다.
export function faqJsonLd(guide) {
  const items = guide.sections.flatMap((section) => section.items);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

// 사이트맵과 메타데이터가 같은 라우트 목록을 보도록 langRoutes에서만 가져온다.
export { MIRRORED_ROUTES };
