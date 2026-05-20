import "server-only";
import type { WhatsAppCommandIntent } from "@/lib/validations/whatsapp-commands";

// ---------------------------------------------------------------------------
// Parser: extrai dados estruturados da mensagem usando regex + heurísticas
// ---------------------------------------------------------------------------

export interface ParsedFields {
  [key: string]: string | number | null;
}

// ---------------------------------------------------------------------------
// Extratores genéricos
// ---------------------------------------------------------------------------

function extractAmount(message: string): number | null {
  // R$ 2500, R$ 97,90, 2500 reais, 97.90
  const m1 = message.match(/R\$\s*([\d.,]+)/i);
  if (m1) return parseAmount(m1[1]);

  const m2 = message.match(/valor\s*(de\s*)?R?\$?\s*([\d.,]+)/i);
  if (m2) return parseAmount(m2[2]);

  const m3 = message.match(/(\d+[\.,]\d{2})\s*(reais|brl|r\$)?/i);
  if (m3) return parseAmount(m3[1]);

  const m4 = message.match(/(\d+)\s*(reais|brl)/i);
  if (m4) return parseInt(m4[1], 10);

  return null;
}

function parseAmount(raw: string): number {
  // "2.500,00" → 2500, "97,90" → 97.90, "97.90" → 97.90
  const cleaned = raw.replace(/\s/g, "");
  if (cleaned.includes(",") && cleaned.includes(".")) {
    // formato brasileiro: 2.500,00
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(",", "."));
  }
  return parseFloat(cleaned);
}

function extractHours(message: string): number | null {
  const m1 = message.match(/(\d+)\s*(hora|hrs|horas|h)\b/i);
  if (m1) return parseInt(m1[1], 10);

  const m2 = message.match(/(\d+[.,]\d)\s*(hora|hrs|horas|h)\b/i);
  if (m2) return parseFloat(m2[1].replace(",", "."));

  const m3 = message.match(/trabalhei\s+(\d+)/i);
  if (m3) return parseInt(m3[1], 10);

  const m4 = message.match(/lancei\s+(\d+)/i);
  if (m4) return parseInt(m4[1], 10);

  return null;
}

