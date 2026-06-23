import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { filterProjects, formatNo, groupBySpace } from "@/lib/filter";
import ProjectCard from "@/components/portfolio/ProjectCard";
import PortfolioControls from "@/components/portfolio/PortfolioControls";

export const metadata: Metadata = {
  title: "PORTFOLIO",
  description: "플라노디자인의 인테리어 시공 포트폴리오. 평형·공간별로 둘러보세요.",
};

interface Props {
  searchParams: { view?: string; size?: string; q?: string };
}

export default async function PortfolioPage({ searchParams }: Props) {
  const all = await getProjects();
  const filtered = filterProjects(all, { size: searchParams.size, q: searchParams.q });
  const isSpace = searchParams.view === "space";

  return (
    <div className="container-site py-12 md:py-16">
      <header className="mb-10">
        <h1 className="text-2xl tracking-[0.1em] text-ink-900">PORTFOLIO</h1>
        <p className="mt-2 text-sm text-ink-700/60">
          총 {filtered.length}개의 프로젝트
        </p>
      </header>

      <PortfolioControls />

      <div className="mt-10">
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-ink-700/50">검색 결과가 없습니다.</p>
        ) : isSpace ? (
          <SpaceView projects={filtered} />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
            {filtered.map((p) => (
              <ProjectCard key={p.no} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SpaceView({ projects }: { projects: Awaited<ReturnType<typeof getProjects>> }) {
  const groups = groupBySpace(projects);
  return (
    <div className="space-y-14">
      {groups.map((g) => (
        <section key={g.room}>
          <h2 className="mb-5 text-lg tracking-[0.1em] text-ink-900">
            {g.room}
            <span className="ml-2 text-sm text-ink-700/40">{g.items.length}</span>
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {g.items.map(({ project, imageUrl }, i) => (
              <Link key={`${project.no}-${i}`} href={`/portfolio/${project.no}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-sm bg-sand-200">
                  <Image
                    src={imageUrl}
                    alt={`${project.title} ${g.room}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-2 text-xs tracking-[0.12em] text-wood-600">{formatNo(project.no)}</p>
                <p className="text-sm text-ink-800">{project.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
