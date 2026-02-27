"use client";

import { priceEngine } from "@/lib/priceEngine";
import type { Timeframe } from "@/types/market";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useTradingStore } from "@/stores/tradingStore";

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];

export function ChartToolbar() {
  const timeframe = useTradingStore((s) => s.timeframe);
  const setTimeframe = useTradingStore((s) => s.setTimeframe);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {TIMEFRAMES.map((tf) => (
        <Button
          key={tf}
          variant={timeframe === tf ? "primary" : "secondary"}
          size="sm"
          onClick={() => {
            setTimeframe(tf);
            priceEngine.setTimeframe(tf);
          }}
          className={cn(
            timeframe !== tf &&
              "focus-visible:ring-accent/20 focus-visible:ring-offset-0 hover:border-accent/20 hover:bg-panel-bg"
          )}
        >
          {tf}
        </Button>
      ))}
    </div>
  );
}
