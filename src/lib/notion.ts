import { Client } from "@notionhq/client";
import type { ConsultInput, Project, SizeCategory } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const token = process.env.NOTION_TOKEN;

export function getNotion(): Client | null {
  if (!token) return null;
  return new Client({ auth: token });
}

// Notion 속성명 (팀 DB와 일치, 환경변수로 재정의 가능). 후보 중 먼저 존재하는 것을 사용.
const PORTFOLIO_PROPS = {
  no: ["No", "넘버", "번호"],
  title: ["제목", "Title", "Name", "이름"],
  subtitle: ["부제", "서브타이틀", "Subtitle"],
  apartment: ["아파트", "단지", "건물"],
  size: ["평형구분", "평형", "Size"],
  type: ["유형", "Type"],
  areaSupply: ["면적-공급", "공급면적", "면적_공급"],
  areaExclusive: ["면적-전용", "전용면적", "면적_전용"],
  year: ["준공연도", "준공", "Year"],
  region: ["지역", "Region", "위치"],
  period: ["기간", "Period"],
  cover: ["대표이미지", "커버", "Cover"],
  show: ["홈페이지 노출", "홈페이지노출", "노출", "Published"],
  order: ["노출순서", "정렬", "Order"],
};

const IMAGE_PROPS = {
  project: ["프로젝트", "Project", "포트폴리오"],
  room: ["공간", "Room", "구역"],
  image: ["이미지", "사진", "Image"],
  order: ["순서", "정렬", "Order"],
};

function prop(page: any, names: string[]): any {
  const props = page.properties || {};
  for (const n of names) {
    if (props[n] !== undefined) return props[n];
  }
  return undefined;
}

function readText(p: any): string | undefined {
  if (!p) return undefined;
  if (p.type === "title") return p.title?.map((t: any) => t.plain_text).join("") || undefined;
  if (p.type === "rich_text") return p.rich_text?.map((t: any) => t.plain_text).join("") || undefined;
  if (p.type === "select") return p.select?.name || undefined;
  if (p.type === "multi_select") return p.multi_select?.map((s: any) => s.name).join(", ") || undefined;
  if (p.type === "number") return p.number != null ? String(p.number) : undefined;
  return undefined;
}

