---
name: premium-tech-design-system
description: Design system premium para painel interno de gestão da softhouse. Define paleta, tipografia, espaçamento, sidebar, header, cards, tabelas, badges, estados e checklist de revisão visual.
metadata:
  type: design-system
  stack: Tailwind + shadcn/ui + Lucide React
  tone: Premium Tech Operating System
---

# Premium Tech Operating System — Design System

Design system para painel interno da softhouse. Tom: confiança, controle, inteligência, clareza, sofisticação.

## Paleta — Dark Mode Primário (com light mode suportado)

```
Background base:      slate-950 (#020617) — profundo, quase preto
Background elevado:   slate-900 (#0f172a) — cards, sidebar
Background hover:     slate-800 (#1e293b) — rows, items
Borda sutil:          slate-800/60     — dividers, card borders
Borda ativa:          slate-700        — inputs, foco

Texto primário:       slate-100 (#f1f5f9)
Texto secundário:     slate-400 (#94a3b8)
Texto terciário:      slate-500 (#64748b)

Acento primário:      indigo-500 (#6366f1) — botões, links, seleção
Acento secundário:    sky-500   (#0ea5e9) — gráficos, badges info
Acento financeiro:    emerald-500 (#10b981) — receita, lucro, margem positiva
Acento alerta:        amber-500  (#f59e0b) — warnings, prazos
Acento crítico:       rose-500   (#f43f5e) — erros, margem negativa, atrasos
```

## Tipografia

```
Font: Inter (Google Fonts) — padrão shadcn/ui
Display (números): JetBrains Mono — KPIs financeiros, tokens, métricas
Escala Tailwind padrão: text-xs a text-4xl
Peso: normal (400), medium (500), semibold (600), bold (700)
```

## Espaçamento

```
Page padding:      p-6 lg:p-8
Card gap:          gap-4 lg:gap-6
Section gap:       gap-6 lg:gap-8
Sidebar width:     w-64 (desktop), overlay (mobile)
Header height:     h-14
```

## Sidebar

```tsx
// Estrutura
<aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/60">
  {/* Logo + nome da softhouse */}
  <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-800/60">
    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
      <Command className="w-4 h-4 text-indigo-400" />
    </div>
    <span className="font-semibold text-slate-100">Softhouse</span>
  </div>

  {/* Navegação por seções */}
  <nav className="flex-1 overflow-y-auto p-3">
    {/* Grupos com label */}
    <SidebarGroup label="Principal" items={[...]} />
    <SidebarGroup label="Projetos" items={[...]} />
    <SidebarGroup label="Financeiro" items={[...]} />
    <SidebarGroup label="Operação" items={[...]} />
    <SidebarGroup label="Sistema" items={[...]} />
  </nav>

  {/* Footer: usuário + role */}
  <SidebarUser />
</aside>
```

**Item ativo**: bg-indigo-500/10 + text-indigo-400 + border-l-2 border-indigo-500
**Item hover**: bg-slate-800/50 + text-slate-200
**Item idle**: text-slate-400 + hover acima

## Header

```tsx
<header className="h-14 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur flex items-center justify-between px-6">
  <div className="flex items-center gap-3">
    <MobileSidebarTrigger />
    <Breadcrumbs />
  </div>
  <div className="flex items-center gap-3">
    <CommandPalette />
    <Notifications />
    <UserMenu />
  </div>
</header>
```

## Cards

```tsx
// Card padrão
<Card className="bg-slate-900 border-slate-800/60">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-slate-400">Label</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold text-slate-100 font-mono">R$ 142.500</p>
  </CardContent>
</Card>

// Card de projeto (lista)
<Card className="bg-slate-900 border-slate-800/60 hover:border-slate-700/60 transition-colors cursor-pointer">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Nome do Projeto</CardTitle>
      <StatusBadge status="active" />
    </div>
    <CardDescription>Cliente · Prazo · Responsável</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-4 gap-4">
      <Metric label="Receita" value="R$ 45k" />
      <Metric label="Custo" value="R$ 12k" />
      <Metric label="Margem" value="73%" trend="up" />
      <Metric label="Tokens" value="2.4M" />
    </div>
  </CardContent>
</Card>
```

## Badges de Status

```
Ativo/Em dia:       bg-emerald-500/10 text-emerald-400 border-emerald-500/20
Atrasado:           bg-amber-500/10  text-amber-400  border-amber-500/20
Crítico/Atraso grave: bg-rose-500/10 text-rose-400  border-rose-500/20
Concluído:          bg-slate-500/20  text-slate-400  border-slate-500/20
Pausado:            bg-slate-500/20  text-slate-300  border-slate-500/20
```

## Tabelas (TanStack Table + shadcn/ui)

```
Cabeçalho: bg-slate-950 text-slate-400 text-xs font-medium uppercase tracking-wider
Linha: bg-slate-900 border-b border-slate-800/60
Linha hover: bg-slate-800/50
Linha selecionada: bg-indigo-500/5
Célula numérica: font-mono tabular-nums text-right
```

## Estados

### Loading
```
Cards: skeleton pulse (shadcn Skeleton) com mesma dimensão do conteúdo
Tabela: 5-8 rows skeleton com alturas variadas
Gráfico: skeleton retangular com shimmer
```

### Empty
```
Ícone sutil (Lucide, slate-600)
Título: "Nenhum projeto encontrado"
Descrição: ação sugerida
Botão CTA opcional
```

### Error
```
Card com borda rose-500/30 e bg rose-500/5
Ícone AlertTriangle
Mensagem do erro + botão "Tentar novamente"
```

### Sem Permissão
```
Ícone ShieldOff centralizado
"Acesso restrito"
"Você não tem permissão para acessar esta seção."
```

## Checklist de Revisão Visual

- [ ] Sidebar colapsa em mobile (Sheet/overlay)
- [ ] Header fixo com backdrop-blur
- [ ] Breadcrumbs visíveis em telas filhas
- [ ] Cards seguem grid responsivo (1 col mobile, 2 tablet, 3-4 desktop)
- [ ] Tabelas com scroll horizontal em mobile
- [ ] Badges consistentes em todas as páginas
- [ ] Números financeiros em font-mono
- [ ] Cores semânticas: verde=positivo, vermelho=negativo, âmbar=atenção
- [ ] Estados loading/empty/error em toda página com dados
- [ ] Ícones consistentes (Lucide, mesma família)
- [ ] Espaçamento uniforme (p-6 mobile, p-8 desktop)
- [ ] Contraste adequado (slate-100 sobre slate-900)
- [ ] Sem cores vibrantes, neon, gradientes chamativos
- [ ] Sem landing page
