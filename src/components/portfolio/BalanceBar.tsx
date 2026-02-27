"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { formatUsd, formatAmount } from "@/lib/formatters";

const MOCK_BALANCES = [
  { symbol: "SOL", amount: "25.5", usdValue: "4540" },
  { symbol: "USDC", amount: "1500", usdValue: "1500" },
  { symbol: "BONK", amount: "500000", usdValue: "22.5" },
];

export function BalanceBar() {
  const { connected } = useWallet();
  const { balances, totalUsd, setBalances, setTotalUsd } = usePortfolioStore();

  useEffect(() => {
    if (connected) {
      setBalances(MOCK_BALANCES);
      setTotalUsd(
        MOCK_BALANCES.reduce((a, b) => a + parseFloat(b.usdValue), 0).toFixed(2)
      );
    } else {
      setBalances([]);
      setTotalUsd("0");
    }
  }, [connected, setBalances, setTotalUsd]);

  if (!connected) {
    return (
      <div className="flex items-center gap-4 py-3 px-3 text-sm text-text-secondary font-semibold">
        Connect wallet to see balance
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 py-3 px-3 border-b-2 border-border flex-wrap font-semibold">
      <span className="text-text-primary tabular-nums">
        Portfolio: {formatUsd(totalUsd)}
      </span>
      {balances.map((b) => (
        <span key={b.symbol} className="text-text-secondary text-sm">
          {b.symbol}: <span className="text-text-primary tabular-nums">{formatAmount(b.amount)}</span>
        </span>
      ))}
    </div>
  );
}
