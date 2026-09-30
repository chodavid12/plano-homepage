# PLANO DESIGN 홈페이지

Next.js 14 (App Router) · TypeScript · Tailwind. 도메인 `planodesign.kr`(가비아 DNS → Vercel).
배포는 Vercel git 연동 — 브랜치 `claude/pensive-pascal-no9crd` 에 push 하면 1~2분 뒤 자동 반영.
다른 세션·PC 도 같은 브랜치에 푸시한다 → 푸시 전 `git pull --rebase`, `--force` 푸시 금지.

## 데이터 흐름 — 런타임에 노션을 부르지 않는다

노션 **포트폴리오 DB** 가 원본, 사이트는 100% 정적.

```
노션 포트폴리오 DB('공홈 업로드' ✓ 행만) → scripts/notion-sync.mjs → public/portfolio/p<no>/*.webp + src/lib/seed.ts → 빌드
```

- **공개 여부 = 노션 `공홈 업로드` 체크박스.** 코드에 블라인드 목록을 두지 말 것. 해제된 현장은 seed·이미지 폴더에서 제거된다(이미지 직접 URL 노출 차단).
- `no` 는 `scripts/.no-map.json`(pageId→no)에 영구 고정 → 비공개 후 재공개해도 URL 불변. 이 파일 수동 편집 금지.
- 한 번에 5건 넘게 비공개로 빠지면 동기화가 중단된다 → 의도한 것이면 `--yes`.
- `src/lib/seed.ts` 는 **자동 생성. 직접 수정 금지.** `src/lib/data.ts` 는 seed 를 읽기만 하고 **캐시하지 않는다**(`unstable_cache` 는 배포 간 복원돼 새 seed 가 안 나옴, commit 4cda816).
- API 라우트·Supabase·환경변수 런타임 의존 없음. 상담은 노션 폼 링크.
- 노션 행 수정(체크 변경 포함)은 `last_edited_time` 을 바꿔 그 현장 이미지를 다시 받는다 — 대량 체크 변경 뒤 동기화는 오래 걸린다.

### 동기화 → 배포

`notion-sync` 스킬이 감싼다("노션 동기화" 요청 시 자동).

```bash
bash scripts/sync-deploy.sh            # 전체 (동기화+빌드+커밋+rebase+푸시)
bash scripts/sync-deploy.sh --dry      # 미리보기(비공개 전환 목록 포함)
bash scripts/sync-deploy.sh --no-push  # 커밋까지만
bash scripts/sync-deploy.sh --force    # 전체 재다운로드(오래 걸림)
bash scripts/sync-deploy.sh --yes      # 비공개 전환 5건 초과 허용
```

- 스크립트는 `seed.ts`·`public/portfolio`·`scripts/.materials-cache.json`·`scripts/.no-map.json` 만 커밋한다.
- 증분 판단은 `notionLastEditedAt`. 병목은 대역폭(노션 원본 장당 수 MB), 동시성 10.
- **마감재**(마루/타일/도배/필름/가구재)는 rollup 이 자재 페이지 id 를 주므로 이름을 따로 조회해 `.materials-cache.json` 에 캐시.

## 하지 말 것

- `npm audit fix --force` — next@16 으로 올려버린다. **Next 는 14.2 라인 고정**(14.2.35).
- `포트폴리오/`(8.2GB 원본)·`.env.local`(`NOTION_TOKEN`) 커밋.
- `next.config.mjs` 에 `remotePatterns`/`dangerouslyAllowSVG` 되살리기 — 이미지는 전부 로컬 webp.
- 루트에 떨군 사진(`/*.jpg` 등, gitignore 됨)을 사이트에 쓰려면 `public/` 으로 변환해 넣는다.

## 알려진 함정

- **Desktop 이 iCloud 동기화 대상.** 지운 파일이 원본 mtime 그대로 부활하거나, 세션 중 폴더 접근이 `Operation not permitted` 로 막힐 수 있다. 빌드가 없어진 심볼로 깨지면 `git status` 로 부활 파일부터 의심.
- **git 이 `Xcode license` 메시지로 실패** → 사용자가 `sudo xcodebuild -license accept` 실행해야 함(대신 못 함).
- dev 서버 실행 중 `npm run build` 금지(`.next` 오염) → 멈추고 `rm -rf .next`.
- seed 갱신 후 dev 재시작만으론 부족할 때 → `rm -rf .next`. tailwind 토큰/애니메이션 추가도 dev 재시작 필요.
- macOS 파일명은 **NFD** — 한글 정규식 매칭 전 `.normalize("NFC")`.
- `globals.css` 가 `h1,h2,h3` 에 `text-ink-900` 강제 → **어두운 배경 위 헤딩엔 `text-white` 명시**.

## 디자인 토큰

`sand`(50~300) 웜 페이퍼 · `wood`(400~600) 액센트 · `ink`(700~900) 텍스트.
폰트: 본문 Pretendard, 헤딩 `font-display`(Jost+SUIT), 히어로 워드마크만 `font-wordmark`.
`.container-site` = `max-w-[1800px] px-3 sm:px-5`(사진 극대화용 좁은 여백). 유틸 `.overline` / `.btn`.

## 라우트

`/` · `/about`(v2 현행) · `/about-v1`(보관, noindex) · `/portfolio` · `/portfolio/[no]` · `/consultant`
