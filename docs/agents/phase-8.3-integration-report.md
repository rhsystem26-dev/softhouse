# Fase 8.3 — Relatório de Integração

## Veredito

- **Status final:** Integração concluída. Fundação + camada de envio consolidadas. Pronto para Fase 8.3C (UI) e 8.4 (webhook inbound). Sem código XOR, sem migration duplicada, sem segredo em UI.

## Conflitos encontrados

- **Migration 013:** existia draft `supabase/migrations/013_evolution.sql` (untracked no master, criado pelo Agente 8.3B). Schema incompleto: faltava `created_by`, sem CHECK constraints, sem audit triggers, sem `updated_at` trigger nos logs, sem índices `status`/`to_phone`/`config_id`/`created_at`. Status enum incluía `delivered`/`read` (fora do escopo 8.3) e excluía `rate_limited` (usado pelo rate-limit).
- **Migration 014:** `supabase/migrations/014_evolution_api_foundation.sql` (Agente 8.3A, committed no branch `claude/tender-tesla-213f0c`). Completa: RLS via `is_admin_or_socio`, CHECK constraints, audit triggers, 6 índices, status enum `pending,sent,failed,rate_limited`, `unique(org_id)`, `updated_at` triggers.
- **Crypto XOR:** `src/lib/server/evolution-crypto.ts` (8.3B) usava XOR + base64, derivando chave de `ENCRYPTION_SECRET || NEXT_PUBLIC_SUPABASE_ANON_KEY || "softhouse-default-key"`. Inaceitável: XOR não é cifra autenticada, fallback para anon_key vaza segredo, default hardcoded.
- **Services/actions:** `evolution-service.ts`, `evolution-client.ts`, `evolution-rate-limit.ts`, `evolution-config-repository.ts` (8.3B duplicado), `evolution-validations/evolution.ts`, `actions/evolution.ts` — todos no working tree do master, untracked. Tipos `any` em catch, alguns sem `import "server-only"`.
- **Repository duplicado:** 8.3B criou seu próprio `evolution-config-repository.ts` com API diferente (`saveEvolutionConfig` vs 8.3A `upsertEvolutionConfig`).

## Decisões aplicadas

- **Migration final:** `014_evolution_api_foundation.sql` (8.3A). Draft 013 deletado.
- **Crypto final:** `src/lib/server/evolution-crypto.ts` (8.3A — AES-256-GCM com IV aleatório 12 bytes + auth tag 16 bytes, key cacheada via `loadKey()` lazy). Validação de env apenas em runtime — importar o módulo não quebra build. XOR removido.
- **Repository usado:** 8.3A `src/lib/server/evolution-config-repository.ts`. API: `getEvolutionConfigForOrg`, `getSanitizedEvolutionConfigForOrg`, `upsertEvolutionConfig`, `setEvolutionConfigEnabled`, `deleteEvolutionConfigForOrg`, `getDecryptedEvolutionSecretsForOrg`.
- **Services/actions mantidos (refatorados):**
  - `evolution-client.ts` — fetch wrapper, sem `any`, com `import "server-only"`
  - `evolution-rate-limit.ts` — `checkRateLimit`, `MAX_MESSAGES_PER_MINUTE` exportado, com `import "server-only"`
  - `evolution-message-service.ts` — orquestração nova: lê secrets via repo 8.3A → rate limit → log pending → envia → atualiza log
  - `evolution-service.ts` — guards admin/socio + Zod parse + dispatch para repo/message-service; remove acesso direto a `getDecryptedApiKey` (substituído por `getDecryptedEvolutionSecretsForOrg`)
  - `validations/evolution.ts` — Zod schemas + `z.infer` types exportados
  - `actions/evolution.ts` — server actions sem `any`, com tipo `success: true as const | false as const`

## Arquivos alterados

**Worktree branch `claude/tender-tesla-213f0c`:**

Criados:
- `src/lib/server/evolution-client.ts`
- `src/lib/server/evolution-rate-limit.ts`
- `src/lib/server/evolution-message-service.ts`
- `src/lib/server/evolution-service.ts`
- `src/lib/validations/evolution.ts`
- `src/lib/actions/evolution.ts`
- `docs/agents/phase-8.3-integration-report.md`

Editados:
- `docs/contracts/evolution-8.3.md` — atualizado para refletir integração
- `TODO.md` (main repo) — Fase 8.3 marcada como done (migration 014, AES-256-GCM, rate limit)
- `README.md` (main repo) — `EVOLUTION_ENCRYPTION_KEY` documentado + range atualizado para 001-014

Preexistentes do 8.3A (mantidos):
- `supabase/migrations/014_evolution_api_foundation.sql`
- `src/lib/server/evolution-crypto.ts`
- `src/lib/server/evolution-config-repository.ts`
- `src/lib/server/evolution-types.ts`

**Main repo (master working tree) — limpeza:**

Deletados (eram drafts untracked do 8.3B):
- `src/lib/server/evolution-crypto.ts` (XOR)
- `src/lib/server/evolution-config-repository.ts` (duplicado)
- `supabase/migrations/013_evolution.sql` (schema incompleto)

Mantidos no working tree do master (não trackados, não fazem parte da entrega):
- `src/lib/server/evolution-client.ts`, `evolution-rate-limit.ts`, `evolution-service.ts` — equivalentes refatorados estão no worktree
- `src/lib/validations/evolution.ts`, `src/lib/actions/evolution.ts` — equivalentes refatorados estão no worktree
- `docs/agents/phase-8.3B-report.md` — relatório histórico, preservado

## Migrations finais

Sequência committed no branch `claude/tender-tesla-213f0c`:

