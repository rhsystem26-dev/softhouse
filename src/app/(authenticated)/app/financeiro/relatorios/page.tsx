import { createClient } from "@/lib/supabase/server";
import { RelatoriosTable } from "@/components/financeiro/relatorios-table";

export default async function RelatoriosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user!.id)
    .single();

  const orgId = member?.org_id;

  const [{ data: revenues }, { data: costs }, { data: projects }] = await Promise.all([
    supabase.from("revenues").select("*").eq("org_id", orgId ?? "").order("date", { ascending: false }),
    supabase.from("costs").select("*").eq("org_id", orgId ?? "").order("date", { ascending: false }),
    supabase.from("projects").select("id, name").eq("org_id", orgId ?? "").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Relatórios Financeiros</h1>
        <p className="text-sm text-slate-400 mt-1">
          Visão detalhada de receitas e custos
        </p>
      </div>

      <RelatoriosTable
        projects={projects ?? []}
        revenues={revenues ?? []}
        costs={costs ?? []}
      />
    </div>
  );
}
