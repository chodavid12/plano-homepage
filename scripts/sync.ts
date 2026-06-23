// 로컬/CI에서 동기화 실행: npm run sync (-- --force 로 전체 재업로드)
import { runSync } from "../src/lib/sync";

const force = process.argv.includes("--force");

runSync({ force })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
