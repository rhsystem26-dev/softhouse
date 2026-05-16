import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function IAScoreExplainer() {
  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-200">Score de IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-400">
          O score é calculado com base em 5 dimensões ponderadas:
        </p>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-300">
            <span>Qualidade média</span>
            <span className="text-indigo-400">× 30%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Taxa de aproveitamento</span>
            <span className="text-emerald-400">× 25%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Tempo economizado</span>
            <span className="text-sky-400">× 25%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Custo normalizado</span>
            <span className="text-rose-400">- 10%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Taxa de retrabalho</span>
            <span className="text-rose-400">- 10%</span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-800/60">
          <p className="text-xs text-slate-500">
            O score final varia de 0 a 100. Modelos com score &ge; 70 são considerados excelentes. A fórmula é visível e pode ser ajustada conforme novos dados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
