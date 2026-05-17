"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProjectAction, updateProjectAction } from "@/lib/actions/projects";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Project, Client } from "@/types/database";

interface ProjetoDialogProps {
  children: ReactNode;
  project?: Project;
  clients: Pick<Client, "id" | "name">[];
}

export function ProjetoDialog({ children, project, clients }: ProjetoDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = project
      ? await updateProjectAction(project.id, formData)
      : await createProjectAction(formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success(project ? "Projeto atualizado" : "Projeto criado");
      setOpen(false);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={project?.name ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" defaultValue={project?.description ?? ""} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente</Label>
            <Select name="client_id" defaultValue={project?.client_id ?? ""}>
              <SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
              <SelectPopover>
                <SelectItem value="">Nenhum</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectPopover>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project?.status ?? "active"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectPopover>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="on_hold">Pausado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectPopover>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input id="budget" name="budget" type="number" step="0.01" defaultValue={project?.budget ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Início</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={project?.start_date ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data Fim</Label>
              <Input id="end_date" name="end_date" type="date" defaultValue={project?.end_date ?? ""} />
            </div>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : project ? "Salvar" : "Criar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
