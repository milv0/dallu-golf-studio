/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",              // 정적 사이트로 빌드 (out/ 생성) — Cloudflare Pages 배포용
  images: { unoptimized: true }, // 정적 export 시 next/image 최적화 비활성 (안전)
};

module.exports = nextConfig;
