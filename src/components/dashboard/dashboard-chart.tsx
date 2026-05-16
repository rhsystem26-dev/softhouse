"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface ProjectBudgetItem {
  id: string;
  name: string;
  status: string;
  budget: number | null;
  member_count: number;
}

const statusColors: Record<string, string> = {
  active: "#10b981",
  completed: "#6366f1",
  on_hold: "#f59e0b",
  cancelled: "#f43f5e",
};

export function DashboardChart({ data }: { data: ProjectBudgetItem[] }) {
  const chartData = data
    .filter((p) => p.budget != null && p.budget > 0)
    .slice(0, 10)
    .map((p) => ({
      name: p.name.length > 20 ? p.name.slice(0, 18) + "…" : p.name,
      budget: p.budget,
      status: p.status,
      fullName: p.name,
    }));

  if (chartData.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Orçamento por Projeto</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Nenhum projeto com orçamento definido.</p>
        </CardContent>
      </Card>
    );
  }

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Orçamento por Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
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
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value: number) => [fmtCurrency(value), "Orçamento"]}
              labelFormatter={(_label: string, payload: unknown[]) => {
                const item = (payload as { payload: { fullName: string } }[])[0]?.payload;
                return item?.fullName ?? _label;
              }}
            />
            <Bar dataKey="budget" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={statusColors[entry.status] ?? "#475569"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
