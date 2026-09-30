// 노션 포트폴리오 DB 전체 → 공간별 파싱 → 이미지 webp → seed.ts (생성일시 내림차순)
//   드라이런(다운로드 없이 정렬·개수만): node --env-file-if-exists=.env.local scripts/notion-sync.mjs --dry
//   실제 동기화:                        node --env-file-if-exists=.env.local scripts/notion-sync.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { Client } from "@notionhq/client";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "portfolio");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PF = "1f5b42808b5880b984c1e85f8c71317a";
const MAXW = 1600, Q = 72;
// 공간별 상한. 대표컷은:
//  - 방 헤딩이 있는(조직화된) 현장 → 카드 커버·호버 2장만 쓰이므로 3장이면 충분
//  - 평면 현장(대표만) → 대표가 곧 갤러리 전체 → 12장
// 그 외 공간은 6장.
const roomCap = (r, hasRooms) => (r === "대표" ? (hasRooms ? 3 : 12) : 6);
const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force"); // 증분 무시하고 전체 재다운로드
const YES = process.argv.includes("--yes"); // 대량 비공개 안전장치 통과
// 공개 여부 = 노션 '공홈 업로드' 체크박스. 해제하면 다음 동기화 때 사이트·이미지에서 빠진다.
const PUBLISH_PROP = "공홈 업로드";
const MAX_REMOVE = 5; // 한 번에 이보다 많이 빠지면 --yes 없이는 중단 (체크 실수 방지)
// pageId → no 영구 기록. 비공개로 seed 에서 빠졌다가 다시 체크돼도 같은 URL 로 복귀.
const NO_MAP = path.join(ROOT, "scripts", ".no-map.json");

const ROOMS = ["대표", "거실", "주방", "현관", "욕실", "침실", "드레스룸", "발코니", "서재", "복도", "기타"];

// 마감재 — 포트폴리오 DB의 rollup 5종. 값은 자재 DB '페이지 id' 라서 이름을 따로 조회해야 한다.
// 조회 결과는 캐시에 남겨 재동기화 때 다시 부르지 않는다(자재는 현장 간 공유됨).
const MATERIALS = ["마루", "타일", "도배", "필름", "가구재"];
const MAT_CACHE = path.join(ROOT, "scripts", ".materials-cache.json");

function loadMatCache() {
  try { return JSON.parse(fs.readFileSync(MAT_CACHE, "utf8")); } catch { return {}; }
}
// 자재 페이지의 제목 속성(이름/제품명 등 DB마다 다름)을 뽑는다
function matTitle(pg) {
  const t = Object.values(pg.properties).find((x) => x.type === "title");
  return (t?.title || []).map((x) => x.plain_text).join("").trim();
}
// 포트폴리오 행 → { 마루: [자재 페이지 id, ...], ... }
function materialIds(pg) {
  const out = {};
  for (const m of MATERIALS) {
    const arr = pg.properties[m]?.rollup?.array || [];
    const ids = arr.flatMap((a) => (a.type === "relation" ? a.relation.map((r) => r.id) : []));
    if (ids.length) out[m] = ids;
  }
  return out;
}
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
  const m = title.match(/(\d+(?:\.\d+)?)\s*(?:평형|평|py)/i);
  if (!m) return { sizeCategory: "30PY" };
  const n = parseFloat(m[1]);
  const cat = n < 20 ? "10PY" : n < 30 ? "20PY" : n < 40 ? "30PY" : n < 50 ? "40PY" : "50PY~";
  return { sizeCategory: cat, areaSupply: `${m[1]}py` };
}

// 동시 실행 제한 풀 — 이미지 다운로드/변환은 I/O 대기가 대부분이라 병렬이 크게 빠름
const CONCURRENCY = 10;
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (let i = cursor++; i < items.length; i = cursor++) {
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
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
  const hasRooms = blocks.some((b) => { const m = marker(b); return m && m !== "대표"; });
  const out = []; const cnt = {}; let room = "대표";
  for (const b of blocks) {
    const m = marker(b);
    if (m) { room = m; continue; }
    if (b.type !== "image") continue;
    const u = b.image?.file?.url || b.image?.external?.url;
    if (!u) continue;
    cnt[room] = cnt[room] || 0;
    if (cnt[room] >= roomCap(room, hasRooms)) continue;
    cnt[room]++;
    // key = 서명 쿼리를 뺀 파일 경로 — 업로드마다 고유하고 URL 재서명에도 안 바뀐다(사진 단위 증분 기준)
    const { host, pathname } = new URL(u);
    out.push({ room, url: u, key: host + pathname });
  }
  return out;
}

