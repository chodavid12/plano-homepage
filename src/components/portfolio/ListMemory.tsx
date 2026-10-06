"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  clearRestore,
  currentUrl,
  isListPath,
  pendingRestore,
  rememberFrom,
  rememberListUrl,
  saveScroll,
  savedScroll,
} from "@/lib/list-memory";

/**
 * 포트폴리오 목록의 "이어서 보기" — 화면에 아무것도 그리지 않는다.
 * · 스크롤 위치를 계속 기억하고, 뒤로가기/목록으로 돌아오면 그 위치로 되돌린다.
 * · 어떤 상세로 들어갔는지 기억해, 상세의 "목록으로"가 뒤로가기처럼 동작하게 한다.
 */
export default function ListMemory() {
  const qs = useSearchParams().toString();

  // 필터·검색을 바꾸면 URL 이 바뀐다 — "목록으로" 때 돌아갈 마지막 목록 URL 갱신
  useEffect(() => {
    rememberListUrl(currentUrl());
  }, [qs]);

  // 돌아온 경우에만 위치 복원 — 메뉴로 새로 들어오면 맨 위부터.
  useEffect(() => {
    const url = currentUrl();
    if (!pendingRestore()) return;
    clearRestore();
    const target = savedScroll(url);
    if (target == null) return;

    // 공간별 보기는 사진을 다시 펼친 뒤라 높이가 바로 안 나올 수 있다 → 닿을 때까지 몇 프레임 재시도.
    // (cleanup 으로 끊지 않는다 — 개발 모드의 effect 이중 실행에도 복원이 한 번은 끝까지 돌도록.
    //  대신 다른 페이지로 넘어갔으면 즉시 멈춘다.)
    let frames = 0;
    const tick = () => {
      if (!isListPath(window.location.pathname)) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // 전역 scroll-behavior: smooth 를 무시하고 즉시 — 돌아오자마자 보던 자리가 바로 보이게
      window.scrollTo({ top: Math.min(target, max), behavior: "instant" });
      if (max < target && frames++ < 90) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    // 위치 저장 — 프레임당 한 번만. 상세로 넘어간 뒤의 '맨 위로' 스크롤은 저장하지 않는다.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (isListPath(window.location.pathname)) saveScroll(currentUrl(), window.scrollY);
      });
    };
    // 카드를 누르는 순간 위치를 확정 저장하고, 어느 상세로 갔는지 기록
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='/portfolio/']");
      if (!a) return;
      const path = new URL((a as HTMLAnchorElement).href).pathname;
      saveScroll(currentUrl(), window.scrollY);
      rememberFrom(path);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
