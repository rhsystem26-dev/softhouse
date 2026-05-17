"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  LayoutDashboard, FolderKanban, Building2, DollarSign,
  FileText, Cpu, Clock, CheckSquare, Server, Users,
  Command as CommandIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", group: "Principal", icon: LayoutDashboard, keywords: ["inicio"] },
  { label: "Projetos", href: "/app/projetos", group: "Projetos", icon: FolderKanban, keywords: ["project"] },
  { label: "Clientes", href: "/app/clientes", group: "Projetos", icon: Building2, keywords: ["client", "empresa"] },
  { label: "Financeiro", href: "/app/financeiro", group: "Financeiro", icon: DollarSign, keywords: ["finance", "receita", "custo"] },
  { label: "Relatórios", href: "/app/financeiro/relatorios", group: "Financeiro", icon: FileText, keywords: ["report", "relatorio"] },
  { label: "IAs e Tokens", href: "/app/ia", group: "Operação", icon: Cpu, keywords: ["ia", "ai", "tokens", "modelo"] },
  { label: "Tempo", href: "/app/tempo", group: "Operação", icon: Clock, keywords: ["horas", "time"] },
  { label: "Entregas", href: "/app/entregas", group: "Operação", icon: CheckSquare, keywords: ["delivery"] },
  { label: "Infraestrutura", href: "/app/infraestrutura", group: "Operação", icon: Server, keywords: ["infra", "servidor"] },
  { label: "Usuários", href: "/app/admin/usuarios", group: "Admin", icon: Users, keywords: ["admin", "membro"] },
];

const GROUPS = ["Principal", "Projetos", "Financeiro", "Operação", "Admin"];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors hidden sm:flex items-center gap-2"
        aria-label="Abrir paleta de comandos"
      >
        <CommandIcon className="w-4 h-4" />
        <kbd className="hidden lg:inline text-xs text-slate-600 bg-slate-800/80 px-1.5 py-0.5 rounded font-mono border border-slate-700/60">
          ⌘K
        </kbd>
      </button>

      <BaseDialog.Root open={open} onOpenChange={setOpen}>
        <BaseDialog.Portal>
          <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
          <BaseDialog.Popup className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            <Command>
              <CommandInput placeholder="Navegar para..." />
              <CommandList className="max-h-80">
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                {GROUPS.map((group) => {
                  const items = NAV_ITEMS.filter((i) => i.group === group);
                  return (
                    <CommandGroup key={group} heading={group}>
                      {items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <CommandItem
                            key={item.href}
                            value={[item.label, ...(item.keywords ?? [])].join(" ")}
                            onSelect={() => navigate(item.href)}
                          >
                            <Icon className="w-4 h-4 text-slate-400" />
                            {item.label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                })}
              </CommandList>
            </Command>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>
    </>
  );
}
