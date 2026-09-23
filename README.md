# PantaDesk — Institutional Prediction Market Terminal on Solana

> **Colosseum Crypto World's Fair Hackathon — Panta API Sidetrack Submission**  
> *A high-throughput intelligence, risk modeling, and trade execution terminal built natively on Solana using Panta Public API v1.*  
> **Live Terminal**: [https://pantadesk.vercel.app](https://pantadesk.vercel.app)

---

## ⚡ Overview

**PantaDesk** is an institutional-grade prediction terminal engineered for professional traders, quantitative analysts, and syndicates operating on Solana prediction markets. Powered by **Panta Public API v1** (`https://live-api.panta.market/api/v1/`), PantaDesk bridges the gap between retail binary betting and quantitative execution.

### Key Capabilities:
- **Direct Panta API v1 Integration**: End-to-end integration covering market discovery, real-time quote generation, non-custodial transaction building, portfolio tracking, and market creation.
- **Kelly Criterion Risk Sizing Engine**: Mathematically optimal capital allocation recommendations based on market-implied probability, trader subjective edge, spread penalty, and bankroll constraints.
- **Base64 Solana Transaction Inspector**: Deserializes and decodes Panta's unsigned `VersionedTransaction` payloads, verifying fee payers, recent blockhashes, and instruction accounts prior to signing.
- **Developer & Live Request Console**: Live streaming telemetry feed displaying every outbound HTTP request to Panta API v1, including endpoint path, latency (ms), HTTP status, and inspectable JSON payloads.
- **Institutional Market Screener**: Instant filtering by volume, spread, liquidity, resolution status, and category tags (Macro, Crypto, Tech, Sports, Space).
- **Market Creation Wizard**: 4-step wizard to quote collateral bounds, define oracle resolution criteria, and dispatch Panta market initialization payloads.

---

## 🏗️ Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │            PantaDesk React Client            │
                    │  (Screener, TradeDock, Portfolio, DevConsole)│
                    └──────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
           ┌────────────▼───────────┐            ┌────────────▼───────────┐
           │   Panta API Client     │            │    Odds & Risk Engine  │
           │  (Typed HTTP Adapter)  │            │  (Kelly / Spread / PnL)│
           └────────────┬───────────┘            └────────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       │                                 │
┌──────▼─────────────────────┐    ┌──────▼─────────────────────┐
│  Panta API v1 Endpoints    │    │  Solana Transaction Engine │
│  - /markets/               │    │  - @solana/web3.js         │
│  - /orders/quote/          │    │  - VersionedTransaction    │
│  - /orders/build/          │    │  - Base64 Deserializer     │
│  - /users/{addr}/positions/│    └────────────────────────────┘
└────────────────────────────┘
```

---

## 🧩 Panta Public API v1 Integration Details

PantaDesk strictly conforms to the Panta Public API v1 specification:

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Market Discovery** | `GET` | `/api/v1/markets/` | Screener feed with categories, volume, and odds |
| **Market Detail** | `GET` | `/api/v1/markets/{id}/` | Full oracle resolution rules and pool telemetry |
| **Order Quote** | `POST` | `/api/v1/orders/quote/` | Real-time pricing, fee estimation, and slippage |
| **Order Build** | `POST` | `/api/v1/orders/build/` | Returns unsigned base64 `VersionedTransaction` |
| **Positions** | `GET` | `/api/v1/users/{address}/positions/` | Wallet position tracker with claim status |
| **Market Creation** | `POST` | `/api/v1/markets/quote/` | Collateral and fee quote for new markets |
| **Market Dispatch** | `POST` | `/api/v1/markets/create/` | Constructs market initialization transaction |

> *Note: All endpoints strictly include trailing slashes as mandated by Panta's routing infrastructure.*

---

## 📊 Quantitative Kelly Risk Calculator

PantaDesk incorporates a Kelly Criterion sizing algorithm adapted for binary outcome contracts:

$$f^* = \frac{p \cdot b - q}{b} \times \text{Spread Penalty}$$

Where:
- $p$ = Subjective assessed win probability (trader's edge)
- $q = 1 - p$
- $b$ = Net fractional odds offered by the market ($\frac{1 - \text{Price}}{\text{Price}}$)
- $\text{Spread Penalty} = 1 - \frac{\text{Spread}}{2}$

Traders can toggle between **Full Kelly**, **Half Kelly (0.5x)**, and conservative risk profiles, with safeguards preventing negative EV allocations.

---

## 🧪 Testing & Verification

PantaDesk includes a comprehensive test suite with Vitest:

```bash
# Run unit tests
npm test
```

### Test Coverage Highlights:
- **Odds Math (`src/tests/odds-math.test.ts`)**:
  - Probability normalization and spread detection
  - Kelly criterion sizing under positive, neutral, and negative EV
  - Output token estimation and fee deduction
- **Panta API Client (`src/tests/panta-client.test.ts`)**:
  - Trailing slash formatting validation
  - API key / Bearer authentication header injection
  - Request logging telemetry dispatches
  - Order quote request and response parsing
- **Transaction Deserializer (`src/tests/tx-deserializer.test.ts`)**:
  - Base64 payload decoding into `@solana/web3.js` `VersionedTransaction`
  - Account key extraction and blockhash integrity validation

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/chi1ayomide-jpg/pantadesk.git
cd pantadesk

# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript checks
npx tsc --noEmit

# Run unit tests
npm test

# Build for production
npm run build
```

---

## 🛡️ Security & Non-Custodial Guarantee

- **Zero Private Key Handling**: PantaDesk never requests, stores, or handles private keys.
- **Client-Side Deserialization**: Transaction payloads generated by Panta are inspected directly in browser memory before presentation to standard Solana wallets (Phantom, Solflare).
- **Safe API Credential Management**: User API keys are stored solely in browser `sessionStorage` or local memory, never transmitted to third parties.

---

## 🏆 Hackathon Submission Metadata

- **Track**: Colosseum Crypto World's Fair Hackathon — Panta API Sidetrack
- **Platform**: Superteam Earn
- **Developer**: Ayomide (`chi1ayomide-jpg`)
- **License**: MIT
