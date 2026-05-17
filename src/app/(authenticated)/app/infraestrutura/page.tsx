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

  const [{ data: infraCosts }, { data: projects }] = await Promise.all([
    supabase
      .from("costs")
      .select("*")
      .eq("org_id", orgId)
      .eq("category", "infra")
      .order("date", { ascending: false }),
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
          Custos de infraestrutura por projeto e período
        </p>
      </div>

      <InfraKPICards costs={infraCosts ?? []} />

      <InfraChart costs={infraCosts ?? []} />

      <InfraCostTable costs={infraCosts ?? []} projects={projects ?? []} />
    </div>
  );
}
