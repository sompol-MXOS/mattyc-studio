-- READ-ONLY inspection. Run in the Supabase SQL editor before reviewing
-- 20261121000000_secure_van_cliburn_story_admin.sql.

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'van_cliburn_story_entries'
order by ordinal_position;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where (schemaname = 'public' and tablename = 'van_cliburn_story_entries')
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;

select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'van_cliburn_story_entries'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;

select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'van-cliburn-story-images';
