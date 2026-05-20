# AI Tokens & Cost Governance

**Status**: Proposta / Futura implementação
**Sistema**: Softhouse Finance
**Módulo**: Governança de Tokens e Custos de IA

---

## Visão Geral

Módulo de governança para controlar o consumo de tokens e os custos associados ao uso de APIs de inteligência artificial (OpenAI, Anthropic, Google AI, etc.) dentro da plataforma Softhouse Finance. O objetivo é prover visibilidade de gastos, imposição de limites orçamentários e auditoria completa do uso de IA por organização, usuário e módulo.

---

## Tabelas Propostas

### ai_providers

Registra os provedores de IA integrados à plataforma.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| name | text | NOT NULL, UNIQUE | Nome do provedor (ex: "OpenAI", "Anthropic", "Google AI") |
| api_base_url | text | NOT NULL | URL base da API do provedor |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Data de criação do registro |

### ai_models

Modelos disponíveis por provedor, com custos de referência por 1k tokens.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| provider_id | uuid | FK → ai_providers(id), NOT NULL | Provedor do modelo |
| name | text | NOT NULL | Nome do modelo (ex: "gpt-4o", "claude-opus-4-7") |
| input_cost_per_1k | numeric(10,6) | NOT NULL, DEFAULT 0 | Custo em USD por 1.000 tokens de input |
| output_cost_per_1k | numeric(10,6) | NOT NULL, DEFAULT 0 | Custo em USD por 1.000 tokens de output |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Data de criação do registro |

Constraint adicional: `UNIQUE(provider_id, name)`.

### ai_api_keys

Chaves de API criptografadas por organização e provedor.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| provider_id | uuid | FK → ai_providers(id), NOT NULL | Provedor associado |
| org_id | uuid | FK → organizations(id), NOT NULL | Organização proprietária da chave |
| key_encrypted | text | NOT NULL | Chave de API criptografada (AES-256-GCM) |
| created_by | uuid | FK → auth.users(id), NOT NULL | Usuário que cadastrou a chave |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Data de criação |

Constraint adicional: `UNIQUE(provider_id, org_id)` — uma chave por provedor por organização.

### ai_usage

Registro de consumo de tokens por chamada à API de IA.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| org_id | uuid | FK → organizations(id), NOT NULL | Organização |
| user_id | uuid | FK → auth.users(id), NOT NULL | Usuário que originou a chamada |
| model_id | uuid | FK → ai_models(id), NOT NULL | Modelo utilizado |
| input_tokens | integer | NOT NULL, CHECK >= 0 | Tokens de entrada consumidos |
| output_tokens | integer | NOT NULL, CHECK >= 0 | Tokens de saída consumidos |
| cost_estimated | numeric(10,6) | NOT NULL, CHECK >= 0 | Custo estimado em USD |
| module | text | NOT NULL | Módulo de origem (ex: "financeiro", "projetos", "notificacoes") |
| action | text | NOT NULL | Ação executada (ex: "gerar_relatorio", "resumir_documento") |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Timestamp da chamada |

Índices sugeridos: `(org_id, created_at DESC)`, `(user_id, created_at DESC)`, `(module, created_at DESC)`.

### ai_budgets

Orçamentos mensais de consumo de IA por organização.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| org_id | uuid | FK → organizations(id), NOT NULL, UNIQUE | Organização |
| monthly_limit | numeric(10,2) | NOT NULL, CHECK > 0 | Limite mensal em USD |
| alert_threshold_pct | integer | NOT NULL, DEFAULT 80 | Percentual para alerta (ex: 80 dispara alerta aos 80%) |
| current_spending | numeric(10,2) | NOT NULL, DEFAULT 0 | Gasto acumulado no mês corrente |
| reset_day | integer | NOT NULL, DEFAULT 1, CHECK BETWEEN 1 AND 28 | Dia do mês para reset do contador |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Data de criação |

### ai_cost_alerts

Alertas de custo disparados por thresholds.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| org_id | uuid | FK → organizations(id), NOT NULL | Organização |
| alert_type | text | NOT NULL, CHECK IN ('threshold_80', 'threshold_90', 'threshold_100', 'budget_exceeded', 'unusual_spike') | Tipo do alerta |
| message | text | NOT NULL | Mensagem descritiva |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Data de criação do alerta |
| acknowledged_at | timestamptz | NULL | Data de reconhecimento (ack) do alerta |

