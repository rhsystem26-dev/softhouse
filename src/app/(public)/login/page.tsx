"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/auth/password-input";
import { Command, Lock, Zap } from "lucide-react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  acesso_negado: "Seu acesso foi negado. Entre em contato com um administrador.",
  auth_callback_failed: "Falha na confirmação. Tente novamente.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [error, setError] = useState<string | null>(urlError ? (ERROR_MESSAGES[urlError] ?? null) : null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email ou senha inválidos."
          : "Não foi possível entrar. Verifique seus dados e tente novamente."
      );
    } else if (signInData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("user_id", signInData.user.id)
        .single();

      if (profile?.approval_status === "pending") {
        router.push("/aguardando-aprovacao");
      } else if (profile?.approval_status === "rejected") {
        await supabase.auth.signOut();
        setError("Seu acesso foi negado. Entre em contato com um administrador.");
      } else {
        router.push("/app/dashboard");
      }
    }
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Command className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xl font-semibold text-slate-100">Softhouse</span>
          </div>
          <Card className="bg-slate-900 border-slate-800/60">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-sm text-slate-400">
                Link enviado para <strong className="text-slate-200">{email}</strong>.
                Verifique sua caixa de entrada.
              </p>
              <Button
                variant="outline"
                onClick={() => { setSent(false); setEmail(""); }}
                className="border-slate-700 text-slate-300"
              >
                Usar outro email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Command className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-xl font-semibold text-slate-100">Softhouse</span>
        </div>

        <Card className="bg-slate-900 border-slate-800/60">
          <CardHeader>
            <CardTitle className="text-slate-100">Entrar</CardTitle>
            <CardDescription className="text-slate-400">
              Acesse sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div role="tablist" aria-label="Método de login" className="flex rounded-lg bg-slate-800 p-1">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "password"}
                onClick={() => { setMode("password"); setError(null); }}
                className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                  mode === "password" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                Senha
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "magic"}
                onClick={() => { setMode("magic"); setError(null); }}
                className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                  mode === "magic" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Zap className="w-3.5 h-3.5 inline mr-1.5" />
                Link mágico
              </button>
            </div>

            {mode === "password" ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login_email" className="text-slate-300">Email</Label>
                  <Input
                    id="login_email"
                    type="email"
                    placeholder="voce@sua-softhouse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login_password" className="text-slate-300">Senha</Label>
                    <Link href="/esqueceu-senha" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <PasswordInput
                    id="login_password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500">
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic_email" className="text-slate-300">Email</Label>
                  <Input
                    id="magic_email"
                    type="email"
                    placeholder="voce@sua-softhouse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <Button type="submit" disabled={loading} variant="outline" className="w-full border-slate-700 text-slate-300">
                  <Zap className="w-3.5 h-3.5 mr-2" />
                  {loading ? "Enviando..." : "Enviar link de acesso"}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 pt-1">
              Não tem conta?{" "}
              <Link href="/criar-conta" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Criar conta
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