function readNumber(p: any): number | undefined {
  if (!p) return undefined;
  if (p.type === "number") return p.number ?? undefined;
  const t = readText(p);
  const n = t ? Number(t.replace(/[^\d.]/g, "")) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function readCheckbox(p: any): boolean {
  return Boolean(p && p.type === "checkbox" && p.checkbox);
}

function fileUrls(p: any): string[] {
  if (!p || p.type !== "files") return [];
  return (p.files || [])
    .map((f: any) => (f.type === "external" ? f.external?.url : f.file?.url))
    .filter(Boolean);
}

function normalizeSize(raw?: string): SizeCategory {
  const v = (raw || "").toUpperCase().replace(/\s/g, "");
  if (v.startsWith("10")) return "10PY";
  if (v.startsWith("20")) return "20PY";
  if (v.startsWith("30")) return "30PY";
  if (v.startsWith("40")) return "40PY";
  if (v.startsWith("50")) return "50PY~";
  return (["10PY", "20PY", "30PY", "40PY", "50PY~"].includes(raw as string)
    ? (raw as SizeCategory)
    : "30PY");
}

/**
 * 노출 체크된 포트폴리오만 조회. 이미지(원본 Notion URL 포함)는 동기화 시 Supabase로 캐싱한다.
 * 반환되는 imageUrl/coverUrl 은 Notion 임시 URL(만료 가능) — 사이트 직접 사용 금지, 동기화 전용.
 */
export async function fetchPublishedProjects(): Promise<Project[]> {
  const notion = getNotion();
  const dbId = process.env.NOTION_PORTFOLIO_DB_ID;
  if (!notion || !dbId) return [];

  const showProp = process.env.NOTION_SHOW_PROP || PORTFOLIO_PROPS.show[0];

  const pages: any[] = [];
  let cursor: string | undefined;
  do {
    const res: any = await notion.databases.query({
      database_id: dbId,
      filter: { property: showProp, checkbox: { equals: true } },
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  const imagesByPage = await fetchImagesByProject();

  return pages.map((page) => {
    const no = readNumber(prop(page, PORTFOLIO_PROPS.no)) ?? 0;
    const cover = fileUrls(prop(page, PORTFOLIO_PROPS.cover))[0] || "";
    return {
      no,
      notionPageId: page.id,
      title: readText(prop(page, PORTFOLIO_PROPS.title)) || `NO.${no}`,
      subtitle: readText(prop(page, PORTFOLIO_PROPS.subtitle)),
      apartment: readText(prop(page, PORTFOLIO_PROPS.apartment)),
      sizeCategory: normalizeSize(readText(prop(page, PORTFOLIO_PROPS.size))),
      type: readText(prop(page, PORTFOLIO_PROPS.type)),
      areaSupply: readText(prop(page, PORTFOLIO_PROPS.areaSupply)),
      areaExclusive: readText(prop(page, PORTFOLIO_PROPS.areaExclusive)),
      completionYear: readNumber(prop(page, PORTFOLIO_PROPS.year)),
      region: readText(prop(page, PORTFOLIO_PROPS.region)),
      period: readText(prop(page, PORTFOLIO_PROPS.period)),
      coverUrl: cover,
      sortOrder: readNumber(prop(page, PORTFOLIO_PROPS.order)) ?? no,
      images: imagesByPage.get(page.id) || [],
    };
  });
}

interface RawImage {
  id: string;
  room: string;
  imageUrl: string;
  sortOrder: number;
}

async function fetchImagesByProject(): Promise<Map<string, RawImage[]>> {
  const notion = getNotion();
  const dbId = process.env.NOTION_IMAGES_DB_ID;
  const map = new Map<string, RawImage[]>();
  if (!notion || !dbId) return map;

  let cursor: string | undefined;
  do {
    const res: any = await notion.databases.query({
      database_id: dbId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const row of res.results) {
      const rel = prop(row, IMAGE_PROPS.project);
      const projectId = rel?.relation?.[0]?.id;
      if (!projectId) continue;
      const room = readText(prop(row, IMAGE_PROPS.room)) || "기타";
      const order = readNumber(prop(row, IMAGE_PROPS.order)) ?? 0;
      const urls = fileUrls(prop(row, IMAGE_PROPS.image));
      urls.forEach((url: string, i: number) => {
        const arr = map.get(projectId) || [];
        arr.push({ id: `${row.id}-${i}`, room, imageUrl: url, sortOrder: order });
        map.set(projectId, arr);
      });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return map;
}

/** 상담 폼 → Notion 상담 응답 DB에 행 생성 */
export async function createConsultEntry(input: ConsultInput): Promise<void> {
  const notion = getNotion();
  const dbId = process.env.NOTION_CONSULT_DB_ID;
  if (!notion || !dbId) {
    // 미연동 환경: 콘솔 로깅으로 대체 (개발/프리뷰)
    console.info("[consult] Notion 미연동 — 접수 내용:", input);
    return;
  }

  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      이름: { title: [{ text: { content: input.name } }] },
      연락처: { rich_text: [{ text: { content: input.phone } }] },
      "희망 평형": input.sizeCategory
        ? { rich_text: [{ text: { content: input.sizeCategory } }] }
        : { rich_text: [] },
      지역: input.region ? { rich_text: [{ text: { content: input.region } }] } : { rich_text: [] },
      예산: input.budget ? { rich_text: [{ text: { content: input.budget } }] } : { rich_text: [] },
      문의내용: input.message
        ? { rich_text: [{ text: { content: input.message } }] }
        : { rich_text: [] },
    } as any,
  });
}
