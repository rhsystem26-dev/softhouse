import "server-only";
import { createClient } from "@/lib/supabase/server";
import { encryptSecret, decryptSecret } from "./evolution-crypto";
import type {
  DecryptedEvolutionSecrets,
  EvolutionConfigRow,
  SanitizedEvolutionConfig,
  UpsertEvolutionConfigInput,
} from "./evolution-types";

const TABLE = "evolution_configs";

function sanitize(row: EvolutionConfigRow): SanitizedEvolutionConfig {
  return {
    id: row.id,
    org_id: row.org_id,
    instance_url: row.instance_url,
    enabled: row.enabled,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getEvolutionConfigForOrg(orgId: string): Promise<EvolutionConfigRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("org_id", orgId)
    .maybeSingle();

  if (error) throw new Error(`Evolution config fetch failed: ${error.message}`);
  return (data as EvolutionConfigRow) ?? null;
}

export async function getSanitizedEvolutionConfigForOrg(
  orgId: string,
): Promise<SanitizedEvolutionConfig | null> {
  const row = await getEvolutionConfigForOrg(orgId);
  return row ? sanitize(row) : null;
}

export async function upsertEvolutionConfig(
  input: UpsertEvolutionConfigInput,
): Promise<SanitizedEvolutionConfig> {
  if (!input.org_id) throw new Error("upsertEvolutionConfig: org_id required");
  if (!input.instance_url || input.instance_url.trim().length === 0) {
    throw new Error("upsertEvolutionConfig: instance_url required");
  }
  if (!input.api_key || input.api_key.length === 0) {
    throw new Error("upsertEvolutionConfig: api_key required");
  }
  if (!input.webhook_secret || input.webhook_secret.length === 0) {
    throw new Error("upsertEvolutionConfig: webhook_secret required");
  }

  const supabase = await createClient();
  const payload = {
    org_id: input.org_id,
    instance_url: input.instance_url.trim(),
    api_key_encrypted: encryptSecret(input.api_key),
    webhook_secret_encrypted: encryptSecret(input.webhook_secret),
    enabled: input.enabled ?? true,
    created_by: input.created_by ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "org_id" })
    .select("*")
    .single();

  if (error) throw new Error(`Evolution config upsert failed: ${error.message}`);
  return sanitize(data as EvolutionConfigRow);
}

export async function setEvolutionConfigEnabled(
  orgId: string,
  enabled: boolean,
): Promise<SanitizedEvolutionConfig | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("org_id", orgId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(`Evolution config toggle failed: ${error.message}`);
  return data ? sanitize(data as EvolutionConfigRow) : null;
}

export async function deleteEvolutionConfigForOrg(orgId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).delete().eq("org_id", orgId);
  if (error) throw new Error(`Evolution config delete failed: ${error.message}`);
}

export async function getDecryptedEvolutionSecretsForOrg(
  orgId: string,
): Promise<DecryptedEvolutionSecrets | null> {
  const row = await getEvolutionConfigForOrg(orgId);
  if (!row) return null;

  return {
    config_id: row.id,
    instance_url: row.instance_url,
    enabled: row.enabled,
    api_key: decryptSecret(row.api_key_encrypted),
    webhook_secret: decryptSecret(row.webhook_secret_encrypted),
  };
}
