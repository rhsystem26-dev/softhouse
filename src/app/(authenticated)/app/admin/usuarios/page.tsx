import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminUsuariosView } from "@/components/admin/admin-usuarios-view";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user!.id)
    .single();

  if (!member || member.role !== "admin") {
    redirect("/app/dashboard");
  }

  const { data: members } = await supabase
    .from("organization_members")
    .select("id, user_id, role, joined_at")
    .eq("org_id", member.org_id)
    .order("joined_at", { ascending: true });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", members?.map((m) => m.user_id) ?? []);

  const enriched = (members ?? []).map((m) => ({
    ...m,
    full_name: profiles?.find((p) => p.user_id === m.user_id)?.full_name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Usuários</h1>
        <p className="text-sm text-slate-400 mt-1">
          {enriched.length} membro(s) na organização
        </p>
      </div>
      <AdminUsuariosView members={enriched} />
    </div>
  );
}
