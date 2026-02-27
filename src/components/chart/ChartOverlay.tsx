"use client";

import { memo, useEffect, useState } from "react";
import { priceEngine } from "@/lib/priceEngine";
import { formatPrice, formatVolume } from "@/lib/formatters";

interface CrosshairData {
  o: number;
  h: number;
  l: number;
  c: number;
  volume: number;
  time: number;
}

export const ChartOverlay = memo(function ChartOverlay() {
  const [crosshair] = useState<CrosshairData | null>(null);
  const [price, setPrice] = useState(priceEngine.getCurrentPrice());

  useEffect(() => {
    const unsub = priceEngine.subscribe(({ candles }) => {
      if (candles.length === 0) return;
      setPrice(candles[candles.length - 1].close);
    });
    return unsub;
  }, []);

  return (
    <div className="absolute bottom-2 left-2 flex flex-col gap-1 text-xs font-mono">
      {crosshair ? (
        <>
          <span>O {formatPrice(crosshair.o)}</span>
          <span>H {formatPrice(crosshair.h)}</span>
          <span>L {formatPrice(crosshair.l)}</span>
          <span>C {formatPrice(crosshair.c)}</span>
          <span>Vol {formatVolume(crosshair.volume)}</span>
          <span className="text-text-secondary">{new Date(crosshair.time * 1000).toLocaleString()}</span>
        </>
      ) : (
        <span className="text-text-secondary transition-opacity duration-200">Live: {formatPrice(price)}</span>
      )}
    </div>
  );
});
