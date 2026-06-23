"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null; // 랜딩에서는 푸터 숨김

  return (
    <footer className="mt-24 border-t border-sand-200 bg-sand-100">
      <div className="container-site grid gap-10 py-14 md:grid-cols-3">
        <div className="text-ink-900">
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-700/70">
            공간에 맞는 감각, 플라노디자인.
            <br />
            주거 공간의 설계부터 시공까지.
          </p>
        </div>

        <div className="text-sm text-ink-700/80">
          <h3 className="mb-3 tracking-[0.15em] text-ink-900">CONTACT</h3>
          <p>상담 문의 · 평일 10:00 – 18:00</p>
          <p className="mt-1">
            <Link href="/consultant" className="underline-offset-4 hover:underline">
              온라인 상담신청 →
            </Link>
          </p>
        </div>

        <div className="text-sm text-ink-700/80">
          <h3 className="mb-3 tracking-[0.15em] text-ink-900">FOLLOW</h3>
          <a
            href="https://instagram.com/planodesign.kr"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Instagram @planodesign.kr
          </a>
        </div>
      </div>

      <div className="border-t border-sand-200">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-ink-700/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} PLANO DESIGN. All rights reserved.</span>
          <span>플라노디자인 · 사업자정보 기재 예정</span>
        </div>
      </div>
    </footer>
  );
}
