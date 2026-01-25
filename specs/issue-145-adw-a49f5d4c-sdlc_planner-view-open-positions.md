# Feature: View Open Positions with Real-Time P/L

## Metadata
issue_number: `145`
adw_id: `a49f5d4c`
issue_json: `{"number":145,"title":"Feature View Real-Time Price Feed US-LM-005","body":"/feature\nadw_sdlc_iso\nmodel_set heavy\n\nView Open Positions\n\nFor for Live Monitor\nFor for Live Dashboard\n\nI want to see all my currently open positions with live P/L\nSo that I can monitor exposure and performance\n\nAcceptance Criteria:\n         Position table: Pair, Direction, Size, Entry Price, Current Price, P/L ($), P/L (pips), SL, TP, Duration, Bot Name\n         P/L updates in real-time\n         Color coding: green for profit, red for loss\n         Sort by any column\n         Total P/L summary at bottom\n         Click position to see on chart\n         Manual close button (with confirmation)\n\n"}`

## Feature Description
This feature enhances the Open Positions display on both the Live Trading Dashboard (Monitor page) and the Account page to provide comprehensive, real-time position monitoring. The enhanced view includes additional columns (Current Price, P/L in pips, Duration, Bot Name), sortable columns, a total P/L summary row, click-to-view-on-chart functionality, and a manual close position button with confirmation dialog. P/L values will update in real-time through polling to reflect current market prices.

## User Story
As a trader
I want to see all my currently open positions with live P/L
So that I can monitor exposure and performance

## Problem Statement
The current Open Positions display lacks several key features that traders need for effective position monitoring:
- No current price display to see real-time market movement
- No P/L in pips which is critical for forex trading analysis
- No position duration to understand trade age
- No bot name to identify which strategy opened the position
- No ability to sort positions by different metrics
- No total P/L summary for quick portfolio overview
- No way to quickly view a position on the chart
- No manual close functionality for urgent position management

## Solution Statement
Enhance the existing OpenPositions component (LiveDashboard) and OpenTrades component (Account page) with:
1. Extended data model with current price, P/L (pips), duration, and bot name
2. Backend API enhancement to return additional position data
3. Frontend table with sortable columns
4. Total P/L summary row at the bottom
5. Click handler to navigate to chart with position highlighted
6. Manual close button with confirmation dialog
7. Real-time updates via polling (consistent with existing dashboard pattern)
8. Color coding for profit/loss indicators

## Relevant Files
Use these files to implement the feature:

**Backend Files:**
- `app/server/server.py` - Contains `/api/trades/open` endpoint (line 248) that needs enhancement to return additional fields
- `app/server/core/data_models.py` - Contains `TradeInfo` model (line 177) that needs extension with new fields
- `app/server/core/openfx_api.py` - OpenFX API client with `get_open_trades()` method to potentially enhance
- `app/server/models/open_trade.py` - OpenTrade model for API response mapping
- `app/server/tests/test_trades_endpoints.py` - Existing tests that need updates for new fields

**Frontend Files:**
- `app/client/src/components/LiveDashboard/OpenPositions.jsx` - Dashboard widget showing top 5 positions (needs enhancement)
- `app/client/src/components/OpenTrades.jsx` - Full page table on Account page (needs enhancement)
- `app/client/src/pages/Monitor.jsx` - Monitor page that hosts OpenPositions
- `app/client/src/pages/Account.jsx` - Account page that hosts OpenTrades
- `app/client/src/hooks/useDashboardData.js` - Data fetching hook with polling
- `app/client/src/app/api.js` - API client with `openTrades()` method

