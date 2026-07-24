"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SpacePhoto } from "@/lib/filter";

const BATCH = 30; // 한 번에 렌더할 사진 수

// 세부 공간별 보기 — 프로젝트 카드가 아니라 '사진'을 정사각형 그리드로 모아 보여준다.
// 전체가 1,000장이 넘으므로 배치로 렌더하고 '더 보기'로 이어 붙인다.
export default function SpaceGallery({ photos }: { photos: SpacePhoto[] }) {
  const [visible, setVisible] = useState(BATCH);

  // 필터가 바뀌어 목록이 갱신되면 처음부터 다시
  useEffect(() => {
    setVisible(BATCH);
  }, [photos]);

  if (photos.length === 0) {
    return <p className="py-24 text-center text-ink-700/50">해당 공간의 사진이 없습니다.</p>;
  }

  const shown = photos.slice(0, visible);
  const remaining = photos.length - visible;

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

      {remaining > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => Math.min(v + BATCH, photos.length))}
            className="btn btn-ghost min-w-[220px]"
          >
            사진 더 보기
            <span className="text-ink-700/45">
              {visible} / {photos.length}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
