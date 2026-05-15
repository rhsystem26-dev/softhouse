# Sistema de Gestão da Softhouse — Design Doc

**Data:** 2026-05-15
**Stack:** Next.js App Router + Tailwind + shadcn/ui + Supabase SSR + Recharts + TanStack Table + React Hook Form + Zod + Lucide React
**Tom visual:** Premium Tech Operating System (dark mode primário)

---

## Regra Zero — Rota `/`

- `/` redireciona para `/login` se não autenticado.
- `/` redireciona para `/app/dashboard` se autenticado.
- Nunca existirá landing page.

---

## Arquitetura de Rotas

```
/                          → redirect: /login ou /app/dashboard
/login                    → página pública de login
/app                      → grupo autenticado (middleware Supabase SSR)
  /app/dashboard          → dashboard geral
  /app/projetos           → lista de projetos
  /app/projetos/[id]      → detalhe do projeto (centro operacional)
  /app/financeiro         → receitas, custos, margem, breakdown
  /app/financeiro/relatorios
  /app/ia                 → performance das IAs
  /app/ia/tokens          → consumo de tokens
  /app/tempo              → lançamentos de horas
  /app/entregas           → entregas por projeto
  /app/infraestrutura     → custos de infra
  /app/clientes           → lista de clientes
  /app/admin/usuarios     → gestão de usuários (admin/sócio)
```

## Estrutura de Pastas

```
src/
├── app/
│   ├── (public)/login/page.tsx
│   ├── (authenticated)/app/
│   │   ├── layout.tsx              # sidebar + header
│   │   ├── dashboard/page.tsx
│   │   ├── projetos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── financeiro/
│   │   │   ├── page.tsx
│   │   │   └── relatorios/page.tsx
│   │   ├── ia/
│   │   │   ├── page.tsx
│   │   │   └── tokens/page.tsx
│   │   ├── tempo/page.tsx
│   │   ├── entregas/page.tsx
│   │   ├── infraestrutura/page.tsx
│   │   ├── clientes/page.tsx
│   │   └── admin/usuarios/page.tsx
│   └── layout.tsx                  # root redirect
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── layout/                     # sidebar, header, app-shell
│   ├── projetos/
│   ├── financeiro/
│   ├── ia/
│   ├── tempo/
│   ├── entregas/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # SSR client
│   │   ├── client.ts               # browser client
│   │   └── middleware.ts            # session refresh
│   └── utils.ts
├── hooks/
├── types/
└── middleware.ts                    # root auth guard
```

---

## Design System — Premium Tech Operating System

### Paleta (Dark Mode)

| Token | Cor | Uso |
|---|---|---|
| bg base | slate-950 `#020617` | fundo da página |
| bg elevado | slate-900 `#0f172a` | cards, sidebar |
| bg hover | slate-800 `#1e293b` | rows, items |
| borda | slate-800/60 | dividers |
| texto primário | slate-100 | títulos, KPIs |
| texto secundário | slate-400 | descrições |
| acento | indigo-500 `#6366f1` | botões, links, seleção |
| info | sky-500 `#0ea5e9` | gráficos, badges info |
| positivo | emerald-500 `#10b981` | receita, margem positiva |
| alerta | amber-500 `#f59e0b` | atrasos, warnings |
| crítico | rose-500 `#f43f5e` | erros, margem negativa |

### Regras de Legibilidade (Dark Mode)

- Tabelas financeiras: alto contraste (slate-100 sobre slate-900), linhas alternadas com diferença sutil.
- Números: sempre `font-mono tabular-nums` para alinhamento preciso.
- Gráficos: nunca depender só de cor — usar padrões de traço, preenchimento e labels.
- Estados de lucro/prejuízo: emerald-500 (positivo) e rose-500 (negativo) com ícone de seta.
- Mobile: densidade reduzida, cards empilham naturalmente, sem overflow horizontal.

### Tipografia

- **Texto:** Inter (Google Fonts)
- **Números/mono:** JetBrains Mono (KPIs, tokens, valores financeiros)
- **Escala:** Tailwind padrão (xs a 4xl)

### Sidebar

- Desktop: fixa w-64, bg slate-950, borda direita sutil
- Mobile: overlay via Sheet (shadcn/ui)
- Logo + nome softhouse no topo
- Navegação agrupada por seção (Principal, Projetos, Financeiro, Operação, Sistema)
- Item ativo: bg indigo-500/10 + text indigo-400 + border-l-2 indigo-500
- Footer: avatar + nome + role do usuário

### Sidebar por Papel

