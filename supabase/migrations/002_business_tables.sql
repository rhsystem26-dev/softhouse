-- 002_business_tables.sql
-- Tabelas de negócio: clients, projects, project_members
-- RLS completo + audit triggers

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type project_status as enum ('active', 'completed', 'on_hold', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type project_member_role as enum ('gerente', 'dev');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- TABELA: clients
-- ============================================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

alter table clients enable row level security;

-- ============================================================
-- TABELA: projects
-- ============================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  description text,
  status project_status not null default 'active',
  start_date date,
  end_date date,
  budget numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

alter table projects enable row level security;

-- ============================================================
-- TABELA: project_members
-- ============================================================
create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role project_member_role not null default 'dev',
  assigned_at timestamptz not null default now(),
  unique(project_id, user_id)
);

alter table project_members enable row level security;

-- ============================================================
-- RLS POLICIES: clients
-- ============================================================

-- Membros da org veem clientes
create policy "Membros veem clientes da org"
  on clients for select
  using (is_member_of_org(org_id));

-- Admin e Socio gerenciam clientes
create policy "Admin e Socio inserem clientes"
  on clients for insert
  with check (is_admin_or_socio(org_id));

create policy "Admin e Socio editam clientes"
  on clients for update
  using (is_admin_or_socio(org_id));

create policy "Admin e Socio removem clientes"
  on clients for delete
  using (is_admin_or_socio(org_id));

-- ============================================================
-- RLS POLICIES: projects
-- ============================================================

-- Membros da org veem projetos
create policy "Membros veem projetos da org"
  on projects for select
  using (is_member_of_org(org_id));

-- Admin e Socio gerenciam projetos
create policy "Admin e Socio inserem projetos"
  on projects for insert
  with check (is_admin_or_socio(org_id));

create policy "Admin e Socio editam projetos"
  on projects for update
  using (is_admin_or_socio(org_id));

create policy "Admin e Socio removem projetos"
  on projects for delete
  using (is_admin_or_socio(org_id));

-- Gerente edita projetos onde é membro
create policy "Gerente edita projetos que gerencia"
  on projects for update
  using (
    exists (
      select 1 from public.project_members
      where project_id = projects.id
      and user_id = auth.uid()
      and role = 'gerente'
    )
  );

-- ============================================================
-- RLS POLICIES: project_members
-- ============================================================

-- Membros da org veem project_members dos projetos da org
create policy "Membros veem project members da org"
  on project_members for select
  using (
    exists (
      select 1 from public.projects
      where id = project_members.project_id
      and is_member_of_org(org_id)
    )
  );

-- Dev vê apenas seus próprios project_members
create policy "Dev ve seus projetos"
  on project_members for select
  using (user_id = auth.uid());

-- Admin e Socio gerenciam project_members
create policy "Admin e Socio inserem project members"
  on project_members for insert
  with check (
    exists (
      select 1 from public.projects
      where id = project_members.project_id
      and is_admin_or_socio(org_id)
    )
  );

create policy "Admin e Socio editam project members"
  on project_members for update
  using (
    exists (
      select 1 from public.projects
      where id = project_members.project_id
      and is_admin_or_socio(org_id)
    )
  );

create policy "Admin e Socio removem project members"
  on project_members for delete
  using (
    exists (
      select 1 from public.projects
      where id = project_members.project_id
      and is_admin_or_socio(org_id)
    )
  );

-- Gerente gerencia membros dos projetos que gerencia
create policy "Gerente insere members nos seus projetos"
  on project_members for insert
  with check (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id
      and pm.user_id = auth.uid()
      and pm.role = 'gerente'
    )
  );

create policy "Gerente remove members dos seus projetos"
  on project_members for delete
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id
      and pm.user_id = auth.uid()
      and pm.role = 'gerente'
    )
  );

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================

create trigger trg_audit_clients
  after insert or update or delete on clients
  for each row execute function audit_trigger('client_modified');

create trigger trg_audit_projects
  after insert or update or delete on projects
  for each row execute function audit_trigger('project_modified');

create trigger trg_audit_project_members
  after insert or update or delete on project_members
  for each row execute function audit_trigger('project_member_modified');

-- ============================================================
-- INDICES
-- ============================================================
create index idx_clients_org_id on clients(org_id);
create index idx_projects_org_id on projects(org_id);
create index idx_projects_client_id on projects(client_id);
create index idx_projects_status on projects(status);
create index idx_project_members_project_id on project_members(project_id);
create index idx_project_members_user_id on project_members(user_id);
create index idx_project_members_project_role on project_members(project_id, role);
