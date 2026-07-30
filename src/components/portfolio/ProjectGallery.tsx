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

// 메인 이미지 높이 상한 — 세로 사진이 화면을 독점하지 않도록
const MAX_H = "78vh";
// 치수가 없는 예전 이미지 폴백 (3:2)
const FALLBACK_W = 3;
const FALLBACK_H = 2;

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

  const activeW = active.width || FALLBACK_W;
  const activeH = active.height || FALLBACK_H;

  const selectRoom = (i: number) => {
    setRoomIdx(i);
    setImgIdx(0);
  };
  const move = (delta: number) => {
    setImgIdx((prev) => (prev + delta + items.length) % items.length);
  };

  return (
    // 안도하다식 — 진입은 큰 히어로 이미지 + 제목 오버레이. 이후 공간탭·필름스트립·사양.
    <div className="flex flex-col gap-6">
      {/* 히어로 — 메인 이미지 크게, 제목을 사진 위에 얹는다 */}
      <div className="animate-fade-up">
        {/* 프레임을 이미지 비율에 맞춘다(세로컷 잘림 방지). 높이 상한(MAX_H)으로
            세로 사진이 화면을 독점하지 않게 하고, 폭을 줄여 비율 유지. */}
        <div
          className="relative mx-auto w-full overflow-hidden bg-sand-200"
          style={{
            aspectRatio: `${activeW} / ${activeH}`,
            maxWidth: `calc(${MAX_H} * ${activeW / activeH})`,
          }}
        >
          <Image
            src={active.imageUrl}
            alt={`${title} ${imgIdx + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 1100px"
            className="object-cover"
            priority
          />

          {/* 하단 스크림 + 제목(사진 위 흰 글씨) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/75 via-ink-900/20 to-transparent px-5 pb-5 pt-24 sm:px-7 sm:pb-7">
            <h1 className="text-2xl font-medium tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
              {title}
            </h1>
            {subtitle && <p className="mt-1.5 text-sm font-light text-white/80 sm:text-base">{subtitle}</p>}
          </div>

          {items.length > 1 && (
            <>
              <NavButton dir="prev" onClick={() => move(-1)} />
              <NavButton dir="next" onClick={() => move(1)} />
              <div className="absolute right-3 top-3 rounded-full bg-ink-900/55 px-3 py-1 text-xs text-white">
                {imgIdx + 1} / {items.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 공간탭 */}
      {showTabs && (
        <div className="no-scrollbar -mx-5 flex gap-x-5 gap-y-2 overflow-x-auto px-5 text-sm sm:mx-0 sm:flex-wrap sm:px-0">
          {rooms.map((r, i) => (
            <button
              key={r.room}
              type="button"
              onClick={() => selectRoom(i)}
              className={`shrink-0 py-1 text-xs uppercase tracking-[0.12em] transition-colors ${
                i === roomIdx ? "text-ink-900" : "text-ink-700/45 hover:text-ink-900"
              }`}
            >
              {r.room}
            </button>
          ))}
        </div>
      )}

      {/* 썸네일 필름스트립 — 가로 스크롤 */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:gap-2.5 sm:px-0">
        {items.map((im, i) => (
          <button
            key={im.id}
            type="button"
            onClick={() => setImgIdx(i)}
            className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden transition-opacity sm:w-24 md:w-28 ${
              i === imgIdx
                ? "ring-2 ring-ink-900 ring-offset-2 ring-offset-sand-50"
                : "opacity-55 hover:opacity-100"
            }`}
          >
            <Image src={im.imageUrl} alt={`썸네일 ${i + 1}`} fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* 사양 — 면적/마감재 */}
      {(meta.length > 0 || orderedMaterials.length > 0) && (
        <dl className="divide-y divide-sand-200/80 border-y border-sand-200">
          {meta.map((m) => (
            <SpecRow key={m.label} label={m.label}>
              <span className="font-medium text-ink-900">{m.value}</span>
            </SpecRow>
          ))}
          {orderedMaterials.map(([cat, names]) => (
            <SpecRow key={cat} label={cat}>
              {names.map((n, i) => (
                <span key={n}>
                  {i > 0 && <span className="text-ink-700/45">, </span>}
                  <MaterialName name={n} />
                </span>
              ))}
            </SpecRow>
          ))}
        </dl>
      )}
    </div>
  );
}

// 사양 한 줄 — 라벨(면적/마루/타일…) + 값
function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3">
      <dt className="w-14 shrink-0 pt-[0.15rem] text-[0.75rem] leading-5 tracking-[0.02em] text-ink-700">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-[0.9rem] leading-[1.7] text-ink-800">{children}</dd>
    </div>
  );
}

// 자재명은 노션에서 "브랜드 |품번| 제품명" 형태로 적힌다.
// 브랜드를 앞세우고 나머지는 한 단계만 눌러 — 너무 흐리면 읽히지 않는다.
function MaterialName({ name }: { name: string }) {
  const parts = name
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return <span className="font-medium text-ink-900">{name}</span>;
  const [brand, ...rest] = parts;
  return (
    <>
      <span className="font-medium text-ink-900">{brand}</span>
      <span className="text-ink-700"> {rest.join(" · ")}</span>
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
