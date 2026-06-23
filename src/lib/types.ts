// 포트폴리오 도메인 타입 — Supabase / Notion / seed 공통

export type SizeCategory = "10PY" | "20PY" | "30PY" | "40PY" | "50PY~";

export interface ProjectImage {
  id: string;
  room: string; // 공간명 (거실/주방/…) — 상세 탭 라벨
  imageUrl: string;
  sortOrder: number;
}

export interface Project {
  /** 프로젝트 넘버 — URL(`/portfolio/[no]`)과 NO.### 표시에 사용 */
  no: number;
  /** Notion page id (동기화 식별자) */
  notionPageId: string;
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
