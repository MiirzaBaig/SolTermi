import { create } from "zustand";
import type { Position, Order, Trade } from "@/types/trading";
import type { WalletBalance } from "@/types/wallet";

interface PortfolioState {
  positions: Position[];
  orders: Order[];
  tradeHistory: Trade[];
  balances: WalletBalance[];
  totalUsd: string;
  equityCurve: number[];
  setPositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  removePosition: (id: string) => void;
  addOrder: (order: Order) => void;
  addTradeToHistory: (trade: Trade) => void;
  setBalances: (balances: WalletBalance[]) => void;
  updateBalance: (symbol: string, deltaAmount: string, deltaUsd?: string) => void;
  setTotalUsd: (total: string) => void;
  appendEquityPoint: (value: number) => void;
  reset: () => void;
}

const defaultBalances: WalletBalance[] = [];

export const usePortfolioStore = create<PortfolioState>((set) => ({
  positions: [],
  orders: [],
  tradeHistory: [],
  balances: defaultBalances,
  totalUsd: "0",
  equityCurve: [],

  setPositions: (positions) => set({ positions }),

  addPosition: (position) =>
    set((s) => ({ positions: [position, ...s.positions] })),

  updatePosition: (id, updates) =>
    set((s) => ({
      positions: s.positions.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removePosition: (id) =>
    set((s) => ({ positions: s.positions.filter((p) => p.id !== id) })),

  addOrder: (order) =>
    set((s) => ({ orders: [order, ...s.orders].slice(0, 200) })),

  addTradeToHistory: (trade) =>
    set((s) => ({ tradeHistory: [trade, ...s.tradeHistory].slice(0, 200) })),

  setBalances: (balances) => set({ balances }),

  updateBalance: (symbol, deltaAmount, deltaUsd) =>
    set((s) => {
      const list = [...s.balances];
      const i = list.findIndex((b) => b.symbol === symbol);
      const current = i >= 0 ? list[i] : { symbol, amount: "0", usdValue: "0" };
      const newAmount = (parseFloat(current.amount) + parseFloat(deltaAmount)).toString();
      const newUsd = deltaUsd !== undefined ? (parseFloat(current.usdValue) + parseFloat(deltaUsd)).toString() : current.usdValue;
      if (i >= 0) {
        list[i] = { ...current, amount: newAmount, usdValue: newUsd };
      } else {
        list.push({ symbol, amount: newAmount, usdValue: newUsd });
      }
      return { balances: list };
    }),

  setTotalUsd: (totalUsd) => set({ totalUsd }),

  appendEquityPoint: (value) =>
    set((s) => ({
      equityCurve: [...s.equityCurve, value].slice(-96),
    })),

  reset: () =>
    set({
      positions: [],
      orders: [],
      tradeHistory: [],
      balances: defaultBalances,
      totalUsd: "0",
      equityCurve: [],
    }),
}));
