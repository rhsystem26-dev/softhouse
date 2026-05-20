import "server-only";
import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/server/safe-log";

// ---------------------------------------------------------------------------
// Serviço de auditoria para comandos WhatsApp
// Registra toda ação aplicada no audit_logs
// ---------------------------------------------------------------------------

export async function recordCommandAudit(
  commandId: string,
  tableName: string,
  recordId: string,
  action: "insert" | "update" | "delete",
  payload: Record<string, unknown>,
  userId: string,
  orgId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from("audit_logs").insert({
      org_id: orgId,
      user_id: userId,
      action: `whatsapp_command:${action}`,
      table_name: tableName,
      record_id: recordId,
      old_data: null,
      new_data: {
        command_id: commandId,
        channel: "whatsapp",
        action,
        table: tableName,
        ...payload,
      },
    });
  } catch (err: unknown) {
    // Audit failure is non-blocking — log and continue
    const message = err instanceof Error ? err.message : "unknown";
    safeError("WhatsApp command audit failed", { commandId, tableName, recordId, action, error: message });
  }
}

/**
 * Registra evento de pipeline (sem ação aplicada) — classificação, confirmação, rejeição
 */
export async function recordPipelineEvent(
  commandId: string,
  event: string,
  details: Record<string, unknown>,
  orgId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from("audit_logs").insert({
      org_id: orgId,
      user_id: null,
      action: `whatsapp_pipeline:${event}`,
      table_name: "whatsapp_commands",
      record_id: commandId,
      old_data: null,
      new_data: {
        command_id: commandId,
        channel: "whatsapp",
        event,
        ...details,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    safeError("WhatsApp pipeline audit failed", { commandId, event, error: message });
  }
}
