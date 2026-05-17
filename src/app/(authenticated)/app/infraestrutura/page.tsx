import { createClient } from "@/lib/supabase/server";
import { InfraKPICards } from "@/components/infraestrutura/infra-kpi-cards";
import { InfraCostTable } from "@/components/infraestrutura/infra-cost-table";
import { InfraChart } from "@/components/infraestrutura/infra-chart";

export default async function InfraestruturaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user!.id)
    .single();

  const orgId = member?.org_id;

  if (!orgId) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-slate-400">Nenhuma organização vinculada.</p>
      </div>
    );
  }

  const [{ data: resources }, { data: projects }] = await Promise.all([
    supabase
      .from("infra_resources")
      .select("*")
      .eq("org_id", orgId)
      .order("cost_monthly", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name")
      .eq("org_id", orgId)
      .order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Infraestrutura</h1>
        <p className="text-sm text-slate-400 mt-1">
          Recursos de infraestrutura por projeto e custo mensal
        </p>
      </div>

      <InfraKPICards resources={resources ?? []} />

      <InfraChart resources={resources ?? []} />

      <InfraCostTable resources={resources ?? []} projects={projects ?? []} />
    </div>
  );
}
