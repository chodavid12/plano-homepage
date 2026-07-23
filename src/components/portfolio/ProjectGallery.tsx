"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ProjectImage } from "@/lib/types";

interface MetaItem {
  label: string;
  value: string;
}

interface Props {
  images: ProjectImage[];
  title: string;
  subtitle?: string;
  meta: MetaItem[];
  /** 마감재 — { 마루: ["브랜드 | 제품명", …], 타일: […] } */
  materials?: Record<string, string[]>;
}

// 마감재 표시 순서 (노션 속성 순서와 무관하게 고정)
const MATERIAL_ORDER = ["마루", "타일", "도배", "필름", "가구재"];

// 상세 갤러리 — 좌: 제목·정보·썸네일 / 우: 큰 메인 이미지 (LILSQUARE식 2단)
export default function ProjectGallery({ images, title, subtitle, meta, materials }: Props) {
  // 공간(room) 순서 유지하며 그룹화
  const rooms = useMemo(() => {
    // '대표'는 목록 카드 커버·호버용 → 상세 갤러리 탭에서는 제외
    const visible = images.filter((im) => im.room !== "대표");
    const src = visible.length ? visible : images;
    const order: string[] = [];
    const map = new Map<string, ProjectImage[]>();
    for (const im of src) {
      if (!map.has(im.room)) {
        map.set(im.room, []);
        order.push(im.room);
      }
      map.get(im.room)!.push(im);
    }
    const grouped = order.map((room) => ({ room, items: map.get(room)! }));
    // 공간이 2개 이상이면 '전체'(모든 사진) 탭을 맨 앞에 두고 기본 선택
    if (grouped.length > 1) {
      return [{ room: "전체", items: src }, ...grouped];
    }
    return grouped;
  }, [images]);

  // 마감재 — 고정 순서로 정렬(노션에 없는 카테고리는 제외)
  const orderedMaterials = useMemo(() => {
    const src = materials || {};
    const known = MATERIAL_ORDER.filter((c) => src[c]?.length).map(
      (c) => [c, src[c]] as [string, string[]],
    );
    const rest = Object.entries(src).filter(
      ([c, v]) => !MATERIAL_ORDER.includes(c) && v?.length,
    );
    return [...known, ...rest];
  }, [materials]);

  const [roomIdx, setRoomIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  if (rooms.length === 0) {
    return <p className="py-20 text-center text-ink-700/50">등록된 이미지가 없습니다.</p>;
  }

  const showTabs = rooms.length > 1 && rooms.some((r) => r.room);
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
    <div className="grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,3.5fr)_minmax(0,8.5fr)] lg:items-start">
      {/* 좌상단 — 제목 / 메타 / 공간탭 */}
      <div className="animate-fade-up lg:col-start-1 lg:row-start-1">
        <h1 className="text-3xl tracking-tight text-ink-900 md:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-base font-light text-ink-700/80">{subtitle}</p>
        )}

        {meta.length > 0 && (
          <dl className="mt-8 space-y-2.5 border-t border-sand-200 pt-7 text-sm">
            {meta.map((m) => (
              <div key={m.label} className="flex gap-5">
                <dt className="w-12 shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-700/45">
                  {m.label}
                </dt>
                <dd className="text-ink-900">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {orderedMaterials.length > 0 && (
          <section className="mt-7 border-t border-sand-200 pt-7">
            <h2 className="text-[0.7rem] uppercase tracking-[0.15em] text-ink-700/45">마감재</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {orderedMaterials.map(([cat, names]) => (
                <div key={cat} className="flex gap-5">
                  <dt className="w-12 shrink-0 pt-px text-[0.78rem] text-ink-700/60">{cat}</dt>
                  {/* 자재는 줄바꿈으로 흘려 넣는다 — 한 줄씩 쌓으면 갤러리 탭이 화면 밖으로 밀린다 */}
                  <dd className="min-w-0 flex-1 text-[0.83rem] leading-relaxed text-ink-800">
                    {names.map((n, i) => (
                      <span key={n}>
                        {i > 0 && <span className="text-ink-700/35">, </span>}
                        <MaterialName name={n} />
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {showTabs && (
          <div className="no-scrollbar mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {rooms.map((r, i) => (
              <button
                key={r.room}
                type="button"
                onClick={() => selectRoom(i)}
                className={`text-xs uppercase tracking-[0.12em] transition-colors ${
                  i === roomIdx ? "text-ink-900" : "text-ink-700/45 hover:text-ink-900"
                }`}
              >
                {r.room}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 우측 — 메인 이미지 (모바일에선 제목 아래) */}
      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="relative aspect-[3/2] overflow-hidden bg-sand-200">
          <Image
            src={active.imageUrl}
            alt={`${title} ${imgIdx + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
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
      </div>

      {/* 좌하단 — 썸네일 그리드 */}
      <div className="lg:col-start-1 lg:row-start-2">
        <div className="grid grid-cols-4 gap-2.5">
          {items.map((im, i) => (
            <button
              key={im.id}
              type="button"
              onClick={() => setImgIdx(i)}
              className={`relative aspect-[4/3] overflow-hidden transition-opacity ${
                i === imgIdx
                  ? "ring-2 ring-ink-900 ring-offset-2 ring-offset-sand-50"
                  : "opacity-55 hover:opacity-100"
              }`}
            >
              <Image
                src={im.imageUrl}
                alt={`썸네일 ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 자재명은 노션에서 "브랜드 |품번| 제품명" 형태로 적힌다.
// 브랜드를 앞세우고 나머지는 눌러서 목록이 한눈에 훑히도록 한다.
function MaterialName({ name }: { name: string }) {
  const parts = name
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return <>{name}</>;
  const [brand, ...rest] = parts;
  return (
    <>
      <span className="text-ink-900">{brand}</span>
      <span className="text-ink-700/60"> · {rest.join(" · ")}</span>
    </>
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
