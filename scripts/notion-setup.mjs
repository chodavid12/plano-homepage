// Notion Portfolio DB 자동 생성 + 42개 현장 행 백필
//   준비: 1) Notion 통합 토큰(NOTION_TOKEN)  2) 부모 페이지 ID(통합과 '연결'된 페이지)
//   실행: node --env-file-if-exists=.env.local scripts/notion-setup.mjs <부모페이지ID>
//        (또는 .env.local 에 NOTION_PARENT_PAGE_ID 지정)
//
//   결과: '홈페이지 노출' 체크박스 등 코드와 일치하는 속성의 DB가 생기고,
//         포트폴리오/ 폴더의 현장이 No·아파트·평형으로 미리 채워짐(노출=전부 OFF).
//         생성된 DB ID를 출력 → .env 의 NOTION_PORTFOLIO_DB_ID 에 넣으면 연결 완료.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@notionhq/client";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "포트폴리오");

const token = process.env.NOTION_TOKEN;
const parentPageId = process.argv[2] || process.env.NOTION_PARENT_PAGE_ID;

if (!token) {
  console.error("✗ NOTION_TOKEN 이 없습니다. .env.local 에 넣거나 환경변수로 전달하세요.");
  process.exit(1);
}
if (!parentPageId) {
  console.error("✗ 부모 페이지 ID 가 필요합니다. (통합을 '연결'한 Notion 페이지)");
  console.error("  사용: node --env-file-if-exists=.env.local scripts/notion-setup.mjs <부모페이지ID>");
  process.exit(1);
}

const notion = new Client({ auth: token });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 폴더명 파싱 — import-portfolio.mjs 와 동일 규칙 (macOS NFD → NFC 정규화 필수)
function parseFolder(rawName) {
  const name = rawName.normalize("NFC");
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
function sizeCat(area) {
  if (!area) return "30PY";
  const n = parseFloat(area);
  if (n < 20) return "10PY";
  if (n < 30) return "20PY";
  if (n < 40) return "30PY";
  if (n < 50) return "40PY";
  return "50PY~";
}

async function run() {
  // 1) DB 생성 — 속성명/타입은 src/lib/notion.ts 의 PORTFOLIO_PROPS 와 일치
  console.log("→ Portfolio DB 생성 중...");
  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: "PLANO Portfolio" } }],
    properties: {
      제목: { title: {} }, // Notion 필수 Title
      No: { number: { format: "number" } },
      아파트: { rich_text: {} },
      평형구분: {
        select: {
          options: ["10PY", "20PY", "30PY", "40PY", "50PY~"].map((n) => ({ name: n })),
        },
      },
      유형: {
        select: {
          options: ["아파트", "주상복합", "오피스텔", "단독주택", "상가"].map((n) => ({ name: n })),
        },
      },
      "면적-공급": { rich_text: {} },
      "면적-전용": { rich_text: {} },
      준공연도: { number: { format: "number" } },
      지역: { rich_text: {} },
      기간: { rich_text: {} },
      "홈페이지 노출": { checkbox: {} },
      노출순서: { number: { format: "number" } },
    },
  });
  const dbId = db.id;
  console.log(`✓ DB 생성됨: ${dbId}`);

  // 2) 폴더 → 현장 행 백필 (노출 전부 OFF, 메타는 폴더에서 파싱)
  let folders = [];
  if (fs.existsSync(SRC)) {
    folders = fs
      .readdirSync(SRC, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => parseFolder(e.name))
      .filter(Boolean)
      .sort((a, b) => a.no - b.no);
  }
  console.log(`→ ${folders.length}개 현장 행 생성 중 (노출=OFF 기본)...`);

  let created = 0;
  for (const f of folders) {
    const props = {
      제목: { title: [{ text: { content: f.apartment } }] },
      No: { number: f.no },
      아파트: { rich_text: [{ text: { content: f.apartment } }] },
      평형구분: { select: { name: f.sizeCategory } },
      "홈페이지 노출": { checkbox: false },
      노출순서: { number: f.no },
    };
    if (f.areaSupply) props["면적-공급"] = { rich_text: [{ text: { content: f.areaSupply } }] };
    try {
      await notion.pages.create({ parent: { database_id: dbId }, properties: props });
      created++;
    } catch (e) {
      console.warn(`  ! No.${f.no} ${f.apartment} 실패:`, e.message);
    }
    await sleep(350); // Notion 레이트리밋(~3req/s) 여유
  }

  console.log(`\n✓ 완료: ${created}/${folders.length} 행 생성`);
  console.log("──────────────────────────────────────────");
  console.log("다음: .env.local 에 아래를 넣고 연결 완료");
  console.log(`NOTION_PORTFOLIO_DB_ID=${dbId.replace(/-/g, "")}`);
  console.log("그리고 대표님은 Notion에서 공개할 현장의 '홈페이지 노출' 체크박스만 켜면 됩니다.");
}

run().catch((e) => {
  console.error("✗ 실패:", e.body ? JSON.stringify(e.body) : e.message);
  process.exit(1);
});
