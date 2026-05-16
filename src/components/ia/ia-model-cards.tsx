import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AiUsage, AiModel } from "@/types/database";

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
        <CardHeader>
          <CardTitle className="text-base text-slate-200">Modelos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-slate-500">Nenhum modelo cadastrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card key={s.modelId} className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-200">{s.modelName}</CardTitle>
              <Badge variant="info" className="text-xs">{s.providerName}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Tokens In</p>
                <p className="font-mono text-slate-200">{fmtTokens(s.totalTokensIn)}</p>
              </div>
              <div>
                <p className="text-slate-500">Tokens Out</p>
                <p className="font-mono text-slate-200">{fmtTokens(s.totalTokensOut)}</p>
              </div>
              <div>
                <p className="text-slate-500">Custo</p>
                <p className="font-mono text-slate-200">{fmtCurrency(s.totalCost)}</p>
              </div>
              <div>
                <p className="text-slate-500">Uso</p>
                <p className="font-mono text-slate-200">{s.entries}x</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 text-xs">
              {s.avgQuality != null && (
                <span className="text-amber-400 font-mono">{s.avgQuality.toFixed(1)}/5 score</span>
              )}
              {s.acceptanceRate != null && (
                <span className={`font-mono ${s.acceptanceRate >= 0.7 ? "text-emerald-400" : s.acceptanceRate >= 0.4 ? "text-amber-400" : "text-rose-400"}`}>
                  {Math.round(s.acceptanceRate * 100)}% aproveitamento
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
