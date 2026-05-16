-- 001_foundation.sql
-- Tabelas base: organizations, profiles, organization_members, audit_logs
-- Funções auxiliares de RLS, triggers, policies seguras
-- Regra: usuário sem organization_id não acessa nada.

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto" with schema extensions;

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type user_role as enum ('admin', 'socio', 'financeiro', 'gerente', 'dev');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- FUNÇÃO: updated_at (reutilizável)
-- ============================================================
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- TABELA: organizations
-- ============================================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at();

alter table organizations enable row level security;

-- ============================================================
-- TABELA: profiles
-- ============================================================
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

alter table profiles enable row level security;

-- Trigger: Criar profile automaticamente ao criar usuário
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- TABELA: organization_members
-- ============================================================
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role user_role not null default 'dev',
  joined_at timestamptz not null default now(),
  unique(org_id, user_id)
);

alter table organization_members enable row level security;

-- ============================================================
-- FUNÇÕES AUXILIARES DE RLS (SECURITY DEFINER + search_path seguro)
-- Precisam vir DEPOIS da criação das tabelas que referenciam
-- ============================================================

-- Retorna o org_id do usuário autenticado
create or replace function auth_user_org_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select org_id
  from public.organization_members
  where user_id = auth.uid()
  limit 1;
$$;

-- Retorna o role do usuário autenticado
create or replace function auth_user_role()
returns user_role
language sql
security definer
set search_path = ''
stable
as $$
  select role
  from public.organization_members
  where user_id = auth.uid()
  limit 1;
$$;

-- Verifica se o usuário pertence à organização
create or replace function is_member_of_org(check_org_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where user_id = auth.uid()
    and org_id = check_org_id
  );
$$;

-- Verifica se o usuário tem um dos papéis especificados
create or replace function has_role(variadic allowed_roles user_role[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where user_id = auth.uid()
    and role = any(allowed_roles)
  );
$$;

-- Verifica se o usuário é admin ou sócio da organização
create or replace function is_admin_or_socio(check_org_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where user_id = auth.uid()
    and org_id = check_org_id
    and role in ('admin', 'socio')
  );
$$;

-- ============================================================
-- POLICIES: organizations
-- ============================================================

-- Membros podem ver a própria organização
create policy "Membros veem a propria organizacao"
  on organizations for select
  using (is_member_of_org(id));

-- Admin e Sócio podem editar a organização
create policy "Admin e Socio editam organizacao"
  on organizations for update
  using (is_admin_or_socio(id));

-- Apenas Admin pode criar organização
create policy "Admin cria organizacao"
  on organizations for insert
  with check (has_role('admin'));

-- ============================================================
-- POLICIES: profiles
-- ============================================================

-- Usuário vê o próprio perfil
create policy "Usuario ve o proprio perfil"
  on profiles for select
  using (user_id = auth.uid());

-- Admin e Sócio veem perfis de membros da mesma organização
create policy "Admin e Socio veem perfis da org"
  on profiles for select
  using (
    exists (
      select 1
      from public.organization_members viewer
      join public.organization_members subject on viewer.org_id = subject.org_id
      where viewer.user_id = auth.uid()
      and viewer.role in ('admin', 'socio')
      and subject.user_id = profiles.user_id
    )
  );

-- Usuário edita o próprio perfil
create policy "Usuario edita o proprio perfil"
  on profiles for update
  using (user_id = auth.uid());

-- Admin e Sócio podem inserir perfil (caso trigger falhe)
create policy "Admin e Socio inserem perfil"
  on profiles for insert
  with check (
    exists (
      select 1
      from public.organization_members
      where user_id = auth.uid()
      and role in ('admin', 'socio')
    )
    or user_id = auth.uid()
  );

-- ============================================================
-- POLICIES: organization_members
-- ============================================================

-- Membros podem ver outros membros da mesma organização
create policy "Membros veem membros da mesma org"
  on organization_members for select
  using (is_member_of_org(org_id));

-- Admin e Sócio podem gerenciar membros
create policy "Admin e Socio inserem membros"
  on organization_members for insert
  with check (is_admin_or_socio(org_id));

create policy "Admin e Socio editam membros"
  on organization_members for update
  using (is_admin_or_socio(org_id))
  with check (is_admin_or_socio(org_id));

create policy "Admin e Socio removem membros"
  on organization_members for delete
  using (is_admin_or_socio(org_id));

-- ============================================================
-- TABELA: audit_logs
-- ============================================================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  table_name text not null,
  record_id text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;

-- Admin e Sócio podem ver audit logs da organização
create policy "Admin e Socio veem audit logs"
  on audit_logs for select
  using (is_admin_or_socio(org_id));

-- ============================================================
-- FUNÇÃO: audit_trigger (genérica, para uso futuro nas fases 2+)
-- ============================================================
create or replace function audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _org_id uuid;
  _action text;
begin
  _action := TG_ARGV[0];

  -- Tenta encontrar org_id no registro
  if TG_OP = 'DELETE' then
    _org_id := old.org_id;
  else
    _org_id := new.org_id;
  end if;

  -- Se não tem org_id direto, tenta via project_id
  if _org_id is null and TG_OP != 'DELETE' then
    if to_jsonb(new) ? 'project_id' and (to_jsonb(new)->>'project_id') is not null then
      if exists (
        select 1 from pg_tables
        where schemaname = 'public' and tablename = 'projects'
      ) then
        execute 'select org_id from public.projects where id = $1'
        using (to_jsonb(new)->>'project_id')::uuid
        into _org_id;
      end if;
    end if;
  end if;

  if _org_id is not null then
    insert into public.audit_logs (
      org_id, actor_id, action, table_name, record_id, old_data, new_data
    )
    values (
      _org_id,
      auth.uid(),
      _action,
      TG_TABLE_NAME,
      coalesce(
        case
          when TG_OP = 'DELETE' then old.id::text
          else new.id::text
        end,
        'unknown'
      ),
      case
        when TG_OP in ('DELETE', 'UPDATE') then to_jsonb(old)
        else null
      end,
      case
        when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(new)
        else null
      end
    );
  end if;

  return coalesce(new, old);
end;
$$;

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_org_members_user_id on organization_members(user_id);
create index idx_org_members_org_id on organization_members(org_id);
create index idx_org_members_org_role on organization_members(org_id, role);
create index idx_profiles_user_id on profiles(user_id);
create index idx_audit_logs_org_id on audit_logs(org_id);
create index idx_audit_logs_table_record on audit_logs(table_name, record_id);
create index idx_audit_logs_created_at on audit_logs(created_at desc);
create index idx_audit_logs_actor_id on audit_logs(actor_id);
