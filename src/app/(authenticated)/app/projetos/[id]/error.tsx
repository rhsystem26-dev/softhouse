"use client";
import { PageError } from "@/components/ui/page-error";
export default function ProjetoDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError error={error} reset={reset} title="Erro ao carregar projeto" />;
}
