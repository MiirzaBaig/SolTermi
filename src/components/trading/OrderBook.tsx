"use client";

import { memo } from "react";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useTradingStore } from "@/stores/tradingStore";
import { formatPrice, formatAmount } from "@/lib/formatters";
export const OrderBook = memo(function OrderBook() {
  const snapshot = useOrderBook();
  const setLimitPriceFromBook = useTradingStore((s) => s.setLimitPriceFromBook);

  if (!snapshot) {
    return (
      <div className="p-4 text-text-secondary text-sm font-semibold animate-loading-pulse transition-opacity duration-300">
        Loading order book...
      </div>
    );
  }

  const maxTotal = Math.max(
    ...snapshot.bids.map((b) => parseFloat(b.total)),
    ...snapshot.asks.map((a) => parseFloat(a.total))
  );

  return (
    <div className="flex flex-col text-sm border-t-3 border-border mt-3 pt-3 animate-fade-in">
      <div className="grid grid-cols-3 gap-1 px-2 py-2 text-text-secondary border-b-2 border-border font-bold uppercase">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      <div className="overflow-auto max-h-48">
        {[...snapshot.asks].reverse().map((row, i) => (
          <button
            type="button"
            key={`ask-${i}`}
            className="relative grid grid-cols-3 gap-1 px-2 py-1 w-full text-left text-sm hover:bg-loss/10 cursor-pointer transition-colors duration-smooth ease-smooth"
            onClick={() => setLimitPriceFromBook(row.price)}
          >
            <span className="absolute inset-0 flex justify-end" aria-hidden>
              <span className="h-full bg-loss/20" style={{ width: `${(parseFloat(row.total) / maxTotal) * 100}%` }} />
            </span>
            <span className="relative text-loss font-mono">{formatPrice(row.price)}</span>
            <span className="relative font-mono text-right text-text-primary">{formatAmount(row.size)}</span>
            <span className="relative font-mono text-right text-text-secondary">{formatAmount(row.total)}</span>
          </button>
        ))}
      </div>
      <div className="px-2 py-2 border-y-2 border-border bg-terminal-bg font-bold text-accent text-center">
        Spread {formatPrice(snapshot.spread)} ({snapshot.spreadPercent}%)
      </div>
      <div className="overflow-auto max-h-48">
        {snapshot.bids.map((row, i) => (
          <button
            type="button"
            key={`bid-${i}`}
            className="relative grid grid-cols-3 gap-1 px-2 py-1 w-full text-left text-sm hover:bg-profit/10 cursor-pointer transition-colors duration-smooth ease-smooth"
            onClick={() => setLimitPriceFromBook(row.price)}
          >
            <span className="absolute inset-0 flex justify-end" aria-hidden>
              <span className="h-full bg-profit/20" style={{ width: `${(parseFloat(row.total) / maxTotal) * 100}%` }} />
            </span>
            <span className="relative text-profit font-mono">{formatPrice(row.price)}</span>
            <span className="relative font-mono text-right text-text-primary">{formatAmount(row.size)}</span>
            <span className="relative font-mono text-right text-text-secondary">{formatAmount(row.total)}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
