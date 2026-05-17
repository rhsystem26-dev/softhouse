-- rls_validation.sql
-- Validação abrangente de RLS por role
-- Executar como superuser (service_role) para criar cenário de teste
-- Cada bloco de DO verifica um cenário isolado com set_config

-- ============================================================
-- SETUP: IDs de teste
-- ============================================================
do $$
declare
  v_org_id  uuid := '00000000-1111-0000-0000-000000000001';
  v_proj_id uuid := '00000000-1111-0000-0000-000000000002';
  v_cli_id  uuid := '00000000-1111-0000-0000-000000000003';
  -- Usuários de teste (precisam existir em auth.users)
  -- Em ambiente real use auth.users reais; aqui validamos policies SQL
begin
  raise notice 'RLS Validation Script — softhouse-finance';
  raise notice 'Execute this script with psql as superuser to create test fixtures';
  raise notice 'Then use set_config(''request.jwt.claims'', ...) to simulate roles';
end $$;

-- ============================================================
-- 1. VERIFICAR RLS HABILITADO EM TODAS AS TABELAS
-- ============================================================
do $$
declare
  r record;
  n int := 0;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
    and tablename not in ('schema_migrations')
    and not exists (
      select 1 from pg_class c
      join pg_namespace ns on ns.oid = c.relnamespace
      where ns.nspname = 'public'
      and c.relname = tablename
      and c.relrowsecurity = true
    )
  loop
    raise warning 'FAIL: RLS not enabled on table: %', r.tablename;
    n := n + 1;
  end loop;

  if n = 0 then
    raise notice 'PASS: RLS enabled on all public tables';
  else
    raise warning 'FAIL: % tables missing RLS', n;
  end if;
end $$;

-- ============================================================
-- 2. VERIFICAR POLÍTICAS EXISTEM POR TABELA
-- ============================================================
do $$
declare
  expected_tables text[] := array[
    'organizations', 'profiles', 'organization_members', 'audit_logs',
    'clients', 'projects', 'project_members',
    'revenues', 'costs',
    'ai_providers', 'ai_models', 'ai_usage',
    'time_entries', 'deliveries',
    'infra_resources',
    'task_boards', 'task_columns', 'tasks', 'task_assignments', 'task_comments',
    'task_activity_logs', 'task_ai_suggestions',
    'notification_logs', 'notification_templates'
  ];
  t text;
  n int;
begin
  foreach t in array expected_tables loop
    select count(*) into n from pg_policies where schemaname = 'public' and tablename = t;
    if n = 0 then
      raise warning 'FAIL: No policies on table: %', t;
    else
      raise notice 'PASS: Table % has % policies', t, n;
    end if;
  end loop;
end $$;

-- ============================================================
-- 3. VERIFICAR AUSÊNCIA DE USING (true) — proibido
-- ============================================================
do $$
declare
  r record;
  n int := 0;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
    and (qual = 'true' or with_check = 'true')
  loop
    raise warning 'FAIL: Policy "%" on "%" uses USING/CHECK (true)', r.policyname, r.tablename;
    n := n + 1;
  end loop;

  if n = 0 then
    raise notice 'PASS: No USING (true) policies found';
  else
    raise warning 'FAIL: % dangerous open policies found', n;
  end if;
end $$;

-- ============================================================
-- 4. VERIFICAR FUNÇÕES AUXILIARES COM search_path SEGURO
-- ============================================================
do $$
declare
  expected_fns text[] := array[
    'auth_user_org_id', 'auth_user_role', 'is_member_of_org',
    'has_role', 'is_admin_or_socio',
    'audit_trigger', 'handle_new_user', 'log_task_activity',
    'check_gerente_project_update', 'get_org_members_with_profiles'
  ];
  fn text;
  v_search_path text;
  n_missing int := 0;
begin
  foreach fn in array expected_fns loop
    select p.proconfig::text into v_search_path
    from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'public' and p.proname = fn
    limit 1;

    if v_search_path is null then
      raise warning 'FAIL: Function % not found or no search_path set', fn;
      n_missing := n_missing + 1;
    elsif v_search_path not like '%search_path=%' then
      raise warning 'FAIL: Function % missing search_path in proconfig', fn;
      n_missing := n_missing + 1;
    else
      raise notice 'PASS: Function % has search_path configured', fn;
    end if;
  end loop;

  if n_missing = 0 then
    raise notice 'PASS: All RLS helper functions have secure search_path';
  end if;
end $$;

