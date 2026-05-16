"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { KeyRound } from "lucide-react";
import Link from "next/link";

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 dígitos.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      // Sign out after password change so user logs in with new password
      await supabase.auth.signOut();
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <Card className="w-full max-w-md border-slate-800/60 bg-slate-900">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Senha redefinida!</h2>
              <p className="text-sm text-slate-400 mt-2">
                Sua senha foi alterada com sucesso. Agora você pode entrar com sua nova senha.
              </p>
            </div>
            <Link href="/login">
              <Button className="w-full">Ir para o login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <Card className="w-full max-w-md border-slate-800/60 bg-slate-900">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-slate-400">
              Link inválido ou expirado. Solicite um novo link de recuperação.
            </p>
            <Link href="/esqueceu-senha">
              <Button variant="outline" className="w-full">Solicitar novo link</Button>
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
          <div className="mx-auto w-10 h-10 rounded-md bg-indigo-500/10 flex items-center justify-center mb-3">
            <KeyRound className="w-5 h-5 text-indigo-400" />
          </div>
          <CardTitle className="text-xl text-slate-100">Redefinir senha</CardTitle>
          <p className="text-sm text-slate-400 mt-1">
            Escolha uma nova senha com pelo menos 8 dígitos.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Nova senha</Label>
              <PasswordInput
                id="new_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 dígitos"
                required
              />
              <PasswordStrength password={password} />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
