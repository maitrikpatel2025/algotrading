# Feature: Real-Time Price Feed

## Metadata
issue_number: `143`
adw_id: `07b7ce3f`
issue_json: `{"number":143,"title":"Feature View Real-Time Price Feed US-LM-004","body":"/feature\nadw_sdlc_iso\nmodel_set heavy\n\nFor for Live Monitor\nFor for Live Dashboard\n\nView Real-Time Price Feed\n\n\nI want to see live prices for my watched currency pairs\nSo that I can stay informed of market movements\n\n Price ticker shows: Pair, Bid, Ask, Spread, Change (pips), Change (%)\n Color flash on price change: green for up, red for down\n Watchlist customizable: add/remove pairs\n Click pair opens detailed chart view\n Latency indicator shows data freshness\n High/Low of day displayed"}`

## Feature Description
This feature adds a real-time price feed component to the Live Trading Dashboard (Monitor page) that displays live forex prices for user-selected currency pairs. The price feed provides traders with instant market visibility including bid/ask prices, spreads, price changes, and intraday high/low levels. The component will feature visual feedback (color flashing) on price updates, a customizable watchlist persisted to localStorage, and navigation to detailed chart views when pairs are clicked.

## User Story
As a forex trader
I want to see live prices for my watched currency pairs
So that I can stay informed of market movements

## Problem Statement
Traders need real-time visibility into price movements across multiple currency pairs without switching between different views. Currently, the dashboard shows account metrics and bot status but lacks a dedicated price feed that would allow traders to monitor their watched pairs at a glance, understand market conditions quickly through visual feedback, and navigate to detailed analysis when needed.

## Solution Statement
Implement a real-time Price Feed component integrated into the Monitor page that:
1. Displays a configurable watchlist of currency pairs with live prices
2. Shows comprehensive price data: Pair, Bid, Ask, Spread, Change (pips), Change (%)
3. Provides visual feedback with green/red color flashing on price updates
4. Allows watchlist customization (add/remove pairs) with localStorage persistence
5. Enables click-to-navigate to Strategy page for detailed chart view
6. Shows a latency indicator for data freshness
7. Displays High/Low of day for each pair

## Relevant Files
Use these files to implement the feature:

