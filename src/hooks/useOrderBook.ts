"use client";

import { useEffect, useRef, useState } from "react";
import { useTradingStore } from "@/stores/tradingStore";
import { priceEngine } from "@/lib/priceEngine";
import type { OrderBookSnapshot, OrderBookLevel } from "@/types/trading";
import Decimal from "decimal.js";

function generateLevels(center: number, count: number, spread: number): OrderBookLevel[] {
  const levels: OrderBookLevel[] = [];
  let total = new Decimal(0);
  for (let i = 0; i < count; i++) {
    const price = center - spread * (i + 1);
    const size = (Math.random() * 1000 + 100).toFixed(2);
    total = total.plus(size);
    levels.push({ price: price.toFixed(4), size, total: total.toFixed(2) });
  }
  return levels.reverse();
}

function generateAsks(center: number, count: number, spread: number): OrderBookLevel[] {
  const levels: OrderBookLevel[] = [];
  let total = new Decimal(0);
  for (let i = 0; i < count; i++) {
    const price = center + spread * (i + 1);
    const size = (Math.random() * 1000 + 100).toFixed(2);
    total = total.plus(size);
    levels.push({ price: price.toFixed(4), size, total: total.toFixed(2) });
  }
  return levels;
}

export function useOrderBook() {
  const activePair = useTradingStore((s) => s.activePair);
  const setOrderBook = useTradingStore((s) => s.setOrderBook);
  const [snapshot, setSnapshot] = useState<OrderBookSnapshot | null>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const unsub = priceEngine.subscribe(({ candles }) => {
      if (candles.length === 0) return;
      const now = Date.now();
      if (now - lastUpdateRef.current < 220) return;
      lastUpdateRef.current = now;
      const mid = candles[candles.length - 1].close;
      const spread = mid * 0.0002;
      const bids = generateLevels(mid, 15, spread);
      const asks = generateAsks(mid, 15, spread);
      const bestBid = parseFloat(bids[bids.length - 1]?.price ?? "0");
      const bestAsk = parseFloat(asks[0]?.price ?? "0");
      const spreadVal = bestAsk - bestBid;
      const spreadPct = (spreadVal / mid) * 100;
      const ob: OrderBookSnapshot = {
        bids,
        asks,
        spread: spreadVal.toFixed(4),
        spreadPercent: spreadPct.toFixed(2),
      };
      setSnapshot(ob);
      setOrderBook(ob);
    });
    return unsub;
  }, [activePair, setOrderBook]);

  return snapshot;
}
