-- MattYC Studio creation content (prefixed for the shared Supabase project)
-- Apply manually to the existing Supabase project. This migration does not alter
-- any existing shared-project table and does not add invented episode or work records.

create extension if not exists pgcrypto;

create table public.mattyc_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) > 0),
  subtitle text,
  description text,
  project_type text not null check (
    project_type in ('education', 'originals', 'experiment', 'collaboration', 'recording', 'other')
  ),
  cover_image_url text,
  featured boolean not null default false,
  featured_order integer check (featured_order is null or featured_order >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  start_date date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mattyc_projects_published_at_required
    check (status <> 'published' or published_at is not null)
);

create table public.mattyc_series (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.mattyc_projects(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) > 0),
  subtitle text,
  description text,
  cover_image_url text,
  featured boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  started_at date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mattyc_series_published_at_required
    check (status <> 'published' or published_at is not null)
);

create table public.mattyc_episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.mattyc_series(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) > 0),
  exercise_number integer check (exercise_number is null or exercise_number > 0),
  topic text,
  description text,
  thumbnail_url text,
  youtube_url text,
  tiktok_url text,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (series_id, episode_number),
  unique (series_id, slug),
  constraint mattyc_episodes_published_at_required
    check (status <> 'published' or published_at is not null)
);

create table public.mattyc_creative_works (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.mattyc_projects(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) > 0),
  subtitle text,
  description text,
  work_type text not null check (
    work_type in ('composition', 'experiment', 'arrangement', 'recording', 'collaboration')
  ),
  tool_used text,
  artwork_url text,
  audio_url text,
  video_url text,
  external_url text,
  composition_date date,
  published_at timestamptz,
  featured boolean not null default false,
  featured_order integer check (featured_order is null or featured_order >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mattyc_creative_works_published_at_required
    check (status <> 'published' or published_at is not null)
);

create index mattyc_projects_public_listing_idx
  on public.mattyc_projects (status, featured, featured_order);
create index mattyc_series_project_listing_idx
  on public.mattyc_series (project_id, status, featured, display_order);
create index mattyc_episodes_series_listing_idx
  on public.mattyc_episodes (series_id, status, episode_number);
create index mattyc_creative_works_project_listing_idx
  on public.mattyc_creative_works (project_id, status, featured, featured_order, published_at desc);

create or replace function public.set_mattyc_content_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger mattyc_projects_set_updated_at
before update on public.mattyc_projects
for each row execute function public.set_mattyc_content_updated_at();

create trigger mattyc_series_set_updated_at
before update on public.mattyc_series
for each row execute function public.set_mattyc_content_updated_at();

create trigger mattyc_episodes_set_updated_at
before update on public.mattyc_episodes
for each row execute function public.set_mattyc_content_updated_at();

create trigger mattyc_creative_works_set_updated_at
before update on public.mattyc_creative_works
for each row execute function public.set_mattyc_content_updated_at();

alter table public.mattyc_projects enable row level security;
alter table public.mattyc_series enable row level security;
alter table public.mattyc_episodes enable row level security;
alter table public.mattyc_creative_works enable row level security;

grant select on public.mattyc_projects, public.mattyc_series, public.mattyc_episodes,
  public.mattyc_creative_works
to anon, authenticated;
revoke insert, update, delete on public.mattyc_projects, public.mattyc_series,
  public.mattyc_episodes, public.mattyc_creative_works
from anon, authenticated;

create policy "Published MattYC projects are publicly readable"
on public.mattyc_projects for select
to anon, authenticated
using (status = 'published');

create policy "Published MattYC series with published projects are publicly readable"
on public.mattyc_series for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1 from public.mattyc_projects
    where mattyc_projects.id = mattyc_series.project_id
      and mattyc_projects.status = 'published'
  )
);

create policy "Published MattYC episodes in published series are publicly readable"
on public.mattyc_episodes for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.mattyc_series
    join public.mattyc_projects
      on mattyc_projects.id = mattyc_series.project_id
    where mattyc_series.id = mattyc_episodes.series_id
      and mattyc_series.status = 'published'
      and mattyc_projects.status = 'published'
  )
);

create policy "Published MattYC creative works with published projects are publicly readable"
on public.mattyc_creative_works for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1 from public.mattyc_projects
    where mattyc_projects.id = mattyc_creative_works.project_id
      and mattyc_projects.status = 'published'
  )
);

-- Structural records approved by the content brief. Detailed episodes and works
-- are intentionally omitted until their real metadata is supplied.
insert into public.mattyc_projects (
  slug, title, subtitle, description, project_type, cover_image_url,
  featured, featured_order, status, start_date, published_at
)
values
  (
    'educational-series',
    'Educational Series by MattYC',
    'Ideas from the practice room',
    'Ideas, exercises, and discoveries from Matt''s own piano practice.',
    'education',
    null,
    true,
    1,
    'published',
    current_date,
    now()
  ),
  (
    'originals-experiments',
    'Originals & Experiments',
    'From playing music to making music.',
    'Small original explorations of melody, harmony, rhythm, structure, sound, and technology.',
    'originals',
    null,
    true,
    2,
    'published',
    current_date,
    now()
  )
on conflict (slug) do nothing;

insert into public.mattyc_series (
  project_id, slug, title, subtitle, description, cover_image_url,
  featured, display_order, status, started_at, published_at
)
select
  id,
  'hanon-a-day',
  'Hanon A-Day',
  'One exercise. One idea. One day at a time.',
  'The first Educational Series by MattYC, sharing discoveries from focused piano practice.',
  null,
  true,
  1,
  'published',
  current_date,
  now()
from public.mattyc_projects
where slug = 'educational-series'
on conflict (slug) do nothing;

-- Manage records through the server-authenticated MattYC content admin or the
-- Supabase dashboard. No public insert, update, or delete policy is created.
