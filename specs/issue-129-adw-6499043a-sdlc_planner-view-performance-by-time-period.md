# Feature: View Performance by Time Period

## Metadata
issue_number: `129`
adw_id: `6499043a`
issue_json: `{"number":129,"title":"Feature View Performance by Time Period US-BT-014","body":" /feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nView Performance by Time Period\n\nI want to see performance broken down by month, day of week, and hour\nSo that I can identify when my strategy performs best or worst\nAcceptance Criteria:\n\n Monthly performance table: Month, # Trades, Win Rate, Net P/L\n Day of week heatmap: columns = days, rows = hours, color = P/L\n Hour of day bar chart showing net P/L per hour\n Best/Worst month highlighted\n Best/Worst day of week highlighted\n Best/Worst hour highlighted\n Export breakdown data to CSV"}`

## Feature Description
This feature adds comprehensive time-based performance analysis to backtest results. It enables traders to identify temporal patterns in their strategy performance by breaking down results across three dimensions: monthly performance, day of week patterns, and hour of day distribution. The analysis includes visual highlighting of best and worst performing periods, helping traders optimize their trading schedules and identify when their strategy performs optimally or should be avoided.

## User Story
As a trader
I want to see performance broken down by month, day of week, and hour
So that I can identify when my strategy performs best or worst

## Problem Statement
Currently, backtest results show aggregate metrics and a trade list but don't provide temporal analysis of performance. Traders cannot easily identify:
- Which months are most/least profitable
- Which days of the week their strategy performs best/worst
- Which hours of the day are optimal for trading
This information is critical for optimizing trading schedules, avoiding poor-performing time periods, and understanding seasonal or cyclical patterns in strategy performance.

## Solution Statement
Add a new "Performance by Time Period" collapsible section to the BacktestResultsSummary component that includes:
1. **Monthly Performance Table** - A sortable table showing Month, # Trades, Win Rate, and Net P/L with best/worst highlighting
2. **Day of Week Heatmap** - A visual grid with days as columns and hours as rows, color-coded by P/L intensity
3. **Hour of Day Bar Chart** - A horizontal bar chart showing net P/L for each hour (0-23)
4. **CSV Export** - Ability to export all time period breakdown data to CSV format

The feature will integrate with the existing BacktestResultsSummary component and follow established patterns for collapsible sections, color coding, and export functionality.

## Relevant Files
Use these files to implement the feature:

**Backend - Data Models and Calculation:**
- `app/server/core/data_models.py` - Add new fields to BacktestResultsSummary model for time period metrics: `monthly_performance`, `day_of_week_performance`, `hourly_performance`
- `app/server/core/backtest_executor.py` - Add time period calculation logic after trades are generated; compute monthly aggregates, day-of-week aggregates, and hourly aggregates from trade data
- `app/server/utils/export_generators.py` - Add time period data sections to CSV export generator

**Frontend - UI Components:**
- `app/client/src/components/BacktestResultsSummary.jsx` - Add new collapsible "Performance by Time Period" section with tabs/sub-sections for monthly, day-of-week, and hourly views
- `app/client/src/components/MetricCard.jsx` - Reference for metric display patterns and color coding
- `app/client/src/app/tradeUtils.js` - Add utility functions for time period data processing and CSV export
- `app/client/src/app/metricDefinitions.js` - Add metric definitions for time period metrics (optional, for tooltips)
- `app/client/src/lib/utils.js` - Reference for utility functions like `cn()` for conditional classes

**Reference Files for Patterns:**
- `app/client/src/components/BacktestTradeList.jsx` - Reference for table implementation patterns
- `app/client/src/components/TradeFilterControls.jsx` - Reference for filter button styling
- `app/client/src/components/EquityCurveChart.jsx` - Reference for chart component patterns
- `.claude/commands/test_e2e.md` - Reference for E2E test runner
- `.claude/commands/e2e/test_view_trade_list.md` - Reference for E2E test format

### New Files
- `app/client/src/components/PerformanceByTimePeriod.jsx` - New component for time period analysis display
- `app/client/src/components/MonthlyPerformanceTable.jsx` - Monthly performance table with sorting and highlighting
- `app/client/src/components/DayOfWeekHeatmap.jsx` - Heatmap visualization for day/hour P/L
- `app/client/src/components/HourlyPerformanceChart.jsx` - Bar chart for hourly P/L distribution
- `.claude/commands/e2e/test_view_performance_by_time_period.md` - E2E test specification

