# Feature: View Trade List

## Metadata
issue_number: `112`
adw_id: `50dfaeee`
issue_json: `{"number":112,"title":"feature View Trade List US-BT-011","body":"/feature\n\nadw_sdlc_iso.py\n\nView Trade List\n\nI want to see a detailed list of all trades from the backtest\nSo that I can analyze individual trade performance\n\n\n Table columns: #, Entry Date, Exit Date, Direction, Entry Price, Exit Price, Size, P/L ($), P/L (%), Duration, Exit Reason\n Sortable by any column\n Filterable: Winners only, Losers only, Long only, Short only\n Search by date range\n Click row to highlight trade on chart\n Pagination for large trade counts (50 per page)\n Export to CSV"}`

## Feature Description
This feature adds a comprehensive trade list panel to the Backtest Results Summary that displays all trades executed during a backtest. Users can view detailed trade information including entry/exit dates, prices, profit/loss, trade duration, and exit reasons. The trade list includes advanced filtering (winners/losers, long/short), sorting by any column, date range search, pagination for large datasets, and CSV export functionality. Users can also click on individual trades to highlight them on the equity curve chart for visual analysis.

## User Story
As a trader
I want to see a detailed list of all trades from the backtest
So that I can analyze individual trade performance

## Problem Statement
Currently, backtest results display high-level summary statistics (total P/L, win rate, profit factor, etc.) and an equity curve chart, but users cannot see the detailed list of individual trades that contributed to these results. This makes it impossible to:
- Analyze which specific trades were winners or losers
- Identify patterns in trade performance over time
- Review entry and exit prices for specific trades
- Understand why trades were exited (stop loss, take profit, etc.)
- Export trade data for external analysis in Excel or other tools

Without a detailed trade list, users cannot perform trade-by-trade analysis, which is essential for strategy refinement and understanding backtest performance.

## Solution Statement
We will create a new `BacktestTradeList.jsx` component that displays all trades from a backtest in a sortable, filterable, and paginated table. The component will:

1. **Display all trade data** in a comprehensive table format with columns for entry/exit dates, direction, prices, size, P/L (both $ and %), duration, and exit reason
2. **Support sorting** by any column (ascending/descending) for flexible analysis
3. **Provide filtering** by trade outcome (winners/losers) and direction (long/short)
4. **Include date range search** to focus on trades within specific time periods
5. **Implement pagination** (50 trades per page) to handle large backtests efficiently
6. **Enable CSV export** so users can download trade data for external analysis
7. **Support trade highlighting** on the equity curve chart when a row is clicked for visual context

The trade list will be integrated into the existing `BacktestResultsSummary.jsx` component as a collapsible section below the equity curve chart. Trade data is already available in the backtest results (stored in the `trades` field), so no backend changes are required - this is purely a frontend enhancement.

## Relevant Files
Use these files to implement the feature:

### Backend Files
- **app/server/core/data_models.py** (lines 828-900)
  - Contains `BacktestResultsSummary` model with `trades` field
  - Trade data structure: `type`, `entry_price`, `entry_time`, `exit_price`, `exit_time`, `pnl`, `exit_reason`, `size`
  - Reference for understanding available trade data fields

- **app/server/core/backtest_executor.py** (lines 517-530, 1001-1195)
  - Trade creation logic during backtest execution
  - Last 100 trades are stored in results (line 1192)
  - Reference for understanding how trade data is generated

### Frontend Files
- **app/client/src/components/BacktestResultsSummary.jsx**
  - Main component where trade list will be integrated
  - Current displays summary statistics and equity curve chart
  - Trade list will be added as a new collapsible section below equity curve

- **app/client/src/components/TradeHistory.jsx**
  - Existing trade table component (for live trades from Account page)
  - Use as template for table structure, formatting, and UI patterns
  - Reference for date/price formatting, loading states, empty states

- **app/client/src/components/ui/Table.jsx**
  - Reusable table component for consistent styling
  - Use for trade list table structure

