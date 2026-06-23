"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SIZE_FILTERS } from "@/lib/rooms";

export default function PortfolioControls() {
  const router = useRouter();
  const params = useSearchParams();

  const view = params.get("view") === "space" ? "space" : "project";
  const size = params.get("size") || "all";
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  const update = useCallback(
    (next: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (!v || v === "all" || v === "") sp.delete(k);
        else sp.set(k, v);
      }
      const qs = sp.toString();
      router.replace(qs ? `/portfolio?${qs}` : "/portfolio", { scroll: false });
    },
    [params, router],
  );

  return (
    <div className="space-y-6">
      {/* 보기 탭 */}
      <div className="flex gap-6 border-b border-sand-200 text-sm">
        <button
          type="button"
          onClick={() => update({ view: null })}
          className={tab(view === "project")}
        >
          프로젝트별로 보기
        </button>
        <button
          type="button"
          onClick={() => update({ view: "space" })}
          className={tab(view === "space")}
        >
          세부 공간별로 보기
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* 평형 필터 */}
        <div className="flex flex-wrap gap-2">
          {SIZE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => update({ size: f.value })}
              className={chip(size === f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q });
          }}
          className="relative w-full md:w-72"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="아파트명(지역) 또는 넘버 검색"
            className="field pr-10"
            aria-label="포트폴리오 검색"
          />
          <button
            type="submit"
            aria-label="검색"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/50"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <circle cx="9" cy="9" r="6" />
              <path d="m14 14 4 4" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function tab(active: boolean) {
  return `-mb-px border-b-2 pb-3 tracking-wide transition-colors ${
    active ? "border-ink-800 text-ink-900" : "border-transparent text-ink-700/50 hover:text-ink-900"
  }`;
}

function chip(active: boolean) {
  return `rounded-full border px-4 py-1.5 text-sm transition-colors ${
    active
      ? "border-ink-800 bg-ink-800 text-white"
      : "border-sand-300 text-ink-700/80 hover:border-ink-700"
  }`;
}
