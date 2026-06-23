import { NextResponse } from "next/server";
import { createConsultEntry } from "@/lib/notion";
import type { ConsultInput } from "@/lib/types";

export const dynamic = "force-dynamic";

// 단순 메모리 레이트리밋 (서버 인스턴스별)
const hits = new Map<string, { count: number; ts: number }>();
const WINDOW = 60_000;
const LIMIT = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.ts > WINDOW) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  rec.count++;
  return rec.count > LIMIT;
}

async function notify(input: ConsultInput) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `📩 새 상담 신청\n이름: ${input.name}\n연락처: ${input.phone}\n평형: ${input.sizeCategory ?? "-"}\n지역: ${input.region ?? "-"}\n예산: ${input.budget ?? "-"}\n내용: ${input.message ?? "-"}`,
      }),
    });
  } catch {
    /* 알림 실패는 무시 */
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let body: ConsultInput;
  try {
    body = (await req.json()) as ConsultInput;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 허니팟: 봇이 채우면 성공처럼 응답하되 무시
  if (body.company) return NextResponse.json({ ok: true });

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }

  const input: ConsultInput = {
    name: body.name.trim().slice(0, 100),
    phone: body.phone.trim().slice(0, 40),
    sizeCategory: body.sizeCategory?.slice(0, 40),
    region: body.region?.slice(0, 200),
    budget: body.budget?.slice(0, 100),
    message: body.message?.slice(0, 4000),
  };

  try {
    await createConsultEntry(input);
    await notify(input);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "전송 실패" }, { status: 500 });
  }
}
