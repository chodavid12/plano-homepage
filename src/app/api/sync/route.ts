import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { runSync } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return true; // 미설정 시 개방(개발). 운영에선 반드시 설정.
  const url = new URL(req.url);
  const header = req.headers.get("authorization");
  const bearer = header?.replace(/^Bearer\s+/i, "");
  return bearer === secret || url.searchParams.get("secret") === secret;
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";

  try {
    const result = await runSync({ force });
    if (result.ok) revalidateTag("portfolio");
    return NextResponse.json(result, { status: result.ok ? 200 : 202 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
