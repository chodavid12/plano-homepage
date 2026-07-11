import type { Metadata } from "next";
import ProcessStepper from "@/components/consultant/ProcessStepper";

const CONSULT_FORM_URL =
  "https://copper-curtain-f8f.notion.site/1f2b42808b588041a20de7f53366e88d?pvs=105";

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
    </div>
  );
}
