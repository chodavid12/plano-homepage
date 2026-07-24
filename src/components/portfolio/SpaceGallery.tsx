"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SpacePhoto } from "@/lib/filter";

const BATCH = 30; // 한 번에 렌더할 사진 수 (스크롤하면 자동 추가)

// 세부 공간별 보기 — 프로젝트 카드가 아니라 '사진'을 정사각형 그리드로 모아 보여준다.
// 전체가 1,000장이 넘으므로 30장씩 렌더하고, 하단 근처로 스크롤하면 자동으로 이어 붙인다.
export default function SpaceGallery({ photos }: { photos: SpacePhoto[] }) {
  const [visible, setVisible] = useState(BATCH);
  const sentinel = useRef<HTMLDivElement>(null);
  // 콜백이 재구독 없이 최신 visible/length 를 읽도록 ref 로 들고 있는다
  const state = useRef({ visible: BATCH, total: photos.length });
  state.current = { visible, total: photos.length };

  const loadMore = useCallback(() => {
    setVisible((v) => (v < state.current.total ? Math.min(v + BATCH, state.current.total) : v));
  }, []);

  // 필터가 바뀌어 목록이 갱신되면 처음부터 다시
  useEffect(() => {
    setVisible(BATCH);
  }, [photos]);

  // 자동 로드 — 옵저버/리스너를 한 번만 구독하고 배치마다 재구독하지 않는다.
  // IntersectionObserver(우선) + 스크롤 이벤트(보강, 환경에 따라 IO 미발동 대비).
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;

    const maybeLoad = () => {
      if (state.current.visible >= state.current.total) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 800) loadMore();
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => entries[0]?.isIntersecting && loadMore(),
        { rootMargin: "800px" },
      );
      io.observe(el);
    }
    window.addEventListener("scroll", maybeLoad, { passive: true });
    window.addEventListener("resize", maybeLoad, { passive: true });
    maybeLoad(); // 첫 화면이 짧아 센티넬이 이미 보이면 바로 채운다

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", maybeLoad);
      window.removeEventListener("resize", maybeLoad);
    };
    // photos: 필터가 바뀌면 센티넬 노드가 새로 생기므로 그때만 재구독(배치마다 X)
  }, [loadMore, photos]);

  if (photos.length === 0) {
    return <p className="py-24 text-center text-ink-700/50">해당 공간의 사진이 없습니다.</p>;
  }

  const shown = photos.slice(0, visible);
  const hasMore = visible < photos.length;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {shown.map((ph, i) => (
          <Link
            key={`${ph.no}-${ph.imageUrl}`}
            href={`/portfolio/${ph.no}`}
            className="group relative aspect-square overflow-hidden bg-sand-200"
          >
            <Image
              src={ph.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading={i < 6 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-ink-900/0 transition-colors duration-500 group-hover:bg-ink-900/10" />
          </Link>
        ))}
      </div>

      {hasMore && (
        <>
          {/* 하단 근처로 스크롤하면 이 지점을 감지해 다음 배치를 자동 로드 */}
          <div ref={sentinel} aria-hidden="true" className="h-1" />
          {/* 버튼 없이 스크롤로 자동 로드 — 로딩 인디케이터만 표시 */}
          <div className="mt-10 flex items-center justify-center gap-1.5 text-ink-700/40" aria-live="polite">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
          </div>
        </>
      )}
    </>
  );
}
