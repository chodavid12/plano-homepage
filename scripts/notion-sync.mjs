// 노션 포트폴리오 DB 전체 → 공간별 파싱 → 이미지 webp → seed.ts (생성일시 내림차순)
//   드라이런(다운로드 없이 정렬·개수만): node --env-file-if-exists=.env.local scripts/notion-sync.mjs --dry
//   실제 동기화:                        node --env-file-if-exists=.env.local scripts/notion-sync.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { Client } from "@notionhq/client";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "portfolio");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PF = "1f5b42808b5880b984c1e85f8c71317a";
const MAXW = 1600, Q = 72;
// 공간별 상한 — 대표(갤러리/커버) 넉넉히, 나머지 공간 6장 → 총량 억제 + 공간 다양성 유지
const ROOM_CAP = (r) => (r === "대표" ? 12 : 6);
const DRY = process.argv.includes("--dry");

const ROOMS = ["대표", "거실", "주방", "현관", "욕실", "침실", "드레스룸", "발코니", "서재", "복도", "기타"];
const btext = (b) => { const v = b[b.type]; return (v?.rich_text?.map((r) => r.plain_text).join("") || "").trim(); };
const norm = (t) => { const s = t.replace(/\s/g, ""); for (const r of ROOMS) if (s === r || s.includes(r)) return r; return null; };
const marker = (b) => { const t = btext(b); if (!t) return null; if (b.type.startsWith("heading")) return norm(t); if (b.type === "paragraph" && t.length <= 8) return norm(t); return null; };
const titleOf = (pg) => { const t = Object.values(pg.properties).find((x) => x.type === "title"); return (t?.title || []).map((x) => x.plain_text).join("").trim(); };

// 생성일시 속성 찾기 (Created time / Date), 없으면 page.created_time
function createdAt(pg) {
  for (const [name, p] of Object.entries(pg.properties)) {
    if (!/생성일시|생성일|생성 ?시간|created/i.test(name)) continue;
    if (p.type === "created_time") return p.created_time;
    if (p.type === "date") return p.date?.start;
    if (p.type === "last_edited_time") return p.last_edited_time;
  }
  return pg.created_time;
}

function sizeFromTitle(title) {
  const m = title.match(/(\d+(?:\.\d+)?)\s*평형?/);
  if (!m) return { sizeCategory: "30PY" };
  const n = parseFloat(m[1]);
  const cat = n < 20 ? "10PY" : n < 30 ? "20PY" : n < 40 ? "30PY" : n < 50 ? "40PY" : "50PY~";
  return { sizeCategory: cat, areaSupply: `${m[1]}평형` };
}

async function queryAll() {
  const rows = []; let cur;
  do { const q = await notion.databases.query({ database_id: PF, start_cursor: cur, page_size: 100 }); rows.push(...q.results); cur = q.has_more ? q.next_cursor : undefined; } while (cur);
  return rows;
}
async function blocksOf(id) {
  const all = []; let cur;
  do { const b = await notion.blocks.children.list({ block_id: id, start_cursor: cur, page_size: 100 }); all.push(...b.results); cur = b.has_more ? b.next_cursor : undefined; } while (cur);
  return all;
}
// 순서대로 (room,url), 공간별 상한 적용
function collect(blocks) {
  const out = []; const cnt = {}; let room = "대표";
  for (const b of blocks) {
    const m = marker(b);
    if (m) { room = m; continue; }
    if (b.type !== "image") continue;
    const u = b.image?.file?.url || b.image?.external?.url;
    if (!u) continue;
    cnt[room] = cnt[room] || 0;
    if (cnt[room] >= ROOM_CAP(room)) continue;
    cnt[room]++;
    out.push({ room, url: u });
  }
  return out;
}

async function main() {
  let rows = await queryAll();
  rows = rows
    .map((pg) => ({ pg, title: titleOf(pg), created: createdAt(pg) }))
    .filter((r) => r.title)
    .sort((a, b) => new Date(b.created) - new Date(a.created)); // 생성일시 내림차순
  console.log(`포트폴리오 DB ${rows.length}행 (생성일시 내림차순)\n`);

  if (!DRY) {
    // 기존 p* 정리 (시드 r1~r3 보존)
    if (fs.existsSync(OUT)) for (const d of fs.readdirSync(OUT)) if (/^p\d+$/.test(d)) fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
  }

  const projects = [];
  let no = 0;
  for (const { pg, title, created } of rows) {
    const seq = collect(await blocksOf(pg.id));
    if (seq.length === 0) { console.log(`skip(0장)  ${title.slice(0, 40)}`); continue; }
    no += 1;
    const rooms = [...new Set(seq.map((s) => s.room))].join(",");
    console.log(`p${no}  ${String(created).slice(0, 10)}  ${seq.length}장 [${rooms}]  ${title.slice(0, 38)}`);
    if (DRY) continue;

    const dir = path.join(OUT, `p${no}`);
    fs.mkdirSync(dir, { recursive: true });
    const images = [];
    for (let i = 0; i < seq.length; i++) {
      const name = String(i + 1).padStart(2, "0") + ".webp";
      try {
        const res = await fetch(seq[i].url);
        if (!res.ok) continue;
        await sharp(Buffer.from(await res.arrayBuffer())).rotate().resize({ width: MAXW, withoutEnlargement: true }).webp({ quality: Q }).toFile(path.join(dir, name));
        images.push({ id: `${no}-${i + 1}`, room: seq[i].room, imageUrl: `/portfolio/p${no}/${name}`, sortOrder: i });
      } catch { /* skip */ }
    }
    if (!images.length) { fs.rmSync(dir, { recursive: true, force: true }); no -= 1; continue; }
    projects.push({
      no,
      notionPageId: pg.id,
      title,
      apartment: title,
      ...sizeFromTitle(title),
      coverUrl: images[0].imageUrl,
      sortOrder: no, // 생성일시 내림차순 = no 오름차순
      images,
    });
  }

  if (DRY) { console.log(`\n[DRY] ${no}개 현장. 실제 동기화하려면 --dry 없이 실행.`); return; }

  const header = `import type { Project } from "./types";\n\n// ⚠️ AUTO-GENERATED — scripts/notion-sync.mjs (노션 포트폴리오 DB, 생성일시 내림차순). 직접 수정 금지.\n\nexport const SEED_PROJECTS: Project[] = `;
  fs.writeFileSync(path.join(ROOT, "src", "lib", "seed.ts"), header + JSON.stringify(projects, null, 2) + ";\n", "utf8");
  console.log(`\n✓ ${projects.length}개 현장 → public/portfolio/, src/lib/seed.ts (생성일시 내림차순)`);
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
