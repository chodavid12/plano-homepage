interface LogoProps {
  className?: string;
  /** 워드마크 색상 (기본: currentColor) */
  withMark?: boolean;
}

// PLANO DESIGN 워드마크 + D 북마크 심볼 (currentColor 기반 → 배경에 맞춰 색상 지정)
export default function Logo({ className = "", withMark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="PLANO DESIGN">
      {withMark && (
        <svg
          viewBox="0 0 48 56"
          className="h-7 w-auto"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          aria-hidden="true"
        >
          {/* D 형태 + 책갈피 노치 */}
          <path d="M8 6 H30 A14 14 0 0 1 30 50 H8 Z" strokeLinejoin="round" />
          <path d="M40 6 V40 L33 33 L26 40 V6 Z" strokeLinejoin="round" />
        </svg>
      )}
      <span className="flex flex-col leading-none">
        <span className="text-xl font-semibold tracking-[0.18em]">PLANO</span>
        <span className="mt-1 text-[0.6rem] tracking-[0.5em] opacity-80">DESIGN</span>
      </span>
    </span>
  );
}
