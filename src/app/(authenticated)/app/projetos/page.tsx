import { createClient } from "@/lib/supabase/server";
import { ProjetoView } from "@/components/projetos/projeto-view";
import { ProjetoDialog } from "@/components/projetos/projeto-dialog";
import { Button } from "@/components/ui/button";

export default async function ProjetosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user!.id)
    .single();

  const canManage = member?.role && ["admin", "socio"].includes(member.role);

  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase.from("projects").select("*").eq("org_id", member?.org_id ?? "").order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").eq("org_id", member?.org_id ?? "").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Projetos</h1>
          <p className="text-sm text-slate-400 mt-1">
            {projects?.length ?? 0} projeto(s)
          </p>
        </div>
        {canManage && (
          <ProjetoDialog clients={clients ?? []}>
            <Button variant="default">Novo Projeto</Button>
          </ProjetoDialog>
        )}
      </div>

      <ProjetoView
        projects={projects ?? []}
        clients={clients ?? []}
        canManage={canManage}
      />
    </div>
  );
}
