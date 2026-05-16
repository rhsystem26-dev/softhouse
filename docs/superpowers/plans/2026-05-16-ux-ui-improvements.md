# UX/UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar todas as melhorias de UX/UI identificadas na auditoria — bugs críticos, polimento visual premium, consistência de design system e acessibilidade.

**Architecture:** Edições focadas em componentes existentes, sem novas rotas ou tabelas de banco. Um novo componente compartilhado (`EmptyState`) será criado. Todas as mudanças são UI-only, exceto a melhoria do breadcrumb que lê o pathname.

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS v4, shadcn/ui, Recharts, Lucide React, JetBrains Mono (font-mono)

---

## Mapa de Arquivos

| Arquivo | Ação | Tarefa |
|---------|------|--------|
| `src/app/globals.css` | Modificar `--primary` para indigo | Task 1 |
| `src/app/(public)/login/page.tsx` | `window.location.href` → `router.push`, aria | Task 2 |
| `src/components/projetos/projeto-detail-view.tsx` | Corrigir acentos (7 strings) | Task 3 |
| `src/components/projetos/projeto-local-sidebar.tsx` | Corrigir acento + mobile tabs | Task 3, 10 |
| `src/components/entregas/entregas-timeline.tsx` | Backlog badge → `"default"` (slate) | Task 4 |
| `src/components/layout/header.tsx` | Adicionar lado direito + breadcrumb UUID-safe | Task 5, 6 |
| `src/components/layout/sidebar.tsx` | Skeleton de loading na MobileSidebar | Task 7 |
| `src/components/dashboard/dashboard-kpi-cards.tsx` | Ícone com container colorido | Task 8 |
| `src/components/financeiro/financeiro-chart.tsx` | BarChart → AreaChart com gradiente | Task 9 |
| `src/components/ia/ia-model-cards.tsx` | Barra colorida no topo + progress bars | Task 10 |
| `src/components/ui/empty-state.tsx` | **Criar** componente reutilizável | Task 11 |
| `src/components/ia/ia-model-cards.tsx` | Usar EmptyState | Task 11 |
| `src/components/dashboard/dashboard-project-cards.tsx` | Usar EmptyState | Task 11 |

---

## Task 1: Fix `--primary` no globals.css

**Problema:** `--primary: oklch(0.922 0 0)` é cinza claro. Componentes shadcn que usam `bg-primary` ficam cinza em vez de indigo-500.

**Arquivo:**
- Modificar: `src/app/globals.css`

- [ ] **Step 1: Atualizar tokens de cor primary**

Em `src/app/globals.css`, substituir nas duas seções (`:root` e `.dark`):

```css
/* Antes — em :root E em .dark */
--primary: oklch(0.922 0 0);
--primary-foreground: oklch(0.205 0 0);

/* Depois — indigo-500 em oklch */
--primary: oklch(0.585 0.233 277.1);
--primary-foreground: oklch(0.985 0 0);
```

Também adicionar tokens semânticos de gráficos no `:root` e `.dark`:

```css
--chart-1: oklch(0.697 0.192 149.6);   /* emerald-500 */
--chart-2: oklch(0.607 0.101 264.5);   /* slate-500 */
--chart-3: oklch(0.585 0.233 277.1);   /* indigo-500 */
--chart-4: oklch(0.748 0.183 86.0);    /* amber-500 */
--chart-5: oklch(0.637 0.247 15.0);    /* rose-500 */
```

- [ ] **Step 2: Verificar visualmente**

Abrir `/app/dashboard` — botões com `variant="default"` devem ser indigo, não cinza.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: set --primary to indigo-500 and add semantic chart color tokens"
```

---

## Task 2: Fix login — `router.push` + acessibilidade do toggle

**Arquivos:**
- Modificar: `src/app/(public)/login/page.tsx`

- [ ] **Step 1: Adicionar `useRouter` e corrigir redirect**

```tsx
// No topo do arquivo, já há import de hooks — adicionar useRouter
import { useRouter } from "next/navigation";

// Dentro de LoginPage():
const router = useRouter();

// Substituir em handlePasswordLogin:
// Antes:
window.location.href = "/app/dashboard";
// Depois:
router.push("/app/dashboard");
```

- [ ] **Step 2: Adicionar ARIA no toggle senha/magic-link**

Substituir o `div` container do toggle e os dois `button`s:

```tsx
{/* Antes */}
<div className="flex rounded-lg bg-slate-800 p-1">
  <button type="button" onClick={() => { setMode("password"); setError(null); }} ...>
  <button type="button" onClick={() => { setMode("magic"); setError(null); }} ...>
