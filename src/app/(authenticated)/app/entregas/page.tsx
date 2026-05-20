import { createClient } from "@/lib/supabase/server";
import { EntregasKPICards } from "@/components/entregas/entregas-kpi-cards";
import { EntregasTimeline } from "@/components/entregas/entregas-timeline";
import { EntregasTable } from "@/components/entregas/entregas-table";
import { safeError } from "@/lib/server/safe-log";

interface DeliveryRow { id: string; project_id: string; org_id: string; title: string; description: string | null; status: "review" | "done" | "backlog" | "in_progress" | "blocked"; due_date: string | null; completed_at: string | null; assignee_id: string | null; created_at: string; updated_at: string }
interface ProjectRow { id: string; name: string }
interface MemberRow { user_id: string; profiles: { full_name: string }[] | null }

export default async function EntregasPage() {
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
  const canManage = member?.role && ["admin", "socio", "gerente"].includes(member.role);

  if (!orgId) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Nenhuma organização vinculada.</p>
      </div>
    );
  }

  let deliveries: DeliveryRow[] = [];
  let projects: ProjectRow[] = [];
  let members: MemberRow[] = [];

  try {
    const results = await Promise.all([
      supabase.from("deliveries").select("*").eq("org_id", orgId).order("due_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name").eq("org_id", orgId).order("name"),
      supabase.from("organization_members").select("user_id").eq("org_id", orgId),
    ]);

    deliveries = (results[0].data ?? []) as DeliveryRow[];
    projects = (results[1].data ?? []) as ProjectRow[];
    const memberRows = results[2].data ?? [];

    // Query profiles separately to avoid RLS re-entrancy from embed
    const userIds = memberRows.map((m: { user_id: string }) => m.user_id);
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map((p: { user_id: string; full_name: string | null }) => [p.user_id, { full_name: p.full_name ?? "" }]));
      members = memberRows.map((m: { user_id: string }) => ({
        user_id: m.user_id,
        profiles: profileMap.has(m.user_id) ? [profileMap.get(m.user_id)!] : null,
      }));
    }
  } catch (err) {
    safeError("Erro ao carregar entregas", err);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-2">Erro ao carregar dados de entregas.</p>
        <p className="text-sm text-muted-foreground">Tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Entregas</h1>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhamento de entregas por projeto
          </p>
        </div>
      </div>

      <EntregasKPICards deliveries={deliveries} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EntregasTimeline deliveries={deliveries} projects={projects} members={members} />
        </div>
        <div>
          <EntregasKPICards deliveries={deliveries} compact />
        </div>
      </div>

      <EntregasTable
        deliveries={deliveries}
        projects={projects}
        members={members}
        canManage={canManage}
      />
    </div>
  );
}
