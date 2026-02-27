"use client";

import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTradingStore } from "@/stores/tradingStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { priceEngine } from "@/lib/priceEngine";
import { useTradeExecution } from "@/hooks/useTradeExecution";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SlippageSettings } from "./SlippageSettings";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import Decimal from "decimal.js";

const MAX_ORDER_USD = 5000;
const DAILY_LOSS_CAP_USD = 300;
const HIGH_SLIPPAGE_WARN_PCT = 1.0;
const STALE_QUOTE_MS = 10000;

function dayKeyNow(): string {
  return new Date().toISOString().slice(0, 10);
}

export function OrderPanel() {
  const activePair = useTradingStore((s) => s.activePair);
  const orderBook = useTradingStore((s) => s.orderBook);
  const limitPriceFromBook = useTradingStore((s) => s.limitPriceFromBook);
  const setLimitPriceFromBook = useTradingStore((s) => s.setLimitPriceFromBook);
  const slippagePercent = useSettingsStore((s) => s.slippagePercent);
  const priorityFee = useSettingsStore((s) => s.priorityFee);
  const mevProtection = useSettingsStore((s) => s.mevProtection);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [highSlipAcknowledged, setHighSlipAcknowledged] = useState(false);
  const [lastQuoteAt, setLastQuoteAt] = useState(Date.now());
  const [nowMs, setNowMs] = useState(Date.now());
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [submitPulse, setSubmitPulse] = useState(false);
  const [dailyRisk, setDailyRisk] = useState<{ day: string; usedUsd: number }>({
    day: dayKeyNow(),
    usedUsd: 0,
  });
  const { execute } = useTradeExecution();
  const { addToast } = useToast();
  const { connected } = useWallet();
  const balances = usePortfolioStore((s) => s.balances);

  const price = priceEngine.getCurrentPrice();
  const amountNum = parseFloat(amount) || 0;
  const slippageNum = Math.max(0, parseFloat(slippagePercent) || 0.5);
  const limitPriceNum = parseFloat(limitPrice) || price;
  const effectivePrice = orderType === "limit" ? limitPriceNum : price;
  const estimatedOutput = amountNum * effectivePrice;
  const feePct = 0.22;
  const networkFeeUsd =
    priorityFee === "turbo" ? 0.09 : priorityFee === "fast" ? 0.05 : 0.02;
  const baseSymbol = activePair.split("/")[0] ?? "SOL";
  const quoteSymbol = activePair.split("/")[1] ?? "USDC";
  const baseBalanceRaw = balances.find((b) => b.symbol === baseSymbol)?.amount ?? "0";
  const quoteBalanceRaw = balances.find((b) => b.symbol === quoteSymbol)?.amount ?? "0";
  const baseBalanceNum = parseFloat(baseBalanceRaw) || 0;
  const quoteBalanceNum = parseFloat(quoteBalanceRaw) || 0;

  const notionalUsd = amountNum * effectivePrice;
  const dexFeeUsd = notionalUsd * (feePct / 100);
  const route = mevProtection
    ? "Jupiter -> Meteora DLMM (MEV shield)"
    : "Jupiter -> Raydium CLMM";
  const spreadPct = Math.max(0, parseFloat(orderBook?.spreadPercent ?? "0"));
  const depthLevels =
    side === "buy"
      ? (orderBook?.asks.slice(0, 5) ?? [])
      : (orderBook?.bids.slice(-5).reverse() ?? []);
  const topDepthUsd = depthLevels.reduce((acc, lvl) => {
    return acc + (parseFloat(lvl.price) || 0) * (parseFloat(lvl.size) || 0);
  }, 0);
  const liquidityUsd = topDepthUsd > 0 ? topDepthUsd : Math.max(notionalUsd * 2, 50000);
  const priceImpact = orderType === "market"
    ? Math.min(4.5, ((notionalUsd / Math.max(liquidityUsd, 1)) * 100) * 0.35)
    : 0;
  const estSlipPct =
    orderType === "market" ? Math.max(spreadPct / 2, priceImpact * 0.7) : 0;
  const totalFeeUsd = dexFeeUsd + networkFeeUsd;
  const estimatedLossBudgetUsd = (notionalUsd * estSlipPct) / 100 + totalFeeUsd;
  const requiredQuote = notionalUsd + totalFeeUsd;
  const quoteStale = nowMs - lastQuoteAt > STALE_QUOTE_MS;
  const highSlippage = slippageNum >= HIGH_SLIPPAGE_WARN_PCT || estSlipPct >= HIGH_SLIPPAGE_WARN_PCT;
  const qualityTier = highSlippage || priceImpact > 1.5 ? "Risky" : priceImpact > 0.5 ? "Fair" : "Good";

  const activeRiskDay = dailyRisk.day === dayKeyNow() ? dailyRisk : { day: dayKeyNow(), usedUsd: 0 };
  const dailyLossUsed = activeRiskDay.usedUsd;
  const dailyLossRemaining = Math.max(0, DAILY_LOSS_CAP_USD - dailyLossUsed);

  const handleSubmit = async () => {
    if (!amount || amountNum <= 0) return;
    setInlineError(null);

    if (!connected) {
      addToast({
        title: "Wallet not connected",
        description: "Connect a wallet before placing orders.",
        variant: "error",
      });
      return;
    }

    if (quoteStale) {
      addToast({
        title: "Quote stale",
        description: "Market quote is stale. Wait for a fresh tick and try again.",
        variant: "error",
      });
      return;
    }

    if (notionalUsd > MAX_ORDER_USD) {
      addToast({
        title: "Order blocked by risk control",
        description: `Max order notional is $${MAX_ORDER_USD.toFixed(0)}.`,
        variant: "error",
      });
      return;
    }

    if (dailyLossUsed + estimatedLossBudgetUsd > DAILY_LOSS_CAP_USD) {
      addToast({
        title: "Daily loss cap reached",
        description: `Risk budget remaining: $${dailyLossRemaining.toFixed(2)}.`,
        variant: "error",
      });
      return;
    }

    if (side === "buy" && requiredQuote > quoteBalanceNum) {
      addToast({
        title: "Insufficient balance",
        description: `Need ${requiredQuote.toFixed(2)} ${quoteSymbol}, have ${quoteBalanceNum.toFixed(2)}.`,
        variant: "error",
      });
      return;
    }

    if (side === "sell" && amountNum > baseBalanceNum) {
      addToast({
        title: "Insufficient balance",
        description: `Need ${amountNum.toFixed(4)} ${baseSymbol}, have ${baseBalanceNum.toFixed(4)}.`,
        variant: "error",
      });
      return;
    }

    if (highSlippage && !highSlipAcknowledged) {
      addToast({
        title: "High-slippage confirmation required",
        description: "Acknowledge high slippage in the confirmation modal to proceed.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    const result = await execute({
      pair: activePair,
      side,
      type: orderType,
      amount,
      price: orderType === "limit" ? limitPrice : undefined,
      feeUsd: totalFeeUsd.toFixed(2),
    });
    setLoading(false);
    setConfirmOpen(false);
    setHighSlipAcknowledged(false);
    if (result.success) {
      setDailyRisk((prev) => {
        const day = dayKeyNow();
        const baseline = prev.day === day ? prev.usedUsd : 0;
        return {
          day,
          usedUsd: baseline + estimatedLossBudgetUsd,
        };
      });
      addToast({
        title: `${side === "buy" ? "Bought" : "Sold"} ${amount} ${baseSymbol}`,
        description: result.txHash ? `Tx: ${result.txHash}` : undefined,
        variant: "success",
      });
      setSubmitPulse(true);
      setTimeout(() => setSubmitPulse(false), 220);
      setAmount("");
      setLimitPrice("");
      setLimitPriceFromBook(null);
    } else {
      addToast({ title: "Order failed", description: result.error, variant: "error" });
    }
  };

  useEffect(() => {
    if (limitPriceFromBook) setLimitPrice(limitPriceFromBook);
  }, [limitPriceFromBook]);

  useEffect(() => {
    const unsub = priceEngine.subscribe(() => setLastQuoteAt(Date.now()));
    return unsub;
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!confirmOpen) setHighSlipAcknowledged(false);
  }, [confirmOpen]);

  useEffect(() => {
    const handler = () => {
      setSide("buy");
      setOrderType("market");
      setAmount("1");
      setConfirmOpen(false);
      setInlineError(null);
    };
    window.addEventListener("solterminal:load-demo-trade", handler);
    return () => window.removeEventListener("solterminal:load-demo-trade", handler);
  }, []);

  const setAmountPct = (pct: number) => {
    setInlineError(null);
    if (side === "buy") {
      const quotePortion = new Decimal(quoteBalanceNum).times(pct / 100);
      if (effectivePrice <= 0) return;
      setAmount(quotePortion.div(effectivePrice).toDecimalPlaces(6).toFixed());
      return;
    }
    const basePortion = new Decimal(baseBalanceNum).times(pct / 100);
    setAmount(basePortion.toDecimalPlaces(6).toFixed());
  };

  return (
    <div className="flex flex-col p-2 sm:p-3 border-b-3 border-border min-w-0">
      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <Tabs.Root value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")}>
          <Tabs.List className="flex border-2 border-border">
            <Tabs.Trigger value="market" className="px-3 py-2 text-xs font-semibold border-r-2 border-border data-[state=active]:bg-accent data-[state=active]:text-terminal-bg transition-all duration-smooth">Market</Tabs.Trigger>
            <Tabs.Trigger value="limit" className="px-3 py-2 text-xs font-semibold data-[state=active]:bg-accent data-[state=active]:text-terminal-bg transition-all duration-smooth">Limit</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        <SlippageSettings />
      </div>

      <div className="flex gap-1 mb-2">
        <Button
          size="sm"
          variant={side === "buy" ? "buy" : "ghost"}
          className="flex-1"
          onClick={() => setSide("buy")}
        >
          Buy
        </Button>
        <Button
          size="sm"
          variant={side === "sell" ? "sell" : "ghost"}
          className="flex-1"
          onClick={() => setSide("sell")}
        >
          Sell
        </Button>
      </div>

      {orderType === "limit" && (
        <div className="mb-2">
          <label className="text-xs text-text-secondary block mb-1">Price</label>
          <Input
            type="number"
            placeholder={formatPrice(price)}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
          />
        </div>
      )}

      <div className="mb-2">
        <label className="text-xs text-text-secondary block mb-1">Amount {baseSymbol}</label>
        <Input
          id="order-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setInlineError(null);
          }}
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {[25, 50, 75, 100].map((p) => (
            <Button key={p} size="sm" variant="ghost" onClick={() => setAmountPct(p)}>
              {p}%
            </Button>
          ))}
        </div>
        {inlineError && <div className="text-xs text-loss mt-1">{inlineError}</div>}
      </div>

      <div className="text-xs text-text-secondary mb-2">
        Est. output: <span className="font-mono text-text-primary">{formatPrice(estimatedOutput)} {quoteSymbol}</span>
      </div>

      <div className="mb-3 border-2 border-border p-2.5 text-xs font-mono space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-1 mb-1">
          <span
            className={cn(
              "border px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
              qualityTier === "Good"
                ? "border-profit text-profit"
                : qualityTier === "Fair"
                ? "border-yellow-500 text-yellow-500"
                : "border-loss text-loss"
            )}
          >
            {qualityTier} Fill
          </span>
          {mevProtection && <span className="border border-accent px-1.5 py-0.5 text-[10px] text-accent uppercase tracking-wide">MEV Shield</span>}
          {highSlippage && <span className="border border-loss px-1.5 py-0.5 text-[10px] text-loss uppercase tracking-wide">High Slip</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-secondary shrink-0">Route</span>
          <span className="truncate text-right min-w-0">{route}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-secondary shrink-0">Price impact</span>
          <span className={cn("tabular-nums shrink-0", priceImpact > 2 ? "text-loss" : priceImpact > 0.5 ? "text-yellow-500" : "text-profit")}>
            {priceImpact.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-secondary shrink-0">Est. slippage</span>
          <span className="tabular-nums shrink-0">{estSlipPct.toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-secondary shrink-0" title="DEX + network">Fees</span>
          <span className="tabular-nums shrink-0">${totalFeeUsd.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-1.5">
          <span className="text-text-secondary shrink-0" title="Daily loss cap">Risk budget</span>
          <span className="tabular-nums shrink-0 whitespace-nowrap">
            ${dailyLossUsed.toFixed(2)} / ${DAILY_LOSS_CAP_USD.toFixed(0)}
          </span>
        </div>
      </div>

      {(quoteStale || notionalUsd > MAX_ORDER_USD || dailyLossUsed + estimatedLossBudgetUsd > DAILY_LOSS_CAP_USD) && (
        <div className="text-xs mb-2 text-loss">
          {quoteStale && <div>Quote stale. Waiting for fresh market data.</div>}
          {notionalUsd > MAX_ORDER_USD && <div>Order exceeds max notional (${MAX_ORDER_USD.toFixed(0)}).</div>}
          {dailyLossUsed + estimatedLossBudgetUsd > DAILY_LOSS_CAP_USD && (
            <div>Order would breach daily loss cap (${DAILY_LOSS_CAP_USD.toFixed(0)}).</div>
          )}
        </div>
      )}

      <Button
        className={cn(
          "transition-opacity duration-200",
          submitPulse && "animate-success-pulse",
          side === "buy" ? "bg-profit hover:bg-profit/90" : "bg-loss hover:bg-loss/90"
        )}
        onClick={() => {
          setInlineError(null);
          if (!amount || amountNum <= 0) {
            setInlineError("Enter an amount greater than 0.");
            return;
          }
          if (side === "buy" && requiredQuote > quoteBalanceNum) {
            setInlineError(`Insufficient ${quoteSymbol}. Need ${requiredQuote.toFixed(2)}, have ${quoteBalanceNum.toFixed(2)}.`);
            return;
          }
          if (side === "sell" && amountNum > baseBalanceNum) {
            setInlineError(`Insufficient ${baseSymbol}. Need ${amountNum.toFixed(4)}, have ${baseBalanceNum.toFixed(4)}.`);
            return;
          }
          setConfirmOpen(true);
        }}
        disabled={!amount || amountNum <= 0 || loading || !connected}
      >
        {loading ? "Submitting..." : orderType === "market" ? "Swap" : "Place Order"}
      </Button>
      {loading && <div className="text-[11px] text-text-secondary mt-1 animate-loading-pulse">Estimating route and fees...</div>}

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-fade-in" aria-modal>
          <div className="bg-panel-bg border-3 border-border p-4 sm:p-5 max-w-sm w-full shadow-brutal animate-zoom-in max-h-[90vh] overflow-auto">
            <p className="text-sm font-mono mb-2">
              {side === "buy" ? "Buy" : "Sell"} {amount} {baseSymbol} at {orderType === "market" ? "market" : formatPrice(limitPriceNum)}?
            </p>
            <div className="text-xs font-mono mb-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Expected cost</span>
                <span>${estimatedLossBudgetUsd.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Fees</span>
                <span>${totalFeeUsd.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Route</span>
                <span>{mevProtection ? "Shielded" : "Best price"}</span>
              </div>
            </div>
            {highSlippage && (
              <label className="flex items-start gap-2 text-xs mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highSlipAcknowledged}
                  onChange={(e) => setHighSlipAcknowledged(e.target.checked)}
                  className="mt-0.5 border-2 border-border"
                />
                <span className="text-yellow-500">
                  Slippage is elevated ({Math.max(slippageNum, estSlipPct).toFixed(2)}%). I understand execution may be worse than quoted.
                </span>
              </label>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading || (highSlippage && !highSlipAcknowledged)}>
                {loading ? "Submitting..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
