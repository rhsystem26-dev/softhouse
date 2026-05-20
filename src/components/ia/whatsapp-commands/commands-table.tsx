"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Play, Eye, Clock, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";
import { approveWhatsAppCommandAction, applyWhatsAppCommandAction, rejectWhatsAppCommandAction } from "@/lib/actions/whatsapp-commands";
import { WhatsAppCommandDetail } from "./command-detail";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WhatsAppCommandsTable({ commands, role }: { commands: any[]; role: string }) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const canReview = ["admin", "socio"].includes(role);

  async function handleApprove(id: string) {
    setSaving(id); setError(null);
    const r = await approveWhatsAppCommandAction(id);
    if (r.error) setError(r.error);
    setSaving(null);
  }

  async function handleApply(id: string) {
    setSaving(id); setError(null);
    const r = await applyWhatsAppCommandAction(id);
    if (r.error) setError(r.error);
    setSaving(null);
  }

  async function handleReject(id: string) {
    setSaving(id); setError(null);
    const r = await rejectWhatsAppCommandAction(id);
    if (r.error) setError(r.error);
    setSaving(null);
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" }> = {
      pending_confirmation: { label: "Aguardando", variant: "warning" },
      pending_review: { label: "Revisão", variant: "warning" },
      low_confidence: { label: "Baixa confiança", variant: "danger" },
      approved: { label: "Aprovado", variant: "info" },
      applied: { label: "Aplicado", variant: "success" },
      rejected: { label: "Rejeitado", variant: "danger" },
      failed: { label: "Falhou", variant: "danger" },
    };
    const m = map[status] || { label: status, variant: "info" as const };
    return <Badge variant={m.variant}>{m.label}</Badge>;
  };

  const riskIcon = (level: string) => {
    switch (level) {
      case "critical": return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />;
      case "high": return <AlertTriangle className="w-3.5 h-3.5 text-warning" />;
      case "medium": return <ShieldCheck className="w-3.5 h-3.5 text-info" />;
      default: return <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const intentLabel = (intent: string) => {
    const map: Record<string, string> = {
      create_client: "Novo cliente",
      create_project: "Novo projeto",
      create_task: "Nova tarefa",
      update_task_status: "Atualizar status",
      add_time_entry: "Registrar horas",
      create_delivery: "Nova entrega",
      create_revenue: "Nova receita",
      create_cost: "Novo custo",
      create_infra_resource: "Nova infra",
      query_project_status: "Consulta projetos",
      query_financial_summary: "Consulta financeiro",
      query_ai_costs: "Consulta custos IA",
      query_today_tasks: "Consulta tarefas",
      unknown: "Desconhecido",
    };
    return map[intent] || intent;
  };

  const isPending = (s: string) => ["pending_review", "pending_confirmation", "low_confidence"].includes(s);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  const selectedCommand = selected ? commands.find((c) => c.id === selected) : null;

  if (commands.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-slate-400 font-medium">Nenhum comando WhatsApp recebido</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Mensagens enviadas via WhatsApp aparecerão aqui após processamento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Data/Hora</TableHead>
              <TableHead>Intenção</TableHead>
              <TableHead className="w-28">Risco</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead>Resumo</TableHead>
              <TableHead className="w-40">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commands.map((cmd) => (
              <TableRow key={cmd.id}>
                <TableCell className="text-xs text-muted-foreground">{fmtDate(cmd.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {cmd.intent?.startsWith("query_") && <DollarSign className="w-3.5 h-3.5 text-info" />}
                    <span className="text-sm font-medium">{intentLabel(cmd.intent)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {riskIcon(cmd.risk_level)}
                    <span className="text-xs text-muted-foreground capitalize">{cmd.risk_level}</span>
                  </div>
                </TableCell>
                <TableCell>{statusBadge(cmd.status)}</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {cmd.confirmation_message || cmd.result_message || cmd.error_message || cmd.extracted_payload?.title || cmd.extracted_payload?.name || cmd.extracted_payload?.description || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setSelected(selected === cmd.id ? null : cmd.id)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {canReview && isPending(cmd.status) && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleApprove(cmd.id)} disabled={saving === cmd.id}>
                          <Check className="w-3.5 h-3.5 text-success" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleReject(cmd.id)} disabled={saving === cmd.id}>
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </>
                    )}
                    {canReview && cmd.status === "approved" && (
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleApply(cmd.id)} disabled={saving === cmd.id}>
                        <Play className="w-3.5 h-3.5 text-success" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCommand && (
        <WhatsAppCommandDetail command={selectedCommand} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
