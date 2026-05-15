"use client";
import { cn } from "@/lib/utils";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { type ComponentProps, type HTMLAttributes } from "react";

export function Dialog({ ...props }: ComponentProps<typeof BaseDialog.Root>) {
  return <span data-slot="dialog"><BaseDialog.Root {...props} /></span>;
}
export function DialogTrigger({ className, ...props }: ComponentProps<typeof BaseDialog.Trigger>) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" className={cn(className)} {...props} />;
}
export function DialogPortal({ ...props }: ComponentProps<typeof BaseDialog.Portal>) {
  return <span data-slot="dialog-portal"><BaseDialog.Portal {...props} /></span>;
}
export function DialogOverlay({ className, ...props }: ComponentProps<typeof BaseDialog.Backdrop>) {
  return (
    <BaseDialog.Backdrop
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/60 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0", className)}
      {...props}
    />
  );
}
export function DialogContent({ className, children, ...props }: ComponentProps<typeof BaseDialog.Popup>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <BaseDialog.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border border-slate-800 bg-slate-950 p-6 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
        <BaseDialog.Close className="absolute right-4 top-4 rounded-sm text-slate-400 hover:text-slate-100">
          <X className="h-4 w-4" />
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </DialogPortal>
  );
}
export function DialogHeader({ className, ...props }: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dialog-header" className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}
export function DialogTitle({ className, ...props }: { className?: string } & HTMLAttributes<HTMLHeadingElement>) {
  return <h2 data-slot="dialog-title" className={cn("text-lg font-semibold text-slate-100", className)} {...props} />;
}
export function DialogDescription({ className, ...props }: { className?: string } & HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="dialog-description" className={cn("text-sm text-slate-400", className)} {...props} />;
}
