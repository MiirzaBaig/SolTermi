export interface Token {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logo?: string;
  coingeckoId?: string;
}

export interface TradingPair {
  base: string;
  quote: string;
  symbol: string; // e.g. "SOL/USDC"
}

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = "1m" | "5m" | "15m" | "1H" | "4H" | "1D" | "1W";

export interface MarketStats {
  price: string;
  change24h: string;
  change24hPercent: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  marketCap?: string;
  liquidity?: string;
}

export interface PriceTick {
  price: number;
  timestamp: number;
}
