import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { filterProjects, spacePhotos, availableRooms } from "@/lib/filter";
import ProjectCard from "@/components/portfolio/ProjectCard";
import PortfolioControls from "@/components/portfolio/PortfolioControls";
import SpaceGallery from "@/components/portfolio/SpaceGallery";

export const metadata: Metadata = {
  title: "PORTFOLIO",
  description: "플라노디자인의 인테리어 시공 포트폴리오. 평형·공간별로 둘러보세요.",
};

interface Props {
  searchParams: { view?: string; size?: string; q?: string; room?: string };
}

export default async function PortfolioPage({ searchParams }: Props) {
  const all = await getProjects();
  const isSpace = searchParams.view === "space";
  const filtered = filterProjects(all, {
    size: isSpace ? undefined : searchParams.size,
    q: searchParams.q,
  });
  const rooms = availableRooms(all);

  return (
    <div className="container-site py-16 md:py-24">
      <header className="mb-12">
        <p className="overline">Portfolio</p>
        <h1 className="mt-3 text-3xl tracking-tight md:text-4xl">프로젝트</h1>
      </header>

      <PortfolioControls rooms={rooms} />

      <div className="mt-12">
        {filtered.length === 0 ? (
          <p className="py-24 text-center text-ink-700/50">검색 결과가 없습니다.</p>
        ) : isSpace ? (
          // 세부 공간별 보기 — 프로젝트가 아니라 사진 갤러리(선택한 공간의 사진 전부)
          <SpaceGallery photos={spacePhotos(filtered, searchParams.room)} />
        ) : (
          <div className="grid grid-cols-1 gap-x-2 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <div
                key={p.no}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
