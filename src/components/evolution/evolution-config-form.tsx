"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { saveEvolutionConfigAction } from "@/lib/actions/evolution";
import { CheckCircle2, Settings2, Eye, EyeOff } from "lucide-react";

interface EvolutionConfigFormProps {
  hasConfig: boolean;
  instanceUrl: string;
  enabled: boolean;
  updatedAt: string | null;
}

export function EvolutionConfigForm({
  hasConfig,
  instanceUrl,
  enabled: initialEnabled,
  updatedAt,
}: EvolutionConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [enabled, setEnabled] = useState(initialEnabled);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("enabled", enabled ? "true" : "false");

    startTransition(async () => {
      const result = await saveEvolutionConfigAction(formData);
      if (result.success) {
        toast.success("Configuração salva com sucesso.");
      } else {
        toast.error(result.error ?? "Erro ao salvar configuração.");
      }
    });
  }

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-slate-100">Configuração</CardTitle>
              <CardDescription>
                Credenciais da instância Evolution API
              </CardDescription>
            </div>
          </div>
          {hasConfig && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <Badge variant="success">Configurado</Badge>
            </div>
          )}
        </div>
        {hasConfig && updatedAt && (
          <p className="text-xs text-slate-500 mt-1">
            Última atualização:{" "}
            {new Date(updatedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Instance URL */}
          <div className="space-y-1.5">
            <Label htmlFor="instanceUrl" className="text-slate-300">
              URL da Instância
            </Label>
            <Input
              id="instanceUrl"
              name="instanceUrl"
              type="url"
              placeholder="https://evolution.exemplo.com"
              defaultValue={instanceUrl}
              required
              className="bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <Label htmlFor="apiKey" className="text-slate-300">
              API Key
              {hasConfig && (
                <span className="ml-2 text-xs text-slate-500">(deixe em branco para manter atual)</span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                name="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder={hasConfig ? "••••••••  (configurado)" : "Chave da API Evolution"}
                className="bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showApiKey ? "Ocultar API Key" : "Mostrar API Key"}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5">
            <Label htmlFor="webhookSecret" className="text-slate-300">
              Webhook Secret
              {hasConfig && (
                <span className="ml-2 text-xs text-slate-500">(deixe em branco para manter atual)</span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="webhookSecret"
                name="webhookSecret"
                type={showWebhook ? "text" : "password"}
                placeholder={hasConfig ? "••••••••  (configurado)" : "Secret para validação de webhook"}
                className="bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowWebhook((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showWebhook ? "Ocultar Webhook Secret" : "Mostrar Webhook Secret"}
              >
                {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Enabled toggle */}
          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                enabled ? "bg-indigo-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <Label className="text-slate-300 cursor-pointer" onClick={() => setEnabled((v) => !v)}>
              {enabled ? "Integração ativa" : "Integração desativada"}
            </Label>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isPending ? "Salvando..." : "Salvar configuração"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
