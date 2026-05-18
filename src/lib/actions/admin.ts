"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type UserRole = "admin" | "socio" | "financeiro" | "gerente" | "dev";

export async function approveUserAction(
  userId: string,
  orgId: string,
  role: UserRole
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  // Verify caller is admin of the org
  const { data: adminMember } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .single();

  if (!adminMember || adminMember.role !== "admin") {
    return { error: "Sem permissão para aprovar usuários" };
  }

  // Update profile to approved
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      approval_status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq("user_id", userId);

  if (profileError) return { error: "Erro ao atualizar perfil" };

  // Insert organization membership
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({ org_id: orgId, user_id: userId, role });

  if (memberError) {
    // If already a member, that's fine
    if (!memberError.message.includes("duplicate") && !memberError.message.includes("unique")) {
      return { error: "Erro ao adicionar membro à organização" };
    }
  }

  revalidatePath("/app/admin/usuarios");
  return {};
}

export async function rejectUserAction(
  userId: string,
  orgId: string,
  reason?: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  // Verify caller is admin of the org
  const { data: adminMember } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .single();

  if (!adminMember || adminMember.role !== "admin") {
    return { error: "Sem permissão para rejeitar usuários" };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      approval_status: "rejected",
      rejected_at: new Date().toISOString(),
      rejection_reason: reason ?? null,
    })
    .eq("user_id", userId);

  if (profileError) return { error: "Erro ao rejeitar usuário" };

  revalidatePath("/app/admin/usuarios");
  return {};
}
