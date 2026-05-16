import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Building2 } from "lucide-react";
import type { Project } from "@/types/database";

const statusLabels: Record<string, string> = {
  active: "Ativo",
  completed: "Concluído",
  on_hold: "Pausado",
  cancelled: "Cancelado",
};

const statusVariants: Record<string, "success" | "info" | "warning" | "danger"> = {
  active: "success",
  completed: "info",
  on_hold: "warning",
  cancelled: "danger",
};

export function ProjetoCard({ project, clientName }: { project: Project; clientName?: string }) {
  const fmtCurrency = (v: number | null) =>
    v != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : null;

  const fmtDate = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : null;

  return (
    <Link href={`/app/projetos/${project.id}`}>
      <Card className="bg-slate-900 border-slate-800/60 hover:border-slate-700/60 transition-colors cursor-pointer h-full">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 min-w-0">
              <h3 className="font-medium text-slate-100 truncate">{project.name}</h3>
              {clientName && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {clientName}
                </p>
              )}
            </div>
            <Badge variant={statusVariants[project.status] ?? "default"}>
              {statusLabels[project.status] ?? project.status}
            </Badge>
          </div>

          {project.description && (
            <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {project.budget != null && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-slate-200">{fmtCurrency(project.budget)}</span>
              </div>
            )}
            {(project.start_date || project.end_date) && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">
                  {fmtDate(project.start_date) ?? "—"} → {fmtDate(project.end_date) ?? "—"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
