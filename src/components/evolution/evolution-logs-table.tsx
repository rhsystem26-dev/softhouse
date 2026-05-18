"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEvolutionMessageLogsAction } from "@/lib/actions/evolution";
import { RefreshCw, MessageSquareText } from "lucide-react";

interface LogRow {
  id: string;
  to_phone: string;
  message: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface EvolutionLogsTableProps {
  initialLogs: LogRow[];
}

function statusBadge(status: string) {
  switch (status) {
    case "sent":
      return <Badge variant="success">Enviado</Badge>;
    case "failed":
      return <Badge variant="danger">Falhou</Badge>;
    case "rate_limited":
      return <Badge variant="warning">Limite</Badge>;
    case "pending":
      return <Badge variant="info">Pendente</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function maskPhone(phone: string) {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4).replace(/./g, "•") + phone.slice(-4);
}

export function EvolutionLogsTable({ initialLogs }: EvolutionLogsTableProps) {
  const [logs, setLogs] = useState<LogRow[]>(initialLogs);
  const [isRefreshing, startRefreshing] = useTransition();

  function handleRefresh() {
    startRefreshing(async () => {
      const result = await getEvolutionMessageLogsAction();
      if (result.success) {
        setLogs(result.data);
      } else {
        toast.error(result.error ?? "Erro ao atualizar logs.");
      }
    });
  }

  return (
    <Card className="bg-slate-900 border-slate-800/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center">
              <MessageSquareText className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-slate-100">Logs de Envio</CardTitle>
              <CardDescription>Últimas 20 mensagens enviadas pela organização</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquareText className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">Nenhum log de envio ainda.</p>
            <p className="text-xs text-slate-500 mt-1">
              Mensagens enviadas via Evolution API aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-medium w-[130px]">
                    Telefone
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                    Mensagem
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-medium w-[100px]">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-medium w-[160px]">
                    Data
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-slate-800/60 hover:bg-slate-800/30"
                  >
                    <TableCell className="font-mono text-sm text-slate-300">
                      {maskPhone(log.to_phone)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-400 max-w-[300px]">
                      <p className="truncate">{log.message}</p>
                      {log.error_message && (
                        <p className="text-xs text-rose-400 mt-0.5 truncate">
                          {log.error_message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(log.status)}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono tabular-nums">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
