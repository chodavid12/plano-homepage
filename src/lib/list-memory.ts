// 포트폴리오 목록 "이어서 보기" — 상세를 보고 돌아왔을 때 보던 위치·불러온 사진 수·필터를 복원한다.
// (개발 용어로 scroll restoration / 목록 상태 복원)
//
// 브라우저 기본 복원은 "돌아온 순간 페이지 높이"까지만 스크롤을 되돌린다. 공간별 보기처럼
// 스크롤하며 사진을 이어 붙이는(무한 스크롤) 목록은 돌아오면 첫 30장으로 리셋돼 높이가
// 모자라고, 위치가 잘린다. 그래서 위치와 불러온 개수를 sessionStorage 에 직접 기억한다.
// sessionStorage: 탭 단위로만 남고 탭을 닫으면 사라진다 — 다른 방문에 섞이지 않는다.

const P = "plano:list:";
const LIST_URL = `${P}url`; // 마지막으로 보던 목록 URL(필터·검색 포함)
const RESTORE = `${P}restore`; // 다음에 목록이 열릴 때 위치를 복원하라는 표시
const FROM = `${P}from`; // 목록에서 눌러 들어간 상세 경로
const yKey = (url: string) => `${P}y:${url}`;
const nKey = (url: string) => `${P}n:${url}`;

function get(k: string): string | null {
  try {
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
}
function set(k: string, v: string) {
  try {
    sessionStorage.setItem(k, v);
  } catch {
    /* 사생활 보호 모드 등 — 복원만 안 될 뿐 사이트는 정상 동작 */
  }
}
function del(k: string) {
  try {
    sessionStorage.removeItem(k);
  } catch {
    /* noop */
  }
}

export const currentUrl = () => window.location.pathname + window.location.search;
export const isListPath = (path: string) => path === "/portfolio";

export const rememberListUrl = (url: string) => set(LIST_URL, url);
export const savedListUrl = () => get(LIST_URL);

export const saveScroll = (url: string, y: number) => set(yKey(url), String(Math.round(y)));
export const savedScroll = (url: string) => {
  const v = Number(get(yKey(url)));
  return Number.isFinite(v) && v > 0 ? v : null;
};

export const saveCount = (url: string, n: number) => set(nKey(url), String(n));
export const savedCount = (url: string) => {
  const v = Number(get(nKey(url)));
  return Number.isFinite(v) && v > 0 ? v : null;
};

export const markRestore = () => set(RESTORE, "1");
export const pendingRestore = () => get(RESTORE) === "1";
export const clearRestore = () => del(RESTORE);

export const rememberFrom = (detailPath: string) => set(FROM, detailPath);
export const cameFromList = (detailPath: string) => get(FROM) === detailPath;

// 브라우저 뒤로/앞으로 가기로 목록에 도착하면 복원 표시를 남긴다.
// popstate 시점엔 location 이 이미 도착지 URL 이라 목록일 때만 표시한다
// (다른 페이지의 뒤로가기 표시가 남아 있다가, 나중에 메뉴로 들어온 목록이 엉뚱하게 복원되지 않도록).
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    if (isListPath(window.location.pathname)) markRestore();
  });
}
