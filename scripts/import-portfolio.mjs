// 실제 포트폴리오 사진 임포트 → webp 최적화 + seed.ts 생성
//   사용: node scripts/import-portfolio.mjs
//   입력: ./포트폴리오/<번호. 아파트명 [평형]>/(사진들 | 메인컷/디테일컷 등 하위폴더)
//   출력: public/portfolio/p<no>/01.webp ... + src/lib/seed.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "포트폴리오");
const OUT_DIR = path.join(ROOT, "public", "portfolio");

const MAX_PER_PROJECT = 12; // 프로젝트당 최대 사진 수 (커버 포함)
const MAX_WIDTH = 1600;
const QUALITY = 72;
const IMG_RE = /\.(jpe?g|png)$/i;

const natSort = (a, b) =>
  a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });

// "6. 동작금강KCC 106동 32평형" → { no, apartment, areaSupply, sizeCategory }
function parseFolder(name) {
  const m = name.match(/^(\d+)\.\s*(.+)$/);
  if (!m) return null;
  const no = Number(m[1]);
  let rest = m[2].trim();
  let areaSupply;
  const pm = rest.match(/^(.*?)[\s]*(\d+(?:\.\d+)?)\s*평형$/);
  if (pm) {
    rest = pm[1].trim();
    areaSupply = `${pm[2]}평형`;
  }
  return { no, apartment: rest, areaSupply, sizeCategory: sizeCat(areaSupply) };
}

function sizeCat(areaSupply) {
  if (!areaSupply) return "30PY"; // 평형 미상 기본값
  const n = parseFloat(areaSupply);
  if (n < 20) return "10PY";
  if (n < 30) return "20PY";
  if (n < 40) return "30PY";
  if (n < 50) return "40PY";
  return "50PY~";
}

// 프로젝트 폴더에서 사진 경로 수집 (메인컷 → 디테일컷 → 나머지 우선)
function collectImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const subdirs = entries.filter((e) => e.isDirectory());
  if (subdirs.length === 0) {
    return entries
      .filter((e) => e.isFile() && IMG_RE.test(e.name))
      .map((e) => path.join(dir, e.name))
      .sort(natSort);
  }
  // 하위폴더가 있으면: 메인컷 우선, 디테일컷 다음, 그 외(보정본 등)는 메인/디테일 없을 때만
  const pick = (re) => subdirs.filter((d) => re.test(d.name)).map((d) => d.name);
  const main = pick(/메인/);
  const detail = pick(/디테일/);
  let ordered;
  if (main.length || detail.length) ordered = [...main, ...detail];
  else ordered = subdirs.map((d) => d.name).sort(natSort);
  const files = [];
  for (const sub of ordered) {
    const p = path.join(dir, sub);
    for (const f of fs.readdirSync(p).filter((n) => IMG_RE.test(n)).sort(natSort)) {
      files.push(path.join(p, f));
    }
  }
  return files;
}

async function run() {
  if (!fs.existsSync(SRC)) {
    console.error("입력 폴더 없음:", SRC);
    process.exit(1);
  }
  // --clean 플래그 시에만 기존 p* 출력 정리 (시드 r1~r3.webp는 보존)
  if (process.argv.includes("--clean") && fs.existsSync(OUT_DIR)) {
    for (const d of fs.readdirSync(OUT_DIR)) {
      if (/^p\d+$/.test(d)) fs.rmSync(path.join(OUT_DIR, d), { recursive: true, force: true });
    }
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const folders = fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const projects = [];
  let totalImgs = 0;

  for (const folder of folders) {
    // macOS 파일명은 NFD(분해형) → NFC로 정규화해야 "평형" 등 한글 매칭됨
    const meta = parseFolder(folder.normalize("NFC"));
    if (!meta) {
      console.warn("폴더명 파싱 실패, 건너뜀:", folder);
      continue;
    }
    const srcImgs = collectImages(path.join(SRC, folder)).slice(0, MAX_PER_PROJECT);
    if (srcImgs.length === 0) {
      console.warn("사진 없음, 건너뜀:", folder);
      continue;
    }
    const outSub = path.join(OUT_DIR, `p${meta.no}`);
    fs.mkdirSync(outSub, { recursive: true });

    const images = [];
    let idx = 0;
    for (const src of srcImgs) {
      idx += 1;
      const name = String(idx).padStart(2, "0") + ".webp";
      const dest = path.join(outSub, name);
      try {
        if (!fs.existsSync(dest)) {
          await sharp(src)
            .rotate() // EXIF 회전 반영
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toFile(dest);
        }
      } catch (err) {
        console.warn("  변환 실패:", src, err.message);
        idx -= 1;
        continue;
      }
      images.push({
        id: `${meta.no}-${idx}`,
        room: "",
        imageUrl: `/portfolio/p${meta.no}/${name}`,
        sortOrder: idx - 1,
      });
    }
    if (images.length === 0) continue;
    totalImgs += images.length;

    projects.push({
      no: meta.no,
      notionPageId: `local-${meta.no}`,
      title: meta.apartment,
      apartment: meta.apartment,
      sizeCategory: meta.sizeCategory,
      ...(meta.areaSupply ? { areaSupply: meta.areaSupply } : {}),
      coverUrl: images[0].imageUrl,
      sortOrder: meta.no,
      images,
    });
    console.log(`✓ p${meta.no} ${meta.apartment}${meta.areaSupply ? " " + meta.areaSupply : ""} — ${images.length}장`);
  }

  projects.sort((a, b) => a.sortOrder - b.sortOrder);

  const header = `import type { Project } from "./types";

// ⚠️ AUTO-GENERATED — scripts/import-portfolio.mjs 로 생성됨. 직접 수정하지 말 것.
// 실제 포트폴리오 현장 사진(./포트폴리오/) 임포트 결과.

export const SEED_PROJECTS: Project[] = `;
  const body = JSON.stringify(projects, null, 2);
  fs.writeFileSync(path.join(ROOT, "src", "lib", "seed.ts"), header + body + ";\n", "utf8");

  console.log(`\n완료: ${projects.length}개 프로젝트 / ${totalImgs}장 → public/portfolio/, src/lib/seed.ts`);
}

run();
