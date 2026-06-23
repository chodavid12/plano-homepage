# PLANO Homepage

플라노디자인(PLANO DESIGN) 공식 홈페이지 — 인테리어 스튜디오의 포트폴리오/상담 사이트.
포트폴리오 콘텐츠는 **Notion에서 관리 → 사이트가 자동 동기화**되는 구조로 설계한다.

> 현재 단계: **기획 문서(기획안 + 기술서)** 정리. 실제 사이트 구현은 후속 단계.

## 핵심 개념

- **Notion = 콘텐츠 원본(source of truth)** — 팀이 노션 DB에서 포트폴리오를 관리한다.
- **체크박스 `홈페이지 노출 ✓` 인 행만 동기화** — 노션 전체가 아니라 노출 체크된 프로젝트만 사이트로 나간다.
- **Supabase = 동기화 캐시** — 노션 이미지 URL은 약 1시간 후 만료되므로, 이미지를 Supabase Storage로 복사해 안정적인 URL로 제공한다.
- **사이트는 Supabase만 읽는다** — 런타임에 노션을 직접 호출하지 않아 빠르고 안정적이다.
- **상담 폼 = 커스텀 폼 → Notion API** — 사이트의 브랜드 톤 폼 제출 시 기존 노션 상담 응답 DB에 행을 생성한다.

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript) |
| 스타일 | Tailwind CSS |
| 데이터/스토리지 | Supabase (Postgres + Storage) |
| CMS 원본 | Notion (`@notionhq/client`) |
| 호스팅 | Vercel (+ Vercel Cron) |

## 사이트 구성 (GNB = ABOUT · PORTFOLIO · CONSULTANT)

| 경로 | 설명 |
|---|---|
| `/` | 메인 — 풀스크린 스플래시(로고 + PORTFOLIO / CONSULTANT 버튼) |
| `/about` | ABOUT — 회사소개 |
| `/portfolio` | PORTFOLIO — 목록(평형 필터·검색·프로젝트/공간별 보기) |
| `/portfolio/[no]` | 포트폴리오 상세(메타·공간별 탭·이미지 캐러셀) |
| `/consultant` | CONSULTANT — 상담신청(커스텀 폼 → Notion API) |

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/기획안.md`](docs/기획안.md) | 기획안 전문 — 홈페이지 구성(IA) + 기술서 |
| [`docs/notion-portfolio-db-schema.md`](docs/notion-portfolio-db-schema.md) | 팀이 그대로 만들 수 있는 Notion DB 속성 명세 |
| [`docs/architecture.md`](docs/architecture.md) | 동기화 파이프라인 다이어그램 + Supabase 스키마 |

## 후속 구현 로드맵

- **P0** 스캐폴딩: Next.js + TS + Tailwind, 디자인 토큰, Layout/Header/Footer
- **P1** Supabase: 스키마 + Storage 버킷 + RLS
- **P2** 동기화: `/api/sync`(Notion → Supabase) + 이미지 파이프라인 + Vercel Cron + 온디맨드 revalidate
- **P3** 포트폴리오 목록: 탭 / 평형 필터 / 검색 / 그리드
- **P4** 포트폴리오 상세: 메타 / 공간 탭 / 캐러셀 / 이전·다음
- **P5** 메인(스플래시) + ABOUT + 상담 커스텀 폼(`/api/consult` → Notion API)
- **P6** SEO / 성능 / 반응형 마감 → Vercel 배포
