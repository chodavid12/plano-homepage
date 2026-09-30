"use client";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/lib/types";
import PortfolioControls from "./PortfolioControls";
import PortfolioList from "./PortfolioList";

// 쿼리(?view·size·q·room) 필터를 브라우저에서 처리 → /portfolio 가 정적 페이지로 CDN 캐시된다.
export default function PortfolioBrowser({ projects, rooms }: { projects: Project[]; rooms: string[] }) {
  const sp = useSearchParams();
  const params = {
    view: sp.get("view") ?? undefined,
    size: sp.get("size") ?? undefined,
    q: sp.get("q") ?? undefined,
    room: sp.get("room") ?? undefined,
  };
  return (
    <>
      <PortfolioControls rooms={rooms} />
      <div className="mt-12">
        <PortfolioList projects={projects} params={params} />
      </div>
    </>
  );
}
