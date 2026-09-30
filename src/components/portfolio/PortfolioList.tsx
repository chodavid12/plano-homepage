import type { Project } from "@/lib/types";
import { filterProjects, spacePhotos } from "@/lib/filter";
import ProjectCard from "./ProjectCard";
import SpaceGallery from "./SpaceGallery";

export interface ListParams {
  view?: string;
  size?: string;
  q?: string;
  room?: string;
}

// 목록 본문 — 서버(정적 HTML 기본 목록)와 클라이언트(쿼리 필터 적용) 양쪽에서 같은 마크업으로 렌더한다.
export default function PortfolioList({ projects, params }: { projects: Project[]; params: ListParams }) {
  const isSpace = params.view === "space";
  const filtered = filterProjects(projects, { size: isSpace ? undefined : params.size, q: params.q });

  if (filtered.length === 0) {
    return <p className="py-24 text-center text-ink-700/50">검색 결과가 없습니다.</p>;
  }
  if (isSpace) {
    // 세부 공간별 보기 — 프로젝트가 아니라 사진 갤러리(선택한 공간의 사진 전부)
    return <SpaceGallery photos={spacePhotos(filtered, params.room)} />;
  }
  return (
    <div className="grid grid-cols-1 gap-x-2 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((p, i) => (
        <div key={p.no} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
          <ProjectCard project={p} />
        </div>
      ))}
    </div>
  );
}
