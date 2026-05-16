"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EntregasDialog } from "./entregas-dialog";
import type { Delivery, Project } from "@/types/database";

const statusLabels: Record<string, string> = {
  backlog: "Backlog", in_progress: "Em Progresso", review: "Review", done: "Concluído", blocked: "Bloqueado",
};
const statusVariants: Record<string, "info" | "warning" | "success" | "danger"> = {
  backlog: "info", in_progress: "warning", review: "warning", done: "success", blocked: "danger",
};

interface MemberInfo {
  user_id: string;
  profiles: { full_name: string }[] | null;
}

export function EntregasTable({
  deliveries, projects, members, canManage,
}: {
  deliveries: Delivery[];
  projects: Pick<Project, "id" | "name">[];
  members: MemberInfo[];
  canManage: boolean;
}) {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const userMap = new Map(members.map((m) => [m.user_id, m.profiles?.[0]?.full_name ?? "—"]));
  const fmtDate = (d: string | null) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <h2 className="text-base font-medium text-slate-200">Todas as Entregas</h2>
        {canManage && <EntregasDialog projects={projects} members={members} />}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Projeto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Conclusão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                Nenhuma entrega registrada. Clique em &quot;Nova&quot; para adicionar.
              </TableCell>
            </TableRow>
          ) : (
            deliveries.slice(0, 50).map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-slate-300 font-medium">{d.title}</TableCell>
                <TableCell className="text-slate-400">{projectMap.get(d.project_id) ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[d.status] ?? "info"}>
                    {statusLabels[d.status] ?? d.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400">{userMap.get(d.assignee_id ?? "") ?? "—"}</TableCell>
                <TableCell className="text-slate-400">{fmtDate(d.due_date)}</TableCell>
                <TableCell className="text-slate-400">{d.completed_at ? new Date(d.completed_at).toLocaleDateString("pt-BR") : "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
