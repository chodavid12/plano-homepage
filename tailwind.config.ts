import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 플라노 — 따뜻한 페이퍼 / 우드 / 잉크 (미니멀 웜·우드)
        sand: {
          50: "#FAF8F3", // 페이지 배경 (warm paper)
          100: "#F3EDE3", // 서피스
          200: "#E8DECF", // 보더 / 옅은 면
          300: "#D6C8B2", // 진한 보더
        },
        wood: {
          400: "#C3A87F",
          500: "#9C7C52", // 액센트
          600: "#7E6340", // 액센트(진함)
        },
        ink: {
          700: "#6E655A", // 뮤트 텍스트
          800: "#2C2823", // 본문 텍스트
          900: "#1A1714", // 헤드라인 / 최진함
        },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        // 디스플레이(헤딩) — 라틴=Jost(지오메트릭), 한글=SUIT(모던 고딕). 히어로 워드마크는 font-wordmark로 별도.
        display: ["Jost", "SUIT Variable", "Pretendard Variable", "Pretendard", "sans-serif"],
        // 워드마크 전용 — 학교안심 자연 R
        wordmark: ["HakgyoansimJayeonR", "Jost", "Pretendard Variable", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.45em",
      },
      maxWidth: {
        site: "1320px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        zoomSlow: {
          "0%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fadeIn 1s ease both",
        "zoom-slow": "zoomSlow 1.4s cubic-bezier(0.22,1,0.36,1) both",
        "spin-slow": "spin 26s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
