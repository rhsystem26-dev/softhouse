import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, Layers } from "lucide-react";
import type { Delivery } from "@/types/database";

function computeKpis(deliveries: Delivery[]) {
  const done = deliveries.filter((d) => d.status === "done").length;
  const inProgress = deliveries.filter((d) => d.status === "in_progress" || d.status === "review").length;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = deliveries.filter((d) => d.status !== "done" && d.due_date && d.due_date < today).length;
  return { done, inProgress, overdue, total: deliveries.length };
}

export function EntregasKPICards({ deliveries, compact }: { deliveries: Delivery[]; compact?: boolean }) {
  const kpis = computeKpis(deliveries);

  const cards = [
    { label: "Concluídas", value: String(kpis.done), icon: CheckCircle, color: "text-emerald-400" },
    { label: "Em Progresso", value: String(kpis.inProgress), icon: Clock, color: "text-sky-400" },
    { label: "Atrasadas", value: String(kpis.overdue), icon: AlertTriangle, color: kpis.overdue > 0 ? "text-rose-400" : "text-slate-400" },
    { label: "Total", value: String(kpis.total), icon: Layers, color: "text-indigo-400" },
  ];

  if (compact) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cards.map((c) => (
            <div key={c.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <c.icon className={`w-4 h-4 ${c.color}`} />
                {c.label}
              </span>
              <span className="font-mono text-slate-200">{c.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <c.icon className={`w-4 h-4 ${c.color}`} />
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono tabular-nums">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
