import type { OHLCV } from "@/types/market";

const now = Math.floor(Date.now() / 1000);

export function generateSeedCandles(
  pairSymbol: string,
  basePrice: number,
  count: number,
  intervalSeconds: number
): OHLCV[] {
  const candles: OHLCV[] = [];
  let price = basePrice;
  let time = now - count * intervalSeconds;

  for (let i = 0; i < count; i++) {
    const volatility = 0.002;
    const change = (Math.random() - 0.5) * 2 * volatility * price;
    const open = price;
    price = price + change;
    const high = Math.max(open, price) * (1 + Math.random() * 0.001);
    const low = Math.min(open, price) * (1 - Math.random() * 0.001);
    const volume = Math.random() * 1e6 + 1e4;
    candles.push({
      time,
      open,
      high,
      low,
      close: price,
      volume,
    });
    time += intervalSeconds;
  }

  return candles;
}

export const MOCK_INITIAL_PRICES: Record<string, number> = {
  "SOL/USDC": 178.5,
  "BONK/SOL": 0.000025,
  "WIF/USDC": 2.85,
  "JUP/SOL": 0.085,
  "JTO/USDC": 2.1,
  "RAY/USDC": 1.2,
  "PYTH/USDC": 0.35,
  "ORCA/SOL": 0.012,
  "mSOL/SOL": 1.02,
  "BONK/USDC": 0.0000045,
  "WIF/SOL": 0.016,
  "JUP/USDC": 15.2,
  "RENDER/USDC": 7.5,
  "HNT/USDC": 4.2,
  "MNDE/SOL": 0.028,
};

export function getBasePriceForPair(pairSymbol: string): number {
  return MOCK_INITIAL_PRICES[pairSymbol] ?? 100;
}
