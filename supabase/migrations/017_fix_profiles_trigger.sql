-- 017_fix_profiles_trigger.sql
-- Remove triggers em public.profiles que referenciam new.org_id
-- (profiles não tem campo org_id — trigger quebrado das migrations 008-013)

do $$
declare
  r record;
begin
  -- Encontra triggers em profiles cujas funções referenciam 'org_id'
  for r in
    select t.tgname, c.relname
    from pg_trigger t
    join pg_class c on t.tgrelid = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    join pg_proc p on t.tgfoid = p.oid
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and not t.tgisinternal
      and (
        pg_get_functiondef(p.oid) ilike '%new.org_id%'
        or pg_get_functiondef(p.oid) ilike '%OLD.org_id%'
      )
  loop
    execute format('drop trigger if exists %I on public.%I', r.tgname, r.relname);
    raise notice 'Dropped trigger % on %', r.tgname, r.relname;
  end loop;
end;
$$;