- `README.md` - Project overview and architecture reference
- `app/client/src/pages/Monitor.jsx` - Main Monitor page where the Price Feed will be integrated
- `app/client/src/hooks/useDashboardData.js` - Reference pattern for polling-based data fetching
- `app/client/src/hooks/useDarkMode.js` - Dark mode hook used across dashboard
- `app/client/src/app/api.js` - API endpoint definitions, specifically `spread` and `options` endpoints
- `app/client/src/components/PairSelector.jsx` - Reference for pair categorization, localStorage patterns, and spread fetching
- `app/client/src/components/LiveDashboard/index.js` - LiveDashboard component exports
- `app/client/src/components/LiveDashboard/DashboardHeader.jsx` - Reference for header patterns and timestamp display
- `app/client/src/components/LiveDashboard/AccountMetrics.jsx` - Reference for metric card styling and loading states
- `app/client/src/components/LiveDashboard/ConnectionStatus.jsx` - Reference for connection status indicator
- `app/client/src/lib/utils.js` - Utility functions including `cn()` for className composition
- `app/client/src/styles/design-tokens.css` - Design system color tokens (success, danger, primary)
- `app/client/src/index.css` - Global styles including animations
- `app/server/server.py` - Backend server with spread endpoint
- `app/server/core/data_models.py` - Pydantic models including `SpreadResponse`
- `app/server/core/openfx_api.py` - OpenFX API client for price data
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_live_trading_dashboard.md` - Reference E2E test for Monitor page

### New Files
- `app/client/src/components/PriceFeed/PriceFeedCard.jsx` - Main price feed container component
- `app/client/src/components/PriceFeed/PriceTickerRow.jsx` - Individual pair row with price data
- `app/client/src/components/PriceFeed/WatchlistEditor.jsx` - Modal for add/remove pairs from watchlist
- `app/client/src/components/PriceFeed/LatencyIndicator.jsx` - Data freshness indicator component
- `app/client/src/components/PriceFeed/index.js` - Barrel export for PriceFeed components
- `app/client/src/hooks/usePriceFeed.js` - Custom hook for price feed data fetching and state
- `app/server/api/price_feed.py` - Backend helper for batch price/spread fetching
- `.claude/commands/e2e/test_realtime_price_feed.md` - E2E test specification for this feature

## Implementation Plan

### Phase 1: Foundation
1. Create the `usePriceFeed` hook to manage price feed state, watchlist persistence, and polling
2. Extend the backend to support efficient batch spread fetching for multiple pairs
3. Define data structures for price history tracking (to calculate change values)

### Phase 2: Core Implementation
1. Build the `PriceTickerRow` component with all price display elements (Bid, Ask, Spread, Change, High/Low)
2. Implement color flash animations for price changes (green up, red down)
3. Create the `PriceFeedCard` container component with proper styling
4. Add the `LatencyIndicator` component for data freshness
5. Build the `WatchlistEditor` component for adding/removing pairs

### Phase 3: Integration
1. Integrate the `PriceFeedCard` into the Monitor page layout
2. Add click-to-navigate functionality linking to Strategy page with pair pre-selected
3. Test responsive behavior across viewport sizes
4. Ensure dark mode compatibility

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_live_trading_dashboard.md` to understand the E2E test format
- Create `.claude/commands/e2e/test_realtime_price_feed.md` with test steps covering:
  - Price Feed card visible on Monitor page
  - Default watchlist displays with prices
  - Price updates show color flash animations
  - Add/remove pairs from watchlist
  - Click pair navigates to Strategy page
  - Latency indicator shows data freshness
  - High/Low of day displayed
  - Responsive layout verification

### Step 2: Create Backend Batch Spread Endpoint
- Create `app/server/api/price_feed.py` with helper for batch spread fetching
- Add new endpoint `GET /api/spreads` that accepts comma-separated pairs parameter
- Return array of `SpreadResponse` objects with added `high` and `low` fields
- Add endpoint registration in `server.py`
- Write unit test for the new endpoint

### Step 3: Create usePriceFeed Hook
- Create `app/client/src/hooks/usePriceFeed.js`
- Implement state for: watchlist (localStorage persisted), priceData, previousPrices, loading, latency
- Use 2-second polling interval for price updates
- Track previous prices to calculate change (pips and %)
- Calculate latency from response timestamps
- Expose: prices, addPair, removePair, latencyMs, isLoading, lastUpdated

### Step 4: Create PriceTickerRow Component
- Create `app/client/src/components/PriceFeed/PriceTickerRow.jsx`
- Display: Pair name, Bid, Ask, Spread (pips), Change (pips), Change (%), High, Low
- Implement color flash animation using CSS keyframes:
  - Green flash (`bg-success/20`) when price increases
  - Red flash (`bg-danger/20`) when price decreases
- Add click handler to navigate to Strategy page with pair query param
- Use tabular-nums class for price alignment
- Format prices with appropriate decimal places (5 for most pairs, 3 for JPY pairs)

### Step 5: Create LatencyIndicator Component
- Create `app/client/src/components/PriceFeed/LatencyIndicator.jsx`
- Display latency in milliseconds with color coding:
  - Green (`text-success`) for < 500ms
  - Yellow (`text-warning`) for 500ms-2000ms
  - Red (`text-danger`) for > 2000ms
- Show "Live" indicator with pulsing dot when connected
- Display "Delayed" warning when latency is high

### Step 6: Create WatchlistEditor Component
- Create `app/client/src/components/PriceFeed/WatchlistEditor.jsx`
- Modal dialog with searchable pair list (reuse pattern from PairSelector)
- Show currently watched pairs with remove (X) button
- Show available pairs grouped by category (Major, Minor, Exotic)
- Add pair on click, persist to localStorage
- Limit watchlist to maximum 10 pairs

