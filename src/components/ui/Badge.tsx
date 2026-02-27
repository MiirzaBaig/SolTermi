"use client";

import { cn } from "@/lib/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "profit" | "loss" | "accent" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        variant === "default" && "bg-panel-bg text-text-primary border-border shadow-brutal-press",
        variant === "profit" && "bg-profit/20 text-profit border-profit",
        variant === "loss" && "bg-loss/20 text-loss border-loss",
        variant === "accent" && "bg-accent/20 text-accent border-accent",
        variant === "outline" && "border-border text-text-secondary bg-transparent",
        className
      )}
      {...props}
    />
  );
}
