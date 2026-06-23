import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm tracking-[0.2em] text-wood-600">404</p>
      <h1 className="mt-4 text-2xl text-ink-900">페이지를 찾을 수 없습니다.</h1>
      <p className="mt-3 text-sm text-ink-700/60">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link href="/" className="btn btn-ghost mt-8">
        홈으로
      </Link>
    </div>
  );
}
