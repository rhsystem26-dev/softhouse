"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";
import type { Cost } from "@/types/database";

const PAGE_SIZE = 15;

export function InfraCostTable({
  costs,
  projects,
}: {
  costs: Cost[];
  projects: { id: string; name: string }[];
}) {
  const [page, setPage] = useState(0);

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  const totalPages = Math.ceil(costs.length / PAGE_SIZE);
  const paginated = costs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardContent className="p-0">
        {costs.length === 0 ? (
          <EmptyState
            icon={Server}
            title="Nenhum custo de infra registrado"
            description="Registre custos com categoria 'infra' na página Financeiro."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-slate-400 text-sm">{fmtDate(c.date)}</TableCell>
                    <TableCell className="text-slate-300">{projectName(c.project_id)}</TableCell>
                    <TableCell className="text-slate-400">{c.description ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-sky-400">{fmtCurrency(c.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
                <p className="text-xs text-slate-500">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, costs.length)} de {costs.length} registros
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
