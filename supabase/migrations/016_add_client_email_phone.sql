-- 016_add_client_email_phone.sql
-- Adiciona colunas email e phone à tabela clients
-- Motivo: migration 002 original definia email/phone mas schema real no banco
-- tem contact_name/contact_email/notes. Sync entre código e schema.

alter table public.clients
add column if not exists email text;

alter table public.clients
add column if not exists phone text;
