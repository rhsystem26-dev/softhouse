import "server-only";
import type { WhatsAppCommandIntent } from "@/lib/validations/whatsapp-commands";

// ---------------------------------------------------------------------------
// MVP: Classificador heurístico por palavras-chave + regex
// Zero custo de IA. Futuro: LLM para ambiguidade.
// ---------------------------------------------------------------------------

interface ClassificationResult {
  intent: WhatsAppCommandIntent;
  confidence: number;
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Palavras-chave por intent
// ---------------------------------------------------------------------------

type KeywordRule = {
  intent: WhatsAppCommandIntent;
  keywords: string[];
  weight: number; // 1-10, quanto maior mais específico
};

const RULES: KeywordRule[] = [
  // --- Financeiro (mais específico primeiro) ---
  {
    intent: "create_revenue",
    keywords: ["recebemos", "recebi", "faturamento", "faturamos", "cliente pagou", "pagamento recebido",
      "lança receita", "lançar receita", "entrada de", "receita de"],
    weight: 9,
  },
  {
    intent: "create_cost",
    keywords: ["paguei", "pagamos", "custo de", "despesa de", "gasto de", "gas dei",
      "registra custo", "registrar custo", "lança custo", "lançar custo", "saída de", "gastei",
      "comprei", "compramos"],
    weight: 9,
  },
  // --- Infra ---
  {
    intent: "create_infra_resource",
    keywords: ["infra", "infraestrutura", "servidor", "domínio", "hospedagem", "bucket", "cdn",
      "recurso de infra", "registra infra", "novo servidor", "novo domínio"],
    weight: 8,
  },
  // --- Entregas ---
  {
    intent: "create_delivery",
    keywords: ["entrega", "entreguei", "entregamos", "delivery", "entregável", "artefato",
      "registra entrega", "nova entrega", "cliente aprovou", "aprova entrega"],
    weight: 7,
  },
  // --- Tarefas ---
  {
    intent: "create_task",
    keywords: ["cria tarefa", "criar tarefa", "nova tarefa", "nova task", "task:", "tarefa:",
      "tarefa para", "task para", "criar uma tarefa", "cria uma tarefa", "pendência"],
    weight: 6,
  },
  {
    intent: "update_task_status",
    keywords: ["atualiza status", "mudar status", "alterar status", "status da tarefa",
      "mover tarefa", "move tarefa", "concluí a tarefa", "terminei a tarefa",
      "tarefa concluída", "tarefa pronta", "tarefa finalizada"],
    weight: 6,
  },
  // --- Tempo ---
  {
    intent: "add_time_entry",
    keywords: ["registra hora", "registrar hora", "lancei hora", "lançar hora", "trabalhei",
      "horas no projeto", "horas hoje", "registra tempo", "lança hora", "horas trabalhadas",
      "apontei", "registrei"],
    weight: 7,
  },
  // --- Projeto ---
  {
    intent: "create_project",
    keywords: ["cria projeto", "criar projeto", "novo projeto", "projeto para", "projeto novo",
      "abrir projeto", "abre projeto", "projeto chamado"],
    weight: 6,
  },
  // --- Cliente ---
  {
    intent: "create_client",
    keywords: ["cria cliente", "criar cliente", "novo cliente", "cadastrar cliente",
      "cliente chamado", "cliente novo", "cadastra cliente", "registra cliente"],
    weight: 5,
  },
  // --- Consultas ---
  {
    intent: "query_financial_summary",
    keywords: ["quanto gastamos", "quanto faturou", "resumo financeiro", "financeiro do mês",
      "balanço", "faturamento do mês", "custos do mês", "resumo do mês",
      "quanto recebemos", "total de custos", "total de receitas"],
    weight: 8,
  },
  {
    intent: "query_ai_costs",
    keywords: ["gasto de ia", "custo de ia", "quanto gastei de ia", "token ia",
      "gasto com ia", "tokens gastos", "consumo de ia", "ia esse mês"],
    weight: 9,
  },
  {
    intent: "query_project_status",
    keywords: ["projetos em risco", "status do projeto", "como está o projeto",
      "projeto atrasado", "projetos parados", "quais projetos", "andamento do projeto",
      "situação do projeto"],
    weight: 7,
  },
  {
    intent: "query_today_tasks",
    keywords: ["tarefas de hoje", "tarefas do dia", "o que tenho hoje", "tasks hoje",
      "pendências hoje", "minhas tarefas hoje", "o que fazer hoje"],
    weight: 7,
  },
];

// ---------------------------------------------------------------------------
// Padrões regex para extração numérica (reforço de confiança)
// ---------------------------------------------------------------------------

const AMOUNT_PATTERNS = [
  /R\$\s*[\d.,]+/i,
  /(\d+[\.,]\d{2})\s*(reais|brl|r\$)?/i,
  /valor\s*(de\s*)?R?\$?\s*[\d.,]+/i,
];

const HOURS_PATTERNS = [
  /(\d+)\s*(hora|hrs|horas|h)\b/i,
  /(\d+[,.]\d)\s*(hora|hrs|horas|h)\b/i,
];

// ---------------------------------------------------------------------------
// Classificador principal
// ---------------------------------------------------------------------------

export function classifyMessage(message: string): ClassificationResult {
  if (!message || message.trim().length < 2) {
    return { intent: "unknown", confidence: 0, reasoning: "Mensagem vazia ou muito curta" };
  }

  const lower = message.toLowerCase().trim();

  // Noise rápido
  if (/^(ok|👍|😂|blz|valeu|obrigado|thanks|sim|não|nao|yes|no)$/i.test(lower)) {
    return { intent: "unknown", confidence: 0.3, reasoning: "Resposta curta sem contexto operacional" };
  }

  // Scoring: cada keyword match soma weight
  const scores: Record<string, number> = {};
  const matchedReasons: Record<string, string[]> = {};

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        scores[rule.intent] = (scores[rule.intent] || 0) + rule.weight;
        matchedReasons[rule.intent] = matchedReasons[rule.intent] || [];
        matchedReasons[rule.intent].push(kw);
      }
    }
  }

  // Encontrar maior score
  let bestIntent: WhatsAppCommandIntent = "unknown";
  let bestScore = 0;

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as WhatsAppCommandIntent;
    }
  }

  if (bestIntent === "unknown") {
    return { intent: "unknown", confidence: 0.2, reasoning: "Nenhum padrão conhecido detectado" };
  }

  // Calcular confiança: score / max_possible, cap at 0.95
  const maxPossible = RULES.filter((r) => r.intent === bestIntent).reduce((sum, r) => sum + r.weight, 0);
  let confidence = Math.min(bestScore / Math.max(maxPossible, 1), 0.95);

  // Reforço: se tem valor monetário e intent é financeiro, aumenta confiança
  if (["create_revenue", "create_cost", "query_financial_summary"].includes(bestIntent)) {
    if (AMOUNT_PATTERNS.some((p) => p.test(message))) {
      confidence = Math.min(confidence + 0.1, 0.95);
    }
  }

  // Reforço: se tem horas e intent é time_entry
  if (bestIntent === "add_time_entry") {
    if (HOURS_PATTERNS.some((p) => p.test(message))) {
      confidence = Math.min(confidence + 0.1, 0.95);
    }
  }

  const matchedKws = matchedReasons[bestIntent]?.join(", ") || "";
  return {
    intent: bestIntent,
    confidence: Math.round(confidence * 100) / 100,
    reasoning: `Detectado: ${bestIntent} via [${matchedKws}]`,
  };
}