### ai_execution_logs

Log detalhado de execuções de IA para auditoria e debugging.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | Identificador único |
| org_id | uuid | FK → organizations(id), NOT NULL | Organização |
| user_id | uuid | FK → auth.users(id), NOT NULL | Usuário |
| module | text | NOT NULL | Módulo de origem |
| action | text | NOT NULL | Ação executada |
| input_summary | text | NOT NULL | Resumo do input enviado (truncado para X caracteres) |
| output_summary | text | NULL | Resumo do output recebido (truncado) |
| tokens_used | integer | NOT NULL, CHECK >= 0 | Total de tokens (input + output) |
| cost | numeric(10,6) | NOT NULL, CHECK >= 0 | Custo real da chamada |
| duration_ms | integer | NOT NULL, CHECK >= 0 | Duração da chamada em milissegundos |
| success | boolean | NOT NULL, DEFAULT true | Se a chamada foi bem-sucedida |
| error_message | text | NULL | Mensagem de erro, se houve falha |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Timestamp |

---

## Telas Propostas

### 1. `/app/ia/tokens` — Dashboard de Uso

**Acesso**: admin, socio, financeiro

- Gráfico de consumo de tokens por período (dia, semana, mês)
- Top modelos utilizados (bar chart)
- Top usuários por consumo (table)
- Distribuição de tokens por módulo (pie/donut chart)
- Consumo total do mês corrente vs. mês anterior (KPI cards)
- Filtros: período, modelo, usuário, módulo

### 2. `/app/ia/custos` — Rastreamento de Custos

**Acesso**: admin, socio, financeiro

- Custo acumulado no mês com barra de progresso vs. orçamento
- Projeção de gasto até o fim do mês (forecast linear)
- Breakdown de custos por modelo
- Custo médio por chamada
- Histórico de faturas mensais (tabela paginada)
- Configuração de orçamento (admin/socio apenas):
  - Definir limite mensal
  - Ajustar thresholds de alerta
  - Dia de reset do ciclo

### 3. `/app/ia/modelos` — Gestão de Modelos

**Acesso**: admin, socio

- Lista de provedores cadastrados com ações (editar, remover)
- Adicionar novo provedor (nome, URL base)
- Lista de modelos por provedor
- Adicionar/editar modelo (nome, custos por 1k tokens input/output)
- Gerenciar chaves de API por organização:
  - Adicionar chave (campo com toggle de visibilidade)
  - Remover chave (confirmação)
  - Indicador de chave configurada por org (sim/não)

### 4. `/app/ia/logs` — Logs de Execução

**Acesso**: admin, socio (visão própria org), dev (visão própria org, sem chaves)

- Tabela de execuções com colunas: data, usuário, módulo, ação, modelo, tokens, custo, duração, status
- Filtros: período, usuário, módulo, status (sucesso/erro)
- Expansão de linha para ver input_summary e output_summary
- Indicador visual de sucesso/erro (badge verde/vermelho)
- Exportação CSV

---

## Regras de Negócio

### Criptografia de Chaves

- Chaves de API armazenadas na coluna `key_encrypted` usando **AES-256-GCM**
- Mesmo padrão utilizado no módulo Evolution (webhook secrets)
- Chave mestra de criptografia armazenada em variável de ambiente (`AI_KEY_ENCRYPTION_SECRET`)
- Descriptografia ocorre apenas no servidor (Server Actions / API routes)

### Níveis de Acesso (RBAC)

| Perfil | Provedores/Modelos | Chaves de API | Uso/Custos | Logs | Orçamento |
|---|---|---|---|---|---|
| admin | CRUD | CRUD | Leitura | Leitura | CRUD |
| socio | Leitura | CRUD (própria org) | Leitura (própria org) | Leitura (própria org) | Leitura |
| financeiro | — | — | Leitura | — | — |
| dev | — | — | — | Leitura (própria org) | — |
| usuário comum | — | — | — | — | — |

### Limites e Bloqueios

**Limite mensal por organização:**
- Definido em `ai_budgets.monthly_limit`
- Consumo rastreado em `ai_budgets.current_spending` (reset no `reset_day` de cada mês)
- Quando `current_spending >= monthly_limit`: **hard stop** — novas chamadas à IA são bloqueadas para toda a organização

