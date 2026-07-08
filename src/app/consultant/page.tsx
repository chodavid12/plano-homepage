import type { Metadata } from "next";
import ConsultForm from "@/components/consultant/ConsultForm";
import ProcessStepper from "@/components/consultant/ProcessStepper";

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

      {/* 상담 폼 */}
      <section className="mx-auto mt-20 max-w-xl border-t border-sand-200 pt-16 md:mt-24 md:pt-20">
        <div className="mb-10 text-center">
          <p className="overline">Get in touch</p>
          <h2 className="mt-3 text-2xl md:text-3xl">지금 상담 신청하기</h2>
          <p className="mt-4 text-sm font-light leading-relaxed text-ink-700/70">
            정보를 남겨주시면 담당자가 확인 후 연락드립니다.
          </p>
        </div>
        <ConsultForm />
      </section>
    </div>
  );
}
