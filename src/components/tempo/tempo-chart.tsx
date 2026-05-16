"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import type { TimeEntry, Project } from "@/types/database";

const colors = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#f43f5e", "#8b5cf6", "#14b8a6"];

export function TempoChart({
  entries, projects, byUser,
}: {
  entries: TimeEntry[];
  projects: Pick<Project, "id" | "name">[];
  byUser?: boolean;
}) {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  const chartData = useMemo(() => {
    const monthly = new Map<string, Record<string, number>>();
    for (const e of entries) {
      const key = e.date.slice(0, 7);
      const entry = monthly.get(key) || {};
      const label = byUser ? e.user_id.slice(0, 8) : (projectMap.get(e.project_id) ?? e.project_id);
      entry[label] = (entry[label] || 0) + e.hours;
      monthly.set(key, entry);
    }
    return Array.from(monthly.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        ...data,
      }));
  }, [entries, projectMap, byUser]);

  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const d of chartData) Object.keys(d).forEach((k) => k !== "month" && keys.add(k));
    return Array.from(keys);
  }, [chartData]);

  const title = byUser ? "Horas por Colaborador" : "Horas por Projeto";

  if (chartData.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Nenhum lançamento de horas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} tickFormatter={(v) => `${v}h`} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "13px" }} labelStyle={{ color: "#e2e8f0" }} formatter={(value) => [`${Number(value).toFixed(1)}h`, ""]} />
            {allKeys.map((key, i) => (
              <Bar key={key} dataKey={key} name={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} maxBarSize={32} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
