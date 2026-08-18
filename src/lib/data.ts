import "server-only";
import type { Project } from "./types";
import { SEED_PROJECTS } from "./seed";

// 포트폴리오의 원본은 노션이지만 런타임에 노션을 조회하지는 않는다.
// scripts/notion-sync.mjs 가 배포 전에 노션 → webp 이미지 + seed.ts 로 구워둔다.
// seed 는 빌드에 포함된 정적 데이터라 캐시하지 않는다 — 캐시하면 배포 간에 복원되어
// 새 seed 가 화면에 안 나타난다(commit 4cda816).

// 공홈 비노출(블라인드) — 노션엔 남겨 내부용으로 쓰되 공개 사이트에서만 숨긴다.
// no 기준(노션 page 고정). 목록·공간뷰·상세·sitemap 전부에서 빠진다.
const BLIND_NOS = new Set<number>([
  20, // 거여동우방 43py
  17, // 대림강변타운 24py
  33, // 동작금강KCC 32py (아일랜드 옆 냉장고 현장)
]);

export async function getProjects(): Promise<Project[]> {
  return [...SEED_PROJECTS]
    .filter((p) => !BLIND_NOS.has(p.no))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProject(no: number): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.no === no) ?? null;
}
