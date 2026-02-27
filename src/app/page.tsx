"use client";

import { useState } from "react";
import { TerminalLayout } from "@/components/layout/TerminalLayout";
import { Watchlist } from "@/components/market/Watchlist";
import { TradingChart } from "@/components/chart/TradingChart";
import { ChartToolbar } from "@/components/chart/ChartToolbar";
import { ChartOverlay } from "@/components/chart/ChartOverlay";
import { OrderPanel } from "@/components/trading/OrderPanel";
import { OrderBook } from "@/components/trading/OrderBook";
import { Positions } from "@/components/portfolio/Positions";
import { OrderHistory } from "@/components/portfolio/OrderHistory";
import { BalanceBar } from "@/components/portfolio/BalanceBar";
import { CommandPalette } from "@/components/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  // #region agent log
  if (typeof fetch !== "undefined") {
    fetch("http://127.0.0.1:7259/ingest/c132c345-0d90-492d-8f59-aacafebf4960", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "page.tsx:Home",
        message: "Home entered",
        data: {},
        timestamp: Date.now(),
        hypothesisId: "H2,H3,H5",
      }),
    }).catch(() => {});
  }
  // #endregion
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOverlay, setShortcutsOverlay] = useState(false);
  useKeyboardShortcuts({
    onFocusBuy: () => document.getElementById("order-amount")?.focus(),
    onFocusSell: () => document.getElementById("order-amount")?.focus(),
    onCommandPalette: () => setCommandOpen(true),
    onShortcutsOverlay: setShortcutsOverlay,
  });

  return (
    <>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      {shortcutsOverlay && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 animate-fade-in"
          onClick={() => setShortcutsOverlay(false)}
          role="dialog"
          aria-label="Keyboard shortcuts"
        >
          <div className="border-3 border-border bg-panel-bg p-5 max-w-sm text-sm text-text-primary shadow-brutal animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-3 uppercase tracking-wide">Shortcuts</h3>
            <ul className="space-y-2 text-text-secondary font-semibold">
              <li>B — Focus buy</li>
              <li>S — Focus sell</li>
              <li>/ — Search</li>
              <li>1–5 — Switch pair</li>
              <li>Cmd+K — Command palette</li>
              <li>? — This overlay</li>
              <li>Esc — Close</li>
            </ul>
          </div>
        </div>
      )}
    <TerminalLayout
      sidebar={<ErrorBoundary><Watchlist /></ErrorBoundary>}
      chart={
        <ErrorBoundary>
        <div className="relative flex flex-col h-full">
          <div className="flex-shrink-0 px-3 py-2 flex items-center justify-between border-b-3 border-border">
            <ChartToolbar />
          </div>
          <div className="flex-1 min-h-0 relative">
            <TradingChart />
            <ChartOverlay />
          </div>
        </div>
        </ErrorBoundary>
      }
      orderPanel={
        <>
          <ErrorBoundary><OrderPanel /></ErrorBoundary>
          <ErrorBoundary><OrderBook /></ErrorBoundary>
        </>
      }
      bottom={
        <>
          <BalanceBar />
          <div className="flex gap-4 mt-2">
            <div className="flex-1 min-w-0">
              <ErrorBoundary><Positions /></ErrorBoundary>
            </div>
            <div className="flex-1 min-w-0">
              <ErrorBoundary><OrderHistory /></ErrorBoundary>
            </div>
          </div>
        </>
      }
    />
    </>
  );
}
