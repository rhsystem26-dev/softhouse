-- 006_ai_usage.sql
-- Tabela de uso de IA com métricas completas
-- RLS + audit trigger

-- ============================================================
-- ENUM: ai_usage_result
-- ============================================================
do $$ begin
  create type ai_usage_result as enum ('accepted', 'rejected', 'modified');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- TABELA: ai_usage
-- ============================================================
create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  model_id uuid not null references ai_models(id) on delete restrict,
  tokens_in bigint not null default 0 check (tokens_in >= 0),
  tokens_out bigint not null default 0 check (tokens_out >= 0),
  cost numeric(12,6) not null default 0 check (cost >= 0),
  latency_ms integer check (latency_ms >= 0),
  quality_score smallint check (quality_score >= 1 and quality_score <= 5),
  time_saved_hours numeric(6,2),
  result ai_usage_result,
  delivery_id uuid,
  rework boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

alter table ai_usage enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

create policy "Membros veem ai_usage da org"
  on ai_usage for select
  using (is_member_of_org(org_id));

create policy "Admin Socio Gerente inserem ai_usage"
  on ai_usage for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = ai_usage.org_id
      and role in ('admin', 'socio', 'gerente')
    )
  );

create policy "Admin Socio editam ai_usage"
  on ai_usage for update
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = ai_usage.org_id
      and role in ('admin', 'socio')
    )
  );

create policy "Admin Socio removem ai_usage"
  on ai_usage for delete
  using (
    exists (
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = ai_usage.org_id
      and role in ('admin', 'socio')
    )
  );

-- ============================================================
-- AUDIT TRIGGER
-- ============================================================
create trigger trg_audit_ai_usage
  after insert or update or delete on ai_usage
  for each row execute function audit_trigger('ai_usage_modified');

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_ai_usage_org_id on ai_usage(org_id);
create index idx_ai_usage_project_id on ai_usage(project_id);
create index idx_ai_usage_user_id on ai_usage(user_id);
create index idx_ai_usage_model_id on ai_usage(model_id);
create index idx_ai_usage_created_at on ai_usage(created_at desc);
