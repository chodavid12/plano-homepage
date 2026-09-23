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
  focus?: string; // 크롭 위치(object-position) — 기본 center, 예: "object-[20%_center]"
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
      "동선은 자연스러운지, 손이 닿는 곳은 편안한지, 시간이 지나도 무리가 없는지. 디자인을 정하기 전에 늘 이 질문에서 출발합니다.",
      "집은 보여지는 공간이 아니라 살아가는 공간입니다. 사진 한 장을 위해 생활을 불편하게 만드는 선택은 하지 않습니다. 고객의 집은 포트폴리오를 채우기 위한 소재가 아니라, 누군가 오래 머물 집이기 때문입니다.",
      "생활의 쓰임을 먼저 풀고, 그 위에 화이트와 우드의 담백한 미감을 더합니다. **Modern & Natural**의 담백함은 유행이 지나도 어색하지 않은 선택에서 시작됩니다.",
    ],
    highlight: "아름다움은 편안함 위에서 오래 머뭅니다.",
  },
  {
    no: "02",
    keyword: "Worth",
    title: "비용보다 나은 결과",
    image: "/portfolio/r2.webp",
    paragraphs: [
      "중요한 것은 예산의 크기가 아니라 그 쓰임입니다. 결과에 닿지 않는 비용은 줄이고, 매일 머무는 곳에 정성을 모읍니다. 바닥, 주방, 욕실, 그리고 빛.",
      "무엇에 얼마가 쓰이는지는 처음부터 분명해야 합니다. **3D 도면과 스펙북**으로 완성될 모습과 들어갈 자재를 미리 확인하고, 실측 후 수정 견적으로 한 번 더 점검합니다.",
      "**공사대금은 후불제로 운영합니다.** 잔금은 준공 2주 후, 완성된 공간을 충분히 확인하신 뒤에 받습니다.",
    ],
    highlight: "같은 예산이라도, 결과는 달라질 수 있습니다.",
  },
  {
    no: "03",
    keyword: "Detail",
    title: "보이지 않는 곳까지",
    image: "/portfolio/r3.webp",
    focus: "object-[20%_center]", // 창가 펜던트 조명이 다 보이게 왼쪽으로
    paragraphs: [
      "완성은 현장에서 결정됩니다. 벽 안쪽, 바닥 아래. 마감 후에는 누구도 보지 못할 곳까지 같은 기준을 적용합니다. 필요하다면 비용이 더 들더라도 숙련된 손을 선택합니다.",
      "현장은 대표 또는 관리자가 직접 살핍니다. 공정마다 현장 사진을 단톡방으로 공유해, 멀리 계셔도 집이 만들어지는 과정을 함께 보실 수 있습니다.",
      "공사의 끝은 마감이 아니라 관계의 시작입니다. 입주 후에도 잘 지내시는지 살피고, **1년간 하자를 책임집니다.** 몇 년이 지나 다시 플라노를 찾아주시는 것, 그 오랜 신뢰를 가장 큰 목표로 둡니다.",
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
    focus: "object-[20%_center]",
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
    <div className="about-shell">
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
            당신의 하루를
            <br />
            <span className="text-wood-500">짓습니다.</span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.24}>
          <div className="mt-8 max-w-5xl space-y-5 break-keep text-[1rem] font-light leading-[1.9] text-ink-800/80 md:text-[1.06rem]">
            <p>
              플라노디자인은 서울 마포와 흑석에서 주거 공간의 설계부터 시공까지 직접 맡는 인테리어 스튜디오입니다.
              <br />
              지난 15년, 대부분의 공간은 먼저 살아본 분들의 소개로 이어졌습니다.
            </p>
            <p>
              한 건의 공사를 마치는 것이 아니라
              <br />
              오래 살 집과 오래갈 관계를 만드는 일.
              <br />
              플라노디자인이 지켜온 세 가지 기준입니다.
            </p>
          </div>
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
          // 02(홀수)만 사진을 오른쪽으로, 글은 왼쪽에서 우측 정렬 → 글이 이미지에 붙는다.
          const flipped = i % 2 === 1;
          return (
          <section
            key={p.no}
            id={`principle-${p.no}`}
            className="container-site scroll-mt-24 border-b border-sand-200 py-20 last:border-b-0 md:py-28"
          >
            <div
              className="grid gap-10 lg:grid-cols-2 lg:gap-20 xl:gap-28"
            >
              {/* 번호 · 이미지 (스크롤 중 고정) — 02(flipped)은 우측 */}
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
                      className={`object-cover ${p.focus ?? ""}`}
                    />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink-900/5" />
                  </div>
                </BlurFade>
              </div>

              {/* 제목 · 본문 · 결론 — 기본은 우측·좌측정렬 / 02 은 좌측에서 우측정렬 */}
              <div
                className={`flex flex-col justify-center ${
                  flipped ? "lg:order-1 lg:items-end" : "lg:order-2 lg:items-start"
                }`}
              >
                <div className={`w-full lg:max-w-[32rem] ${flipped ? "lg:text-right break-keep" : ""}`}>
                  <BlurFade delay={0.1} inView>
                    <p className="overline mb-3">{p.keyword}</p>
                    <h2 className="text-[1.75rem] font-semibold leading-snug tracking-tight text-ink-900 md:text-[2.15rem]">
                      {p.title}
                    </h2>
                  </BlurFade>

                  <div className="mt-8 space-y-6 text-[1rem] font-light leading-[1.9] text-ink-800/85 md:mt-10 md:text-[1.06rem]">
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
                      <figure className="mt-12 border-t border-wood-400/50 pt-7 md:mt-14">
                        <blockquote className="text-[1.15rem] font-medium leading-[1.65] tracking-tight text-ink-900 md:text-[1.35rem]">
                          {p.highlight}
                        </blockquote>
                      </figure>
                    </BlurFade>
                  )}
                </div>
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
              오래 머물 집을,
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
