-- 015_signup_pending_approval.sql
-- Hotfix P0: fluxo de aprovação obrigatória pelo admin
-- Novo usuário nasce como pending. Só acessa o sistema após aprovação.

-- ============================================================
-- 1. Adicionar campos de aprovação ao profiles
-- ============================================================

-- Email para admin identificar usuários pendentes
alter table public.profiles
add column if not exists email text;

-- full_name pode ser null temporariamente (trigger preenche; coalesce protege)
alter table public.profiles
alter column full_name drop not null;

-- Status de aprovação
alter table public.profiles
add column if not exists approval_status text not null default 'pending'
check (approval_status in ('pending', 'approved', 'rejected'));

alter table public.profiles
add column if not exists approved_at timestamptz;

alter table public.profiles
add column if not exists approved_by uuid references auth.users(id);

alter table public.profiles
add column if not exists rejected_at timestamptz;

alter table public.profiles
add column if not exists rejection_reason text;

-- ============================================================
-- 2. Marcar usuários existentes (com membership) como aprovados
-- ============================================================
update public.profiles p
set
  approval_status = 'approved',
  approved_at = p.created_at
where exists (
  select 1
  from public.organization_members om
  where om.user_id = p.user_id
)
and p.approval_status = 'pending';

-- ============================================================
-- 3. Índice para busca de pendentes
-- ============================================================
create index if not exists idx_profiles_approval_status
  on public.profiles(approval_status);

-- ============================================================
-- 4. Corrigir handle_new_user — robusto e com pending
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name, email, approval_status)
  values (
    new.id,
    coalesce(
      nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    'pending'
  )
  on conflict (user_id) do update set
    email    = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);
  return new;
end;
$$;

-- ============================================================
-- 5. Garantir trigger existe
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 6. RLS: admin vê TODOS os perfis (inclusive pendentes sem org)
-- ============================================================
drop policy if exists "Admin ve todos os perfis pendentes" on public.profiles;
create policy "Admin ve todos os perfis pendentes"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.organization_members
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- ============================================================
-- 7. RLS: admin pode atualizar status de aprovação
-- ============================================================
drop policy if exists "Admin atualiza status de aprovacao" on public.profiles;
create policy "Admin atualiza status de aprovacao"
  on public.profiles for update
  using (
    -- Próprio perfil
    user_id = auth.uid()
    -- Ou admin da org
    or exists (
      select 1
      from public.organization_members
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- ============================================================
-- 8. organization_members: admin pode inserir membership de qualquer user
--    (necessário para aprovar usuários pendentes)
-- ============================================================
drop policy if exists "Admin insere membership direto" on public.organization_members;
create policy "Admin insere membership direto"
  on public.organization_members for insert
  with check (
    exists (
      select 1
      from public.organization_members existing
      where existing.user_id = auth.uid()
      and existing.role = 'admin'
      and existing.org_id = organization_members.org_id
    )
  );
