"use client";

import { memo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useTradingStore } from "@/stores/tradingStore";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { formatPrice, formatAmount } from "@/lib/formatters";

export const OrderHistory = memo(function OrderHistory() {
  const pendingOrders = useTradingStore((s) => s.pendingOrders);
  const removePendingOrder = useTradingStore((s) => s.removePendingOrder);
  const tradeHistory = usePortfolioStore((s) => s.tradeHistory);

  return (
    <Tabs.Root defaultValue="history" className="flex flex-col">
      <Tabs.List className="flex border-b-2 border-border mb-2">
        <Tabs.Trigger value="open" className="px-3 py-2 text-xs font-bold border-r-2 border-border data-[state=active]:bg-accent data-[state=active]:text-terminal-bg transition-colors">
          Open
        </Tabs.Trigger>
        <Tabs.Trigger value="history" className="px-3 py-2 text-xs font-bold data-[state=active]:bg-accent data-[state=active]:text-terminal-bg transition-colors">
          History
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="open" className="text-xs overflow-auto max-h-32 data-[state=inactive]:hidden">
        {pendingOrders.length === 0 ? (
          <div className="p-3 text-text-secondary font-semibold">No open orders</div>
        ) : (
          pendingOrders.map((o) => (
            <div key={o.id} className="grid grid-cols-5 gap-1 px-2 py-2 border-b border-border font-semibold">
              <span className="tabular-nums">{o.pair}</span>
              <span className={o.side === "buy" ? "text-profit" : "text-loss"}>{o.side}</span>
              <span className="tabular-nums">{formatAmount(o.amount)}</span>
              <span className="tabular-nums">{o.price ?? "—"}</span>
              <button
                type="button"
                onClick={() => removePendingOrder(o.id)}
                className="text-loss hover:bg-loss/20 text-left"
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </Tabs.Content>
      <Tabs.Content value="history" className="text-xs overflow-auto max-h-32 data-[state=inactive]:hidden">
        {tradeHistory.length === 0 ? (
          <div className="p-3 text-text-secondary font-semibold">
            <div>No trades yet</div>
            <button
              type="button"
              className="mt-1 text-accent underline underline-offset-2 hover:text-accent/80"
              onClick={() => window.dispatchEvent(new CustomEvent("solterminal:load-demo-trade"))}
            >
              Run one-click paper trade
            </button>
          </div>
        ) : (
          tradeHistory.map((t) => (
            <div key={t.id} className="grid grid-cols-5 gap-1 px-2 py-2 border-b border-border font-semibold">
              <span className="tabular-nums">{t.pair}</span>
              <span className={t.side === "buy" ? "text-profit" : "text-loss"}>{t.side}</span>
              <span className="tabular-nums">{formatAmount(t.amount)}</span>
              <span className="tabular-nums">{formatPrice(t.price)}</span>
              <a
                href={`https://solscan.io/tx/${t.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:bg-accent/20 truncate"
              >
                {t.txHash.slice(0, 8)}…
              </a>
            </div>
          ))
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
});
