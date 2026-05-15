"use client";
import { cn } from "@/lib/utils";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { type ComponentProps } from "react";

export function Popover({ ...props }: ComponentProps<typeof BasePopover.Root>) {
  return <span data-slot="popover"><BasePopover.Root {...props} /></span>;
}
export function PopoverTrigger({ className, ...props }: ComponentProps<typeof BasePopover.Trigger>) {
  return <BasePopover.Trigger data-slot="popover-trigger" className={cn(className)} {...props} />;
}
export function PopoverContent({ className, ...props }: ComponentProps<typeof BasePopover.Popup>) {
  return (
    <BasePopover.Portal>
      <BasePopover.Popup
        data-slot="popover-content"
        className={cn(
          "z-50 w-72 rounded-md border border-slate-800 bg-slate-950 p-4 shadow-md outline-none",
          className
        )}
        {...props}
      />
    </BasePopover.Portal>
  );
}
