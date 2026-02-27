import { create } from "zustand";
import type { Order, OrderBookSnapshot, Trade } from "@/types/trading";
import { DEFAULT_PAIR_SYMBOL } from "@/lib/constants";
import type { Timeframe } from "@/types/market";

interface TradingState {
  activePair: string;
  timeframe: Timeframe;
  orderBook: OrderBookSnapshot | null;
  limitPriceFromBook: string | null;
  recentTrades: Trade[];
  pendingOrders: Order[];
  recentPairs: string[];
  setActivePair: (pair: string) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setOrderBook: (ob: OrderBookSnapshot | null) => void;
  setLimitPriceFromBook: (price: string | null) => void;
  addRecentTrade: (trade: Trade) => void;
  addPendingOrder: (order: Order) => void;
  removePendingOrder: (id: string) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  addRecentPair: (pair: string) => void;
  clearPendingOrders: () => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  activePair: DEFAULT_PAIR_SYMBOL,
  timeframe: "1m",
  orderBook: null,
  limitPriceFromBook: null,
  recentTrades: [],
  pendingOrders: [],
  recentPairs: [DEFAULT_PAIR_SYMBOL, "BONK/SOL", "WIF/USDC", "JUP/SOL", "JTO/USDC"],

  setLimitPriceFromBook: (limitPriceFromBook) => set({ limitPriceFromBook }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setActivePair: (pair) =>
    set((s) => ({
      activePair: pair,
      recentPairs: [pair, ...s.recentPairs.filter((p) => p !== pair)].slice(0, 10),
    })),

  setOrderBook: (orderBook) => set({ orderBook }),

  addRecentTrade: (trade) =>
    set((s) => ({
      recentTrades: [trade, ...s.recentTrades].slice(0, 50),
    })),

  addPendingOrder: (order) =>
    set((s) => ({ pendingOrders: [order, ...s.pendingOrders] })),

  removePendingOrder: (id) =>
    set((s) => ({ pendingOrders: s.pendingOrders.filter((o) => o.id !== id) })),

  updateOrder: (id, updates) =>
    set((s) => ({
      pendingOrders: s.pendingOrders.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      ),
    })),

  addRecentPair: (pair) =>
    set((s) => ({
      recentPairs: [pair, ...s.recentPairs.filter((p) => p !== pair)].slice(0, 10),
    })),

  clearPendingOrders: () => set({ pendingOrders: [] }),
}));
