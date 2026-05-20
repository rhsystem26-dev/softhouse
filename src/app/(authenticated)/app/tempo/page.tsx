import { createClient } from "@/lib/supabase/server";
import { TempoKPICards } from "@/components/tempo/tempo-kpi-cards";
import { TempoChart } from "@/components/tempo/tempo-chart";
import { TempoTable } from "@/components/tempo/tempo-table";
import { safeError } from "@/lib/server/safe-log";

interface TimeEntryRow { id: string; project_id: string; org_id: string; user_id: string; hours: number; description: string | null; date: string; created_at: string }
interface ProjectRow { id: string; name: string }
interface MemberRow { user_id: string; profiles: { full_name: string }[] | null }

export default async function TempoPage() {
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

  let entries: TimeEntryRow[] = [];
  let projects: ProjectRow[] = [];
  let members: MemberRow[] = [];

  try {
    const results = await Promise.all([
      supabase.from("time_entries").select("*").eq("org_id", orgId).order("date", { ascending: false }),
      supabase.from("projects").select("id, name").eq("org_id", orgId).order("name"),
      supabase.from("organization_members").select("user_id").eq("org_id", orgId),
    ]);

    entries = (results[0].data ?? []) as TimeEntryRow[];
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
    safeError("Erro ao carregar tempo", err);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-2">Erro ao carregar dados de tempo.</p>
        <p className="text-sm text-muted-foreground">Tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Tempo</h1>
          <p className="text-sm text-slate-400 mt-1">
            Lançamento de horas por projeto e colaborador
          </p>
        </div>
      </div>

      <TempoKPICards entries={entries} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TempoChart entries={entries} projects={projects} />
        <TempoChart entries={entries} projects={projects} byUser />
      </div>

      <TempoTable
        entries={entries}
        projects={projects}
        members={members}
        canManage={canManage}
      />
    </div>
  );
}
