import { createClient } from "@/lib/supabase/server";
import { EntregasKPICards } from "@/components/entregas/entregas-kpi-cards";
import { EntregasTimeline } from "@/components/entregas/entregas-timeline";
import { EntregasTable } from "@/components/entregas/entregas-table";

export default async function EntregasPage() {
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

  const [{ data: deliveries }, { data: projects }, { data: members }] = await Promise.all([
    supabase.from("deliveries").select("*").eq("org_id", orgId).order("due_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false }),
    supabase.from("projects").select("id, name").eq("org_id", orgId).order("name"),
    supabase.from("organization_members").select("user_id, profiles(full_name)").eq("org_id", orgId),
  ]);

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

      <EntregasKPICards deliveries={deliveries ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EntregasTimeline deliveries={deliveries ?? []} projects={projects ?? []} members={members ?? []} />
        </div>
        <div>
          <EntregasKPICards deliveries={deliveries ?? []} compact />
        </div>
      </div>

      <EntregasTable
        deliveries={deliveries ?? []}
        projects={projects ?? []}
        members={members ?? []}
        canManage={canManage}
      />
    </div>
  );
}
