# View Trade History

**ADW ID:** 7ea0c2d9
**Date:** 2026-01-25
**Specification:** /home/ubuntu/algotrading/trees/7ea0c2d9/specs/issue-147-adw-7ea0c2d9-sdlc_planner-view-trade-history.md

## Overview

This feature enhances the Trade History functionality on the Account page with advanced filtering, sorting, pagination, P/L summary cards, and CSV export capabilities. Traders can now filter trades by date range, bot, pair, direction, and outcome (win/loss), view running daily/weekly P/L totals, sort by any column, paginate through large trade histories, and export filtered data to CSV.

## What Was Built

- **P/L Summary Cards**: Display daily, weekly, and total P/L with trade counts in a responsive 3-column grid
- **Advanced Filtering**: Date range picker, bot dropdown, pair dropdown, direction toggle (Both/Long/Short), outcome toggle (All/Winners/Losers)
- **Sortable Columns**: Click any column header to sort ascending/descending with visual indicators
- **Pagination**: Page size selector (25, 50, 100, All), navigation controls, and "Showing X-Y of Z trades" info
- **CSV Export**: Export all filtered trades to CSV with proper formatting
- **Enhanced Table Columns**: Date/Time, Pair, Direction, Entry, Exit, P/L, Duration, Exit Reason, Bot
- **Server-side Filtering**: API supports filtering by bot_name, pair, direction, and outcome parameters
- **Duration Calculation**: Automatic calculation of trade duration from entry to exit timestamps
- **Bot Name Extraction**: Extracts bot name from trade comment field using pattern matching

## Technical Implementation

### Files Modified

- `app/server/server.py`: Enhanced `/api/trades/history` endpoint with new query parameters (bot_name, pair, direction, outcome), changed default date range from 30 days to 24 hours, added duration calculation, bot name extraction, and P/L summary calculations
- `app/server/core/data_models.py`: Added `TradeHistorySummary` model and extended `TradeHistoryItem` with `duration_seconds`, `exit_reason`, `bot_name`, and `entry_timestamp` fields
- `app/client/src/pages/Account.jsx`: Added filter state management, history summary state, filter change handler, and connected new props to TradeHistory component
- `app/client/src/components/TradeHistory.jsx`: Complete rewrite with sorting, pagination, filtering, and export functionality integrated
- `app/client/src/app/api.js`: Updated `tradeHistory()` function to accept filter parameters object

### New Files Created

- `app/client/src/app/tradeHistoryUtils.js`: Utility functions for duration formatting, CSV generation, filtering, sorting, and P/L calculations
- `app/client/src/components/TradeHistoryFilters.jsx`: Filter controls component with date inputs, dropdowns, and toggle buttons
- `app/client/src/components/TradeHistorySummary.jsx`: P/L summary cards showing daily, weekly, and total P/L with color coding
- `app/client/src/components/TradeHistoryPagination.jsx`: Pagination controls with page size selector and navigation buttons
- `app/server/tests/test_trades_endpoints.py`: Comprehensive tests for enhanced trade history functionality
- `.claude/commands/e2e/test_view_trade_history.md`: E2E test specification for the feature

### Key Changes

- API now defaults to 24-hour date range instead of 30 days for faster initial load
- Server calculates duration from `TradeTimestamp` and `TransactionTimestamp` fields
- Bot name is extracted from trade comment using `[BotName]` or `BotName:` patterns
- P/L summary includes daily (today), weekly (this week starting Monday), and total for filtered period
- All filtering happens server-side for efficiency, with client-side sorting and pagination

## How to Use

1. Navigate to the Account page
2. The Trade History section displays with P/L summary cards showing today's, this week's, and total P/L
3. Use the filter controls to narrow down trades:
   - Set Start Date and End Date for custom date ranges
   - Select a specific Bot from the dropdown
   - Select a specific Pair from the dropdown
   - Toggle Direction: Both, Long, or Short
   - Toggle Outcome: All, Winners, or Losers
4. Click any column header to sort by that column (click again to reverse order)
5. Use pagination controls at the bottom to navigate through large result sets
6. Click "Export CSV" to download all filtered trades to a CSV file

## Configuration

No additional configuration is required. The feature uses the existing FXOpen API integration for trade history data.

## Testing

Run the backend tests:
```bash
cd app/server && uv run pytest tests/test_trades_endpoints.py -v
```

Run all server tests:
```bash
cd app/server && uv run pytest
```

Build the frontend:
```bash
cd app/client && npm run build
```

Run E2E tests:
```bash
# Read and execute the E2E test specification
.claude/commands/e2e/test_view_trade_history.md
```

## Notes

- **Performance**: For large trade histories, pagination is handled client-side on filtered results. Server-side pagination can be added if needed for very large datasets (1000+ trades).
- **Bot Name**: Trades without bot information (manual trades) display "-" in the Bot column.
- **Duration**: Calculated as exit timestamp minus entry timestamp. Displayed in human-readable format (e.g., "2h 15m", "1d 5h").
- **Exit Reason**: Comes from FXOpen API's TransactionReason field. Shows "-" if not available.
- **P/L Calculations**: Uses `realized_pl` field. Commission and swap are available but not included in displayed totals.
- **Backward Compatibility**: Existing API calls without filter parameters work with the new 24-hour default.
