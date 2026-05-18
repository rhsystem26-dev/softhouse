"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { AiUsage, AiModel } from "@/types/database";

const modelColors = [
  "#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#f43f5e", "#8b5cf6", "#14b8a6",
];

export function IATokensChart({ usage, models }: { usage: AiUsage[]; models: AiModel[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const modelMap = new Map(models.map((m) => [m.id, m.name]));

  const chartData = useMemo(() => {
    const monthly = new Map<string, Record<string, number>>();
    for (const u of usage) {
      const key = u.created_at.slice(0, 7);
      const entry = monthly.get(key) || {};
      const modelName = modelMap.get(u.model_id) ?? u.model_id;
      entry[modelName] = (entry[modelName] || 0) + u.tokens_in + u.tokens_out;
      monthly.set(key, entry);
    }
    return Array.from(monthly.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        ...data,
      }));
  }, [usage, modelMap]);

  const modelNames = models.map((m) => m.name);

  if (!mounted) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader><CardTitle className="text-base text-slate-200">Tokens por Modelo</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full bg-slate-800/40 rounded" /></CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Tokens por Modelo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Nenhum dado de uso de IA.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Tokens por Modelo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "13px" }} labelStyle={{ color: "#e2e8f0" }} formatter={(value) => [Number(value).toLocaleString("pt-BR"), ""]} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            {modelNames.map((name, i) => (
              <Bar key={name} dataKey={name} name={name} fill={modelColors[i % modelColors.length]} radius={[4, 4, 0, 0]} maxBarSize={32} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
