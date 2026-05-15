import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, Percent, Cpu } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Bem-vindo, {user?.email}
        </p>
      </div>

      {/* KPIs placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Receita (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono">R$ 0</p>
            <p className="text-xs text-slate-500 mt-1">Dados disponíveis na Fase 3</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Custo (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono">R$ 0</p>
            <p className="text-xs text-slate-500 mt-1">Dados disponíveis na Fase 3</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Margem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono">—%</p>
            <p className="text-xs text-slate-500 mt-1">Dados disponíveis na Fase 3</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Tokens (mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono">0</p>
            <p className="text-xs text-slate-500 mt-1">Dados disponíveis na Fase 5</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado vazio */}
      <Card className="bg-slate-900 border-slate-800/60">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Building2 className="w-12 h-12 text-slate-600 mb-4" />
          <h2 className="text-lg font-medium text-slate-300 mb-2">
            Nenhum projeto cadastrado
          </h2>
          <p className="text-sm text-slate-500 text-center max-w-md">
            Os projetos, clientes e dados financeiros estarão disponíveis
            a partir da Fase 2. A fundação está pronta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
