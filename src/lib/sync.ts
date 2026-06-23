import crypto from "node:crypto";
import sharp from "sharp";
import { fetchPublishedProjects } from "./notion";
import { getServiceClient, SUPABASE_BUCKET } from "./supabase";
import type { Project } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SyncResult {
  ok: boolean;
  skipped?: string;
  projects: number;
  images: number;
  uploaded: number;
  reused: number;
  pruned: number;
}

interface ExistingImage {
  image_url: string;
  storage_path: string;
}

async function cacheImage(
  sb: any,
  notionPageId: string,
  sourceId: string,
  notionUrl: string,
  reuse: Map<string, ExistingImage>,
  force: boolean,
  counters: { uploaded: number; reused: number },
): Promise<ExistingImage | null> {
  if (!force) {
    const existing = reuse.get(sourceId);
    if (existing) {
      counters.reused++;
      return existing;
    }
  }
  if (!notionUrl) return null;

  // Notion 임시 URL → 다운로드 → webp 변환 → Supabase Storage 업로드(안정 URL)
  const res = await fetch(notionUrl);
  if (!res.ok) return null;
  const input = Buffer.from(await res.arrayBuffer());
  const webp = await sharp(input).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const hash = crypto.createHash("sha1").update(webp).digest("hex").slice(0, 16);
  const path = `projects/${notionPageId}/${hash}.webp`;

  const { error } = await sb.storage.from(SUPABASE_BUCKET).upload(path, webp, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) throw error;

  const { data: pub } = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  counters.uploaded++;
  return { image_url: pub.publicUrl, storage_path: path };
}

/**
 * Notion(노출 ✓ 행) → Supabase 동기화.
 * - 이미지는 Supabase Storage로 캐싱(만료 없는 URL)
 * - source_id 기준 재사용으로 변경분만 업로드(증분), force=true 시 전체 재업로드
 */
export async function runSync(opts: { force?: boolean } = {}): Promise<SyncResult> {
  const sb = getServiceClient();
  if (!sb) {
    return { ok: false, skipped: "Supabase service role 미설정", projects: 0, images: 0, uploaded: 0, reused: 0, pruned: 0 };
  }

  let projects: Project[];
  try {
    projects = await fetchPublishedProjects();
  } catch (e) {
    return { ok: false, skipped: `Notion 조회 실패: ${(e as Error).message}`, projects: 0, images: 0, uploaded: 0, reused: 0, pruned: 0 };
  }
  if (projects.length === 0) {
    return { ok: false, skipped: "Notion 미설정 또는 노출된 프로젝트 없음", projects: 0, images: 0, uploaded: 0, reused: 0, pruned: 0 };
  }

  // 기존 이미지(source_id → url) 재사용 맵
  const reuse = new Map<string, ExistingImage>();
  const { data: existingImgs } = await sb.from("project_images").select("source_id, image_url, storage_path");
  for (const im of existingImgs || []) {
    if (im.source_id) reuse.set(im.source_id, { image_url: im.image_url, storage_path: im.storage_path });
  }

  const counters = { uploaded: 0, reused: 0 };
  let imageCount = 0;
  const keptPageIds: string[] = [];

  for (const p of projects) {
    const coverSource = `${p.notionPageId}-cover`;
    const cover = await cacheImage(sb, p.notionPageId, coverSource, p.coverUrl, reuse, !!opts.force, counters);

    const { data: projRow, error: upErr } = await sb
      .from("projects")
      .upsert(
        {
          notion_page_id: p.notionPageId,
          no: p.no,
          title: p.title,
          subtitle: p.subtitle ?? null,
          apartment: p.apartment ?? null,
          size_category: p.sizeCategory,
          type: p.type ?? null,
          area_supply: p.areaSupply ?? null,
          area_exclusive: p.areaExclusive ?? null,
          completion_year: p.completionYear ?? null,
          region: p.region ?? null,
          period: p.period ?? null,
          cover_url: cover?.image_url ?? p.coverUrl,
          sort_order: p.sortOrder,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "notion_page_id" },
      )
      .select("id")
      .single();
    if (upErr || !projRow) throw upErr || new Error("project upsert 실패");

    keptPageIds.push(p.notionPageId);

    // 이미지 재구성 (delete-and-replace, URL은 재사용)
    const rows: any[] = [];
    for (const im of p.images) {
      const cached = await cacheImage(sb, p.notionPageId, im.id, im.imageUrl, reuse, !!opts.force, counters);
      if (!cached) continue;
      rows.push({
        project_id: projRow.id,
        room: im.room,
        image_url: cached.image_url,
        storage_path: cached.storage_path,
        sort_order: im.sortOrder,
        source_id: im.id,
      });
      imageCount++;
    }
    await sb.from("project_images").delete().eq("project_id", projRow.id);
    if (rows.length) await sb.from("project_images").insert(rows);
  }

  // 노출 해제/삭제된 프로젝트 정리
  let pruned = 0;
  const { data: allRows } = await sb.from("projects").select("notion_page_id");
  const toDelete = (allRows || [])
    .map((r: any) => r.notion_page_id)
    .filter((id: string) => !keptPageIds.includes(id));
  if (toDelete.length) {
    await sb.from("projects").delete().in("notion_page_id", toDelete);
    pruned = toDelete.length;
  }

  return {
    ok: true,
    projects: projects.length,
    images: imageCount,
    uploaded: counters.uploaded,
    reused: counters.reused,
    pruned,
  };
}
