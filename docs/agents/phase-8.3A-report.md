# Fase 8.3A — Relatório

Fundação segura da Evolution API: banco + RLS + criptografia server-only. Sem UI, sem actions de envio, sem webhook, sem IA.

## Arquivos alterados

### Criados
- `supabase/migrations/014_evolution_api_foundation.sql`
- `src/lib/server/evolution-types.ts`
- `src/lib/server/evolution-crypto.ts`
- `src/lib/server/evolution-config-repository.ts`
- `docs/contracts/evolution-8.3.md`
- `docs/agents/phase-8.3A-report.md`
- `.env.example`

### Editados
- `src/types/database.ts` — adicionados tipos `evolution_configs`, `evolution_message_logs`, enum `evolution_message_status`
- `package.json` — adicionada dependência `server-only@^0.0.1`

## Migration criada

`supabase/migrations/014_evolution_api_foundation.sql`

Numeração: 014. Última migration tracked no branch era `007_time_entries_deliveries.sql`; o repo principal (master) tem migrations adicionais 008–013 (incluindo um draft `013_evolution.sql` untracked em master). Usar 014 evita colisão com qualquer numeração existente em ambos os caminhos.

## Tabelas criadas

- `evolution_configs` — uma config por organização (`unique(org_id)`), com `instance_url`, `api_key_encrypted`, `webhook_secret_encrypted`, `enabled`, `created_by` (FK profiles), timestamps.
- `evolution_message_logs` — registro de envios; campos `to_phone`, `message`, `status` (enum), `external_id`, `error_message`, `created_by`, timestamps. FK `config_id` com `on delete set null`.

CHECK constraints em todos os campos textuais críticos (não permitem vazio/whitespace).

## RLS aplicado

Helper reutilizado: `is_admin_or_socio(org_id)` (definido em `001_foundation.sql` com `security definer set search_path = ''`).

`evolution_configs`:
- SELECT/INSERT/UPDATE/DELETE — apenas `admin`/`socio` da própria org.

`evolution_message_logs`:
- SELECT/INSERT/UPDATE — apenas `admin`/`socio` da própria org.
- DELETE — sem policy (logs imutáveis pelo usuário).

`financeiro`, `gerente`, `dev` — sem acesso a ambas as tabelas. Nenhum `USING (true)`.

Audit triggers ativos: `audit_trigger('evolution_configs_modified')` e `audit_trigger('evolution_message_logs_modified')`.

## Criptografia

- **Helper:** `src/lib/server/evolution-crypto.ts`
- **Env:** `EVOLUTION_ENCRYPTION_KEY` (server-only, base64 de 32 bytes / 256 bits)
- **Algoritmo:** AES-256-GCM (IV 12 bytes, auth tag 16 bytes, payload base64)
- `import "server-only"` no topo — falha de compilação se importado em client component
- Funções expostas: `encryptSecret(value)`, `decryptSecret(value)`, `compareSecrets(a, b)` (timing-safe)
- Key cacheada em closure após primeira leitura/validação
- Não há fallback de chave; throw se env ausente ou tamanho incorreto
- Nunca loga valor descriptografado
- `decryptSecret` lança erro genérico se GCM auth tag falhar (sem vazar detalhes)

## Repository server-only

`src/lib/server/evolution-config-repository.ts`

Funções:
- `getEvolutionConfigForOrg(orgId)` — retorna `EvolutionConfigRow | null` (uso interno apenas)
- `getSanitizedEvolutionConfigForOrg(orgId)` — sem `*_encrypted` (uso seguro em UI/server actions)
- `upsertEvolutionConfig(input)` — recebe plaintext, criptografa, grava; retorna sanitized
- `setEvolutionConfigEnabled(orgId, enabled)` — toggle rápido
- `deleteEvolutionConfigForOrg(orgId)` — remove
- `getDecryptedEvolutionSecretsForOrg(orgId)` — segredos descriptografados; uso server-side exclusivo para chamar Evolution API

Todos importam `server-only`. RLS do Supabase aplica antes do código repository (consulta passa pela auth do usuário via `createClient` SSR).

## Contrato para Agente 2

- **Arquivo:** `docs/contracts/evolution-8.3.md`
- Documenta: tabelas, status enum, env, módulos server-only importáveis, regras de UI vs server, responsabilidades do 8.3B
- Agente 2 importa apenas de `@/lib/server/evolution-config-repository`, `@/lib/server/evolution-crypto`, `@/lib/server/evolution-types`
- Agente 2 não deve modificar nada deste relatório, contrato, repository, crypto, types

## Validação

- **typecheck:** ✅ PASS — `npx tsc --noEmit` retornou 0 erros
- **lint:** ⚠️ Erro em `src/types/database.ts:560` (`@typescript-eslint/no-empty-object-type` em `Views: {};`) — **pré-existente**, não causado por esta fase. Os 5082 warnings/83 errors restantes vêm de arquivos em `.vercel/output/static/_next/static/chunks/*.js` que deveriam estar no `globalIgnores` do `eslint.config.mjs` (fora do escopo desta fase). Arquivos novos desta fase (`src/lib/server/*`) — 0 erros.
- **build:** ✅ compilação OK (`Compiled successfully in 10.3s`); TypeScript ✅; prerender ⚠️ falha pois `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` estão vazios em `.env.production.local` — **pré-existente**. Em CI/CD os secrets são injetados e o build completa.
- **policy guard:** ✅ PASS — `npm run policyguard` → 0 violações
- **agent cost:** MCP Agent Cost não está disponível como tool deferida neste ambiente. Custo não registrado via MCP. Arquivos alterados listados acima.

## Pendências

- **Validar migration em DB real**: rodar `supabase db reset` com Supabase CLI conectado ao projeto. Verifica criação das tabelas, RLS, audit triggers, índices.
- **Gerar `EVOLUTION_ENCRYPTION_KEY`** em produção e configurar no Vercel/Netlify antes do Agente 2 implementar envio.
- **Limpar lint pré-existente**: adicionar `.vercel/**` ao `globalIgnores` do `eslint.config.mjs` e corrigir `Views: {}` → `Views: Record<string, never>` em `database.ts` (fora do escopo 8.3A).
- **TODO.md**: não atualizado por esta fase (regra de coordenação). Integrador deve marcar 8.3A como done quando 8.3B finalizar.

## Observações para integração

- O draft untracked `supabase/migrations/013_evolution.sql` no working tree do master é uma versão incompleta (sem `created_by`, sem `enabled` index parcial, sem audit triggers, sem `updated_at` trigger nos logs, sem CHECK constraints, status enum diferente). Apagar antes de merge para evitar conflito com `014_evolution_api_foundation.sql`.
- Quando aplicar a migration 014, ela depende de:
  - `organizations`, `profiles` (001)
  - `audit_trigger()` corrigido (013_audit_fix do master ou equivalente)
  - `is_admin_or_socio()` (001)
  - `update_updated_at()` (001)
- Status enum `evolution_message_status` define apenas 4 valores: `pending`, `sent`, `failed`, `rate_limited`. Se o Agente 2 precisar de `delivered`/`read` (ack do WhatsApp), criar nova migration adicionando valores ao enum via `ALTER TYPE ... ADD VALUE`.
- `created_by` aceita NULL para suportar mensagens disparadas por jobs/cron (não por usuário humano).
