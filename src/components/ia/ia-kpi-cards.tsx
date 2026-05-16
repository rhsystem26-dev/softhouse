import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, DollarSign, Hash, Zap } from "lucide-react";
import type { AiUsage } from "@/types/database";

function computeKpis(usage: AiUsage[]) {
  const totalTokensIn = usage.reduce((s, u) => s + u.tokens_in, 0);
  const totalTokensOut = usage.reduce((s, u) => s + u.tokens_out, 0);
  const totalCost = usage.reduce((s, u) => s + u.cost, 0);
  const withScore = usage.filter((u) => u.quality_score != null);
  const avgScore = withScore.length > 0
    ? withScore.reduce((s, u) => s + (u.quality_score ?? 0), 0) / withScore.length
    : null;
  const modelIds = new Set(usage.map((u) => u.model_id));
  return { totalTokensIn, totalTokensOut, totalCost, avgScore, modelsUsed: modelIds.size };
}

export function IAKpiCards({ usage }: { usage: AiUsage[] }) {
  const kpis = computeKpis(usage);
  const fmtTokens = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
    return String(v);
  };
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const cards = [
    { label: "Tokens Totais", value: fmtTokens(kpis.totalTokensIn + kpis.totalTokensOut), icon: Hash, color: "text-indigo-400" },
    { label: "Custo Total", value: fmtCurrency(kpis.totalCost), icon: DollarSign, color: "text-emerald-400" },
    { label: "Score Médio", value: kpis.avgScore != null ? `${kpis.avgScore.toFixed(1)}/5` : "—", icon: Zap, color: "text-amber-400" },
    { label: "Modelos Ativos", value: String(kpis.modelsUsed), icon: Cpu, color: "text-sky-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-900 border-slate-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <c.icon className={`w-4 h-4 ${c.color}`} />
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100 font-mono tabular-nums">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