**Documentation Files:**
- `app_docs/feature-bfd1a7d1-account-open-trades-order-history.md` - Existing open trades documentation
- `app_docs/feature-1a8f76c4-live-trading-dashboard.md` - Live dashboard documentation
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_live_trading_dashboard.md` - Example E2E test for reference

### New Files
- `app/client/src/components/PositionCloseDialog.jsx` - Confirmation dialog for closing positions
- `app/server/tests/test_close_trade_endpoint.py` - Tests for new close trade endpoint
- `.claude/commands/e2e/test_view_open_positions.md` - E2E test specification for this feature

## Implementation Plan
### Phase 1: Foundation
1. Extend the `TradeInfo` data model in `data_models.py` with new fields:
   - `current_price`: Current market price (bid for long, ask for short)
   - `pips_pl`: Profit/loss in pips
   - `open_time`: Position open timestamp
   - `duration_seconds`: Position duration in seconds (computed)
   - `bot_name`: Name of bot that opened position (if applicable)
2. Create new API endpoint `POST /api/trades/{trade_id}/close` for manual position closing
3. Enhance `/api/trades/open` endpoint to fetch and include current prices

### Phase 2: Core Implementation
1. Enhance `OpenTrades.jsx` component with:
   - Additional columns (Current Price, P/L pips, Duration, Bot Name)
   - Sortable column headers with sort state
   - Total P/L summary row at bottom
   - Close button with click handler
2. Create `PositionCloseDialog.jsx` component:
   - Confirmation dialog with position details
   - Confirm/Cancel buttons
   - Loading state during close operation
   - Success/error feedback
3. Enhance `OpenPositions.jsx` (LiveDashboard) component with:
   - Updated columns to match new schema
   - Click handler for chart navigation

### Phase 3: Integration
1. Add click-to-chart functionality:
   - Store position data in navigation state
   - Navigate to Strategy page with position info
   - Highlight entry price on chart
2. Integrate real-time updates:
   - Leverage existing polling mechanism from `useDashboardData.js`
   - Ensure smooth UI updates without flickering
3. Add API endpoint for closing trades:
   - Call FXOpen close trade API
   - Handle errors gracefully
   - Return updated position list

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_live_trading_dashboard.md` to understand E2E test format
- Create `.claude/commands/e2e/test_view_open_positions.md` with test steps covering:
  - Navigation to Monitor page
  - Verification of Open Positions section with all columns
  - Sorting functionality tests
  - Total P/L summary row verification
  - Manual close button visibility (without actual close)
  - Color coding verification
  - Navigation to Account page
  - Verification of full Open Trades table with same features

### Step 2: Extend Backend Data Model
- Read `app/server/core/data_models.py`
- Add new fields to `TradeInfo` model:
  - `current_price: Optional[float] = None`
  - `pips_pl: Optional[float] = None`
  - `open_time: Optional[datetime] = None`
  - `duration_seconds: Optional[int] = None`
  - `bot_name: Optional[str] = None`

### Step 3: Enhance Open Trades API Endpoint
- Read `app/server/server.py` and locate `/api/trades/open` endpoint
- Modify the endpoint to:
  - Fetch current prices for each position's instrument using existing spread/price APIs
  - Calculate P/L in pips based on entry price and current price
  - Include open_time and duration_seconds (duration = now - open_time)
  - Set bot_name if available from trade metadata

### Step 4: Create Close Trade API Endpoint
- Add new endpoint `POST /api/trades/{trade_id}/close` to `server.py`
- Implement close trade logic:
  - Validate trade_id exists
  - Call FXOpen API to close the trade
  - Return success/error response
- Create response model `CloseTradeResponse` in `data_models.py`

### Step 5: Update Backend Tests
- Read `app/server/tests/test_trades_endpoints.py`
- Add tests for extended `TradeInfo` fields
- Create `app/server/tests/test_close_trade_endpoint.py` with tests for:
  - Successful trade close
  - Invalid trade_id handling
  - API error handling

### Step 6: Update Frontend API Client
- Read `app/client/src/app/api.js`
- Add new API method `closeTrade(tradeId)` that calls `POST /api/trades/{trade_id}/close`

### Step 7: Create Position Close Dialog Component
- Create `app/client/src/components/PositionCloseDialog.jsx`:
  - Modal dialog with position details (Pair, Direction, Size, Entry Price, Current P/L)
  - Confirm and Cancel buttons
  - Loading state during API call
  - Error handling with user feedback
  - Success callback to refresh positions

