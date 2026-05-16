"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IADialog } from "./ia-dialog";
import type { AiUsage, AiModel, Project } from "@/types/database";

const resultLabels: Record<string, string> = {
  accepted: "Aceito", rejected: "Rejeitado", modified: "Modificado",
};

export function IAUsageTable({
  usage, projects, models, canManage,
}: {
  usage: AiUsage[];
  projects: Pick<Project, "id" | "name">[];
  models: AiModel[];
  canManage: boolean;
}) {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const modelMap = new Map(models.map((m) => [m.id, m.name]));
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const fmtTokens = (v: number) => v.toLocaleString("pt-BR");

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <h2 className="text-base font-medium text-slate-200">Uso Recente</h2>
        {canManage && <IADialog projects={projects} models={models} />}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Projeto</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead className="text-right">Tokens In</TableHead>
            <TableHead className="text-right">Tokens Out</TableHead>
            <TableHead className="text-right">Custo</TableHead>
            <TableHead>Resultado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usage.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                Nenhum registro de uso de IA. Clique em "Registrar" para adicionar.
              </TableCell>
            </TableRow>
          ) : (
            usage.slice(0, 50).map((u) => (
              <TableRow key={u.id}>
                <TableCell className="text-slate-400">{fmtDate(u.created_at)}</TableCell>
                <TableCell className="text-slate-300">{projectMap.get(u.project_id) ?? "—"}</TableCell>
                <TableCell className="text-slate-300">{modelMap.get(u.model_id) ?? "—"}</TableCell>
                <TableCell className="text-right font-mono text-slate-200">{fmtTokens(u.tokens_in)}</TableCell>
                <TableCell className="text-right font-mono text-slate-200">{fmtTokens(u.tokens_out)}</TableCell>
                <TableCell className="text-right font-mono text-emerald-400">{fmtCurrency(u.cost)}</TableCell>
                <TableCell>
                  {u.result ? (
                    <Badge variant={u.result === "accepted" ? "success" : u.result === "modified" ? "warning" : "danger"}>
                      {resultLabels[u.result]}
                    </Badge>
                  ) : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
