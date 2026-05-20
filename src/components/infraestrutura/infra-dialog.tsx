"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInfraResourceAction } from "@/lib/actions/infra-resources";
import { Plus } from "lucide-react";
import type { Project } from "@/types/database";

export function InfraDialog({ projects }: { projects: Pick<Project, "id" | "name">[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createInfraResourceAction(new FormData(e.currentTarget));
    if (result.error) { setError(result.error); setLoading(false); }
    else { setOpen(false); setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo Recurso</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="i_project">Projeto</Label>
            <Select name="project_id">
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectPopover>
                {projects.length === 0 ? <SelectItem value="" disabled>Nenhum projeto cadastrado</SelectItem> : projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectPopover>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="i_name">Nome</Label>
            <Input id="i_name" name="name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="i_type">Tipo</Label>
              <Select name="type" defaultValue="other">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectPopover>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="cdn">CDN</SelectItem>
                  <SelectItem value="function">Function</SelectItem>
                  <SelectItem value="queue">Queue</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectPopover>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="i_provider">Provider</Label>
              <Input id="i_provider" name="provider" placeholder="AWS, Vercel..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="i_cost">Custo Mensal (R$)</Label>
            <Input id="i_cost" name="cost_monthly" type="number" step="0.01" min="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="i_notes">Observacoes</Label>
            <Input id="i_notes" name="notes" />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Adicionar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
