"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarUserFooterProps {
  fullName: string;
  email: string;
  role: string | null;
  avatarUrl?: string | null;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  socio: "Sócio",
  financeiro: "Financeiro",
  gerente: "Gerente",
  dev: "Desenvolvedor",
};

export function SidebarUserFooter({ fullName, email, role, avatarUrl }: SidebarUserFooterProps) {
  const router = useRouter();
  const initials = (fullName || email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="border-t border-slate-800/60 p-3">
      <Link href="/app/perfil" className="flex items-center gap-3 mb-2 rounded-md px-1 py-1 hover:bg-slate-800/50 transition-colors group">
        <Avatar className="w-8 h-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
          <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate group-hover:text-slate-100">{fullName}</p>
          <p className="text-xs text-slate-500 truncate">{email}</p>
        </div>
      </Link>
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium",
          role === "admin" || role === "socio"
            ? "bg-indigo-500/10 text-indigo-400"
            : "bg-slate-800 text-slate-400"
        )}>
          {role ? roleLabels[role] ?? role : "—"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="h-7 w-7 text-slate-500 hover:text-slate-300"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
