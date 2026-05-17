import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getDecryptedEvolutionSecretsForOrg } from "./evolution-config-repository";
import { sendEvolutionTextMessage, type EvolutionSendResult } from "./evolution-client";
import { checkRateLimit, MAX_MESSAGES_PER_MINUTE } from "./evolution-rate-limit";
import type { EvolutionMessageStatus } from "./evolution-types";

export interface SendMessageOutcome {
  success: boolean;
  error?: string;
  externalId?: string | null;
  logId?: string;
}

interface InternalSendInput {
  orgId: string;
  userId: string;
  toPhone: string;
  message: string;
}

async function insertLog(
  orgId: string,
  configId: string | null,
  userId: string,
  toPhone: string,
  message: string,
  status: EvolutionMessageStatus,
  error_message: string | null,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evolution_message_logs")
    .insert({
      org_id: orgId,
      config_id: configId,
      to_phone: toPhone,
      message,
      status,
      error_message,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error) {
    console.error("Failed to insert evolution_message_log:", error.message);
    return null;
  }
  return data?.id ?? null;
}

async function updateLog(
  id: string,
  status: EvolutionMessageStatus,
  external_id: string | null,
  error_message: string | null,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("evolution_message_logs")
    .update({ status, external_id, error_message, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("Failed to update evolution_message_log:", error.message);
}

export async function sendMessage(input: InternalSendInput): Promise<SendMessageOutcome> {
  const secrets = await getDecryptedEvolutionSecretsForOrg(input.orgId);
  if (!secrets) {
    return { success: false, error: "Configuracao da Evolution API nao encontrada" };
  }
  if (!secrets.enabled) {
    return { success: false, error: "Integracao Evolution desabilitada" };
  }

  const limit = await checkRateLimit(input.orgId);
  if (!limit.allowed) {
    await insertLog(
      input.orgId,
      secrets.config_id,
      input.userId,
      input.toPhone,
      input.message,
      "rate_limited",
      `Limite de ${MAX_MESSAGES_PER_MINUTE} msg/min atingido (atual: ${limit.currentCount})`,
    );
    return {
      success: false,
      error: `Limite de mensagens atingido. Tente novamente em ${limit.retryAfterSeconds} segundos.`,
    };
  }

  const logId = await insertLog(
    input.orgId,
    secrets.config_id,
    input.userId,
    input.toPhone,
    input.message,
    "pending",
    null,
  );

  const result: EvolutionSendResult = await sendEvolutionTextMessage({
    instanceUrl: secrets.instance_url,
    apiKey: secrets.api_key,
    toPhone: input.toPhone,
    message: input.message,
  });

  if (logId) {
    await updateLog(
      logId,
      result.success ? "sent" : "failed",
      result.externalId,
      result.error,
    );
  }

  return {
    success: result.success,
    error: result.error ?? undefined,
    externalId: result.externalId,
    logId: logId ?? undefined,
  };
}
