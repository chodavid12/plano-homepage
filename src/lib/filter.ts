import type { Project } from "./types";

export interface PortfolioQuery {
  size?: string; // 'all' | SizeCategory
  q?: string; // 검색어 (아파트/지역/제목/넘버)
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

/** 공간별 보기: 공간명 → 해당 공간 이미지를 가진 프로젝트 목록 */
export interface SpaceGroup {
  room: string;
  items: { project: Project; imageUrl: string }[];
}

export function groupBySpace(projects: Project[]): SpaceGroup[] {
  const map = new Map<string, { project: Project; imageUrl: string }[]>();
  for (const p of projects) {
    const seenRoom = new Set<string>();
    for (const im of p.images) {
      if (seenRoom.has(im.room)) continue; // 프로젝트당 공간별 대표 1장
      seenRoom.add(im.room);
      const arr = map.get(im.room) || [];
      arr.push({ project: p, imageUrl: im.imageUrl });
      map.set(im.room, arr);
    }
  }
  return [...map.entries()].map(([room, items]) => ({ room, items }));
}
