# TODO.md — Auditoria UX/UI e Código

Sistema de gestão interna para softhouse (Softhouse Finance).
Stack: Next.js 16 App Router + Supabase + Tailwind + shadcn/ui v4 (@base-ui/react) + Recharts + Zod.

## Acesso

- **Produção:** https://softhouse.nanoai.com.br
- **Login:** https://softhouse.nanoai.com.br/login (email+senha / link mágico)
- **Criar conta:** https://softhouse.nanoai.com.br/criar-conta
- **GitHub:** https://github.com/rhsystem26-dev/softhouse
- **Supabase:** ref `akdrcomrrsxhhbijtbtn`
- **Vercel:** `npx vercel --prod --yes`

## Fases de Implementação

### Fundação (Fases 1-5) ✅
- [x] Fase 1 — Scaffold, auth, layout, migrations base
- [x] Fase 2 — CRUDs Centrais (clientes, projetos, membros)
- [x] Fase 3 — IA Referência (providers, models, seeds)
- [x] Fase 4 — Financeiro (revenues, costs, KPIs, charts, relatórios)
- [x] Fase 5 — IA & Tokens (ai_usage, manual logging, performance page)

### Operação (Fases 6-7) ✅
- [x] Fase 6 — Tempo & Entregas (time_entries, deliveries, pages, projeto detail tabs)
- [x] Fase 7 — Infra + Admin + Refinamento (infra_resources, admin/usuarios, CSV export, placeholders)
- [x] Auditoria — Lint, docs, migration 009 (audit triggers + anti-escalation gerente)

### Fase 8 — Kanban, IA Gestora, Notificações e Evolution API
- [x] Fase 8.1 — Kanban/Tarefas (task_boards, columns, tasks, drag-drop, /app/tarefas)
- [x] Fase 8.2 — Central de Notificações (notification_logs, bell, /app/notificacoes)
- [ ] Fase 8.3 — Evolution API Outbound
- [ ] Fase 8.4 — Webhook Inbound
- [ ] Fase 8.5 — IA Project Manager
- [ ] Fase 8.6 — IA Head da Softhouse
- [ ] Fase 8.7 — IA Head Financeiro

## Estrutura do Projeto

```
src/
  app/
    (public)/
      login/page.tsx           — Login (senha + link mágico)
      criar-conta/page.tsx     — Cadastro com força de senha
      esqueceu-senha/page.tsx  — Recuperação por email
      redefinir-senha/page.tsx — Definir nova senha
    auth/
      callback/route.ts        — OAuth/magic link callback
      signout/route.ts         — Logout
    api/webhooks/evolution/    — (Fase 8.4)
    (authenticated)/app/
      layout.tsx               — Auth guard (redirect /login)
      dashboard/page.tsx       — KPIs + gráfico budget + projetos ativos
      projetos/page.tsx        — Lista de projetos
      projetos/[id]/page.tsx   — Detail com 7 abas
      clientes/page.tsx        — CRUD clientes
      financeiro/page.tsx      — KPIs + chart + donut + tabela
      financeiro/relatorios/   — Tabela com filtros + CSV export
      ia/page.tsx              — KPIs + model cards + tokens chart + tabela
      tempo/page.tsx           — KPIs + horas/projeto + horas/colaborador + tabela
      entregas/page.tsx        — KPIs + timeline + tabela
      infraestrutura/page.tsx  — KPIs + tabela recursos
      admin/usuarios/page.tsx  — Gestão de membros (admin only)
      tarefas/page.tsx         — Kanban board (Fase 8.1)
      notificacoes/page.tsx    — Central de notificações (Fase 8.2)
      ia/resumo/               — (Fase 8.6)
      ia/financeiro/           — (Fase 8.7)
  components/
    auth/                      — PasswordInput (olhinho), PasswordStrength (barra)
    financeiro/                — KPICards, chart, donut, table, dialogs, relatorios-table
    ia/                        — KPICards, model-cards, tokens-chart, usage-table, dialog, score-explainer
    tempo/                     — KPICards, chart, table, dialog
    entregas/                  — KPICards, timeline, table, dialog
    infraestrutura/            — KPICards, table, dialog
    admin/                     — usuarios-table
    projetos/                  — projeto-detail-view, projeto-local-sidebar, projeto-view
    layout/                    — sidebar, app-shell, header, user-nav
    kanban/                    — kanban-board, kanban-column, kanban-card, task-dialog
    notifications/             — notification-bell, notification-list
    ui/                        — shadcn/ui v4 primitives
  lib/
    actions/                   — Server actions (revenues, costs, ai-usage, time-entries, deliveries, admin, infra-resources, tasks, task-comments, notifications)
    supabase/                  — client, server, middleware (3 clients SSR)
    csv-export.ts              — CSV download utilitário
  hooks/                       — use-user.ts (auth hook)
supabase/
  migrations/                  — 11 migrations (001 a 011)
```