| Seção | Admin | Sócio | Financeiro | Gerente | Dev |
|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | Financeiro | ✓ | Meus projetos |
| Projetos | ✓ | ✓ | ✓ | ✓ | ✓ |
| Clientes | ✓ | ✓ | ✓ | — | — |
| Financeiro | ✓ | ✓ | ✓ | — | — |
| IAs / Tokens | ✓ | ✓ | — | ✓ | Próprio uso |
| Tempo | ✓ | ✓ | — | ✓ | Próprio |
| Entregas | ✓ | ✓ | — | ✓ | Próprias |
| Infraestrutura | ✓ | ✓ | ✓ | — | — |
| Relatórios | ✓ | ✓ | ✓ | Operacionais | — |
| Admin | ✓ | — | — | — | — |

### Cards

- bg slate-900, borda slate-800/60
- KPI: label pequeno (slate-400), valor grande font-mono (slate-100)
- Projeto: nome + status badge + grid 2x2 de métricas + prazo + membros

### Badges de Status

- Ativo/Concluído: emerald-500/10 + emerald-400
- Atrasado: amber-500/10 + amber-400
- Em progresso: indigo-500/10 + indigo-400
- Pendente: slate-500/20 + slate-400

### Estados Obrigatórios

- **Loading:** Skeleton com mesma dimensão do conteúdo
- **Empty:** Ícone + título + descrição + CTA opcional
- **Error:** Card com borda rose-500/30 + mensagem + "Tentar novamente"
- **Sem Permissão:** Ícone ShieldOff + "Acesso restrito"

---

## Layouts de Página (Decisões de Mockup)

### 1. Dashboard Geral — Opção A

Hierarquia vertical: KPIs (4 cards) → gráfico receita vs custo + side metrics → cards de projeto (grid 3 colunas) → tokens + infra (2 colunas).

### 2. Página de Projetos — Opção B + toggle tabela

Default: cards em grid 2 colunas com borda lateral colorida de status.
Toggle: cards / tabela. Tabela com TanStack Table (ordenação, filtro, paginação).

### 3. Detalhe de Projeto — Opção B (Sidebar local + scroll)

**Centro operacional do sistema.** Sidebar local à esquerda com navegação por seção (sticky). Conteúdo à direita com scroll único por todas as seções: Visão Geral → Financeiro → IAs e Tokens → Tempo → Entregas → Infraestrutura → Histórico.

### 4. Performance das IAs — Opção A (Cards por modelo)

Grid 3 colunas de cards. Cada card: cor no topo, sparkline de 30 dias, métricas: tokens, custo, score, taxa de aproveitamento, latência. Gráfico de tokens por modelo (12 meses) na base.

**Métricas são data-driven, nunca "achismo":**
- custo final (R$)
- tokens (in + out)
- nota de qualidade (1-5, manual ou benchmark)
- tempo economizado estimado (horas)
- resultado do uso (código aceito/recusado/modificado)
- entrega vinculada (FK deliveries)
- taxa de retrabalho (bug/descarte/refação)

### 5. Fórmula de Score de IA

```
score = qualidade_media * 30
      + taxa_aproveitamento * 25
      + tempo_economizado_normalizado * 25
      - custo_normalizado * 10
      - taxa_retrabalho * 10
```

Fórmula visível na UI. Parâmetros explicáveis. Pode evoluir em fases futuras, mas sempre documentada.

### 6. Financeiro — Opção A (KPIs + Gráfico + Donut)

KPIs (5 cards: receita, custo, margem, lucro, previsão) → gráfico receita vs custo + donut de breakdown → tabela por projeto.

### 7. Tempo & Entregas — Opção A (Páginas separadas)

**Tempo:** KPIs (horas mês, média/dia, devs) → gráfico horas/projeto + horas/dev → tabela de lançamentos com filtros.
**Entregas:** KPIs (concluídas, em progresso, atrasadas) → próximas entregas → timeline do mês.

---

## Modelo de Dados — Architecture Organization-First

Regra base: toda tabela principal tem `organization_id` (direto ou via FK). Usuário só acessa dados de organizações onde é membro ativo.

### Tabelas da Fundação (Fase 1)

```
organizations         — id, name, slug, created_at
organization_members  — id, org_id, user_id, role (admin/socio/financeiro/gerente/dev), joined_at
profiles              — id, user_id (FK auth.users), full_name, avatar_url, created_at
audit_logs            — id, org_id, actor_id, action, table_name, record_id, old_data (jsonb), new_data (jsonb), created_at
```

### Tabelas de Negócio (Fases 2+)

