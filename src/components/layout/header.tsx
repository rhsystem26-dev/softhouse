"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { MobileSidebar } from "./sidebar";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/ui/command-palette";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projetos: "Projetos",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  ia: "IAs & Tokens",
  tempo: "Tempo",
  entregas: "Entregas",
  infraestrutura: "Infraestrutura",
  clientes: "Clientes",
  admin: "Admin",
  usuarios: "Usuários",
  "criar-conta": "Criar Conta",
  "esqueceu-senha": "Esqueceu a Senha",
  "redefinir-senha": "Redefinir Senha",
};

function formatSegment(s: string): string {
  if (UUID_RE.test(s)) return "Detalhe";
  return SEGMENT_LABELS[s.toLowerCase()] ?? s.charAt(0).toUpperCase() + s.slice(1);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useUser();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((s) => formatSegment(s));

  const initials = appUser?.profile?.full_name
    ? appUser.profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : appUser?.user?.email?.slice(0, 2).toUpperCase() ?? "?";

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="h-14 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          {segments.length === 0 ? (
            <span className="text-slate-200 font-medium">Dashboard</span>
          ) : (
            segments.map((segment, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-600">/</span>}
                <span className={i === segments.length - 1 ? "text-slate-200 font-medium" : "text-slate-500"}>
                  {segment}
                </span>
              </span>
            ))
          )}
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <CommandPalette />

        {appUser && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-800/60 transition-colors outline-none">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-slate-900 border-slate-800">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {appUser.profile?.full_name ?? appUser.user.email}
                </p>
                <p className="text-xs text-slate-500 truncate">{appUser.user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
