"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

interface SidebarGroupProps {
  label: string;
  items: SidebarItem[];
  userRole: string | null;
}

export function SidebarGroup({ label, items, userRole }: SidebarGroupProps) {
  const pathname = usePathname();

  const visibleItems = items.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole)
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="px-3 mb-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <nav className="flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 rounded-l-none"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent rounded-l-none"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
