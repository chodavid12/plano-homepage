import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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

// 상단 요약 인포그래픽용 — 상세 본문을 한 줄로 압축
const SUMMARY = [
  {
    no: "01",
    title: "실용성 이후에 심미성",
    line: "사용성과 유지 가능성을 먼저, 심미성은 그 다음입니다.",
  },
  {
    no: "02",
    title: "비용 이상의 결과물",
    line: "결과에 직접 영향을 주는 곳에 예산을 집중합니다.",
  },
  {
    no: "03",
    title: "현장에서 지는 책임",
    line: "보이지 않는 부분까지, 마무리 이후까지 책임집니다.",
  },
];

// 원형 회전 태그라인 배지 — 중앙에 심볼
function CircleBadge() {
  const tagline = "PLANO DESIGN · MODERN & NATURAL · SPACE PLANNING · ";
  return (
    <div className="relative h-60 w-60 sm:h-72 sm:w-72 md:h-80 md:w-80">
      <svg
        viewBox="0 0 220 220"
        className="h-full w-full animate-spin-slow text-white/75"
        aria-hidden="true"
      >
        <defs>
          <path
            id="essentials-arc"
            d="M110,110 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"
            fill="none"
          />
        </defs>
        <text className="fill-current text-[9px] uppercase tracking-[0.2em]">
          <textPath href="#essentials-arc" startOffset="0">
            {tagline}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/brand/symbol-white.png"
          alt="PLANO"
          width={200}
          height={200}
          className="w-[34%] opacity-95"
        />
      </div>
    </div>
  );
}

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
      {/* 인트로 — 경영철학 헤드라인 */}
      <section className="container-site pt-20 pb-14 md:pt-28 md:pb-20">
        <p className="overline animate-fade-up">About · Philosophy</p>
        <h1 className="mt-6 max-w-3xl animate-fade-up text-[1.75rem] font-semibold leading-[1.4] tracking-tight text-ink-900 sm:text-4xl md:text-[2.7rem] md:leading-[1.32]">
          <span className="text-wood-500">PLANO의 경영철학</span>은
          <br />
          아래 3가지 키워드로 정리됩니다.
        </h1>
      </section>

      {/* 요약 인포그래픽 — 한눈에 보는 3가지 (Our Essentials) */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/portfolio/r2.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-ink-900/75" />
        </div>

        <div className="container-site relative grid items-center gap-14 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
          <div>
            <p className="overline text-wood-400">Our Essentials</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-[2.6rem]">
              한눈에 보는 3가지 기준
            </h2>

            <ul className="mt-12 space-y-9 md:mt-14">
              {SUMMARY.map((s) => (
                <li
                  key={s.no}
                  className="flex gap-5 border-l border-white/15 pl-5 sm:gap-6"
                >
                  <span className="shrink-0 text-sm font-medium leading-7 text-wood-400">
                    {s.no}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-white md:text-2xl">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/65 md:text-base">
                      {s.line}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center md:justify-end">
            <CircleBadge />
          </div>
        </div>
      </section>

      {/* 3가지 키워드 — 이미지/텍스트 교차 */}
      <div className="space-y-24 pt-24 pb-24 md:space-y-32 md:pt-32 md:pb-32">
        {PRINCIPLES.map((p, i) => {
          const flipped = i % 2 === 1;
          return (
            <section key={p.no} className="container-site">
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                {/* 이미지 */}
                <div
                  className={`relative aspect-[4/3] overflow-hidden bg-sand-200 ${
                    flipped ? "lg:order-2" : ""
                  }`}
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {/* 텍스트 */}
                <div className={flipped ? "lg:order-1" : ""}>
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-light leading-none text-wood-400 md:text-5xl">
                      {p.no}
                    </span>
                    <h2 className="text-2xl font-semibold tracking-tight text-ink-900 md:text-[1.7rem]">
                      {p.title}
                    </h2>
                  </div>

                  <div className="mt-7 max-w-xl space-y-5 text-[0.97rem] leading-[1.85] text-ink-700/85 md:text-base">
                    {p.paragraphs.map((para, j) => (
                      <p key={j}>
                        <RichText text={para} />
                      </p>
                    ))}
                  </div>

                  {p.highlight && (
                    <p className="mt-8 max-w-xl border-l-2 border-wood-400 pl-5 text-base font-medium leading-relaxed text-ink-900 md:text-lg">
                      {p.highlight}
                    </p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* 닫는 CTA */}
      <section className="container-site pb-24 md:pb-32">
        <div className="flex flex-col items-start gap-6 border-t border-sand-200 pt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-light text-ink-800">
            PLANO와 함께 공간을 계획해 보세요.
          </p>
          <Link href="/consultant" className="btn btn-dark min-w-[190px]">
            상담 신청
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
