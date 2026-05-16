"use client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProjetoDialog } from "./projeto-dialog";
import { deleteProjectAction } from "@/lib/actions/projects";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useMemo } from "react";
import type { Project, Client } from "@/types/database";

const statusLabels: Record<string, string> = {
  active: "Ativo", completed: "Concluído", on_hold: "Pausado", cancelled: "Cancelado",
};
const statusVariants: Record<string, "success" | "info" | "warning" | "danger"> = {
  active: "success", completed: "info", on_hold: "warning", cancelled: "danger",
};

export function ProjetoTable({
  projects, clients, canManage,
}: {
  projects: Project[]; clients: Pick<Client, "id" | "name">[]; canManage: boolean;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof Project>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      return String(av).localeCompare(String(bv)) * (sortDir === "asc" ? 1 : -1);
    });
    return sorted;
  }, [projects, sortKey, sortDir]);

  function toggleSort(key: keyof Project) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este projeto?")) return;
    setDeleting(id);
    await deleteProjectAction(id);
    setDeleting(null);
  }

  const fmtCurrency = (v: number | null) =>
    v != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "—";

  const fmtDate = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

  function clientName(id: string | null) {
    return clients.find(c => c.id === id)?.name ?? "—";
  }

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
              Nome {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("status")}>
              Status {sortKey === "status" && (sortDir === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Orçamento</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium text-slate-100">{p.name}</TableCell>
              <TableCell className="text-slate-400">{clientName(p.client_id)}</TableCell>
              <TableCell>
                <Badge variant={statusVariants[p.status] ?? "default"}>{statusLabels[p.status]}</Badge>
              </TableCell>
              <TableCell className="font-mono text-slate-300">{fmtCurrency(p.budget)}</TableCell>
              <TableCell className="text-slate-400 text-sm">
                {fmtDate(p.start_date)} → {fmtDate(p.end_date)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/app/projetos/${p.id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  {canManage && (
                    <>
                      <ProjetoDialog project={p} clients={clients}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </ProjetoDialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-300"
                        onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