## Checklist de Auditoria UX/UI

### Geral
- [x] Tema dark consistente (slate-950 base, slate-900 cards, slate-800 bordas)
- [x] Responsividade mobile (sidebar colapsa, projeto detail tabs horizontais mobile)
- [x] Feedback visual em botões (hover, active, disabled)
- [x] Estados de carregamento (loading nos dialogs + loading.tsx skeleton por rota)
- [x] Estados vazios (EmptyState component reutilizável em todas as tabelas)
- [x] Estados de erro (mensagens em vermelho nos forms + error.tsx por rota com "Tentar novamente")
- [x] Toast/notificação de sucesso após criar/editar/excluir (Sonner — projeto, cliente, entrega, hora)
- [ ] Confirmação antes de excluir (dialogs de confirmação)
- [ ] Acessibilidade: contraste, labels, aria, navegação por teclado
- [ ] Tamanho mínimo de 44px para elementos interativos

### Sidebar
- [x] Navegação entre grupos (Principal, Projetos, Financeiro, Operação, Sistema)
- [ ] Indicador de página ativa
- [x] Sidebar mobile (Sheet overlay)
- [x] Roles: admin vê tudo, dev vê só Principal+Projetos

### Páginas (22+ rotas)
- [x] Dashboard: KPIs alinhados, gráfico Recharts sem overflow, cards de projetos clicáveis
- [x] Projetos: CRUD funcional, detail com 7 abas (visão geral, financeiro, ia-tokens, tempo, entregas, infra, histórico); tabela com paginação 10/pág
- [x] Clientes: CRUD funcional, tabela com ações
- [x] Financeiro: KPIs, AreaChart receita/custo com gradiente, donut categorias, tabela, dialogs
- [x] Relatórios: Tabela com filtros + CSV export
- [x] IA: KPIs, model cards com barra colorida + progress bars, gráfico tokens mensal, tabela de uso, score explainer
- [x] Tempo: KPIs, 2 gráficos barras (projeto/colaborador), tabela, dialog
- [x] Entregas: KPIs, timeline vertical CSS, tabela, dialog
- [x] Infraestrutura: KPIs (total/mês/MoM%/projetos), AreaChart 12 meses, tabela paginada 15/pág (costs.category=infra)
- [x] Admin/Usuários: KPI cards por role, lista com avatar/badge/data de entrada; guard server-side redirect não-admin
- [x] Tarefas: Kanban board com drag-drop, colunas, cards, comentários
- [x] Notificações: sino no header, lista com filtro lido/não-lido
- [x] Login/Criar conta/Esqueceu senha/Redefinir senha: todos funcionais

### Formulários
- [x] Validação Zod em todos os server actions
- [x] Campos required com indicador visual
- [x] Input type="number" com step correto
- [x] Input type="date" funcionando em todos os navegadores
- [x] Select de projetos/usuários carregando todas opções

### Gráficos (Recharts)
- [x] ResponsiveContainer com height fixo
- [x] Tooltip formatado (moeda pt-BR, tokens, horas)
- [x] Cores consistentes (indigo, emerald, rose, amber, sky)
- [x] Empty state quando sem dados

## Checklist de Auditoria de Código