- **app/client/src/app/metricDefinitions.js**
  - Metric formatting utilities (formatMetricValue)
  - Use for consistent P/L and percentage formatting

- **app/client/src/lib/utils.js**
  - Utility functions (cn for class names, formatting helpers)

### Conditional Documentation Files
- **README.md**
  - Project structure and conventions
  - Technology stack (React 18, Tailwind CSS)
  - Development commands

- **.claude/commands/test_e2e.md**
  - E2E test runner instructions
  - Screenshot management guidelines
  - Test execution framework

- **.claude/commands/e2e/test_backtest_summary_statistics.md**
  - Reference E2E test for backtest summary statistics
  - Use as template for trade list E2E test structure

### New Files

#### Component Files
- **app/client/src/components/BacktestTradeList.jsx**
  - Main trade list table component with sorting, filtering, pagination
  - Props: `trades`, `onTradeClick`, `initialBalance`, `currency`
  - Displays all trade columns with formatting

- **app/client/src/components/TradeFilterControls.jsx**
  - Filter control panel for trade list
  - Includes: Winner/Loser/All toggle, Long/Short/Both toggle, Date range picker
  - Props: `filters`, `onFilterChange`

#### Utility Files
- **app/client/src/app/tradeUtils.js**
  - Trade filtering logic (filterTrades function)
  - Trade sorting logic (sortTrades function)
  - CSV export logic (exportTradesToCSV function)
  - Trade formatting utilities (formatTradeDuration, formatExitReason)

#### E2E Test Files
- **.claude/commands/e2e/test_view_trade_list.md**
  - E2E test specification for trade list functionality
  - Validates sorting, filtering, pagination, export, and chart highlighting

## Implementation Plan

### Phase 1: Foundation
Create utility functions and data processing logic that will support the trade list component. This includes filtering, sorting, pagination, CSV export, and trade formatting utilities. These utilities are pure functions with no dependencies on React components, making them easy to test and reuse.

### Phase 2: Core Implementation
Build the React components for the trade list table, filter controls, and integration with the backtest results summary. Implement the UI using existing design patterns from TradeHistory.jsx and MetricCard.jsx for consistency. Wire up filtering, sorting, and pagination state management.

### Phase 3: Integration
Integrate the trade list into the BacktestResultsSummary component, add chart highlighting functionality, implement CSV export, and create comprehensive E2E tests to validate the complete feature.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create Trade Utility Functions
Create `app/client/src/app/tradeUtils.js` with utility functions for trade data processing:
- `formatTradeDuration(entryTime, exitTime)` - Convert duration to readable format (e.g., "2h 15m", "3d 4h")
- `formatExitReason(reason)` - Convert exit_reason to display text (e.g., "stop_loss" → "Stop Loss")
- `calculateTradePnlPercent(pnl, entryPrice, size)` - Calculate P/L as percentage
- `filterTrades(trades, filters)` - Filter trades by winner/loser, long/short, date range
- `sortTrades(trades, sortColumn, sortDirection)` - Sort trades by any column
- `paginateTrades(trades, page, pageSize)` - Return trades for current page
- `exportTradesToCSV(trades, backtestName)` - Generate CSV file from trade data

Include comprehensive JSDoc comments for each function.

### Task 2: Create Filter Controls Component
Create `app/client/src/components/TradeFilterControls.jsx` component:
- Trade outcome filter: All | Winners | Losers (toggle buttons)
- Trade direction filter: Both | Long | Short (toggle buttons)
- Date range search: Start date and end date pickers
- Clear filters button
- Active filter count badge
- Props: `filters`, `onFilterChange`
- Use existing DateRangePicker component if available, or create simplified inputs
- Style using Tailwind CSS following existing component patterns

