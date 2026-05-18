"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Command, LayoutDashboard, FolderKanban, Building2, DollarSign,
  FileText, Cpu, Clock, CheckSquare, Server, Users, Menu, Webhook,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarGroup } from "./sidebar-group";
import { SidebarUserFooter } from "./sidebar-user-footer";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import type { SidebarItem } from "./sidebar-group";

const sidebarItems: { label: string; items: SidebarItem[] }[] = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Projetos",
    items: [
      { label: "Projetos", href: "/app/projetos", icon: FolderKanban },
      { label: "Clientes", href: "/app/clientes", icon: Building2, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Financeiro", href: "/app/financeiro", icon: DollarSign, roles: ["admin", "socio", "financeiro"] },
      { label: "Relatórios", href: "/app/financeiro/relatorios", icon: FileText, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Operação",
    items: [
      { label: "IAs e Tokens", href: "/app/ia", icon: Cpu, roles: ["admin", "socio", "gerente"] },
      { label: "Tempo", href: "/app/tempo", icon: Clock, roles: ["admin", "socio", "gerente"] },
      { label: "Entregas", href: "/app/entregas", icon: CheckSquare, roles: ["admin", "socio", "gerente"] },
      { label: "Infraestrutura", href: "/app/infraestrutura", icon: Server, roles: ["admin", "socio", "financeiro"] },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Usuários", href: "/app/admin/usuarios", icon: Users, roles: ["admin"] },
      { label: "Evolution API", href: "/app/configuracoes/evolution", icon: Webhook, roles: ["admin", "socio"] },
    ],
  },
];

export function Sidebar() {
  const { appUser, loading } = useUser();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/60 flex-col hidden lg:flex">
      <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-800/60 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Command className="w-4 h-4 text-indigo-400" />
        </div>
        <Link href="/app/dashboard" className="font-semibold text-slate-100">
          Softhouse
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-4 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16 bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (
          sidebarItems.map((group) => (
            <SidebarGroup
              key={group.label}
              label={group.label}
              items={group.items}
              userRole={appUser?.role ?? null}
            />
          ))
        )}
      </nav>

      {loading ? (
        <div className="border-t border-slate-800/60 p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 bg-slate-800" />
              <Skeleton className="h-2 w-16 bg-slate-800" />
            </div>
          </div>
        </div>
      ) : appUser ? (
        <SidebarUserFooter
          fullName={appUser.profile?.full_name ?? appUser.user.email ?? ""}
          email={appUser.user.email ?? ""}
          role={appUser.role}
          avatarUrl={appUser.profile?.avatar_url ?? null}
        />
      ) : null}
    </aside>
  );
}

export function MobileSidebar() {
  const { appUser, loading } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-slate-950 border-r border-slate-800/60">
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-800/60 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Command className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-100">Softhouse</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="space-y-4 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16 bg-slate-800" />
                    <Skeleton className="h-8 w-full bg-slate-800" />
                    <Skeleton className="h-8 w-full bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : (
              sidebarItems.map((group) => (
                <SidebarGroup
                  key={group.label}
                  label={group.label}
                  items={group.items}
                  userRole={appUser?.role ?? null}
                />
              ))
            )}
          </nav>
          {loading ? (
            <div className="border-t border-slate-800/60 p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24 bg-slate-800" />
                  <Skeleton className="h-2 w-16 bg-slate-800" />
                </div>
              </div>
            </div>
          ) : appUser ? (
            <SidebarUserFooter
              fullName={appUser.profile?.full_name ?? appUser.user.email ?? ""}
              email={appUser.user.email ?? ""}
              role={appUser.role}
              avatarUrl={appUser.profile?.avatar_url ?? null}
            />
          ) : null}
        </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