### Segurança
- [x] RLS ativo em todas as tabelas (sem `USING true`)
- [x] Server actions validam role do usuário
- [x] Nunca `service_role` no frontend
- [x] Cookies HttpOnly, Secure, SameSite
- [x] Supabase URL e Anon Key como NEXT_PUBLIC (exposto é esperado)
- [x] Service role key NUNCA no client
- [x] org_id nunca vem do FormData (sempre do organization_members lookup)
- [x] Migration 009: gerente não pode alterar budget/client/org

### Performance
- [x] Server Components para fetch de dados (não client)
- [x] Promise.all para queries paralelas
- [x] useMemo em dados derivados (filtros, agregações)
- [x] createClient() dentro de useMemo no useUser (evita re-criação por render)
- [x] Tamanho de bundle (Turbopack, tree shaking)
- [x] Imagens otimizadas (lucide-react apenas ícones)

### Código
- [x] Tipos TypeScript consistentes (database.ts exports)
- [x] Server actions com validação Zod + tratamento de erro
- [x] Componentes separados por domínio (financeiro/, ia/, tempo/, kanban/, etc)
- [x] Sem duplicação de lógica (formatadores, Maps de lookup)
- [x] Nomes consistentes (português para UI, inglês para código)
- [x] Tratamento de null/undefined (?? [] em todos os fetches)
- [x] Roles centralizados em `lib/constants/roles.ts` (canWrite/canManage) — sem arrays inline espalhados
- [x] Sem `as any` — tipos locais específicos (ex: AiModelWithProvider)
- [x] signout route usa `request.url` como base (sem fallback localhost hardcoded)

### Banco de Dados
- [x] 11 migrations versionadas (001-011)
- [x] Índices em colunas de filtro (org_id, project_id, user_id, date)
- [x] Constraints CHECK em valores (hours > 0, cost >= 0)
- [x] Foreign keys com ON DELETE apropriado (cascade/set null/restrict)
- [x] Triggers de auditoria em todas as tabelas de negócio (15 tabelas)

### Auth
- [x] Email+senha funcional
- [x] Magic link funcional
- [x] Criar conta com senha 8+ dígitos
- [x] Força de senha visual
- [x] Olhinho mostrar/ocultar senha
- [x] Recuperação de senha via email
- [x] site_url configurado para produção (não localhost)
- [x] SMTP Resend configurado
- [x] Trigger handle_new_user para criar profile+org automaticamente

## Problemas Conhecidos

1. **Relatórios financeiros:** Select do shadcn/ui substituído por `<select>` nativo. Revisar se outros Selects têm o mesmo problema no @base-ui/react.
2. **Sem confirmação ao excluir:** botões de delete não pedem confirmação. *(pendente)*
3. ~~**Sem toast de sucesso:** após criar/editar, não há feedback visual de sucesso.~~ ✅ **Resolvido** — Sonner instalado, toast.success/error em todos os dialogs.
4. **Labels de usuário nos gráficos:** mostram UUID truncado em vez do nome.
5. **Projeto detail - overview:** só mostra texto da descrição, sem métricas visuais.
6. ~~**Mobile não testado:**~~ Parcialmente resolvido — sidebar mobile ok, projeto detail mobile tabs ok, loading skeletons responsivos.
7. **Sem testes automatizados:** sem Playwright, Jest ou testes E2E. *(pendente)*

## Melhorias Senior Dev — Implementadas (branch claude/tender-tesla-213f0c)

> Deploy em produção: https://softhouse.nanoai.com.br — TypeScript: 0 erros

