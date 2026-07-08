// 공간별 파서 검증 — 노션 페이지 본문(헤딩→이미지)을 공간(거실/주방/…)별로 그룹화
//   실행: node --env-file-if-exists=.env.local scripts/notion-rooms.mjs
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// 공간 표준 세트 (필요시 여기만 수정)
export const ROOMS = [
  "거실", "주방", "현관", "욕실", "침실", "드레스룸", "발코니", "서재", "복도", "기타",
];

const blockText = (blk) => {
  const v = blk[blk.type];
  return (v?.rich_text?.map((r) => r.plain_text).join("") || "").trim();
};

// 방 이름 정규화 — 표준 세트와 매칭되면 그 이름, 아니면 null(마커 아님)
function normalizeRoom(text) {
  const s = text.replace(/\s/g, "");
  for (const r of ROOMS) if (s === r || s.includes(r)) return r;
  return null;
}

// 헤딩이거나, 짧은 단독 텍스트가 방 이름이면 '공간 마커'로 인식
function roomMarker(blk) {
  const t = blockText(blk);
  if (!t) return null;
  if (blk.type.startsWith("heading")) return normalizeRoom(t);
  if (blk.type === "paragraph" && t.length <= 8) return normalizeRoom(t);
  return null;
}

// 핵심: 블록을 순서대로 읽으며 '현재 공간' 기준으로 이미지를 그룹화
export function parseRooms(blocks) {
  const groups = new Map();
  let current = "대표"; // 첫 헤딩 이전 이미지 = 대표(커버)
  for (const blk of blocks) {
    const marker = roomMarker(blk);
    if (marker) {
      current = marker;
      if (!groups.has(current)) groups.set(current, []);
      continue;
    }
    if (blk.type === "image") {
      const url = blk.image?.file?.url || blk.image?.external?.url;
      if (!url) continue;
      if (!groups.has(current)) groups.set(current, []);
      groups.get(current).push(url);
    }
  }
  return groups;
}

async function fetchBlocks(pageId) {
  const all = [];
  let cursor;
  do {
    const b = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor, page_size: 100 });
    all.push(...b.results);
    cursor = b.has_more ? b.next_cursor : undefined;
  } while (cursor);
  return all;
}

const show = (label, groups) => {
  console.log(`\n${label}`);
  for (const [room, urls] of groups) console.log(`   ${room.padEnd(6)} : ${urls.length}장`);
};

async function main() {
  // (1) 실데이터 — 지금의 평면 페이지 (헤딩 없음 → 전부 '대표')
  const PF = "1f5b42808b5880b984c1e85f8c71317a";
  const q = await notion.databases.query({ database_id: PF, page_size: 8 });
  const flat = q.results.find((p) => {
    const t = Object.values(p.properties).find((x) => x.type === "title");
    return (t?.title || []).map((x) => x.plain_text).join("").includes("신공덕");
  }) || q.results[0];
  const blocks = await fetchBlocks(flat.id);
  show("① 실제 평면 페이지(신공덕, 헤딩 없음) 파싱 결과:", parseRooms(blocks));

  // (2) 헤딩이 있을 때 시뮬레이션 — 공간별로 갈리는지 증명
  const h = (name) => ({ type: "heading_3", heading_3: { rich_text: [{ plain_text: name }] } });
  const img = (i) => ({ type: "image", image: { file: { url: `https://x/${i}.jpg` } } });
  const mock = [
    img(0), img(1), // 헤딩 전 = 대표 2장
    h("거실"), img(2), img(3), img(4),
    h("주방"), img(5), img(6),
    h("현관"), img(7),
    h("욕실"), img(8), img(9),
  ];
  show("② 헤딩 구조 시뮬레이션 (대표2 / 거실3 / 주방2 / 현관1 / 욕실2) 파싱 결과:", parseRooms(mock));
}

main().catch((e) => console.error("✗", e.message));
