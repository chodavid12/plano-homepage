import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import PhilosophyIndex, { type IndexItem } from "@/components/about/PhilosophyIndex";

export const metadata: Metadata = {
  title: "ABOUT",
  description:
    "플라노디자인이 지켜온 세 가지 기준 — Livable(오래 살아도 편안하게), Worth(비용보다 나은 결과), Detail(보이지 않는 곳까지).",
};

interface Principle {
  no: string;
  keyword: string; // 영문 키워드 (Livable/Worth/Detail)
  title: string;
  image: string;
  paragraphs: string[]; // **...** 구간은 강조 처리
  highlight?: string; // 핵심 결론 — 액센트 콜아웃
}

const PRINCIPLES: Principle[] = [
  {
    no: "01",
    keyword: "Livable",
    title: "오래 살아도 편안하게",
    image: "/portfolio/r1.webp",
    paragraphs: [
      "동선은 자연스러운지, 손이 닿는 곳은 편안한지, 시간이 지나도 무리가 없는지.",
      "집은 보여지는 공간이 아니라 살아가는 공간입니다. **Modern & Natural**의 담백함은 오래 살아도 질리지 않는 선택에서 시작됩니다.",
    ],
    highlight: "아름다움은 편안함 위에서 오래 머뭅니다.",
  },
  {
    no: "02",
    keyword: "Worth",
    title: "비용보다 나은 결과",
    image: "/portfolio/r2.webp",
    paragraphs: [
      "중요한 것은 예산의 크기가 아니라 그 쓰임입니다.",
      "**결과에 닿지 않는 비용은 줄이고, 매일 머무는 곳에 정성을 모읍니다.** 바닥, 주방, 욕실, 그리고 빛.",
    ],
    highlight: "같은 예산이라도, 결과는 달라질 수 있습니다.",
  },
  {
    no: "03",
    keyword: "Detail",
    title: "보이지 않는 곳까지",
    image: "/portfolio/r3.webp",
    paragraphs: [
      "완성은 현장에서 결정됩니다. 벽 안쪽, 바닥 아래. 마감 후에는 누구도 보지 못할 곳까지 같은 기준을 적용합니다.",
      "필요하다면 비용이 더 들더라도 숙련된 손을 선택합니다.",
    ],
    highlight: "좋은 인테리어는 보이지 않는 디테일에서 완성됩니다.",
  },
];

// 인덱스(목차) — 상세 본문을 한 줄로 압축
const SUMMARY: IndexItem[] = [
  {
    no: "01",
    keyword: "Livable",
    title: "오래 살아도 편안하게",
    line: "형태보다 먼저, 생활을 봅니다.",
    image: "/portfolio/r1.webp",
  },
  {
    no: "02",
    keyword: "Worth",
    title: "비용보다 나은 결과",
    line: "예산은 결과가 달라지는 곳에.",
    image: "/portfolio/r2.webp",
  },
  {
    no: "03",
    keyword: "Detail",
    title: "보이지 않는 곳까지",
    line: "벽 안쪽, 바닥 아래, 그리고 끝난 뒤까지.",
    image: "/portfolio/r3.webp",
  },
];

