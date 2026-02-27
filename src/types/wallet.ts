export interface WalletBalance {
  symbol: string;
  amount: string;
  usdValue: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balances: WalletBalance[];
  totalUsd: string;
}
