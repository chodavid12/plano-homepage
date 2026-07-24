import type { Project } from "./types";
import { roomRank } from "./rooms";

export interface PortfolioQuery {
  size?: string; // 'all' | SizeCategory
  q?: string; // 검색어 (아파트/지역/제목/넘버/마감재)
}

export function filterProjects(projects: Project[], query: PortfolioQuery): Project[] {
  let list = projects;

  if (query.size && query.size !== "all") {
    list = list.filter((p) => p.sizeCategory === query.size);
  }

  const q = (query.q || "").trim().toLowerCase();
  if (q) {
    list = list.filter((p) => {
      const haystack = [
        p.title,
        p.subtitle,
        p.apartment,
        p.region,
        p.type,
        `no.${p.no}`,
        String(p.no),
        // 마감재 — 카테고리명(타일/도배…)과 자재명(브랜드·제품명) 모두 검색 대상
        ...Object.entries(p.materials || {}).flatMap(([cat, names]) => [cat, ...names]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return list;
}

export function formatNo(no: number): string {
  return `NO.${String(no).padStart(3, "0")}`;
}

/** 카드·상세 공통 제목 — 아파트명 + 평형으로 통일 (없으면 프로젝트명 폴백) */
export function projectTitle(
  p: Pick<Project, "apartment" | "areaSupply" | "title">,
): string {
  return [p.apartment, p.areaSupply].filter(Boolean).join(" ") || p.title;
}

/** 세부 공간별 보기의 한 칸 — '프로젝트'가 아니라 '사진' 단위 */
export interface SpacePhoto {
  no: number; // 소속 프로젝트 (클릭 시 이동)
  imageUrl: string;
  room: string;
}

/**
 * 세부 공간별 보기 — 프로젝트가 아니라 사진을 모은다.
 *   room 미지정/'all' → 대표 제외 모든 사진
 *   특정 room       → 그 공간 사진 전부(현장 구분 없이)
 * 순서는 프로젝트 표시순(sortOrder) → 프로젝트 내 이미지 순.
 */
export function spacePhotos(projects: Project[], room?: string): SpacePhoto[] {
  const wantAll = !room || room === "all";
  const out: SpacePhoto[] = [];
  for (const p of projects) {
    for (const im of p.images) {
      if (im.room === "대표") continue; // 대표는 목록 카드 커버·호버용
      if (!wantAll && im.room !== room) continue;
      out.push({ no: p.no, imageUrl: im.imageUrl, room: im.room });
    }
  }
  return out;
}

/** 데이터에 실제 존재하는 공간 목록 (필터 옵션용, '대표'·빈값 제외, 표준 순서) */
export function availableRooms(projects: Project[]): string[] {
  const set = new Set<string>();
  for (const p of projects) {
    for (const im of p.images) {
      if (im.room && im.room !== "대표") set.add(im.room);
    }
  }
  return [...set].sort((a, b) => roomRank(a) - roomRank(b));
}
