"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClienteDialog } from "./cliente-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Mail, Phone } from "lucide-react";
import { deleteClientAction } from "@/lib/actions/clients";
import { useState } from "react";
import type { Client } from "@/types/database";

export function ClienteTable({ clients, canManage }: { clients: Client[]; canManage: boolean }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Remover este cliente?")) return;
    setDeleting(id);
    await deleteClientAction(id);
    setDeleting(null);
  }

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            {canManage && <TableHead className="w-24" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium text-slate-100">{client.name}</TableCell>
              <TableCell>
                {client.email ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </span>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </TableCell>
              <TableCell>
                {client.phone ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Phone className="w-3.5 h-3.5" /> {client.phone}
                  </span>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </TableCell>
              {canManage && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ClienteDialog client={client}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </ClienteDialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-400 hover:text-rose-300"
                      onClick={() => handleDelete(client.id)}
                      disabled={deleting === client.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
