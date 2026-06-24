# PLANO 홈페이지 — 인수인계서

> 작성 2026-06-24 · 대상: 로컬에서 이어서 개발하는 분(또는 본인)
> 한 줄 요약: **Next.js 인테리어 홈페이지. Notion(원본)→Supabase(캐시)→사이트 자동 동기화 설계. 현재는 시드 데이터 + 실제 사진으로 디자인까지 완성, 백엔드(Notion/Supabase)는 미연동.**

---

## 1. 저장소 / 브랜치

- GitHub: **`chodavid12/plano-homepage`**
- 작업 브랜치(= 원격 기본 브랜치): **`claude/pensive-pascal-no9crd`** (※ `main` 없음)
- 최신 커밋: `176c83c` (chore: .claude/launch.json 추가) 기준

```bash
git clone -b claude/pensive-pascal-no9crd https://github.com/chodavid12/plano-homepage.git
cd plano-homepage
```

---

## 2. 로컬 실행

필요: **Node 18.17+ (20 LTS 권장)**, git

```bash
npm install
npm run dev      # http://localhost:3000  (기본 시드 데이터)
# 프로덕션 빌드 확인
npm run build && npm start
```

- **환경변수 없이도** 전체 UI 동작(시드 데이터). `DATA_SOURCE` 기본 `auto` → Supabase 미설정 시 자동 시드.
- 데스크탑 앱 **미리보기**: `.claude/launch.json` 에 dev 서버 설정이 있어 Preview 패널에서 바로 실행됨(이미 커밋됨). 클라우드 세션에선 포트 포워딩이 안 되니 **로컬 세션에서 미리보기** 사용.

---

## 3. 기술 스택

| 영역 | 내용 |
|---|---|
| 프레임워크 | Next.js 14 (App Router, TypeScript) |
| 스타일 | Tailwind CSS (디자인 토큰: `tailwind.config.ts`) — 미니멀 웜·우드 |
| 데이터 | Supabase(Postgres+Storage) 우선, 미연동 시 시드 폴백 |
| CMS 원본 | Notion (`@notionhq/client`) |
| 이미지 | next/image + `sharp`(동기화 시 webp 변환) |
| 호스팅 | Vercel (git 연동 자동배포) |

---

## 4. 화면 / 라우트 (GNB: ABOUT · PORTFOLIO · CONSULTANT)

| 경로 | 설명 | 핵심 파일 |
|---|---|---|
| `/` | 메인 풀스크린 스플래시(로고+버튼, 배경=실사진) | `src/app/page.tsx` |
| `/about` | 회사소개 | `src/app/about/page.tsx` |
| `/portfolio` | 목록(평형필터·검색·프로젝트/공간별 보기) | `src/app/portfolio/page.tsx` + `components/portfolio/*` |
| `/portfolio/[no]` | 상세(메타·공간탭·이미지 캐러셀) | `src/app/portfolio/[no]/page.tsx` |
| `/consultant` | 상담 폼 → Notion API | `src/app/consultant/page.tsx`, `components/consultant/ConsultForm.tsx` |
| API | `/api/sync`(Notion→Supabase 동기화), `/api/consult`(상담 적재), `/api/revalidate` | `src/app/api/*` |

핵심 라이브러리: `src/lib/` — `data.ts`(데이터 액세스+캐시), `supabase.ts`, `notion.ts`, `sync.ts`, `seed.ts`, `filter.ts`, `rooms.ts`, `types.ts`

---

## 5. 데이터 아키텍처 (요지)

```
Notion DB(노출 ✓ 행만) → /api/sync → 이미지 webp 변환·Supabase Storage 캐싱 + DB upsert
→ revalidateTag('portfolio') → 사이트는 Supabase만 읽어 렌더(SSG/ISR)
```
- 사이트는 런타임에 Notion 직접 호출 안 함(이미지 URL 만료/레이트리밋 회피).
- 상담 폼은 Supabase가 아니라 **Notion 상담 응답 DB**에 적재.
- 상세 문서: `docs/architecture.md`, `docs/기획안.md`, `docs/notion-portfolio-db-schema.md`

---

## 6. 에셋 현황

