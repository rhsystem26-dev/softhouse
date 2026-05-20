"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createDefaultBoardAction } from "@/lib/actions/tasks";
import { Plus, Loader2 } from "lucide-react";

export function CreateBoardButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    const result = await createDefaultBoardAction();
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, revalidatePath will refresh the page
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleCreate}
        disabled={loading}
        variant="default"
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Criar quadro Kanban padrão
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Cria colunas: Backlog, A Fazer, Em Andamento, Revisão, Concluído
      </p>
    </div>
  );
}
