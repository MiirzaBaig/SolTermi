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
import { Menu } from "lucide-react";

export function Header({
  onMenuClick,
  menuOpen,
}: {
  onMenuClick?: () => void;
  menuOpen?: boolean;
}) {
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
    <div className="flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-5 border-b-3 border-border">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 p-2 -ml-1 border-2 border-border bg-panel-bg text-text-primary hover:bg-accent/20 hover:text-accent transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="font-bold text-sm sm:text-lg tracking-tighter text-text-primary uppercase truncate">
            SOL TERMINAL
          </span>
          <span
            className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-profit border-2 border-border shrink-0"
            title="Connected"
            aria-hidden
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <TokenPairSelector />
          <span className="text-sm sm:text-base text-text-primary tabular-nums font-semibold truncate min-w-0 max-w-[80px] sm:max-w-none">
            {formatPrice(price)}
          </span>
          <span
            className={cn(
              "hidden sm:inline text-sm sm:text-base font-bold tabular-nums flex-shrink-0",
              change24h >= 0 ? "text-profit" : "text-loss"
            )}
          >
            {formatPercent(change24h)}
          </span>
        </div>
        <div className="hidden md:block flex-shrink-0">
          <MarketStats />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <Badge variant="outline" className="hidden sm:inline-flex">Mainnet</Badge>
        <WalletButton className="max-w-[140px] sm:max-w-none truncate" />
      </div>
    </div>
  );
}