// **...** 마크업을 <strong>으로 변환
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink-900">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function AboutPage() {
  return (
    <div>
      {/* ── 오프닝 — 여백으로 시작하는 선언 ───────────────────────── */}
      <section className="container-site relative pt-24 md:pt-36">
        {/* 워터마크 심볼 — 헤드라인 뒤로 흐르게 */}
        <div
          className="pointer-events-none absolute -top-4 right-0 hidden w-[300px] opacity-[0.07] md:block lg:w-[380px]"
          aria-hidden="true"
        >
          <Image src="/brand/symbol-white.png" alt="" width={380} height={380} className="w-full invert" />
        </div>

        <BlurFade delay={0.05}>
          <p className="overline">About · Philosophy</p>
        </BlurFade>

        <BlurFade delay={0.15}>
          <h1 className="relative mt-7 max-w-4xl text-[2.1rem] font-semibold leading-[1.3] tracking-tight text-ink-900 sm:text-[2.7rem] md:text-[3.3rem] md:leading-[1.22]">
            살아갈수록,
            <br />
            <span className="text-wood-500">편안한 집.</span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.24}>
          <p className="mt-8 max-w-xl text-[1rem] font-light leading-[1.9] text-ink-800/80 md:text-[1.06rem]">
            10년, 대부분의 공간은 먼저 살아본 분들의 소개로 이어졌습니다.
            플라노디자인이 지켜온 세 가지 기준입니다.
          </p>
        </BlurFade>

        {/* 얇은 우드 룰 — 선언과 목차를 가르는 유일한 장치 */}
        <BlurFade delay={0.3}>
          <div className="mt-14 flex items-center gap-4 md:mt-20">
            <span className="h-px w-14 bg-wood-500" />
            <span className="font-display text-[0.68rem] uppercase tracking-[0.22em] text-ink-700/50">
              Three Standards
            </span>
          </div>
        </BlurFade>
      </section>

      {/* ── 인덱스 — 호버하면 우측 프리뷰가 바뀐다 ─────────────────── */}
      <section className="container-site pb-24 pt-10 md:pb-32 md:pt-14">
        <BlurFade delay={0.1} inView>
          <PhilosophyIndex items={SUMMARY} />
        </BlurFade>
      </section>

      {/* ── 본문 — 좌측 레일 고정 / 우측 텍스트 스크롤 ──────────────── */}
      <div className="border-t border-sand-200 bg-sand-100/40">
        {PRINCIPLES.map((p, i) => {
          // 지그재그 — 홀수 항목(02)은 이미지를 오른쪽으로 보내 일렬 느낌을 깬다.
          const flipped = i % 2 === 1;
          return (
          <section
            key={p.no}
            id={`principle-${p.no}`}
            className="container-site scroll-mt-24 border-b border-sand-200 py-20 last:border-b-0 md:py-28"
          >
            <div
              className={`grid gap-10 lg:gap-20 ${
                flipped ? "lg:grid-cols-[1.15fr_0.85fr]" : "lg:grid-cols-[0.85fr_1.15fr]"
              }`}
            >
              {/* 번호 · 이미지 (스크롤 중 고정) — flipped 면 데스크톱에서 우측 */}
              <div className={`lg:sticky lg:top-28 lg:self-start ${flipped ? "lg:order-2" : "lg:order-1"}`}>
                <BlurFade inView>
                  <div className="flex items-center gap-5">
                    <span
                      className="font-display text-5xl font-light leading-none text-transparent md:text-6xl"
                      style={{ WebkitTextStroke: "1px #C3A87F" }}
                    >
                      {p.no}
                    </span>
                    <span className="h-px flex-1 bg-sand-300" />
                  </div>

                  <div className="relative mt-7 aspect-[4/5] overflow-hidden bg-sand-200">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink-900/5" />
                  </div>
                </BlurFade>
              </div>

              {/* 제목 · 본문 · 결론 — flipped 면 데스크톱에서 좌측 */}
              <div className={`lg:pt-3 ${flipped ? "lg:order-1" : "lg:order-2"}`}>
                <BlurFade delay={0.1} inView>
                  <p className="overline mb-3">{p.keyword}</p>
                  <h2 className="text-[1.75rem] font-semibold leading-snug tracking-tight text-ink-900 md:text-[2.15rem]">
                    {p.title}
                  </h2>
                </BlurFade>

                <div className="mt-8 max-w-[46ch] space-y-6 text-[1rem] font-light leading-[1.9] text-ink-800/85 md:mt-10 md:text-[1.06rem]">
                  {p.paragraphs.map((para, j) => (
                    <BlurFade key={j} delay={0.16 + j * 0.07} inView>
                      <p>
                        <RichText text={para} />
                      </p>
                    </BlurFade>
                  ))}
                </div>

                {p.highlight && (
                  <BlurFade delay={0.3} inView>
                    {/* 결론 — 본문과 다른 무게로 떨어뜨린다 */}
                    <figure className="mt-12 max-w-[42ch] border-t border-wood-400/50 pt-7 md:mt-14">
                      <blockquote className="text-[1.15rem] font-medium leading-[1.65] tracking-tight text-ink-900 md:text-[1.35rem]">
                        {p.highlight}
                      </blockquote>
                    </figure>
                  </BlurFade>
                )}
              </div>
            </div>
          </section>
          );
        })}
      </div>

      {/* ── 닫는 CTA ─────────────────────────────────────────────── */}
      <section className="container-site py-24 md:py-32">
        <BlurFade inView>
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-[1.35rem] font-light leading-snug tracking-tight text-ink-900 md:text-[1.7rem]">
              일상에 꼭 맞는 공간을,
              <br className="hidden sm:block" />
              PLANO와 함께 계획해 보세요.
            </p>
            <Link href="/consultant" className="btn btn-dark min-w-[200px] shrink-0">
              상담 신청
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </BlurFade>
      </section>
    </div>
  );
}
