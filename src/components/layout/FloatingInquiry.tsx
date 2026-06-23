"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingInquiry() {
  const pathname = usePathname();
  // 랜딩·상담 페이지에서는 숨김
  if (pathname === "/" || pathname.startsWith("/consultant")) return null;

  return (
    <Link
      href="/consultant"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-ink-800 px-5 py-3 text-sm text-white shadow-lg transition-colors hover:bg-ink-900"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-4 4V4z" />
      </svg>
      1:1 문의
    </Link>
  );
}
