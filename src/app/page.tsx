import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";

// 메인 — 풀스크린 미니멀 스플래시 (대형 워드마크 + 필 버튼)
export default function HomePage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 배경: public/hero.jpg 가 있으면 그것을, 없으면 시드 SVG로 폴백 */}
      <div
        className="absolute inset-0 animate-hero-zoom bg-sand-200 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg'), url('/seed/hero.svg')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink-900/25 via-ink-900/15 to-ink-900/45"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <BlurFade delay={0.2}>
          <h1 className="whitespace-nowrap pl-[0.22em] font-wordmark text-[2.05rem] font-normal leading-none tracking-[0.2em] text-white drop-shadow-md sm:text-4xl sm:tracking-[0.22em] md:text-6xl">
            PLANO DESIGN
          </h1>
        </BlurFade>

        <BlurFade delay={0.45} className="mt-7">
          <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:flex-wrap sm:gap-4">
            <Link
              href="/portfolio"
              className="flex-1 rounded-full border border-white/55 px-3 py-3 text-center font-display text-[0.6rem] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:text-ink-900 sm:w-44 sm:flex-none sm:px-8 sm:text-[0.7rem] sm:tracking-[0.22em]"
            >
              Portfolio
            </Link>
            <Link
              href="/consultant"
              className="flex-1 rounded-full border border-white/55 px-3 py-3 text-center font-display text-[0.6rem] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:text-ink-900 sm:w-44 sm:flex-none sm:px-8 sm:text-[0.7rem] sm:tracking-[0.22em]"
            >
              Consultant
            </Link>
          </div>
        </BlurFade>
      </div>

      {/* 브랜드 푸터 힌트 */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 animate-fade-in text-[0.65rem] uppercase tracking-[0.35em] text-white/55">
        Plano Design
      </div>
    </section>
  );
}