### Parte 1 — Quick Wins
| Item | Arquivo | Detalhe |
|---|---|---|
| Signout URL segura | `auth/signout/route.ts` | `request.url` como base; sem fallback `localhost` |
| useMemo no useUser | `hooks/use-user.ts` | `createClient()` dentro de `useMemo([])` |
| Roles centralizados | `lib/constants/roles.ts` | `canWrite()` / `canManage()` — remove 9 arrays inline |
| loading.tsx | 9+ rotas | Skeletons page-aware por rota autenticada |
| error.tsx | 9+ rotas | `PageError` reutilizável + "Tentar novamente" |
| Sonner toast | 4 dialogs + AppShell | `toast.success/error` em projeto, cliente, entrega, hora |
| Type assertion | `ia-model-cards.tsx` | `AiModelWithProvider` local type — remove `as any` |
| Acentos | `projeto-detail-view.tsx`, `projeto-local-sidebar.tsx` | 9 acentos corrigidos |
| globals.css | `app/globals.css` | `--primary` corrigido: cinza → indigo-500 |
| Login | `(public)/login/page.tsx` | `router.push` + ARIA tabs |
| Badge | `components/ui/badge.tsx` | Variante `neutral` + default suavizado |
| EmptyState | `components/ui/empty-state.tsx` | Componente reutilizável |
| FinanceiroChart | `financeiro/financeiro-chart.tsx` | BarChart → AreaChart com gradiente |
| IAModelCards | `ia/ia-model-cards.tsx` | Barra colorida no topo + progress bars |
| Dashboard KPIs | `dashboard/dashboard-kpi-cards.tsx` | Icon containers coloridos |
| Sidebar mobile | `layout/sidebar.tsx` | Skeleton de loading |
| Header breadcrumbs | `layout/header.tsx` | UUID-safe + labels PT + avatar dropdown |

### Parte 2 — Command Palette
| Item | Arquivo |
|---|---|
| `CommandPalette` | `components/ui/command-palette.tsx` — Ctrl/Cmd+K, fuzzy search, navega entre rotas |

### Parte 3 — Paginação
| Tabela | Config |
|---|---|
| ProjetoTable | 10/pág com prev/next + contador |
| InfraCostTable | 15/pág |

### Parte 4 — Páginas faltantes
| Página | Implementação |
|---|---|
| `/app/admin/usuarios` | KPI cards por role + lista membros; guard server-side: não-admin → redirect dashboard |
| `/app/infraestrutura` | KPIs, AreaChart 12 meses, tabela paginada; lê `costs WHERE category='infra'` |

### Parte 5 — CI/CD
| Item | Detalhe |
|---|---|
| `.github/workflows/ci.yml` | 3 jobs: typecheck + lint + build; secrets via GitHub; dispara em push/PR |

---

## Pendente — Fase 8.3 Evolution API Outbound

### Migration 012
- [ ] Tabela `evolution_configs` (id, org_id, instance_url, api_key encrypted, webhook_secret, enabled)
- [ ] Tabela `evolution_message_logs` (id, org_id, config_id, to_phone, message, status enum, external_id)
- [ ] RLS: admin/socio leem config; admin/socio enviam msg
- [ ] Índices: org_id, config_id, status, created_at

### Server Actions
- [ ] `evolution.ts` — sendMessage(phone, message): lê config, chama Evolution API, loga
- [ ] `evolution.ts` — getInstanceStatus(): verifica conexão
- [ ] API key NUNCA exposta no frontend (apenas server-side)
- [ ] Rate limit: 10 msg/min por org

### Página
- [ ] `/app/configuracoes/evolution` — form instance_url + api_key (admin/socio only)
- [ ] Teste de envio na própria página

### Sidebar
- [ ] Item "Evolution API" no grupo Sistema (admin/socio)

---

## Pendente — Fase 8.4 Webhook Inbound

### Route Handler
- [ ] `src/app/api/webhooks/evolution/route.ts` — POST handler
- [ ] Validação HMAC com webhook_secret
- [ ] Deduplicação por message_id
- [ ] Persiste payload bruto em evolution_webhook_logs
- [ ] Responde 200 OK rápido (processamento async)

### Migration 013
- [ ] Tabela `evolution_webhook_logs` (id, org_id, config_id, event_type, from_phone, raw_payload jsonb, message_id unique, processed bool)
- [ ] Índices: message_id, org_id, created_at

### Processamento
- [ ] Normaliza mensagem (texto, mídia, contato)
- [ ] Vincula from_phone a profiles.phone
- [ ] Se vinculado, associa org_id
- [ ] Se não, marca para revisão manual
- [ ] Dispara evento para Fase 8.5

---

## Pendente — Fase 8.5 IA Project Manager

### Edge Function: `ia-project-manager`
- [ ] Deploy via Supabase Edge Functions
- [ ] Chamada após webhook processar mensagem
- [ ] Classifica intenção: status_update, new_task, question, noise
- [ ] Identifica projeto/tarefa por contexto
- [ ] Prompt engineering com contexto do projeto

