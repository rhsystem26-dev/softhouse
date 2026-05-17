import "server-only";

export type EvolutionMessageStatus = "pending" | "sent" | "failed" | "rate_limited";

export interface EvolutionConfigRow {
  id: string;
  org_id: string;
  instance_url: string;
  api_key_encrypted: string;
  webhook_secret_encrypted: string;
  enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SanitizedEvolutionConfig {
  id: string;
  org_id: string;
  instance_url: string;
  enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DecryptedEvolutionSecrets {
  api_key: string;
  webhook_secret: string;
  instance_url: string;
  enabled: boolean;
  config_id: string;
}

export interface UpsertEvolutionConfigInput {
  org_id: string;
  instance_url: string;
  api_key: string;
  webhook_secret: string;
  enabled?: boolean;
  created_by?: string | null;
}

export interface EvolutionMessageLogRow {
  id: string;
  org_id: string;
  config_id: string | null;
  to_phone: string;
  message: string;
  status: EvolutionMessageStatus;
  external_id: string | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsertEvolutionMessageLogInput {
  org_id: string;
  config_id: string | null;
  to_phone: string;
  message: string;
  status?: EvolutionMessageStatus;
  external_id?: string | null;
  error_message?: string | null;
  created_by?: string | null;
}

export interface UpdateEvolutionMessageLogInput {
  status?: EvolutionMessageStatus;
  external_id?: string | null;
  error_message?: string | null;
}
