"use client";

import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "buy" | "sell" | "danger" | "sidebar";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold border-3 border-border transition-all duration-smooth ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-terminal-bg disabled:pointer-events-none disabled:opacity-50",
        "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none",
        size === "sm" && "h-9 px-3 text-xs shadow-brutal-press",
        size === "md" && "h-11 px-4 text-sm shadow-brutal-sm",
        size === "lg" && "h-12 px-5 text-base shadow-brutal",
        variant === "primary" && "bg-accent text-terminal-bg border-border hover:bg-accent/90",
        variant === "secondary" && "bg-panel-bg text-text-primary border-border shadow-brutal-sm hover:shadow-brutal-press",
        variant === "ghost" && "bg-transparent text-text-secondary border-border shadow-none hover:bg-panel-bg hover:text-text-primary",
        variant === "buy" && "bg-profit/10 text-profit border-profit shadow-brutal-sm hover:shadow-brutal-press",
        variant === "sell" && "bg-loss/10 text-loss border-loss shadow-brutal-sm hover:shadow-brutal-press",
        variant === "danger" && "bg-loss/10 text-loss border-loss shadow-brutal-press",
        variant === "sidebar" && "w-full bg-panel-bg text-text-primary border-border shadow-brutal-press",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
