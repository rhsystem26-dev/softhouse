import { createClient } from "@/lib/supabase/server";
import { ProjetoView } from "@/components/projetos/projeto-view";
import { ProjetoDialog } from "@/components/projetos/projeto-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen } from "lucide-react";
import { safeError } from "@/lib/server/safe-log";
import type { Project, Client } from "@/types/database";

export default async function ProjetosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Sessão expirada. Faça login novamente.</p>
      </div>
    );
  }

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member?.org_id) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Nenhuma organização vinculada ao seu usuário.</p>
      </div>
    );
  }

  const canManage = member.role && ["admin", "socio"].includes(member.role);
  const orgId = member.org_id;

  let projects: Project[] = [];
  let clients: Pick<Client, "id" | "name">[] = [];

  try {
    const results = await Promise.all([
      supabase.from("projects").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").eq("org_id", orgId).order("name"),
    ]);
    projects = (results[0].data ?? []) as Project[];
    clients = (results[1].data ?? []) as Pick<Client, "id" | "name">[];
  } catch (err) {
    safeError("Erro ao carregar projetos", err);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-2">Erro ao carregar dados de projetos.</p>
        <p className="text-sm text-muted-foreground">Tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Projetos</h1>
          <p className="text-sm text-slate-400 mt-1">
            {projects.length} projeto(s)
          </p>
        </div>
        {canManage && (
          <ProjetoDialog clients={clients}>
            <Button variant="default">Novo Projeto</Button>
          </ProjetoDialog>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum projeto cadastrado"
          description="Crie projetos para começar a gerenciar entregas e custos."
          action={canManage ? (
            <ProjetoDialog clients={clients}>
              <Button variant="default">Novo Projeto</Button>
            </ProjetoDialog>
          ) : undefined}
        />
      ) : (
        <ProjetoView
          projects={projects}
          clients={clients}
          canManage={canManage}
        />
      )}
    </div>
  );
}
