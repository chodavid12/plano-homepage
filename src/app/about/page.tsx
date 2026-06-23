import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ABOUT",
  description: "플라노디자인 소개 — 공간을 읽고, 삶의 결을 설계합니다.",
};

const PROCESS = [
  { step: "01", title: "상담 · 현장 실측", desc: "공간과 라이프스타일을 파악하고 방향을 정합니다." },
  { step: "02", title: "설계 · 3D 제안", desc: "동선과 마감을 구체화한 설계안을 제안합니다." },
  { step: "03", title: "시공", desc: "검증된 시공팀과 함께 디테일까지 완성합니다." },
  { step: "04", title: "검수 · 사후관리", desc: "꼼꼼한 검수와 입주 후 관리까지 책임집니다." },
];

export default function AboutPage() {
  return (
    <div className="container-site py-20 md:py-28">
      <section className="max-w-2xl animate-fade-up">
        <p className="overline">About Plano</p>
        <h1 className="mt-5 text-4xl leading-[1.3] md:text-5xl">
          공간을 읽고,
          <br />
          삶의 결을 설계합니다.
        </h1>
        <p className="mt-7 text-lg font-light leading-relaxed text-ink-700/80">
          플라노디자인은 주거 공간의 설계부터 시공까지 전 과정을 함께합니다. 화려함보다 오래
          머물러도 편안한 비례와 질감, 그리고 사용하는 사람의 하루에 집중합니다. 따뜻한 우드와
          담백한 화이트를 기본으로, 공간마다 다른 이야기를 담아냅니다.
        </p>
      </section>

      <section className="mt-24">
        <p className="overline">Process</p>
        <div className="mt-8 grid gap-px overflow-hidden border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p) => (
            <div key={p.step} className="bg-sand-50 p-8 transition-colors hover:bg-sand-100">
              <span className="text-3xl font-light text-wood-500">{p.step}</span>
              <h3 className="mt-5 text-lg">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-700/70">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
