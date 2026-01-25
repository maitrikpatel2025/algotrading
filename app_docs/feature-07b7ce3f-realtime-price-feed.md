# Real-Time Price Feed

**ADW ID:** 07b7ce3f
**Date:** 2026-01-25
**Specification:** specs/issue-143-adw-07b7ce3f-sdlc_planner-realtime-price-feed.md

## Overview

A real-time price feed component for the Monitor page that displays live forex prices for user-selected currency pairs. The feature provides instant market visibility with bid/ask prices, spreads, price changes, intraday high/low levels, visual flash animations on price updates, and a customizable watchlist persisted to localStorage.

## What Was Built

- Real-time price feed card with live market data polling (2-second intervals)
- Customizable watchlist with add/remove pair functionality (up to 10 pairs)
- Visual color flash animations (green/red) on price changes
- Latency indicator showing data freshness with color-coded status
- Batch spread fetching API endpoint for efficient multi-pair data retrieval
- Click-to-navigate functionality to Strategy page with pair pre-selected
- Dark mode support throughout all components

## Technical Implementation

### Files Modified

- `app/client/src/pages/Monitor.jsx`: Added PriceFeedCard integration to dashboard layout
- `app/client/src/app/api.js`: Added `spreads` endpoint for batch price fetching
- `app/client/src/index.css`: Added price flash keyframe animations
- `app/server/server.py`: Registered new `/api/spreads` endpoint

### New Files Created

- `app/client/src/components/PriceFeed/PriceFeedCard.jsx`: Main container component with table layout, loading skeleton, and empty state
- `app/client/src/components/PriceFeed/PriceTickerRow.jsx`: Individual pair row displaying bid, ask, spread, change, high/low
- `app/client/src/components/PriceFeed/WatchlistEditor.jsx`: Modal for managing watchlist pairs with search and categorization
- `app/client/src/components/PriceFeed/LatencyIndicator.jsx`: Data freshness indicator with color-coded status
- `app/client/src/components/PriceFeed/index.js`: Barrel exports
- `app/client/src/hooks/usePriceFeed.js`: Custom hook for price data fetching, watchlist persistence, and change detection
- `app/server/api/price_feed.py`: Backend helper for batch spread fetching with high/low estimation

### Key Changes

- **Batch Spread API**: New `GET /api/spreads?pairs=EUR_USD,GBP_USD` endpoint fetches multiple pairs in a single request, returning bid, ask, spread (pips), high, low, and timestamp
- **Price Change Detection**: The `usePriceFeed` hook tracks previous prices and triggers flash animations when bid prices change
- **Watchlist Persistence**: Watchlist stored in localStorage under `forex_dash_price_feed_watchlist` key with default pairs (EUR_USD, GBP_USD, USD_JPY)
- **Latency Tracking**: Response time measured using `performance.now()` with color thresholds (green <500ms, yellow 500-2000ms, red >2000ms)
- **JPY Pair Handling**: Automatic detection of JPY pairs for correct decimal formatting (3 decimals vs 5) and pip calculation (100x vs 10000x multiplier)

## How to Use

1. Navigate to the Monitor page (Live Trading Dashboard)
2. The Price Feed card displays your watched currency pairs with live prices
3. Click "Edit Watchlist" to open the watchlist editor modal
4. Search for pairs or browse by category (Major, Minor, Exotic)
5. Click a pair to add it to your watchlist (max 10 pairs)
6. Click the X button next to a pair to remove it from your watchlist
7. Click any row in the price feed to navigate to the Strategy page with that pair selected
8. Monitor the latency indicator to ensure data freshness

## Configuration

- **Polling Interval**: 2 seconds (configured in `usePriceFeed.js`)
- **Maximum Watchlist Size**: 10 pairs
- **Default Watchlist**: EUR_USD, GBP_USD, USD_JPY
- **LocalStorage Key**: `forex_dash_price_feed_watchlist`

## Testing

Run the E2E test for this feature:
```bash
# Read and execute the E2E test specification
.claude/commands/e2e/test_realtime_price_feed.md
```

Backend tests:
```bash
cd app/server && uv run pytest
```

Frontend build validation:
```bash
cd app/client && npm run build
```

## Notes

- Price updates use polling rather than WebSockets for consistency with existing dashboard patterns
- High/Low of day values are estimated from current price (0.2% range) as a simplified implementation
- Change values (pips and %) are calculated using estimated daily open (midpoint of high/low)
- Flash animations clear after 500ms to prevent visual noise during rapid updates
- The component gracefully handles localStorage unavailability (e.g., private browsing)
