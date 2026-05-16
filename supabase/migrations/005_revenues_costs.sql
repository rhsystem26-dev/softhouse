-- 005_revenues_costs.sql
-- Tabelas financeiras: revenues, costs
-- RLS completo + audit triggers

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type revenue_type as enum ('servico', 'consultoria', 'produto', 'retainer', 'outro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type cost_category as enum ('ia', 'infra', 'pessoal', 'outros');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- TABELA: revenues
-- ============================================================
create table revenues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  date date not null default current_date,
  type revenue_type not null default 'servico',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_revenues_updated_at
  before update on revenues
  for each row execute function update_updated_at();

alter table revenues enable row level security;

-- ============================================================
-- TABELA: costs
-- ============================================================
create table costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  date date not null default current_date,
  category cost_category not null default 'outros',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_costs_updated_at
  before update on costs
  for each row execute function update_updated_at();

alter table costs enable row level security;

-- ============================================================
-- RLS POLICIES: revenues
-- ============================================================

-- Membros da org veem receitas dos projetos da org
create policy "Membros veem revenues da org"
  on revenues for select
  using (is_member_of_org(org_id));

-- Admin, Socio, Financeiro inserem revenues
create policy "Admin Socio Financeiro inserem revenues"
  on revenues for insert
  with check (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = revenues.org_id
      and role in ('admin', 'socio', 'financeiro')
    )
  );

-- Admin, Socio, Financeiro editam revenues
create policy "Admin Socio Financeiro editam revenues"
  on revenues for update
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = revenues.org_id
      and role in ('admin', 'socio', 'financeiro')
    )
  );

-- Admin, Socio, Financeiro removem revenues
create policy "Admin Socio Financeiro removem revenues"
  on revenues for delete
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = revenues.org_id
      and role in ('admin', 'socio', 'financeiro')
    )
  );

-- ============================================================
-- RLS POLICIES: costs
-- ============================================================

create policy "Membros veem costs da org"
  on costs for select
  using (is_member_of_org(org_id));

create policy "Admin Socio Financeiro inserem costs"
  on costs for insert
  with check (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = costs.org_id
      and role in ('admin', 'socio', 'financeiro')
    )
  );

create policy "Admin Socio Financeiro editam costs"
  on costs for update
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = costs.org_id
      and role in ('admin', 'socio', 'financeiro')
    )
  );

create policy "Admin Socio Financeiro removem costs"
  on costs for delete
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = costs.org_id
      and role in ('admin', 'socio', 'financeiro')
    )
  );

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================
create trigger trg_audit_revenues
  after insert or update or delete on revenues
  for each row execute function audit_trigger('revenue_modified');

create trigger trg_audit_costs
  after insert or update or delete on costs
  for each row execute function audit_trigger('cost_modified');

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_revenues_org_id on revenues(org_id);
create index idx_revenues_project_id on revenues(project_id);
create index idx_revenues_date on revenues(date desc);
create index idx_costs_org_id on costs(org_id);
create index idx_costs_project_id on costs(project_id);
create index idx_costs_date on costs(date desc);
create index idx_costs_category on costs(category);
