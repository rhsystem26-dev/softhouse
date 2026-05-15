-- Seed inicial: 1 organização
-- O primeiro admin deve ser criado manualmente via Supabase Dashboard.
-- 1. Authentication → Add User → email + password
-- 2. Copiar o user_id gerado e executar o comando abaixo no SQL Editor:
--    insert into public.organization_members (org_id, user_id, role)
--    values ('00000000-0000-0000-0000-000000000001', '<USER_ID>', 'admin');

insert into public.organizations (id, name, slug)
values (
  '00000000-0000-0000-0000-000000000001',
  'Softhouse',
  'softhouse'
)
on conflict (slug) do nothing;
