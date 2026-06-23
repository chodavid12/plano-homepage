/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (동기화된 포트폴리오 이미지)
      { protocol: "https", hostname: "*.supabase.co" },
      // Notion 파일(동기화 전 임시 표시용; 운영에선 Supabase URL 사용)
      { protocol: "https", hostname: "*.notion.so" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
    // 시드 플레이스홀더가 SVG라 허용 (운영 이미지는 webp/jpg)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
