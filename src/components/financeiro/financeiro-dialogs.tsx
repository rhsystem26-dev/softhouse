"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRevenueAction } from "@/lib/actions/revenues";
import { createCostAction } from "@/lib/actions/costs";
import { Plus } from "lucide-react";
import type { Project } from "@/types/database";

export function FinanceiroDialogs({ projects }: { projects: Pick<Project, "id" | "name">[] }) {
  return (
    <div className="flex items-center gap-2">
      <RevenueDialog projects={projects} />
      <CostDialog projects={projects} />
    </div>
  );
}

function RevenueDialog({ projects }: { projects: Pick<Project, "id" | "name">[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createRevenueAction(new FormData(e.currentTarget));
    if (result.error) { setError(result.error); setLoading(false); }
    else { setOpen(false); setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Receita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Receita</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="r_project">Projeto</Label>
            <Select name="project_id">
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectPopover>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectPopover>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="r_amount">Valor (R$)</Label>
            <Input id="r_amount" name="amount" type="number" step="0.01" min="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r_description">Descrição</Label>
            <Input id="r_description" name="description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="r_date">Data</Label>
              <Input id="r_date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r_type">Tipo</Label>
              <Select name="type" defaultValue="servico">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectPopover>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectPopover>
              </Select>
            </div>
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

function CostDialog({ projects }: { projects: Pick<Project, "id" | "name">[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createCostAction(new FormData(e.currentTarget));
    if (result.error) { setError(result.error); setLoading(false); }
    else { setOpen(false); setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Custo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Custo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c_project">Projeto</Label>
            <Select name="project_id">
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectPopover>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectPopover>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c_amount">Valor (R$)</Label>
            <Input id="c_amount" name="amount" type="number" step="0.01" min="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c_description">Descrição</Label>
            <Input id="c_description" name="description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c_date">Data</Label>
              <Input id="c_date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c_category">Categoria</Label>
              <Select name="category" defaultValue="outros">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectPopover>
                  <SelectItem value="ia">IA</SelectItem>
                  <SelectItem value="infra">Infra</SelectItem>
                  <SelectItem value="pessoal">Pessoal</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectPopover>
              </Select>
            </div>
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
