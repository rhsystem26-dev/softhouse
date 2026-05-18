"use client";
import { cn } from "@/lib/utils";
import { Select as BaseSelect } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";
import { type ComponentProps } from "react";

export function Select({ className, children, ...props }: ComponentProps<typeof BaseSelect.Root> & { className?: string }) {
  return (
    <div data-slot="select" className={className}>
      <BaseSelect.Root {...props}>{children}</BaseSelect.Root>
    </div>
  );
}

export function SelectTrigger({ className, children, ...props }: ComponentProps<typeof BaseSelect.Trigger>) {
  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-slate-400" />
    </BaseSelect.Trigger>
  );
}

export function SelectValue({ className, ...props }: ComponentProps<typeof BaseSelect.Value>) {
  return <BaseSelect.Value data-slot="select-value" className={cn("text-sm", className)} {...props} />;
}

export function SelectPopover({ className, children, ...props }: ComponentProps<typeof BaseSelect.Popup>) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner sideOffset={4} className="z-50 outline-none">
        <BaseSelect.Popup
          data-slot="select-popover"
          className={cn("rounded-md border border-slate-800 bg-slate-900 shadow-lg max-h-60 overflow-y-auto", className)}
          {...props}
        >
          {children}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item
      data-slot="select-item"
      className={cn(
        "flex cursor-pointer items-center px-3 py-2 text-sm text-slate-200 outline-none hover:bg-slate-800 data-[highlighted]:bg-slate-800",
        className
      )}
      {...props}
    >
      {children}
    </BaseSelect.Item>
  );
}
