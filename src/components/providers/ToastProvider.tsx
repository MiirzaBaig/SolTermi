"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { addToast: () => {} };
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [open, setOpen] = useState(false);

  const addToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}`;
    setToasts((t) => [...t.slice(-4), { ...toast, id }]);
    setOpen(true);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      setOpen(false);
    }, 5000);
  }, []);

  const current = toasts[toasts.length - 1];
  const txHash = current?.description?.startsWith("Tx: ")
    ? current.description.replace("Tx: ", "").trim()
    : null;
  React.useEffect(() => {
    if (current) setOpen(true);
  }, [current]);

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <ToastPrimitive.Provider swipeDirection="right">
        {current && (
          <ToastPrimitive.Root
            open={open}
            onOpenChange={setOpen}
            className={cn(
              "fixed bottom-4 right-4 z-[100] w-full max-w-sm border-3 border-border p-4 shadow-brutal",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[swipe=end]:animate-out data-[state=closed]:slide-out-to-right-full",
              "bg-panel-bg",
              current.variant === "success" && "border-profit/50",
              current.variant === "error" && "border-loss/50",
              current.variant === "warning" && "border-yellow-500/50",
              current.variant === "info" && "border-accent/50"
            )}
          >
            <ToastPrimitive.Title className="text-sm font-medium text-text-primary">
              {current.title}
            </ToastPrimitive.Title>
            {current.description && (
              <ToastPrimitive.Description className="text-xs text-text-secondary mt-1">
                {current.description}
              </ToastPrimitive.Description>
            )}
            {txHash && (
              <button
                type="button"
                className="mt-2 text-xs underline underline-offset-2 text-accent hover:text-accent/80"
                onClick={() => navigator.clipboard.writeText(txHash)}
              >
                Copy tx hash
              </button>
            )}
          </ToastPrimitive.Root>
        )}
        <ToastPrimitive.Viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
