import "server-only";
import type { Project } from "./types";
import { SEED_PROJECTS } from "./seed";

// 포트폴리오의 원본은 노션이지만 런타임에 노션을 조회하지는 않는다.
// scripts/notion-sync.mjs 가 배포 전에 노션 → webp 이미지 + seed.ts 로 구워둔다.
// seed 는 빌드에 포함된 정적 데이터라 캐시하지 않는다 — 캐시하면 배포 간에 복원되어
// 새 seed 가 화면에 안 나타난다(commit 4cda816).

export async function getProjects(): Promise<Project[]> {
  return [...SEED_PROJECTS].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProject(no: number): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.no === no) ?? null;
}
