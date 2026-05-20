import { createClient } from "@/lib/supabase/server";
import { WhatsAppCommandsTable } from "@/components/ia/whatsapp-commands/commands-table";
import { safeError } from "@/lib/server/safe-log";

export default async function WhatsAppCommandsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Sessão expirada. Faça login novamente.</p>
      </div>
    );
  }

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  const orgId = member?.org_id;
  const role = member?.role;

  if (!orgId) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Nenhuma organização vinculada.</p>
      </div>
    );
  }

  // Acesso: admin, socio, financeiro, gerente (roles que podem ver comandos)
  const canAccess = ["admin", "socio", "financeiro", "gerente"].includes(role || "");
  if (!canAccess) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Acesso restrito. Apenas admin, socio, financeiro ou gerente.</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let commands: any[] = [];

  try {
    const { data, error } = await supabase
      .from("whatsapp_commands")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      safeError("Erro ao carregar comandos WhatsApp", error);
    } else {
      commands = data ?? [];
    }
  } catch (err) {
    safeError("Erro ao carregar comandos WhatsApp", err);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingCount = commands.filter((c: any) =>
    ["pending_review", "pending_confirmation", "low_confidence"].includes(c.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Comandos WhatsApp</h1>
          <p className="text-sm text-slate-400 mt-1">
            Mensagens recebidas via WhatsApp e classificadas pela IA
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
            <span className="text-xs font-medium text-warning">{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      <WhatsAppCommandsTable commands={commands} role={role || ""} />
    </div>
  );
}