- **원본(레포 루트, 사용자 업로드):** `1.jpeg` `2.jpeg` `3.jpeg`(실내 사진 6000px), `logo.jpeg`(로고, 베이지 배경)
- **최적화본(실제 사용):** `public/hero.jpg`(스플래시 배경=1.jpeg), `public/portfolio/r1~r3.webp`(목록/상세)
- 시드 데이터(`src/lib/seed.ts`)가 위 webp 3장을 순환 사용.
- **로고:** 이미지 대신 **텍스트 워드마크**(`src/components/Logo.tsx`, 심볼 없음, 색상 자동반전). `logo.jpeg`는 배경 있어 미사용.
- 교체/추가 위치 가이드: `docs/assets.md` (메인=`public/hero.jpg`, 로고=`public/brand/...`).

---

## 7. Vercel 배포 현황 ⚠️

- 프로젝트 **`plano-site`** 존재, GitHub git 연동 → **이 브랜치 push마다 자동 재배포**. URL: `https://plano-site.vercel.app`
- 주의점:
  1. **Deployment Protection(Vercel Authentication) 켜져 있음** → 외부엔 403(본인 로그인 시만 노출). 공개하려면 **Project Settings → Deployment Protection → Vercel Authentication → Disable**.
  2. **Hobby 플랜**: cron은 하루 1회 제한 → `vercel.json` 이미 `0 3 * * *`(매일 1회)로 수정됨. 더 자주 돌리려면 Pro 필요.
  3. (참고) 같은 계정에 별개 프로젝트 `plano-portfolio`(다른 레포, 내부 포트폴리오 검색 도구)·`btbc-2026` 있음 — 혼동 주의.

---

## 8. 환경변수 (백엔드 연동 시)

`.env.example` 복사 → `.env.local`. 자세한 키는 `.env.example` 참고.
- Notion: `NOTION_TOKEN`, `NOTION_PORTFOLIO_DB_ID`, `NOTION_IMAGES_DB_ID`, `NOTION_CONSULT_DB_ID`
- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 보호/기타: `SYNC_SECRET`, `REVALIDATE_SECRET`, `SLACK_WEBHOOK_URL`(선택)
- 동기화 실행: `npm run sync` (또는 `-- --force` 전체 재업로드)

---

## 9. 남은 작업 (우선순위순)

- [ ] **로고 폰트 정밀 매칭** — 투명 배경 SVG 주면 그대로 적용, 아니면 폰트로 재현
- [ ] **메인/포트폴리오 사진 확정** — 히어로 사진 선택, 카드용 추가 사진
- [ ] **Supabase 연결** — 프로젝트 생성 → `supabase/migrations/0001_init.sql` 적용 → env 설정
- [ ] **Notion DB 구성** — `docs/notion-portfolio-db-schema.md`대로 DB 3개 생성 → env → `npm run sync` → 시드 대신 실데이터
- [ ] **상담 폼 Notion 응답 DB 매핑** 확인(`src/lib/notion.ts`의 속성명)
- [ ] **Vercel Deployment Protection 해제**(공개용)
- [ ] (선택) `main` 브랜치 정리 / PR 전략 결정

---

## 10. 알려진 이슈 / 주의

- 이 작업은 **클라우드 세션**에서 진행됨 → 클라우드에선 `localhost` 미리보기가 데스크탑으로 포워딩 안 됨. **로컬 세션에서 `npm run dev` + Preview** 사용.
- 데스크탑 미리보기는 **`.claude/launch.json`** 으로 동작(이미 추가됨). 세션 시작 시 레포가 비어 있으면 자동 생성이 안 되니 이 파일이 핵심.
- 클라우드 환경은 외부 네트워크(예: vercel.com) 차단 → 배포는 git 연동(브라우저)로만.
- 커밋 서명 서버가 가끔 503(일시적) → 재시도하면 됨.
- next/image가 시드 SVG 때문에 `dangerouslyAllowSVG: true` 설정됨(`next.config.mjs`). 실이미지는 webp/jpg.

---

## 11. 참고 문서

- `README.md` — 개요/실행
- `docs/기획안.md` — 기획안 전문(IA+기술서)
- `docs/architecture.md` — 동기화 다이어그램, Supabase 스키마
- `docs/notion-portfolio-db-schema.md` — Notion DB 구성 가이드
- `docs/assets.md` — 사진/로고 추가 방법
