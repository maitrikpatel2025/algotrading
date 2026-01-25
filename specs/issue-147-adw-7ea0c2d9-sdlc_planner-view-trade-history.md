# Feature: View Trade History

## Metadata
issue_number: `147`
adw_id: `7ea0c2d9`
issue_json: `{"number":147,"title":"Feature View Trade History US-LM-005","body":"/feature\nadw_sdlc_iso\nmodel_set heavy\n\nView Trade History\n\nI want to see my recent closed trades\nSo that I can review what happened and learn from outcomes\nAcceptance Criteria:\n   Table shows: Date/Time, Pair, Direction, Entry, Exit, P/L, Duration, Exit Reason, Bot\n   Default view: Last 24 hours\n   Date range filter\n   Filter by bot, pair, direction, outcome (win/loss)\n   Running daily/weekly P/L totals\n   Export to CSV\n   Pagination for large history"}`

## Feature Description
This feature enhances the existing Trade History functionality on the Account page to provide a comprehensive view of closed trades with advanced filtering, sorting, pagination, and export capabilities. The enhanced Trade History view will allow traders to analyze their trading performance by filtering trades based on date range, bot, pair, direction, and outcome (win/loss). It includes running P/L totals calculated on daily and weekly bases, CSV export functionality for record-keeping and external analysis, and pagination for handling large trade histories efficiently.

## User Story
As a trader
I want to see my recent closed trades with filtering and analysis capabilities
So that I can review what happened and learn from outcomes

## Problem Statement
The current Trade History component provides a basic table view of closed trades without any filtering, sorting, pagination, or export capabilities. Traders need to analyze their trading history to identify patterns, track performance over time, and export data for external analysis. Without these features, traders cannot effectively review their trading outcomes or filter trades by specific criteria (bot, pair, direction, win/loss).

## Solution Statement
Enhance the Trade History feature with a comprehensive set of capabilities:
1. **Enhanced Table Display**: Show Date/Time, Pair, Direction, Entry, Exit, P/L, Duration, Exit Reason, and Bot name columns
2. **Date Range Filtering**: Default to last 24 hours with customizable date range picker
3. **Multi-Criteria Filtering**: Filter by bot, pair, direction (long/short), and outcome (win/loss)
4. **Running P/L Totals**: Display cumulative daily and weekly P/L summaries above the table
5. **CSV Export**: Export filtered trade data to CSV format for external analysis
6. **Pagination**: Handle large trade histories with configurable page sizes (25, 50, 100, All)

## Relevant Files
Use these files to implement the feature:

**Backend Files:**
- `app/server/server.py` - Contains existing `/api/trades/history` endpoint that needs enhancement with additional filtering parameters and running P/L calculations
- `app/server/core/data_models.py` - Contains `TradeHistoryItem` and `TradeHistoryResponse` models that need additional fields (duration, exit_reason, bot_name, running_pl)
- `app/server/core/openfx_api.py` - Contains `get_trade_history()` method that interfaces with FXOpen API
- `app/server/tests/test_trades_endpoints.py` - Existing tests for trade endpoints that need updates for new functionality

**Frontend Files:**
- `app/client/src/components/TradeHistory.jsx` - Existing component that needs major enhancement with filtering, sorting, pagination, and export
- `app/client/src/pages/Account.jsx` - Parent page component that manages TradeHistory state and data fetching
- `app/client/src/app/api.js` - API client that needs updated method signatures for new query parameters
- `app/client/src/app/endPoints.js` - Endpoint definitions

**Reference Files (for patterns):**
- `app/client/src/components/BacktestTradeList.jsx` - Reference for pagination implementation pattern (sortable columns, page size selector, navigation controls)
- `app/client/src/components/TradeFilterControls.jsx` - Reference for filter controls pattern (outcome, direction, date range filters)
- `app/server/utils/export_generators.py` - Reference for CSV export generation pattern

