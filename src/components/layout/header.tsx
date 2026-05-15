"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "./sidebar";

export function Header() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1) // remove "app"
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

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
                  {segment.length > 30 ? segment.slice(0, 30) + "..." : segment}
                </span>
              </span>
            ))
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2" />
    </header>
  );
}
