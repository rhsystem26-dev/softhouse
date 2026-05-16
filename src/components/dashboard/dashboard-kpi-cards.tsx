import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FolderKanban, Users, CheckCircle } from "lucide-react";

interface Metrics {
  projects_active: number;
  projects_completed: number;
  projects_on_hold: number;
  projects_total: number;
  total_budget_active: number;
  org_members: number;
}

export function DashboardKPICards({ metrics }: { metrics: Metrics | null }) {
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center shrink-0`}>
                <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
              {c.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