</div>

{/* Depois */}
<div role="tablist" aria-label="Método de login" className="flex rounded-lg bg-slate-800 p-1">
  <button
    type="button"
    role="tab"
    aria-selected={mode === "password"}
    onClick={() => { setMode("password"); setError(null); }}
    className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
      mode === "password" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-300"
    }`}
  >
    <Lock className="w-3.5 h-3.5 inline mr-1.5" />
    Senha
  </button>
  <button
    type="button"
    role="tab"
    aria-selected={mode === "magic"}
    onClick={() => { setMode("magic"); setError(null); }}
    className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
      mode === "magic" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-300"
    }`}
  >
    <Zap className="w-3.5 h-3.5 inline mr-1.5" />
    Link mágico
  </button>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/login/page.tsx
git commit -m "fix: use router.push for login redirect and add ARIA tab roles"
```

---

## Task 3: Corrigir acentos em projeto-detail-view e projeto-local-sidebar

**Arquivos:**
- Modificar: `src/components/projetos/projeto-detail-view.tsx`
- Modificar: `src/components/projetos/projeto-local-sidebar.tsx`

- [ ] **Step 1: Corrigir strings em `projeto-detail-view.tsx`**

Substituições exatas:

```tsx
// Linha ~36 — section label
{ id: "overview", label: "Visão Geral", icon: Building2 },
// Linha ~41 — section label
{ id: "historico", label: "Histórico", icon: FileText },

// Linha ~108 — card label
<p className="text-xs text-slate-400">Orçamento</p>

// Linha ~151 — card title
<CardTitle className="text-base text-slate-200">Visão Geral</CardTitle>

// Linha ~154 — empty description
<p className="text-slate-600 italic">Nenhuma descrição fornecida.</p>

// Linha ~169 — empty state tempo
<p className="text-slate-500 text-center py-8">Nenhuma hora lançada neste projeto.</p>

// Linha ~228 — placeholder "fase futura"
<h3 className="text-lg font-medium text-slate-300 mb-2">Disponível em fase futura</h3>
<p className="text-sm text-slate-500 max-w-md">
  Esta seção estará disponível nas próximas fases do sistema.
</p>

// Linha ~100 — status label
const statusLabels: Record<string, string> = {
  active: "Ativo",
  completed: "Concluído",
  on_hold: "Pausado",
  cancelled: "Cancelado",
};
```

- [ ] **Step 2: Corrigir string em `projeto-local-sidebar.tsx`**

```tsx
// Linha ~26 — label da seção de navegação
<p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
  Navegação
</p>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/projetos/projeto-detail-view.tsx src/components/projetos/projeto-local-sidebar.tsx
git commit -m "fix: restore missing Portuguese diacritics in project detail view"
```

---

## Task 4: Corrigir badge "Backlog" na timeline de entregas

**Arquivo:**
- Modificar: `src/components/entregas/entregas-timeline.tsx`

- [ ] **Step 1: Alterar variant do backlog**

O status `backlog` usa `"info"` (indigo/azul) mas deveria ser neutro/slate (sem urgência).

```tsx
// Antes
const statusVariants: Record<string, "info" | "warning" | "success" | "danger"> = {
  backlog: "info", in_progress: "warning", review: "warning", done: "success", blocked: "danger",
};

// Depois — backlog é "default" (slate neutro)
const statusVariants: Record<string, "default" | "info" | "warning" | "success" | "danger"> = {
  backlog: "default", in_progress: "warning", review: "info", done: "success", blocked: "danger",
};
```

- [ ] **Step 2: Corrigir posição do dot na timeline**

```tsx
// Antes — magic number frágil
<div className={`absolute -left-[25px] w-3 h-3 rounded-full border-2 border-slate-800 ${...}`} />

// Depois — usar classe segura com border-slate-950 (combina com bg do card)
<div className={`absolute -left-[0.45rem] top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${...}`} />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/entregas/entregas-timeline.tsx
git commit -m "fix: backlog badge uses neutral slate color, fix timeline dot position"
```

---

## Task 5: Header — adicionar breadcrumbs UUID-safe

**Arquivo:**
- Modificar: `src/components/layout/header.tsx`

**Problema:** Rota `/app/projetos/abc123-uuid-aqui` exibe "Projetos / Abc123-uuid-aqui" no breadcrumb.

- [ ] **Step 1: Adicionar helper de detecção de UUID e formatação de segmento**

```tsx
// Adicionar antes da função Header()
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  projetos: "Projetos",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  ia: "IAs & Tokens",
  tempo: "Tempo",
  entregas: "Entregas",
  infraestrutura: "Infraestrutura",
  clientes: "Clientes",
  admin: "Admin",
  usuarios: "Usuários",
  "criar-conta": "Criar Conta",
  "esqueceu-senha": "Esqueceu a Senha",
  "redefinir-senha": "Redefinir Senha",
};

