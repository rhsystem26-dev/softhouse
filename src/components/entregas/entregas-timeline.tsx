import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { Delivery, Project } from "@/types/database";

const statusLabels: Record<string, string> = {
  backlog: "Backlog", in_progress: "Em Progresso", review: "Review", done: "Concluído", blocked: "Bloqueado",
};
const statusVariants: Record<string, "default" | "info" | "warning" | "success" | "danger"> = {
  backlog: "default", in_progress: "warning", review: "info", done: "success", blocked: "danger",
};

interface MemberInfo {
  user_id: string;
  profiles: { full_name: string }[] | null;
}

export function EntregasTimeline({
  deliveries, projects, members,
}: {
  deliveries: Delivery[];
  projects: Pick<Project, "id" | "name">[];
  members: MemberInfo[];
}) {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const userMap = new Map(members.map((m) => [m.user_id, m.profiles?.[0]?.full_name ?? "—"]));
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");

  const upcoming = deliveries
    .filter((d) => d.status !== "done")
    .slice(0, 10);

  if (upcoming.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Próximas Entregas</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-slate-500">Nenhuma entrega pendente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Próximas Entregas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
          {upcoming.map((d) => (
            <div key={d.id} className="relative">
              <div className={`absolute -left-[0.45rem] top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                d.status === "blocked" ? "bg-rose-500" : d.status === "in_progress" || d.status === "review" ? "bg-sky-500" : "bg-slate-600"
              }`} />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-200">{d.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {projectMap.get(d.project_id) ?? "—"}
                    {d.assignee_id && ` · ${userMap.get(d.assignee_id) ?? "—"}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.due_date && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {fmtDate(d.due_date)}
                    </span>
                  )}
                  <Badge variant={statusVariants[d.status] ?? "info"} className="text-xs">
                    {statusLabels[d.status] ?? d.status}
                  </Badge>
                </div>
              </div>
              {d.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
