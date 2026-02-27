import type { OHLCV, PriceTick, Timeframe } from "@/types/market";
import { getBasePriceForPair } from "./mockData";

const timeframeSeconds: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
  "1W": 604800,
};

type Listener = (data: { candles: OHLCV[]; tick?: PriceTick }) => void;

class PriceEngineClass {
  private pairSymbol = "SOL/USDC";
  private timeframe: Timeframe = "1m";
  private candles: OHLCV[] = [];
  private intervalSeconds = 60;
  private listeners = new Set<Listener>();
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private candleInterval: ReturnType<typeof setInterval> | null = null;
  private currentPrice: number;

  constructor() {
    this.currentPrice = getBasePriceForPair(this.pairSymbol);
  }

  setPair(symbol: string) {
    this.pairSymbol = symbol;
    this.currentPrice = getBasePriceForPair(symbol);
    this.resetAndEmit();
  }

  setTimeframe(tf: Timeframe) {
    this.timeframe = tf;
    this.intervalSeconds = timeframeSeconds[tf];
    this.resetAndEmit();
  }

  private resetAndEmit() {
    this.candles = this.generateCandles(100);
    this.emit();
  }

  private generateCandles(count: number): OHLCV[] {
    const base = getBasePriceForPair(this.pairSymbol);
    let price = base;
    let time = Math.floor(Date.now() / 1000) - count * this.intervalSeconds;
    const result: OHLCV[] = [];

    for (let i = 0; i < count; i++) {
      const volatility = 0.0015;
      const meanReversion = 0.02;
      const drift = (base - price) * meanReversion * 0.1;
      const change = (Math.random() - 0.5) * 2 * volatility * price + drift;
      const open = price;
      price = price + change;
      const high = Math.max(open, price) * (1 + Math.random() * 0.0005);
      const low = Math.min(open, price) * (1 - Math.random() * 0.0005);
      const volume = Math.random() * 500000 + 50000;
      result.push({ time, open, high, low, close: price, volume });
      time += this.intervalSeconds;
    }

    this.currentPrice = price;
    return result;
  }

  private emit(tick?: PriceTick) {
    const payload: { candles: OHLCV[]; tick?: PriceTick } = { candles: [...this.candles] };
    if (tick) payload.tick = tick;
    this.listeners.forEach((fn) => fn(payload));
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    if (this.listeners.size === 1) this.startTimers();
    fn({ candles: [...this.candles] });
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0) this.stopTimers();
    };
  }

  private startTimers() {
    this.tickInterval = setInterval(() => this.tick(), 800 + Math.random() * 700);
    this.candleInterval = setInterval(() => this.advanceCandle(), this.intervalSeconds * 1000);
  }

  private stopTimers() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.candleInterval) clearInterval(this.candleInterval);
    this.tickInterval = null;
    this.candleInterval = null;
  }

  private tick() {
    const volatility = 0.0003;
    const change = (Math.random() - 0.5) * 2 * volatility * this.currentPrice;
    this.currentPrice = this.currentPrice + change;
    const last = this.candles[this.candles.length - 1];
    if (last) {
      last.close = this.currentPrice;
      last.high = Math.max(last.high, this.currentPrice);
      last.low = Math.min(last.low, this.currentPrice);
      last.volume += Math.random() * 1000;
    }
    this.emit({ price: this.currentPrice, timestamp: Date.now() });
  }

  private advanceCandle() {
    const last = this.candles[this.candles.length - 1];
    const nextTime = last ? last.time + this.intervalSeconds : Math.floor(Date.now() / 1000);
    this.candles.push({
      time: nextTime,
      open: this.currentPrice,
      high: this.currentPrice,
      low: this.currentPrice,
      close: this.currentPrice,
      volume: 0,
    });
    if (this.candles.length > 500) this.candles.shift();
    this.emit();
  }

  getCandles(): OHLCV[] {
    return [...this.candles];
  }

  getCurrentPrice(): number {
    return this.currentPrice;
  }

  getPair(): string {
    return this.pairSymbol;
  }

  getTimeframe(): Timeframe {
    return this.timeframe;
  }
}

export const priceEngine = new PriceEngineClass();
