-- PLANO 포트폴리오 동기화 캐시 스키마
-- Notion(노출 ✓ 행) → 이 테이블로 동기화되며, 사이트는 여기서만 읽는다.

-- ───────────────────────────── projects
create table if not exists public.projects (
  id                    uuid primary key default gen_random_uuid(),
  notion_page_id        text unique not null,
  no                    integer not null,
  title                 text not null,
  subtitle              text,
  apartment             text,
  size_category         text not null,           -- 10PY/20PY/30PY/40PY/50PY~
  type                  text,
  area_supply           text,
  area_exclusive        text,
  completion_year       integer,
  region                text,
  period                text,
  cover_url             text,
  sort_order            integer default 0,
  notion_last_edited_at timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
create index if not exists projects_no_idx   on public.projects (no);
create index if not exists projects_sort_idx on public.projects (sort_order);

-- ───────────────────────────── project_images
create table if not exists public.project_images (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  room         text not null,                    -- 공간 탭 라벨 (거실/주방/…)
  image_url    text not null,                    -- Supabase Storage public URL
  storage_path text,
  sort_order   integer default 0,
  source_id    text,                             -- Notion 원본 식별자(증분 재사용 키)
  created_at   timestamptz default now()
);
create index if not exists project_images_project_idx on public.project_images (project_id);
create index if not exists project_images_source_idx  on public.project_images (source_id);

-- ───────────────────────────── RLS (공개 읽기 전용; 쓰기는 service_role)
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;

drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects
  for select using (true);

drop policy if exists "public read images" on public.project_images;
create policy "public read images" on public.project_images
  for select using (true);

-- ───────────────────────────── Storage 버킷 (공개)
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;
