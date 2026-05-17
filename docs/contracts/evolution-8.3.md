# Evolution API — Contrato Técnico (Fase 8.3)

Contrato entre Agente 1 (Fase 8.3A — fundação) e Agente 2 (Fase 8.3B — envio/UI/webhook).

## Migration

- `supabase/migrations/014_evolution_api_foundation.sql`
- Pode ser aplicada com `supabase db reset` ou via push para projeto remoto.

## Tabelas criadas

### `evolution_configs`

Uma config por organização (`unique(org_id)`).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK |
| `org_id` | `uuid` | FK organizations(id), unique |
| `instance_url` | `text` | URL do servidor Evolution. Não vazio |
| `api_key_encrypted` | `text` | AES-256-GCM. Nunca expor para client |
| `webhook_secret_encrypted` | `text` | AES-256-GCM. Nunca expor para client |
| `enabled` | `boolean` | Default `true` |
| `created_by` | `uuid?` | FK profiles(user_id), nullable |
| `created_at` | `timestamptz` | default now() |
| `updated_at` | `timestamptz` | trigger `update_updated_at()` |

### `evolution_message_logs`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK |
| `org_id` | `uuid` | FK organizations(id) |
| `config_id` | `uuid?` | FK evolution_configs(id) `on delete set null` |
| `to_phone` | `text` | Destinatário. Não vazio |
| `message` | `text` | Corpo. Não vazio |
| `status` | enum `evolution_message_status` | `pending`, `sent`, `failed`, `rate_limited` |
| `external_id` | `text?` | ID retornado pelo Evolution |
| `error_message` | `text?` | Mensagem de erro do provider |
| `created_by` | `uuid?` | FK profiles(user_id) |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | trigger |

## Status enum

```ts
type EvolutionMessageStatus = "pending" | "sent" | "failed" | "rate_limited";
```

Importável de `@/lib/server/evolution-types`.

## RLS

Apenas `admin` e `socio` da própria organização leem/inserem/editam.
`financeiro`, `gerente`, `dev` — sem acesso a nenhuma das duas tabelas.
Nunca `USING (true)`. Reusa helper `is_admin_or_socio(org_id)` do `001_foundation.sql`.

`DELETE` em `evolution_configs` permitido para admin/socio.
`DELETE` em `evolution_message_logs` não tem policy — logs são imutáveis pelo usuário.

## Audit

Triggers `audit_trigger('evolution_configs_modified')` e `audit_trigger('evolution_message_logs_modified')` ativos em INSERT/UPDATE/DELETE.

## Env necessária

```env
EVOLUTION_ENCRYPTION_KEY=<base64 de 32 bytes>
```

- Server-only. **Nunca usar `NEXT_PUBLIC_`.**
- Gerar: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Módulos server-only disponíveis

### `@/lib/server/evolution-crypto`

```ts
encryptSecret(value: string): string
decryptSecret(value: string): string
compareSecrets(a: string, b: string): boolean  // timing-safe
```

Algoritmo: AES-256-GCM. IV aleatório de 12 bytes, auth tag de 16 bytes, payload base64.

### `@/lib/server/evolution-config-repository`

```ts
getEvolutionConfigForOrg(orgId): Promise<EvolutionConfigRow | null>
getSanitizedEvolutionConfigForOrg(orgId): Promise<SanitizedEvolutionConfig | null>
upsertEvolutionConfig(input: UpsertEvolutionConfigInput): Promise<SanitizedEvolutionConfig>
setEvolutionConfigEnabled(orgId, enabled): Promise<SanitizedEvolutionConfig | null>
deleteEvolutionConfigForOrg(orgId): Promise<void>
getDecryptedEvolutionSecretsForOrg(orgId): Promise<DecryptedEvolutionSecrets | null>
```

- `getSanitizedEvolutionConfigForOrg` retorna sem `api_key_encrypted`/`webhook_secret_encrypted`. Use para UI/server actions visíveis.
- `getDecryptedEvolutionSecretsForOrg` retorna segredos descriptografados. **Uso exclusivamente server-side para chamar Evolution API.** Nunca propagar para client.
- `upsertEvolutionConfig` recebe `api_key` e `webhook_secret` em plaintext, criptografa antes de gravar.

### `@/lib/server/evolution-types`

Tipos compartilhados:

```ts
EvolutionMessageStatus
EvolutionConfigRow
SanitizedEvolutionConfig
DecryptedEvolutionSecrets
UpsertEvolutionConfigInput
EvolutionMessageLogRow
InsertEvolutionMessageLogInput
UpdateEvolutionMessageLogInput
```

## O que o Agente 2 pode importar

- `@/lib/server/evolution-config-repository` (todas as funções)
- `@/lib/server/evolution-crypto` (apenas dentro de Server Actions ou Route Handlers)
- `@/lib/server/evolution-types` (tipos)

## O que NUNCA deve ser exposto para UI/client

- `api_key_encrypted` / `webhook_secret_encrypted` (já criptografados — mas mesmo assim não enviar)
- Plaintext `api_key` / `webhook_secret`
- `EVOLUTION_ENCRYPTION_KEY` (env)
- Quaisquer funções de `evolution-crypto` em código client (`"use client"`)

## Responsabilidades do Agente 2 (8.3B)

- `src/lib/server/evolution-service.ts` — wrapper HTTP para Evolution API
- `src/lib/server/evolution-rate-limit.ts` — rate limit antes de enviar
- `src/lib/server/evolution-message-service.ts` — orquestra: lê config → chama service → grava log
- `src/lib/actions/evolution.ts` — server action de envio
- `src/app/(authenticated)/app/integracoes/evolution/page.tsx` — UI de configuração + envio
- `src/components/evolution/*` — UI
- `src/app/api/webhooks/evolution/route.ts` — webhook inbound (assinatura via `webhook_secret`)

Não tocar em nada do Agente 1.