function formatSegment(s: string): string {
  if (UUID_RE.test(s)) return "Detalhe";
  return segmentLabels[s.toLowerCase()] ?? s.charAt(0).toUpperCase() + s.slice(1);
}
```

- [ ] **Step 2: Usar `formatSegment` no lugar da transformação inline**

```tsx
// Antes
.map((s) => s.charAt(0).toUpperCase() + s.slice(1));

// Depois
.map((s) => formatSegment(s));
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "fix: breadcrumbs hide raw UUIDs and use Portuguese segment labels"
```

---

## Task 6: Header — adicionar lado direito com busca e avatar

**Arquivo:**
- Modificar: `src/components/layout/header.tsx`

O lado direito do header está vazio. Adicionar: botão de busca (placeholder para futura command palette) e avatar compacto com link ao perfil/logout.

- [ ] **Step 1: Adicionar imports**

```tsx
import { Search, LogOut } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
```

- [ ] **Step 2: Transformar Header em Client Component e adicionar lógica**

Adicionar `"use client";` no topo. Adicionar hook e handlers:

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
// ... outros imports

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useUser();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((s) => formatSegment(s));

  const initials = appUser?.profile?.full_name
    ? appUser.profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : appUser?.user?.email?.slice(0, 2).toUpperCase() ?? "?";

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="h-14 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          {segments.length === 0 ? (
            <span className="text-slate-200 font-medium">Dashboard</span>
          ) : (
            segments.map((segment, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-600">/</span>}
                <span className={i === segments.length - 1 ? "text-slate-200 font-medium" : "text-slate-500"}>
                  {segment}
                </span>
              </span>
            ))
          )}
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden sm:flex items-center gap-2"
          title="Buscar (em breve)"
          disabled
        >
          <Search className="w-4 h-4" />
          <kbd className="hidden lg:inline text-xs text-slate-600 bg-slate-800/80 px-1.5 py-0.5 rounded font-mono border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {appUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-800/60 transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-slate-900 border-slate-800">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {appUser.profile?.full_name ?? appUser.user.email}
                </p>
                <p className="text-xs text-slate-500 truncate">{appUser.user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Verificar imports de DropdownMenu estão no projeto**

```bash
ls src/components/ui/dropdown-menu.tsx
```

Se não existir: `npx shadcn@latest add dropdown-menu`

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat: add search button and user avatar menu to header"
```

---

## Task 7: Sidebar mobile — skeleton de loading

**Arquivo:**
- Modificar: `src/components/layout/sidebar.tsx`

A `MobileSidebar` não tem skeleton quando `loading === true`, deixando o conteúdo vazio.

- [ ] **Step 1: Adicionar skeleton na MobileSidebar**

```tsx
export function MobileSidebar() {
  const { appUser, loading } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <button className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-slate-950 border-r border-slate-800/60">
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-800/60 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Command className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-100">Softhouse</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="space-y-4 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16 bg-slate-800" />
                    <Skeleton className="h-8 w-full bg-slate-800" />
                    <Skeleton className="h-8 w-full bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : (
              sidebarItems.map((group) => (
                <SidebarGroup
                  key={group.label}
                  label={group.label}
                  items={group.items}
                  userRole={appUser?.role ?? null}
                />
              ))
            )}
          </nav>
          {loading ? (
            <div className="border-t border-slate-800/60 p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24 bg-slate-800" />
                  <Skeleton className="h-2 w-16 bg-slate-800" />
                </div>
              </div>
            </div>
          ) : appUser ? (
            <SidebarUserFooter
              fullName={appUser.profile?.full_name ?? appUser.user.email ?? ""}
              email={appUser.user.email ?? ""}
              role={appUser.role}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "fix: add loading skeleton to mobile sidebar"
```

---

## Task 8: Dashboard KPI cards — icon container padronizado

**Arquivo:**
- Modificar: `src/components/dashboard/dashboard-kpi-cards.tsx`

