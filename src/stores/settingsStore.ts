import { create } from "zustand";

export type PriorityFee = "normal" | "fast" | "turbo";

interface SettingsState {
  slippagePercent: string;
  priorityFee: PriorityFee;
  mevProtection: boolean;
  soundsEnabled: boolean;
  network: "mainnet-beta" | "devnet";
  setSlippage: (value: string) => void;
  setPriorityFee: (value: PriorityFee) => void;
  setMevProtection: (value: boolean) => void;
  setSoundsEnabled: (value: boolean) => void;
  setNetwork: (value: "mainnet-beta" | "devnet") => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  slippagePercent: "0.5",
  priorityFee: "normal",
  mevProtection: false,
  soundsEnabled: true,
  network: "mainnet-beta",

  setSlippage: (slippagePercent) => set({ slippagePercent }),
  setPriorityFee: (priorityFee) => set({ priorityFee }),
  setMevProtection: (mevProtection) => set({ mevProtection }),
  setSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
  setNetwork: (network) => set({ network }),
}));
