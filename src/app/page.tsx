import Link from "next/link";
import Logo from "@/components/Logo";

// 메인 — 풀스크린 미니멀 스플래시
export default function HomePage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 배경: public/hero.jpg 가 있으면 그것을, 없으면 시드 SVG로 폴백 */}
      <div
        className="absolute inset-0 animate-zoom-slow bg-sand-200 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg'), url('/seed/hero.svg')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink-900/35 via-ink-900/20 to-ink-900/40"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center text-white">
        <div className="animate-fade-up">
          <Logo className="scale-[1.35] sm:scale-[1.7]" />
        </div>

        <p
          className="mt-12 max-w-md animate-fade-up text-sm font-light leading-relaxed tracking-wide text-white/85"
          style={{ animationDelay: "0.15s" }}
        >
          공간을 읽고, 삶의 결을 설계합니다.
          <br />
          주거 공간의 설계부터 시공까지, 플라노디자인.
        </p>

        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-3 animate-fade-up sm:gap-4"
          style={{ animationDelay: "0.3s" }}
        >
          <Link href="/portfolio" className="btn btn-light min-w-[190px]">
            Portfolio
            <Arrow />
          </Link>
          <Link href="/consultant" className="btn btn-light min-w-[190px]">
            Consultant
            <Arrow />
          </Link>
        </div>
      </div>

      {/* 스크롤/브랜드 푸터 힌트 */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 animate-fade-in text-[0.65rem] uppercase tracking-[0.35em] text-white/55">
        Plano Design
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
