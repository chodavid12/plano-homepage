"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/about", label: "ABOUT" },
  { href: "/portfolio", label: "PORTFOLIO" },
  { href: "/consultant", label: "CONSULTANT" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 랜딩(스플래시)에서는 헤더 숨김
  const hidden = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (hidden) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="container-site flex h-[var(--header-h)] items-center justify-between">
        <Link href="/" className="text-ink-900 transition-opacity hover:opacity-70">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-12 md:flex">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`group relative text-xs uppercase tracking-[0.2em] transition-colors ${
                  active ? "text-ink-900" : "text-ink-700/70 hover:text-ink-900"
                }`}
              >
                {n.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-ink-900 transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center text-ink-800 md:hidden"
        >
          <GridIcon />
        </button>
      </div>

      {/* 모바일 드로어 */}
      {open && (
        <div className="border-t border-sand-200 bg-sand-50 md:hidden">
          <nav className="container-site flex flex-col py-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="py-3 text-sm tracking-[0.15em] text-ink-700"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      {[2, 11].map((y) =>
        [2, 11].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width={7} height={7} rx={1} />),
      )}
    </svg>
  );
}
