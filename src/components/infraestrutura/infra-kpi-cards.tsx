import { Card, CardContent } from "@/components/ui/card";
import { Server, DollarSign, FolderKanban, Layers } from "lucide-react";
import type { InfraResource } from "@/types/database";

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export function InfraKPICards({ resources }: { resources: InfraResource[] }) {
  const totalMonthly = resources.reduce((s, r) => s + r.cost_monthly, 0);
  const projects = new Set(resources.map((r) => r.project_id)).size;
  const totalResources = resources.length;
  const types = new Set(resources.map((r) => r.type)).size;

  const cards = [
    { label: "Custo Mensal Total", value: fmtCurrency(totalMonthly), icon: DollarSign, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Recursos", value: String(totalResources), icon: Server, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Projetos", value: String(projects), icon: FolderKanban, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Tipos", value: String(types), icon: Layers, color: "text-amber-400", bg: "bg-amber-500/10" },
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
