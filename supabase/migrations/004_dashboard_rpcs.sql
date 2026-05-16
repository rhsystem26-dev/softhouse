-- 004_dashboard_rpcs.sql
-- RPCs para o dashboard: métricas agregadas da organização
-- Todas SECURITY DEFINER, org-scoped via parâmetro

-- ============================================================
-- RPC: get_dashboard_metrics
-- Retorna KPIs agregados para o dashboard
-- ============================================================
create or replace function get_dashboard_metrics(p_org_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_active int;
  v_completed int;
  v_on_hold int;
  v_total int;
  v_total_budget numeric;
  v_member_count int;
begin
  -- Verifica pertencimento à org
  if not exists (
    select 1 from public.organization_members
    where user_id = auth.uid() and org_id = p_org_id
  ) then
    raise exception 'Acesso negado';
  end if;

  select
    count(*) filter (where status = 'active'),
    count(*) filter (where status = 'completed'),
    count(*) filter (where status = 'on_hold'),
    count(*),
    coalesce(sum(budget) filter (where status = 'active'), 0)
  into v_active, v_completed, v_on_hold, v_total, v_total_budget
  from public.projects
  where org_id = p_org_id;

  select count(*) into v_member_count
  from public.organization_members
  where org_id = p_org_id;

  v_result := jsonb_build_object(
    'projects_active', v_active,
    'projects_completed', v_completed,
    'projects_on_hold', v_on_hold,
    'projects_total', v_total,
    'total_budget_active', v_total_budget,
    'org_members', v_member_count
  );

  return v_result;
end;
$$;

-- ============================================================
-- RPC: get_projects_budget_summary
-- Retorna lista de projetos com nome, status, budget para gráficos
-- ============================================================
create or replace function get_projects_budget_summary(p_org_id uuid)
returns table (
  id uuid,
  name text,
  status text,
  budget numeric,
  start_date date,
  end_date date,
  member_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.organization_members
    where user_id = auth.uid() and org_id = p_org_id
  ) then
    raise exception 'Acesso negado';
  end if;

  return query
  select
    p.id,
    p.name,
    p.status::text,
    p.budget,
    p.start_date,
    p.end_date,
    count(pm.id) as member_count
  from public.projects p
  left join public.project_members pm on pm.project_id = p.id
  where p.org_id = p_org_id
  group by p.id, p.name, p.status, p.budget, p.start_date, p.end_date
  order by p.budget desc nulls last;
end;
$$;

-- ============================================================
-- GRANTS
-- ============================================================
grant execute on function get_dashboard_metrics(uuid) to authenticated;
grant execute on function get_projects_budget_summary(uuid) to authenticated;
