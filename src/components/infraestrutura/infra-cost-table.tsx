"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";
import type { InfraResource } from "@/types/database";

const PAGE_SIZE = 15;

const TYPE_LABELS: Record<string, string> = {
  server: "Servidor",
  database: "Banco de Dados",
  storage: "Storage",
  cdn: "CDN",
  function: "Function",
  queue: "Fila",
  other: "Outro",
};

export function InfraCostTable({
  resources,
  projects,
}: {
  resources: InfraResource[];
  projects: { id: string; name: string }[];
}) {
  const [page, setPage] = useState(0);

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  const totalPages = Math.ceil(resources.length / PAGE_SIZE);
  const paginated = resources.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardContent className="p-0">
        {resources.length === 0 ? (
          <EmptyState
            icon={Server}
            title="Nenhum recurso de infra registrado"
            description="Adicione recursos de infraestrutura para acompanhar os custos mensais."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Custo/mês</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-slate-200 font-medium">{r.name}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{TYPE_LABELS[r.type] ?? r.type}</TableCell>
                    <TableCell className="text-slate-300">{projectName(r.project_id)}</TableCell>
                    <TableCell className="text-slate-400">{r.provider ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-sky-400">{fmtCurrency(r.cost_monthly)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
                <p className="text-xs text-slate-500">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, resources.length)} de {resources.length} recursos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                    className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Anterior
                  </button>
                  <span className="text-xs text-slate-500">{page + 1} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
