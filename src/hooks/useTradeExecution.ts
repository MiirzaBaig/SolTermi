"use client";

import { useCallback } from "react";
import { useTradingStore } from "@/stores/tradingStore";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { priceEngine } from "@/lib/priceEngine";
import type { OrderSide, OrderType } from "@/types/trading";
import Decimal from "decimal.js";

export interface OrderParams {
  pair: string;
  side: OrderSide;
  type: OrderType;
  amount: string;
  price?: string;
  feeUsd?: string;
}

export interface ExecutionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export function useTradeExecution() {
  const addRecentTrade = useTradingStore((s) => s.addRecentTrade);
  const addPosition = usePortfolioStore((s) => s.addPosition);
  const addTradeToHistory = usePortfolioStore((s) => s.addTradeToHistory);

  const execute = useCallback(
    async (params: OrderParams): Promise<ExecutionResult> => {
      const { pair, side, amount, price, feeUsd } = params;
      const execPrice = price ? new Decimal(price) : new Decimal(priceEngine.getCurrentPrice());
      const amountD = new Decimal(amount);

      // Simulate network delay
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

      const fail = Math.random() < 0.05;
      if (fail) {
        return { success: false, error: "Transaction failed: Slippage exceeded" };
      }

      const txHash = `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

      const trade = {
        id: `trade_${Date.now()}`,
        pair,
        side,
        amount: amountD.toFixed(),
        price: execPrice.toFixed(),
        fee: feeUsd,
        txHash,
        timestamp: Date.now(),
      };
      addRecentTrade(trade);
      addTradeToHistory(trade);

      const positionId = `pos_${pair}_${side}_${Date.now()}`;
      addPosition({
        id: positionId,
        pair,
        side,
        size: amountD.toFixed(),
        entryPrice: execPrice.toFixed(),
        currentPrice: execPrice.toFixed(),
        unrealizedPnl: "0",
        unrealizedPnlPercent: "0",
        createdAt: Date.now(),
      });

      return { success: true, txHash };
    },
    [addRecentTrade, addTradeToHistory, addPosition]
  );

  return { execute };
}
