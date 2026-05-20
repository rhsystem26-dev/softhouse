"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <span className="text-destructive text-2xl">!</span>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Algo deu errado
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Ocorreu um erro ao carregar esta página. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
