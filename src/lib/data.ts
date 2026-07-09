import "server-only";
import { unstable_cache } from "next/cache";
import type { Project, ProjectImage } from "./types";
import { SEED_PROJECTS } from "./seed";
import { getReadClient, isSupabaseConfigured } from "./supabase";
import { roomRank } from "./rooms";

const SOURCE = process.env.DATA_SOURCE || "auto";

function useSupabase(): boolean {
  if (SOURCE === "seed") return false;
  if (SOURCE === "supabase") return true;
  return isSupabaseConfigured(); // auto
}

// Supabase row → 도메인 타입 매핑
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProject(row: any, images: any[]): Project {
  return {
    no: row.no,
    notionPageId: row.notion_page_id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    apartment: row.apartment ?? undefined,
    sizeCategory: row.size_category,
    type: row.type ?? undefined,
    areaSupply: row.area_supply ?? undefined,
    areaExclusive: row.area_exclusive ?? undefined,
    completionYear: row.completion_year ?? undefined,
    region: row.region ?? undefined,
    period: row.period ?? undefined,
    coverUrl: row.cover_url,
    sortOrder: row.sort_order ?? 0,
    images: (images || [])
      .map(
        (im): ProjectImage => ({
          id: im.id,
          room: im.room,
          imageUrl: im.image_url,
          sortOrder: im.sort_order ?? 0,
        }),
      )
      .sort((a, b) => roomRank(a.room) - roomRank(b.room) || a.sortOrder - b.sortOrder),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fromSupabase(): Promise<Project[] | null> {
  const sb = getReadClient();
  if (!sb) return null;
  const { data: projects, error } = await sb
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !projects) return null;
  const { data: images } = await sb.from("project_images").select("*");
  const byProject = new Map<string, any[]>();
  for (const im of images || []) {
    const arr = byProject.get(im.project_id) || [];
    arr.push(im);
    byProject.set(im.project_id, arr);
  }
  return projects.map((p: any) => mapProject(p, byProject.get(p.id) || []));
}

function seedSorted(): Project[] {
  return [...SEED_PROJECTS].sort((a, b) => a.sortOrder - b.sortOrder);
}

// Supabase 조회만 캐싱('portfolio' 태그 → revalidateTag로 갱신).
// seed 는 빌드에 구워진 정적 데이터라 캐시하지 않는다 —
// unstable_cache 결과가 배포 간에 복원되어 새 seed가 안 보이는 문제 방지.
const getSupabaseCached = unstable_cache(
  async (): Promise<Project[] | null> => fromSupabase(),
  ["projects-supabase"],
  { tags: ["portfolio"], revalidate: 1800 },
);

export async function getProjects(): Promise<Project[]> {
  if (useSupabase()) {
    const rows = await getSupabaseCached();
    if (rows && rows.length) return rows;
  }
  return seedSorted();
}

export async function getProject(no: number): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.no === no) ?? null;
}

/** 데이터 소스 표시(개발용 배지/로그) */
export function dataSourceLabel(): "supabase" | "seed" {
  return useSupabase() && isSupabaseConfigured() ? "supabase" : "seed";
}
