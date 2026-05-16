import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { AiUsage, AiModel } from "@/types/database";

const MODEL_COLORS: Record<string, string> = {
  "GPT-4o": "#10b981",
  "GPT-4": "#10b981",
  "GPT-3.5": "#34d399",
  "Claude Opus": "#6366f1",
  "Claude Sonnet": "#0ea5e9",
  "Claude Haiku": "#818cf8",
  "Gemini Pro": "#f59e0b",
  "Gemini Flash": "#fbbf24",
};

function getModelColor(name: string): string {
  for (const [key, color] of Object.entries(MODEL_COLORS)) {
    if (name.includes(key)) return color;
  }
  return "#475569";
}

interface ModelStats {
  modelId: string;
  modelName: string;
  providerName: string;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCost: number;
  entries: number;
  avgQuality: number | null;
  acceptanceRate: number | null;
}

function computeModelStats(usage: AiUsage[], models: AiModel[]): ModelStats[] {
  const byModel = new Map<string, AiUsage[]>();
  for (const u of usage) {
    const list = byModel.get(u.model_id) || [];
    list.push(u);
    byModel.set(u.model_id, list);
  }

  return models.map((m) => {
    const entries = byModel.get(m.id) || [];
    const totalTokensIn = entries.reduce((s, u) => s + u.tokens_in, 0);
    const totalTokensOut = entries.reduce((s, u) => s + u.tokens_out, 0);
    const totalCost = entries.reduce((s, u) => s + u.cost, 0);
    const withQuality = entries.filter((u) => u.quality_score != null);
    const avgQuality = withQuality.length > 0
      ? withQuality.reduce((s, u) => s + (u.quality_score ?? 0), 0) / withQuality.length
      : null;
    const withResult = entries.filter((u) => u.result != null);
    const accepted = withResult.filter((u) => u.result === "accepted").length;
    const acceptanceRate = withResult.length > 0 ? accepted / withResult.length : null;

    return {
      modelId: m.id,
      modelName: m.name,
      providerName: (m as any).ai_providers?.name ?? "—",
      totalTokensIn,
      totalTokensOut,
      totalCost,
      entries: entries.length,
      avgQuality,
      acceptanceRate,
    };
  });
}

export function IAModelCards({ usage, models }: { usage: AiUsage[]; models: AiModel[] }) {
  const stats = computeModelStats(usage, models);

  const fmtTokens = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(1)}k`;
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

  if (stats.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800/60">
        <CardContent className="p-0">
          <EmptyState
            icon={Cpu}
            title="Nenhum modelo cadastrado"
            description="Registre uso de IAs para visualizar métricas de performance por modelo."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((s) => {
        const accentColor = getModelColor(s.modelName);
        return (
          <Card key={s.modelId} className="bg-slate-900 border-slate-800/60 overflow-hidden">
            <div className="h-0.5" style={{ backgroundColor: accentColor }} />
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-200">{s.modelName}</CardTitle>
                <Badge variant="outline" className="text-xs">{s.providerName}</Badge>
              </div>
              <p className="text-xs text-slate-500">{s.entries} uso{s.entries !== 1 ? "s" : ""}</p>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500 mb-0.5">Tokens In</p>
                  <p className="font-mono text-slate-200">{fmtTokens(s.totalTokensIn)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Tokens Out</p>
                  <p className="font-mono text-slate-200">{fmtTokens(s.totalTokensOut)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Custo total</p>
                  <p className="font-mono text-slate-200">{fmtCurrency(s.totalCost)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Custo médio</p>
                  <p className="font-mono text-slate-200">
                    {s.entries > 0 ? fmtCurrency(s.totalCost / s.entries) : "—"}
                  </p>
                </div>
              </div>

              {s.avgQuality != null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Score de qualidade</span>
                    <span className="font-mono text-amber-400">{s.avgQuality.toFixed(1)}/5</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${(s.avgQuality / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {s.acceptanceRate != null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Aproveitamento</span>
                    <span className={`font-mono ${
                      s.acceptanceRate >= 0.7 ? "text-emerald-400" :
                      s.acceptanceRate >= 0.4 ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {Math.round(s.acceptanceRate * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        s.acceptanceRate >= 0.7 ? "bg-emerald-500" :
                        s.acceptanceRate >= 0.4 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${s.acceptanceRate * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
