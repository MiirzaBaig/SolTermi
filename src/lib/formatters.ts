import Decimal from "decimal.js";

export function formatPrice(price: string | number, decimals = 4): string {
  const d = new Decimal(price);
  if (d.isZero()) return "0.00";
  if (d.abs().lt(0.0001)) return d.toSignificantDigits(2).toFixed();
  if (d.abs().lt(1)) return d.toDecimalPlaces(6).toFixed();
  return d.toDecimalPlaces(decimals).toFixed();
}

export function formatAmount(amount: string | number, decimals = 4): string {
  return new Decimal(amount).toDecimalPlaces(decimals).toFixed();
}

export function formatPercent(value: string | number, decimals = 2): string {
  const d = new Decimal(value);
  const sign = d.gte(0) ? "+" : "";
  return `${sign}${d.toDecimalPlaces(decimals).toFixed()}%`;
}

export function formatUsd(value: string | number): string {
  const d = new Decimal(value);
  if (d.abs().gte(1_000_000)) return `$${d.div(1_000_000).toFixed(2)}M`;
  if (d.abs().gte(1_000)) return `$${d.div(1_000).toFixed(2)}K`;
  return `$${d.toDecimalPlaces(2).toFixed()}`;
}

export function formatShortAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatVolume(volume: string | number): string {
  const d = new Decimal(volume);
  if (d.gte(1_000_000_000)) return `${d.div(1_000_000_000).toFixed(2)}B`;
  if (d.gte(1_000_000)) return `${d.div(1_000_000).toFixed(2)}M`;
  if (d.gte(1_000)) return `${d.div(1_000).toFixed(2)}K`;
  return d.toFixed(2);
}

export function truncateDecimals(value: string, maxDecimals: number): string {
  const d = new Decimal(value);
  return d.toDecimalPlaces(maxDecimals).toFixed();
}
