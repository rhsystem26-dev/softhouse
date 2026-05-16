"use client";
import { useState } from "react";
import { ProjetoCard } from "./projeto-card";
import { ProjetoTable } from "./projeto-table";
import { ProjetoViewToggle } from "./projeto-view-toggle";
import { FolderKanban } from "lucide-react";
import type { Project, Client } from "@/types/database";

type ViewMode = "cards" | "table";

export function ProjetoView({
  projects,
  clients,
  canManage,
}: {
  projects: Project[];
  clients: Pick<Client, "id" | "name">[];
  canManage: boolean;
}) {
  const [view, setView] = useState<ViewMode>("cards");

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderKanban className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-lg font-medium text-slate-300 mb-2">Nenhum projeto cadastrado</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Crie projetos para começar a gerenciar entregas, custos e tempo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ProjetoViewToggle view={view} onChange={setView} />
      </div>
      {view === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((p) => (
            <ProjetoCard key={p.id} project={p} clientName={clients.find(c => c.id === p.client_id)?.name} />
          ))}
        </div>
      ) : (
        <ProjetoTable projects={projects} clients={clients} canManage={canManage} />
      )}
    </div>
  );
}
