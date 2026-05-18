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

  const memberUserIds = members?.map((m) => m.user_id) ?? [];

  const { data: memberProfiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, email")
    .in("user_id", memberUserIds.length > 0 ? memberUserIds : ["00000000-0000-0000-0000-000000000000"]);

  const enriched = (members ?? []).map((m) => ({
    ...m,
    full_name: memberProfiles?.find((p) => p.user_id === m.user_id)?.full_name ?? null,
    email: memberProfiles?.find((p) => p.user_id === m.user_id)?.email ?? null,
  }));

  // Query pending users (have profile but no org membership)
  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, created_at")
    .eq("approval_status", "pending");

  // Filter out any that are already members (edge case)
  const memberSet = new Set(memberUserIds);
  const pendingUsers = (pendingProfiles ?? []).filter((p) => !memberSet.has(p.user_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Usuários</h1>
        <p className="text-sm text-slate-400 mt-1">
          {enriched.length} membro(s) na organização
          {pendingUsers.length > 0 && ` · ${pendingUsers.length} aguardando aprovação`}
        </p>
      </div>
      <AdminUsuariosView
        members={enriched}
        pendingUsers={pendingUsers}
        orgId={member.org_id}
      />
    </div>
  );
}
