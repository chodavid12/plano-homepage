interface LogoProps {
  className?: string;
}

// PLANO 텍스트 워드마크 (심볼 없음) — currentColor 기반
export default function Logo({ className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-baseline leading-none ${className}`} aria-label="PLANO">
      <span className="font-wordmark text-xl font-semibold tracking-[0.22em]">PLANO</span>
    </span>
  );
}
