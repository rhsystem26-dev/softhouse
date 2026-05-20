import { z } from "zod";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export const WHATSAPP_COMMAND_INTENTS = [
  "create_client",
  "create_project",
  "create_task",
  "update_task_status",
  "add_time_entry",
  "create_delivery",
  // "mark_delivery_approved", — futuro
  "create_revenue",
  "create_cost",
  "create_infra_resource",
  "query_project_status",
  "query_financial_summary",
  "query_ai_costs",
  "query_today_tasks",
  "unknown",
] as const;

export type WhatsAppCommandIntent = (typeof WHATSAPP_COMMAND_INTENTS)[number];

export const COMMAND_RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type CommandRiskLevel = (typeof COMMAND_RISK_LEVELS)[number];

export const COMMAND_STATUSES = [
  "pending_confirmation",
  "pending_review",
  "approved",
  "applied",
  "rejected",
  "failed",
  "low_confidence",
] as const;
export type CommandStatus = (typeof COMMAND_STATUSES)[number];

// ---------------------------------------------------------------------------
// Mapa de risco por intent
// ---------------------------------------------------------------------------

export const INTENT_RISK_MAP: Record<WhatsAppCommandIntent, CommandRiskLevel> = {
  create_client: "low",
  create_project: "medium",
  create_task: "low",
  update_task_status: "low",
  add_time_entry: "low",
  create_delivery: "medium",
  create_revenue: "high",
  create_cost: "high",
  create_infra_resource: "medium",
  query_project_status: "low",
  query_financial_summary: "low",
  query_ai_costs: "low",
  query_today_tasks: "low",
  unknown: "low",
};

// ---------------------------------------------------------------------------
// Mapa de roles por intent
// ---------------------------------------------------------------------------

export const INTENT_ROLES_MAP: Record<WhatsAppCommandIntent, string[]> = {
  create_client: ["admin", "socio", "gerente"],
  create_project: ["admin", "socio", "gerente"],
  create_task: ["admin", "socio", "gerente", "dev"],
  update_task_status: ["admin", "socio", "gerente", "dev"],
  add_time_entry: ["admin", "socio", "gerente", "dev"],
  create_delivery: ["admin", "socio", "gerente", "dev"],
  create_revenue: ["admin", "socio", "financeiro"],
  create_cost: ["admin", "socio", "financeiro"],
  create_infra_resource: ["admin", "socio", "gerente"],
  query_project_status: ["admin", "socio", "gerente", "dev"],
  query_financial_summary: ["admin", "socio", "financeiro", "gerente"],
  query_ai_costs: ["admin", "socio", "financeiro"],
  query_today_tasks: ["admin", "socio", "gerente", "dev"],
  unknown: [],
};

// ---------------------------------------------------------------------------
// Intents que exigem confirmação obrigatória
// ---------------------------------------------------------------------------

export const REQUIRES_CONFIRMATION: WhatsAppCommandIntent[] = [
  "create_revenue",
  "create_cost",
  "create_infra_resource",
  "create_client",     // MVP: pede confirmação
  "create_project",    // MVP: pede confirmação
  "create_delivery",   // MVP: pede confirmação
];

// ---------------------------------------------------------------------------
// Intents de consulta (não alteram dados)
// ---------------------------------------------------------------------------

export const QUERY_INTENTS: WhatsAppCommandIntent[] = [
  "query_project_status",
  "query_financial_summary",
  "query_ai_costs",
  "query_today_tasks",
];

// ---------------------------------------------------------------------------
// Schemas Zod por intent
// ---------------------------------------------------------------------------

export const createClientPayloadSchema = z.object({
  name: z.string().min(1, "Nome do cliente é obrigatório"),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const createProjectPayloadSchema = z.object({
  name: z.string().min(1, "Nome do projeto é obrigatório"),
  client_name: z.string().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  budget: z.number().positive().optional().nullable(),
  deadline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const createTaskPayloadSchema = z.object({
  title: z.string().min(1, "Título da tarefa é obrigatório"),
  project_name: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  assignee_name: z.string().optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
  deadline: z.string().optional().nullable(),
  priority: z.enum(["baixa", "media", "alta", "critica"]).optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateTaskStatusPayloadSchema = z.object({
  task_name: z.string().optional().nullable(),
  task_id: z.string().uuid().optional().nullable(),
  new_status: z.string().min(1, "Novo status é obrigatório"),
  comment: z.string().optional().nullable(),
});

export const addTimeEntryPayloadSchema = z.object({
  hours: z.number().positive("Horas deve ser positivo"),
  project_name: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  task_name: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const createDeliveryPayloadSchema = z.object({
  project_name: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, "Descrição da entrega é obrigatória"),
  link: z.string().url().optional().nullable(),
  date: z.string().optional().nullable(),
});

export const createRevenuePayloadSchema = z.object({
  amount: z.number().positive("Valor deve ser positivo"),
  project_name: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  client_name: z.string().optional().nullable(),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export const createCostPayloadSchema = z.object({
  amount: z.number().positive("Valor deve ser positivo"),
  project_name: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
});

export const createInfraResourcePayloadSchema = z.object({
  name: z.string().min(1, "Nome do recurso é obrigatório"),
  type: z.enum(["function", "server", "database", "storage", "cdn", "queue", "other"]),
  project_name: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  provider: z.string().optional().nullable(),
  cost_monthly: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const queryPayloadSchema = z.object({
  query_type: z.string().optional().nullable(),
  period: z.string().optional().nullable(),
  project_name: z.string().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Mapa de schemas por intent
// ---------------------------------------------------------------------------

export const PAYLOAD_SCHEMA_MAP: Record<WhatsAppCommandIntent, z.ZodType<unknown> | null> = {
  create_client: createClientPayloadSchema,
  create_project: createProjectPayloadSchema,
  create_task: createTaskPayloadSchema,
  update_task_status: updateTaskStatusPayloadSchema,
  add_time_entry: addTimeEntryPayloadSchema,
  create_delivery: createDeliveryPayloadSchema,
  create_revenue: createRevenuePayloadSchema,
  create_cost: createCostPayloadSchema,
  create_infra_resource: createInfraResourcePayloadSchema,
  query_project_status: queryPayloadSchema,
  query_financial_summary: queryPayloadSchema,
  query_ai_costs: queryPayloadSchema,
  query_today_tasks: queryPayloadSchema,
  unknown: null,
};

// ---------------------------------------------------------------------------
// Campos obrigatórios por intent
// ---------------------------------------------------------------------------

export const REQUIRED_FIELDS_MAP: Record<WhatsAppCommandIntent, string[]> = {
  create_client: ["name"],
  create_project: ["name"],
  create_task: ["title"],
  update_task_status: ["new_status"],
  add_time_entry: ["hours"],
  create_delivery: ["description"],
  create_revenue: ["amount", "description"],
  create_cost: ["amount", "description"],
  create_infra_resource: ["name", "type"],
  query_project_status: [],
  query_financial_summary: [],
  query_ai_costs: [],
  query_today_tasks: [],
  unknown: [],
};

// ---------------------------------------------------------------------------
// Interface do comando
// ---------------------------------------------------------------------------

export interface WhatsAppCommand {
  id: string;
  org_id: string;
  webhook_log_id: string | null;
  from_phone: string;
  intent: WhatsAppCommandIntent;
  status: CommandStatus;
  risk_level: CommandRiskLevel;
  confidence: number;
  extracted_payload: Record<string, unknown>;
  missing_fields: string[];
  confirmation_message: string | null;
  result_message: string | null;
  applied_result: Record<string, unknown> | null;
  error_message: string | null;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}
