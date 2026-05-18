"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Cost } from "@/types/database";

const categoryColors: Record<string, string> = {
  ia: "#6366f1",
  infra: "#0ea5e9",
  pessoal: "#f59e0b",
  outros: "#64748b",
};

const categoryLabels: Record<string, string> = {
  ia: "IA",
  infra: "Infra",
  pessoal: "Pessoal",
  outros: "Outros",
};

export function FinanceiroDonut({ costs }: { costs: Cost[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const data = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const c of costs) {
      byCategory.set(c.category, (byCategory.get(c.category) || 0) + c.amount);
    }
    return Array.from(byCategory.entries())
      .map(([category, value]) => ({ name: categoryLabels[category] ?? category, value, color: categoryColors[category] ?? "#64748b" }));
  }, [costs]);

  if (!mounted) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader><CardTitle className="text-base text-slate-200">Custos por Categoria</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[260px] w-full bg-slate-800/40 rounded" /></CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Custos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Nenhum custo registrado.</p>
        </CardContent>
      </Card>
    );
  }

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Custos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "13px" }} formatter={(value) => [fmtCurrency(Number(value) || 0), ""]} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
