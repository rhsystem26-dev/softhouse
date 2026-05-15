-- RLS Tests — Checkpoint 2
-- Executar via: supabase db execute < supabase/tests/rls_test.sql
-- ou via SQL Editor no dashboard

-- ============================================================
-- SETUP: Criar dados de teste
-- ============================================================

-- 1. Criar organização de teste (via service_role ou SQL Editor)
insert into public.organizations (name, slug)
values ('Test Org', 'test-org')
on conflict (slug) do nothing;

-- ============================================================
-- TEST 1: anon SELECT organizations → deve retornar []
-- ============================================================
-- (executar como anon, esperado: 0 rows)
-- select * from public.organizations; -- rodar como anon key

-- ============================================================
-- TEST 2: anon SELECT organization_members → deve retornar []
-- ============================================================
-- (executar como anon, esperado: 0 rows)

-- ============================================================
-- TEST 3: anon SELECT profiles → deve retornar []
-- ============================================================
-- (executar como anon, esperado: 0 rows)

-- ============================================================
-- TEST 4: Verificar helper functions existem
-- ============================================================
select proname, prosrc
from pg_proc
where proname in (
  'auth_user_org_id',
  'auth_user_role',
  'is_member_of_org',
  'has_role',
  'is_admin_or_socio'
)
order by proname;

-- ============================================================
-- TEST 5: Verificar RLS habilitado em todas as tabelas
-- ============================================================
select tablename, relrowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('organizations', 'profiles', 'organization_members', 'audit_logs');

-- ============================================================
-- TEST 6: Verificar policies existem
-- ============================================================
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- ============================================================
-- TEST 7: Verificar índices
-- ============================================================
select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and indexname like 'idx_%'
order by tablename, indexname;

-- ============================================================
-- TEST 8: Verificar triggers
-- ============================================================
select event_object_table, trigger_name, action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in ('organizations', 'profiles')
order by event_object_table, trigger_name;
