"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ProjectImage } from "@/lib/types";

export default function ProjectGallery({ images }: { images: ProjectImage[] }) {
  // 공간(room) 순서 유지하며 그룹화
  const rooms = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, ProjectImage[]>();
    for (const im of images) {
      if (!map.has(im.room)) {
        map.set(im.room, []);
        order.push(im.room);
      }
      map.get(im.room)!.push(im);
    }
    return order.map((room) => ({ room, items: map.get(room)! }));
  }, [images]);

  const [roomIdx, setRoomIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  if (rooms.length === 0) {
    return <p className="py-20 text-center text-ink-700/50">등록된 이미지가 없습니다.</p>;
  }

  const current = rooms[Math.min(roomIdx, rooms.length - 1)];
  const items = current.items;
  const active = items[Math.min(imgIdx, items.length - 1)];

  const selectRoom = (i: number) => {
    setRoomIdx(i);
    setImgIdx(0);
  };
  const move = (delta: number) => {
    setImgIdx((prev) => (prev + delta + items.length) % items.length);
  };

  return (
    <div>
      {/* 공간별 탭 */}
      <div className="no-scrollbar flex gap-6 overflow-x-auto border-b border-sand-200 text-sm">
        {rooms.map((r, i) => (
          <button
            key={r.room}
            type="button"
            onClick={() => selectRoom(i)}
            className={`-mb-px shrink-0 border-b-2 pb-4 text-xs uppercase tracking-[0.12em] transition-colors ${
              i === roomIdx
                ? "border-ink-900 text-ink-900"
                : "border-transparent text-ink-700/45 hover:text-ink-900"
            }`}
          >
            {r.room}
          </button>
        ))}
      </div>

      {/* 메인 이미지 */}
      <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-sand-200">
        <Image
          src={active.imageUrl}
          alt={`${current.room} ${imgIdx + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 960px"
          className="object-cover"
          priority
        />
        {items.length > 1 && (
          <>
            <NavButton dir="prev" onClick={() => move(-1)} />
            <NavButton dir="next" onClick={() => move(1)} />
            <div className="absolute bottom-3 right-3 rounded-full bg-ink-900/55 px-3 py-1 text-xs text-white">
              {imgIdx + 1} / {items.length}
            </div>
          </>
        )}
      </div>

      {/* 썸네일 스트립 */}
      {items.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {items.map((im, i) => (
            <button
              key={im.id}
              type="button"
              onClick={() => setImgIdx(i)}
              className={`relative aspect-[4/3] w-28 shrink-0 overflow-hidden transition-opacity ${
                i === imgIdx ? "ring-2 ring-ink-900 ring-offset-2 ring-offset-sand-50" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={im.imageUrl}
                alt={`${current.room} 썸네일 ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavButton({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "이전 이미지" : "다음 이미지"}
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-ink-900 transition-colors hover:bg-white ${
        isPrev ? "left-3" : "right-3"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
        {isPrev ? (
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
