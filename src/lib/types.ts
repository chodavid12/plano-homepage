// 포트폴리오 도메인 타입 — Supabase / Notion / seed 공통

export type SizeCategory = "10PY" | "20PY" | "30PY" | "40PY" | "50PY~";

export interface ProjectImage {
  id: string;
  room: string; // 공간명 (거실/주방/…) — 상세 탭 라벨
  imageUrl: string;
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
  coverUrl: string;
  sortOrder: number;
  images: ProjectImage[];
}

export interface ConsultInput {
  name: string;
  phone: string;
  sizeCategory?: string;
  region?: string;
  budget?: string;
  message?: string;
  // 봇 차단용 허니팟 (사람은 비워둠)
  company?: string;
}
