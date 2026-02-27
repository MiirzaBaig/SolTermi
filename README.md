# SolTerminal

A professional, retail-focused Solana trading terminal built to demonstrate production-grade trading UX, risk controls, and responsive interface design.

## Live Demo

- **Production URL:** [https://sol-terminal-six.vercel.app/](https://sol-terminal-six.vercel.app/)

## Overview

SolTerminal simulates a modern DeFi terminal experience for Solana users, with emphasis on:

- fast order entry
- execution-quality transparency
- risk-aware trade submission
- mobile-first usability

> Note: current trade execution is mock/simulated for product demonstration.

## Core Features

- **Trading UI:** Candlestick + volume chart, multi-timeframe controls, live price/crosshair overlays
- **Order Flow:** Market/limit orders, order-book-assisted pricing, slippage settings
- **Execution Quality:** Route preview, estimated slippage, price impact, fee breakdown, fill-quality badges
- **Risk Controls:** Max order notional cap, daily loss cap, high-slippage acknowledgement gate
- **Portfolio Surfaces:** Positions, trade history, balance summary, transaction toasts with copyable hash
- **Keyboard Support:** Fast shortcuts for search, order focus, pair switching, and command palette
- **Mobile UX:** Collapsible mobile sections, scroll-safe layout, compact controls, optimized spacing
- **Loading States:** Skeleton loaders for chart, watchlist, order panel, and order book

## Trading UX & Safety Decisions

- Show execution quality **before** confirmation to reduce poor fills.
- Block risk violations at input/submit time, not after transaction failure.
- Provide explicit safeguards for critical edge cases:
  - wallet disconnected
  - stale quote window
  - insufficient balance (buy/sell side aware)

## Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling/UI:** Tailwind CSS, Radix UI, Framer Motion
- **State/Data:** Zustand, React Query, Decimal.js
- **Web3:** Solana Wallet Adapter
- **Charting:** `lightweight-charts`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Scripts

- `npm run dev` - Start dev server
- `npm run dev:3000` - Start on port 3000
- `npm run dev:3004` - Start on port 3004
- `npm run build` - Production build
- `npm run start` - Run production build
- `npm run lint` - Lint checks

## Deployment

```bash
vercel --prod
```