### Task 3: Create Trade List Table Component
Create `app/client/src/components/BacktestTradeList.jsx` component:
- Table columns: # (trade number), Entry Date, Exit Date, Direction, Entry Price, Exit Price, Size, P/L ($), P/L (%), Duration, Exit Reason
- Sortable column headers with sort direction indicators (▲/▼)
- Row hover highlighting
- Click handler for row selection (emit `onTradeClick` with trade data)
- Selected row highlighting (different background color)
- Empty state when no trades match filters
- Loading state support
- Props: `trades`, `onTradeClick`, `selectedTradeId`, `sortColumn`, `sortDirection`, `onSort`, `currency`
- Use `app/client/src/components/ui/Table.jsx` for base table structure
- Format dates using toLocaleString with options for readability
- Format prices with appropriate decimal places (5 for forex)
- Color-code P/L values (green for profit, red for loss)
- Use tabular-nums class for numeric columns

### Task 4: Create Pagination Component
Create pagination controls in `BacktestTradeList.jsx`:
- Display: "Showing 1-50 of 237 trades"
- Previous/Next buttons
- Page number buttons (1, 2, 3, ..., Last)
- Jump to page input
- Page size selector: 25 | 50 | 100 | All
- Props: `currentPage`, `totalPages`, `totalTrades`, `pageSize`, `onPageChange`, `onPageSizeChange`
- Disable Previous/Next when at boundaries
- Style following existing UI patterns (similar to LoadStrategyDialog pagination if exists)

### Task 5: Integrate Trade List into Backtest Results Summary
Modify `app/client/src/components/BacktestResultsSummary.jsx`:
- Import BacktestTradeList, TradeFilterControls, and tradeUtils
- Add trade list section after equity curve chart, before final balance
- Add collapsible header: "Trade List" with trade count badge
- Add export to CSV button in section header
- Implement filter state management (useState for filters)
- Implement sort state management (useState for sortColumn, sortDirection)
- Implement pagination state management (useState for currentPage, pageSize)
- Implement selected trade state (useState for selectedTradeId)
- Wire up filter changes to update displayed trades
- Wire up sort changes to reorder trades
- Wire up pagination changes to update visible trades
- Wire up CSV export button to call exportTradesToCSV utility
- Default to collapsed state for trade list section
- Add expand/collapse animation (same as main results section)

### Task 6: Implement Chart Highlighting on Trade Click
Extend `BacktestResultsSummary.jsx` and `EquityCurveChart.jsx`:
- When a trade row is clicked, pass trade data to EquityCurveChart
- EquityCurveChart should highlight the entry and exit points on the chart
- Add vertical line markers at entry and exit times
- Show tooltip with trade details (Entry: $X, Exit: $Y, P/L: $Z)
- Use different colors for winning trades (green) and losing trades (red)
- Clicking another trade updates the highlight
- Clicking the same trade again removes the highlight
- Ensure chart auto-scrolls to highlighted trade if outside viewport

### Task 7: Add Trade Count to Results Summary Header
Modify `BacktestResultsSummary.jsx` header section:
- Update existing trade count display to be clickable
- Clicking trade count auto-expands and scrolls to trade list section
- Add tooltip: "Click to view detailed trade list"
- Style as interactive link (underline on hover, cursor pointer)

### Task 8: Handle Edge Cases
Add edge case handling to all components:
- No trades scenario: Display empty state message "No trades executed in this backtest"
- Single trade scenario: Hide pagination, show "1 trade"
- Very long trade list (1000+ trades): Test performance, ensure pagination works smoothly
- Missing trade data fields: Use fallback values (N/A, 0, etc.)
- Invalid dates: Show "Invalid date" instead of throwing error
- Zero P/L trades: Display as $0.00 (neutral color)
- Date range filter with no matches: Show "No trades found in selected date range" empty state

### Task 9: Add Responsive Design
Ensure trade list works on mobile/tablet:
- On mobile (<768px): Hide less critical columns (Duration, Size) or allow horizontal scroll
- Stack filters vertically on small screens
- Make table horizontally scrollable with sticky first column (trade number)
- Reduce font size slightly on mobile for better fit
- Ensure pagination controls are touch-friendly (larger click targets)

