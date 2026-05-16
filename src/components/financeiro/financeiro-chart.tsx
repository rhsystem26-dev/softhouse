"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useMemo } from "react";
import type { Revenue, Cost } from "@/types/database";

export function FinanceiroChart({ revenues, costs }: { revenues: Revenue[]; costs: Cost[] }) {
  const chartData = useMemo(() => {
    const monthly = new Map<string, { month: string; receita: number; custo: number }>();

    for (const r of revenues) {
      const key = r.date.slice(0, 7);
      const entry = monthly.get(key) || { month: key, receita: 0, custo: 0 };
      entry.receita += r.amount;
      monthly.set(key, entry);
    }
    for (const c of costs) {
      const key = c.date.slice(0, 7);
      const entry = monthly.get(key) || { month: key, receita: 0, custo: 0 };
      entry.custo += c.amount;
      monthly.set(key, entry);
    }

    return Array.from(monthly.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)
      .map((d) => ({
        ...d,
        month: new Date(d.month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      }));
  }, [revenues, costs]);

  if (chartData.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Receita vs Custo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Nenhum dado financeiro no período.</p>
        </CardContent>
      </Card>
    );
  }

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency", currency: "BRL", maximumFractionDigits: 0,
    }).format(v);

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Receita vs Custo</CardTitle>
      </CardHeader>
      <CardContent>
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
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "13px" }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value) => [fmtCurrency(Number(value) || 0), ""]}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Area dataKey="receita" name="Receita" stroke="#10b981" fill="url(#gradReceita)" strokeWidth={2} />
            <Area dataKey="custo" name="Custo" stroke="#64748b" fill="url(#gradCusto)" strokeWidth={2} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
