# SolTerminal

A portfolio-showcase Solana trading terminal. Connect wallet, view real-time charts, and simulate trading with mock data.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Deploy (Vercel)

```bash
vercel --prod
```

## Features

- **Trading chart** — TradingView Lightweight Charts, candlesticks, volume, multiple timeframes
- **Order entry** — Market and limit orders, slippage settings, click order book to fill price
- **Execution quality panel** — Pre-trade route, estimated slippage, price impact, and fee breakdown
- **Risk controls** — Max order notional cap, daily loss budget cap, high-slippage acknowledgement flow
- **Positions & history** — Live PnL, order history, balance bar
- **Wallet** — Phantom, Solflare, Torus (Solana Wallet Adapter)
- **Keyboard shortcuts** — B (buy), S (sell), / (search), Cmd+K (command palette), ? (shortcuts)
- **Mock data** — All trading is simulated; no real on-chain execution

## Trading UX Decisions

- **Show execution quality before submit**: every order displays route, impact, slippage estimate, and total fees pre-trade so users can catch low-quality fills before signing.
- **Cap risk at input time, not after failure**: the order form blocks orders that exceed max notional or breach the daily loss budget to reduce accidental over-sizing.
- **Require explicit acknowledgement on high slippage**: elevated slippage requires a confirmation checkbox in the modal to prevent blind acceptance of poor execution.

### Edge Cases Handled

- **Wallet disconnected during order flow**: order submission is blocked with a clear error if the wallet is not connected.
- **Stale quote before execution**: orders are blocked when quote data is stale (no fresh market tick in the freshness window).
- **Insufficient balance at submit**: buy checks quote balance (including fees), sell checks base-token balance; both return explicit required vs available amounts.

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Zustand, React Query, Decimal.js
- Solana Wallet Adapter, lightweight-charts
- Radix UI, Framer Motion
