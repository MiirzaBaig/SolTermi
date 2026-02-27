"use client";

import { useTradingStore } from "@/stores/tradingStore";
import { priceEngine } from "@/lib/priceEngine";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatPercent } from "@/lib/formatters";
import { WalletButton } from "@/components/wallet/WalletButton";
import { TokenPairSelector } from "@/components/market/TokenPairSelector";
import { MarketStats } from "@/components/market/MarketStats";
import { cn } from "@/lib/cn";

export function Header() {
  const activePair = useTradingStore((s) => s.activePair);
  const [price, setPrice] = useState(priceEngine.getCurrentPrice());
  const [change24h, setChange24h] = useState(0);

  useEffect(() => {
    const unsub = priceEngine.subscribe(({ candles }) => {
      if (candles.length > 0) setPrice(candles[candles.length - 1].close);
      if (candles.length >= 2) {
        const prev = candles[candles.length - 24] ?? candles[0];
        const curr = candles[candles.length - 1];
        setChange24h(((curr.close - prev.close) / prev.close) * 100);
      }
    });
    return unsub;
  }, [activePair]);

  return (
    <div className="flex h-16 items-center justify-between px-5 border-b-3 border-border">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tighter text-text-primary uppercase">
            SOL TERMINAL
          </span>
          <span
            className="h-2.5 w-2.5 bg-profit border-2 border-border shrink-0"
            title="Connected"
            aria-hidden
          />
        </div>

        <div className="flex items-center gap-4">
          <TokenPairSelector />
          <span className="text-base text-text-primary tabular-nums font-semibold transition-opacity duration-200">{formatPrice(price)}</span>
          <span
            className={cn(
              "text-base font-bold tabular-nums transition-opacity duration-200",
              change24h >= 0 ? "text-profit" : "text-loss"
            )}
          >
            {formatPercent(change24h)}
          </span>
        </div>
        <div className="hidden md:block">
          <MarketStats />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline">Mainnet</Badge>
        <WalletButton />
      </div>
    </div>
  );
}
