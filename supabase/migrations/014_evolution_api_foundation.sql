-- 014_evolution_api_foundation.sql
-- Fase 8.3A — Evolution API Outbound: fundação segura
-- Tabelas: evolution_configs (1 por org), evolution_message_logs
-- RLS restritivo: apenas admin/socio acessam configs e logs
-- Segredos sempre criptografados (aes-256-gcm via src/lib/server/evolution-crypto.ts)

-- ============================================================
-- ENUM: status de mensagem
-- ============================================================
do $$ begin
  create type evolution_message_status as enum ('pending','sent','failed','rate_limited');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- TABELA: evolution_configs (uma config por organização)
-- ============================================================
create table evolution_configs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  instance_url text not null check (length(trim(instance_url)) > 0),
  api_key_encrypted text not null check (length(trim(api_key_encrypted)) > 0),
  webhook_secret_encrypted text not null check (length(trim(webhook_secret_encrypted)) > 0),
  enabled boolean not null default true,
  created_by uuid references profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id)
);

create trigger trg_evolution_configs_updated_at
  before update on evolution_configs
  for each row execute function update_updated_at();

alter table evolution_configs enable row level security;

-- ============================================================
-- TABELA: evolution_message_logs
-- ============================================================
create table evolution_message_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  config_id uuid references evolution_configs(id) on delete set null,
  to_phone text not null check (length(trim(to_phone)) > 0),
  message text not null check (length(trim(message)) > 0),
  status evolution_message_status not null default 'pending',
  external_id text,
  error_message text,
  created_by uuid references profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_evolution_message_logs_updated_at
  before update on evolution_message_logs
  for each row execute function update_updated_at();

alter table evolution_message_logs enable row level security;

-- ============================================================
-- RLS POLICIES: evolution_configs
-- Apenas admin/socio da própria organização
-- Nunca USING (true). Sem acesso para financeiro/gerente/dev.
-- ============================================================
create policy "Admin Socio leem evolution_configs"
  on evolution_configs for select
  using (is_admin_or_socio(org_id));

create policy "Admin Socio inserem evolution_configs"
  on evolution_configs for insert
  with check (is_admin_or_socio(org_id));

create policy "Admin Socio editam evolution_configs"
  on evolution_configs for update
  using (is_admin_or_socio(org_id))
  with check (is_admin_or_socio(org_id));

create policy "Admin Socio removem evolution_configs"
  on evolution_configs for delete
  using (is_admin_or_socio(org_id));

-- ============================================================
-- RLS POLICIES: evolution_message_logs
-- Apenas admin/socio da própria organização
-- ============================================================
create policy "Admin Socio leem evolution_message_logs"
  on evolution_message_logs for select
  using (is_admin_or_socio(org_id));

create policy "Admin Socio inserem evolution_message_logs"
  on evolution_message_logs for insert
  with check (is_admin_or_socio(org_id));

create policy "Admin Socio editam evolution_message_logs"
  on evolution_message_logs for update
  using (is_admin_or_socio(org_id))
  with check (is_admin_or_socio(org_id));

-- ============================================================
-- AUDIT TRIGGERS (reusa audit_trigger genérico do 001/013)
-- ============================================================
create trigger trg_audit_evolution_configs
  after insert or update or delete on evolution_configs
  for each row execute function audit_trigger('evolution_configs_modified');

create trigger trg_audit_evolution_message_logs
  after insert or update or delete on evolution_message_logs
  for each row execute function audit_trigger('evolution_message_logs_modified');

-- ============================================================
-- ÍNDICES
-- ============================================================
-- evolution_configs: unique(org_id) já gera índice único, não duplicar
create index idx_evolution_configs_enabled on evolution_configs(org_id) where enabled = true;

-- evolution_message_logs: consultas frequentes por org/status/data/telefone
create index idx_evolution_message_logs_org_id on evolution_message_logs(org_id);
create index idx_evolution_message_logs_config_id on evolution_message_logs(config_id);
create index idx_evolution_message_logs_status on evolution_message_logs(status);
create index idx_evolution_message_logs_to_phone on evolution_message_logs(to_phone);
create index idx_evolution_message_logs_created_at on evolution_message_logs(org_id, created_at desc);
