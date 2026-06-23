import Link from "next/link";
import Logo from "@/components/Logo";

// 메인 — 풀스크린 미니멀 스플래시
export default function HomePage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 배경: 고정 이미지(public/seed/hero.svg) — 실제 사진으로 교체 가능 */}
      <div
        className="absolute inset-0 bg-sand-200 bg-cover bg-center"
        style={{ backgroundImage: "url('/seed/hero.svg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-ink-900/25" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center text-white">
        <Logo className="scale-125 drop-shadow-sm sm:scale-150" />

        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link href="/portfolio" className="btn btn-light min-w-[180px]">
            PORTFOLIO
            <Arrow />
          </Link>
          <Link href="/consultant" className="btn btn-light min-w-[180px]">
            CONSULTANT
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