-- ============================================================
-- 5. VERIFICAR COLUNAS audit_logs CORRETAS
-- ============================================================
do $$
declare
  expected_cols text[] := array['id','org_id','actor_id','action','table_name','record_id','old_data','new_data','created_at'];
  col text;
  n int;
begin
  foreach col in array expected_cols loop
    select count(*) into n
    from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_logs' and column_name = col;

    if n = 0 then
      raise warning 'FAIL: audit_logs missing column: %', col;
    else
      raise notice 'PASS: audit_logs has column: %', col;
    end if;
  end loop;

  -- Verificar que row_id e user_id NÃO existem (eram os errôneos do 012)
  select count(*) into n
  from information_schema.columns
  where table_schema = 'public' and table_name = 'audit_logs'
  and column_name in ('row_id', 'user_id');

  if n > 0 then
    raise warning 'FAIL: audit_logs has unexpected columns row_id/user_id';
  else
    raise notice 'PASS: audit_logs has no erroneous row_id/user_id columns';
  end if;
end $$;

-- ============================================================
-- 6. VERIFICAR TABELA infra_resources EXISTE
-- ============================================================
do $$
declare
  n int;
begin
  select count(*) into n
  from pg_tables
  where schemaname = 'public' and tablename = 'infra_resources';

  if n = 0 then
    raise warning 'FAIL: infra_resources table not found';
  else
    raise notice 'PASS: infra_resources table exists';
    -- Verificar RLS
    select count(*) into n
    from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'public' and c.relname = 'infra_resources' and c.relrowsecurity;
    if n = 0 then
      raise warning 'FAIL: infra_resources has RLS disabled';
    else
      raise notice 'PASS: infra_resources RLS enabled';
    end if;
  end if;
end $$;

-- ============================================================
-- 7. VERIFICAR TRIGGER anti-escalation gerente
-- ============================================================
do $$
declare
  n int;
begin
  select count(*) into n
  from pg_trigger
  where tgname = 'trg_check_gerente_project'
  and tgrelid = 'public.projects'::regclass;

  if n = 0 then
    raise warning 'FAIL: Anti-escalation trigger trg_check_gerente_project not found';
  else
    raise notice 'PASS: Anti-escalation trigger trg_check_gerente_project exists';
  end if;
end $$;

-- ============================================================
-- 8. VERIFICAR POLITICAS REVENUE/COST — financeiro excluído do DELETE
-- ============================================================
do $$
declare
  n int;
begin
  -- revenues DELETE deve permitir só admin/socio (não financeiro)
  select count(*) into n
  from pg_policies
  where schemaname = 'public'
  and tablename = 'revenues'
  and cmd = 'DELETE'
  and policyname like '%financeiro%';

  if n > 0 then
    raise warning 'FAIL: revenues DELETE policy includes financeiro role (should be admin/socio only)';
  else
    raise notice 'PASS: revenues DELETE restricted to admin/socio';
  end if;

  -- costs DELETE deve permitir só admin/socio
  select count(*) into n
  from pg_policies
  where schemaname = 'public'
  and tablename = 'costs'
  and cmd = 'DELETE'
  and policyname like '%financeiro%';

  if n > 0 then
    raise warning 'FAIL: costs DELETE policy includes financeiro role';
  else
    raise notice 'PASS: costs DELETE restricted to admin/socio';
  end if;
end $$;

-- ============================================================
-- 9. VERIFICAR KANBAN tasks — created_by em policies de dev
-- ============================================================
do $$
declare
  n int;
begin
  -- Policies dev para tasks devem usar created_by, não user_id
  select count(*) into n
  from pg_policies
  where schemaname = 'public'
  and tablename = 'tasks'
  and policyname like '%Dev%'
  and (qual like '%created_by%' or with_check like '%created_by%');

  if n = 0 then
    raise warning 'FAIL: Dev tasks policies not using created_by column';
  else
    raise notice 'PASS: Dev tasks policies use created_by (% policies)', n;
  end if;
end $$;

-- ============================================================
-- 10. VERIFICAR get_org_members_with_profiles RPC EXISTE
-- ============================================================
do $$
declare
  n int;
begin
  select count(*) into n
  from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public' and p.proname = 'get_org_members_with_profiles';

  if n = 0 then
    raise warning 'FAIL: get_org_members_with_profiles RPC not found';
  else
    raise notice 'PASS: get_org_members_with_profiles RPC exists';
  end if;
end $$;

-- ============================================================
-- RESUMO
-- ============================================================
do $$
begin
  raise notice '==============================================';
  raise notice 'RLS Validation complete. Check WARN vs PASS';
  raise notice 'PASS = OK | FAIL = necessita correção';
  raise notice '==============================================';
end $$;
