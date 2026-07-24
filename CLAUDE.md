# PLANO DESIGN 홈페이지

Next.js 14 (App Router) · TypeScript · Tailwind. 배포는 Vercel git 연동 — 브랜치 `claude/pensive-pascal-no9crd` 에 push 하면 1~2분 뒤 자동 반영.

## 데이터 흐름 — 런타임에 노션을 부르지 않는다

노션 **포트폴리오 DB** 가 원본이지만, 사이트는 100% 정적이다.

```
노션 포트폴리오 DB → scripts/notion-sync.mjs → public/portfolio/p<no>/*.webp + src/lib/seed.ts → 빌드
```

- `src/lib/seed.ts` 는 **자동 생성 파일. 직접 수정 금지.**
- `src/lib/data.ts` 는 seed 를 읽기만 한다. **캐시하지 않는다** — `unstable_cache` 를 씌우면 배포 간에 캐시가 복원되어 새 seed 가 화면에 안 나온다(commit 4cda816 에서 겪음).
- API 라우트 없음(`src/app/api/` 자체가 없음). 상담은 노션 폼 링크로 나간다.
- Supabase 는 걷어냈다(commit 8e6ee8f). 되살리지 말 것.

### 동기화 → 배포

노션 반영은 원스텝 파이프라인 하나로 끝낸다(동기화→치수→빌드→커밋→푸시, 변경 없으면 조기 종료).
`notion-sync` 스킬이 이걸 감싼다("노션 동기화" 요청 시 자동).

```bash
bash scripts/sync-deploy.sh            # 전체 (동기화+배포)
bash scripts/sync-deploy.sh --dry      # 미리보기(다운로드·커밋 없음)
bash scripts/sync-deploy.sh --no-push  # 커밋까지만
bash scripts/sync-deploy.sh --force    # 전체 재다운로드(오래 걸림)
```

동기화만 따로 돌리려면 `npm run sync`(증분 · 변경 없으면 ~2초). 스크립트는 여기에 치수
보정·빌드·시크릿 차단·커밋·푸시를 더한 것이다.

- 증분 판단은 `notionLastEditedAt`. 변경 없는 현장은 이미지 재다운로드를 건너뛴다.
- `no` 는 노션 pageId 에 고정 → 공유 URL 이 안 바뀐다. 표시 순서는 `sortOrder`(생성일시 내림차순).
- **마감재**(마루/타일/도배/필름/가구재)는 rollup 이 자재 **페이지 id** 를 주므로 이름을 따로 조회한다. 결과는 `scripts/.materials-cache.json` 에 캐시되어 재동기화 때 다시 안 부른다. 마감재는 이미지 재사용 현장도 매번 갱신된다.
- 병목은 CPU 가 아니라 **대역폭**(노션 원본이 수 MB). 동시성 10.

## 하지 말 것

- `npm audit fix --force` — next@16(breaking)으로 올려버린다. **Next 는 14.2 라인에 고정**(현재 14.2.35).
- `포트폴리오/` 커밋 — 8.2GB 원본. `.gitignore`/`.vercelignore` 에 있다.
- `.env.local` 커밋 — `NOTION_TOKEN` 이 들어있다.
- `next.config.mjs` 에 `remotePatterns`/`dangerouslyAllowSVG` 되살리기 — 이미지는 전부 로컬 webp 라 불필요하고, 이미지 최적화기를 외부 프록시로 열어준다.

## 알려진 함정

- **삭제한 파일이 되살아난다.** Desktop 이 iCloud 동기화 대상이라, 지운 파일(`src/lib/supabase.ts` 등)이 원본 mtime 그대로 복귀한 적 있다. 빌드가 `ConsultInput` 같은 없어진 심볼로 깨지면 `git status` 로 untracked 부활 파일을 먼저 의심할 것.
- **seed 갱신 후 dev 재시작만으론 부족**할 때가 있다 → `rm -rf .next`.
- **tailwind.config.ts 토큰/애니메이션 추가는 dev 서버 재시작 필요.**
- macOS 파일명은 **NFD** — 한글 정규식 매칭 전에 `.normalize("NFC")`.
- `globals.css` 가 `h1,h2,h3` 에 `text-ink-900` 을 강제한다. **어두운 배경 위 헤딩엔 `text-white` 를 명시**해야 한다(부모의 `text-white` 는 상속되지 않음).

## 디자인 토큰

`sand`(50/100/200/300) 웜 페이퍼 · `wood`(400/500/600) 액센트 · `ink`(700/800/900) 텍스트.
폰트: 본문 Pretendard, 헤딩 `font-display`(Jost+SUIT 고딕), 히어로 워드마크만 `font-wordmark`(학교안심 자연).
`maxWidth.site = 1320px`, 유틸 `.container-site` / `.overline` / `.btn`.

## 라우트

`/` · `/about`(v2 현행) · `/about-v1`(보관, noindex) · `/portfolio` · `/portfolio/[no]` · `/consultant`
