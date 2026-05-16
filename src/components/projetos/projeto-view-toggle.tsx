"use client";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "cards" | "table";

export function ProjetoViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="inline-flex rounded-md border border-slate-800 bg-slate-900 p-0.5">
      <Button
        variant={view === "cards" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2.5"
        onClick={() => onChange("cards")}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2.5"
        onClick={() => onChange("table")}
      >
        <List className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