### Step 7: Create PriceFeedCard Component
- Create `app/client/src/components/PriceFeed/PriceFeedCard.jsx`
- Card header with title "Price Feed", latency indicator, and "Edit Watchlist" button
- Map over watchlist to render `PriceTickerRow` for each pair
- Show skeleton loading state while fetching initial data
- Show empty state with "Add pairs to your watchlist" message
- Dark mode support with `dark:` Tailwind prefixes

### Step 8: Create Component Index File
- Create `app/client/src/components/PriceFeed/index.js`
- Export all PriceFeed components for easy imports

### Step 9: Add API Endpoint to Client
- Update `app/client/src/app/api.js`
- Add `spreads: (pairs) => requests.get(`/spreads?pairs=${pairs.join(',')}`)`

### Step 10: Integrate PriceFeedCard into Monitor Page
- Update `app/client/src/pages/Monitor.jsx`
- Import `PriceFeedCard` component
- Add to dashboard layout in appropriate grid position (suggest after AccountMetrics, before BotStatusGrid)
- Use the `usePriceFeed` hook at page level

### Step 11: Add CSS Animations for Price Flash
- Update `app/client/src/index.css` with price flash keyframes:
  - `@keyframes price-flash-up` (green)
  - `@keyframes price-flash-down` (red)
- Add utility classes `.animate-price-flash-up` and `.animate-price-flash-down`

### Step 12: Implement Click-to-Chart Navigation
- Update `PriceTickerRow` to use `useNavigate` from react-router-dom
- Navigate to `/strategies/new?pair=PAIR_VALUE` when clicked
- Add hover state to indicate clickability

### Step 13: Run Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

## Testing Strategy

### Unit Tests
- `usePriceFeed` hook: test watchlist persistence, price update detection, latency calculation
- `PriceTickerRow`: test price formatting, change calculation, flash trigger logic
- `WatchlistEditor`: test add/remove pairs, search filtering, max limit enforcement
- Backend batch endpoint: test multi-pair fetching, error handling, response format

### Edge Cases
- Empty watchlist state
- API timeout/error handling for price fetch
- Stale prices when connection is lost
- Watchlist with pairs that have no price data
- JPY pairs with 3 decimal places vs standard 5 decimals
- Rapid price updates (debouncing flash animations)
- Maximum watchlist size reached
- localStorage unavailable (private browsing)
- Navigate to Strategy page when pair is not in options list

## Acceptance Criteria
- Price Feed card is visible on Monitor page with header showing "Price Feed"
- Default watchlist contains at least 3 major pairs (EUR_USD, GBP_USD, USD_JPY)
- Each row displays: Pair, Bid, Ask, Spread (pips), Change (pips), Change (%), High, Low
- Price updates trigger visual flash animation (green for up, red for down)
- Latency indicator shows current data freshness in milliseconds
- "Edit Watchlist" button opens modal to add/remove pairs
- Clicking a pair row navigates to Strategy page with that pair selected
- Watchlist persists across page refreshes (localStorage)
- Layout is responsive (stacks on mobile, grid on desktop)
- Dark mode styling is applied correctly
- Loading skeleton shown during initial data fetch
- Empty state shown when watchlist is empty
- All existing Monitor page functionality remains intact

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_realtime_price_feed.md` to validate this functionality works.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- The existing `/api/spread/{pair}` endpoint fetches spread for a single pair. For efficiency with multiple pairs, a new batch endpoint is recommended.
- Price updates use polling (2 seconds) for consistency with the existing dashboard pattern. WebSocket implementation could be a future enhancement.
- The 2-second polling interval balances real-time feel with API rate limits
- High/Low of day values may need to be calculated from historical candle data if not available from spread endpoint
- Consider adding a "Refresh" button for manual price refresh
- Future enhancement: Allow reordering pairs in watchlist via drag-and-drop
- Future enhancement: Price alerts when a pair reaches a specific level
