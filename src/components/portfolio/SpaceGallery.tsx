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

  const loadMore = useCallback(() => {
    setVisible((v) => (v < photos.length ? Math.min(v + BATCH, photos.length) : v));
  }, [photos.length]);

  // 필터가 바뀌어 목록이 갱신되면 처음부터 다시
  useEffect(() => {
    setVisible(BATCH);
  }, [photos]);

  // 자동 로드 — IntersectionObserver(우선) + 스크롤 이벤트(보강).
  // 관찰자만 쓰면 환경에 따라 안 걸리는 경우가 있어 스크롤 핸들러로 이중 안전.
  useEffect(() => {
    if (visible >= photos.length) return;

    const near = () => {
      const el = sentinel.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 800) loadMore();
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined" && sentinel.current) {
      io = new IntersectionObserver(
        (entries) => entries[0]?.isIntersecting && loadMore(),
        { rootMargin: "800px" },
      );
      io.observe(sentinel.current);
    }

    window.addEventListener("scroll", near, { passive: true });
    window.addEventListener("resize", near, { passive: true });
    near(); // 첫 화면이 이미 짧아 센티넬이 보이면 바로 채운다

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", near);
      window.removeEventListener("resize", near);
    };
  }, [visible, photos.length, loadMore]);

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
