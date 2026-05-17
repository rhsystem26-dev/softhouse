-- 013_audit_fix.sql
-- Corrige audit_trigger() que em 012 usou colunas erradas (row_id/user_id)
-- audit_logs tem record_id e actor_id (definidos em 001_foundation.sql)

create or replace function audit_trigger()
returns trigger language plpgsql security definer
set search_path = ''
as $$
declare
  _org_id uuid;
begin
  if TG_OP = 'DELETE' then
    _org_id := old.org_id;
  else
    _org_id := new.org_id;
  end if;

  -- Resolve org_id via project_id quando não é direto
  if _org_id is null and TG_OP != 'DELETE' then
    if to_jsonb(new) ? 'project_id' and (to_jsonb(new)->>'project_id') is not null then
      if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'projects') then
        execute 'select org_id from public.projects where id = $1'
        using (to_jsonb(new)->>'project_id')::uuid
        into _org_id;
      end if;
    end if;
  end if;

  if _org_id is not null then
    insert into public.audit_logs (org_id, actor_id, action, table_name, record_id, old_data, new_data)
    values (
      _org_id,
      auth.uid(),
      TG_ARGV[0],
      TG_TABLE_NAME,
      coalesce(
        case when TG_OP = 'DELETE' then old.id::text else new.id::text end,
        'unknown'
      ),
      case when TG_OP in ('DELETE', 'UPDATE') then to_jsonb(old) else null end,
      case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    );
  end if;

  return coalesce(new, old);
end;
$$;
