"use client";

import { useEffect, useState } from "react";
import { priceEngine } from "@/lib/priceEngine";
import { formatPrice, formatPercent, formatVolume } from "@/lib/formatters";
import { cn } from "@/lib/cn";

export function MarketStats() {
  const [price, setPrice] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [high24h, setHigh24h] = useState(0);
  const [low24h, setLow24h] = useState(0);
  const [volume24h, setVolume24h] = useState(0);

  useEffect(() => {
    const unsub = priceEngine.subscribe(({ candles }) => {
      if (candles.length === 0) return;
      const last = candles[candles.length - 1];
      setPrice(last.close);
      const prev = candles[Math.max(0, candles.length - 24)] ?? candles[0];
      setChange24h(((last.close - prev.close) / prev.close) * 100);
      const slice = candles.slice(-24);
      setHigh24h(Math.max(...slice.map((c) => c.high)));
      setLow24h(Math.min(...slice.map((c) => c.low)));
      setVolume24h(slice.reduce((a, c) => a + c.volume, 0));
    });
    return unsub;
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-text-primary">
      <span className="text-text-primary tabular-nums">{formatPrice(price)}</span>
      <span className={cn("tabular-nums", change24h >= 0 ? "text-profit" : "text-loss")}>
        {formatPercent(change24h)}
      </span>
      <span className="text-text-secondary">24h H <span className="text-text-primary tabular-nums">{formatPrice(high24h)}</span></span>
      <span className="text-text-secondary">24h L <span className="text-text-primary tabular-nums">{formatPrice(low24h)}</span></span>
      <span className="text-text-secondary">Vol <span className="text-text-primary tabular-nums">{formatVolume(volume24h)}</span></span>
    </div>
  );
}