## Implementation Plan
### Phase 1: Foundation
1. Extend the BacktestResultsSummary Pydantic model with new fields for time period data
2. Add calculation logic to backtest_executor.py to compute time period metrics from trade data
3. Create utility functions for time period data processing on the frontend

### Phase 2: Core Implementation
1. Create the PerformanceByTimePeriod parent component with tab/section navigation
2. Implement MonthlyPerformanceTable component with sortable columns and best/worst highlighting
3. Implement DayOfWeekHeatmap component with color gradient and tooltip
4. Implement HourlyPerformanceChart component as horizontal bar chart with highlighting

### Phase 3: Integration
1. Integrate PerformanceByTimePeriod into BacktestResultsSummary as a collapsible section
2. Add CSV export functionality for time period breakdown data
3. Update server-side export generators to include time period sections
4. Create E2E test specification and validate functionality

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_view_trade_list.md` to understand E2E test format
- Create `.claude/commands/e2e/test_view_performance_by_time_period.md` with test steps for:
  - Navigating to a completed backtest with trades
  - Verifying Performance by Time Period section appears
  - Testing monthly performance table display and sorting
  - Testing day of week heatmap rendering and tooltips
  - Testing hourly bar chart display
  - Verifying best/worst highlighting
  - Testing CSV export functionality

### Step 2: Extend Backend Data Models
- Read `app/server/core/data_models.py` to understand the BacktestResultsSummary model structure
- Add new Optional fields to BacktestResultsSummary:
  - `monthly_performance: Optional[List[Dict[str, Any]]]` - List of {month: "YYYY-MM", trades: int, win_rate: float, net_pnl: float, is_best: bool, is_worst: bool}
  - `day_of_week_performance: Optional[List[Dict[str, Any]]]` - List of {day: 0-6, day_name: str, trades: int, win_rate: float, net_pnl: float, is_best: bool, is_worst: bool}
  - `hourly_performance: Optional[List[Dict[str, Any]]]` - List of {hour: 0-23, trades: int, win_rate: float, net_pnl: float, is_best: bool, is_worst: bool}
  - `day_hour_heatmap: Optional[List[Dict[str, Any]]]` - List of {day: 0-6, hour: 0-23, net_pnl: float, trades: int}

### Step 3: Implement Time Period Calculations in Backtest Executor
- Read `app/server/core/backtest_executor.py` to understand where results summary is calculated
- Add a new private method `_calculate_time_period_metrics(self, trades: List[Dict]) -> Dict` that:
  - Groups trades by month (YYYY-MM format from entry_time)
  - Groups trades by day of week (0=Monday, 6=Sunday from entry_time)
  - Groups trades by hour of day (0-23 from entry_time)
  - Creates the day-hour heatmap grid
  - Calculates metrics for each group: trade count, win rate, net P/L
  - Identifies best/worst periods for highlighting
- Call this method in `_calculate_summary_statistics` and include results in BacktestResultsSummary

### Step 4: Create Frontend Utility Functions
- Read `app/client/src/app/tradeUtils.js` for existing patterns
- Add new utility functions:
  - `exportTimePeriodDataToCSV(monthlyData, dayOfWeekData, hourlyData, backtestName)` - Export time period breakdown to CSV
  - `getColorForPnL(pnl, minPnl, maxPnl)` - Generate color gradient for heatmap cells
  - `formatMonthLabel(monthStr)` - Format "YYYY-MM" to readable format like "Jan 2024"
  - `getDayName(dayIndex)` - Convert 0-6 to day name

### Step 5: Create MonthlyPerformanceTable Component
- Create `app/client/src/components/MonthlyPerformanceTable.jsx`
- Implement a sortable table with columns: Month, # Trades, Win Rate, Net P/L
- Add sorting capability for each column (click to sort)
- Highlight best month row with green background/border
- Highlight worst month row with red background/border
- Follow BacktestTradeList patterns for table styling
- Use tabular-nums for numeric alignment
- Handle empty state gracefully

### Step 6: Create DayOfWeekHeatmap Component
- Create `app/client/src/components/DayOfWeekHeatmap.jsx`
- Implement a grid with:
  - Columns: Monday through Sunday (7 columns)
  - Rows: Hours 0-23 (24 rows)
  - Cells colored by P/L intensity (green for profit, red for loss, neutral for zero/no trades)
- Add tooltips on hover showing: Day, Hour, P/L, Trade count
- Use CSS grid for layout
- Highlight best/worst cells with distinct border
- Include a color legend showing the gradient scale

### Step 7: Create HourlyPerformanceChart Component
- Create `app/client/src/components/HourlyPerformanceChart.jsx`
- Implement a horizontal bar chart using simple HTML/CSS (no external chart library needed)
- Display 24 bars for hours 0-23
- Color bars green for positive P/L, red for negative
- Show P/L value at end of each bar
- Highlight best hour bar with distinct styling
- Highlight worst hour bar with distinct styling
- Add hour labels on y-axis

### Step 8: Create PerformanceByTimePeriod Parent Component
- Create `app/client/src/components/PerformanceByTimePeriod.jsx`
- Implement with three sub-sections:
  - Monthly Performance (using MonthlyPerformanceTable)
  - Day of Week Analysis (using DayOfWeekHeatmap with summary stats)
  - Hour of Day Analysis (using HourlyPerformanceChart with summary stats)
- Add section header with Calendar icon and "Performance by Time Period" title
- Add "Export CSV" button in header
- Each sub-section can collapse/expand independently
- Include day-of-week summary showing best/worst day
- Include hourly summary showing best/worst hour
- Follow existing collapsible section patterns from BacktestResultsSummary

### Step 9: Integrate into BacktestResultsSummary
- Read `app/client/src/components/BacktestResultsSummary.jsx` for integration patterns
- Import PerformanceByTimePeriod component
- Add new collapsible section after Risk Metrics and before Trade List
- Pass results data to PerformanceByTimePeriod component:
  - `monthlyPerformance={results.monthly_performance}`
  - `dayOfWeekPerformance={results.day_of_week_performance}`
  - `hourlyPerformance={results.hourly_performance}`
  - `dayHourHeatmap={results.day_hour_heatmap}`
  - `onExportCSV={handleExportTimePeriodCSV}`
- Add handler for time period CSV export

### Step 10: Update Server Export Generators
- Read `app/server/utils/export_generators.py` for export patterns
- Add new sections to `generate_csv_export`:
  - "TIME PERIOD ANALYSIS - MONTHLY" section
  - "TIME PERIOD ANALYSIS - DAY OF WEEK" section
  - "TIME PERIOD ANALYSIS - HOURLY" section
- Format with headers and data rows matching the data structure
- Mark best/worst periods in the CSV output

### Step 11: Run Validation Commands
- Run `cd app/server && uv run pytest` to validate backend changes
- Run `cd app/client && npm run build` to validate frontend changes compile without errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_view_performance_by_time_period.md` E2E test to validate functionality

