# Macrofase 10.1 — WhatsApp First Pipeline

## Veredito

- Status: ✅ CONCLUÍDA
- **Build: 30 rotas, 0 TypeScript errors, 0 lint errors, 11/11 testes**

---

## Implementado

### Pipeline completo

```
Mensagem WhatsApp
↓
Webhook Evolution (existente)
↓
/api/ia/process-webhook (atualizado)
↓
classifyMessage() → intent + confidence
↓
parsePayload() → extracted_payload
↓
evaluateConfirmation() → status + missing_fields + confirmation_message
↓
insertCommand() → whatsapp_commands
↓
UI /app/ia/comandos → admin/socio revisam
↓
approve → apply → executeCommand() → INSERT no banco
↓
recordCommandAudit() → audit_logs
```

### Classifier

- **Arquivo:** `src/lib/server/whatsapp-command-classifier.ts`
- **Tipo:** Heurístico (zero custo IA)
- **Regras:** 13 intents, ~80 keywords, scoring ponderado
- **Reforço:** Padrões regex para valor monetário e horas

### Parser

- **Arquivo:** `src/lib/server/whatsapp-command-parser.ts`
- **Extração:** Nome de entidade, valor R$, horas, data (relativa + absoluta), prioridade, URL
- **Resolução de data:** "amanhã", "hoje", "sexta", "25/05"

### Commands table

- **Migration:** `supabase/migrations/017_whatsapp_commands.sql`
- **Tabela:** `whatsapp_commands` — 19 colunas, 6 constraints, 7 índices, 7 políticas RLS
- **RLS:** admin/socio (todos), financeiro (comandos financeiros), gerente (operacional), dev (tarefas/tempo)

### Executor

- **Arquivo:** `src/lib/server/whatsapp-command-executor.ts`
- **Suporta 9 intents:** create_client, create_project, create_task, update_task_status, add_time_entry, create_delivery, create_revenue, create_cost, create_infra_resource
- **Resolução:** project_name → project_id, client_name → client_id, assignee_name → user_id
- **Fallback:** primeiro projeto ativo, primeira coluna do board

### UI

- **Rota:** `/app/ia/comandos`
- **Componentes:** `commands-table.tsx` + `command-detail.tsx`
- **Ações:** Aprovar, Rejeitar, Aplicar, Visual detalhes
- **Acesso:** admin, socio, financeiro, gerente

### Actions

- **Arquivo:** `src/lib/actions/whatsapp-commands.ts`
- `getWhatsAppCommandsAction()` — lista comandos da org
- `approveWhatsAppCommandAction()` — aprova comando pendente
- `rejectWhatsAppCommandAction()` — rejeita comando
- `applyWhatsAppCommandAction()` — executa comando aprovado

### Integração process-webhook

- **Arquivo:** `src/app/api/ia/process-webhook/route.ts` (atualizado)
- Pipeline WhatsApp First + legado (task_ai_suggestions) em paralelo
- Idempotência: unique index `(webhook_log_id, intent)`

---

## Intenções suportadas

| Intent | Classifier | Parser | Executor | Confirmação |
|--------|-----------|--------|----------|-------------|
| create_client | ✅ keywords | ✅ name/email/phone | ✅ INSERT clients | pending_review |
| create_project | ✅ keywords | ✅ name/client/budget/deadline | ✅ INSERT projects | pending_review |
| create_task | ✅ keywords | ✅ title/project/assignee/priority | ✅ INSERT tasks | approved (auto) |
| update_task_status | ✅ keywords | ✅ task/status | ✅ UPDATE tasks | approved (auto) |
| add_time_entry | ✅ keywords | ✅ hours/project/date | ✅ INSERT time_entries | approved (auto) |
| create_delivery | ✅ keywords | ✅ description/project/link | ✅ INSERT deliveries | pending_review |
| create_revenue | ✅ keywords | ✅ amount/description/category | ✅ INSERT revenues | pending_review |
| create_cost | ✅ keywords | ✅ amount/description/category | ✅ INSERT costs | pending_review |
| create_infra_resource | ✅ keywords | ✅ name/type/provider/cost | ✅ INSERT infra_resources | pending_review |
| query_project_status | ✅ keywords | ✅ query_type | ❌ (leitura) | N/A |
| query_financial_summary | ✅ keywords | ✅ period | ❌ (leitura) | N/A |
| query_ai_costs | ✅ keywords | ✅ query_type | ❌ (leitura) | N/A |
| query_today_tasks | ✅ keywords | ✅ query_type | ❌ (leitura) | N/A |

---

## Política de confirmação

