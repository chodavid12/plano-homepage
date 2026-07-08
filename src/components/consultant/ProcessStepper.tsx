"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROCESS_PHASES } from "@/lib/process";

// C안 — 가로 스텝 트랙 (진행바 + 단계별 상세 전환)
export default function ProcessStepper() {
  const [active, setActive] = useState(0);
  const last = PROCESS_PHASES.length - 1;
  const phase = PROCESS_PHASES[active];

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
            onClick={() => setActive(i)}
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

      {/* 상세 */}
      <div className="mt-12 min-h-[11rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
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

      {/* 이전/다음 */}
      <div className="mt-10 flex justify-between font-display text-xs uppercase tracking-[0.15em]">
        <button
          type="button"
          disabled={active === 0}
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          className="text-ink-700 transition-colors hover:text-ink-900 disabled:opacity-30"
        >
          ← 이전
        </button>
        <button
          type="button"
          disabled={active === last}
          onClick={() => setActive((a) => Math.min(last, a + 1))}
          className="text-ink-700 transition-colors hover:text-ink-900 disabled:opacity-30"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
