import "server-only";
import type { WhatsAppCommandIntent, CommandRiskLevel } from "@/lib/validations/whatsapp-commands";
import {
  REQUIRES_CONFIRMATION,
  REQUIRED_FIELDS_MAP,
  INTENT_RISK_MAP,
  INTENT_ROLES_MAP,
} from "@/lib/validations/whatsapp-commands";

// ---------------------------------------------------------------------------
// Serviço de confirmação: decide se comando precisa de aprovação humana
// ---------------------------------------------------------------------------

export interface ConfirmationDecision {
  needsConfirmation: boolean;
  reason: string;
  confirmationMessage: string | null;
  missingFields: string[];
  status: "pending_confirmation" | "pending_review" | "low_confidence" | "approved";
}

/**
 * Decide se um comando precisa de confirmação com base em:
 * 1. Confidence < 0.7 → low_confidence
 * 2. Campos obrigatórios faltando → pending_confirmation
 * 3. Intent requer confirmação (financeiro, etc.) → pending_review
 * 4. Caso contrário → approved (pode aplicar)
 */
export function evaluateConfirmation(
  intent: WhatsAppCommandIntent,
  confidence: number,
  payload: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _userRole?: string
): ConfirmationDecision {
  // Baixa confiança sempre requer confirmação
  if (confidence < 0.7) {
    return {
      needsConfirmation: true,
      reason: `Confiança baixa (${(confidence * 100).toFixed(0)}%). IA não tem certeza da intenção.`,
      confirmationMessage: `Não entendi muito bem. Você quis dizer "${intent.replace(/_/g, " ")}"? Pode confirmar?`,
      missingFields: [],
      status: "low_confidence",
    };
  }

  // Verificar campos obrigatórios
  const requiredFields = REQUIRED_FIELDS_MAP[intent] || [];
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === null || value === undefined || value === "";
  });

  if (missingFields.length > 0) {
    const fieldLabels: Record<string, string> = {
      name: "nome",
      title: "título",
      hours: "horas",
      amount: "valor",
      description: "descrição",
      type: "tipo",
      project_name: "nome do projeto",
      project_id: "projeto",
      new_status: "novo status",
    };

    const missing = missingFields.map((f) => fieldLabels[f] || f).join(", ");

    return {
      needsConfirmation: true,
      reason: `Campos obrigatórios faltando: ${missing}`,
      confirmationMessage: generateMissingFieldsMessage(intent, missingFields),
      missingFields,
      status: "pending_confirmation",
    };
  }

  // Intents que sempre requerem confirmação
  if (REQUIRES_CONFIRMATION.includes(intent)) {
    return {
      needsConfirmation: true,
      reason: `Ação ${intent} requer revisão humana`,
      confirmationMessage: generateConfirmationMessage(intent, payload),
      missingFields: [],
      status: "pending_review",
    };
  }

  // Pode aplicar automaticamente
  return {
    needsConfirmation: false,
    reason: "Ação operacional de baixo risco",
    confirmationMessage: null,
    missingFields: [],
    status: "approved",
  };
}

// ---------------------------------------------------------------------------
// Geração de mensagens de confirmação
// ---------------------------------------------------------------------------

function generateConfirmationMessage(
  intent: WhatsAppCommandIntent,
  payload: Record<string, unknown>
): string {
  switch (intent) {
    case "create_client":
      return `📋 *Novo cliente:*\nNome: ${payload.name || "?"}\nEmail: ${payload.email || "—"}\nTelefone: ${payload.phone || "—"}\n\nPosso cadastrar?`;

    case "create_project":
      return `📁 *Novo projeto:*\nNome: ${payload.name || "?"}\nCliente: ${payload.client_name || "—"}\nOrcamento: ${payload.budget ? `R$ ${payload.budget}` : "—"}\nPrazo: ${payload.deadline || "—"}\n\nConfirmar criação?`;

    case "create_task":
      return `✅ *Nova tarefa:*\n${payload.title || "?"}\nProjeto: ${payload.project_name || "—"}\nResponsável: ${payload.assignee_name || "—"}\nPrazo: ${payload.deadline || "—"}\n\nCriar tarefa?`;

    case "add_time_entry":
      return `⏱ *Registro de horas:*\n${payload.hours}h no projeto ${payload.project_name || "?"}\nData: ${payload.date || "hoje"}\n\nConfirmar lançamento?`;

    case "create_delivery":
      return `📦 *Nova entrega:*\nProjeto: ${payload.project_name || "?"}\nDescrição: ${(payload.description as string)?.slice(0, 100) || "?"}\n\nRegistrar entrega?`;

    case "create_revenue":
      return `💰 *Nova receita:*\nValor: R$ ${payload.amount}\nProjeto: ${payload.project_name || "—"}\nDescrição: ${(payload.description as string)?.slice(0, 100) || "—"}\n\n⚠️ Ação financeira. Confirmar?`;

    case "create_cost":
      return `💸 *Novo custo:*\nValor: R$ ${payload.amount}\nProjeto: ${payload.project_name || "—"}\nDescrição: ${(payload.description as string)?.slice(0, 100) || "—"}\n\n⚠️ Ação financeira. Confirmar?`;

    default:
      return `Confirmar ação "${intent.replace(/_/g, " ")}"?`;
  }
}

function generateMissingFieldsMessage(
  intent: WhatsAppCommandIntent,
  missingFields: string[]
): string {
  const fieldQuestions: Record<string, string> = {
    name: "Qual o nome?",
    title: "Qual o título?",
    hours: "Quantas horas?",
    amount: "Qual o valor?",
    description: "Pode descrever melhor?",
    type: "Qual o tipo?",
    project_name: "Qual o projeto?",
    project_id: "Qual o projeto?",
    new_status: "Qual o novo status?",
    client_name: "Qual o cliente?",
  };

  const questions = missingFields
    .map((f) => fieldQuestions[f] || `Falta informar: ${f}`)
    .join("\n");

  return `Faltam algumas informações:\n${questions}`;
}

// ---------------------------------------------------------------------------
// Helpers exportados
// ---------------------------------------------------------------------------

export function getRiskLevel(intent: WhatsAppCommandIntent): CommandRiskLevel {
  return INTENT_RISK_MAP[intent] || "medium";
}

export function getAllowedRoles(intent: WhatsAppCommandIntent): string[] {
  return INTENT_ROLES_MAP[intent] || [];
}
