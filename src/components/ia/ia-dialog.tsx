"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAiUsageAction } from "@/lib/actions/ai-usage";
import { Plus } from "lucide-react";
import type { AiModel, Project } from "@/types/database";

interface ModelWithProvider extends AiModel {
  ai_providers?: { name: string };
}

export function IADialog({ projects, models }: { projects: Pick<Project, "id" | "name">[]; models: AiModel[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createAiUsageAction(new FormData(e.currentTarget));
    if (result.error) { setError(result.error); setLoading(false); }
    else { setOpen(false); setLoading(false); }
  }

  const modelOptions = models as ModelWithProvider[];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" /> Registrar
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Uso de IA</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ia_project">Projeto</Label>
            <Select name="project_id">
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectPopover>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectPopover>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ia_model">Modelo</Label>
            <Select name="model_id">
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectPopover>
                {modelOptions.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.ai_providers?.name ?? "—"})
                  </SelectItem>
                ))}
              </SelectPopover>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ia_tokens_in">Tokens Entrada</Label>
              <Input id="ia_tokens_in" name="tokens_in" type="number" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_tokens_out">Tokens Saída</Label>
              <Input id="ia_tokens_out" name="tokens_out" type="number" min="0" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ia_cost">Custo (R$)</Label>
              <Input id="ia_cost" name="cost" type="number" step="0.000001" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_latency">Latência (ms)</Label>
              <Input id="ia_latency" name="latency_ms" type="number" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ia_quality">Qualidade (1-5)</Label>
              <Input id="ia_quality" name="quality_score" type="number" min="1" max="5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_hours">Horas Salvas</Label>
              <Input id="ia_hours" name="time_saved_hours" type="number" step="0.5" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia_result">Resultado</Label>
              <Select name="result">
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectPopover>
                  <SelectItem value="">—</SelectItem>
                  <SelectItem value="accepted">Aceito</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                  <SelectItem value="modified">Modificado</SelectItem>
                </SelectPopover>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ia_rework" name="rework" value="true" className="rounded border-slate-700 bg-slate-900 accent-indigo-500" />
            <Label htmlFor="ia_rework" className="text-sm">Houve retrabalho</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ia_notes">Observações</Label>
            <Input id="ia_notes" name="notes" />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Registrar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
