import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { filterProjects, groupBySpace, availableRooms } from "@/lib/filter";
import ProjectCard from "@/components/portfolio/ProjectCard";
import PortfolioControls from "@/components/portfolio/PortfolioControls";

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
      <header className="mb-12 flex items-end justify-between">
        <div>
          <p className="overline">Portfolio</p>
          <h1 className="mt-3 text-3xl tracking-tight md:text-4xl">프로젝트</h1>
        </div>
        <p className="pb-1 text-sm text-ink-700/50">
          총 <span className="text-ink-900">{filtered.length}</span>개
        </p>
      </header>

      <PortfolioControls rooms={rooms} />

      <div className="mt-12">
        {filtered.length === 0 ? (
          <p className="py-24 text-center text-ink-700/50">검색 결과가 없습니다.</p>
        ) : isSpace ? (
          <SpaceView projects={filtered} room={searchParams.room} />
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2">
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

function SpaceView({
  projects,
  room,
}: {
  projects: Awaited<ReturnType<typeof getProjects>>;
  room?: string;
}) {
  let groups = groupBySpace(projects);
  if (room && room !== "all") groups = groups.filter((g) => g.room === room);
  if (groups.length === 0) {
    return <p className="py-24 text-center text-ink-700/50">해당 공간의 사진이 없습니다.</p>;
  }
  return (
    <div className="space-y-16">
      {groups.map((g) => (
        <section key={g.room}>
          {g.room && (
            <h2 className="mb-8 flex items-baseline gap-3 text-xl font-light">
              {g.room}
              <span className="text-sm text-ink-700/40">{g.items.length}</span>
            </h2>
          )}
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2">
            {g.items.map(({ project, imageUrl }, i) => {
              const hoverSrc = project.images.find((im) => im.imageUrl !== imageUrl)?.imageUrl;
              return (
                <Link
                  key={`${project.no}-${i}`}
                  href={`/portfolio/${project.no}`}
                  className="block animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <div className="group relative aspect-[16/10] overflow-hidden bg-sand-200">
                    <Image
                      src={imageUrl}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={
                        hoverSrc
                          ? "object-cover transition-opacity duration-500 ease-out group-hover:opacity-0"
                          : "object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                      }
                    />
                    {hoverSrc && (
                      <Image
                        src={hoverSrc}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                      />
                    )}
                    <div className="absolute inset-0 bg-ink-900/0 transition-colors duration-500 group-hover:bg-ink-900/10" />
                  </div>
                  <div className="mt-5">
                    <h3 className="text-xl font-light text-ink-900">{project.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
