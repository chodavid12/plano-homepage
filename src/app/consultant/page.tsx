import type { Metadata } from "next";
import ProcessStepper from "@/components/consultant/ProcessStepper";

const CONSULT_FORM_URL =
  "https://copper-curtain-f8f.notion.site/1f2b42808b588041a20de7f53366e88d?pvs=105";

// 지점 — 네이버 플레이스 공유 링크(naver.me 단축). address 는 있으면 표시, 없으면 지점명만.
const BRANCHES: { name: string; address?: string; map: string }[] = [
  { name: "흑석점", map: "https://naver.me/xGIEU2nU" },
  { name: "마포점", map: "https://naver.me/FNIDfHEC" },
];

export const metadata: Metadata = {
  title: "CONSULTANT",
  description: "플라노디자인 상담 신청 — 상담부터 준공·사후관리까지 4단계 프로세스로 함께합니다.",
};

export default function ConsultantPage() {
  return (
    <div className="container-site py-20 md:py-28">
      <header className="mx-auto max-w-2xl animate-fade-up text-center">
        <p className="overline">Consultant</p>
        <h1 className="mt-4 text-3xl md:text-4xl">상담 신청</h1>
        <p className="mt-5 font-light leading-relaxed text-ink-700/70">
          상담부터 준공, 사후관리까지 —
          <br className="hidden sm:block" />
          플라노디자인은 아래 4단계로 함께합니다.
        </p>
      </header>

      {/* 프로세스 */}
      <section className="mt-14 md:mt-20">
        <ProcessStepper />
      </section>

      {/* 상담 신청 — 노션 폼으로 연결 */}
      <section className="mx-auto mt-20 max-w-xl border-t border-sand-200 pt-16 text-center md:mt-24 md:pt-20">
        <p className="overline">Get in touch</p>
        <h2 className="mt-3 text-2xl md:text-3xl">지금 상담 신청하기</h2>
        <p className="mt-4 text-sm font-light leading-relaxed text-ink-700/70">
          아래 버튼을 눌러 상담 신청서를 작성해 주세요.
          <br className="hidden sm:block" />
          담당자가 확인 후 연락드립니다.
        </p>
        <a
          href={CONSULT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-dark mt-9 min-w-[240px]"
        >
          상담 신청하기
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>

      {/* 찾아오시는 길 — 관심이 생긴 뒤 확인하는 위치·안심 정보. CTA 다음, 푸터 CONTACT 위 */}
      <section className="mx-auto mt-20 max-w-2xl border-t border-sand-200 pt-16 md:mt-24 md:pt-20">
        <div className="text-center">
          <p className="overline">Visit us</p>
          <h2 className="mt-3 text-2xl md:text-3xl">찾아오시는 길</h2>
          <p className="mt-4 text-sm font-light leading-relaxed text-ink-700/70">
            상담은 흑석·마포 두 지점에서 진행됩니다.{" "}
            <br className="hidden sm:block" />
            가까운 지점의 위치를 지도에서 확인해 보세요.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {BRANCHES.map((b) => (
            <a
              key={b.name}
              href={b.map}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between border border-sand-300 px-6 py-5 transition-colors hover:border-ink-800 hover:bg-sand-100"
            >
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-wood-500" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="2.2" />
                </svg>
                <span>
                  <span className="block text-base font-medium text-ink-900">{b.name}</span>
                  {b.address && <span className="mt-0.5 block text-sm text-ink-700/70">{b.address}</span>}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-700/70 transition-colors group-hover:text-ink-900">
                네이버 지도
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
