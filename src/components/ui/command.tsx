"use client";
import { cn } from "@/lib/utils";
import { Command as BaseCommand } from "cmdk";
import { Search } from "lucide-react";
import { type ComponentProps } from "react";

export function Command({ className, ...props }: ComponentProps<typeof BaseCommand>) {
  return (
    <BaseCommand
      data-slot="command"
      className={cn("flex h-full w-full flex-col overflow-hidden rounded-md", className)}
      {...props}
    />
  );
}

export function CommandInput({ className, ...props }: ComponentProps<typeof BaseCommand.Input>) {
  return (
    <div data-slot="command-input" className="flex items-center border-b border-slate-800 px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
      <BaseCommand.Input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }: ComponentProps<typeof BaseCommand.List>) {
  return <BaseCommand.List data-slot="command-list" className={cn("max-h-60 overflow-y-auto p-1", className)} {...props} />;
}

export function CommandEmpty({ className, ...props }: ComponentProps<typeof BaseCommand.Empty>) {
  return <BaseCommand.Empty data-slot="command-empty" className={cn("py-6 text-center text-sm text-slate-400", className)} {...props} />;
}

export function CommandGroup({ className, ...props }: ComponentProps<typeof BaseCommand.Group>) {
  return <BaseCommand.Group data-slot="command-group" className={cn("overflow-hidden p-1 text-slate-200", className)} {...props} />;
}

export function CommandItem({ className, ...props }: ComponentProps<typeof BaseCommand.Item>) {
  return (
    <BaseCommand.Item
      data-slot="command-item"
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-slate-200 outline-none hover:bg-slate-800 data-[selected=true]:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}