**Documentation Files:**
- `app_docs/feature-bfd1a7d1-account-open-trades-order-history.md` - Existing Account page documentation
- `app_docs/feature-bbdb5a41-trade-history-api.md` - Existing trade history API documentation
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_account_page.md` - Existing Account page E2E test for reference

### New Files
- `app/client/src/components/TradeHistoryFilters.jsx` - New component for filter controls (date range, bot, pair, direction, outcome)
- `app/client/src/components/TradeHistoryPagination.jsx` - New component for pagination controls
- `app/client/src/components/TradeHistorySummary.jsx` - New component for running daily/weekly P/L totals display
- `app/client/src/lib/tradeHistoryUtils.js` - Utility functions for trade duration calculation, CSV export, P/L aggregation
- `app/server/tests/test_trade_history_enhanced.py` - New tests for enhanced trade history functionality
- `.claude/commands/e2e/test_view_trade_history.md` - New E2E test specification for View Trade History feature

## Implementation Plan
### Phase 1: Foundation
1. **Backend Data Model Enhancement**: Extend `TradeHistoryItem` model with additional fields for duration calculation, exit_reason, and bot_name extraction
2. **API Endpoint Enhancement**: Update `/api/trades/history` endpoint to support new query parameters (bot, pair, direction, outcome) and calculate running P/L totals
3. **Create Utility Functions**: Build frontend utility functions for trade duration formatting, CSV generation, and P/L aggregation calculations

### Phase 2: Core Implementation
1. **Filter Controls Component**: Create `TradeHistoryFilters` component with date range picker, bot dropdown, pair dropdown, direction toggle, and outcome toggle
2. **Enhanced Trade Table**: Update `TradeHistory.jsx` to display all required columns (Date/Time, Pair, Direction, Entry, Exit, P/L, Duration, Exit Reason, Bot) with sorting capability
3. **Pagination Component**: Create `TradeHistoryPagination` component with page size selector, navigation buttons, and page info display
4. **P/L Summary Component**: Create `TradeHistorySummary` component to display running daily and weekly P/L totals
5. **CSV Export**: Implement export functionality using browser download pattern

### Phase 3: Integration
1. **Account Page Integration**: Wire up all components in the Account page with proper state management
2. **API Client Updates**: Update frontend API client with new query parameter support
3. **Error Handling**: Ensure robust error handling for all new functionality
4. **Testing**: Write unit tests for backend and create E2E tests for full feature validation

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_account_page.md` to understand E2E test format
- Create `.claude/commands/e2e/test_view_trade_history.md` E2E test specification that validates:
  - Trade History table displays all required columns (Date/Time, Pair, Direction, Entry, Exit, P/L, Duration, Exit Reason, Bot)
  - Default view shows last 24 hours of trades
  - Date range filter works correctly
  - Filter by bot, pair, direction, and outcome (win/loss) all function properly
  - Running daily/weekly P/L totals are displayed and calculated correctly
  - CSV export downloads file with all filtered trades
  - Pagination works with 25/50/100/All page sizes
  - Sort by columns (especially Date/Time and P/L)

### Step 2: Enhance Backend Data Models
- Update `app/server/core/data_models.py`:
  - Add `duration_seconds` field to `TradeHistoryItem` (Optional[int])
  - Add `exit_reason` field to `TradeHistoryItem` (Optional[str])
  - Add `bot_name` field to `TradeHistoryItem` (Optional[str])
  - Create `TradeHistorySummary` model with `daily_pl`, `weekly_pl`, `total_pl` fields
  - Update `TradeHistoryResponse` to include `summary: Optional[TradeHistorySummary]`

### Step 3: Enhance Trade History API Endpoint
- Update `app/server/server.py` `/api/trades/history` endpoint:
  - Change default date range from 30 days to 24 hours
  - Add optional query parameters: `bot_name`, `pair`, `direction`, `outcome`
  - Implement server-side filtering logic
  - Calculate duration for each trade (exit_time - entry_time)
  - Extract bot_name from trade comment field (existing pattern in OpenTrades)
  - Calculate running P/L totals (daily and weekly aggregations)
  - Return enhanced response with summary data