### Task 10: Create E2E Test File
Create `.claude/commands/e2e/test_view_trade_list.md` E2E test specification:
- User story: View detailed trade list from backtest results
- Prerequisites: At least one completed backtest with 10+ trades
- Test steps to validate:
  - Trade list section appears in backtest results
  - All columns display correct data
  - Sorting works for each column (ascending/descending)
  - Filtering by winners/losers works correctly
  - Filtering by long/short works correctly
  - Date range filtering works correctly
  - Pagination works (next/previous, page numbers, page size)
  - CSV export downloads file with correct data
  - Clicking trade row highlights trade on chart
  - Trade list collapses/expands correctly
  - Mobile responsive layout works
- Success criteria: All sorting, filtering, pagination, export, and highlighting features work correctly
- Include 20+ screenshot steps documenting the complete flow
- Follow the format from `.claude/commands/e2e/test_backtest_summary_statistics.md`

### Task 11: Run Validation Commands
Execute all validation commands to ensure zero regressions:
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_view_trade_list.md` to validate functionality
- `cd app/server && uv run pytest` - Run server tests
- `cd app/client && npm run build` - Run frontend build

## Testing Strategy

### Unit Tests
Create unit tests for trade utility functions in `app/client/src/app/__tests__/tradeUtils.test.js`:
- Test `formatTradeDuration` with various time ranges (minutes, hours, days)
- Test `formatExitReason` with all exit reason types
- Test `calculateTradePnlPercent` with positive/negative P/L
- Test `filterTrades` with each filter type (winners, losers, long, short, date range)
- Test `sortTrades` for each column (ascending/descending)
- Test `paginateTrades` with edge cases (page 1, last page, invalid page)
- Test `exportTradesToCSV` generates valid CSV format

Create component tests for BacktestTradeList:
- Test renders empty state when no trades provided
- Test renders all columns with correct data
- Test sort indicators update when column header clicked
- Test onTradeClick called with correct trade data
- Test selected row highlighting works
- Test filters are applied correctly

### Edge Cases
- **No trades**: Backtest with no entry signals → empty state message
- **Single trade**: Pagination hidden, singular "1 trade" text
- **All winning trades**: Losers filter shows empty state
- **All losing trades**: Winners filter shows empty state
- **Long-only backtest**: Short filter shows empty state
- **Date range with no matches**: Empty state with clear message
- **1000+ trades**: Performance test, ensure smooth scrolling and pagination
- **Missing trade data**: Fallback to N/A or default values
- **Invalid date formats**: Graceful error handling
- **Zero P/L trades**: Neutral color, $0.00 display
- **CSV export with special characters**: Ensure proper escaping
- **Very long exit reasons**: Text truncation with tooltip
- **Extremely short trade durations**: Display "< 1m" for sub-minute trades
- **Multi-day trades**: Format as "Xd Xh" for clarity

## Acceptance Criteria
- Trade list table displays all trades from backtest results with 11 columns (trade number, entry date, exit date, direction, entry price, exit price, size, P/L $, P/L %, duration, exit reason)
- All columns are sortable by clicking column headers with visible sort indicators (▲/▼)
- Filter controls allow filtering by trade outcome (All, Winners, Losers)
- Filter controls allow filtering by trade direction (Both, Long, Short)
- Date range filter allows selecting start and end dates to view trades in a specific period
- Pagination displays 50 trades per page by default with configurable page size (25, 50, 100, All)
- Pagination controls include Previous/Next buttons, page numbers, and jump-to-page input
- Trade count display shows "Showing X-Y of Z trades" with accurate numbers
- Clicking a trade row highlights the entry and exit points on the equity curve chart
- Selected trade row has distinct background color to indicate selection
- Export to CSV button downloads a CSV file with all trades (not just current page)
- CSV export includes all 11 columns with headers
- Trade list section is collapsible with expand/collapse animation
- Empty state displays when no trades match filters with helpful message
- P/L values are color-coded (green for positive, red for negative, neutral for zero)
- Date and time formats are readable and consistent (e.g., "2024-01-15 09:30")
- Price formatting includes appropriate decimal places (5 decimals for forex)
- Duration formatting is human-readable (e.g., "2h 15m", "1d 3h")
- Exit reason formatting converts snake_case to Title Case (e.g., "stop_loss" → "Stop Loss")
- Mobile responsive layout works on screens <768px width
- Component follows existing design patterns from BacktestResultsSummary and TradeHistory
- E2E test validates all functionality with 20+ screenshots
- Zero regressions in existing backtest results display
- All validation commands pass without errors

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_view_trade_list.md` to validate trade list functionality works correctly
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Trade Data Structure
According to `app/server/core/data_models.py` and `backtest_executor.py`, each trade object contains:
```python
{
  "type": "long" | "short",
  "entry_price": float,
  "entry_time": datetime (ISO 8601 string),
  "exit_price": float,
  "exit_time": datetime (ISO 8601 string),
  "pnl": float,
  "exit_reason": string,
  "size": float
}
```

