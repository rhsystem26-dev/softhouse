"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCommandsByOrg, getCommandById, updateCommand } from "@/lib/server/whatsapp-command-repository";
import { executeCommand } from "@/lib/server/whatsapp-command-executor";
import { recordPipelineEvent } from "@/lib/server/whatsapp-audit-service";
// ---------------------------------------------------------------------------
// Server Actions para UI de comandos WhatsApp
// ---------------------------------------------------------------------------

const REVIEW_ROLES = ["admin", "socio"];

export async function getWhatsAppCommandsAction(filters?: {
  intent?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado", commands: [] };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member?.org_id) return { error: "Sem organização", commands: [] };

  const commands = await getCommandsByOrg(member.org_id, filters);
  return { error: null, commands, role: member.role, orgId: member.org_id };
}

export async function approveWhatsAppCommandAction(commandId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !REVIEW_ROLES.includes(member.role)) {
    return { error: "Sem permissão. Apenas admin/socio podem aprovar comandos." };
  }

  const command = await getCommandById(commandId);
  if (!command || command.org_id !== member.org_id) {
    return { error: "Comando não encontrado" };
  }

  if (!["pending_review", "pending_confirmation", "low_confidence"].includes(command.status)) {
    return { error: `Comando não está pendente de revisão (status: ${command.status})` };
  }

  await updateCommand(commandId, {
    status: "approved",
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  });

  await recordPipelineEvent(commandId, "approved", { reviewed_by: user.id }, member.org_id);

  revalidatePath("/app/ia/comandos");
  return { success: true };
}

export async function applyWhatsAppCommandAction(commandId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !REVIEW_ROLES.includes(member.role)) {
    return { error: "Sem permissão. Apenas admin/socio podem aplicar comandos." };
  }

  const command = await getCommandById(commandId);
  if (!command || command.org_id !== member.org_id) {
    return { error: "Comando não encontrado" };
  }

  if (command.status !== "approved") {
    return { error: "Comando precisa ser aprovado antes de aplicar" };
  }

  // Executar
  const result = await executeCommand(
    commandId,
    command.intent,
    command.extracted_payload as Record<string, unknown>,
    member.org_id,
    user.id
  );

  if (result.success) {
    await updateCommand(commandId, {
      status: "applied",
      applied_at: new Date().toISOString(),
      applied_result: result.appliedResult as Record<string, unknown>,
      result_message: result.resultMessage,
    });
    await recordPipelineEvent(commandId, "applied", { result: result.appliedResult }, member.org_id);
    revalidatePath("/app/ia/comandos");
    return { success: true, message: result.resultMessage };
  } else {
    await updateCommand(commandId, {
      status: "failed",
      error_message: result.errorMessage,
    });
    await recordPipelineEvent(commandId, "failed", { error: result.errorMessage }, member.org_id);
    return { error: result.errorMessage };
  }
}

export async function rejectWhatsAppCommandAction(commandId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member || !REVIEW_ROLES.includes(member.role)) {
    return { error: "Sem permissão. Apenas admin/socio podem rejeitar comandos." };
  }

  const command = await getCommandById(commandId);
  if (!command || command.org_id !== member.org_id) {
    return { error: "Comando não encontrado" };
  }

  await updateCommand(commandId, {
    status: "rejected",
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    result_message: "Comando rejeitado manualmente",
  });

  await recordPipelineEvent(commandId, "rejected", { reviewed_by: user.id }, member.org_id);

  revalidatePath("/app/ia/comandos");
  return { success: true };
}

export async function getWhatsAppCommandAction(commandId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado", command: null };

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (!member?.org_id) return { error: "Sem organização", command: null };

  const command = await getCommandById(commandId);
  if (!command || command.org_id !== member.org_id) {
    return { error: "Comando não encontrado", command: null };
  }

  return { error: null, command };
}
