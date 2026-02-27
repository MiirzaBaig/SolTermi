import type { Token, TradingPair } from "@/types/market";

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";

export const TOKENS: Token[] = [
  { symbol: "SOL", name: "Solana", mint: "So11111111111111111111111111111111111111112", decimals: 9, coingeckoId: "solana" },
  { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, coingeckoId: "usd-coin" },
  { symbol: "USDT", name: "Tether", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, coingeckoId: "tether" },
  { symbol: "RAY", name: "Raydium", mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", decimals: 6, coingeckoId: "raydium" },
  { symbol: "JUP", name: "Jupiter", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6, coingeckoId: "jupiter-exchange-solana" },
  { symbol: "BONK", name: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5, coingeckoId: "bonk" },
  { symbol: "WIF", name: "dogwifhat", mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", decimals: 6, coingeckoId: "dogwifcoin" },
  { symbol: "JTO", name: "Jito", mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", decimals: 9, coingeckoId: "jito-governance-token" },
  { symbol: "PYTH", name: "Pyth Network", mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwiiSXuGSjD", decimals: 6, coingeckoId: "pyth-network" },
  { symbol: "ORCA", name: "Orca", mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", decimals: 6, coingeckoId: "orca" },
  { symbol: "MNDE", name: "Marinade", mint: "MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey", decimals: 9, coingeckoId: "marinade-finance" },
  { symbol: "HNT", name: "Helium", mint: "hntSHRp8Z3j4e25EvTnv3qB5tWjg6wsae5tF2VMGYv4", decimals: 8, coingeckoId: "helium" },
  { symbol: "RENDER", name: "Render", mint: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof", decimals: 8, coingeckoId: "render-token" },
  { symbol: "mSOL", name: "Marinade Staked SOL", mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", decimals: 9, coingeckoId: "msol" },
  { symbol: "stSOL", name: "Lido Staked SOL", mint: "7dHbWXmni3pz2qF4Pc3o1o2o3o4o5o6o7o8o9o0o1o2", decimals: 9, coingeckoId: "lido-staked-sol" },
  { symbol: "GMT", name: "STEPN", mint: "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx", decimals: 9, coingeckoId: "stepn" },
  { symbol: "MNGO", name: "Mango", mint: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac", decimals: 6, coingeckoId: "mango-markets" },
  { symbol: "COPE", name: "Cope", mint: "8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh", decimals: 6, coingeckoId: "cope" },
  { symbol: "SAMO", name: "Samoyedcoin", mint: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", decimals: 9, coingeckoId: "samoyedcoin" },
  { symbol: "FIDA", name: "Bonfida", mint: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp", decimals: 6, coingeckoId: "bonfida" },
];

export const TRADING_PAIRS: TradingPair[] = [
  { base: "SOL", quote: "USDC", symbol: "SOL/USDC" },
  { base: "BONK", quote: "SOL", symbol: "BONK/SOL" },
  { base: "WIF", quote: "USDC", symbol: "WIF/USDC" },
  { base: "JUP", quote: "SOL", symbol: "JUP/SOL" },
  { base: "JTO", quote: "USDC", symbol: "JTO/USDC" },
  { base: "RAY", quote: "USDC", symbol: "RAY/USDC" },
  { base: "PYTH", quote: "USDC", symbol: "PYTH/USDC" },
  { base: "ORCA", quote: "SOL", symbol: "ORCA/SOL" },
  { base: "mSOL", quote: "SOL", symbol: "mSOL/SOL" },
  { base: "BONK", quote: "USDC", symbol: "BONK/USDC" },
  { base: "WIF", quote: "SOL", symbol: "WIF/SOL" },
  { base: "JUP", quote: "USDC", symbol: "JUP/USDC" },
  { base: "RENDER", quote: "USDC", symbol: "RENDER/USDC" },
  { base: "HNT", quote: "USDC", symbol: "HNT/USDC" },
  { base: "MNDE", quote: "SOL", symbol: "MNDE/SOL" },
];

export const DEFAULT_PAIR_SYMBOL = "SOL/USDC";

export function getTokenBySymbol(symbol: string): Token | undefined {
  return TOKENS.find((t) => t.symbol === symbol);
}

export function getPairBySymbol(symbol: string): TradingPair | undefined {
  return TRADING_PAIRS.find((p) => p.symbol === symbol);
}