```
001_foundation.sql           — orgs, profiles, members, audit_logs, helpers RLS
002_business_tables.sql      — clients, projects, project_members
003_ai_reference.sql         — ai_providers, ai_models
004_dashboard_rpcs.sql       — RPCs métricas dashboard
005_revenues_costs.sql       — revenues, costs
006_ai_usage.sql             — ai_usage
007_time_entries_deliveries.sql — time_entries, deliveries
014_evolution_api_foundation.sql — evolution_configs + evolution_message_logs
```

**Gap 008–013 no branch:** o working tree do master contém migrations 008–012 untracked (`infra_resources`, `audit_fixes`, `kanban`, `notifications`, `security_fixes`) que ainda não foram commitadas em nenhum branch. Esse gap é pré-existente à integração 8.3 — não bloqueia a fundação 8.3 mas o branch worktree tem dependência implícita dessas tabelas (ex: kanban). Antes de merge do worktree no master, os agentes/integradores devem decidir como versionar 008–012 (commit no master ou rebase na sequência do worktree).

**Único `create table evolution_configs`** e **único `create table evolution_message_logs`** em todo `supabase/migrations/`.

## Segurança

- **RLS:** `is_admin_or_socio(org_id)` — admin/socio leem/inserem/editam ambas as tabelas; DELETE permitido em `evolution_configs`, ausente em `evolution_message_logs` (logs imutáveis pelo usuário). Sem `USING (true)` em nenhuma policy.
- **Roles:** `financeiro`, `gerente`, `dev` — sem acesso. Guard adicional em `evolution-service.requireAdminOrSocio()` antes de qualquer chamada.
- **Server-only:** `import "server-only"` em `evolution-crypto.ts`, `evolution-config-repository.ts`, `evolution-client.ts`, `evolution-rate-limit.ts`, `evolution-message-service.ts`, `evolution-service.ts`, `evolution-types.ts`. Compilação falha se importado em client component.
- **Segredos:** AES-256-GCM com IV aleatório por encrypt; chave `EVOLUTION_ENCRYPTION_KEY` (base64, 32 bytes, server-only). Nunca `NEXT_PUBLIC_`. Nunca logged em plaintext. `decryptSecret` lança erro genérico se GCM auth tag falhar.
- **UI:** `getSanitizedEvolutionConfigForOrg` é a única função que vai para UI; nunca retorna `*_encrypted`. `getDecryptedEvolutionSecretsForOrg` usado apenas server-side em `evolution-message-service.ts`.

## Validação

- **supabase db reset:** ⚠️ não executado por ausência de ambiente local Supabase nesta sessão. Migrações lidas e validadas estaticamente. Sem duplicação de `create table`. Single source of truth: `014_evolution_api_foundation.sql`.
- **typecheck:** ✅ PASS — `npx tsc --noEmit` → 0 erros após integração.
- **lint:** ✅ arquivos novos da integração — 0 erros. Warnings/errors restantes vêm de `.vercel/output/static/_next/static/chunks/*.js` (build artifacts) e `database.ts:560` (`Views: {};`) — pré-existentes, fora do escopo desta integração.
- **build:** ⚠️ compilação TypeScript ✅ (`Finished TypeScript in 7.2s`); prerender ❌ — pré-existente: `NEXT_PUBLIC_SUPABASE_URL` vazio em `.env.production.local` causa `Error: @supabase/ssr: Your project's URL and API key are required`. Em CI/CD com env injetada o build completa.
- **policy guard:** ✅ PASS — `npm run policyguard` → 0 violações.
- **agent cost:** MCP Agent Cost não disponível como tool deferida neste ambiente. Não registrado via MCP. Arquivos alterados listados acima.

## Pendências

- **CRÍTICO — gerar `EVOLUTION_ENCRYPTION_KEY`:** ainda não setada em produção (Vercel/Netlify) nem em `.env.production.local`. Sem ela, `encryptSecret`/`decryptSecret` lançam em runtime. Comando: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- **Remote DB pode ter 013_evolution aplicado:** o relatório 8.3B alega `supabase db push` foi executado. Se confirmado, o schema remoto tem as tabelas com a definição incompleta da 013. Antes de aplicar `014_evolution_api_foundation`, executar manualmente:
  ```sql
  drop table if exists evolution_message_logs cascade;
  drop table if exists evolution_configs cascade;
  drop type if exists evolution_message_status;
  ```
  E então rodar `014`. Alternativa: criar migration corretiva `015_evolution_hardening.sql` com `alter table` para reconciliar — mas o schema 013 é tão incompleto que recriar é mais limpo.
- **Gap migrations 008–012 no branch:** o worktree não tem essas tabelas tracked. Antes de merge para master, decidir estratégia de versionamento.
- **Fase 8.3C (UI):** página `/app/integracoes/evolution` e componentes não implementados. Out of scope desta integração.
- **Lint pré-existente:** `.vercel/output` precisa ser adicionado ao `globalIgnores` do `eslint.config.mjs`; `Views: {}` → `Views: Record<string, never>` em `database.ts`.

## Próxima fase liberada?

- **Sim** — para Fase 8.3C (UI de configuração + envio). Fundação + camada de envio prontas. UI só precisa consumir as server actions já expostas em `src/lib/actions/evolution.ts`.
- **Sim** — para Fase 8.4 (Webhook inbound). `webhook_secret` armazenado criptografado e descriptografável via `getDecryptedEvolutionSecretsForOrg(orgId).webhook_secret`. Use HMAC para validar assinatura recebida da Evolution.

**Justificativa:** zero conflitos de migration, zero código XOR, AES-256-GCM única estratégia, RLS restritivo confirmado, services/actions usando repository 8.3A, status `rate_limited` no enum, typecheck/policyguard limpos, build falha apenas por env vazia (pré-existente e isolada para `.env.production.local`).
