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
    <div className="container-site py-16 md:py-24">
      <header className="mb-12 flex items-end justify-between">
        <div>
          <p className="overline">Portfolio</p>
          <h1 className="mt-3 text-3xl tracking-tight md:text-4xl">프로젝트</h1>
        </div>
        <p className="pb-1 text-sm text-ink-700/50">
          총 <span className="text-ink-900">{filtered.length}</span>개
        </p>
      </header>

      <PortfolioControls />

      <div className="mt-12">
        {filtered.length === 0 ? (
          <p className="py-24 text-center text-ink-700/50">검색 결과가 없습니다.</p>
        ) : isSpace ? (
          <SpaceView projects={filtered} />
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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

function SpaceView({ projects }: { projects: Awaited<ReturnType<typeof getProjects>> }) {
  const groups = groupBySpace(projects);
  return (
    <div className="space-y-16">
      {groups.map((g) => (
        <section key={g.room}>
          <h2 className="mb-6 flex items-baseline gap-3 text-xl font-light">
            {g.room}
            <span className="text-sm text-ink-700/40">{g.items.length}</span>
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
            {g.items.map(({ project, imageUrl }, i) => (
              <Link
                key={`${project.no}-${i}`}
                href={`/portfolio/${project.no}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden bg-sand-200">
                  <Image
                    src={imageUrl}
                    alt={`${project.title} ${g.room}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <p className="mt-2.5 overline">{formatNo(project.no)}</p>
                <p className="mt-1 text-sm text-ink-800">{project.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
