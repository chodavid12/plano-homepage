"use client";

import { useState } from "react";
import { SIZE_FILTERS } from "@/lib/rooms";

type Status = "idle" | "submitting" | "success" | "error";

export default function ConsultForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "전송에 실패했습니다.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "전송에 실패했습니다.");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-sand-200 bg-sand-100 p-12 text-center">
        <h2 className="text-xl text-ink-900">상담 신청이 접수되었습니다.</h2>
        <p className="mt-3 text-sm text-ink-700/70">
          빠른 시일 내에 담당자가 연락드리겠습니다. 감사합니다.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn btn-ghost mt-8"
        >
          새 상담 신청
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* 허니팟 (봇 차단) */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px]"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="name">
            이름 *
          </label>
          <input id="name" name="name" required className="field" placeholder="홍길동" />
        </div>
        <div>
          <label className="field-label" htmlFor="phone">
            연락처 *
          </label>
          <input
            id="phone"
            name="phone"
            required
            className="field"
            placeholder="010-0000-0000"
            inputMode="tel"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="sizeCategory">
            희망 평형
          </label>
          <select id="sizeCategory" name="sizeCategory" className="field" defaultValue="">
            <option value="" disabled>
              선택
            </option>
            {SIZE_FILTERS.filter((f) => f.value !== "all").map((f) => (
              <option key={f.value} value={f.label}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="region">
            지역
          </label>
          <input id="region" name="region" className="field" placeholder="서울시 ○○구" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="budget">
            예산
          </label>
          <input id="budget" name="budget" className="field" placeholder="예: 5,000만원" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="message">
            문의 내용
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="field resize-none"
            placeholder="공간 상황, 일정, 원하시는 스타일 등을 적어주세요."
          />
        </div>
      </div>

      {status === "error" && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={status === "submitting"} className="btn btn-dark w-full disabled:opacity-60">
        {status === "submitting" ? "전송 중…" : "상담 신청하기"}
      </button>
      <p className="text-center text-xs text-ink-700/50">
        제출하신 정보는 상담 목적으로만 이용됩니다.
      </p>
    </form>
  );
}