## Testing Strategy
### Unit Tests
- Test time period calculation logic with various trade datasets
- Test edge cases: empty trades, single trade, all same time period
- Test monthly aggregation with trades spanning multiple years
- Test day-of-week calculation handles timezone correctly
- Test hourly aggregation with trades at boundary hours (23:59, 00:01)
- Test best/worst identification with ties (multiple periods with same P/L)

### Edge Cases
- No trades in backtest (show empty/no data state)
- Single trade (one period has data, others empty)
- All trades in same month/day/hour
- Trades spanning multiple years
- Trades with negative and positive P/L in same period
- Large number of trades (100+ trades per period)
- Timezone edge cases (UTC vs local time handling)

## Acceptance Criteria
- Monthly performance table displays with columns: Month, # Trades, Win Rate, Net P/L
- Monthly table is sortable by clicking column headers
- Best month row is highlighted with green styling
- Worst month row is highlighted with red styling
- Day of week heatmap displays with days as columns, hours as rows
- Heatmap cells are color-coded by P/L intensity (green=profit, red=loss)
- Heatmap shows tooltips on hover with day, hour, P/L, trade count
- Hour of day bar chart shows net P/L per hour (0-23)
- Best/worst hours are visually highlighted on bar chart
- Export CSV button downloads all time period breakdown data
- CSV contains three sections: Monthly, Day of Week, Hourly
- Section integrates seamlessly into existing BacktestResultsSummary
- Section is collapsible/expandable like other sections
- Empty state handled gracefully when no trade data
- All styling follows existing design system (Tailwind, Swiss Design principles)
- E2E test passes validating all features work correctly

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_view_performance_by_time_period.md` to validate this functionality works

## Notes
- The heatmap visualization uses pure CSS/HTML for simplicity; no need for external charting library
- Time calculations should use trade entry_time (not exit_time) for consistency
- Day of week uses Monday=0, Sunday=6 convention (ISO standard)
- Hour of day uses 24-hour format (0-23)
- Color gradients for heatmap should handle edge cases where all P/L is the same
- Best/worst highlighting should handle ties gracefully (highlight first occurrence or all tied)
- Consider adding a toggle to switch between using entry_time vs exit_time for time-based analysis in future enhancement
- The monthly format "YYYY-MM" allows proper chronological sorting
