"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface DetailSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function ProjetoLocalSidebar({
  sections,
  activeSection,
  onSectionChange,
}: {
  sections: DetailSection[];
  activeSection: string;
  onSectionChange: (id: string) => void;
}) {
  return (
    <>
      {/* Desktop: sidebar fixa à esquerda */}
      <aside className="w-56 shrink-0 border-r border-slate-800/60 bg-slate-950/50 hidden lg:block">
        <div className="p-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
            Navegação
          </p>
          <nav className="space-y-0.5">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-md transition-colors text-left",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile: tabs scroll horizontal */}
      <div className="lg:hidden border-b border-slate-800/60 bg-slate-950/50 overflow-x-auto">
        <div className="flex min-w-max px-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors",
                  isActive
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
