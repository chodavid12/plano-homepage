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

const MATERIAL_ORDER = ["마루", "타일", "도배", "필름", "가구재"];
const AUTOPLAY_MS = 4000; // 히어로 자동 전환 간격
const HERO_MAX = 5; // 히어로 캐러셀에 쓸 대표 컷 수(나머지는 아래 갤러리)

// 상세 갤러리 — 데스크톱: 유리카드+9:16 3열 / 모바일: 풀스크린 히어로+세로 스트림. 공통 라이트박스.
export default function ProjectGallery({ images, title, subtitle, meta, materials }: Props) {
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

  const orderedMaterials = useMemo(() => {
    const src = materials || {};
    const known = MATERIAL_ORDER.filter((c) => src[c]?.length).map(
      (c) => [c, src[c]] as [string, string[]],
    );
    const rest = Object.entries(src).filter(([c, v]) => !MATERIAL_ORDER.includes(c) && v?.length);
    return [...known, ...rest];
  }, [materials]);

  const [roomIdx, setRoomIdx] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const current = rooms[Math.min(roomIdx, rooms.length - 1)];
  const items = current?.items ?? [];
  const total = items.length;
  const heroCount = Math.min(total, HERO_MAX);

  // 히어로 자동 전환 (라이트박스 열려있으면 멈춤)
  useEffect(() => {
    if (heroCount <= 1 || lightbox !== null) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroCount), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [heroCount, lightbox]);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const moveLightbox = useCallback(
    (d: number) => setLightbox((i) => (i === null ? i : (i + d + total) % total)),
    [total],
  );

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
  const hero = items[Math.min(heroIdx, heroCount - 1)];

  const selectRoom = (i: number) => {
    setRoomIdx(i);
    setHeroIdx(0);
  };

  const FilterButtons = ({ pill }: { pill?: boolean }) =>
    showTabs ? (
      <div className={pill ? "flex flex-wrap gap-1.5" : "no-scrollbar flex gap-2 overflow-x-auto"}>
        {rooms.map((r, i) => (
          <button
            key={r.room}
            type="button"
            onClick={() => selectRoom(i)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs transition-colors ${
              i === roomIdx
                ? "bg-ink-900 text-white"
                : "bg-sand-200/70 text-ink-700 hover:bg-sand-300/70"
            }`}
          >
            {r.room}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="flex flex-col">
      {/* ── 히어로 : 모바일 풀스크린 / 데스크톱 82vh + 유리카드 ─────── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setLightbox(heroIdx)}
          className="relative mx-[calc(50%-50vw)] block h-[85svh] w-screen cursor-zoom-in overflow-hidden bg-ink-900 lg:mx-0 lg:h-[82vh] lg:w-full"
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/65 via-transparent to-ink-900/10 lg:bg-gradient-to-l lg:from-ink-900/30" />

          {/* 모바일 — 제목 오버레이 + 진행 점 */}
          <div className="absolute inset-x-0 bottom-0 px-5 pb-7 text-left lg:hidden">
            <p className="text-2xl font-semibold tracking-tight text-white drop-shadow-md">{title}</p>
            {subtitle && <p className="mt-1 text-sm font-light text-white/80">{subtitle}</p>}
            {heroCount > 1 && (
              <div className="mt-4 flex gap-2">
                {Array.from({ length: heroCount }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-[2px] w-9 rounded-full ${i === heroIdx ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </button>

        {/* 데스크톱 — 유리 정보 카드 */}
        <div className="hidden lg:absolute lg:right-6 lg:top-6 lg:bottom-6 lg:flex lg:w-[360px] lg:flex-col lg:gap-4 lg:overflow-y-auto lg:rounded-xl lg:border lg:border-white/50 lg:bg-sand-50/80 lg:p-6 lg:backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm font-light text-ink-700/80">{subtitle}</p>}
          </div>
          <Spec meta={meta} materials={orderedMaterials} />
          {showTabs && (
            <div>
              <p className="mb-2 text-[0.7rem] uppercase tracking-[0.15em] text-ink-700/45">공간</p>
              <FilterButtons pill />
            </div>
          )}
        </div>
      </div>

      {/* ── 모바일 : 공간 필터 바(필터만, 스크롤해도 상단 고정) ──────── */}
      {showTabs && (
        <div className="sticky top-[var(--header-h)] z-20 mx-[calc(50%-50vw)] w-screen border-b border-sand-200 bg-sand-50/95 px-4 py-3 backdrop-blur lg:hidden">
          <FilterButtons />
        </div>
      )}

      {/* ── 모바일 : 상세 정보(면적·마감재) 접기 ───────────────────── */}
      {(meta.length > 0 || orderedMaterials.length > 0) && (
        <details className="group border-b border-sand-200 py-3 lg:hidden">
          <summary className="flex cursor-pointer items-center justify-between text-sm text-ink-800 marker:content-none">
            상세 정보
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className="mt-2">
            <Spec meta={meta} materials={orderedMaterials} />
          </div>
        </details>
      )}

      {/* ── 모바일 : 풀폭 세로 스트림(자연 비율, 상하 스크롤) ────────── */}
      <div className="mx-[calc(50%-50vw)] mt-2 flex w-screen flex-col gap-1 lg:hidden">
        {items.map((im, i) => (
          <button
            key={im.id}
            type="button"
            onClick={() => setLightbox(i)}
            className="relative block w-full cursor-zoom-in"
          >
            <Image
              src={im.imageUrl}
              alt={`${title} ${i + 1}`}
              width={im.width || 1600}
              height={im.height || 1067}
              sizes="100vw"
              loading={i < 2 ? "eager" : "lazy"}
              className="h-auto w-full"
            />
          </button>
        ))}
      </div>

      {/* ── 데스크톱 : 9:16 3열 그리드 ───────────────────────────── */}
      <div className="mt-4 hidden gap-2 lg:grid lg:grid-cols-3">
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
              sizes="33vw"
              loading={i < 6 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* ── 라이트박스 ───────────────────────────────────────────── */}
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
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs tracking-wide text-white">
              {items[lightbox].room} · {lightbox + 1} / {total}
            </span>
          </div>

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

// 사양 목록 (면적/마감재) — 데스크톱 카드 · 모바일 접기 공용
function Spec({
  meta,
  materials,
}: {
  meta: MetaItem[];
  materials: [string, string[]][];
}) {
  if (meta.length === 0 && materials.length === 0) return null;
  return (
    <dl className="divide-y divide-sand-300/60 border-y border-sand-300/60">
      {meta.map((m) => (
        <SpecRow key={m.label} label={m.label}>
          <span className="font-medium text-ink-900">{m.value}</span>
        </SpecRow>
      ))}
      {materials.map(([cat, names]) => (
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
  );
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2.5">
      <dt className="w-12 shrink-0 pt-px text-[0.72rem] leading-5 text-ink-700/60">{label}</dt>
      <dd className="min-w-0 flex-1 text-[0.85rem] leading-relaxed text-ink-800">{children}</dd>
    </div>
  );
}

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
