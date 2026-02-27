"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useTradingStore } from "@/stores/tradingStore";
import { priceEngine } from "@/lib/priceEngine";
import { formatPrice, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";

const DEFAULT_WATCHLIST = ["SOL/USDC", "BONK/SOL", "WIF/USDC", "JUP/SOL", "JTO/USDC"];

interface WatchRow {
  price: number;
  change: number;
  spread: number;
  liquidity: number;
  history: number[];
}

function pushHistory(list: number[], value: number): number[] {
  return [...list.slice(-23), value];
}

export const Watchlist = memo(function Watchlist() {
  const activePair = useTradingStore((s) => s.activePair);
  const setActivePair = useTradingStore((s) => s.setActivePair);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [prices, setPrices] = useState<Record<string, WatchRow>>({});

  useEffect(() => {
    const unsub = priceEngine.subscribe(({ candles }) => {
      if (candles.length < 2) return;
      const last = candles[candles.length - 1];
      const prev = candles[Math.max(0, candles.length - 24)] ?? candles[0];
      const spread = (last.close * 0.00025) / last.close * 100;
      const liquidity = Math.max(25000, last.close * 950);
      setPrices((p) => ({
        ...p,
        [priceEngine.getPair()]: {
          price: last.close,
          change: ((last.close - prev.close) / prev.close) * 100,
          spread,
          liquidity,
          history: pushHistory(p[priceEngine.getPair()]?.history ?? [], last.close),
        },
      }));
    });
    priceEngine.setPair(activePair);
    return unsub;
  }, [activePair]);

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next: Record<string, WatchRow> = { ...prev };
        DEFAULT_WATCHLIST.forEach((symbol) => {
          if (symbol === activePair) return;
          const current = next[symbol];
          if (!current || current.price <= 0) return;
          const nudged = current.price * (1 + (Math.random() - 0.5) * 0.0009);
          next[symbol] = {
            ...current,
            price: nudged,
            history: pushHistory(current.history, nudged),
          };
        });
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, [activePair]);

  useEffect(() => {
    const i = DEFAULT_WATCHLIST.findIndex((x) => x === activePair);
    if (i >= 0) setHighlightIndex(i);
  }, [activePair]);

  const onKeyDown: React.KeyboardEventHandler<HTMLUListElement> = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(DEFAULT_WATCHLIST.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const symbol = DEFAULT_WATCHLIST[highlightIndex];
      if (!symbol) return;
      setActivePair(symbol);
      priceEngine.setPair(symbol);
    }
  };

  const rows = useMemo(() => DEFAULT_WATCHLIST, []);
  const isBooting = Object.keys(prices).length === 0;

  return (
    <ul
      className="space-y-3 outline-none"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Watchlist"
    >
      {isBooting
        ? rows.map((symbol) => (
          <li key={`skeleton-${symbol}`}>
            <div className="w-full px-3 py-3 border-3 border-border bg-panel-bg">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </li>
        ))
        : rows.map((symbol, idx) => {
        const data = prices[symbol] ?? { price: 0, change: 0, spread: 0, liquidity: 0, history: [] };
        const isActive = activePair === symbol;
        const isHighlighted = idx === highlightIndex;
        const trend = data.history.length > 1 && data.history[data.history.length - 1] >= data.history[0];
        const max = Math.max(...data.history, 1);
        const min = Math.min(...data.history, 0);
        const points = data.history
          .map((v, i) => {
            const x = (i / Math.max(1, data.history.length - 1)) * 36;
            const y = max === min ? 6 : 12 - ((v - min) / (max - min)) * 12;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ");
        return (
          <li key={symbol}>
            <button
              type="button"
              onClick={() => {
                setActivePair(symbol);
                priceEngine.setPair(symbol);
              }}
              className={cn(
                "w-full text-left px-3 py-3 flex items-center justify-between gap-2 border-3 bg-panel-bg font-bold text-sm uppercase tracking-wide min-w-0",
                "shadow-brutal-press hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-smooth ease-smooth",
                isActive
                  ? "border-accent bg-accent/10 text-accent shadow-[4px_4px_0px_#FFE600]"
                  : "border-border hover:border-accent/50 hover:bg-accent/5",
                isHighlighted && !isActive && "ring-2 ring-accent/40 ring-offset-0"
              )}
            >
              <div className="min-w-0">
                <span className="tabular-nums truncate min-w-0 block">{symbol}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full border border-border",
                      data.spread > 0.45 ? "bg-loss" : data.liquidity < 60000 ? "bg-yellow-500" : "bg-profit"
                    )}
                    title="Spread/Liquidity health"
                  />
                  <svg viewBox="0 0 36 12" className="w-14 h-3">
                    <polyline
                      fill="none"
                      stroke={trend ? "#00FF41" : "#FF3366"}
                      strokeWidth="1.5"
                      points={points}
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-text-secondary text-sm tabular-nums font-semibold whitespace-nowrap transition-opacity duration-200">
                  {formatPrice(data.price)}
                </span>
                <span
                  className={cn(
                    "text-sm w-14 text-right tabular-nums font-bold whitespace-nowrap transition-opacity duration-200",
                    data.change >= 0 ? "text-profit" : "text-loss"
                  )}
                >
                  {formatPercent(data.change)}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
});
