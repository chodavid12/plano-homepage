import type { Metadata } from "next";
import { Suspense } from "react";
import { getProjects } from "@/lib/data";
import { availableRooms } from "@/lib/filter";
import PortfolioBrowser from "@/components/portfolio/PortfolioBrowser";
import PortfolioList from "@/components/portfolio/PortfolioList";

export const metadata: Metadata = {
  title: "PORTFOLIO",
  description: "플라노디자인의 인테리어 시공 포트폴리오. 평형·공간별로 둘러보세요.",
};

// 정적 페이지 — 필터는 PortfolioBrowser 가 브라우저에서 처리한다.
// Suspense fallback 은 필터 없는 전체 목록을 미리 렌더해 둔 HTML(검색엔진·첫 화면용).
export default async function PortfolioPage() {
  const all = await getProjects();
  const rooms = availableRooms(all);

  return (
    <div className="container-site container-gutter py-16 md:py-24">
      <header className="mb-12">
        <p className="overline">Portfolio</p>
        <h1 className="mt-3 text-3xl tracking-tight md:text-4xl">프로젝트</h1>
      </header>

      <Suspense
        fallback={
          <>
            {/* 필터 영역 자리(측정값) — 하이드레이션 때 목록이 밀리지 않게 */}
            <div className="h-[150px] md:h-[104px]" aria-hidden="true" />
            <div className="mt-12">
              <PortfolioList projects={all} params={{}} />
            </div>
          </>
        }
      >
        <PortfolioBrowser projects={all} rooms={rooms} />
      </Suspense>
    </div>
  );
}
