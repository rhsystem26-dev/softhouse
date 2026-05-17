"use client";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function PageError({ error, reset, title = "Algo deu errado" }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-rose-400" />
      </div>
      <h2 className="text-base font-medium text-slate-200 mb-1">{title}</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        {error.message || "Tente novamente ou entre em contato com o suporte."}
      </p>
      <Button variant="outline" size="sm" onClick={reset} className="gap-2">
        <RefreshCcw className="w-3.5 h-3.5" />
        Tentar novamente
      </Button>
    </div>
  );
}