### Current Trade Storage Limitation
Currently, `backtest_executor.py` line 1192 only stores the **last 100 trades** in results. For backtests with more than 100 trades, the trade list will be incomplete. Consider these options:
- **Option 1 (Recommended for MVP)**: Document the 100-trade limit in the UI ("Showing last 100 trades" if total_trades > 100)
- **Option 2 (Future Enhancement)**: Modify backend to store all trades or implement server-side pagination
- **Option 3 (Future Enhancement)**: Create separate `backtest_trades` table in Supabase for unlimited trade storage

For this initial implementation, use Option 1 and document the limitation.

### Exit Reason Values
Common exit reasons from backtest executor:
- `"stop_loss"` - Stop loss hit
- `"take_profit"` - Take profit target reached
- `"trailing_stop"` - Trailing stop triggered
- `"partial_close"` - Partial position closed
- `"manual_close"` - Manual exit (end of backtest period)
- `"opposite_signal"` - Entry signal in opposite direction

Format these to Title Case in the UI.

### CSV Export Format
Export CSV with headers and proper escaping:
```csv
Trade #,Entry Date,Exit Date,Direction,Entry Price,Exit Price,Size,P/L ($),P/L (%),Duration,Exit Reason
1,2024-01-15 09:30,2024-01-15 11:45,Long,1.23456,1.23789,10000,33.00,2.67,2h 15m,Take Profit
2,2024-01-15 14:20,2024-01-15 16:05,Short,1.23800,1.23650,10000,15.00,1.21,1h 45m,Stop Loss
```

### Performance Considerations
- For 1000+ trades, sorting and filtering should happen client-side efficiently
- Use React.memo for BacktestTradeList to prevent unnecessary re-renders
- Paginate rendering to show only 50 trades at a time (avoid rendering 1000+ DOM elements)
- Consider virtualization (react-window) if performance issues arise with large datasets

### Design Consistency
Follow existing component patterns:
- Use `MetricCard` style for section headers
- Use color palette from Tailwind CSS config (text-success, text-danger, text-neutral-600)
- Use lucide-react icons consistent with BacktestResultsSummary (TrendingUp, BarChart3, etc.)
- Use same border, shadow, and spacing classes as equity curve chart section
- Maintain Swiss precision design aesthetic (clean, structured, professional)

### Future Enhancements
- Trade detail modal: Click trade row to open detailed modal with full trade information
- Trade highlighting on price chart: Show entry/exit points on the main strategy price chart (not just equity curve)
- Trade notes: Allow users to add notes to specific trades for analysis
- Trade tags: Categorize trades (e.g., "breakout", "reversal", "trend following")
- Advanced filters: Filter by P/L range, duration range, entry hour, day of week
- Trade comparison: Select multiple trades to compare side-by-side
- Trade replay: Animate the equity curve to show how each trade affected the balance over time
