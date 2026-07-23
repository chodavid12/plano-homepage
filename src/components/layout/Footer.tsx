"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const SOCIALS = [
  { label: "Instagram @planodesign.kr", href: "https://instagram.com/planodesign.kr" },
  { label: "오늘의집", href: "https://ohou.se/experts/myhome/9104123" },
  { label: "네이버 블로그", href: "https://blog.naver.com/planointerior" },
];

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
          <h3 className="overline mb-4 text-ink-700">CONTACT</h3>
          <p>상담 문의 · 평일 10:00 – 18:00</p>
          <p className="mt-1">
            <Link href="/consultant" className="underline-offset-4 hover:underline">
              온라인 상담신청 →
            </Link>
          </p>
        </div>

        <div className="text-sm text-ink-700/80">
          <h3 className="overline mb-4 text-ink-700">FOLLOW</h3>
          <ul className="space-y-2">
            {SOCIALS.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-sand-200">
        {/* 모바일은 우하단 플로팅 '1:1 문의' 버튼이 저작권 줄을 가리므로 하단 여백 확보 */}
        <div className="container-site flex flex-col gap-2 pt-5 pb-24 text-xs text-ink-700/50 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <span>© {new Date().getFullYear()} PLANO DESIGN. All rights reserved.</span>
          <span>플라노디자인 · 사업자정보 기재 예정</span>
        </div>
      </div>
    </footer>
  );
}
