import { createClient } from "@/lib/supabase/server";
import { IAKpiCards } from "@/components/ia/ia-kpi-cards";
import { IAModelCards } from "@/components/ia/ia-model-cards";
import { IATokensChart } from "@/components/ia/ia-tokens-chart";
import { IAUsageTable } from "@/components/ia/ia-usage-table";
import { IAScoreExplainer } from "@/components/ia/ia-score-explainer";

export default async function IAPage() {
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

  const [{ data: usage }, { data: models }, { data: projects }] = await Promise.all([
    supabase.from("ai_usage").select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
    supabase.from("ai_models").select("*, ai_providers(name)").order("name"),
    supabase.from("projects").select("id, name").eq("org_id", orgId).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">IAs e Tokens</h1>
          <p className="text-sm text-slate-400 mt-1">
            Performance e consumo de inteligência artificial
          </p>
        </div>
      </div>

      <IAKpiCards usage={usage ?? []} />

      <IAModelCards usage={usage ?? []} models={models ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IATokensChart usage={usage ?? []} models={models ?? []} />
        </div>
        <div>
          <IAScoreExplainer />
        </div>
      </div>

      <IAUsageTable
        usage={usage ?? []}
        projects={projects ?? []}
        models={models ?? []}
        canManage={canManage}
      />
    </div>
  );
}
