import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project }: { project: Project }) {
  // 호버 시 보여줄 2번째 사진 (조명 off→on 같은 전환 효과). 없으면 줌만.
  const hoverSrc = project.images.find((im) => im.imageUrl !== project.coverUrl)?.imageUrl;
  return (
    <Link href={`/portfolio/${project.no}`} className="block">
      {/* 모바일은 세로로 큰 사진(4:3)으로 몰입감 ↑, 데스크톱(2단)은 16:10 유지 */}
      <div className="group relative aspect-[4/3] overflow-hidden bg-sand-200 sm:aspect-[16/10]">
        <Image
          src={project.coverUrl}
          alt={`${project.title} 대표 이미지`}
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
}
