# View Performance by Time Period

**ADW ID:** 6499043a
**Date:** 2026-01-24
**Specification:** specs/issue-129-adw-6499043a-sdlc_planner-view-performance-by-time-period.md

## Overview

This feature adds comprehensive time-based performance analysis to backtest results. It enables traders to identify temporal patterns in their strategy performance by breaking down results across three dimensions: monthly performance, day of week patterns, and hour of day distribution. The analysis includes visual highlighting of best and worst performing periods.

## What Was Built

- Monthly performance table with sortable columns showing trades, win rate, and P/L per month
- Day of week heatmap visualization showing P/L intensity by day and hour
- Hourly performance horizontal bar chart showing net P/L for each hour (0-23)
- Best/worst period highlighting across all three analysis dimensions
- CSV export functionality for all time period breakdown data
- Backend calculation logic for aggregating trade data by time periods

## Technical Implementation

### Files Modified

- `app/server/core/data_models.py`: Added new Optional fields to BacktestResultsSummary model for monthly_performance, day_of_week_performance, hourly_performance, and day_hour_heatmap
- `app/server/core/backtest_executor.py`: Added `_calculate_time_period_metrics()` method that groups trades by month, day of week, and hour, calculates metrics for each group, and identifies best/worst periods
- `app/server/utils/export_generators.py`: Added TIME PERIOD ANALYSIS sections (Monthly, Day of Week, Hourly) to CSV export generator
- `app/client/src/components/BacktestResultsSummary.jsx`: Integrated PerformanceByTimePeriod component as a collapsible section
- `app/client/src/components/EquityCurveChart.jsx`: Updated lightweight-charts v5 API compatibility
- `app/client/src/app/tradeUtils.js`: Added utility functions for time period data processing and CSV export

### New Files Created

- `app/client/src/components/PerformanceByTimePeriod.jsx`: Parent component with three collapsible sub-sections for time period analysis
- `app/client/src/components/MonthlyPerformanceTable.jsx`: Sortable table showing month, trades, win rate, and net P/L with best/worst highlighting
- `app/client/src/components/DayOfWeekHeatmap.jsx`: Color-coded grid with days as columns and hours as rows, showing P/L intensity
- `app/client/src/components/HourlyPerformanceChart.jsx`: Horizontal bar chart for hourly P/L distribution with highlighting
- `.claude/commands/e2e/test_view_performance_by_time_period.md`: E2E test specification

### Key Changes

- Time period calculations use trade entry_time (not exit_time) for consistency
- Day of week uses Monday=0, Sunday=6 convention (ISO standard)
- Hour of day uses 24-hour format (0-23)
- Best/worst identification only considers periods with trades (ignores zero-trade periods)
- Heatmap uses green gradient for profits, red gradient for losses, neutral for zero/no trades

## How to Use

1. Run a backtest with trades
2. Navigate to the backtest results page
3. Expand the "Performance by Time Period" collapsible section
4. View the three sub-sections:
   - **Monthly Performance**: Click column headers to sort by month, trades, win rate, or P/L
   - **Day of Week Analysis**: Hover over heatmap cells to see detailed tooltips with day, hour, P/L, and trade count
   - **Hour of Day Analysis**: View horizontal bars showing P/L per hour with best/worst highlighting
5. Click "Export CSV" button to download all time period breakdown data

## Configuration

No additional configuration required. The feature automatically calculates time period metrics for any backtest with trades.

## Testing

Run the E2E test specification at `.claude/commands/e2e/test_view_performance_by_time_period.md` to validate:
- Performance by Time Period section appears in backtest results
- Monthly table displays with correct columns and sorting
- Heatmap renders with proper color coding and tooltips
- Hourly chart displays with best/worst highlighting
- CSV export downloads correctly

## Notes

- The section only appears when there are trades in the backtest (empty state handled gracefully)
- Color gradients handle edge cases where all P/L values are the same
- Best/worst highlighting handles ties by highlighting all tied periods
- Monthly format "YYYY-MM" allows proper chronological sorting
