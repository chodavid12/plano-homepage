// 이미 내려받은 public/portfolio/**.webp 의 실제 치수를 읽어 seed.ts 에 width/height 를 채운다.
// 네트워크를 타지 않으므로 빠르다. 이미지 원본 비율대로 보여주기 위한 1회성 보정용이며,
// 이후 새로 받는 이미지는 notion-sync.mjs 가 변환 시점에 치수를 기록한다.
//   실행: node scripts/add-dimensions.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEED = path.join(ROOT, "src", "lib", "seed.ts");

const raw = fs.readFileSync(SEED, "utf8");
const [header, body] = raw.split("export const SEED_PROJECTS: Project[] = ");
const projects = JSON.parse(body.trim().replace(/;\s*$/, ""));

let done = 0;
let missing = 0;
for (const p of projects) {
  for (const im of p.images) {
    if (im.width && im.height) continue;
    const file = path.join(ROOT, "public", im.imageUrl);
    if (!fs.existsSync(file)) {
      missing++;
      continue;
    }
    const { width, height } = await sharp(file).metadata();
    im.width = width;
    im.height = height;
    done++;
  }
}

fs.writeFileSync(
  SEED,
  header + "export const SEED_PROJECTS: Project[] = " + JSON.stringify(projects, null, 2) + ";\n",
  "utf8",
);

const all = projects.flatMap((p) => p.images);
const portrait = all.filter((im) => im.height > im.width).length;
console.log(`치수 기록 ${done}장 (파일 없음 ${missing})`);
console.log(`전체 ${all.length}장 · 세로 ${portrait}장 · 가로 ${all.length - portrait}장`);
