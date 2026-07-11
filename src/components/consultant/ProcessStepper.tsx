"use client";

import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { PROCESS_PHASES } from "@/lib/process";

const SWIPE_DISTANCE = 60; // px — 이 이상 끌면 스와이프로 인정
const SWIPE_VELOCITY = 350; // px/s — 짧게 튕겨도 인정되는 속도 기준

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

// C안 — 가로 스텝 트랙 (진행바 + 스와이프/드래그로 단계 전환)
export default function ProcessStepper() {
  const [[active, direction], setState] = useState<[number, number]>([0, 0]);
  const last = PROCESS_PHASES.length - 1;
  const phase = PROCESS_PHASES[active];

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(last, next));
    if (clamped === active) return;
    setState([clamped, clamped > active ? 1 : -1]);
  };

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) {
      go(active + 1); // 왼쪽으로 스와이프 → 다음
    } else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) {
      go(active - 1); // 오른쪽으로 스와이프 → 이전
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* 진행 트랙 */}
      <div className="relative flex items-start justify-between">
        <div className="absolute inset-x-5 top-5 h-px bg-sand-300" />
        <motion.div
          className="absolute left-5 top-5 h-px bg-wood-400"
          initial={false}
          animate={{ width: `calc(${(active / last) * 100}% - ${(active / last) * 2.5}rem)` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        {PROCESS_PHASES.map((p, i) => (
          <button
            key={p.no}
            type="button"
            onClick={() => setState([i, i > active ? 1 : -1])}
            className="relative z-10 flex flex-col items-center gap-2.5"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border font-display text-xs tracking-wider transition-colors duration-300 ${
                i <= active
                  ? "border-wood-400 bg-wood-400 text-white"
                  : "border-sand-300 bg-sand-50 text-ink-700/45"
              }`}
            >
              {p.no}
            </span>
            <span
              className={`hidden text-xs tracking-tight transition-colors sm:block ${
                i === active ? "text-ink-900" : "text-ink-700/45"
              }`}
            >
              {p.title}
            </span>
          </button>
        ))}
      </div>

      {/* 상세 — 좌우로 끌어(스와이프) 단계 전환 */}
      <div className="relative mt-12 min-h-[11rem] touch-pan-y overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={active}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            <h2 className="text-2xl tracking-tight text-ink-900 md:text-[1.7rem]">{phase.title}</h2>
            <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {phase.steps.map((s) => (
                <div key={s.title} className="border-l-2 border-sand-200 pl-4">
                  <p className="text-[0.95rem] font-medium text-ink-900">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-700/75">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 모바일 힌트 + 이전/다음 */}
      <p className="mt-6 text-center text-xs text-ink-700/40 sm:hidden">좌우로 밀어 단계를 넘겨보세요</p>
      <div className="mt-4 flex justify-between font-display text-xs uppercase tracking-[0.15em] sm:mt-10">
        <button
          type="button"
          disabled={active === 0}
          onClick={() => go(active - 1)}
          className="text-ink-700 transition-colors hover:text-ink-900 disabled:opacity-30"
        >
          ← 이전
        </button>
        <button
          type="button"
          disabled={active === last}
          onClick={() => go(active + 1)}
          className="text-ink-700 transition-colors hover:text-ink-900 disabled:opacity-30"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