// 이전 seed 읽기 — no 고정(URL 안정) + 증분 판단용
function readPrevSeed() {
  const p = path.join(ROOT, "src", "lib", "seed.ts");
  if (!fs.existsSync(p)) return new Map();
  try {
    const body = fs.readFileSync(p, "utf8").split("export const SEED_PROJECTS: Project[] = ")[1];
    if (!body) return new Map();
    const arr = JSON.parse(body.trim().replace(/;\s*$/, ""));
    return new Map(arr.map((x) => [x.notionPageId, x]));
  } catch {
    return new Map();
  }
}

async function main() {
  const all = (await queryAll())
    .map((pg) => ({ pg, title: titleOf(pg), created: createdAt(pg) }))
    .filter((r) => r.title);
  const rows = all
    .filter((r) => r.pg.properties?.[PUBLISH_PROP]?.checkbox === true)
    .sort((a, b) => new Date(b.created) - new Date(a.created)); // 생성일시 내림차순 = 표시 순서
  const prev = readPrevSeed();
  const noMap = fs.existsSync(NO_MAP) ? JSON.parse(fs.readFileSync(NO_MAP, "utf8")) : {};
  for (const [id, p] of prev) if (p.no && !(id in noMap)) noMap[id] = p.no; // 기존 seed 번호 이관
  let maxNo = Math.max(0, ...Object.values(noMap));
  console.log(`포트폴리오 DB ${all.length}행 · 공개 체크 ${rows.length} · 비공개 ${all.length - rows.length} · 이전 seed ${prev.size}개${FORCE ? " (--force: 전체 재다운로드)" : ""}`);

  // 안전장치 — 사이트에서 빠질 현장이 많으면 목록만 보여주고 중단
  const pub = new Set(rows.map((r) => r.pg.id));
  const removed = [...prev.values()].filter((p) => !pub.has(p.notionPageId));
  if (removed.length) console.log(`비공개 전환 ${removed.length}건: ${removed.map((p) => `p${p.no} ${p.title}`).join(" · ")}`);
  if (removed.length > MAX_REMOVE && !YES && !DRY) {
    console.log(`✗ ${removed.length}건이 한꺼번에 사이트에서 빠집니다 — 의도한 것이면 --yes 로 다시 실행.`);
    process.exit(2);
  }

  // ── 마감재 이름 해석 (캐시에 없는 자재만 조회) ──────────────────────
  const matCache = loadMatCache();
  const needed = new Set();
  for (const { pg } of rows) {
    for (const ids of Object.values(materialIds(pg))) {
      for (const id of ids) if (!matCache[id]) needed.add(id);
    }
  }
  if (needed.size) {
    const list = [...needed];
    const found = await mapLimit(list, CONCURRENCY, async (id) => {
      try { return matTitle(await notion.pages.retrieve({ page_id: id })); } catch { return ""; }
    });
    list.forEach((id, i) => { matCache[id] = found[i]; });
    if (!DRY) fs.writeFileSync(MAT_CACHE, JSON.stringify(matCache, null, 0), "utf8");
  }
  const matCount = Object.values(matCache).filter(Boolean).length;
  console.log(`마감재 자재 ${matCount}종 (신규 조회 ${needed.size})\n`);

  // 포트폴리오 행 → { 마루: ["올고다마루 | 아르망 화이트", ...], ... }
  const materialsOf = (pg) => {
    const out = {};
    for (const [cat, ids] of Object.entries(materialIds(pg))) {
      const names = [...new Set(ids.map((id) => matCache[id]).filter(Boolean))];
      if (names.length) out[cat] = names;
    }
    return Object.keys(out).length ? out : undefined;
  };

  const projects = [];
  let reused = 0;
  let fetched = 0;
  let downloaded = 0; // 실제로 받은 사진 장수
  let migrated = 0; // 사진 키를 새로 붙인 옛 현장 수(1회성)

  for (const { pg, title, created } of rows) {
    const old = prev.get(pg.id);
    const lastEdited = pg.last_edited_time;
    // no 는 노션 page 에 고정 — 재동기화해도 URL 안 바뀜
    const no = noMap[pg.id] ?? maxNo + 1;
    const dir = path.join(OUT, `p${no}`);

    // 증분 — 노션에서 수정 안 됐고 이미지가 그대로면 통째로 재사용 (다운로드 0)
    if (!FORCE && old?.notionLastEditedAt === lastEdited && old.images?.length && fs.existsSync(dir)) {
      // 이미지는 재사용하되 마감재는 매번 갱신 — 자재 수정은 이미지 재다운로드가 필요 없다
      let images = old.images;
      // 1회 이관 — 사진 키가 없는 옛 seed 면 블록 목록만 조회해 순서(sortOrder)대로 키를 붙인다(다운로드 없음)
      if (images.some((im) => !im.key)) {
        const seqOld = collect(await blocksOf(pg.id));
        images = images.map((im) => ({ ...im, key: im.key ?? seqOld[im.sortOrder]?.key }));
        migrated++;
      }
      projects.push({ ...old, images, materials: materialsOf(pg), sortOrder: projects.length });
      reused++;
      continue;
    }

    const seq = collect(await blocksOf(pg.id));
    if (seq.length === 0) { console.log(`skip(0장)  ${title.slice(0, 40)}`); continue; }
    if (!(pg.id in noMap)) { noMap[pg.id] = no; maxNo = no; } // 신규 현장 번호 확정
    const rooms = [...new Set(seq.map((s) => s.room))].join(",");
    console.log(`p${no}  ${String(created).slice(0, 10)}  ${seq.length}장 [${rooms}]  ${title.slice(0, 38)}`);
    if (DRY) continue;

    fs.mkdirSync(dir, { recursive: true });
    // 사진 단위 증분 — 페이지가 바뀌어도(체크박스·제목 수정 등) 같은 사진(key)은 기존 webp 를 재사용하고
    // 새로 추가·교체된 사진만 받는다. 파일명은 key 해시라 순서가 바뀌어도 재다운로드 없음.
    const have = new Map();
    if (!FORCE) {
      for (const im of old?.images ?? []) {
        if (im.key && fs.existsSync(path.join(ROOT, "public", im.imageUrl))) have.set(im.key, im);
      }
    }
    const urlOf = new Map(seq.map((s) => [s.key, s.url]));
    const need = [...urlOf.keys()].filter((k) => !have.has(k));
    const got = new Map();
    // 다운로드+변환을 동시 실행 (I/O 대기 병렬화 → 순차 대비 ~10배)
    await mapLimit(need, CONCURRENCY, async (k) => {
      const name = createHash("sha1").update(k).digest("hex").slice(0, 12) + ".webp";
      try {
        const res = await fetch(urlOf.get(k), { signal: AbortSignal.timeout(20000) });
        if (!res.ok) return;
        // 변환 결과의 실제 치수를 기록 — 갤러리에서 원본 비율대로 보여주기 위함(세로컷 잘림 방지)
        const info = await sharp(Buffer.from(await res.arrayBuffer()))
          .rotate()
          .resize({ width: MAXW, withoutEnlargement: true })
          .webp({ quality: Q })
          .toFile(path.join(dir, name));
        got.set(k, { imageUrl: `/portfolio/p${no}/${name}`, width: info.width, height: info.height });
      } catch {
        // 실패분은 건너뜀
      }
    });
    downloaded += got.size;
    const images = seq
      .map((s, i) => {
        const src = have.get(s.key) ?? got.get(s.key);
        return src && { id: `${no}-${i + 1}`, key: s.key, room: s.room, imageUrl: src.imageUrl, width: src.width, height: src.height, sortOrder: i };
      })
      .filter(Boolean);
    // 페이지에서 빠진 사진 파일 정리
    const used = new Set(images.map((im) => path.basename(im.imageUrl)));
    for (const f of fs.readdirSync(dir)) if (!used.has(f)) fs.rmSync(path.join(dir, f), { force: true });
    if (!images.length) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
    fetched++;
    projects.push({
      no,
      notionPageId: pg.id,
      notionLastEditedAt: lastEdited,
      title,
      apartment: title,
      ...sizeFromTitle(title),
      materials: materialsOf(pg),
      coverUrl: images[0].imageUrl,
      sortOrder: projects.length, // 생성일시 내림차순 표시 순서 (no 와 분리)
      images,
    });
  }

  if (DRY) { console.log(`\n[DRY] 재사용 ${reused} · 변경 현장 ${rows.length - reused}개 (새 사진만 받음).`); return; }

  fs.writeFileSync(NO_MAP, JSON.stringify(noMap, null, 0), "utf8");

  // 노션에서 사라졌거나 비공개 전환된 현장 디렉토리 정리 (이미지 직접 URL 노출도 차단)
  const keep = new Set(projects.map((p) => `p${p.no}`));
  let pruned = 0;
  if (fs.existsSync(OUT)) {
    for (const d of fs.readdirSync(OUT)) {
      if (/^p\d+$/.test(d) && !keep.has(d)) {
        fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
        pruned++;
      }
    }
  }

  const header = `import type { Project } from "./types";\n\n// ⚠️ AUTO-GENERATED — scripts/notion-sync.mjs (노션 포트폴리오 DB). 직접 수정 금지.\n// no = 노션 page 고정 id(URL 안정) · sortOrder = 생성일시 내림차순 표시순서\n\nexport const SEED_PROJECTS: Project[] = `;
  fs.writeFileSync(path.join(ROOT, "src", "lib", "seed.ts"), header + JSON.stringify(projects, null, 2) + ";\n", "utf8");
  console.log(`\n✓ ${projects.length}개 현장 (재사용 ${reused} · 갱신 ${fetched} · 정리 ${pruned}) · 사진 다운로드 ${downloaded}장${migrated ? ` · 키 이관 ${migrated}` : ""} → src/lib/seed.ts`);
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
