"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTimeEntryAction } from "@/lib/actions/time-entries";
import { Plus } from "lucide-react";
import type { Project } from "@/types/database";

interface MemberInfo {
  user_id: string;
  profiles: { full_name: string }[] | null;
}

export function TempoDialog({ projects, members }: { projects: Pick<Project, "id" | "name">[]; members: MemberInfo[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createTimeEntryAction(new FormData(e.currentTarget));
    if (result.error) { setError(result.error); toast.error(result.error); setLoading(false); }
    else { toast.success("Hora lançada"); setOpen(false); setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" /> Registrar
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Horas</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="t_project">Projeto</Label>
            <Select name="project_id">
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectPopover>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectPopover>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_user">Colaborador</Label>
            <Select name="user_id">
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectPopover>
                {members.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>{m.profiles?.[0]?.full_name ?? m.user_id.slice(0, 8)}</SelectItem>
                ))}
              </SelectPopover>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="t_hours">Horas</Label>
              <Input id="t_hours" name="hours" type="number" step="0.5" min="0.5" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t_date">Data</Label>
              <Input id="t_date" name="date" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_description">Descrição</Label>
            <Input id="t_description" name="description" />
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
