# View Trade List

**ADW ID:** 50dfaeee
**Date:** 2026-01-23
**Specification:** specs/issue-112-adw-50dfaeee-sdlc_planner-view-trade-list.md

## Overview

This feature adds a comprehensive trade list view to the Backtest Results Summary, allowing traders to analyze individual trade performance from backtests. Users can sort, filter, paginate, and export trade data, as well as click on trades to highlight them on the equity curve chart for visual analysis.

## What Was Built

The implementation includes the following components:

- **Trade List Table** - Displays all trades with 11 columns: trade number, entry/exit dates, direction, entry/exit prices, size, P/L ($), P/L (%), duration, and exit reason
- **Filter Controls** - Filter by outcome (All/Winners/Losers), direction (Both/Long/Short), and date range
- **Sorting** - Click any column header to sort ascending/descending with visual indicators
- **Pagination** - Navigate large trade lists with configurable page size (25/50/100/All)
- **CSV Export** - Download complete trade data for external analysis
- **Chart Highlighting** - Click trade rows to highlight entry/exit points on the equity curve chart
- **Responsive Design** - Mobile-friendly layout with horizontal scroll and optimized filtering

## Technical Implementation

### Files Modified

- `app/client/src/components/BacktestResultsSummary.jsx`: Integrated trade list section with collapsible panel, filter/sort/pagination state management, and CSV export button
- `app/client/src/components/EquityCurveChart.jsx`: Added support for highlighting selected trades with visual markers on the equity curve

### New Files Created

- `app/client/src/components/BacktestTradeList.jsx`: Main trade list table component (449 lines)
  - Sortable column headers with direction indicators
  - Row selection and highlighting
  - Formatted trade data display
  - Pagination controls with page size selector
  - Empty state handling

- `app/client/src/components/TradeFilterControls.jsx`: Filter control panel (212 lines)
  - Outcome filter (All/Winners/Losers)
  - Direction filter (Both/Long/Short)
  - Date range picker (start/end dates)
  - Active filter count badge
  - Clear filters button

- `app/client/src/app/tradeUtils.js`: Trade processing utilities (361 lines)
  - `formatTradeDuration()` - Converts timestamps to human-readable format (e.g., "2h 15m", "3d 4h")
  - `formatExitReason()` - Converts snake_case to Title Case (e.g., "stop_loss" → "Stop Loss")
  - `calculateTradePnlPercent()` - Calculates P/L percentage from dollar amount
  - `filterTrades()` - Filters trades by outcome, direction, and date range
  - `sortTrades()` - Sorts trades by any column
  - `paginateTrades()` - Returns trades for current page
  - `exportTradesToCSV()` - Generates CSV file from trade data

- `.claude/commands/e2e/test_view_trade_list.md`: Comprehensive E2E test specification (452 lines)

### Key Changes

- **Trade Data Processing**: All trade filtering, sorting, and pagination logic is handled client-side using pure utility functions for optimal performance
- **State Management**: Filter, sort, and pagination states are managed in BacktestResultsSummary with controlled components
- **Chart Integration**: Selected trades are passed to EquityCurveChart via props to highlight entry/exit points with visual markers
- **Color Coding**: P/L values are color-coded (green for positive, red for negative) using Tailwind CSS classes
- **Format Consistency**: Trade data formatting follows existing patterns from TradeHistory and MetricCard components

## How to Use

1. **View Trade List**: Run a backtest and scroll to the "Trade List" section in the results summary
2. **Expand Section**: Click the "Trade List" header to expand the collapsible panel
3. **Sort Trades**: Click any column header to sort (click again to reverse direction)
4. **Filter Trades**: Use filter controls to show only:
   - Winners or losers only
   - Long or short trades only
   - Trades within a specific date range
5. **Navigate Pages**: Use pagination controls to browse through large trade lists
6. **Highlight on Chart**: Click any trade row to highlight its entry/exit points on the equity curve chart
7. **Export Data**: Click the "Export CSV" button in the section header to download all trades

## Configuration

No configuration required. The trade list automatically uses trade data from backtest results.

### Trade Data Fields

Each trade includes the following data (sourced from `BacktestResultsSummary.trades`):
- `type` - "long" or "short"
- `entry_price` - Entry price (5 decimal precision)
- `entry_time` - ISO 8601 timestamp
- `exit_price` - Exit price (5 decimal precision)
- `exit_time` - ISO 8601 timestamp
- `pnl` - Profit/loss in dollars
- `exit_reason` - Exit reason (e.g., "stop_loss", "take_profit", "trailing_stop")
- `size` - Position size

### Pagination Options

Default page size is 50 trades. Available options:
- 25 trades per page
- 50 trades per page
- 100 trades per page
- All trades (no pagination)

## Testing

### E2E Testing

Run the comprehensive E2E test:
```bash
# Read the test specification
cat .claude/commands/e2e/test_view_trade_list.md

# Execute the test (follow instructions in the test file)
```

The E2E test validates:
- Trade list display and data accuracy
- Column sorting (all columns, both directions)
- Filtering (winners/losers, long/short, date range)
- Pagination navigation and page size changes
- CSV export functionality
- Chart highlighting on row click
- Collapse/expand behavior
- Responsive mobile layout

### Manual Testing

1. Create a backtest with 10+ trades
2. Verify all columns display correct data
3. Test sorting on each column
4. Test each filter combination
5. Test pagination controls
6. Click a trade row and verify chart highlight
7. Export to CSV and verify data completeness
8. Test on mobile viewport (<768px width)

## Notes

### Current Limitations

- **Trade Storage Limit**: Backend currently stores only the last 100 trades (see `app/server/core/backtest_executor.py:1192`). For backtests with more than 100 trades, the trade list will be incomplete. The UI displays "Showing last 100 trades" when this limit is reached.

### Future Enhancements

- **Trade Detail Modal**: Click trade row to open detailed modal with full trade information
- **Price Chart Integration**: Highlight trades on the main strategy price chart (not just equity curve)
- **Trade Notes**: Allow users to add notes to specific trades for analysis
- **Trade Tags**: Categorize trades (e.g., "breakout", "reversal", "trend following")
- **Advanced Filters**: Filter by P/L range, duration range, entry hour, day of week
- **Trade Comparison**: Select multiple trades to compare side-by-side
- **Unlimited Trade Storage**: Migrate to server-side pagination or separate database table for unlimited trade history

### Design Patterns

The implementation follows existing design patterns:
- **Component Structure**: Similar to TradeHistory.jsx and MetricCard.jsx
- **Color Palette**: Uses Tailwind CSS classes (text-success, text-danger, text-neutral-600)
- **Icons**: Uses lucide-react icons consistent with BacktestResultsSummary
- **Styling**: Maintains Swiss precision design aesthetic (clean, structured, professional)

### Performance

- Client-side filtering and sorting handles 1000+ trades efficiently
- Pagination limits rendering to 50 trades at a time
- React.memo prevents unnecessary re-renders
- CSV export processes all trades regardless of pagination

### CSV Export Format

Exported CSV includes headers and all trades:
```csv
Trade #,Entry Date,Exit Date,Direction,Entry Price,Exit Price,Size,P/L ($),P/L (%),Duration,Exit Reason
1,2024-01-15 09:30,2024-01-15 11:45,Long,1.23456,1.23789,10000,33.00,2.67,2h 15m,Take Profit
2,2024-01-15 14:20,2024-01-15 16:05,Short,1.23800,1.23650,10000,15.00,1.21,1h 45m,Stop Loss
```
