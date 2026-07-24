#!/usr/bin/env bash
# 노션 포트폴리오 → 사이트 반영 원스텝 파이프라인.
#   동기화 → 이미지 치수 보정 → 빌드 검증 → 커밋 → 푸시(Vercel 자동 배포)
# 노션에 변경이 없으면 아무것도 커밋하지 않고 조기 종료한다.
#
#   bash scripts/sync-deploy.sh            # 전체 (동기화+배포)
#   bash scripts/sync-deploy.sh --dry      # 미리보기만 (다운로드/커밋 없음)
#   bash scripts/sync-deploy.sh --no-push  # 커밋까지만 (배포 안 함)
#   bash scripts/sync-deploy.sh --force    # 증분 무시하고 전체 재다운로드
set -euo pipefail
cd "$(dirname "$0")/.."

DRY=0; NOPUSH=0; FORCE=""
for a in "$@"; do
  case "$a" in
    --dry) DRY=1 ;;
    --no-push) NOPUSH=1 ;;
    --force) FORCE="--force" ;;
  esac
done

[ -f .env.local ] || { echo "✗ .env.local 없음 — NOTION_TOKEN 필요"; exit 1; }

# ── 1. 미리보기 모드 ─────────────────────────────────────────────
if [ "$DRY" = "1" ]; then
  node --env-file-if-exists=.env.local scripts/notion-sync.mjs --dry
  echo "[DRY] 미리보기만 — 다운로드·커밋 없음."
  exit 0
fi

# ── 2. 동기화 (변경분만 다운로드 · 다운로드 시 이미지 치수도 기록) ──
node --env-file-if-exists=.env.local scripts/notion-sync.mjs $FORCE 2>&1 | tee /tmp/plano-sync.log
SUMMARY=$(grep '현장 (재사용' /tmp/plano-sync.log | tail -1 | sed 's/ → .*//; s/^✓ //' || true)

# ── 3. 변경 없으면 종료 ──────────────────────────────────────────
if git diff --quiet && git diff --cached --quiet; then
  echo "✓ 노션 변경 없음 — 배포할 것 없음."
  exit 0
fi

# ── 4. 빌드 검증 (.next 오염 방지) ───────────────────────────────
rm -rf .next
if ! npm run build > /tmp/plano-build.log 2>&1; then
  echo "✗ 빌드 실패 — 커밋 중단:"; tail -25 /tmp/plano-build.log; exit 1
fi

# ── 5. 시크릿·대용량 스테이징 차단 ───────────────────────────────
git add -A
LEAK=$(git diff --cached --name-only | grep -c '\.env\|포트폴리오/' || true)
[ "$LEAK" = "0" ] || { echo "✗ 민감/대용량 파일 스테이징 감지 — 중단"; git reset -q; exit 1; }

# ── 6. 커밋 (+ 푸시 → Vercel 자동 배포) ──────────────────────────
git commit -q -m "sync: 노션 포트폴리오 최신 반영 ($(date +%Y-%m-%d))

${SUMMARY:-변경 반영}

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

if [ "$NOPUSH" = "1" ]; then
  echo "✓ 커밋 완료 (푸시 생략). ${SUMMARY}"
  exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push -q origin "$BRANCH"
echo "✓ 동기화 → 빌드 → 배포 완료 · ${SUMMARY} · branch=${BRANCH} · Vercel 1~2분 후 반영."
