---
name: dashboard-ux-architect
description: Arquitetura de dashboard, hierarquia de cards, layout de widgets e fluxo de navegação para o painel interno da softhouse.
metadata:
  type: ux-architect
  domain: dashboard
---

# Dashboard UX Architect

Define a arquitetura visual do dashboard e suas páginas-filhas: hierarquia de informação, disposição de cards, fluxo de navegação e responsividade estrutural.

## Dashboard Geral — `/app/dashboard`

### Objetivo
Visão 360° da softhouse em 5 segundos. O sócio bate o olho e sabe se está ganhando ou perdendo dinheiro.

### Hierarquia Visual (topo → base)

```
LINHA 1 — KPIs Financeiros (4 cards iguais, full-width)
┌────────────┬────────────┬────────────┬────────────┐
│ RECEITA MÊS│ CUSTO MÊS  │ MARGEM %   │ LUCRO MÊS  │
│ R$ 342.000 │ R$ 98.500  │ 71.2%      │ R$ 243.500 │
│ ↑ 12% vs   │ ↑ 8% vs    │ ↑ 3% vs    │ ↑ 14% vs   │
│ mês ant.   │ mês ant.   │ mês ant.   │ mês ant.   │
└────────────┴────────────┴────────────┴────────────┘

LINHA 2 — Gráfico principal + Side metrics (2 colunas)
┌──────────────────────────────┬──────────────────┐
│ RECEITA vs CUSTO (12 meses)  │ PROJETOS ATIVOS  │
│ gráfico de área/barra        │ 8 ativos         │
│                              │ 3 atrasados      │
│                              │ 5 no prazo       │
│                              ├──────────────────┤
│                              │ PRÓXIMAS ENTREGAS│
│                              │ Proj A — 15/mai  │
│                              │ Proj B — 18/mai  │
│                              │ Proj C — 22/mai  │
└──────────────────────────────┴──────────────────┘

LINHA 3 — Cards de projeto (grid de 3 colunas, scroll vertical)
┌────────────┬────────────┬────────────┐
│ PROJETO A  │ PROJETO B  │ PROJETO C  │
│ Cliente X  │ Cliente Y  │ Cliente Z  │
│ R$ 45k     │ R$ 32k     │ R$ 28k     │
│ Marg 73%   │ Marg 58%   │ Marg 82%   │
│ 2.4M tokens│ 890k tokens│ 1.2M tokens│
└────────────┴────────────┴────────────┘

LINHA 4 — Consumo de IA + Infra (2 colunas)
┌──────────────────────────────┬──────────────────┐
│ TOKENS POR MODELO (mês)      │ CUSTO INFRA (mês)│
│ gráfico de barras empilhadas │ barras horizontais│
└──────────────────────────────┴──────────────────┘
```

### Regras do Dashboard

1. KPIs no topo sempre — primeira coisa que o usuário vê.
2. Gráfico principal (receita vs custo) é o centro visual da página.
3. Side metrics à direita do gráfico — projetos ativos + próximas entregas.
4. Cards de projeto em grid — acesso rápido ao detalhe.
5. Linha final com visão operacional (tokens + infra).
6. Cada card é clicável e leva ao detalhe correspondente.

## Página de Projetos — `/app/projetos`

```
TOPO: Título + Filtros + Botão Novo Projeto
┌──────────────────────────────────────────────┐
│ Projetos    [🔍 Buscar] [Status ▼] [Ordenar ▼] [+ Novo] │
└──────────────────────────────────────────────┘

CORPO: Tabela de projetos (TanStack Table)
┌──────────────────────────────────────────────────────────────┐
│ Projeto     │ Cliente  │ Receita │ Custo  │ Margem │ Status  │
├─────────────┼──────────┼─────────┼────────┼────────┼─────────┤
│ Projeto A   │ Cliente X│ R$ 45k  │ R$ 12k │ 73% ▲  │ Ativo   │
│ Projeto B   │ Cliente Y│ R$ 32k  │ R$ 13k │ 58% ▼  │ Atrasado│
└──────────────────────────────────────────────────────────────┘

Alternativa mobile: Cards empilhados (não tabela)
```

## Detalhe do Projeto — `/app/projetos/[id]`

```
HEADER: Nome + Status + Ações (editar, arquivar)
├── TABS ──────────────────────────────────────
│ [Visão Geral] [Financeiro] [IAs] [Tempo] [Entregas] [Infra]
│
├── VISÃO GERAL (tab default)
│   LINHA 1: KPIs do projeto (receita, custo, margem, tokens, horas)
│   LINHA 2: Gráfico receita vs custo do projeto
│   LINHA 3: Timeline de entregas
│   LINHA 4: Membros do time
│
├── FINANCEIRO
│   Tabela de receitas + custos detalhados
│   Gráfico de evolução da margem
│
├── IAs
│   Cards por modelo (GPT-4o, Claude Opus, etc.)
│   Métricas: tokens, custo, latência, qualidade
│   Gráfico comparativo entre modelos
│
├── TEMPO
│   Tabela de lançamentos de horas
│   Gráfico de horas por membro
│
├── ENTREGAS
│   Lista/tabela de entregas com status e datas
│
├── INFRA
│   Tabela de recursos de infra
```

## Página de Performance das IAs — `/app/ia`

```
LINHA 1: KPIs de IA
┌────────────┬────────────┬────────────┬────────────┐
│ TOKENS MÊS │ CUSTO IA   │ MODELOS    │ PROJETOS   │
│ 12.4M      │ R$ 8.200   │ 5 ativos   │ usando IA  │
└────────────┴────────────┴────────────┴────────────┘

LINHA 2: Gráfico tokens por modelo (área empilhada, 12 meses)
LINHA 3: Tabela comparativa de modelos (custo/token, latência, uso)
LINHA 4: Performance por projeto (gráfico de barras horizontais)
```

## Página Financeiro — `/app/financeiro`

```
LINHA 1: KPIs (receita total, custo total, margem, lucro, previsão)
LINHA 2: Gráfico receita vs custo (área, 12 meses)
LINHA 3: Breakdown de custos (pizza/donut: IA, infra, pessoal, outros)
LINHA 4: Tabela financeira por projeto
LINHA 5: Projeção (forecast) próximos 3 meses
```

## Regras de Navegação

1. Breadcrumbs no header: Dashboard > Projetos > Nome do Projeto
2. Sidebar sempre visível em desktop (w-64), overlay em mobile
3. Tabs em páginas de detalhe — navegação horizontal sem sair da página
4. Filtros preservados na URL (search params)
5. Card de projeto no dashboard → clique leva a `/app/projetos/[id]`
6. Back button do browser sempre funciona (navegação nativa Next.js)
7. Mobile: sidebar vira Sheet (shadcn/ui) com overlay
