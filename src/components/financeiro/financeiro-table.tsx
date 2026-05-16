"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FinanceiroDialogs } from "./financeiro-dialogs";
import type { Revenue, Cost, Project } from "@/types/database";

interface ProjectFinanceRow {
  projectId: string;
  projectName: string;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  margin: number;
}

export function FinanceiroTable({
  projects, revenues, costs, canManage,
}: {
  projects: Pick<Project, "id" | "name">[];
  revenues: Revenue[];
  costs: Cost[];
  canManage: boolean;
}) {
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const rows: ProjectFinanceRow[] = projects.map((p) => {
    const projectRevenues = revenues.filter((r) => r.project_id === p.id);
    const projectCosts = costs.filter((c) => c.project_id === p.id);
    const totalRevenue = projectRevenues.reduce((s, r) => s + r.amount, 0);
    const totalCost = projectCosts.reduce((s, c) => s + c.amount, 0);
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    return { projectId: p.id, projectName: p.name, totalRevenue, totalCost, profit, margin };
  });

  const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalCost = rows.reduce((s, r) => s + r.totalCost, 0);

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <h2 className="text-base font-medium text-slate-200">Resumo por Projeto</h2>
        {canManage && <FinanceiroDialogs projects={projects} />}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projeto</TableHead>
            <TableHead className="text-right">Receita</TableHead>
            <TableHead className="text-right">Custo</TableHead>
            <TableHead className="text-right">Lucro</TableHead>
            <TableHead className="text-right">Margem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.projectId}>
              <TableCell className="font-medium text-slate-100">{row.projectName}</TableCell>
              <TableCell className="text-right font-mono text-emerald-400">{fmtCurrency(row.totalRevenue)}</TableCell>
              <TableCell className="text-right font-mono text-rose-400">{fmtCurrency(row.totalCost)}</TableCell>
              <TableCell className={`text-right font-mono ${row.profit >= 0 ? "text-slate-100" : "text-rose-400"}`}>
                {fmtCurrency(row.profit)}
              </TableCell>
              <TableCell className="text-right font-mono">
                <Badge variant={row.margin >= 20 ? "success" : row.margin >= 0 ? "warning" : "danger"}>
                  {row.margin.toFixed(1)}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-800/30">
            <TableCell className="font-semibold text-slate-200">Total</TableCell>
            <TableCell className="text-right font-mono font-semibold text-emerald-400">{fmtCurrency(totalRevenue)}</TableCell>
            <TableCell className="text-right font-mono font-semibold text-rose-400">{fmtCurrency(totalCost)}</TableCell>
            <TableCell className={`text-right font-mono font-semibold ${totalRevenue - totalCost >= 0 ? "text-slate-100" : "text-rose-400"}`}>
              {fmtCurrency(totalRevenue - totalCost)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
