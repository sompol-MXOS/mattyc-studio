-- REVIEW ONLY: do not apply without explicit approval.
-- Secures only the Van Cliburn story table and image upload policy. Existing
-- story records, IDs, image URLs, and the public image SELECT policy are preserved.

begin;

alter table public.van_cliburn_story_entries
  add column if not exists is_archived boolean not null default false;

create index if not exists van_cliburn_story_public_listing_idx
  on public.van_cliburn_story_entries
  (is_published, is_archived, display_order, entry_date desc, created_at desc);

alter table public.van_cliburn_story_entries enable row level security;

grant select on public.van_cliburn_story_entries to anon, authenticated;
revoke insert, update, delete, truncate, trigger, references
  on public.van_cliburn_story_entries
  from anon, authenticated;

drop policy if exists "Allow anon insert Van Cliburn story entries"
  on public.van_cliburn_story_entries;
drop policy if exists "Allow anon read all Van Cliburn story entries for temporary admin"
  on public.van_cliburn_story_entries;
drop policy if exists "Published Van Cliburn story entries are public"
  on public.van_cliburn_story_entries;

create policy "Published Van Cliburn story entries are public"
  on public.van_cliburn_story_entries
  for select
  to anon, authenticated
  using (is_published = true and is_archived = false);

-- The verified policy only allowed public INSERTs into this bucket. Removing it
-- leaves the existing public image SELECT policy unchanged and lets RLS deny
-- browser uploads. The server-side service-role client bypasses Storage RLS.
drop policy if exists "Anon upload Van Cliburn story images"
  on storage.objects;

commit;
