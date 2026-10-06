"use client";

import { useRouter } from "next/navigation";
import { cameFromList, markRestore, savedListUrl } from "@/lib/list-memory";

/**
 * 목록으로 돌아가기 — 보던 목록의 필터·검색·스크롤 위치를 그대로 이어서 보여준다.
 * · 목록에서 눌러 들어온 상세면 history.back() — 브라우저 뒤로가기와 똑같이 동작.
 * · 공유 링크·새 탭·"다음"으로 넘어온 상세면 돌아갈 히스토리가 없으므로, 마지막으로 보던
 *   목록 URL 로 이동하면서 위치 복원을 요청한다(처음 온 사람은 /portfolio 맨 위).
 *
 * document.referrer 로는 판정할 수 없다 — 사이트 안 이동(클라이언트 내비게이션)은 referrer 를
 * 바꾸지 않아, 구글 등에서 처음 들어온 사람은 늘 '외부'로 판정돼 목록이 초기화됐었다.
 */
export default function BackLink({
  className = "group -ml-1 mb-7 inline-flex items-center gap-2 px-1 py-1 text-xs uppercase tracking-[0.14em] text-ink-700/70 transition-colors hover:text-ink-900 md:mb-9",
  label = "목록으로",
  arrow = true,
}: {
  className?: string;
  label?: string;
  arrow?: boolean;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (cameFromList(window.location.pathname) && window.history.length > 1) {
      router.back();
      return;
    }
    markRestore();
    router.push(savedListUrl() ?? "/portfolio");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {arrow && (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden="true"
        >
          <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </button>
  );
}
