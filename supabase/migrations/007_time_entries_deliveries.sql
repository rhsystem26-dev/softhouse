-- 007_time_entries_deliveries.sql
-- Tabelas de lancamento de horas e entregas
-- RLS + audit triggers + FK em ai_usage

-- ============================================================
-- ENUM: delivery_status
-- ============================================================
do $$ begin
  create type delivery_status as enum ('backlog', 'in_progress', 'review', 'done', 'blocked');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- TABELA: time_entries
-- ============================================================
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  hours numeric(5,2) not null check (hours > 0),
  description text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table time_entries enable row level security;

-- Membros da org veem time_entries
create policy "Membros veem time_entries da org"
  on time_entries for select
  using (is_member_of_org(org_id));

-- Admin, Socio, Gerente inserem time_entries para qualquer user da org
create policy "Admin Socio Gerente inserem time_entries"
  on time_entries for insert
  with check (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = time_entries.org_id
      and role in ('admin', 'socio', 'gerente')
    )
  );

-- Dev insere proprias horas
create policy "Dev insere proprias horas"
  on time_entries for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = time_entries.org_id
      and role in ('dev')
    )
  );

-- Admin, Socio, Gerente editam time_entries da org
create policy "Admin Socio Gerente editam time_entries"
  on time_entries for update
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = time_entries.org_id
      and role in ('admin', 'socio', 'gerente')
    )
  );

-- Dev edita proprias horas
create policy "Dev edita proprias horas"
  on time_entries for update
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = time_entries.org_id
      and role in ('dev')
    )
  );

-- Admin, Socio removem time_entries
create policy "Admin Socio removem time_entries"
  on time_entries for delete
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = time_entries.org_id
      and role in ('admin', 'socio')
    )
  );

create trigger trg_audit_time_entries
  after insert or update or delete on time_entries
  for each row execute function audit_trigger('time_entries_modified');

create index idx_time_entries_org_id on time_entries(org_id);
create index idx_time_entries_project_id on time_entries(project_id);
create index idx_time_entries_user_id on time_entries(user_id);
create index idx_time_entries_date on time_entries(date desc);

-- ============================================================
-- TABELA: deliveries
-- ============================================================
create table deliveries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  status delivery_status not null default 'backlog',
  due_date date,
  completed_at timestamptz,
  assignee_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table deliveries enable row level security;

-- Membros da org veem deliveries
create policy "Membros veem deliveries da org"
  on deliveries for select
  using (is_member_of_org(org_id));

-- Admin, Socio, Gerente gerenciam deliveries
create policy "Admin Socio Gerente inserem deliveries"
  on deliveries for insert
  with check (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = deliveries.org_id
      and role in ('admin', 'socio', 'gerente')
    )
  );

create policy "Admin Socio Gerente editam deliveries"
  on deliveries for update
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = deliveries.org_id
      and role in ('admin', 'socio', 'gerente')
    )
  );

create policy "Admin Socio removem deliveries"
  on deliveries for delete
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = deliveries.org_id
      and role in ('admin', 'socio')
    )
  );

create trigger trg_audit_deliveries
  after insert or update or delete on deliveries
  for each row execute function audit_trigger('deliveries_modified');

create index idx_deliveries_org_id on deliveries(org_id);
create index idx_deliveries_project_id on deliveries(project_id);
create index idx_deliveries_assignee_id on deliveries(assignee_id);
create index idx_deliveries_status on deliveries(status);
create index idx_deliveries_due_date on deliveries(due_date);

-- ============================================================
-- FK: ai_usage.delivery_id -> deliveries.id
-- ============================================================
alter table ai_usage
  add constraint fk_ai_usage_delivery
  foreign key (delivery_id) references deliveries(id)
  on delete set null;
