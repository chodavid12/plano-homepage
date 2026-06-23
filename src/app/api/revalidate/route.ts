import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

// 외부(예: Notion 자동화)에서 시크릿과 함께 호출 → 포트폴리오 캐시 갱신
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const url = new URL(req.url);
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    url.searchParams.get("secret");

  if (secret && provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  revalidateTag("portfolio");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
