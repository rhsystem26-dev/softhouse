import { Card, CardContent } from "@/components/ui/card";
import { Server, TrendingUp, Calendar, FolderKanban } from "lucide-react";
import type { Cost } from "@/types/database";

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();
const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
}

function isLastMonth(dateStr: string) {
  const d = new Date(dateStr);
  return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export function InfraKPICards({ costs }: { costs: Cost[] }) {
  const totalInfra = costs.reduce((s, c) => s + c.amount, 0);
  const thisMonth = costs.filter((c) => isThisMonth(c.date)).reduce((s, c) => s + c.amount, 0);
  const lastMonth = costs.filter((c) => isLastMonth(c.date)).reduce((s, c) => s + c.amount, 0);
  const projects = new Set(costs.map((c) => c.project_id)).size;
  const momPct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;

  const cards = [
    { label: "Total Infra", value: fmtCurrency(totalInfra), icon: Server, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Este mês", value: fmtCurrency(thisMonth), icon: Calendar, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    {
      label: "vs mês anterior",
      value: momPct != null ? `${momPct > 0 ? "+" : ""}${momPct.toFixed(1)}%` : "—",
      icon: TrendingUp,
      color: momPct != null && momPct > 0 ? "text-rose-400" : "text-emerald-400",
      bg: momPct != null && momPct > 0 ? "bg-rose-500/10" : "bg-emerald-500/10",
    },
    { label: "Projetos", value: String(projects), icon: FolderKanban, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-900 border-slate-800/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">{c.label}</p>
              <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center`}>
                <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold font-mono ${c.color}`}>{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
