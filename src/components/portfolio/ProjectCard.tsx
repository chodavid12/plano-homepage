import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatNo } from "@/lib/filter";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/portfolio/${project.no}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand-200">
        <Image
          src={project.coverUrl}
          alt={`${project.title} 대표 이미지`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4">
        <p className="text-xs tracking-[0.15em] text-wood-600">{formatNo(project.no)}</p>
        <h3 className="mt-1 text-lg text-ink-900">{project.title}</h3>
        <p className="mt-0.5 text-sm text-ink-700/70">
          {[project.apartment, project.areaSupply].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
