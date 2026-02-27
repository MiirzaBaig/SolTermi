export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type TimeInForce = "GTC" | "IOC" | "FOK";

export interface Order {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  amount: string;
  price?: string;
  timeInForce?: TimeInForce;
  status: "pending" | "filled" | "cancelled" | "failed";
  filledAmount?: string;
  averageFillPrice?: string;
  createdAt: number;
  updatedAt: number;
  txHash?: string;
}

export interface Trade {
  id: string;
  pair: string;
  side: OrderSide;
  amount: string;
  price: string;
  fee?: string;
  txHash: string;
  timestamp: number;
}

export interface Position {
  id: string;
  pair: string;
  side: OrderSide;
  size: string;
  entryPrice: string;
  currentPrice: string;
  unrealizedPnl: string;
  unrealizedPnlPercent: string;
  createdAt: number;
  averageFillPrice?: string;
  feesPaid?: string;
}

export interface OrderBookLevel {
  price: string;
  size: string;
  total: string;
}

export interface OrderBookSnapshot {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: string;
  spreadPercent: string;
}
