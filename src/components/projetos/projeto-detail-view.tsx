"use client";
import { useState } from "react";
import { ProjetoLocalSidebar, type DetailSection } from "./projeto-local-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  Cpu,
  Clock,
  CheckSquare,
  Server,
  FileText,
} from "lucide-react";
import type { Project, Client, TimeEntry, Delivery } from "@/types/database";

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

const sections: DetailSection[] = [
  { id: "overview", label: "Visão Geral", icon: Building2 },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "ia-tokens", label: "IAs e Tokens", icon: Cpu },
  { id: "tempo", label: "Tempo", icon: Clock },
  { id: "entregas", label: "Entregas", icon: CheckSquare },
  { id: "infraestrutura", label: "Infraestrutura", icon: Server },
  { id: "historico", label: "Histórico", icon: FileText },
];

interface ProjetoMember {
  id: string;
  user_id: string;
  role: string;
  assigned_at: string;
}

export function ProjetoDetailView({
  project,
  client,
  members,
  timeEntries,
  deliveries,
}: {
  project: Project;
  client: Pick<Client, "id" | "name"> | null;
  members: ProjetoMember[];
  timeEntries: TimeEntry[];
  deliveries: Delivery[];
}) {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const fmtCurrency = (v: number | null) =>
    v != null
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(v)
      : "-";

  const fmtDate = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "-";

  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-6 lg:-m-8 min-h-[calc(100vh-3.5rem)]">
      <ProjetoLocalSidebar
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {/* Header do projeto */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">
                {project.name}
              </h1>
              {client && (
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {client.name}
                </p>
              )}
            </div>
            <Badge variant={statusVariants[project.status] ?? "default"}>
              {statusLabels[project.status] ?? project.status}
            </Badge>
          </div>

          {/* KPIs rapidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <Card className="bg-slate-900 border-slate-800/60">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400">Orçamento</p>
                <p className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                  {fmtCurrency(project.budget)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800/60">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400">Prazo</p>
                <p className="text-sm text-slate-200 font-mono mt-0.5">
                  {fmtDate(project.start_date)} &rarr;{" "}
                  {fmtDate(project.end_date)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800/60">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400">Membros</p>
                <p className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                  <Users className="w-4 h-4 inline mr-1" />
                  {members.length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800/60">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400">Criado em</p>
                <p className="text-sm text-slate-200 font-mono mt-0.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  {new Date(project.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secao ativa */}
        <div id={`section-${activeSection}`}>
          {activeSection === "overview" && (
            <Card className="bg-slate-900 border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-base text-slate-200">
                  Visão Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.description ? (
                  <p className="text-slate-400 leading-relaxed">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-slate-600 italic">
                    Nenhuma descrição fornecida.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "tempo" && (
            <div className="space-y-4">
              {timeEntries.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhuma hora lançada neste projeto.</p>

              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-slate-400">{new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-right font-mono text-slate-200">{e.hours.toFixed(1)}h</TableCell>
                        <TableCell className="text-slate-400">{e.description || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {activeSection === "entregas" && (
            <div className="space-y-4">
              {deliveries.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhuma entrega registrada neste projeto.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-slate-300">{d.title}</TableCell>
                        <TableCell>
                          <Badge variant={d.status === "done" ? "success" : d.status === "blocked" ? "danger" : d.status === "in_progress" || d.status === "review" ? "warning" : "info"}>
                            {{ backlog: "Backlog", in_progress: "Em Progresso", review: "Review", done: "Concluído", blocked: "Bloqueado" }[d.status] ?? d.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">{d.due_date ? new Date(d.due_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {activeSection !== "overview" && activeSection !== "tempo" && activeSection !== "entregas" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                Disponível em fase futura
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                Esta seção estará disponível nas próximas fases do sistema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
