"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Crown, Briefcase, DollarSign, Code, BarChart } from "lucide-react";

type MemberRole = "admin" | "socio" | "financeiro" | "gerente" | "dev";

interface Member {
  id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  full_name: string | null;
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

export function AdminUsuariosView({ members }: { members: Member[] }) {
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
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-indigo-400">
                          {(m.full_name ?? m.user_id).slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {m.full_name ?? <span className="text-slate-500 font-mono text-xs">{m.user_id.slice(0, 8)}…</span>}
                        </p>
                        <p className="text-xs text-slate-500">Desde {fmtDate(m.joined_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
