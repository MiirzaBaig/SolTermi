"use client";

import { useState, useRef, useEffect } from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useTradingStore } from "@/stores/tradingStore";
import { TRADING_PAIRS } from "@/lib/constants";
import type { TradingPair } from "@/types/market";
import { priceEngine } from "@/lib/priceEngine";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

function fuzzyMatch(symbol: string, query: string): boolean {
  const q = query.toLowerCase();
  const s = symbol.toLowerCase();
  if (!q) return true;
  let j = 0;
  for (let i = 0; i < s.length && j < q.length; i++) {
    if (s[i] === q[j]) j++;
  }
  return j === q.length;
}

export function TokenPairSelector() {
  const { activePair, recentPairs, setActivePair, addRecentPair } = useTradingStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? TRADING_PAIRS.filter((p) => fuzzyMatch(p.symbol, query))
    : [...TRADING_PAIRS];
  const recentFiltered: TradingPair[] = recentPairs
    .map((s) => TRADING_PAIRS.find((p) => p.symbol === s))
    .filter((p): p is TradingPair => Boolean(p));
  const list = query ? filtered : [...recentFiltered, ...filtered.filter((p) => !recentPairs.includes(p.symbol))];

  const select = (symbol: string) => {
    setActivePair(symbol);
    addRecentPair(symbol);
    priceEngine.setPair(symbol);
    setOpen(false);
    setQuery("");
    setHighlight(0);
  };

  useEffect(() => {
    if (!open) return;
    setHighlight(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    const n = list.length;
    if (n === 0) return;
    setHighlight((h) => (h < 0 ? 0 : h >= n ? n - 1 : h));
  }, [list.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && list[highlight]) {
      e.preventDefault();
      select(list[highlight].symbol);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>
        <button
          type="button"
          className="text-sm font-semibold text-text-primary hover:text-accent border-3 border-border px-3 py-2 bg-panel-bg shadow-brutal-press hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-smooth"
        >
          {activePair} ▾
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          className="min-w-[200px] max-w-[calc(100vw-2rem)] w-[280px] border-3 border-border bg-panel-bg p-3 shadow-brutal z-[100]"
          sideOffset={8}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Input
            ref={inputRef}
            placeholder="Search pair..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="mb-3"
          />
          <div className="max-h-64 overflow-auto border-2 border-border">
            {list.map((pair, i) => (
              <Dropdown.Item
                key={pair.symbol}
                className={cn(
                  "flex items-center justify-between px-2 py-2 text-sm cursor-pointer outline-none font-mono text-text-primary border-b border-border/50 last:border-b-0",
                  i === highlight ? "bg-accent/20 text-accent" : "hover:bg-accent/10 hover:text-accent"
                )}
                onSelect={() => select(pair.symbol)}
              >
                <span>{pair.symbol}</span>
              </Dropdown.Item>
            ))}
          </div>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
