---
name: skill-router
description: Roteia tarefas de design e implementação para a skill especialista correta. Usar quando a tarefa envolver layout, dashboard, sidebar, cards, gráficos, tabelas, mobile, UX/UI ou design system.
metadata:
  type: design-router
  triggers:
    - layout
    - dashboard
    - sidebar
    - cards
    - gráficos
    - charts
    - tabelas
    - mobile
    - responsivo
    - UX
    - UI
    - design system
    - paleta
    - tipografia
    - espaçamento
    - badges
    - loading
    - empty state
    - fluxo de navegação
---

# Skill Router — Design & UX da Softhouse

Roteador central que despacha tarefas visuais para a skill especialista correta.

## Regras de Roteamento

| Gatilho | Skill |
|---|---|
| Paleta, tipografia, espaçamento, badges, estados (loading/empty/error), sidebar, header | `premium-tech-design-system` |
| Dashboard, hierarquia de cards, layout de widgets, fluxo de navegação | `dashboard-ux-architect` |
| Gráficos financeiros, métricas de IA, visualização de tokens, tabelas analíticas | `data-viz-finance-ai` |
| Responsividade, mobile-first, revisão multi-breakpoint, toque vs clique | `responsive-polish-review` |

## Como Usar

1. Identificar o domínio visual da tarefa.
2. Invocar a skill correspondente via `Skill` tool.
3. Aplicar as diretrizes retornadas antes de gerar código ou mockup.
4. Se a tarefa tocar múltiplos domínios, invocar em sequência: design-system → dashboard → data-viz → responsive.

## Prioridade Visual

1. **Confiança** — o sistema deve parecer sólido, preciso, profissional.
2. **Controle** — o usuário deve sentir que domina os dados, não o contrário.
3. **Inteligência** — a interface deve sugerir tecnologia de ponta sem ser fria.
4. **Clareza** — informação densa mas legível; hierarquia visual impecável.
5. **Sofisticação** — refinamento nos detalhes, não no excesso.

## Anti-Padrões

- Landing page (proibido)
- Cores vibrantes genéricas
- Neon exagerado
- Estética cyberpunk
- Poluição visual
- Gradientes chamativos
- Sombras exageradas
- Animações desnecessárias
