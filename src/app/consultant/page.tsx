import type { Metadata } from "next";
import ConsultForm from "@/components/consultant/ConsultForm";

export const metadata: Metadata = {
  title: "CONSULTANT",
  description: "플라노디자인 상담 신청 — 공간과 일정을 알려주시면 맞춤 상담을 도와드립니다.",
};

export default function ConsultantPage() {
  return (
    <div className="container-site py-20 md:py-28">
      <div className="mx-auto max-w-xl animate-fade-up">
        <header className="mb-12 text-center">
          <p className="overline">Consultant</p>
          <h1 className="mt-4 text-3xl md:text-4xl">상담 신청</h1>
          <p className="mt-5 font-light leading-relaxed text-ink-700/70">
            아래 정보를 남겨주시면 담당자가 확인 후 연락드립니다.
            <br className="hidden sm:block" />
            편하게 문의해 주세요.
          </p>
        </header>
        <ConsultForm />
      </div>
    </div>
  );
}
