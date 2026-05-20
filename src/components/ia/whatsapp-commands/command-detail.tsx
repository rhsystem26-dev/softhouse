"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Phone, AlertTriangle, CheckCircle2, Hash, Clock } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WhatsAppCommandDetail({ command, onClose }: { command: any; onClose: () => void }) {
  const intentLabels: Record<string, string> = {
    create_client: "Novo cliente",
    create_project: "Novo projeto",
    create_task: "Nova tarefa",
    update_task_status: "Atualizar status",
    add_time_entry: "Registrar horas",
    create_delivery: "Nova entrega",
    create_revenue: "Nova receita",
    create_cost: "Novo custo",
    create_infra_resource: "Novo recurso de infra",
    query_project_status: "Consulta projetos",
    query_financial_summary: "Consulta financeiro",
    query_ai_costs: "Consulta custos IA",
    query_today_tasks: "Consulta tarefas do dia",
    unknown: "Desconhecido",
  };

  const riskColors: Record<string, string> = {
    low: "bg-success/10 text-success border-success/20",
    medium: "bg-info/10 text-info border-info/20",
    high: "bg-warning/10 text-warning border-warning/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const statusColors: Record<string, string> = {
    pending_confirmation: "bg-warning/10 text-warning border-warning/20",
    pending_review: "bg-warning/10 text-warning border-warning/20",
    low_confidence: "bg-destructive/10 text-destructive border-destructive/20",
    approved: "bg-info/10 text-info border-info/20",
    applied: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const maskPhone = (phone: string) => {
    if (!phone) return "—";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length <= 4) return "****";
    return "*".repeat(cleaned.length - 4) + cleaned.slice(-4);
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleString("pt-BR") : "—";

  const payload = command.extracted_payload || {};
  const payloadKeys = Object.keys(payload).filter((k) => payload[k] !== null && payload[k] !== undefined && payload[k] !== "");

  return (
    <Card className="p-4 border-border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            {intentLabels[command.intent] || command.intent}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColors[command.risk_level] || ""}`}>
              Risco: {command.risk_level}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[command.status] || ""}`}>
              {command.status}
            </span>
            <span className="text-xs text-muted-foreground">
              Confiança: {(Number(command.confidence) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Origem:</span>
          <span className="font-mono">{maskPhone(command.from_phone)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">ID:</span>
          <span className="font-mono text-xs">{command.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Criado:</span>
          <span>{fmtDate(command.created_at)}</span>
        </div>
        {command.reviewed_at && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Revisado:</span>
            <span>{fmtDate(command.reviewed_at)}</span>
          </div>
        )}
      </div>

      {/* Payload extraído */}
      {payloadKeys.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Dados extraídos:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {payloadKeys.map((key) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="text-sm font-medium">{String(payload[key])}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campos faltantes */}
      {command.missing_fields && Array.isArray(command.missing_fields) && command.missing_fields.length > 0 && (
        <div className="mt-3 flex items-start gap-2 p-2 rounded bg-warning/5 border border-warning/20">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
          <div>
            <p className="text-xs font-medium text-warning">Campos faltantes:</p>
            <p className="text-xs text-muted-foreground">
              {command.missing_fields.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Mensagem de confirmação */}
      {command.confirmation_message && (
        <div className="mt-3 p-3 rounded-lg bg-info/5 border border-info/20">
          <p className="text-xs font-medium text-info mb-1">Mensagem de confirmação:</p>
          <p className="text-sm whitespace-pre-wrap">{command.confirmation_message}</p>
        </div>
      )}

      {/* Resultado */}
      {command.result_message && (
        <div className="mt-3 p-3 rounded-lg bg-success/5 border border-success/20">
          <p className="text-xs font-medium text-success mb-1">Resultado:</p>
          <p className="text-sm whitespace-pre-wrap">{command.result_message}</p>
        </div>
      )}

      {/* Erro */}
      {command.error_message && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <p className="text-xs font-medium text-destructive mb-1">Erro:</p>
          <p className="text-sm text-destructive">{command.error_message}</p>
        </div>
      )}

      {/* Resultado aplicado */}
      {command.applied_result && (
        <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Dados aplicados:</p>
          <pre className="text-xs font-mono overflow-x-auto">
            {JSON.stringify(command.applied_result, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}
