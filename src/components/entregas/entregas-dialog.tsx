"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDeliveryAction } from "@/lib/actions/deliveries";
import { Plus } from "lucide-react";
import type { Project } from "@/types/database";

interface MemberInfo {
  user_id: string;
  profiles: { full_name: string }[] | null;
}

export function EntregasDialog({ projects, members }: { projects: Pick<Project, "id" | "name">[]; members: MemberInfo[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createDeliveryAction(new FormData(e.currentTarget));
    if (result.error) { setError(result.error); setLoading(false); }
    else { setOpen(false); setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nova
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Entrega</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="d_project">Projeto</Label>
            <Select name="project_id">
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectPopover>
                {projects.length === 0 ? <SelectItem value="" disabled>Nenhum projeto cadastrado</SelectItem> : projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectPopover>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_title">Título</Label>
            <Input id="d_title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_description">Descrição</Label>
            <Input id="d_description" name="description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="d_status">Status</Label>
              <Select name="status" defaultValue="backlog">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectPopover>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                </SelectPopover>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d_due_date">Prazo</Label>
              <Input id="d_due_date" name="due_date" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_assignee">Responsável</Label>
            <Select name="assignee_id">
              <SelectTrigger><SelectValue placeholder="Não atribuído" /></SelectTrigger>
              <SelectPopover>
                <SelectItem value="">Não atribuído</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>{m.profiles?.[0]?.full_name ?? m.user_id.slice(0, 8)}</SelectItem>
                ))}
              </SelectPopover>
            </Select>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Criar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
