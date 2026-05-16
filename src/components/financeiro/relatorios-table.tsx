"use client";
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Revenue, Cost, Project } from "@/types/database";

const typeLabels: Record<string, string> = {
  servico: "Serviço", consultoria: "Consultoria", produto: "Produto", retainer: "Retainer", outro: "Outro",
};
const categoryLabels: Record<string, string> = {
  ia: "IA", infra: "Infra", pessoal: "Pessoal", outros: "Outros",
};

export function RelatoriosTable({
  projects, revenues, costs,
}: {
  projects: Pick<Project, "id" | "name">[];
  revenues: Revenue[];
  costs: Cost[];
}) {
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const filtered = useMemo(() => {
    const filteredRevenues = revenues
      .filter((r) => !projectFilter || r.project_id === projectFilter)
      .filter((r) => !dateStart || r.date >= dateStart)
      .filter((r) => !dateEnd || r.date <= dateEnd)
      .map((r) => ({
        id: r.id,
        date: r.date,
        projectId: r.project_id,
        description: r.description,
        amount: r.amount,
        type: "revenue" as const,
        category: r.type,
        label: typeLabels[r.type] ?? r.type,
      }));

    const filteredCosts = costs
      .filter((c) => !projectFilter || c.project_id === projectFilter)
      .filter((c) => !dateStart || c.date >= dateStart)
      .filter((c) => !dateEnd || c.date <= dateEnd)
      .map((c) => ({
        id: c.id,
        date: c.date,
        projectId: c.project_id,
        description: c.description,
        amount: c.amount,
        type: "cost" as const,
        category: c.category,
        label: categoryLabels[c.category] ?? c.category,
      }));

    return [...filteredRevenues, ...filteredCosts].sort((a, b) => b.date.localeCompare(a.date));
  }, [revenues, costs, projectFilter, dateStart, dateEnd]);

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v as string)}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todos os projetos" />
          </SelectTrigger>
          <SelectPopover>
            <SelectItem value="">Todos os projetos</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectPopover>
        </Select>
        <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-40" />
        <span className="text-slate-500 text-sm">até</span>
        <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-40" />
        <span className="text-xs text-slate-500">{filtered.length} registro(s)</span>
      </div>

      <div className="rounded-lg border border-slate-800/60 bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.type + item.id}>
                  <TableCell className="text-slate-400">{fmtDate(item.date)}</TableCell>
                  <TableCell className="text-slate-300">{projects.find((p) => p.id === item.projectId)?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === "revenue" ? "success" : "danger"}>
                      {item.type === "revenue" ? "Receita" : "Custo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">{item.label}</TableCell>
                  <TableCell className="text-slate-400 max-w-xs truncate">{item.description || "—"}</TableCell>
                  <TableCell className={`text-right font-mono ${item.type === "revenue" ? "text-emerald-400" : "text-rose-400"}`}>
                    {item.type === "cost" ? "-" : ""}{fmtCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
