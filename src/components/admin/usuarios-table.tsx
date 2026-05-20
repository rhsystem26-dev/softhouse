"use client";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateMemberRoleAction, approveUserAction, rejectUserAction } from "@/lib/actions/admin";
import { Check, X, Clock, UserCheck } from "lucide-react";

interface MemberInfo { id: string; user_id: string; role: string; joined_at: string; profiles: { full_name: string }[] | null }
interface PendingInfo { user_id: string; full_name: string | null; approval_status: string; created_at: string }

const VALID_ROLES = ["admin", "socio", "financeiro", "gerente", "dev"];
const roleLabels: Record<string, string> = { admin: "Admin", socio: "Socio", financeiro: "Financeiro", gerente: "Gerente", dev: "Dev" };
const roleVariants: Record<string, "success" | "warning" | "info"> = { admin: "success", socio: "warning", financeiro: "info", gerente: "info", dev: "info" };

function safeRole(role: string): string {
  return VALID_ROLES.includes(role) ? role : "dev";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UsuariosTable({ members, pending, orgId }: { members: MemberInfo[]; pending: PendingInfo[]; orgId: string }) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});

  async function handleRoleChange(memberId: string, role: string) {
    setSaving(memberId); setError(null);
    const fd = new FormData(); fd.set("member_id", memberId); fd.set("role", role);
    const r = await updateMemberRoleAction(fd);
    if (r.error) setError(r.error);
    setSaving(null);
  }

  async function handleApprove(userId: string, role: string) {
    setSaving(userId); setError(null);
    const fd = new FormData(); fd.set("user_id", userId); fd.set("role", role);
    const r = await approveUserAction(fd);
    if (r.error) setError(r.error);
    setSaving(null);
  }

  async function handleReject(userId: string) {
    setSaving(userId); setError(null);
    const fd = new FormData(); fd.set("user_id", userId);
    const r = await rejectUserAction(fd);
    if (r.error) setError(r.error);
    setSaving(null);
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-4">
      {/* Pendentes */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-warning" />
          <h2 className="text-base font-medium text-foreground">Pendentes ({pending.length})</h2>
        </div>
        {error && <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20"><p className="text-sm text-destructive">{error}</p></div>}
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCheck className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum usuário aguardando aprovação.</p>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nome</TableHead><TableHead>Data</TableHead><TableHead>Role</TableHead><TableHead className="w-40">Aprovar/Rejeitar</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((p) => (
              <TableRow key={p.user_id}>
                <TableCell className="text-foreground">{p.full_name ?? p.user_id.slice(0, 8)}</TableCell>
                <TableCell className="text-muted-foreground">{fmtDate(p.created_at)}</TableCell>
                <TableCell>
                  <Select value={pendingRoles[p.user_id] || "dev"} onValueChange={(v) => setPendingRoles((prev) => ({ ...prev, [p.user_id]: v as string }))} disabled={saving === p.user_id}>
                    <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                    <SelectPopover>
                      {["dev","gerente","financeiro","socio","admin"].map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}
                    </SelectPopover>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleApprove(p.user_id, pendingRoles[p.user_id] || "dev")} disabled={saving === p.user_id}>
                      <Check className="w-3.5 h-3.5 text-success" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleReject(p.user_id)} disabled={saving === p.user_id}>
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>

      {/* Membros */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-base font-medium text-foreground">Membros ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserCheck className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum membro na organização.</p>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nome</TableHead><TableHead>Role</TableHead><TableHead>Entrou em</TableHead><TableHead className="w-40">Alterar Role</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-foreground font-medium">{m.profiles?.[0]?.full_name ?? m.user_id.slice(0, 8)}</TableCell>
                <TableCell><Badge variant={roleVariants[m.role] ?? "info"}>{roleLabels[m.role] ?? m.role}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{fmtDate(m.joined_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select value={safeRole(m.role)} onValueChange={(v) => handleRoleChange(m.id, v as string)} disabled={saving === m.id}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectPopover>
                        <SelectItem value="admin">Admin</SelectItem><SelectItem value="socio">Socio</SelectItem><SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem><SelectItem value="dev">Dev</SelectItem>
                      </SelectPopover>
                    </Select>
                    {saving === m.id && <span className="text-xs text-muted-foreground">Salvando...</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>
    </div>
  );
}
