// 포트폴리오 도메인 타입 — scripts/notion-sync.mjs 가 굽는 seed.ts 의 형태

export type SizeCategory = "10PY" | "20PY" | "30PY" | "40PY" | "50PY~";

export interface ProjectImage {
  id: string;
  room: string; // 공간명 (거실/주방/…) — 상세 탭 라벨
  imageUrl: string;
  /** 변환된 webp 의 실제 치수 — 갤러리에서 원본 비율대로 표시(세로/가로 혼재) */
  width?: number;
  height?: number;
  sortOrder: number;
}

export interface Project {
  /** 프로젝트 넘버 — URL(`/portfolio/[no]`). Notion page 에 고정되어 재동기화해도 바뀌지 않는다. */
  no: number;
  /** Notion page id (동기화 식별자 · no 고정 키) */
  notionPageId: string;
  /** Notion page 최종 수정시각 — 증분 동기화(변경 없으면 재다운로드 스킵) 판단용 */
  notionLastEditedAt?: string;
  title: string;
  subtitle?: string;
  apartment?: string;
  sizeCategory: SizeCategory;
  type?: string;
  areaSupply?: string;
  areaExclusive?: string;
  completionYear?: number;
  region?: string;
  period?: string;
  /** 마감재 — 노션 포트폴리오 DB의 자재 rollup. { 마루: ["브랜드 | 제품명", …], 타일: […] } */
  materials?: Record<string, string[]>;
  coverUrl: string;
  sortOrder: number;
  images: ProjectImage[];
}