### Step 4: Create Trade History Utility Functions
- Create `app/client/src/lib/tradeHistoryUtils.js`:
  - `formatTradeDuration(seconds)` - Convert seconds to human-readable format (e.g., "2h 15m", "1d 5h")
  - `generateTradeHistoryCSV(trades, filters)` - Generate CSV string from trade array
  - `downloadCSV(csvString, filename)` - Trigger browser download
  - `calculateDailyPL(trades)` - Aggregate P/L by day
  - `calculateWeeklyPL(trades)` - Aggregate P/L by week
  - `filterTrades(trades, filters)` - Client-side filtering function for performance

### Step 5: Create Trade History Filters Component
- Create `app/client/src/components/TradeHistoryFilters.jsx`:
  - Date range inputs (Start Date, End Date) with default last 24 hours
  - Bot dropdown (populated from unique bots in trade history)
  - Pair dropdown (populated from unique pairs in trade history)
  - Direction toggle buttons: Both | Long | Short
  - Outcome toggle buttons: All | Winners | Losers
  - Active filter count badge
  - Clear all filters button
  - Use existing patterns from `TradeFilterControls.jsx`
  - Follow application styling conventions (Tailwind, Lucide icons)

### Step 6: Create Trade History Summary Component
- Create `app/client/src/components/TradeHistorySummary.jsx`:
  - Display running P/L totals in a card format above the table
  - Show Daily P/L (today's running total)
  - Show Weekly P/L (this week's running total)
  - Show Total P/L (for filtered period)
  - Color-code values (green for profit, red for loss)
  - Include trade count for each period
  - Responsive grid layout (1 column mobile, 3 columns desktop)

### Step 7: Create Trade History Pagination Component
- Create `app/client/src/components/TradeHistoryPagination.jsx`:
  - Page size selector: 25, 50, 100, All
  - Pagination info: "Showing X-Y of Z trades"
  - First/Previous/Next/Last page buttons with appropriate disabled states
  - Page number buttons (smart display showing 5 pages max)
  - Jump-to-page input field
  - Use existing patterns from `BacktestTradeList.jsx`

### Step 8: Enhance Trade History Table Component
- Update `app/client/src/components/TradeHistory.jsx`:
  - Add new columns: Duration, Exit Reason, Bot
  - Implement sortable column headers (click to toggle asc/desc)
  - Add sort indicator icons (chevron up/down)
  - Format duration using `formatTradeDuration()`
  - Display bot name (show "-" if not available)
  - Display exit reason (show "-" if not available)
  - Color-code Direction badges (green for Long/Buy, red for Short/Sell)
  - Color-code P/L values (green for profit, red for loss)
  - Add row hover state for better UX
  - Integrate with pagination (only display visible page)

### Step 9: Implement CSV Export Functionality
- Add export button to Trade History header:
  - "Export CSV" button with Download icon
  - Loading state during export generation
  - Call `generateTradeHistoryCSV()` with current filtered trades
  - Use `downloadCSV()` to trigger browser download
  - Filename format: `trade_history_{start_date}_{end_date}.csv`
- CSV should include all columns: Date/Time, Pair, Direction, Entry, Exit, P/L, Duration, Exit Reason, Bot
- Export all filtered trades (not just current page)

### Step 10: Update API Client
- Update `app/client/src/app/api.js`:
  - Modify `tradeHistory()` function to accept filter parameters object
  - Add query string building for: `timestamp_from`, `timestamp_to`, `bot_name`, `pair`, `direction`, `outcome`
- Update `app/client/src/app/endPoints.js` if needed

### Step 11: Integrate Components in Account Page
- Update `app/client/src/pages/Account.jsx`:
  - Add state for filters: `{ dateRange: { start, end }, bot, pair, direction, outcome }`
  - Add state for pagination: `{ currentPage, pageSize }`
  - Add state for sorting: `{ column, direction }`
  - Set default date range to last 24 hours
  - Connect `TradeHistoryFilters` component with filter state
  - Connect `TradeHistorySummary` component with calculated P/L data
  - Connect `TradeHistoryPagination` component with pagination state
  - Update data fetching to pass filter parameters to API
  - Handle filter changes: reset pagination to page 1
  - Calculate displayed trades based on current page and page size

### Step 12: Write Backend Unit Tests
- Create/update `app/server/tests/test_trade_history_enhanced.py`:
  - Test default 24-hour date range
  - Test custom date range filtering
  - Test bot_name filter
  - Test pair filter
  - Test direction filter (long/short)
  - Test outcome filter (win/loss)
  - Test combined filters
  - Test duration calculation accuracy
  - Test P/L summary calculations (daily, weekly, total)
  - Test empty results handling
  - Test error handling

### Step 13: Run Validation Commands
- Execute all validation commands to ensure zero regressions

## Testing Strategy
### Unit Tests
- Backend endpoint tests for all new filter parameters
- Backend tests for duration calculation
- Backend tests for P/L summary aggregation
- Backend tests for bot_name extraction
- Frontend utility function tests for duration formatting
- Frontend utility function tests for CSV generation
- Frontend utility function tests for P/L calculations

### Edge Cases
- Empty trade history (no trades in date range)
- Trades without exit_reason field
- Trades without bot_name (manual trades)
- Very large trade histories (1000+ trades)
- Filter combinations that return no results
- Date ranges with no trading activity
- Trades spanning multiple days/weeks for P/L calculations
- JPY pairs with different pip calculations
- Trades with zero P/L (breakeven)

## Acceptance Criteria
1. Trade History table displays all required columns: Date/Time, Pair, Direction, Entry, Exit, P/L, Duration, Exit Reason, Bot
2. Default view shows last 24 hours of trades (changed from 30 days)
3. Date range filter allows selecting custom start and end dates
4. Filter by bot name works (dropdown populated from available bots)
5. Filter by pair works (dropdown populated from available pairs)
6. Filter by direction works (Both/Long/Short toggle)
7. Filter by outcome works (All/Winners/Losers toggle)
8. Running daily P/L total is displayed and calculated correctly
9. Running weekly P/L total is displayed and calculated correctly
10. Total P/L for filtered period is displayed
11. Export to CSV button downloads file with all filtered trade data
12. CSV contains all columns with proper headers
13. Pagination works with 25/50/100/All page sizes
14. Pagination info shows "Showing X-Y of Z trades"
15. Page navigation (First/Prev/Next/Last) works correctly
16. Column sorting works for Date/Time and P/L columns
17. All existing tests continue to pass
18. Frontend build completes without errors
19. E2E test validates complete feature functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest tests/test_trades_endpoints.py -v` - Run existing trade endpoint tests
- `cd app/server && uv run pytest tests/test_trade_history_enhanced.py -v` - Run new enhanced trade history tests
- `cd app/server && uv run pytest` - Run all server tests to validate zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature compiles correctly
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_view_trade_history.md` to validate this functionality works end-to-end

## Notes
- **API Timeout Considerations**: The existing trade history API has a 15-second timeout. With the new 24-hour default range, this should be sufficient, but monitor for any timeout issues with extended date ranges.
- **Performance**: For large trade histories, pagination is handled client-side for filtered results. If performance becomes an issue with very large datasets, server-side pagination can be implemented in a future enhancement.
- **Bot Name Extraction**: Bot names are extracted from trade comment fields using existing patterns from OpenTrades. Manual trades without bot information will show "-" in the Bot column.
- **Duration Calculation**: Duration is calculated as the difference between exit timestamp and entry timestamp. Trades that are still open should not appear in trade history.
- **P/L Calculations**: Running P/L totals use the `realized_pl` field from the API. Commission and swap are available but not currently included in the displayed P/L.
- **Exit Reason**: The exit reason field may come from the FXOpen API's transaction_reason field. If not available, display "-".
- **Styling Consistency**: All new components must follow the existing UI style guide using Tailwind CSS classes, Lucide React icons, and the established card/table patterns.
- **Backward Compatibility**: The enhanced endpoint maintains backward compatibility - existing calls without filter parameters will work with the new 24-hour default.
