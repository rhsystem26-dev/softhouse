import { createClient } from "@/lib/supabase/server";
import { TempoKPICards } from "@/components/tempo/tempo-kpi-cards";
import { TempoChart } from "@/components/tempo/tempo-chart";
import { TempoTable } from "@/components/tempo/tempo-table";

export default async function TempoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user!.id)
    .single();

  const orgId = member?.org_id;
  const canManage = member?.role && ["admin", "socio", "gerente"].includes(member.role);

  if (!orgId) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-slate-400">Nenhuma organização vinculada.</p>
      </div>
    );
  }

  const [{ data: entries }, { data: projects }, { data: members }] = await Promise.all([
    supabase.from("time_entries").select("*").eq("org_id", orgId).order("date", { ascending: false }),
    supabase.from("projects").select("id, name").eq("org_id", orgId).order("name"),
    supabase.from("organization_members").select("user_id, profiles(full_name)").eq("org_id", orgId),
  ]);

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

      <TempoKPICards entries={entries ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TempoChart entries={entries ?? []} projects={projects ?? []} />
        <TempoChart entries={entries ?? []} projects={projects ?? []} byUser />
      </div>

      <TempoTable
        entries={entries ?? []}
        projects={projects ?? []}
        members={members ?? []}
        canManage={canManage}
      />
    </div>
  );
}
