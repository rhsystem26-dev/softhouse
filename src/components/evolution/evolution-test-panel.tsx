"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { testEvolutionConnectionAction, sendEvolutionMessageAction } from "@/lib/actions/evolution";
import { Wifi, WifiOff, MessageSquare, Loader2 } from "lucide-react";

interface ConnectionStatus {
  connected: boolean;
  instance?: string;
  error?: string;
}

interface EvolutionTestPanelProps {
  hasConfig: boolean;
}

export function EvolutionTestPanel({ hasConfig }: EvolutionTestPanelProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isTestingConnection, startConnectionTransition] = useTransition();
  const [isSendingMessage, startMessageTransition] = useTransition();

  function handleTestConnection() {
    startConnectionTransition(async () => {
      const result = await testEvolutionConnectionAction();
      if (result.success) {
        setConnectionStatus(result.data);
        if (result.data.connected) {
          toast.success("Conexão testada com sucesso.");
        } else {
          toast.error(result.data.error ?? "Não foi possível conectar à instância.");
        }
      } else {
        setConnectionStatus({ connected: false, error: result.error });
        toast.error(result.error ?? "Não foi possível conectar à instância.");
      }
    });
  }

  function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startMessageTransition(async () => {
      const result = await sendEvolutionMessageAction(formData);
      if (result.success) {
        toast.success("Mensagem enviada com sucesso.");
        form.reset();
      } else {
        const msg = result.error ?? "Erro ao enviar mensagem.";
        if (msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("limite")) {
          toast.error("Limite de mensagens atingido. Tente novamente em alguns instantes.");
        } else {
          toast.error(msg);
        }
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Test connection card */}
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <CardTitle className="text-slate-100">Testar Conexão</CardTitle>
              <CardDescription>Verifica se a instância está acessível</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionStatus && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                connectionStatus.connected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {connectionStatus.connected ? (
                <>
                  <Wifi className="w-4 h-4 shrink-0" />
                  <span>
                    Conectado
                    {connectionStatus.instance && (
                      <span className="ml-1 text-emerald-500">— {connectionStatus.instance}</span>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 shrink-0" />
                  <span>{connectionStatus.error ?? "Falha na conexão"}</span>
                </>
              )}
            </div>
          )}

          <Button
            onClick={handleTestConnection}
            disabled={isTestingConnection || !hasConfig}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 w-full"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              "Testar conexão"
            )}
          </Button>

          {!hasConfig && (
            <p className="text-xs text-slate-500">
              Configure a integração antes de testar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Send test message card */}
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-slate-100">Mensagem de Teste</CardTitle>
              <CardDescription>Envia uma mensagem WhatsApp de teste</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="toPhone" className="text-slate-300">
                Telefone (com DDD)
              </Label>
              <Input
                id="toPhone"
                name="toPhone"
                type="tel"
                placeholder="11999999999"
                required
                disabled={!hasConfig}
                className="bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-slate-300">
                Mensagem
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Mensagem de teste da Evolution API"
                required
                disabled={!hasConfig}
                rows={3}
                maxLength={4000}
                className="bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSendingMessage || !hasConfig}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
            >
              {isSendingMessage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar mensagem"
              )}
            </Button>

            {!hasConfig && (
              <p className="text-xs text-slate-500">
                Configure a integração antes de enviar.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
