"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TempoDialog } from "./tempo-dialog";
import type { TimeEntry, Project } from "@/types/database";

interface MemberInfo {
  user_id: string;
  profiles: { full_name: string }[] | null;
}

export function TempoTable({
  entries, projects, members, canManage,
}: {
  entries: TimeEntry[];
  projects: Pick<Project, "id" | "name">[];
  members: MemberInfo[];
  canManage: boolean;
}) {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const userMap = new Map(members.map((m) => [m.user_id, m.profiles?.[0]?.full_name ?? "—"]));
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <h2 className="text-base font-medium text-slate-200">Lançamentos</h2>
        {canManage && <TempoDialog projects={projects} members={members} />}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Projeto</TableHead>
            <TableHead>Colaborador</TableHead>
            <TableHead className="text-right">Horas</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                Nenhum lançamento de horas. Clique em &quot;Registrar&quot; para adicionar.
              </TableCell>
            </TableRow>
          ) : (
            entries.slice(0, 50).map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-slate-400">{fmtDate(e.date)}</TableCell>
                <TableCell className="text-slate-300">{projectMap.get(e.project_id) ?? "—"}</TableCell>
                <TableCell className="text-slate-300">{userMap.get(e.user_id) ?? "—"}</TableCell>
                <TableCell className="text-right font-mono text-slate-200">{e.hours.toFixed(1)}h</TableCell>
                <TableCell className="text-slate-400 max-w-xs truncate">{e.description || "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
