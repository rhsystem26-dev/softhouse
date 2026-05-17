"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";
import type { InfraResource } from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  server: "Servidor",
  database: "Banco",
  storage: "Storage",
  cdn: "CDN",
  function: "Function",
  queue: "Fila",
  other: "Outro",
};

function buildTypeData(resources: InfraResource[]) {
  const byType: Record<string, number> = {};
  for (const r of resources) {
    byType[r.type] = (byType[r.type] ?? 0) + r.cost_monthly;
  }
  return Object.entries(byType)
    .map(([type, custo]) => ({ type: TYPE_LABELS[type] ?? type, custo }))
    .sort((a, b) => b.custo - a.custo);
}

export function InfraChart({ resources }: { resources: InfraResource[] }) {
  const data = buildTypeData(resources);

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">Custo Mensal por Tipo de Recurso</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={Server} title="Sem recursos de infra registrados" className="py-8" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="type" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                formatter={(v) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v))
                }
              />
              <Bar dataKey="custo" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
