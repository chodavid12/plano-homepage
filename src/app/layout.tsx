import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingInquiry from "@/components/layout/FloatingInquiry";

export const metadata: Metadata = {
  metadataBase: new URL("https://planodesign.kr"),
  title: {
    default: "PLANO DESIGN — 플라노디자인",
    template: "%s | PLANO DESIGN",
  },
  description:
    "플라노디자인 — 주거 공간의 설계부터 시공까지. 감각적인 인테리어 포트폴리오와 상담 신청.",
  openGraph: {
    title: "PLANO DESIGN — 플라노디자인",
    description: "주거 공간의 설계부터 시공까지, 플라노디자인의 인테리어 포트폴리오.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingInquiry />
      </body>
    </html>
  );
}
