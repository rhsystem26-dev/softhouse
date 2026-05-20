import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { WhatsAppCommandIntent, CommandStatus } from "@/lib/validations/whatsapp-commands";

// ---------------------------------------------------------------------------
// Repository: CRUD para whatsapp_commands
// ---------------------------------------------------------------------------

export interface InsertCommandParams {
  org_id: string;
  webhook_log_id: string | null;
  from_phone: string;
  intent: WhatsAppCommandIntent;
  status: CommandStatus;
  risk_level: string;
  confidence: number;
  extracted_payload: Record<string, unknown>;
  missing_fields: string[];
  confirmation_message: string | null;
  created_by?: string | null;
}

export interface UpdateCommandParams {
  status?: CommandStatus;
  reviewed_by?: string | null;
  reviewed_at?: string;
  applied_at?: string;
  applied_result?: Record<string, unknown> | null;
  result_message?: string | null;
  error_message?: string | null;
  extracted_payload?: Record<string, unknown>;
  missing_fields?: string[];
  confirmation_message?: string | null;
}

export async function insertCommand(params: InsertCommandParams): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("whatsapp_commands")
    .insert({
      org_id: params.org_id,
      webhook_log_id: params.webhook_log_id,
      from_phone: params.from_phone,
      intent: params.intent,
      status: params.status,
      risk_level: params.risk_level,
      confidence: params.confidence,
      extracted_payload: params.extracted_payload as Record<string, unknown>,
      missing_fields: params.missing_fields as unknown as Record<string, unknown>,
      confirmation_message: params.confirmation_message,
      created_by: params.created_by || null,
    })
    .select("id")
    .single();

  if (error) {
    // Unique violation: já existe comando para este webhook+intent
    if (error.code === "23505") return null;
    throw new Error(`Falha ao inserir comando WhatsApp: ${error.message}`);
  }

  return data.id;
}

export async function updateCommand(id: string, params: UpdateCommandParams): Promise<void> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (params.status !== undefined) updates.status = params.status;
  if (params.reviewed_by !== undefined) updates.reviewed_by = params.reviewed_by;
  if (params.reviewed_at !== undefined) updates.reviewed_at = params.reviewed_at;
  if (params.applied_at !== undefined) updates.applied_at = params.applied_at;
  if (params.applied_result !== undefined) updates.applied_result = params.applied_result;
  if (params.result_message !== undefined) updates.result_message = params.result_message;
  if (params.error_message !== undefined) updates.error_message = params.error_message;
  if (params.extracted_payload !== undefined) updates.extracted_payload = params.extracted_payload;
  if (params.missing_fields !== undefined) updates.missing_fields = params.missing_fields;
  if (params.confirmation_message !== undefined) updates.confirmation_message = params.confirmation_message;

  const { error } = await supabase
    .from("whatsapp_commands")
    .update(updates)
    .eq("id", id);

  if (error) {
    throw new Error(`Falha ao atualizar comando WhatsApp: ${error.message}`);
  }
}

export async function getCommandById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_commands")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getCommandsByOrg(
  orgId: string,
  filters?: { intent?: string; status?: string; limit?: number }
) {
  const supabase = await createClient();
  let query = supabase
    .from("whatsapp_commands")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (filters?.intent) query = query.eq("intent", filters.intent);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.limit) query = query.limit(filters.limit);
  else query = query.limit(50);

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function checkDuplicateCommand(
  webhookLogId: string,
  intent: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("whatsapp_commands")
    .select("id")
    .eq("webhook_log_id", webhookLogId)
    .eq("intent", intent)
    .maybeSingle();

  return data !== null;
}
