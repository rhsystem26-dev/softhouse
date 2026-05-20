"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveEvolutionConfigAction } from "@/lib/actions/evolution";
import { Eye, EyeOff, Save, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Config {
  id?: string; instance_url?: string; enabled?: boolean; created_at?: string; updated_at?: string;
}

export function EvolutionConfigForm({ config }: { config: Config | null }) {
  const [instanceUrl, setInstanceUrl] = useState(config?.instance_url ?? "");
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  function validateUrl(value: string): boolean {
    if (!value) return true; // handled by required
    // Block emails
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setUrlError("Email não é válido. Informe uma URL começando com https://");
      return false;
    }
    // Must start with https://
    if (!value.startsWith("https://")) {
      setUrlError("A URL deve começar com https://");
      return false;
    }
    // Basic URL structure
    try {
      new URL(value);
      setUrlError(null);
      return true;
    } catch {
      setUrlError("URL inválida. Ex: https://evolution.seudominio.com");
      return false;
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateUrl(instanceUrl)) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("instanceUrl", instanceUrl);
    fd.set("apiKey", apiKey || "__keep_existing__");
    fd.set("webhookSecret", webhookSecret || "__keep_existing__");
    fd.set("enabled", "true");
    const result = await saveEvolutionConfigAction(fd);
    if (result.error) { setError(result.error); }
    else { setSaved(true); setApiKey(""); setWebhookSecret(""); setTimeout(() => setSaved(false), 3000); }
    setLoading(false);
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base text-foreground">Configuracao da Instancia</CardTitle>
        <Badge variant={config?.enabled ? "success" : "default"}>
          <Circle className="w-1.5 h-1.5 fill-current mr-1" />
          {config?.enabled ? "Conectado" : "Desconectado"}
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceUrl">URL da Instancia</Label>
            <Input id="instanceUrl" type="url" value={instanceUrl} onChange={(e) => { setInstanceUrl(e.target.value); setUrlError(null); }} onBlur={() => validateUrl(instanceUrl)} placeholder="https://evolution.seudominio.com" required />
            {urlError && <p className="text-sm text-destructive">{urlError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input id="apiKey" type={showApiKey ? "text" : "password"} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={config ? "(manter atual)" : "sua-api-key"} />
              <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showApiKey ? "Ocultar API key" : "Mostrar API key"}>
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Webhook Secret</Label>
            <div className="relative">
              <Input id="webhookSecret" type={showWebhook ? "text" : "password"} value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder={config ? "(manter atual)" : "seu-webhook-secret"} />
              <button type="button" onClick={() => setShowWebhook(!showWebhook)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showWebhook ? "Ocultar webhook secret" : "Mostrar webhook secret"}>
                {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-success">Configuracao salva com sucesso!</p>}
          <Button type="submit" disabled={loading} className="gap-1.5">
            <Save className="w-4 h-4" /> {loading ? "Salvando..." : "Salvar Configuracao"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