### Step 8: Enhance OpenTrades Component (Account Page)
- Read `app/client/src/components/OpenTrades.jsx`
- Add new table columns:
  - Current Price (5 decimal precision)
  - P/L (pips) with color coding
  - Duration (formatted as HH:MM:SS or days)
  - Bot Name (or "Manual" if not set)
  - Close button (X icon with click handler)
- Implement sortable columns:
  - Add sort state (sortColumn, sortDirection)
  - Add click handlers on column headers
  - Sort data before rendering
  - Add sort indicator icons
- Add Total P/L Summary Row:
  - Calculate total P/L ($) across all positions
  - Calculate total P/L (pips)
  - Display at bottom with distinct styling
- Add Close button functionality:
  - Open PositionCloseDialog on click
  - Pass position data to dialog
  - Handle close success/error

### Step 9: Enhance OpenPositions Component (LiveDashboard)
- Read `app/client/src/components/LiveDashboard/OpenPositions.jsx`
- Add Current Price column
- Add P/L (pips) column with color coding
- Add click handler on rows for chart navigation:
  - Store position data in React Router state
  - Navigate to `/strategy` with position info
- Update "View All" link to pass along navigation context

### Step 10: Add Chart Navigation Handler
- Read `app/client/src/pages/Strategy.jsx` (or relevant chart page)
- Handle incoming position data from navigation state
- If position data exists:
  - Set the currency pair to match position
  - Add horizontal line at entry price
  - Optionally highlight current price level

### Step 11: Update Dashboard Data Hook
- Read `app/client/src/hooks/useDashboardData.js`
- Ensure the enhanced trade data (new fields) is properly passed through
- No changes needed if existing polling handles the response correctly

### Step 12: Run Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

## Testing Strategy
### Unit Tests
- Test `TradeInfo` model accepts new optional fields
- Test `/api/trades/open` returns enhanced data structure
- Test `/api/trades/{trade_id}/close` endpoint with mock FXOpen API
- Test P/L pips calculation for various currency pairs
- Test duration calculation from open_time
- Test sorting logic in frontend components

### Edge Cases
- Position with missing current price (API unavailable)
- Position with zero P/L
- Very long duration positions (days/weeks)
- No bot_name available (manual trades)
- Close trade fails (network error, invalid trade)
- Empty positions list
- Sorting with identical values
- Very large P/L values (formatting)

## Acceptance Criteria
1. Position table displays all required columns: Pair, Direction, Size, Entry Price, Current Price, P/L ($), P/L (pips), SL, TP, Duration, Bot Name
2. P/L values update in real-time (via 10-second polling consistent with dashboard)
3. Profit positions show green text, loss positions show red text
4. All columns are sortable by clicking column headers
5. Sort indicator shows current sort column and direction
6. Total P/L summary row displays at bottom of table with aggregate values
7. Clicking a position row navigates to chart page with position highlighted
8. Manual close button appears on each position row
9. Clicking close button opens confirmation dialog with position details
10. Confirming close triggers API call and refreshes position list
11. Close errors display appropriate error message to user
12. Feature works on both Monitor page (OpenPositions) and Account page (OpenTrades)

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_view_open_positions.md` to validate this functionality works

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- The existing dashboard uses 10-second polling via `useDashboardData.js` hook - maintain this pattern for consistency
- FXOpen API may not provide bot_name metadata - this field will be optional and show "Manual" as default
- P/L in pips calculation requires knowing the pip location for each currency pair (available in instrument data)
- The close trade functionality calls the FXOpen API endpoint for closing positions - ensure proper error handling for cases where the broker rejects the close request
- Current price should use bid price for long positions (sell to close) and ask price for short positions (buy to close)
- Duration formatting should show "< 1m" for very short positions, "Xh Ym" for hours, and "Xd Yh" for multi-day positions
