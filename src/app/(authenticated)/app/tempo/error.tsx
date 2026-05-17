"use client";
import { PageError } from "@/components/ui/page-error";
export default function TempoError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError error={error} reset={reset} title="Erro ao carregar registros de tempo" />;
}
