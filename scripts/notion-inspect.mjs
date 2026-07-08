// Notion 워크스페이스 구조 조회 (읽기 전용) — 통합이 접근 가능한 DB·속성·관계 매핑
//   실행: node --env-file-if-exists=.env.local scripts/notion-inspect.mjs
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const titleOf = (db) => (db.title || []).map((t) => t.plain_text).join("") || "(무제)";

const res = await notion.search({
  filter: { value: "database", property: "object" },
  page_size: 100,
});

const byId = new Map(res.results.map((d) => [d.id, titleOf(d)]));

console.log(`\n통합이 접근 가능한 DB: ${res.results.length}개\n${"=".repeat(50)}`);

for (const db of res.results) {
  console.log(`\n📊 ${titleOf(db)}   (${db.id.replace(/-/g, "")})`);
  for (const [name, p] of Object.entries(db.properties)) {
    let line = `   · ${name} : ${p.type}`;
    if (p.type === "relation") line += ` → "${byId.get(p.relation?.database_id) || p.relation?.database_id}"`;
    if (p.type === "select") line += ` [${(p.select?.options || []).map((o) => o.name).join(", ")}]`;
    if (p.type === "rollup") line += ` (rollup)`;
    if (p.type === "title") line += `  ← 제목`;
    console.log(line);
  }
}

// 포트폴리오/프로젝트 후보 DB의 샘플 행 1~2개
for (const db of res.results) {
  const t = titleOf(db);
  if (!/포트폴리오|프로젝트|고객/.test(t)) continue;
  console.log(`\n${"-".repeat(50)}\n🔎 "${t}" 샘플 행`);
  try {
    const q = await notion.databases.query({ database_id: db.id, page_size: 2 });
    console.log(`   총 일부 표시 (has_more=${q.has_more})`);
    q.results.forEach((pg, i) => {
      const props = pg.properties || {};
      const summary = {};
      for (const [name, p] of Object.entries(props)) {
        if (p.type === "title") summary[name] = (p.title || []).map((x) => x.plain_text).join("");
        else if (p.type === "rich_text") summary[name] = (p.rich_text || []).map((x) => x.plain_text).join("");
        else if (p.type === "select") summary[name] = p.select?.name;
        else if (p.type === "number") summary[name] = p.number;
        else if (p.type === "checkbox") summary[name] = p.checkbox;
        else if (p.type === "relation") summary[name] = `relation×${(p.relation || []).length}`;
        else if (p.type === "files") summary[name] = `files×${(p.files || []).length}`;
        else if (p.type === "rollup") summary[name] = `rollup`;
      }
      console.log(`   [${i + 1}]`, JSON.stringify(summary, null, 0));
    });
  } catch (e) {
    console.log("   조회 실패:", e.message);
  }
}
console.log();
