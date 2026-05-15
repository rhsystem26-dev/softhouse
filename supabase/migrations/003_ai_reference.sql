-- 003_ai_reference.sql
-- Tabelas de referência: ai_providers, ai_models
-- Leitura global para usuários autenticados

-- ============================================================
-- TABELA: ai_providers
-- ============================================================
create table ai_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table ai_providers enable row level security;

-- ============================================================
-- TABELA: ai_models
-- ============================================================
create table ai_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references ai_providers(id) on delete cascade,
  name text not null,
  input_cost_per_1m numeric(10,6) not null default 0,
  output_cost_per_1m numeric(10,6) not null default 0,
  created_at timestamptz not null default now(),
  unique(provider_id, name)
);

alter table ai_models enable row level security;

-- ============================================================
-- RLS: Qualquer usuário autenticado pode ler (dados de referência)
-- ============================================================
create policy "Usuarios autenticados leem ai_providers"
  on ai_providers for select
  using (auth.uid() is not null);

create policy "Usuarios autenticados leem ai_models"
  on ai_models for select
  using (auth.uid() is not null);

-- Apenas admin/socio podem gerenciar providers e models
create policy "Admin e Socio gerenciam ai_providers"
  on ai_providers for insert
  with check (has_role('admin', 'socio'));

create policy "Admin e Socio editam ai_providers"
  on ai_providers for update
  using (has_role('admin', 'socio'));

create policy "Admin e Socio gerenciam ai_models"
  on ai_models for insert
  with check (has_role('admin', 'socio'));

create policy "Admin e Socio editam ai_models"
  on ai_models for update
  using (has_role('admin', 'socio'));

-- ============================================================
-- SEED DATA: Providers e models comuns
-- ============================================================
insert into ai_providers (id, name) values
  ('10000000-0000-0000-0000-000000000001', 'OpenAI'),
  ('10000000-0000-0000-0000-000000000002', 'Anthropic'),
  ('10000000-0000-0000-0000-000000000003', 'Google')
on conflict (name) do nothing;

insert into ai_models (provider_id, name, input_cost_per_1m, output_cost_per_1m) values
  ('10000000-0000-0000-0000-000000000001', 'GPT-4o', 2.50, 10.00),
  ('10000000-0000-0000-0000-000000000001', 'GPT-4o-mini', 0.15, 0.60),
  ('10000000-0000-0000-0000-000000000002', 'Claude Opus 4.7', 15.00, 75.00),
  ('10000000-0000-0000-0000-000000000002', 'Claude Sonnet 4.6', 3.00, 15.00),
  ('10000000-0000-0000-0000-000000000002', 'Claude Haiku 4.5', 0.80, 4.00),
  ('10000000-0000-0000-0000-000000000003', 'Gemini 2.5 Pro', 1.25, 5.00),
  ('10000000-0000-0000-0000-000000000003', 'Gemini 2.5 Flash', 0.15, 0.60)
on conflict (provider_id, name) do nothing;

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_ai_models_provider_id on ai_models(provider_id);
