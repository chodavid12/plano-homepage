"use client";

import Image from "next/image";
import { useState } from "react";

export interface IndexItem {
  no: string;
  title: string;
  line: string;
  image: string;
}

/**
 * 경영철학 인덱스 — 3가지 기준을 목차처럼 나열한다.
 * 행에 마우스를 올리면 우측 프리뷰가 해당 이미지로 크로스페이드된다
 * (포트폴리오 카드 호버와 같은 어법). 클릭하면 본문 섹션으로 이동.
 */
export default function PhilosophyIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-20">
      {/* 목차 */}
      <ul className="border-t border-sand-300/70" onMouseLeave={() => setActive(0)}>
        {items.map((it, i) => {
          const on = i === active;
          return (
            <li key={it.no} className="border-b border-sand-300/70">
              <a
                href={`#principle-${it.no}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group flex items-baseline gap-6 py-7 outline-none md:gap-9 md:py-9"
              >
                <span
                  className={`shrink-0 font-display text-xs tracking-[0.2em] transition-colors duration-300 ${
                    on ? "text-wood-500" : "text-ink-700/40"
                  }`}
                >
                  {it.no}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-xl font-semibold tracking-tight transition-colors duration-300 md:text-[1.6rem] ${
                      on ? "text-ink-900" : "text-ink-800/70"
                    }`}
                  >
                    {it.title}
                  </span>
                  <span className="mt-2 block text-sm font-light leading-relaxed text-ink-700/70 md:text-[0.95rem]">
                    {it.line}
                  </span>

                  {/* 모바일 — 프리뷰가 없으므로 인라인 썸네일 */}
                  <span className="relative mt-5 block aspect-[16/10] w-full overflow-hidden bg-sand-200 lg:hidden">
                    <Image
                      src={it.image}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </span>
                </span>

                {/* 인디케이터 — 활성 행에서 뻗어나간다 */}
                <span className="hidden shrink-0 items-center gap-3 self-center lg:flex">
                  <span
                    className={`block h-px bg-wood-500 transition-all duration-500 ease-out ${
                      on ? "w-10 opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 transition-all duration-500 ${
                      on ? "translate-x-0 text-wood-500 opacity-100" : "-translate-x-2 text-ink-700/30 opacity-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* 프리뷰 — 데스크톱에서만. 호버에 따라 크로스페이드 */}
      <div className="sticky top-28 hidden lg:block">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand-200">
          {items.map((it, i) => (
            <Image
              key={it.no}
              src={it.image}
              alt={it.title}
              fill
              sizes="45vw"
              className={`object-cover transition-[opacity,transform] duration-[900ms] ease-out ${
                i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink-900/5" />

          {/* 현재 항목 번호 — 이미지 위 */}
          <div className="pointer-events-none absolute bottom-5 left-5">
            <span className="font-display text-[2.6rem] font-light leading-none text-white/90 drop-shadow-sm">
              {items[active].no}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
