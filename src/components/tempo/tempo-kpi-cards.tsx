import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Hash, Users, Calendar } from "lucide-react";
import type { TimeEntry } from "@/types/database";

function computeKpis(entries: TimeEntry[]) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const thisMonth = entries.filter((e) => e.date >= monthStart);
  const totalHours = thisMonth.reduce((s, e) => s + e.hours, 0);
  const uniqueUsers = new Set(thisMonth.map((e) => e.user_id));
  const uniqueProjects = new Set(thisMonth.map((e) => e.project_id));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const avgPerDay = totalHours / Math.max(1, Math.min(now.getDate(), daysInMonth));

  return { totalHours, uniqueUsers: uniqueUsers.size, uniqueProjects: uniqueProjects.size, avgPerDay };
}

export function TempoKPICards({ entries }: { entries: TimeEntry[] }) {
  const kpis = computeKpis(entries);
  const fmtHours = (v: number) => v.toFixed(1);

  const cards = [
    { label: "Horas no Mês", value: `${fmtHours(kpis.totalHours)}h`, icon: Clock, color: "text-sky-400" },
    { label: "Média/dia", value: `${fmtHours(kpis.avgPerDay)}h`, icon: Hash, color: "text-emerald-400" },
    { label: "Colaboradores", value: String(kpis.uniqueUsers), icon: Users, color: "text-indigo-400" },
    { label: "Projetos", value: String(kpis.uniqueProjects), icon: Calendar, color: "text-amber-400" },
  ];

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
