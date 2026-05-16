"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <Card className="w-full max-w-md border-slate-800/60 bg-slate-900">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Link enviado!</h2>
              <p className="text-sm text-slate-400 mt-2">
                Se <strong className="text-slate-200">{email}</strong> estiver cadastrado,
                você receberá um link para redefinir sua senha.
              </p>
            </div>
            <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors block">
              Voltar para o login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800/60 bg-slate-900">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-10 h-10 rounded-md bg-amber-500/10 flex items-center justify-center mb-3">
            <Mail className="w-5 h-5 text-amber-400" />
          </div>
          <CardTitle className="text-xl text-slate-100">Esqueceu a senha?</CardTitle>
          <p className="text-sm text-slate-400 mt-1">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset_email">Email</Label>
              <Input
                id="reset_email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Voltar para o login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
