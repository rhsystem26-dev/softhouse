import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExternalLink, FolderKanban, Calendar } from "lucide-react";

interface ActiveProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
}

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

export function DashboardProjectCards({ projects }: { projects: ActiveProject[] }) {
  const fmtCurrency = (v: number | null) =>
    v != null
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(v)
      : null;

  const fmtDate = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : null;

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Projetos Ativos</h3>
          <span className="text-xs text-slate-500">{projects.length}</span>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Nenhum projeto ativo"
            description="Crie um projeto para começar a acompanhar métricas."
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 5).map((p) => (
              <Link key={p.id} href={`/app/projetos/${p.id}`}>
                <div className="flex items-start justify-between p-2 rounded-md hover:bg-slate-800/50 transition-colors group">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm text-slate-200 truncate group-hover:text-slate-100">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {fmtCurrency(p.budget) && (
                        <span className="font-mono">{fmtCurrency(p.budget)}</span>
                      )}
                      {p.end_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {fmtDate(p.end_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariants[p.status] ?? "default"} className="text-xs">
                      {statusLabels[p.status] ?? p.status}
                    </Badge>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
