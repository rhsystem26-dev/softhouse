---
name: responsive-polish-review
description: Revisão de responsividade, mobile-first e polimento visual para todos os breakpoints. Checklist de toque, scroll, overlay e adaptação de layout.
metadata:
  type: responsive-review
  breakpoints: mobile, tablet, desktop
---

# Responsive Polish Review

Checklist de revisão para garantir que toda página funcione bem em mobile, tablet e desktop.

## Breakpoints (Tailwind)

```
Mobile:     < 640px   (default)
Tablet:     ≥ 640px   (sm)
Desktop:    ≥ 1024px  (lg)
Wide:       ≥ 1280px  (xl)
```

## Checklist por Componente

### Sidebar
- [ ] Desktop (lg+): fixa à esquerda, w-64, sempre visível
- [ ] Tablet/Mobile (< lg): overlay via Sheet (shadcn/ui)
- [ ] Trigger (hamburger) visível no header em < lg
- [ ] Overlay fecha ao clicar fora ou selecionar item
- [ ] Item ativo destacado em todos os breakpoints

### Header
- [ ] Altura fixa (h-14) em todos os breakpoints
- [ ] Breadcrumbs visíveis em sm+, ocultos em mobile (só título)
- [ ] Botões de ação com espaço de toque ≥ 44px
- [ ] Menu de usuário acessível em todos os breakpoints

### Dashboard — KPIs
- [ ] Mobile: 1 coluna (stack)
- [ ] Tablet (sm): 2 colunas
- [ ] Desktop (lg): 4 colunas
- [ ] Card KPI mantém altura consistente
- [ ] Números grandes (text-2xl) legíveis em mobile

### Dashboard — Gráficos
- [ ] Gráfico principal: altura 300px (todos breakpoints)
- [ ] Side metrics: abaixo do gráfico em mobile, à direita em lg+
- [ ] Scroll horizontal NUNCA em gráfico (redimensiona)

### Dashboard — Cards de Projeto
- [ ] Mobile: 1 coluna
- [ ] Tablet (sm): 2 colunas
- [ ] Desktop (lg+): 3 colunas
- [ ] Card inteiro é clicável (não só título)
- [ ] Métricas internas: 2 colunas em mobile, 4 em desktop

### Tabelas
- [ ] Desktop: tabela completa com todas as colunas
- [ ] Tablet: colunas não-essenciais ocultas (prioridade)
- [ ] Mobile: cards empilhados ou tabela com scroll horizontal
- [ ] Scroll horizontal com indicador visual (sombra na borda)

### Página de Detalhe (Tabs)
- [ ] Tabs com scroll horizontal em mobile (sem quebrar)
- [ ] Conteúdo da tab adapta-se ao breakpoint
- [ ] Header do projeto:stack em mobile, inline em desktop

### Filtros
- [ ] Mobile: collapsible ou drawer
- [ ] Desktop: inline no topo da página
- [ ] Botão "Limpar filtros" sempre visível quando há filtro ativo
- [ ] Preservados na URL (search params)

### Modais / Dialogs
- [ ] Mobile: full-screen ou sheet (bottom sheet)
- [ ] Desktop: dialog centralizado (max-w-md ou max-w-lg)
- [ ] Fechar com swipe em mobile (quando sheet)
- [ ] Botão de fechar com alvo de toque ≥ 44px

### Formulários
- [ ] Labels acima do input em mobile (melhor legibilidade)
- [ ] Inputs com largura total em mobile
- [ ] Validação inline (não só no submit)
- [ ] Botão submit full-width em mobile

## Teste de Toque

- [ ] Todos elementos interativos ≥ 44px de altura/largura
- [ ] Espaçamento ≥ 8px entre elementos clicáveis
- [ ] Sem hover-dependency em mobile (ações visíveis sem hover)
- [ ] Tooltips: touch-and-hold em mobile, hover em desktop

## Teste Visual

- [ ] Sem overflow horizontal em nenhum breakpoint
- [ ] Texto não trunca inesperadamente
- [ ] Font-size mínimo 16px em inputs (previne zoom iOS)
- [ ] Contraste de cor mantido em todos os breakpoints
- [ ] Transições suaves (não instantâneas) ao redimensionar
- [ ] Sidebar overlay cobre viewport inteira em mobile

## Estados por Breakpoint

### Loading
- [ ] Skeleton com mesma dimensão do conteúdo real
- [ ] Skeleton adapta grid (1/2/3/4 colunas conforme breakpoint)

### Empty
- [ ] Ilustração centralizada com padding adequado
- [ ] Botão CTA full-width em mobile, inline em desktop

### Error
- [ ] Card de erro não estoura viewport em mobile
- [ ] Botão "Tentar novamente" com alvo de toque ≥ 44px

### Sem Permissão
- [ ] Mensagem centralizada vertical e horizontalmente
- [ ] Sem sidebar visível (não há navegação possível)
