/** @type {import('next').NextConfig} */
const nextConfig = {
  // 포트폴리오 이미지는 scripts/notion-sync.mjs 가 이미 webp 로 최적화해 public/ 에 넣는다.
  // → Vercel 이미지 최적화기(/_next/image)를 쓸 이유가 없고, Hobby 플랜에선 최적화 한도를
  //   넘으면 402 로 이미지가 깨진다. unoptimized 로 최적화기를 아예 건너뛰고 public 파일을
  //   CDN 에서 그대로 서빙한다(한도·비용 0).
  // (remotePatterns/dangerouslyAllowSVG 는 열지 않는다 — 최적화기를 외부 URL 프록시로
  //  악용당할 수 있어서다. GHSA-9g9p-9gw9-jx7f. unoptimized 는 그 위험과 무관하다.)
  images: { unoptimized: true },
};

export default nextConfig;
