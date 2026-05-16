import { createClient } from "@/lib/supabase/server";
import { ClienteTable } from "@/components/clientes/cliente-table";
import { ClienteDialog } from "@/components/clientes/cliente-dialog";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user!.id)
    .single();

  const canManage = member?.role && ["admin", "socio"].includes(member.role);

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("org_id", member?.org_id ?? "")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Clientes</h1>
          <p className="text-sm text-slate-400 mt-1">
            {clients?.length ?? 0} cliente(s) cadastrado(s)
          </p>
        </div>
        {canManage && (
          <ClienteDialog>
            <Button variant="default">Novo Cliente</Button>
          </ClienteDialog>
        )}
      </div>

      {!clients || clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mb-4" />
          <h2 className="text-lg font-medium text-slate-300 mb-2">Nenhum cliente cadastrado</h2>
          <p className="text-sm text-slate-500 max-w-md">
            Cadastre clientes para vinculá-los aos projetos.
          </p>
        </div>
      ) : (
        <ClienteTable clients={clients} canManage={canManage} />
      )}
    </div>
  );
}
