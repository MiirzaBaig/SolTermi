"use client";

import { useState, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTradingStore } from "@/stores/tradingStore";
import { priceEngine } from "@/lib/priceEngine";
import { TRADING_PAIRS } from "@/lib/constants";
import { cn } from "@/lib/cn";

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return true;
  let j = 0;
  for (let i = 0; i < t.length && j < q.length; i++) {
    if (t[i] === q[j]) j++;
  }
  return j === q.length;
}

interface Command {
  id: string;
  label: string;
  run: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const setActivePair = useTradingStore((s) => s.setActivePair);

  const commands: Command[] = [
    ...TRADING_PAIRS.slice(0, 10).map((p) => ({
      id: `pair-${p.symbol}`,
      label: `Switch to ${p.symbol}`,
      run: () => {
        setActivePair(p.symbol);
        priceEngine.setPair(p.symbol);
        onOpenChange(false);
      },
    })),
    { id: "buy", label: "Focus Buy order", run: () => { document.getElementById("order-amount")?.focus(); onOpenChange(false); } },
    { id: "sell", label: "Focus Sell order", run: () => { document.getElementById("order-amount")?.focus(); onOpenChange(false); } },
  ];

  const filtered = query
    ? commands.filter((c) => fuzzyMatch(query, c.label))
    : commands;
  const selected = filtered[highlight];

  const runSelected = useCallback(() => {
    selected?.run();
  }, [selected]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlight(0);
  }, [open]);

  useEffect(() => {
    setHighlight((h) => (h < 0 ? 0 : h >= filtered.length ? filtered.length - 1 : h));
  }, [filtered.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        runSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered.length, runSelected]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[100] animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] z-[100] w-full max-w-md -translate-x-1/2 border-3 border-border bg-panel-bg p-3 shadow-brutal animate-zoom-in"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <input
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-3 border-border bg-terminal-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent font-semibold"
            autoFocus
          />
          <div className="mt-3 max-h-64 overflow-auto border-2 border-border">
            {filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => cmd.run()}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm font-semibold border-b border-border/50 last:border-b-0",
                  i === highlight ? "bg-accent/20 text-accent" : "text-text-primary hover:bg-accent/10"
                )}
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
