"use client";

import { memo, useEffect } from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { priceEngine } from "@/lib/priceEngine";
import { useTradingStore } from "@/stores/tradingStore";
import { formatPrice, formatPercent } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import Decimal from "decimal.js";

export const Positions = memo(function Positions() {
  const positions = usePortfolioStore((s) => s.positions);
  const removePosition = usePortfolioStore((s) => s.removePosition);
  const activePair = useTradingStore((s) => s.activePair);

  useEffect(() => {
    const unsub = priceEngine.subscribe(({ candles }) => {
      if (candles.length === 0) return;
      const price = candles[candles.length - 1].close;
      const currentPositions = usePortfolioStore.getState().positions;
      currentPositions.forEach((pos) => {
        if (pos.pair !== activePair) return;
        const entry = new Decimal(pos.entryPrice);
        const current = new Decimal(price);
        const pnlPct = entry.isZero() ? new Decimal(0) : current.minus(entry).div(entry).times(100);
        const size = new Decimal(pos.size);
        const pnl = size.times(current.minus(entry));
        usePortfolioStore.getState().updatePosition(pos.id, {
          currentPrice: current.toFixed(),
          unrealizedPnl: pnl.toFixed(),
          unrealizedPnlPercent: pnlPct.toFixed(2),
        });
      });
    });
    return unsub;
  }, [activePair]);

  return (
    <div className="text-xs">
      <div className="grid grid-cols-7 gap-1 px-2 py-2 text-text-secondary border-b-2 border-border font-bold uppercase">
        <span>Pair</span>
        <span>Side</span>
        <span>Size</span>
        <span>Entry</span>
        <span>Price</span>
        <span>PnL</span>
        <span>Actions</span>
      </div>
      {positions.length === 0 ? (
        <div className="p-4 text-text-secondary text-center">
          <div>No open positions</div>
          <button
            type="button"
            className="mt-2 text-accent underline underline-offset-2 hover:text-accent/80"
            onClick={() => window.dispatchEvent(new CustomEvent("solterminal:load-demo-trade"))}
          >
            Start paper trade tutorial
          </button>
        </div>
      ) : (
        positions.map((pos) => {
          const pnl = parseFloat(pos.unrealizedPnl);
          return (
            <div
              key={pos.id}
              className={cn(
                "grid grid-cols-7 gap-1 px-2 py-2 border-b-2 border-border font-semibold transition-opacity duration-200",
                pnl >= 0 ? "bg-profit/10" : "bg-loss/10"
              )}
            >
              <span className="font-mono">{pos.pair}</span>
              <span className={pos.side === "buy" ? "text-profit" : "text-loss"}>{pos.side}</span>
              <span className="font-mono">{pos.size}</span>
              <span className="font-mono">{formatPrice(pos.entryPrice)}</span>
              <span className="font-mono">{formatPrice(pos.currentPrice)}</span>
              <span className={cn("font-mono", pnl >= 0 ? "text-profit" : "text-loss")}>
                {formatPrice(pos.unrealizedPnl)} ({formatPercent(pos.unrealizedPnlPercent)})
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="danger" onClick={() => removePosition(pos.id)}>
                  Close
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
});
