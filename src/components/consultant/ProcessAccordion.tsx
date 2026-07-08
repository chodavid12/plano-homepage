"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROCESS_PHASES } from "@/lib/process";

// B안 — 아코디언 (클릭 펼침, framer-motion)
export default function ProcessAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl border-t border-sand-200">
      {PROCESS_PHASES.map((phase, i) => {
        const isOpen = open === i;
        return (
          <div key={phase.no} className="border-b border-sand-200">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-5 py-6 text-left transition-colors hover:text-ink-900"
            >
              <span className="font-display text-sm tracking-wider text-wood-500">{phase.no}</span>
              <span className="flex-1 text-lg tracking-tight text-ink-900 md:text-xl">
                {phase.title}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-2xl font-light leading-none text-ink-700/45"
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pb-7 pl-9">
                    {phase.steps.map((s) => (
                      <div key={s.title}>
                        <p className="text-[0.95rem] font-medium text-ink-900">{s.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-700/75">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
