# PLANO DESIGN 홈페이지

플라노디자인 공식 홈페이지 — [planodesign.kr](https://planodesign.kr)

Next.js 14 (App Router) · TypeScript · Tailwind · Vercel. 포트폴리오 원본은 노션 **포트폴리오 DB**.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

런타임 환경변수는 없다. 노션 동기화에만 `.env.local` 의 `NOTION_TOKEN` 이 필요하다(`.env.example` 참고).

## 포트폴리오 반영

1. 노션 포트폴리오 DB 에서 현장 페이지 작성 — 본문에 공간 헤딩(대표/거실/주방/…) 아래로 사진
2. 공개할 현장만 **`공홈 업로드`** 체크 (해제하면 사이트에서 내려감)
3. 동기화 + 배포

```bash
bash scripts/sync-deploy.sh          # 또는 Claude Code 에서 /notion-sync
bash scripts/sync-deploy.sh --dry    # 미리보기
```

자세한 흐름·주의사항은 [CLAUDE.md](CLAUDE.md), 구조도는 [docs/architecture.md](docs/architecture.md).

## 구조

```
src/app/            / · /about · /about-v1 · /portfolio · /portfolio/[no] · /consultant
src/components/     layout · portfolio · about · consultant · ui
src/lib/            data(읽기) · seed(자동 생성) · types
scripts/            notion-sync.mjs(동기화) · sync-deploy.sh(원스텝 배포)
public/portfolio/   p<no>/*.webp (동기화 산출물)
```
