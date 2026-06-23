import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatNo } from "@/lib/filter";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/portfolio/${project.no}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand-200">
        <Image
          src={project.coverUrl}
          alt={`${project.title} 대표 이미지`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-ink-900/0 transition-colors duration-500 group-hover:bg-ink-900/10" />
      </div>
      <div className="mt-5">
        <p className="overline">{formatNo(project.no)}</p>
        <h3 className="mt-2 text-xl font-light text-ink-900">{project.title}</h3>
        <p className="mt-1.5 text-sm text-ink-700/70">
          {[project.apartment, project.areaSupply].filter(Boolean).join("  ·  ")}
        </p>
      </div>
    </Link>
  );
}
