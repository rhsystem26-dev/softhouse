import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, Percent, TrendingUp, PiggyBank } from "lucide-react";
import type { Revenue, Cost } from "@/types/database";

export function FinanceiroKPICards({ revenues, costs }: { revenues: Revenue[]; costs: Cost[] }) {
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalCost = costs.reduce((sum, c) => sum + c.amount, 0);
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const cards = [
    {
      label: "Receita Total",
      value: fmtCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Custo Total",
      value: fmtCurrency(totalCost),
      icon: TrendingDown,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      label: "Lucro",
      value: fmtCurrency(profit),
      icon: TrendingUp,
      color: profit >= 0 ? "text-emerald-400" : "text-rose-400",
      bg: profit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
    },
    {
      label: "Margem",
      value: `${margin.toFixed(1)}%`,
      icon: Percent,
      color: margin >= 20 ? "text-emerald-400" : margin >= 0 ? "text-amber-400" : "text-rose-400",
      bg: margin >= 20 ? "bg-emerald-500/10" : margin >= 0 ? "bg-amber-500/10" : "bg-rose-500/10",
    },
    {
      label: "Previsão (projetos)",
      value: "—",
      sub: "Disponível com budget vs realizado",
      icon: PiggyBank,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center`}>
                <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              {c.value}
            </p>
            {c.sub && <p className="text-xs text-slate-500 mt-1">{c.sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
