-- 017_whatsapp_commands.sql
-- WhatsApp First Pipeline: comandos estruturados vindos do WhatsApp

create table public.whatsapp_commands (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  webhook_log_id uuid references public.evolution_webhook_logs(id) on delete set null,
  from_phone text not null,
  intent text not null,
  status text not null default 'pending_review',
  risk_level text not null default 'medium',
  confidence numeric not null default 0,
  extracted_payload jsonb not null default '{}'::jsonb,
  missing_fields jsonb not null default '[]'::jsonb,
  confirmation_message text,
  result_message text,
  applied_result jsonb,
  error_message text,
  created_by uuid references public.profiles(user_id),
  reviewed_by uuid references public.profiles(user_id),
  reviewed_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Constraints
alter table public.whatsapp_commands
  add constraint chk_wc_status check (
    status in ('pending_confirmation','pending_review','approved','applied','rejected','failed','low_confidence')
  );

alter table public.whatsapp_commands
  add constraint chk_wc_risk check (
    risk_level in ('low','medium','high','critical')
  );

alter table public.whatsapp_commands
  add constraint chk_wc_confidence check (
    confidence >= 0 and confidence <= 1
  );

-- Unique: um webhook_log_id so pode ter um comando de cada intent
-- Evita duplicacao quando process-webhook e chamado multiplas vezes
create unique index idx_wc_webhook_intent_unique
  on public.whatsapp_commands(webhook_log_id, intent)
  where webhook_log_id is not null;

-- Indices
create index idx_wc_org_id on public.whatsapp_commands(org_id);
create index idx_wc_webhook_log_id on public.whatsapp_commands(webhook_log_id);
create index idx_wc_intent on public.whatsapp_commands(intent);
create index idx_wc_status on public.whatsapp_commands(status);
create index idx_wc_risk_level on public.whatsapp_commands(risk_level);
create index idx_wc_from_phone on public.whatsapp_commands(from_phone);
create index idx_wc_created_at on public.whatsapp_commands(created_at desc);

-- RLS
alter table public.whatsapp_commands enable row level security;

-- admin/socio veem todos os comandos da org
create policy "Admin Socio veem comandos da org"
  on public.whatsapp_commands for select
  using (
    org_id is not null
    and exists(
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = whatsapp_commands.org_id
      and role in ('admin', 'socio')
    )
  );

-- financeiro ve comandos financeiros da org (create_revenue, create_cost, query_financial)
create policy "Financeiro ve comandos financeiros"
  on public.whatsapp_commands for select
  using (
    org_id is not null
    and intent in ('create_revenue', 'create_cost', 'query_financial_summary', 'query_ai_costs')
    and exists(
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = whatsapp_commands.org_id
      and role = 'financeiro'
    )
  );

-- gerente ve comandos operacionais (exceto admin puros)
create policy "Gerente ve comandos operacionais"
  on public.whatsapp_commands for select
  using (
    org_id is not null
    and intent not in ('query_ai_costs')
    and exists(
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = whatsapp_commands.org_id
      and role = 'gerente'
    )
  );

-- dev ve apenas comandos vinculados a tarefas (create_task, update_task_status, add_time_entry)
create policy "Dev ve comandos de tarefa"
  on public.whatsapp_commands for select
  using (
    org_id is not null
    and intent in ('create_task', 'update_task_status', 'add_time_entry', 'create_delivery', 'query_project_status', 'query_today_tasks')
    and exists(
      select 1 from public.organization_members
      where user_id = auth.uid()
      and org_id = whatsapp_commands.org_id
      and role = 'dev'
    )
  );

-- Insert via server route (server-side apenas)
create policy "Server insere comandos"
  on public.whatsapp_commands for insert
  with check (true);

-- Update via server route (server-side apenas)
create policy "Server atualiza comandos"
  on public.whatsapp_commands for update
  using (true)
  with check (true);
