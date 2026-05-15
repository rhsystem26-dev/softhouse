import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

const variants = {
  default: "bg-slate-800 text-slate-200",
  success: "bg-emerald-500/10 text-emerald-400",
  warning: "bg-amber-500/10 text-amber-400",
  danger: "bg-rose-500/10 text-rose-400",
  info: "bg-indigo-500/10 text-indigo-400",
  outline: "border border-slate-700 text-slate-400",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
