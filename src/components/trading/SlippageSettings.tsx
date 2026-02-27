"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useSettingsStore } from "@/stores/settingsStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings } from "lucide-react";

const SLIPPAGE_PRESETS = ["0.1", "0.5", "1.0"];

export function SlippageSettings() {
  const { slippagePercent, setSlippage, priorityFee, setPriorityFee, mevProtection, setMevProtection } =
    useSettingsStore();

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button type="button" className="p-2 border-3 border-border bg-panel-bg text-text-secondary hover:bg-accent/20 hover:text-accent shadow-brutal-press transition-all duration-smooth" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          className="min-w-[260px] max-w-[calc(100vw-2rem)] border-3 border-border bg-panel-bg p-4 shadow-brutal z-[100]"
          sideOffset={8}
          align="end"
        >
          <div className="text-xs font-medium text-text-secondary mb-2">Slippage %</div>
          <div className="flex flex-wrap gap-1 mb-3">
            {SLIPPAGE_PRESETS.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={slippagePercent === p ? "primary" : "secondary"}
                onClick={() => setSlippage(p)}
              >
                {p}%
              </Button>
            ))}
            <span className="inline-flex h-9 items-center border-3 border-border bg-panel-bg px-3 text-xs font-semibold text-text-primary shadow-brutal-sm min-w-[4rem] justify-center gap-0.5">
              <Input
                className="w-8 text-center p-0 border-0 bg-transparent min-h-0 h-auto text-xs font-semibold focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={slippagePercent}
                onChange={(e) => setSlippage(e.target.value)}
                placeholder="—"
              />
              <span>%</span>
            </span>
          </div>
          <div className="text-xs font-medium text-text-secondary mb-2">Priority fee</div>
          <div className="flex gap-1 mb-3">
            {(["normal", "fast", "turbo"] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={priorityFee === p ? "primary" : "secondary"}
                onClick={() => setPriorityFee(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer font-semibold">
            <input
              type="checkbox"
              checked={mevProtection}
              onChange={(e) => setMevProtection(e.target.checked)}
              className="border-2 border-border"
            />
            MEV protection
          </label>
          <div className="mt-2 text-xs text-text-secondary">
            Route: Jupiter → Raydium (best price)
          </div>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