function extractNameAfter(message: string, prefix: string): string | null {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s+([A-ZÀ-Ú][^,.]+(?:\s+[A-ZÀ-Ú][^,.]+)*)`, "i");
  const m = message.match(re);
  return m ? m[1].trim() : null;
}

function extractDate(message: string): string | null {
  // "prazo sexta", "até amanhã", "para 25/05", "dia 25"
  const today = new Date();

  if (/amanhã/i.test(message)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  if (/hoje/i.test(message)) {
    return today.toISOString().split("T")[0];
  }

  const dayNames: Record<string, number> = {
    domingo: 0, segunda: 1, terça: 2, quarta: 3, quinta: 4, sexta: 5, sábado: 6,
  };

  for (const [name, day] of Object.entries(dayNames)) {
    if (message.toLowerCase().includes(name)) {
      const d = new Date(today);
      const currentDay = d.getDay();
      let diff = day - currentDay;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      return d.toISOString().split("T")[0];
    }
  }

  const m = message.match(/(\d{2})[\/\-](\d{2})(?:\/\d{4})?/);
  if (m) {
    const year = today.getFullYear();
    return `${year}-${m[2]}-${m[1]}`;
  }

  return null;
}

function extractPriority(message: string): "baixa" | "media" | "alta" | "critica" | null {
  const lower = message.toLowerCase();
  if (/urgente|crítica|critica|crítico|critico|emergência/i.test(lower)) return "critica";
  if (/alta|alto|importante/i.test(lower)) return "alta";
  if (/baixa|baixo|tranquilo/i.test(lower)) return "baixa";
  return null;
}

// ---------------------------------------------------------------------------
// Parser por intent
// ---------------------------------------------------------------------------

export function parsePayload(message: string, intent: WhatsAppCommandIntent): ParsedFields {
  switch (intent) {
    case "create_client":
      return parseCreateClient(message);
    case "create_project":
      return parseCreateProject(message);
    case "create_task":
      return parseCreateTask(message);
    case "update_task_status":
      return parseUpdateTaskStatus(message);
    case "add_time_entry":
      return parseAddTimeEntry(message);
    case "create_delivery":
      return parseCreateDelivery(message);
    case "create_revenue":
      return parseCreateRevenue(message);
    case "create_cost":
      return parseCreateCost(message);
    case "create_infra_resource":
      return parseCreateInfraResource(message);
    default:
      return {};
  }
}

function parseCreateClient(message: string): ParsedFields {
  const name = extractNameAfter(message, "cliente (?:chamado|chamada)") ||
    extractNameAfter(message, "cria(?:r)? cliente") ||
    extractNameAfter(message, "novo cliente") ||
    extractNameAfter(message, "cadastrar cliente");

  const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = message.match(/(\d{2}\s?\d{4,5}[-\s]?\d{4})/);

  return {
    name: name || null,
    email: emailMatch ? emailMatch[1] : null,
    phone: phoneMatch ? phoneMatch[0].replace(/\s/g, "") : null,
  };
}

function parseCreateProject(message: string): ParsedFields {
  const name = extractNameAfter(message, "projeto (?:chamado|chamada)") ||
    extractNameAfter(message, "cria(?:r)? projeto") ||
    extractNameAfter(message, "novo projeto");

  const clientName = extractNameAfter(message, "para (?:o |a )?(?:cliente )?");
  const amount = extractAmount(message);
  const deadline = extractDate(message);

  const descMatch = message.match(/(?:descrição|descricao|desc)\s*:?\s*["""]?([^"""]+)["""]?/i);

  return {
    name: name || null,
    client_name: clientName || null,
    budget: amount,
    deadline,
    description: descMatch ? descMatch[1].trim() : null,
  };
}

function parseCreateTask(message: string): ParsedFields {
  const title = extractNameAfter(message, "tarefa (?:chamada|chamado)") ||
    extractNameAfter(message, "cria(?:r)? tarefa") ||
    extractNameAfter(message, "nova tarefa") ||
    extractNameAfter(message, "task:?\\s*");

  const projectName = extractNameAfter(message, "no projeto");
  const assignee = extractNameAfter(message, "para (?:o |a )?");
  const deadline = extractDate(message);
  const priority = extractPriority(message);

  return {
    title: title || message.slice(0, 200),
    project_name: projectName || null,
    assignee_name: assignee || null,
    deadline,
    priority,
    description: null,
  };
}

function parseUpdateTaskStatus(message: string): ParsedFields {
  const taskName = extractNameAfter(message, "tarefa (?:chamada|chamado)");

  const statusKeywords: Record<string, string> = {
    concluída: "done", concluido: "done", pronta: "done", pronto: "done",
    finalizada: "done", finalizado: "done", feito: "done", feita: "done",
    "em andamento": "in_progress", andamento: "in_progress",
    "em revisão": "review", "em revisao": "review", revisão: "review", revisao: "review",
    "a fazer": "todo", backlog: "backlog",
  };

  let newStatus = "done"; // default: concluído
  const lower = message.toLowerCase();
  for (const [kw, status] of Object.entries(statusKeywords)) {
    if (lower.includes(kw)) { newStatus = status; break; }
  }

  return {
    task_name: taskName || null,
    new_status: newStatus,
    comment: null,
  };
}

function parseAddTimeEntry(message: string): ParsedFields {
  const hours = extractHours(message);
  const projectName = extractNameAfter(message, "no projeto") ||
    extractNameAfter(message, "projeto");
  const taskName = extractNameAfter(message, "na tarefa") ||
    extractNameAfter(message, "tarefa");
  const date = extractDate(message);

  // Descrição: o que sobra depois de remover padrões conhecidos
  let description = message
    .replace(/registra(?:r)?\s+(\d+[\.,]?\d*\s*)?(hora|hrs|horas|h)\b/gi, "")
    .replace(/lancei\s+\d+/gi, "")
    .replace(/trabalhei\s+\d+/gi, "")
    .replace(/no projeto\s+\S+/gi, "")
    .replace(/na tarefa\s+\S+/gi, "")
    .trim();

  if (description.length < 3) description = "";

  return {
    hours,
    project_name: projectName || null,
    task_name: taskName || null,
    date,
    description: description || null,
  };
}

function parseCreateDelivery(message: string): ParsedFields {
  const projectName = extractNameAfter(message, "no projeto") ||
    extractNameAfter(message, "para o projeto");
  const date = extractDate(message);

  const urlMatch = message.match(/(https?:\/\/[^\s]+)/);

  return {
    project_name: projectName || null,
    description: message.slice(0, 500),
    link: urlMatch ? urlMatch[1] : null,
    date,
  };
}

function parseCreateRevenue(message: string): ParsedFields {
  const amount = extractAmount(message);
  const projectName = extractNameAfter(message, "no projeto") ||
    extractNameAfter(message, "projeto");
  const clientName = extractNameAfter(message, "do cliente") ||
    extractNameAfter(message, "cliente");
  const date = extractDate(message);

  return {
    amount,
    project_name: projectName || null,
    client_name: clientName || null,
    description: message.slice(0, 300),
    date,
    category: "servico",
  };
}

function parseCreateCost(message: string): ParsedFields {
  const amount = extractAmount(message);
  const projectName = extractNameAfter(message, "no projeto") ||
    extractNameAfter(message, "projeto");
  const date = extractDate(message);

  // Categoria comum
  let category = "outros";
  const lower = message.toLowerCase();
  if (/vercel|hospedagem|domínio|dominio|servidor|cloud|aws/i.test(lower)) category = "infraestrutura";
  if (/software|licença|licenca|ferramenta|api/i.test(lower)) category = "software";
  if (/freela|consultor|terceiro/i.test(lower)) category = "servico_terceiro";

  return {
    amount,
    project_name: projectName || null,
    description: message.slice(0, 300),
    category,
    date,
  };
}

function parseCreateInfraResource(message: string): ParsedFields {
  const name = extractNameAfter(message, "recurso (?:chamado|chamada)") ||
    extractNameAfter(message, "infra");

  const projectName = extractNameAfter(message, "no projeto");
  const amount = extractAmount(message);

  let type: string = "other";
  const lower = message.toLowerCase();
  if (/servidor|server|vps|vm/i.test(lower)) type = "server";
  if (/domínio|dominio|dns/i.test(lower)) type = "cdn";
  if (/banco|database|postgres|mysql/i.test(lower)) type = "database";
  if (/bucket|storage|s3|arquivo/i.test(lower)) type = "storage";
  if (/function|lambda|edge/i.test(lower)) type = "function";
  if (/fila|queue|rabbit|kafka|mensageria/i.test(lower)) type = "queue";

  return {
    name: name || message.slice(0, 100),
    type,
    project_name: projectName || null,
    provider: null,
    cost_monthly: amount || null,
    notes: null,
  };
}
