---
name: data-viz-finance-ai
description: Visualização de dados financeiros, métricas de IA, consumo de tokens e tabelas analíticas usando Recharts + TanStack Table.
metadata:
  type: data-viz
  libraries: Recharts, TanStack Table, shadcn/ui
---

# Data Viz — Financeiro & IA

Visualização de dados para o painel da softhouse. Foco: métricas financeiras, performance de IA, consumo de tokens.

## Biblioteca: Recharts

Recharts é a biblioteca de gráficos. Usar componentes Recharts diretamente, wrappers apenas se necessário.

## Paleta de Gráficos

```
Receita:        emerald-500 (#10b981)
Custo:          slate-500  (#64748b)
Lucro/Margem:   indigo-500 (#6366f1)
GPT-4o:         emerald-500
Claude Opus:    indigo-500
Claude Sonnet:  sky-500
Gemini:         amber-500
Outro modelo:   slate-500

Positivo/Up:    emerald-500
Negativo/Down:  rose-500
Neutro:         slate-500
```

## Tipos de Gráfico por Contexto

### Receita vs Custo (linha do tempo)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={monthlyData}>
    <defs>
      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
    <YAxis stroke="#64748b" fontSize={12} />
    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
    <Area dataKey="revenue" stroke="#10b981" fill="url(#revenue)" strokeWidth={2} />
    <Area dataKey="cost" stroke="#64748b" fill="none" strokeWidth={2} strokeDasharray="4 4" />
  </AreaChart>
</ResponsiveContainer>
```

### Tokens por Modelo (barras empilhadas)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={tokenData}>
    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
    <YAxis stroke="#64748b" fontSize={12} />
    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
    <Bar dataKey="gpt4o" stackId="tokens" fill="#10b981" />
    <Bar dataKey="claudeOpus" stackId="tokens" fill="#6366f1" />
    <Bar dataKey="claudeSonnet" stackId="tokens" fill="#0ea5e9" />
    <Bar dataKey="gemini" stackId="tokens" fill="#f59e0b" />
  </BarChart>
</ResponsiveContainer>
```

### Breakdown de Custos (pizza/donut)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={costBreakdown} innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
      {costBreakdown.map((entry, i) => (
        <Cell key={i} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

### Performance por Projeto (barras horizontais)
```tsx
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={projectPerformance} layout="vertical">
    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
    <XAxis type="number" stroke="#64748b" fontSize={12} />
    <YAxis dataKey="project" type="category" stroke="#64748b" fontSize={12} width={120} />
    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
    <Bar dataKey="margin" fill="#6366f1" radius={[0, 4, 4, 0]} />
  </BarChart>
</ResponsiveContainer>
```

## Regras de Formatação

### Valores Financeiros
```
Receita/Custo:  R$ 142.500,00  (ou R$ 142,5k para cards)
Margem:         73.2%          (1 casa decimal)
Variação:       ↑ 12.3%        (seta + cor semântica + percentual)
```

### Tokens
```
Milhares:       2.4M tokens
Milhões:        12.4M tokens
Detalhado:      2.456.789       (tabelas, sem abreviação)
```

### Datas
```
Cards:          15 mai
Tabelas:        15/05/2026
Tooltips:       15 de maio de 2026
```

## TanStack Table — Configuração Padrão

```tsx
// Toda tabela analítica segue esta estrutura
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: { sorting, globalFilter, pagination },
  // ...
});

// Coluna numérica padrão
{
  accessorKey: "revenue",
  header: ({ column }) => (
    <Button variant="ghost" onClick={() => column.toggleSorting()}>
      Receita <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => (
    <span className="font-mono tabular-nums">
      {formatCurrency(row.getValue("revenue"))}
    </span>
  ),
}
```

## Anti-Padrões de Visualização

- Gráfico 3D (ilegível, impreciso)
- Mais de 5 cores em um gráfico
- Eixo Y não começar do zero (distorce proporção)
- Gráfico de pizza com mais de 5 fatias
- Tabela sem ordenação ou filtro
- Números sem formatação de milhar
- Datas em formato inconsistente
- Tooltip vazio ou sem unidade de medida
