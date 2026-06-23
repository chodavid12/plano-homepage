import type { SizeCategory } from "./types";

// 상세 페이지 공간 탭 정렬 순서 (Notion "공간" Select 값과 일치)
export const ROOM_ORDER = [
  "거실",
  "주방",
  "복도",
  "현관",
  "침실",
  "드레스룸",
  "욕실",
  "서재",
  "발코니",
  "기타",
] as const;

export function roomRank(room: string): number {
  const i = ROOM_ORDER.indexOf(room as (typeof ROOM_ORDER)[number]);
  return i === -1 ? ROOM_ORDER.length : i;
}

// 평형 필터 옵션
export const SIZE_FILTERS: { label: string; value: SizeCategory | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "10PY", value: "10PY" },
  { label: "20PY", value: "20PY" },
  { label: "30PY", value: "30PY" },
  { label: "40PY", value: "40PY" },
  { label: "50PY~", value: "50PY~" },
];
