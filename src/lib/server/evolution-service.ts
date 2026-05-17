import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  getEvolutionConfigForOrg,
  getSanitizedEvolutionConfigForOrg,
  getDecryptedEvolutionSecretsForOrg,
  upsertEvolutionConfig,
} from "./evolution-config-repository";
import { testEvolutionInstanceStatus, type EvolutionStatusResult } from "./evolution-client";
import { sendMessage, type SendMessageOutcome } from "./evolution-message-service";
import {
  saveEvolutionConfigSchema,
  sendEvolutionMessageSchema,
  type SaveEvolutionConfigInput,
  type SendEvolutionMessageInput,
} from "@/lib/validations/evolution";
import type { SanitizedEvolutionConfig } from "./evolution-types";

const ALLOWED_ROLES = new Set(["admin", "socio"]);

async function requireAdminOrSocio(): Promise<{ orgId: string; userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: member, error } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !member) throw new Error("Sem organizacao vinculada");
  if (!ALLOWED_ROLES.has(member.role)) throw new Error("Sem permissao");

  return { orgId: member.org_id, userId: user.id };
}

export async function handleSaveConfig(
  input: unknown,
): Promise<SanitizedEvolutionConfig> {
  const { orgId, userId } = await requireAdminOrSocio();
  const parsed: SaveEvolutionConfigInput = saveEvolutionConfigSchema.parse(input);

  return upsertEvolutionConfig({
    org_id: orgId,
    instance_url: parsed.instanceUrl,
    api_key: parsed.apiKey,
    webhook_secret: parsed.webhookSecret,
    enabled: parsed.enabled,
    created_by: userId,
  });
}

export async function handleTestConnection(): Promise<EvolutionStatusResult> {
  const { orgId } = await requireAdminOrSocio();
  const secrets = await getDecryptedEvolutionSecretsForOrg(orgId);
  if (!secrets) {
    return { connected: false, error: "Configuracao da Evolution API nao encontrada" };
  }
  if (!secrets.enabled) {
    return { connected: false, error: "Integracao Evolution desabilitada" };
  }

  return testEvolutionInstanceStatus({
    instanceUrl: secrets.instance_url,
    apiKey: secrets.api_key,
  });
}

export async function handleSendMessage(input: unknown): Promise<SendMessageOutcome> {
  const { orgId, userId } = await requireAdminOrSocio();
  const parsed: SendEvolutionMessageInput = sendEvolutionMessageSchema.parse(input);

  return sendMessage({
    orgId,
    userId,
    toPhone: parsed.toPhone,
    message: parsed.message,
  });
}

export async function handleGetConfig(): Promise<SanitizedEvolutionConfig | null> {
  const { orgId } = await requireAdminOrSocio();
  return getSanitizedEvolutionConfigForOrg(orgId);
}

export async function handleGetConfigRaw(): Promise<unknown> {
  const { orgId } = await requireAdminOrSocio();
  return getEvolutionConfigForOrg(orgId);
}