**Limite por usuário (futuro):**
- Campo adicional em tabela de relação user_org ou tabela dedicada
- Permite cotas individuais dentro do orçamento da organização

**Limite por módulo (futuro):**
- Alocação percentual do orçamento por módulo (ex: financeiro 40%, projetos 30%, notificacoes 20%, outros 10%)
- Bloqueio seletivo: apenas o módulo estourado é interrompido

### Sistema de Alertas

Fluxo de thresholds baseado em `ai_budgets.alert_threshold_pct`:

1. **80% do orçamento**: alerta informativo (`threshold_80`) — notificação no sistema + email para admin/socio
2. **90% do orçamento**: alerta de atenção (`threshold_90`) — notificação com destaque + email
3. **100% do orçamento**: alerta crítico (`threshold_100`) — notificação urgente + hard stop ativado
4. **Orçamento excedido**: `budget_exceeded` — disparado quando uma chamada é bloqueada por falta de orçamento
5. **Pico anômalo**: `unusual_spike` — detectado por heurística (ex: gasto diário > 3x média dos últimos 7 dias)

Alertas podem ser reconhecidos (`acknowledged_at` preenchido) por admin/socio.

### Estimativa de Custo

O custo de cada chamada é estimado com base nos preços cadastrados em `ai_models`:

```
cost_estimated = (input_tokens / 1000) * model.input_cost_per_1k
               + (output_tokens / 1000) * model.output_cost_per_1k
```

O valor é registrado em `ai_usage.cost_estimated` e também em `ai_execution_logs.cost` (que pode refletir o custo real faturado, se disponível via API do provedor).

### Hard Stop — Bloqueio por Orçamento

Antes de cada chamada à API de IA, o sistema verifica:

1. `ai_budgets.current_spending >= ai_budgets.monthly_limit` → **bloqueia** a chamada
2. Registra tentativa bloqueada em `ai_execution_logs` com `success = false` e `error_message` apropriado
3. Retorna erro controlado para o frontend (ex: toast "Orçamento de IA excedido. Contate o administrador.")

Admin/socio podem aumentar o limite a qualquer momento para desbloquear.

---

## Diagrama de Relacionamentos

```
ai_providers 1───N ai_models
ai_providers 1───N ai_api_keys
organizations 1───N ai_api_keys
organizations 1───N ai_usage
organizations 1───1 ai_budgets
organizations 1───N ai_cost_alerts
organizations 1───N ai_execution_logs
auth.users    1───N ai_usage
auth.users    1───N ai_execution_logs
auth.users    1───N ai_api_keys (created_by)
ai_models     1───N ai_usage
```

---

## Notas de Implementação

- **Criptografia**: Reutilizar utility function do módulo Evolution para AES-256-GCM (`src/lib/server/encryption.ts` ou similar)
- **Server Actions**: Toda lógica de leitura/escrita nas tabelas deve residir em Server Actions (`src/lib/actions/ia-governance.ts`), seguindo a regra `no-direct-supabase-in-ui`
- **RLS**: Habilitar Row Level Security em todas as tabelas. Políticas baseadas em `org_id` e perfil do usuário (claims JWT ou tabela `user_roles`)
- **Cron Job**: Job agendado (via `pg_cron` ou Edge Function) para reset de `ai_budgets.current_spending` no `reset_day` de cada mês
- **Métricas em tempo real**: `ai_budgets.current_spending` atualizado atomicamente via trigger ou transação no momento do registro em `ai_usage`
- **Índices**: Criar índices compostos para consultas frequentes (ver seção de cada tabela)
- **Migração**: Arquivo de migração sugerido: `supabase/migrations/016_ai_governance.sql`

---

## Checklist de Segurança

- [ ] Chaves de API nunca trafegam para o frontend (descriptografia apenas server-side)
- [ ] RLS impede leitura cruzada entre organizações
- [ ] Coluna `key_encrypted` nunca aparece em queries SELECT abertas
- [ ] `key_encrypted` excluída dos tipos TypeScript gerados pelo Supabase (via `generate_typescript_types` com filtro)
- [ ] Logs de execução não expõem conteúdo completo de input/output (apenas resumos truncados)
- [ ] Rate limiting nas Server Actions que disparam chamadas à IA
- [ ] Auditoria: todas as alterações em `ai_budgets` e `ai_api_keys` registradas em `audit_logs`
