import { createClient } from "@/lib/supabase/server";
import { DashboardKPICards } from "@/components/dashboard/dashboard-kpi-cards";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { DashboardProjectCards } from "@/components/dashboard/dashboard-project-cards";
import type { DashboardMetrics, ProjectBudgetSummary } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const [{ data: metrics }, { data: budgetData }] = await Promise.all([
    supabase.rpc("get_dashboard_metrics", { p_org_id: orgId }),
    supabase.rpc("get_projects_budget_summary", { p_org_id: orgId }),
  ]);

  const { data: activeProjects } = await supabase
    .from("projects")
    .select("id, name, description, status, start_date, end_date, budget")
    .eq("org_id", orgId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
      </div>

      <DashboardKPICards metrics={metrics ?? null} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardChart data={budgetData ?? []} />
        </div>
        <div className="space-y-4">
          <DashboardProjectCards projects={activeProjects ?? []} />
        </div>
      </div>
    </div>
  );
}
