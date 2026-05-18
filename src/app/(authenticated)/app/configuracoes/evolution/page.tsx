import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getEvolutionConfigAction, getEvolutionMessageLogsAction } from "@/lib/actions/evolution";
import { EvolutionConfigForm } from "@/components/evolution/evolution-config-form";
import { EvolutionTestPanel } from "@/components/evolution/evolution-test-panel";
import { EvolutionLogsTable } from "@/components/evolution/evolution-logs-table";

const ALLOWED_ROLES = new Set(["admin", "socio"]);

export const metadata = { title: "Evolution API — Softhouse" };

export default async function EvolutionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user!.id)
    .single();

  if (!member || !ALLOWED_ROLES.has(member.role)) {
    redirect("/app/dashboard");
  }

  const [configResult, logsResult] = await Promise.all([
    getEvolutionConfigAction(),
    getEvolutionMessageLogsAction(),
  ]);

  const config = configResult.success ? configResult.data : null;
  const logs = logsResult.success ? logsResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Evolution API</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure a integração com a Evolution API para envio de mensagens WhatsApp
        </p>
      </div>

      <EvolutionConfigForm
        hasConfig={!!config}
        instanceUrl={config?.instance_url ?? ""}
        enabled={config?.enabled ?? true}
        updatedAt={config?.updated_at ?? null}
      />

      <EvolutionTestPanel hasConfig={!!config} />

      <EvolutionLogsTable initialLogs={logs} />
    </div>
  );
}
