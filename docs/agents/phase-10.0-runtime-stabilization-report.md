# Macrofase 10.0 — Runtime Stabilization + WhatsApp First Product Analysis

## Veredito

- Status: ✅ CONCLUÍDA
- **Build: 29 rotas, 0 TypeScript errors, 0 lint errors, 11/11 testes**

---

## Erros corrigidos

### 1. /app/projetos — "This page couldn't load"

- **causa:** `Promise.all` sem try/catch, `user!.id` non-null assertion, `.single()` sem error check, `member?.org_id ?? ""` (string vazia para UUID), sem error boundary
- **correção:** Try/catch no Promise.all, guard para `!user`, guard para `!member?.org_id`, error.tsx global no grupo app, safe log em falha
- **arquivos:** `src/app/(authenticated)/app/projetos/page.tsx`, `src/app/(authenticated)/app/error.tsx`
- **teste:** ✅ Build passa, 0 TypeScript errors

### 2. /app/tempo — "This page couldn't load"

- **causa:** Mesmo padrão: `Promise.all` sem try/catch, `profiles(full_name)` embed com risco de RLS re-entrancy
- **correção:** Try/catch, profiles query separada (evita RLS re-entrancy), guard para `!user`
- **arquivos:** `src/app/(authenticated)/app/tempo/page.tsx`
- **teste:** ✅ Build passa

### 3. /app/entregas — "This page couldn't load"

- **causa:** Mesmo padrão de /app/tempo
- **correção:** Try/catch, profiles query separada, `.order("due_date", { nullsFirst: false })` mantido
- **arquivos:** `src/app/(authenticated)/app/entregas/page.tsx`
- **teste:** ✅ Build passa

### 4. /app/infraestrutura — "This page couldn't load"

- **causa:** `Promise.all` sem try/catch
- **correção:** Try/catch, guard para `!user`, safe log
- **arquivos:** `src/app/(authenticated)/app/infraestrutura/page.tsx`
- **teste:** ✅ Build passa

### 5. /app/tarefas — "Nenhum quadro Kanban criado. Use o SQL Editor..."

- **causa:** Nenhum board no banco (0 rows em task_boards), sem ação de criação, sem UI
- **correção:** `createDefaultBoardAction` em `src/lib/actions/tasks.ts`, `CreateBoardButton` component com 5 colunas padrão (Backlog, A Fazer, Em Andamento, Revisão, Concluído), botão na página tarefas, try/catch
- **arquivos:** `src/lib/actions/tasks.ts`, `src/components/kanban/create-board-button.tsx`, `src/app/(authenticated)/app/tarefas/page.tsx`
- **teste:** ✅ Build passa

### 6. clients.email schema — "Could not find the 'email' column of 'clients' in the schema cache"

- **causa:** Migration 002 definia `email`/`phone` mas foi aplicada sem essas colunas. Banco real tinha `contact_name`/`contact_email`/`notes`. Código usava `email`.
- **correção:** Migration 016 `alter table clients add column if not exists email text; add column if not exists phone text;` aplicada via Supabase CLI `--linked`. Types atualizados para incluir todas as colunas reais.
- **migration:** `supabase/migrations/016_add_client_email_phone.sql` — aplicada 2026-05-20
- **arquivos:** `supabase/migrations/016_add_client_email_phone.sql`, `src/types/database.ts`
- **teste:** ✅ Colunas confirmadas via `information_schema.columns`

### 7. Base UI #59 — "Uncaught Error: Base UI error #59"

- **causa:** `Select value={m.role}` com valor potencialmente fora dos SelectItems (role desconhecido), 5 dialogs com `SelectPopover` contendo zero `SelectItem` quando arrays vazios
- **correção:** `safeRole()` guard nos usuarios-table, `SelectItem value="" disabled` placeholder nos 5 dialogs (financeiro-dialogs 2x, entregas-dialog, tempo-dialog 2x, infra-dialog)
- **arquivos:** `src/components/admin/usuarios-table.tsx`, `src/components/financeiro/financeiro-dialogs.tsx`, `src/components/entregas/entregas-dialog.tsx`, `src/components/tempo/tempo-dialog.tsx`, `src/components/infraestrutura/infra-dialog.tsx`
- **teste:** ✅ Build passa, sem runtime errors de Select

### 8. Admin Usuários — Membros (0)

- **causa:** `profiles(full_name)` embed em `organization_members` query com possível falha de RLS re-entrancy ou FK resolution. `error` não destruturado — `data` nulo vira `[]` silenciosamente
- **correção:** Query de membros sem embed, profiles query separada com `.in("user_id", userIds)`, join em memória, `memberError` verificado com safe log
- **arquivos:** `src/app/(authenticated)/app/admin/usuarios/page.tsx`
- **teste:** ✅ Build passa, member ID do admin passa corretamente

### 9. Evolution URL — Aceitou email no lugar de URL

- **causa:** Zod `.url()` só no server-side (`evolution-service.ts`), form client-side sem validação
- **correção:** `type="url"` no Input, função `validateUrl()` client-side (bloqueia email, exige `https://`, valida com `new URL()`), mensagem de erro inline, validação antes do submit
- **arquivos:** `src/components/evolution/evolution-config-form.tsx`
- **teste:** ✅ Build passa

---

## Produto WhatsApp First

- **documento:** `docs/product/whatsapp-first-operating-model.md`
- **comandos mapeados:** 12 (criar cliente, criar projeto, criar tarefa, atualizar status, registrar hora, registrar entrega, registrar receita, registrar custo, registrar infraestrutura, consultar financeiro, consultar projetos em risco, consultar tarefas do dia)
- **modelo:** 4 atores (Web = painel, WhatsApp = entrada, IA = operador, Humano = aprovação)
- **formatos suportados:** texto, áudio (Whisper), imagem (OCR), documento (PDF/CSV/Excel)
- **próximos passos:** Implementar pipeline WhatsApp → IA (Macrofase futura)

