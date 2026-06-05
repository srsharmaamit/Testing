# StockLens — Live Stock Risk Intelligence Dashboard

A production-ready Next.js web app that analyzes any US-listed stock ticker and produces a transparent **Confidence Factor (0–100)** with a plain-English risk verdict and watch conditions.

## Features

- **Transparent scoring engine** — 6 weighted metric groups: Liquidity, Volatility, Float & Size, Quality/Earnings, Valuation & Trend, Data Completeness
- **Regime-aware** — auto-detects penny stock vs small/mid/large-cap and applies appropriate thresholds
- **Smart rate limiting** — server-side 5-minute cache keeps FMP free tier usage well under 250 calls/day
- **Live leaderboard** — top gainers and most active, with penny-only filter
- **Plain-English verdict** — "Why" and concrete "What to Watch" conditions computed from live data
- **Beautiful navy UI** — animated circular gauge, mobile-responsive, micro-animations

## Quick Start

```bash
cd stocklens
cp .env.example .env.local
# Add your FMP API key to .env.local
npm install
npm run dev
```

## Getting Your FMP API Key

1. Go to [financialmodelingprep.com/developer/docs](https://financialmodelingprep.com/developer/docs/)
2. Sign up for a free account (250 API calls/day)
3. Copy your API key from the dashboard
4. Paste it into `.env.local`:

```env
FMP_API_KEY=your_actual_key_here
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FMP_API_KEY` | Yes | Financial Modeling Prep API key |

## Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# From the stocklens/ directory
vercel

# Set the env var in Vercel dashboard or via CLI:
vercel env add FMP_API_KEY
```

Or deploy directly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set root directory to `stocklens/` and add `FMP_API_KEY` in environment variables.

## Project Structure

```
stocklens/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts      ← main analysis endpoint
│   │   │   └── leaderboard/route.ts  ← top movers endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx                  ← main client page
│   │   └── globals.css
│   ├── components/
│   │   ├── ConfidenceGauge.tsx       ← animated SVG radial meter
│   │   ├── MetricBreakdown.tsx       ← per-metric score rows
│   │   ├── VerdictPanel.tsx          ← verdict + drivers + watch conditions
│   │   ├── Leaderboard.tsx           ← top movers with toggle + filter
│   │   ├── SearchBar.tsx
│   │   └── Skeleton.tsx
│   ├── lib/
│   │   ├── fmp.ts                    ← FMP API client (server-side only)
│   │   ├── cache.ts                  ← in-memory cache, 5-min TTL
│   │   └── scoring/
│   │       ├── config.ts             ← all weights & thresholds (tunable)
│   │       ├── engine.ts             ← scoring logic
│   │       └── verdict.ts            ← plain-English generator
│   └── types/
│       └── stock.ts
```

## Scoring Engine

Edit `src/lib/scoring/config.ts` to tune any weight or threshold without touching logic.

| Metric | Default Weight | What it measures |
|---|---|---|
| Liquidity | 22% | Avg daily dollar volume, relative volume |
| Volatility | 20% | ATR%, beta, 52-week position |
| Float & Size | 15% | Market cap, shares outstanding, dilution risk |
| Quality / Earnings | 20% | EPS sign, P/E sanity, TTM margins |
| Valuation & Trend | 13% | vs 50/200-day MA, momentum |
| Data Completeness | 10% | Penalises missing fields |

## Disclaimer

Educational tool. Not financial advice. Scores measure risk/quality characteristics, not future returns.
