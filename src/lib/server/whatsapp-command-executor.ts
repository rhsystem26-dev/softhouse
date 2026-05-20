import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { WhatsAppCommandIntent } from "@/lib/validations/whatsapp-commands";
import { safeError } from "@/lib/server/safe-log";
import { recordCommandAudit } from "@/lib/server/whatsapp-audit-service";

// ---------------------------------------------------------------------------
// Executor: aplica comandos aprovados no banco de dados
// ---------------------------------------------------------------------------

export interface ExecutionResult {
  success: boolean;
  resultMessage: string;
  appliedResult: Record<string, unknown> | null;
  errorMessage: string | null;
}

/**
 * Executa um comando WhatsApp aprovado.
 * Não faz verificação de permissão — o caller deve garantir que o comando foi revisado.
 */
export async function executeCommand(
  commandId: string,
  intent: WhatsAppCommandIntent,
  payload: Record<string, unknown>,
  orgId: string,
  userId: string
): Promise<ExecutionResult> {
  try {
    switch (intent) {
      case "create_client":
        return await execCreateClient(payload, orgId, userId, commandId);
      case "create_project":
        return await execCreateProject(payload, orgId, userId, commandId);
      case "create_task":
        return await execCreateTask(payload, orgId, userId, commandId);
      case "update_task_status":
        return await execUpdateTaskStatus(payload, orgId, userId, commandId);
      case "add_time_entry":
        return await execAddTimeEntry(payload, orgId, userId, commandId);
      case "create_delivery":
        return await execCreateDelivery(payload, orgId, userId, commandId);
      case "create_revenue":
        return await execCreateRevenue(payload, orgId, userId, commandId);
      case "create_cost":
        return await execCreateCost(payload, orgId, userId, commandId);
      case "create_infra_resource":
        return await execCreateInfraResource(payload, orgId, userId, commandId);
      default:
        return { success: false, resultMessage: "", appliedResult: null, errorMessage: `Intent não executável: ${intent}` };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    safeError("WhatsApp command execution failed", { commandId, intent, error: message });
    return { success: false, resultMessage: "", appliedResult: null, errorMessage: message };
  }
}

// ---------------------------------------------------------------------------
// Implementações por intent
// ---------------------------------------------------------------------------

async function execCreateClient(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const name = payload.name as string;
  const email = (payload.email as string) || null;
  const phone = (payload.phone as string) || null;

  const { data, error } = await supabase.from("clients").insert({
    org_id: orgId,
    name,
    email,
    phone,
  }).select("id, name").single();

  if (error) return { success: false, resultMessage: "", appliedResult: null, errorMessage: error.message };

  await recordCommandAudit(commandId, "clients", data.id, "insert", { name, email, phone }, userId, orgId);

  return {
    success: true,
    resultMessage: `✅ Cliente *${name}* cadastrado com sucesso!`,
    appliedResult: { id: data.id, name: data.name },
    errorMessage: null,
  };
}

async function execCreateProject(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const name = payload.name as string;
  const description = (payload.description as string) || null;
  const budget = (payload.budget as number) || null;
  const deadline = (payload.deadline as string) || null;

  // Resolver client_id se client_name foi fornecido
  let clientId = (payload.client_id as string) || null;
  const clientName = (payload.client_name as string) || null;
  if (!clientId && clientName) {
    const { data: client } = await supabase.from("clients")
      .select("id").eq("org_id", orgId).ilike("name", `%${clientName}%`).limit(1).single();
    clientId = client?.id || null;
  }

  const { data, error } = await supabase.from("projects").insert({
    org_id: orgId,
    name,
    client_id: clientId,
    description,
    budget: budget ? String(budget) : null,
    deadline,
    status: "active",
  }).select("id, name").single();

  if (error) return { success: false, resultMessage: "", appliedResult: null, errorMessage: error.message };

  await recordCommandAudit(commandId, "projects", data.id, "insert", { name, client_id: clientId, budget, deadline }, userId, orgId);

  return {
    success: true,
    resultMessage: `📁 Projeto *${name}* criado com sucesso!${clientName ? ` (cliente: ${clientName})` : ""}`,
    appliedResult: { id: data.id, name: data.name },
    errorMessage: null,
  };
}

async function execCreateTask(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const title = (payload.title as string) || "Nova tarefa";
  const description = (payload.description as string) || null;
  const priority = (payload.priority as string) || "media";
  const deadline = (payload.deadline as string) || null;

  // Resolver project_id
  let projectId = (payload.project_id as string) || null;
  const projectName = (payload.project_name as string) || null;
  if (!projectId && projectName) {
    const { data: proj } = await supabase.from("projects")
      .select("id").eq("org_id", orgId).ilike("name", `%${projectName}%`).limit(1).single();
    projectId = proj?.id || null;
  }
  if (!projectId) {
    // Fallback: primeiro projeto ativo
    const { data: proj } = await supabase.from("projects")
      .select("id").eq("org_id", orgId).eq("status", "active").limit(1).single();
    projectId = proj?.id || null;
  }

  // Resolver assignee
  let assigneeId = (payload.assignee_id as string) || null;
  const assigneeName = (payload.assignee_name as string) || null;
  if (!assigneeId && assigneeName) {
    const { data: profile } = await supabase.from("profiles")
      .select("user_id").ilike("full_name", `%${assigneeName}%`).limit(1).single();
    assigneeId = profile?.user_id || null;
  }

  // Encontrar primeira coluna do board (Backlog / A Fazer)
  let columnId: string | null = null;
  const { data: board } = await supabase.from("task_boards")
    .select("id").eq("org_id", orgId).limit(1).single();
  if (board) {
    const { data: col } = await supabase.from("task_columns")
      .select("id").eq("board_id", board.id).eq("org_id", orgId).order("position").limit(1).single();
    columnId = col?.id || null;
  }

  const { data, error } = await supabase.from("tasks").insert({
    org_id: orgId,
    column_id: columnId || undefined,
    project_id: projectId,
    title,
    description,
    priority,
    due_date: deadline,
    position: 0,
    created_by: assigneeId || userId,
  }).select("id, title").single();

  if (error) return { success: false, resultMessage: "", appliedResult: null, errorMessage: error.message };

  await recordCommandAudit(commandId, "tasks", data.id, "insert", { title, project_id: projectId, priority, deadline }, userId, orgId);

  return {
    success: true,
    resultMessage: `✅ Tarefa *${title}* criada com sucesso!${projectName ? ` (projeto: ${projectName})` : ""}`,
    appliedResult: { id: data.id, title: data.title },
    errorMessage: null,
  };
}

async function execUpdateTaskStatus(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const newStatus = (payload.new_status as string) || "done";
  const comment = (payload.comment as string) || null;

  // Encontrar task
  let taskId = (payload.task_id as string) || null;
  const taskName = (payload.task_name as string) || null;
  if (!taskId && taskName) {
    const { data: task } = await supabase.from("tasks")
      .select("id").eq("org_id", orgId).ilike("title", `%${taskName}%`).limit(1).single();
    taskId = task?.id || null;
  }
  if (!taskId) {
    return { success: false, resultMessage: "", appliedResult: null, errorMessage: "Tarefa não encontrada. Qual o nome ou ID da tarefa?" };
  }

  // Mapear status para coluna
  const statusColumnMap: Record<string, string> = {
    todo: "A Fazer",
    in_progress: "Em Andamento",
    review: "Revisão",
    done: "Concluído",
    backlog: "Backlog",
  };
  const targetColumnName = statusColumnMap[newStatus] || "Concluído";

  const { data: col } = await supabase.from("task_columns")
    .select("id").eq("org_id", orgId).eq("name", targetColumnName).limit(1).single();

  if (col) {
    await supabase.from("tasks").update({
      column_id: col.id,
      updated_at: new Date().toISOString(),
    }).eq("id", taskId).eq("org_id", orgId);
  }

  // Adicionar comentário se fornecido
  if (comment) {
    await supabase.from("task_comments").insert({
      task_id: taskId,
      user_id: userId,
      content: comment,
    });
  }

  await recordCommandAudit(commandId, "tasks", taskId, "update", { new_status: newStatus, target_column: targetColumnName }, userId, orgId);

  return {
    success: true,
    resultMessage: `✅ Tarefa movida para *${targetColumnName}*!`,
    appliedResult: { task_id: taskId, new_status: newStatus, column: targetColumnName },
    errorMessage: null,
  };
}

async function execAddTimeEntry(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const hours = payload.hours as number;
  const description = (payload.description as string) || null;
  const date = (payload.date as string) || new Date().toISOString().split("T")[0];

  // Resolver project_id
  let projectId = (payload.project_id as string) || null;
  const projectName = (payload.project_name as string) || null;
  if (!projectId && projectName) {
    const { data: proj } = await supabase.from("projects")
      .select("id").eq("org_id", orgId).ilike("name", `%${projectName}%`).limit(1).single();
    projectId = proj?.id || null;
  }
  if (!projectId) {
    const { data: proj } = await supabase.from("projects")
      .select("id").eq("org_id", orgId).eq("status", "active").limit(1).single();
    projectId = proj?.id || null;
  }

  const { data, error } = await supabase.from("time_entries").insert({
    org_id: orgId,
    project_id: projectId,
    user_id: userId,
    hours,
    description,
    date,
  }).select("id").single();

  if (error) return { success: false, resultMessage: "", appliedResult: null, errorMessage: error.message };

  await recordCommandAudit(commandId, "time_entries", data.id, "insert", { hours, project_id: projectId, date, description }, userId, orgId);

  return {
    success: true,
    resultMessage: `⏱ ${hours}h registradas${projectName ? ` no projeto ${projectName}` : ""}!`,
    appliedResult: { id: data.id, hours, project_id: projectId, date },
    errorMessage: null,
  };
}

async function execCreateDelivery(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const description = payload.description as string;
  const link = (payload.link as string) || null;
  const date = (payload.date as string) || new Date().toISOString().split("T")[0];

  let projectId = (payload.project_id as string) || null;
  const projectName = (payload.project_name as string) || null;
  if (!projectId && projectName) {
    const { data: proj } = await supabase.from("projects")
      .select("id").eq("org_id", orgId).ilike("name", `%${projectName}%`).limit(1).single();
    projectId = proj?.id || null;
  }

  const { data, error } = await supabase.from("deliveries").insert({
    org_id: orgId,
    project_id: projectId,
    user_id: userId,
    description,
    link,
    date,
    status: "pending",
  }).select("id").single();

  if (error) return { success: false, resultMessage: "", appliedResult: null, errorMessage: error.message };

  await recordCommandAudit(commandId, "deliveries", data.id, "insert", { description, project_id: projectId, date }, userId, orgId);

  return {
    success: true,
    resultMessage: `📦 Entrega registrada com sucesso!${projectName ? ` (projeto: ${projectName})` : ""}`,
    appliedResult: { id: data.id, project_id: projectId },
    errorMessage: null,
  };
}

async function execCreateRevenue(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const amount = payload.amount as number;
  const description = payload.description as string;
  const category = (payload.category as string) || "servico";
  const date = (payload.date as string) || new Date().toISOString().split("T")[0];

  let projectId = (payload.project_id as string) || null;
  const projectName = (payload.project_name as string) || null;
  if (!projectId && projectName) {
    const { data: proj } = await supabase.from("projects")
      .select("id").eq("org_id", orgId).ilike("name", `%${projectName}%`).limit(1).single();
    projectId = proj?.id || null;
  }

  const { data, error } = await supabase.from("revenues").insert({
    org_id: orgId,
    project_id: projectId,
    amount,
    description,
    category,
    date,
    created_by: userId,
  }).select("id").single();

  if (error) return { success: false, resultMessage: "", appliedResult: null, errorMessage: error.message };

  await recordCommandAudit(commandId, "revenues", data.id, "insert", { amount, description, project_id: projectId, category, date }, userId, orgId);

  return {
    success: true,
    resultMessage: `💰 Receita de R$ ${amount} registrada com sucesso!`,
    appliedResult: { id: data.id, amount, project_id: projectId },
    errorMessage: null,
  };
}

async function execCreateCost(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const amount = payload.amount as number;
  const description = payload.description as string;
  const category = (payload.category as string) || "outros";
  const date = (payload.date as string) || new Date().toISOString().split("T")[0];

  let projectId = (payload.project_id as string) || null;
  const projectName = (payload.project_name as string) || null;
  if (!projectId && projectName) {
    const { data: proj } = await supabase.from("projects")
      .select("id").eq("org_id", orgId).ilike("name", `%${projectName}%`).limit(1).single();
    projectId = proj?.id || null;
  }

  const { data, error } = await supabase.from("costs").insert({
    org_id: orgId,
    project_id: projectId,
    amount,
    description,
    category,
    date,
    created_by: userId,
  }).select("id").single();

  if (error) return { success: false, resultMessage: "", appliedResult: null, errorMessage: error.message };

  await recordCommandAudit(commandId, "costs", data.id, "insert", { amount, description, project_id: projectId, category, date }, userId, orgId);

  return {
    success: true,
    resultMessage: `💸 Custo de R$ ${amount} registrado com sucesso!`,
    appliedResult: { id: data.id, amount, project_id: projectId },
    errorMessage: null,
  };
}

async function execCreateInfraResource(
  payload: Record<string, unknown>, orgId: string, userId: string, commandId: string
): Promise<ExecutionResult> {
  const supabase = await createClient();
  const name = payload.name as string;
  const type = (payload.type as string) || "other";
  const provider = (payload.provider as string) || null;
  const costMonthly = (payload.cost_monthly as number) || null;
  const notes = (payload.notes as string) || null;

  let projectId = (payload.project_id as string) || null;
  const projectName = (payload.project_name as string) || null;
  if (!projectId && projectName) {
    const { data: proj } = await supabase.from("projects")
      .select("id").eq("org_id", orgId).ilike("name", `%${projectName}%`).limit(1).single();
    projectId = proj?.id || null;
  }

  const { data, error } = await supabase.from("infra_resources").insert({
    org_id: orgId,
    project_id: projectId,
    name,
    type,
    provider,
    cost_monthly: costMonthly,
    notes,
  }).select("id").single();

  if (error) return { success: false, resultMessage: "", appliedResult: null, errorMessage: error.message };

  await recordCommandAudit(commandId, "infra_resources", data.id, "insert", { name, type, provider, cost_monthly: costMonthly }, userId, orgId);

  return {
    success: true,
    resultMessage: `🖥 Recurso *${name}* registrado com sucesso!`,
    appliedResult: { id: data.id, name, type },
    errorMessage: null,
  };
}
