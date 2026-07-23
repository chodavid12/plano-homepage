"use client";

import { useRouter } from "next/navigation";

/**
 * 목록으로 돌아가기.
 * 사이트 안에서 들어왔으면 history.back() — 목록의 필터·검색어·스크롤 위치가 그대로 유지된다.
 * 새 탭이나 공유 링크로 바로 들어온 경우엔 돌아갈 곳이 없으므로 /portfolio 로 보낸다.
 */
export default function BackLink() {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/portfolio");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group -ml-1 mb-7 inline-flex items-center gap-2 px-1 py-1 text-xs uppercase tracking-[0.14em] text-ink-700/70 transition-colors hover:text-ink-900 md:mb-9"
    >
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
      목록으로
    </button>
  );
}
