import { createClient } from "@/lib/supabase/server";
import { InfraKPICards } from "@/components/infraestrutura/infra-kpi-cards";
import { InfraTable } from "@/components/infraestrutura/infra-table";
import { safeError } from "@/lib/server/safe-log";

interface InfraRow { id: string; project_id: string; org_id: string; name: string; type: "function" | "server" | "database" | "storage" | "cdn" | "queue" | "other"; provider: string | null; cost_monthly: number; notes: string | null; created_at: string }
interface ProjectRow { id: string; name: string }

export default async function InfraPage() {
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

  const orgId = member?.org_id;
  const canManage = member?.role && ["admin", "socio", "financeiro"].includes(member.role);

  if (!orgId) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Nenhuma organização vinculada.</p>
      </div>
    );
  }

  let resources: InfraRow[] = [];
  let projects: ProjectRow[] = [];

  try {
    const results = await Promise.all([
      supabase.from("infra_resources").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name").eq("org_id", orgId).order("name"),
    ]);
    resources = (results[0].data ?? []) as InfraRow[];
    projects = (results[1].data ?? []) as ProjectRow[];
  } catch (err) {
    safeError("Erro ao carregar infraestrutura", err);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-2">Erro ao carregar dados de infraestrutura.</p>
        <p className="text-sm text-muted-foreground">Tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Infraestrutura</h1>
          <p className="text-sm text-slate-400 mt-1">Recursos de infraestrutura por projeto</p>
        </div>
      </div>
      <InfraKPICards resources={resources} />
      <InfraTable resources={resources} projects={projects} canManage={canManage} />
    </div>
  );
}