| Condição | Status | Ação |
|----------|--------|------|
| confidence < 0.7 | low_confidence | Não aplica. Pede esclarecimento. |
| Campos obrigatórios faltando | pending_confirmation | Pergunta campos faltantes. |
| Intents financeiros (revenue/cost) | pending_review | Sempre requer aprovação humana. |
| Intents de criação (client/project/delivery/infra) | pending_review | Requer revisão no MVP. |
| Intents operacionais (task/time_entry/status) | approved | Pode auto-aplicar. |
| Consultas | N/A | Leitura apenas. |

---

## Segurança

- ✅ internal API key: obrigatória em /api/ia/process-webhook
- ✅ RLS: 7 políticas por role (admin/socio, financeiro, gerente, dev)
- ✅ Roles: cada intent tem lista de roles permitidas
- ✅ Secrets: decryptSecret, INTERNAL_API_KEY, EVOLUTION_ENCRYPTION_KEY nunca no frontend
- ✅ Supabase UI: zero createClient em components
- ✅ Idempotência: unique index (webhook_log_id, intent)
- ✅ Audit: recordCommandAudit + recordPipelineEvent em toda ação

---

## Custo IA

- **Classificador:** Heurístico (zero tokens)
- **Parser:** Regex (zero tokens)
- **LLM:** Não utilizado nesta fase
- **Custo estimado:** US$ 0.00

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/017_whatsapp_commands.sql` | NOVO — migration |
| `src/lib/validations/whatsapp-commands.ts` | NOVO — tipos, schemas Zod, mapas |
| `src/lib/server/whatsapp-command-classifier.ts` | NOVO — classificador heurístico |
| `src/lib/server/whatsapp-command-parser.ts` | NOVO — extrator de payload |
| `src/lib/server/whatsapp-command-repository.ts` | NOVO — CRUD whatsapp_commands |
| `src/lib/server/whatsapp-confirmation-service.ts` | NOVO — política de confirmação |
| `src/lib/server/whatsapp-command-executor.ts` | NOVO — executor de comandos |
| `src/lib/server/whatsapp-audit-service.ts` | NOVO — auditoria de pipeline |
| `src/lib/actions/whatsapp-commands.ts` | NOVO — server actions UI |
| `src/app/api/ia/process-webhook/route.ts` | MODIFICADO — pipeline WhatsApp First |
| `src/app/(authenticated)/app/ia/comandos/page.tsx` | NOVO — página de comandos |
| `src/components/ia/whatsapp-commands/commands-table.tsx` | NOVO — tabela de comandos |
| `src/components/ia/whatsapp-commands/command-detail.tsx` | NOVO — detalhe do comando |

**Total: 12 novos, 1 modificado**

---

## Validação

| Gate | Resultado |
|------|-----------|
| typecheck | ✅ 0 errors |
| lint | ✅ 0 errors, 16 warnings (0 novos) |
| build | ✅ 30 rotas, 0 TypeScript errors |
| test | ✅ 11/11 passou |
| policy guard | ✅ sem violações |
| migration aplicada | ✅ 017_whatsapp_commands.sql |

---

## Anti-regressão

| Verificação | Resultado |
|-------------|-----------|
| USING (true) em migrations | ✅ ZERO |
| WITH CHECK (true) em migrations | ✅ ZERO (apenas insert/update via server) |
| service_role em frontend | ✅ ZERO |
| createClient em components | ✅ ZERO |
| api_key_encrypted frontend | ✅ ZERO |
| webhook_secret_encrypted frontend | ✅ ZERO |
| decryptSecret frontend | ✅ ZERO |
| INTERNAL_API_KEY frontend | ✅ ZERO |
| EVOLUTION_ENCRYPTION_KEY frontend | ✅ ZERO |

---

## Pendências

### P0 — Nenhuma

### P1 — Smoke test manual

- [ ] Enviar mensagem WhatsApp → verificar webhook log criado
- [ ] Disparar /api/ia/process-webhook com webhookLogId
- [ ] Verificar comando criado em whatsapp_commands
- [ ] Verificar UI /app/ia/comandos mostra comando
- [ ] Aprovar comando → verificar status approved
- [ ] Aplicar comando → verificar ação no banco
- [ ] Verificar audit log registrado

### P2 — Melhorias

- [ ] Implementar resposta automática via Evolution outbound
- [ ] Adicionar suporte a LLM para classificação ambígua
- [ ] Implementar queries (leitura) com resposta formatada
- [ ] Adicionar timeout de confirmação (15 min)
- [ ] Integrar com ai_usage quando LLM for usado

---

## Próxima fase recomendada

**Macrofase 10.2 — WhatsApp Response + LLM:** Enviar respostas automáticas pelo WhatsApp (Evolution outbound), integrar LLM para classificação de mensagens ambíguas, implementar queries com sumarização, adicionar processamento de áudio (Whisper).
