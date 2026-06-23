import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 플라노 미니멀 톤 — 따뜻한 우드 / 화이트 / 잉크
        sand: {
          50: "#FAF7F2",
          100: "#F3EEE6",
          200: "#E8DFD2",
          300: "#D9CCB8",
        },
        wood: {
          400: "#C2A782",
          500: "#A98B63",
          600: "#8C6F4B",
        },
        ink: {
          700: "#3A352F",
          800: "#262220",
          900: "#171513",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Pretendard Variable",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: ["GowunBatang", "Nanum Myeongjo", "serif"],
      },
      letterSpacing: {
        widelogo: "0.35em",
      },
      maxWidth: {
        site: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
