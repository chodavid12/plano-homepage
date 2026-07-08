import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjects } from "@/lib/data";
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
    title: project.title,
    description: `${project.title} · 플라노디자인 인테리어`,
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

  const metaItems = meta.filter((m): m is { label: string; value: string } => Boolean(m.value));

  return (
    <article className="mx-auto w-full max-w-[1600px] px-5 py-14 sm:px-6 md:py-20 lg:px-8">
      {/* 상세 갤러리 — 좌: 제목·정보·썸네일 / 우: 메인 이미지 */}
      <ProjectGallery
        images={project.images}
        title={project.title}
        subtitle={project.subtitle}
        meta={metaItems}
      />

      {/* 하단 내비게이션 */}
      <nav className="mt-16 flex items-center justify-between border-t border-sand-200 pt-8">
        <Link href={`/portfolio/${next.no}`} className="btn btn-ghost" title={next.title}>
          다음
        </Link>
        <Link href="/portfolio" className="btn btn-ghost">
          목록보기
        </Link>
      </nav>
    </article>
  );
}