### Ações (Nível 2 — Sugestão)
- [ ] Sugerir movimentação de card
- [ ] Criar comentário em tarefa
- [ ] Criar nova tarefa a partir de mensagem
- [ ] Registrar `task_ai_suggestions` com status pending

### Regras
- [ ] Confiança < 0.7: não sugere ação
- [ ] Ações com prazo/budget: sempre pending
- [ ] Nunca modifica dados sem task_ai_suggestions
- [ ] Toda ação gera log

### Página
- [ ] Aba "Sugestões IA" dentro de `/app/tarefas`
- [ ] Cards de sugestão com botões Aprovar/Rejeitar

---

## Pendente — Fase 8.6 IA Head da Softhouse

### Edge Function: `ia-head-softhouse`
- [ ] Agendada diariamente (Vercel Cron ou pg_cron)
- [ ] Gera resumo: projetos ativos, tarefas concluídas, horas, custos
- [ ] Detecta projetos em risco (sem update > 7d, atrasados, budget > 80%)
- [ ] Detecta tarefas atrasadas (due_date < hoje)
- [ ] Detecta entregas pendentes (próximas 48h)
- [ ] Detecta custos anormais (ia_cost > média * 1.5)
- [ ] Insere em notification_logs para admin/socio

### Página
- [ ] `/app/ia/resumo` — Dashboard com resumo do dia
- [ ] Cards: projetos ativos, tarefas concluídas, alertas
- [ ] Gráfico: tarefas concluídas vs pendentes
- [ ] Lista: projetos em risco

### Sidebar
- [ ] Item "Resumo IA" no grupo Operação ou dentro de IA (admin/socio)

---

## Pendente — Fase 8.7 IA Head Financeiro

### Edge Function: `ia-head-financeiro`
- [ ] Sob demanda ou agendada semanalmente
- [ ] Análise de margem por projeto (receita - custo)
- [ ] Fluxo de caixa previsto (30/60/90 dias)
- [ ] Vencimentos e despesas recorrentes
- [ ] Projetos deficitários (custo > receita)
- [ ] Custo de IA por projeto e por modelo
- [ ] Recomendações de controladoria

### Regras Reforçadas
- [ ] NUNCA alterar dados financeiros
- [ ] NUNCA aprovar orçamento
- [ ] NUNCA modificar permissões
- [ ] Apenas gerar task_ai_suggestions com recomendações
- [ ] Toda recomendação requer aprovação humana (admin/socio/financeiro)

### Página
- [ ] `/app/ia/financeiro` — Dashboard de recomendações financeiras
- [ ] Cards de recomendação com Aprovar/Rejeitar
- [ ] Gráfico: margem por projeto
- [ ] Gráfico: fluxo de caixa previsto

### Sidebar
- [ ] Item "IA Financeiro" dentro do grupo Financeiro (admin/socio/financeiro)

---

## Pendente — Pós-Fase 8

### Testes
- [ ] Playwright E2E: login, criar projeto, kanban drag-drop
- [ ] Testes RLS: cada role acessa apenas o permitido
- [ ] Testes de notificação: disparo e leitura

### UX/UI
- [x] Toast de sucesso após criar/editar/excluir (Sonner)
- [x] loading.tsx com skeleton page-aware em todas as 9+ rotas autenticadas
- [x] error.tsx com PageError + botão "Tentar novamente" em todas as rotas
- [x] Command palette ⌘K — navega entre todas as páginas (Ctrl/Cmd+K)
- [x] Paginação nas tabelas (ProjetoTable 10/pág, InfraCostTable 15/pág)
- [ ] Confirmação antes de excluir
- [ ] Indicador de página ativa na sidebar
- [ ] Responsividade mobile completa
- [ ] Acessibilidade: contraste, labels, aria

### Infra
- [x] CI/CD GitHub Actions — typecheck + lint + build em 3 jobs (`.github/workflows/ci.yml`)
  - Secrets necessários no GitHub: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Monitoramento de erros (Sentry ou similar)
- [ ] Backup automático do Supabase
