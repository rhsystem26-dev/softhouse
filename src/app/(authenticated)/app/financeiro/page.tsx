import { createClient } from "@/lib/supabase/server";
import { FinanceiroKPICards } from "@/components/financeiro/financeiro-kpi-cards";
import { FinanceiroChart } from "@/components/financeiro/financeiro-chart";
import { FinanceiroDonut } from "@/components/financeiro/financeiro-donut";
import { FinanceiroTable } from "@/components/financeiro/financeiro-table";

export default async function FinanceiroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user!.id)
    .single();

  const orgId = member?.org_id;
  const canManage = member?.role && ["admin", "socio", "financeiro"].includes(member.role);

  if (!orgId) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-slate-400">Nenhuma organização vinculada.</p>
      </div>
    );
  }

  const [{ data: revenues }, { data: costs }, { data: projects }] = await Promise.all([
    supabase.from("revenues").select("*").eq("org_id", orgId).order("date", { ascending: false }),
    supabase.from("costs").select("*").eq("org_id", orgId).order("date", { ascending: false }),
    supabase.from("projects").select("id, name").eq("org_id", orgId).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Financeiro</h1>
          <p className="text-sm text-slate-400 mt-1">
            Receitas e custos da organização
          </p>
        </div>
      </div>

      <FinanceiroKPICards revenues={revenues ?? []} costs={costs ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinanceiroChart revenues={revenues ?? []} costs={costs ?? []} />
        </div>
        <div>
          <FinanceiroDonut costs={costs ?? []} />
        </div>
      </div>

      <FinanceiroTable
        projects={projects ?? []}
        revenues={revenues ?? []}
        costs={costs ?? []}
        canManage={canManage}
      />
    </div>
  );
}
