"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";
import type { Cost } from "@/types/database";

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildMonthlyData(costs: Cost[]) {
  const now = new Date();
  const months: { month: string; custo: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const custo = costs
      .filter((c) => c.date.startsWith(key))
      .reduce((s, c) => s + c.amount, 0);
    months.push({ month: MONTH_NAMES[d.getMonth()], custo });
  }
  return months;
}

export function InfraChart({ costs }: { costs: Cost[] }) {
  const data = buildMonthlyData(costs);
  const hasData = data.some((d) => d.custo > 0);

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">Custo de Infra — Últimos 12 meses</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState icon={Server} title="Sem custos de infra registrados" className="py-8" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="infraGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                formatter={(v) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v))
                }
              />
              <Area dataKey="custo" stroke="#0ea5e9" fill="url(#infraGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
