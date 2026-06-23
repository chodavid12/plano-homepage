interface LogoProps {
  className?: string;
}

// PLANO DESIGN 텍스트 워드마크 (심볼 없음) — currentColor 기반
export default function Logo({ className = "" }: LogoProps) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`} aria-label="PLANO DESIGN">
      <span className="text-xl font-semibold tracking-[0.22em]">PLANO</span>
      <span className="mt-1.5 text-[0.62rem] tracking-[0.52em] opacity-80">DESIGN</span>
    </span>
  );
}
