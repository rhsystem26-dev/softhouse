"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectPopover, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Crown, Briefcase, DollarSign, Code, BarChart, Clock, CheckCircle, XCircle } from "lucide-react";
import { approveUserAction, rejectUserAction } from "@/lib/actions/admin";
import { toast } from "sonner";

type MemberRole = "admin" | "socio" | "financeiro" | "gerente" | "dev";

interface Member {
  id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  full_name: string | null;
  email: string | null;
}

interface PendingUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

const ROLE_LABELS: Record<MemberRole, string> = {
  admin: "Admin",
  socio: "Sócio",
  financeiro: "Financeiro",
  gerente: "Gerente",
  dev: "Dev",
};

const ROLE_VARIANTS: Record<MemberRole, "info" | "warning" | "success" | "default" | "danger"> = {
  admin: "danger",
  socio: "warning",
  financeiro: "success",
  gerente: "info",
  dev: "default",
};

const ROLE_ICONS: Record<MemberRole, React.ComponentType<{ className?: string }>> = {
  admin: Crown,
  socio: Briefcase,
  financeiro: DollarSign,
  gerente: BarChart,
  dev: Code,
};

const ROLE_ORDER: MemberRole[] = ["admin", "socio", "financeiro", "gerente", "dev"];

function PendingUserRow({ user, orgId }: { user: PendingUser; orgId: string }) {
  const [role, setRole] = useState<MemberRole>("dev");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    const result = await approveUserAction(user.user_id, orgId, role);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${user.full_name ?? user.email} aprovado como ${ROLE_LABELS[role]}`);
    }
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    const result = await rejectUserAction(user.user_id, orgId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Usuário rejeitado");
    }
    setLoading(null);
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-medium text-amber-400">
            {(user.full_name ?? user.email ?? "?").slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {user.full_name ?? <span className="text-slate-500">(sem nome)</span>}
          </p>
          <p className="text-xs text-slate-500 truncate">{user.email} · Cadastro em {fmtDate(user.created_at)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectPopover>
            {ROLE_ORDER.map((r) => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
            ))}
          </SelectPopover>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
          onClick={handleApprove}
          disabled={loading !== null}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {loading === "approve" ? "..." : "Aprovar"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
          onClick={handleReject}
          disabled={loading !== null}
        >
          <XCircle className="w-3.5 h-3.5" />
          {loading === "reject" ? "..." : "Rejeitar"}
        </Button>
      </div>
    </div>
  );
}

export function AdminUsuariosView({
  members,
  pendingUsers,
  orgId,
}: {
  members: Member[];
  pendingUsers: PendingUser[];
  orgId: string;
}) {
  const sorted = [...members].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
  );

  const byRole = ROLE_ORDER.reduce<Record<string, Member[]>>((acc, role) => {
    acc[role] = sorted.filter((m) => m.role === role);
    return acc;
  }, {});

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ROLE_ORDER.map((role) => {
          const Icon = ROLE_ICONS[role];
          const count = byRole[role]?.length ?? 0;
          return (
            <Card key={role} className="bg-slate-900 border-slate-800/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400">{ROLE_LABELS[role]}</span>
                </div>
                <p className="text-2xl font-bold font-mono text-slate-100">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending users section */}
      {pendingUsers.length > 0 && (
        <Card className="bg-slate-900 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Aguardando aprovação ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/60">
              {pendingUsers.map((u) => (
                <PendingUserRow key={u.user_id} user={u} orgId={orgId} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card className="bg-slate-900 border-slate-800/60">
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-slate-500 gap-2">
              <Users className="w-8 h-8 text-slate-700" />
              <p className="text-sm">Nenhum membro encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {sorted.map((m) => {
                const Icon = ROLE_ICONS[m.role];
                return (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-indigo-400">
                          {(m.full_name ?? m.email ?? m.user_id).slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200">
                          {m.full_name ?? <span className="text-slate-500 font-mono text-xs">{m.user_id.slice(0, 8)}…</span>}
                        </p>
                        <p className="text-xs text-slate-500">
                          {m.email && <span className="mr-2">{m.email}</span>}
                          Desde {fmtDate(m.joined_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <Badge variant={ROLE_VARIANTS[m.role]}>{ROLE_LABELS[m.role]}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
