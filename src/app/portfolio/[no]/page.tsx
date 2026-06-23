import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjects } from "@/lib/data";
import { formatNo } from "@/lib/filter";
import ProjectGallery from "@/components/portfolio/ProjectGallery";

export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ no: String(p.no) }));
}

export async function generateMetadata({
  params,
}: {
  params: { no: string };
}): Promise<Metadata> {
  const project = await getProject(Number(params.no));
  if (!project) return { title: "프로젝트를 찾을 수 없습니다" };
  return {
    title: `${project.title} (${formatNo(project.no)})`,
    description: `${project.apartment ?? ""} ${project.areaSupply ?? ""} · 플라노디자인 인테리어`,
  };
}

export default async function ProjectDetailPage({ params }: { params: { no: string } }) {
  const no = Number(params.no);
  const project = await getProject(no);
  if (!project) notFound();

  const all = await getProjects();
  const idx = all.findIndex((p) => p.no === no);
  const next = all[(idx + 1) % all.length];

  const meta: { label: string; value?: string }[] = [
    { label: "유형", value: project.type },
    {
      label: "면적",
      value: [project.areaSupply && `공급 ${project.areaSupply}`, project.areaExclusive && `전용 ${project.areaExclusive}`]
        .filter(Boolean)
        .join(" / "),
    },
    { label: "준공", value: project.completionYear ? `${project.completionYear}년` : undefined },
    { label: "지역", value: project.region },
    { label: "기간", value: project.period },
  ];

  return (
    <article className="container-site py-14 md:py-20">
      {/* 타이틀 */}
      <header className="mb-10 animate-fade-up">
        <p className="overline">{formatNo(project.no)}</p>
        <h1 className="mt-4 text-4xl tracking-tight md:text-5xl">{project.title}</h1>
        {project.subtitle && (
          <p className="mt-4 text-base font-light text-ink-700/80">{project.subtitle}</p>
        )}
      </header>

      {/* 메타 테이블 */}
      <dl className="mb-14 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-sand-200 py-7 text-sm sm:grid-cols-3 lg:grid-cols-5">
        {meta
          .filter((m) => m.value)
          .map((m) => (
            <div key={m.label}>
              <dt className="text-[0.7rem] uppercase tracking-[0.15em] text-ink-700/45">
                {m.label}
              </dt>
              <dd className="mt-2 text-ink-900">{m.value}</dd>
            </div>
          ))}
      </dl>

      {/* 공간별 갤러리 */}
      <ProjectGallery images={project.images} />

      {/* 하단 내비게이션 */}
      <nav className="mt-20 flex items-center justify-between border-t border-sand-200 pt-10">
        <Link href="/portfolio" className="btn btn-ghost">
          목록보기
        </Link>
        <Link href={`/portfolio/${next.no}`} className="group text-right">
          <span className="block text-[0.7rem] uppercase tracking-[0.18em] text-ink-700/45">
            Next Project
          </span>
          <span className="mt-1.5 block font-light text-ink-900 transition-colors group-hover:text-wood-600">
            {next.title} →
          </span>
        </Link>
      </nav>
    </article>
  );
}