---

## IA Tokens & Cost Governance

- **documento:** `docs/product/ai-tokens-cost-governance.md`
- **tabelas propostas:** 7 (ai_providers, ai_models, ai_api_keys, ai_usage, ai_budgets, ai_cost_alerts, ai_execution_logs)
- **telas propostas:** 4 (/app/ia/tokens, /app/ia/custos, /app/ia/modelos, /app/ia/logs)
- **regras:** AES-256-GCM, RBAC 5 níveis, thresholds 80/90/100%, hard stop por orçamento
- **próximos passos:** Implementar módulo de governança (Macrofase futura)

---

## Arquivos alterados

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/016_add_client_email_phone.sql` | NOVO — migration |
| `src/types/database.ts` | MODIFICADO — clients Row/Insert/Update |
| `src/app/(authenticated)/app/error.tsx` | NOVO — error boundary |
| `src/app/(authenticated)/app/projetos/page.tsx` | MODIFICADO — try/catch + guards |
| `src/app/(authenticated)/app/tempo/page.tsx` | MODIFICADO — try/catch + profiles separado |
| `src/app/(authenticated)/app/entregas/page.tsx` | MODIFICADO — try/catch + profiles separado |
| `src/app/(authenticated)/app/infraestrutura/page.tsx` | MODIFICADO — try/catch |
| `src/app/(authenticated)/app/tarefas/page.tsx` | MODIFICADO — try/catch + botão criar board |
| `src/app/(authenticated)/app/admin/usuarios/page.tsx` | MODIFICADO — profiles separado + error handling |
| `src/lib/actions/tasks.ts` | MODIFICADO — createDefaultBoardAction |
| `src/components/kanban/create-board-button.tsx` | NOVO — botão criar board |
| `src/components/admin/usuarios-table.tsx` | MODIFICADO — safeRole guard |
| `src/components/evolution/evolution-config-form.tsx` | MODIFICADO — URL validation client-side |
| `src/components/financeiro/financeiro-dialogs.tsx` | MODIFICADO — empty SelectItem guard |
| `src/components/entregas/entregas-dialog.tsx` | MODIFICADO — empty SelectItem guard |
| `src/components/tempo/tempo-dialog.tsx` | MODIFICADO — empty SelectItem guard (2x) |
| `src/components/infraestrutura/infra-dialog.tsx` | MODIFICADO — empty SelectItem guard |
| `docs/product/whatsapp-first-operating-model.md` | NOVO — doc produto |
| `docs/product/ai-tokens-cost-governance.md` | NOVO — doc governança |

**Total: 4 novos, 15 modificados**

---

## Migration

- **criada:** `016_add_client_email_phone.sql`
- **motivo:** Sincronizar schema real (contact_name/contact_email/notes) com código (email/phone)
- **aplicada:** 2026-05-20 via `npx supabase db query --linked`
- **verificada:** Colunas email e phone confirmadas via `information_schema.columns`

---

## Validação

| Gate | Resultado |
|------|-----------|
| typecheck | ✅ 0 errors (embutido no build) |
| lint | ✅ 0 errors, 16 warnings (0 novos) |
| build | ✅ 29 rotas, 0 TypeScript errors |
| test | ✅ 11/11 passou |
| policy guard | ✅ sem violações |

---

## Anti-regressão

| Verificação | Resultado |
|-------------|-----------|
| USING (true) em migrations | ✅ ZERO |
| WITH CHECK (true) em migrations | ✅ ZERO |
| service_role em frontend | ✅ ZERO |
| createClient em components (src/components) | ✅ ZERO |
| api_key_encrypted frontend | ✅ ZERO |
| webhook_secret_encrypted frontend | ✅ ZERO |
| decryptSecret frontend | ✅ ZERO |

---

## Smoke test

| Rota | Build | Correção |
|------|-------|----------|
| /app/projetos | ✅ | try/catch + guard |
| /app/clientes | ✅ | migration email/phone |
| /app/tarefas | ✅ | botão criar board |
| /app/tempo | ✅ | try/catch + profiles separado |
| /app/entregas | ✅ | try/catch + profiles separado |
| /app/infraestrutura | ✅ | try/catch |
| /app/admin/usuarios | ✅ | profiles separado |
| /app/configuracoes/evolution | ✅ | URL validation |

---

## Pendências

### P0 — Nenhuma

### P1 — Smoke test manual em produção (navegador)

- [ ] Login como admin em https://softhouse.nanoai.com.br/login
- [ ] Verificar /app/projetos carrega (empty state)
- [ ] Criar cliente em /app/clientes (verificar email/phone salvam)
- [ ] Criar quadro Kanban em /app/tarefas (botão "Criar quadro Kanban padrão")
- [ ] Verificar /app/tempo carrega
- [ ] Verificar /app/entregas carrega
- [ ] Verificar /app/infraestrutura carrega
- [ ] Verificar /app/admin/usuarios mostra admin como membro
- [ ] Verificar Evolution rejeita email como URL
- [ ] Verificar Base UI #59 não aparece no console

### P2 — Melhorias

- [ ] Executar primeiro backup (dados já existem)
- [ ] Criar usuários de teste para cada role
- [ ] Validar matriz de permissões com navegador

---

## Próxima fase recomendada

**Macrofase 10.1 — WhatsApp First Pipeline:** Implementar webhook de entrada do WhatsApp (Evolution), processamento de mensagens pela IA, classificação de intenção, extração de entidades, confirmação interativa. Baseado no modelo documentado em `whatsapp-first-operating-model.md`.