Adicionar `bg` ao tipo de card e container colorido no ícone, alinhando com `FinanceiroKPICards`.

- [ ] **Step 1: Atualizar cards array e JSX**

```tsx
const cards = [
  {
    label: "Orçamento Ativo",
    value: metrics ? fmtCurrency(metrics.total_budget_active) : "—",
    sub: "Total em projetos ativos",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Projetos Ativos",
    value: metrics?.projects_active ?? "—",
    sub: `${metrics?.projects_completed ?? 0} concluídos`,
    icon: FolderKanban,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    label: "Membros",
    value: metrics?.org_members ?? "—",
    sub: "Na organização",
    icon: Users,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    label: "Total Projetos",
    value: metrics?.projects_total ?? "—",
    sub: `${metrics?.projects_on_hold ?? 0} pausados`,
    icon: CheckCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

// No JSX, substituir a linha do ícone:
// Antes:
<c.icon className={`w-4 h-4 ${c.color}`} />
{c.label}

// Depois:
<div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center`}>
  <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
</div>
{c.label}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/dashboard-kpi-cards.tsx
git commit -m "feat: add colored icon containers to dashboard KPI cards"
```

---

## Task 9: FinanceiroChart — converter para AreaChart com gradiente

**Arquivo:**
- Modificar: `src/components/financeiro/financeiro-chart.tsx`

Converter de `BarChart` para `AreaChart`. Custo muda de `rose-500` para `slate-500` (neutro, não alarmante).

- [ ] **Step 1: Substituir imports Recharts**

```tsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
```

- [ ] **Step 2: Substituir JSX do gráfico**

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
    <defs>
      <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="gradCusto" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#64748b" stopOpacity={0.10} />
        <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
    <XAxis
      dataKey="month"
      tick={{ fill: "#94a3b8", fontSize: 12 }}
      axisLine={{ stroke: "#1e293b" }}
      tickLine={false}
    />
    <YAxis
      tick={{ fill: "#94a3b8", fontSize: 12 }}
      axisLine={{ stroke: "#1e293b" }}
      tickLine={false}
      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
    />
    <Tooltip
      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "13px" }}
      labelStyle={{ color: "#e2e8f0" }}
      formatter={(value) => [fmtCurrency(Number(value) || 0), ""]}
    />
    <Legend wrapperStyle={{ fontSize: "12px" }} />
    <Area
      dataKey="receita"
      name="Receita"
      stroke="#10b981"
      fill="url(#gradReceita)"
      strokeWidth={2}
    />
    <Area
      dataKey="custo"
      name="Custo"
      stroke="#64748b"
      fill="url(#gradCusto)"
      strokeWidth={2}
      strokeDasharray="4 4"
    />
  </AreaChart>
</ResponsiveContainer>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/financeiro/financeiro-chart.tsx
git commit -m "feat: convert financeiro chart from BarChart to AreaChart with gradient fills"
```

---

## Task 10: IAModelCards — barra colorida no topo e progress bars

**Arquivo:**
- Modificar: `src/components/ia/ia-model-cards.tsx`

Adicionar: barra de cor no topo do card por provedor/modelo, progress bars para score e taxa de aproveitamento.

- [ ] **Step 1: Adicionar mapa de cores por modelo**

```tsx
const MODEL_COLORS: Record<string, string> = {
  "GPT-4o": "#10b981",
  "GPT-4": "#10b981",
  "GPT-3.5": "#34d399",
  "Claude Opus": "#6366f1",
  "Claude Sonnet": "#0ea5e9",
  "Claude Haiku": "#818cf8",
  "Gemini Pro": "#f59e0b",
  "Gemini Flash": "#fbbf24",
};

function getModelColor(name: string): string {
  for (const [key, color] of Object.entries(MODEL_COLORS)) {
    if (name.includes(key)) return color;
  }
  return "#475569"; // slate-600 fallback
}
```

- [ ] **Step 2: Atualizar JSX do card**

Substituir o `<Card>` existente por:

