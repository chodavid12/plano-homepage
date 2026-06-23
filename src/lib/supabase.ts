import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "portfolio";

export function isSupabaseConfigured(): boolean {
  return Boolean(url && (anon || service));
}

/** 읽기용(공개) 클라이언트 — 사이트 렌더링에서 사용 */
export function getReadClient(): SupabaseClient | null {
  if (!url || !(anon || service)) return null;
  return createClient(url, (anon || service) as string, {
    auth: { persistSession: false },
  });
}

/** 쓰기용(서비스 롤) 클라이언트 — 동기화 잡에서만 사용 */
export function getServiceClient(): SupabaseClient | null {
  if (!url || !service) return null;
  return createClient(url, service, { auth: { persistSession: false } });
}
