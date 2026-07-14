/** @type {import('next').NextConfig} */
const nextConfig = {
  // 포트폴리오 이미지는 scripts/notion-sync.mjs 가 webp 로 변환해 public/ 에 넣는다.
  // 원격 이미지는 쓰지 않으므로 remotePatterns 를 두지 않는다 — 열어두면 이미지 최적화기가
  // 외부 URL 프록시로 악용될 수 있다(GHSA-9g9p-9gw9-jx7f).
};

export default nextConfig;
