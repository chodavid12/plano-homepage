"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
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
const AUTOPLAY_MS = 4000; // 히어로 자동 전환 간격

// 상세 갤러리 — 안도하다식: 자동 캐러셀 히어로 + 프로스티드 정보카드 + 9:16 3열 + 클릭 라이트박스
export default function ProjectGallery({ images, title, subtitle, meta, materials }: Props) {
  // 공간(room) 순서 유지하며 그룹화 ('대표'는 커버/호버용 → 탭에서 제외)
  const rooms = useMemo(() => {
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
    if (grouped.length > 1) return [{ room: "전체", items: src }, ...grouped];
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
  const [heroIdx, setHeroIdx] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const current = rooms[Math.min(roomIdx, rooms.length - 1)];
  const items = current?.items ?? [];
  const total = items.length;

  // 히어로 자동 전환 (사진 2장 이상일 때, 라이트박스 열려있으면 멈춤)
  useEffect(() => {
    if (total <= 1 || lightbox !== null) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [total, lightbox]);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const moveLightbox = useCallback(
    (d: number) => setLightbox((i) => (i === null ? i : (i + d + total) % total)),
    [total],
  );

  // 라이트박스 — Esc 닫기 / 좌우 이동 + 배경 스크롤 잠금
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") moveLightbox(-1);
      else if (e.key === "ArrowRight") moveLightbox(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, closeLightbox, moveLightbox]);

  if (rooms.length === 0 || total === 0) {
    return <p className="py-20 text-center text-ink-700/50">등록된 이미지가 없습니다.</p>;
  }

  const showTabs = rooms.length > 1;
  const hero = items[Math.min(heroIdx, total - 1)];

  const selectRoom = (i: number) => {
    setRoomIdx(i);
    setHeroIdx(0);
  };

  return (
    <div className="flex flex-col">
      {/* ── 히어로 : 자동 캐러셀 + 프로스티드 정보 카드 ─────────────── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setLightbox(heroIdx)}
          className="relative block h-[56vh] w-full cursor-zoom-in overflow-hidden bg-ink-900 sm:h-[66vh] lg:h-[82vh]"
          aria-label="크게 보기"
        >
          <Image
            key={hero.imageUrl}
            src={hero.imageUrl}
            alt={`${title} ${heroIdx + 1}`}
            fill
            priority
            sizes="100vw"
            className="animate-fade-in object-cover"
          />
          {/* 카드 가독성용 스크림(모바일 하단 / 데스크톱 우측) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent lg:bg-gradient-to-l" />
          {total > 1 && (
            <div className="absolute bottom-4 left-4 rounded-full bg-ink-900/55 px-3 py-1 text-xs text-white">
              {heroIdx + 1} / {total}
            </div>
          )}
        </button>

        {/* 정보 카드 — 모바일 히어로 아래, 데스크톱 우측 오버레이(불투명 유리) */}
        <div className="relative z-10 -mt-6 mx-3 flex flex-col gap-4 rounded-xl border border-white/50 bg-sand-50/80 p-6 backdrop-blur-md sm:mx-6 lg:absolute lg:right-6 lg:top-6 lg:bottom-6 lg:mx-0 lg:mt-0 lg:w-[360px] lg:overflow-y-auto">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm font-light text-ink-700/80">{subtitle}</p>}
          </div>

          {(meta.length > 0 || orderedMaterials.length > 0) && (
            <dl className="divide-y divide-sand-300/60 border-y border-sand-300/60">
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

          {showTabs && (
            <div>
              <p className="mb-2 text-[0.7rem] uppercase tracking-[0.15em] text-ink-700/45">공간</p>
              <div className="flex flex-wrap gap-1.5">
                {rooms.map((r, i) => (
                  <button
                    key={r.room}
                    type="button"
                    onClick={() => selectRoom(i)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      i === roomIdx
                        ? "bg-ink-900 text-white"
                        : "bg-sand-200/70 text-ink-700 hover:bg-sand-300/70"
                    }`}
                  >
                    {r.room}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 나머지 사진 : 9:16 세로, 3열 ─────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2">
        {items.map((im, i) => (
          <button
            key={im.id}
            type="button"
            onClick={() => setLightbox(i)}
            className="group relative aspect-[9/16] cursor-zoom-in overflow-hidden bg-sand-200"
          >
            <Image
              src={im.imageUrl}
              alt={`${title} ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              loading={i < 6 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* ── 라이트박스(팝업) ──────────────────────────────────── */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink-900/95 sm:flex-row">
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="닫기"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {/* 큰 이미지 */}
          <div className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
            <div className="relative h-full w-full">
              <Image
                src={items[lightbox].imageUrl}
                alt={`${title} ${lightbox + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            {total > 1 && (
              <>
                <LightNav dir="prev" onClick={() => moveLightbox(-1)} />
                <LightNav dir="next" onClick={() => moveLightbox(1)} />
              </>
            )}
            {/* 공간 라벨 */}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs tracking-wide text-white">
              {items[lightbox].room} · {lightbox + 1} / {total}
            </span>
          </div>

          {/* 세로 썸네일 스트립 */}
          <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto p-2 sm:w-24 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden md:w-28">
            {items.map((im, i) => (
              <button
                key={im.id}
                type="button"
                onClick={() => setLightbox(i)}
                className={`relative aspect-[9/16] w-16 shrink-0 overflow-hidden transition-opacity sm:w-full ${
                  i === lightbox ? "ring-2 ring-white" : "opacity-50 hover:opacity-100"
                }`}
              >
                <Image src={im.imageUrl} alt="" fill sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 사양 한 줄 — 라벨(면적/마루/타일…) + 값
function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2.5">
      <dt className="w-12 shrink-0 pt-px text-[0.72rem] leading-5 text-ink-700/60">{label}</dt>
      <dd className="min-w-0 flex-1 text-[0.85rem] leading-relaxed text-ink-800">{children}</dd>
    </div>
  );
}

// 자재명 — "브랜드 |품번| 제품명" → 브랜드 강조 + 나머지 한 단계 눌러
function MaterialName({ name }: { name: string }) {
  const parts = name.split("|").map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return <span className="font-medium text-ink-900">{name}</span>;
  const [brand, ...rest] = parts;
  return (
    <>
      <span className="font-medium text-ink-900">{brand}</span>
      <span className="text-ink-700"> {rest.join(" · ")}</span>
    </>
  );
}

// 라이트박스 좌우 이동 버튼
function LightNav({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "이전" : "다음"}
      onClick={onClick}
      className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 ${
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
