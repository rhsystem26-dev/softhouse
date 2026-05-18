-- 016_profiles_phone_avatar.sql
-- Adiciona phone ao profiles + bucket de avatars

-- ============================================================
-- 1. Adicionar phone ao profiles
-- ============================================================
alter table public.profiles
add column if not exists phone text;

-- ============================================================
-- 2. Bucket público para avatars
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- ============================================================
-- 3. RLS no storage: usuário faz upload no próprio folder
-- ============================================================
drop policy if exists "Avatar upload own folder" on storage.objects;
create policy "Avatar upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Avatar update own folder" on storage.objects;
create policy "Avatar update own folder"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Avatar delete own folder" on storage.objects;
create policy "Avatar delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Avatars public read" on storage.objects;
create policy "Avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');
