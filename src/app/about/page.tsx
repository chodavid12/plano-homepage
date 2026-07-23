import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import PhilosophyIndex, { type IndexItem } from "@/components/about/PhilosophyIndex";

export const metadata: Metadata = {
  title: "ABOUT",
  description:
    "PLANO의 경영철학 — 실용성 이후에 심미성, 비용 이상의 결과물, 현장에서 지는 책임.",
};

interface Principle {
  no: string;
  title: string;
  image: string;
  paragraphs: string[]; // **...** 구간은 강조 처리
  highlight?: string; // 핵심 결론 — 액센트 콜아웃
}

const PRINCIPLES: Principle[] = [
  {
    no: "01",
    title: "실용성 이후에 심미성",
    image: "/portfolio/r1.webp",
    paragraphs: [
      "PLANO는 **Modern & Natural**을 기반으로 작업합니다. 형태보다 먼저, 생활에서의 사용성과 유지 가능성을 기준으로 공간을 판단합니다.",
      "디자인을 결정할 때 항상 같은 질문에서 출발합니다. 시간이 지나도 불편하지 않을지, 일상의 사용 속에서 무리가 없을지, 오래 유지할 수 있는 선택인지에 대해 고민합니다.",
      "집은 보여지는 공간이 아니라, 살아가는 공간입니다. 심미성은 실용성이 갖춰진 이후에 의미를 갖는다고 생각합니다.",
    ],
    highlight: "PLANO는 사용을 전제로 한 균형 있는 디자인을 지향합니다.",
  },
  {
    no: "02",
    title: "비용 이상의 결과물",
    image: "/portfolio/r2.webp",
    paragraphs: [
      "예산의 크기보다 중요한 것은 그 안에서 어떤 선택을 하고, 어디에 집중하느냐 입니다.",
      "**불필요한 비용을 줄이고, 결과에 직접 영향을 주는 부분에 예산을 사용합니다.** 지불한 비용에 합당한 결과를 만드는 것을 기준으로 합니다.",
    ],
  },
  {
    no: "03",
    title: "현장에서 지는 책임",
    image: "/portfolio/r3.webp",
    paragraphs: [
      "현장에서의 선택이 곧 결과라고 생각합니다. 자재와 부자재는 보이지 않는 부분까지 기준을 적용하며, 필요하다면 비용이 더 들더라도 숙련된 인력을 투입합니다.",
      "단가를 낮추는 선택보다 완성도와 안정성을 지키는 판단이 현장에서의 책임이라고 보기 때문입니다.",
    ],
    highlight:
      "PLANO는 공정 전반을 현장의 기준으로 관리하며 마무리 이후까지 고려한 시공을 이어갑니다.",
  },
];

// 인덱스(목차) — 상세 본문을 한 줄로 압축
const SUMMARY: IndexItem[] = [
  {
    no: "01",
    title: "실용성 이후에 심미성",
    line: "사용성과 유지 가능성을 먼저, 심미성은 그 다음입니다.",
    image: "/portfolio/r1.webp",
  },
  {
    no: "02",
    title: "비용 이상의 결과물",
    line: "결과에 직접 영향을 주는 곳에 예산을 집중합니다.",
    image: "/portfolio/r2.webp",
  },
  {
    no: "03",
    title: "현장에서 지는 책임",
    line: "보이지 않는 부분까지, 마무리 이후까지 책임집니다.",
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
          <h1 className="relative mt-7 max-w-4xl text-[1.9rem] font-semibold leading-[1.38] tracking-tight text-ink-900 sm:text-[2.5rem] md:text-[3.15rem] md:leading-[1.3]">
            <span className="text-wood-500">PLANO의 경영철학</span>은
            <br />
            아래 3가지 키워드로 정리됩니다.
          </h1>
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
        {PRINCIPLES.map((p) => {
          // 본문이 짧은 항목(02)은 세로 이미지를 쓰면 우측에 빈 공간이 크게 남는다.
          // 분량에 따라 이미지 비율을 맞춰 좌우 높이를 비슷하게 유지.
          const tall = p.paragraphs.length >= 3 || Boolean(p.highlight);
          return (
          <section
            key={p.no}
            id={`principle-${p.no}`}
            className="container-site scroll-mt-24 border-b border-sand-200 py-20 last:border-b-0 md:py-28"
          >
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              {/* 좌 — 번호 · 이미지 (스크롤 중 고정) */}
              <div className="lg:sticky lg:top-28 lg:self-start">
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

                  <div
                    className={`relative mt-7 overflow-hidden bg-sand-200 ${
                      tall ? "aspect-[4/5]" : "aspect-[4/3]"
                    }`}
                  >
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

              {/* 우 — 제목 · 본문 · 결론 */}
              <div className="lg:pt-3">
                <BlurFade delay={0.1} inView>
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
              PLANO와 함께 공간을 계획해 보세요.
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
