"use client";

import { useEffect, useCallback } from "react";
import { useTradingStore } from "@/stores/tradingStore";
import { priceEngine } from "@/lib/priceEngine";
import { DEFAULT_PAIR_SYMBOL } from "@/lib/constants";

const WATCHLIST_PAIRS = [DEFAULT_PAIR_SYMBOL, "BONK/SOL", "WIF/USDC", "JUP/SOL", "JTO/USDC"];

export function useKeyboardShortcuts(options: {
  onFocusBuy?: () => void;
  onFocusSell?: () => void;
  onFocusSearch?: () => void;
  onCommandPalette?: () => void;
  onFullscreenChart?: () => void;
  onShortcutsOverlay?: (open: boolean) => void;
}) {
  const setActivePair = useTradingStore((s) => s.setActivePair);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        if (e.key === "/" || e.key === "b" || e.key === "s") return;
      }
      if (e.key === "Escape") {
        options.onShortcutsOverlay?.(false);
        return;
      }
      if (e.key === "b" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        options.onFocusBuy?.();
        return;
      }
      if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        options.onFocusSell?.();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        options.onFocusSearch?.();
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        options.onShortcutsOverlay?.(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        options.onCommandPalette?.();
        return;
      }
      if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        options.onFullscreenChart?.();
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5 && !e.ctrlKey && !e.metaKey) {
        const pair = WATCHLIST_PAIRS[num - 1];
        if (pair) {
          e.preventDefault();
          setActivePair(pair);
          priceEngine.setPair(pair);
        }
      }
    },
    [options, setActivePair]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {};
}