```
clients               — id, org_id, name, email, phone, created_at
projects              — id, org_id, client_id, name, description, status, start_date, end_date, budget, created_at
project_members       — id, project_id, user_id, role (gerente/dev), assigned_at
revenues              — id, project_id, org_id, amount, description, date, type
costs                 — id, project_id, org_id, amount, description, date, category (ia/infra/pessoal/outros)
ai_providers          — id, name (OpenAI/Anthropic/Google/etc.)
ai_models             — id, provider_id, name (GPT-4o/Claude Opus/etc.), input_cost_per_1m, output_cost_per_1m
ai_usage              — id, project_id, user_id, model_id, tokens_in, tokens_out, cost, latency_ms,
                        quality_score (1-5), time_saved_hours, result (accepted/rejected/modified), delivery_id (FK),
                        rework (bool), notes, created_at
time_entries          — id, project_id, user_id, hours, description, date
deliveries            — id, project_id, title, description, status, due_date, completed_at, assignee_id
infra_resources       — id, project_id, org_id, name, type, cost_monthly, provider
```

### Eventos de Audit Log (Fase 1)

Registrar obrigatoriamente:
- Criação/edição/exclusão de projeto
- Criação/edição/exclusão de receita
- Criação/edição/exclusão de custo
- Alteração manual de custo de IA
- Alteração de papéis (organization_members)
- Alteração de status de entrega

### Regras RLS

- Toda tabela tem `organization_id` (ou via FK para projeto → org_id).
- Função base: `EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid() AND org_id = <org_id>)`.
- Admin e Sócio: SELECT/INSERT/UPDATE/DELETE em todas as tabelas da org.
- Financeiro: SELECT em projetos, clientes; ALL em revenues, costs, infra_resources.
- Gerente: SELECT/INSERT/UPDATE em projetos sob responsabilidade; ALL em deliveries e time_entries dos seus projetos.
- Desenvolvedor: SELECT em projetos onde é membro; INSERT próprios em time_entries, ai_usage; SELECT próprios registros.
- Políticas nunca usam `USING (true)`.
- RLS nunca é desativado.

---

## Fases de Implementação

### Fase 1 — Fundação (exclusivamente infra e auth)

- Scaffold Next.js App Router + Tailwind + shadcn/ui
- Configurar Supabase CLI local
- Migration 001: organizations, organization_members, profiles, audit_logs
- Auth flow completo: login, logout, middleware Supabase SSR, session refresh
- Layout base: sidebar + header + app-shell
- Redirect `/` funcional
- RLS base nas tabelas da fundação
- Seed inicial: 1 org, 1 admin, papéis base

### Fase 2 — CRUDs Centrais

- Migration 002: clients, projects, project_members
- Migration 003: ai_providers, ai_models
- CRUD completo de clientes e projetos
- Página de listagem de projetos (cards + toggle tabela)
- Página de detalhe do projeto (sidebar local + scroll com seções vazias)
- RLS de projetos e project_members

### Fase 3 — Dashboard Base

- KPIs financeiros via RPCs (aggregate queries)
- Gráfico receita vs custo (Recharts)
- Cards de projeto no dashboard
- Side metrics: projetos ativos, próximas entregas

### Fase 4 — Financeiro

- Migration 004: revenues, costs
- CRUD de receitas e custos
- Página financeira com gráficos e donut de breakdown
- Relatórios financeiros iniciais

### Fase 5 — IA & Tokens

- Migration 005: ai_usage (com todos os campos de score)
- Registro de uso de IA com métricas completas
- Página de performance (cards por modelo com sparkline)
- Score de IA visível e explicável
- RLS de ai_usage

### Fase 6 — Tempo & Entregas

- Migration 006: time_entries, deliveries
- Lançamento de horas e registro de entregas
- Páginas separadas com gráficos e timeline
- RLS de time_entries e deliveries

### Fase 7 — Infra + Admin + Refinamento

- Migration 007: infra_resources
- Gestão de usuários (admin)
- Relatórios exportáveis
- Refinamento visual e responsivo
- Testes Playwright completos

---

## Regras de Segurança

1. Nunca `service_role` no frontend.
2. Nunca expor dados publicamente.
3. Nunca `USING (true)` em policies.
4. Nunca desativar RLS.
5. Nunca apagar tabelas sem confirmação explícita.
6. Nunca editar `.env`, chaves ou secrets.
7. Nunca fazer push direto na main/master.
8. Toda alteração de banco via migration nova.
9. Toda migration revisada antes de aplicar.
10. Toda alteração de RLS deve ser auditada.
11. Toda funcionalidade crítica testada com Playwright MCP.

---

## Anti-Padrões

- Landing page (proibido)
- Cores vibrantes genéricas, neon, cyberpunk
- Gradientes chamativos, sombras exageradas
- Gráficos 3D, pizza com mais de 5 fatias
- Tabelas sem ordenação/filtro
- Números sem formatação de milhar
- Datas em formato inconsistente
- Overflow horizontal em qualquer breakpoint
- Elementos interativos com menos de 44px
- Animações desnecessárias
- Expor dados de outras organizações
- Afirmar performance de IA sem dados
