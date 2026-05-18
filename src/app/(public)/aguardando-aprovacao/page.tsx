import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function AguardandoAprovacaoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800/60 bg-slate-900">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Aguardando aprovação</h2>
            <p className="text-sm text-slate-400 mt-2">
              Seu cadastro foi recebido. Um administrador irá revisar e aprovar seu acesso em breve.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors block"
          >
            Voltar para o login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