```tsx
<Card key={s.modelId} className="bg-slate-900 border-slate-800/60 overflow-hidden">
  {/* Barra colorida no topo por modelo */}
  <div className="h-0.5" style={{ backgroundColor: getModelColor(s.modelName) }} />
  <CardHeader className="pb-2 pt-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium text-slate-200">{s.modelName}</CardTitle>
      <Badge variant="outline" className="text-xs">{s.providerName}</Badge>
    </div>
    <p className="text-xs text-slate-500">{s.entries} uso{s.entries !== 1 ? "s" : ""}</p>
  </CardHeader>
  <CardContent className="space-y-3 pb-4">
    {/* Métricas em grid */}
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div>
        <p className="text-slate-500 mb-0.5">Tokens In</p>
        <p className="font-mono text-slate-200">{fmtTokens(s.totalTokensIn)}</p>
      </div>
      <div>
        <p className="text-slate-500 mb-0.5">Tokens Out</p>
        <p className="font-mono text-slate-200">{fmtTokens(s.totalTokensOut)}</p>
      </div>
      <div>
        <p className="text-slate-500 mb-0.5">Custo total</p>
        <p className="font-mono text-slate-200">{fmtCurrency(s.totalCost)}</p>
      </div>
      <div>
        <p className="text-slate-500 mb-0.5">Custo médio</p>
        <p className="font-mono text-slate-200">
          {s.entries > 0 ? fmtCurrency(s.totalCost / s.entries) : "—"}
        </p>
      </div>
    </div>

    {/* Progress bar: Score de qualidade */}
    {s.avgQuality != null && (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Score de qualidade</span>
          <span className="font-mono text-amber-400">{s.avgQuality.toFixed(1)}/5</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${(s.avgQuality / 5) * 100}%` }}
          />
        </div>
      </div>
    )}

    {/* Progress bar: Taxa de aproveitamento */}
    {s.acceptanceRate != null && (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Aproveitamento</span>
          <span className={`font-mono ${
            s.acceptanceRate >= 0.7 ? "text-emerald-400" :
            s.acceptanceRate >= 0.4 ? "text-amber-400" : "text-rose-400"
          }`}>
            {Math.round(s.acceptanceRate * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              s.acceptanceRate >= 0.7 ? "bg-emerald-500" :
              s.acceptanceRate >= 0.4 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${s.acceptanceRate * 100}%` }}
          />
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ia/ia-model-cards.tsx
git commit -m "feat: add color accent bar and progress bars to IA model cards"
```

---

## Task 11: EmptyState component e aplicação nos componentes

**Arquivos:**
- Criar: `src/components/ui/empty-state.tsx`
- Modificar: `src/components/ia/ia-model-cards.tsx`
- Modificar: `src/components/dashboard/dashboard-project-cards.tsx`

- [ ] **Step 1: Criar `empty-state.tsx`**

```tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center px-4", className)}>
      <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <h3 className="text-sm font-medium text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Usar EmptyState em `ia-model-cards.tsx`**

Substituir o estado vazio:

```tsx
import { EmptyState } from "@/components/ui/empty-state";

// Substituir bloco de empty state
if (stats.length === 0) {
  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardContent className="p-0">
        <EmptyState
          icon={Cpu}
          title="Nenhum modelo cadastrado"
          description="Registre uso de IAs para visualizar métricas de performance por modelo."
        />
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Usar EmptyState em `dashboard-project-cards.tsx`**

```tsx
import { EmptyState } from "@/components/ui/empty-state";

// Substituir bloco:
{projects.length === 0 ? (
  <EmptyState
    icon={FolderKanban}
    title="Nenhum projeto ativo"
    description="Crie um projeto para começar a acompanhar métricas."
    className="py-6"
  />
) : (
  // ... lista existente
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/empty-state.tsx src/components/ia/ia-model-cards.tsx src/components/dashboard/dashboard-project-cards.tsx
git commit -m "feat: add reusable EmptyState component and apply to IA and dashboard"
```

---

## Task 12: ProjetoDetailView — mobile tabs e melhorias de layout

**Arquivos:**
- Modificar: `src/components/projetos/projeto-local-sidebar.tsx`
- Modificar: `src/components/projetos/projeto-detail-view.tsx`

Em mobile, a sidebar local fica oculta (`hidden lg:block`). Adicionar tabs scrolláveis horizontalmente para mobile.

- [ ] **Step 1: Atualizar `projeto-local-sidebar.tsx` com tabs para mobile**

```tsx
"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface DetailSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function ProjetoLocalSidebar({
  sections,
  activeSection,
  onSectionChange,
}: {
  sections: DetailSection[];
  activeSection: string;
  onSectionChange: (id: string) => void;
}) {
  return (
    <>
      {/* Desktop: sidebar fixa à esquerda */}
      <aside className="w-56 shrink-0 border-r border-slate-800/60 bg-slate-950/50 hidden lg:block">
        <div className="p-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
            Navegação
          </p>
          <nav className="space-y-0.5">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-md transition-colors text-left",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile: tabs scroll horizontal */}
      <div className="lg:hidden border-b border-slate-800/60 bg-slate-950/50 overflow-x-auto">
        <div className="flex min-w-max px-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors",
                  isActive
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Ajustar layout do `ProjetoDetailView` para mobile**

```tsx
// Antes — flex row fixo que quebra em mobile
<div className="flex gap-0 -m-6 lg:-m-8 min-h-[calc(100vh-3.5rem)]">
  <ProjetoLocalSidebar ... />
  <div className="flex-1 p-6 lg:p-8 overflow-y-auto">

// Depois — flex col em mobile, row em desktop
<div className="flex flex-col lg:flex-row gap-0 -m-6 lg:-m-8 min-h-[calc(100vh-3.5rem)]">
  <ProjetoLocalSidebar ... />
  <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
```

- [ ] **Step 3: Commit**

```bash
git add src/components/projetos/projeto-local-sidebar.tsx src/components/projetos/projeto-detail-view.tsx
git commit -m "feat: add horizontal scroll tabs for mobile project detail view"
```

---

## Task 13: Badge — adicionar variant "neutral" para pendente/backlog

**Arquivo:**
- Modificar: `src/components/ui/badge.tsx`

O badge atual não tem variante para "pendente/backlog" que seja neutra mas visualmente distinta de "default". Adicionar `"neutral"` como alias mais explícito.

> Nota: Este task é opcional — a Task 4 já corrige para `"default"` que usa `bg-slate-800 text-slate-200`, que é adequado. Pule se o resultado visual da Task 4 for suficiente.

- [ ] **Step 1: Adicionar variante (opcional)**

```tsx
const variants = {
  default:  "bg-slate-800/60 text-slate-300",   // ligeiramente mais sutil
  neutral:  "bg-slate-800 text-slate-400",       // alias explícito para backlog/pendente
  success:  "bg-emerald-500/10 text-emerald-400",
  warning:  "bg-amber-500/10 text-amber-400",
  danger:   "bg-rose-500/10 text-rose-400",
  info:     "bg-indigo-500/10 text-indigo-400",  // manter para "Concluído" que usa info
  outline:  "border border-slate-700 text-slate-400",
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "refine: soften default badge and add neutral variant for backlog status"
```

---

## Self-Review — Cobertura do Spec

| Melhoria da Auditoria | Task | Status |
|----------------------|------|--------|
| 1. Acentos faltando em detail-view | Task 3 | ✅ |
| 2. `window.location.href` → `router.push` | Task 2 | ✅ |
| 3. Header direito vazio | Task 6 | ✅ |
| 4. Gráfico dashboard errado (tipo/dados) | — | ⚠️ Parcial* |
| 5. `globals.css --primary` cinza | Task 1 | ✅ |
| 6. KPI cards sem delta/trend | — | ⚠️ Adiado** |
| 7. FinanceiroChart: AreaChart + cor custo | Task 9 | ✅ |
| 8. IAModelCards sem cor topo e progress bars | Task 10 | ✅ |
| 9. Mobile sidebar sem skeleton | Task 7 | ✅ |
| 10. Breadcrumbs UUID bruto | Task 5 | ✅ |
| 11. ProjetoCard sem métricas margem/tokens | — | ⚠️ Adiado*** |
| 12. KPI icon container inconsistente | Task 8 | ✅ |
| 13. Backlog badge cor errada | Task 4 | ✅ |
| 14. Empty states sem estrutura | Task 11 | ✅ |
| 15. Login toggle sem acessibilidade | Task 2 | ✅ |
| 16. ProjectDetailView sidebar sem mobile | Task 12 | ✅ |

**Notas:**
- ⚠️ *Item 4 (gráfico dashboard): O dashboard chart mostra "Orçamento por Projeto" porque as tabelas `revenues`/`costs` ainda não têm dados (Fase 4 não iniciada). O gráfico correto (receita vs custo mensal) virá quando o módulo financeiro for populado. Por ora, o gráfico de orçamento é o dado real disponível — não há como melhorá-lo sem dados.
- ⚠️ **Item 6 (delta/trend): Requer mudança na RPC `get_dashboard_metrics` para retornar comparativo mensal. Adiado para quando a fase de dados financeiros estiver completa.
- ⚠️ ***Item 11 (ProjetoCard com métricas): Requer joins com `revenues`, `costs`, `ai_usage` na query da página de projetos. Adiado para Fase 4+.
