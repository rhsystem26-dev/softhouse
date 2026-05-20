import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsuariosTable } from "@/components/admin/usuarios-table";
import { safeError } from "@/lib/server/safe-log";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("organization_members").select("org_id, role").eq("user_id", user.id).single();

  if (!member || member.role !== "admin") {
    return <div className="flex items-center justify-center py-16"><p className="text-slate-400">Acesso restrito a administradores.</p></div>;
  }

  // Membros atuais — query sem profiles embed (evita RLS re-entrancy)
  const { data: memberRows, error: memberError } = await supabase.from("organization_members").select("id, user_id, role, joined_at").eq("org_id", member.org_id).order("role").order("joined_at");

  if (memberError) {
    safeError("Erro ao consultar membros", memberError);
  }

  // Query profiles separately
  interface MemberRow { id: string; user_id: string; role: string; joined_at: string }
  interface ProfileRow { user_id: string; full_name: string | null }
  const rawMembers = (memberRows ?? []) as MemberRow[];
  const members: { id: string; user_id: string; role: string; joined_at: string; profiles: { full_name: string }[] | null }[] = rawMembers.map((m) => ({ ...m, profiles: null }));
  if (rawMembers.length > 0) {
    const userIds = rawMembers.map((m) => m.user_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
    const profileMap = new Map((profiles ?? []).map((p: ProfileRow) => [p.user_id, { full_name: p.full_name ?? "" }]));
    for (const m of members) {
      if (profileMap.has(m.user_id)) m.profiles = [profileMap.get(m.user_id)!];
    }
  }

  // Pendentes: profiles com approval_status=pending
  const { data: pending } = await supabase.from("profiles").select("user_id, full_name, approval_status, created_at").eq("approval_status", "pending").order("created_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Usuários</h1>
        <p className="text-sm text-slate-400 mt-1">Gestão de membros da organização</p>
      </div>
      <UsuariosTable members={members} pending={pending ?? []} orgId={member.org_id} />
    </div>
  );
}
