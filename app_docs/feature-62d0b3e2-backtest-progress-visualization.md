# Backtest Progress Visualization

**ADW ID:** 62d0b3e2
**Date:** 2026-01-22
**Specification:** /home/ubuntu/algotrading/trees/62d0b3e2/specs/issue-106-adw-62d0b3e2-sdlc_planner-backtest-progress-visualization.md

## Overview

This feature enhances the backtest progress modal with real-time performance metrics visualization. During backtest execution, users see live-updating displays of Running P/L, Win Rate, Current Drawdown, and a mini equity curve chart. Users can toggle between compact and detailed views, with a performance mode option for faster execution on longer backtests.

## What Was Built

- **Live Performance Metrics**: Running P/L, Win Rate (%), and Current Drawdown displayed in real-time during backtest execution
- **Mini Equity Curve Chart**: SVG-based line chart showing equity progression with break-even reference line
- **View Mode Toggle**: Compact and detailed view modes with localStorage persistence
- **Performance Mode**: Checkbox option to reduce polling frequency from 1.5s to 5s for faster execution
- **Backend Metrics Calculation**: Server-side tracking of cumulative P/L, win rate, drawdown, and equity curve points

## Technical Implementation

### Files Modified

- `app/client/src/components/BacktestProgressModal.jsx`: Added MiniEquityCurve component, live metrics display (P/L, win rate, drawdown), view mode toggle, performance mode checkbox, and responsive layout adjustments
- `app/client/src/pages/BacktestConfiguration.jsx`: Added performance mode state management and variable polling intervals (1.5s normal, 5s performance mode)
- `app/server/core/backtest_executor.py`: Extended BacktestExecution dataclass with live metrics fields; implemented metrics calculation during trade execution; added equity curve tracking limited to 50 points
- `app/server/core/data_models.py`: Added new optional fields to BacktestProgress model (current_pnl, running_win_rate, current_drawdown, equity_curve, peak_equity)
- `app/server/tests/test_backtest_executor.py`: Added unit tests for live metrics calculation

### Key Changes

- **Equity Curve Visualization**: Custom SVG-based MiniEquityCurve component renders equity data with gradient fills (green for profit, red for loss), break-even reference line, and current point indicator
- **Metrics Calculation**: Backend calculates cumulative P/L after each trade, running win rate as percentage, and current drawdown from peak equity
- **Equity Curve Limiting**: Equity curve array limited to last 50 points to minimize payload size while maintaining visualization quality
- **View Mode Persistence**: localStorage stores user's view mode preference (compact/detailed) across sessions
- **Dynamic Polling**: Performance mode callback from modal triggers polling interval restart with new frequency

## How to Use

1. Navigate to a saved backtest configuration
2. Click "Run Backtest" to start execution
3. The progress modal displays with real-time metrics:
   - **P/L**: Shows cumulative profit/loss with color coding (green positive, red negative)
   - **Win Rate**: Percentage of winning trades
   - **Drawdown**: Current drawdown from peak equity
   - **Equity Curve**: Mini chart showing balance progression
4. Toggle view mode using the minimize/maximize button in the header
5. Enable "Performance Mode" checkbox to reduce update frequency for long backtests
6. Click "Cancel" to stop execution with partial results

## Configuration

- **Normal Polling Interval**: 1500ms (1.5 seconds)
- **Performance Mode Polling Interval**: 5000ms (5 seconds)
- **Equity Curve Points**: Maximum 50 points stored/displayed
- **View Mode**: Stored in localStorage under key `backtest-progress-view-mode`

## Testing

Run backend unit tests:
```bash
cd app/server && uv run pytest tests/test_backtest_executor.py -v
```

Run E2E test:
```bash
# Follow instructions in .claude/commands/e2e/test_backtest_progress_visualization.md
```

## Notes

- All new fields in BacktestProgress are optional for backward compatibility with older clients
- Metrics update after each trade completion, not on every candle
- The equity curve uses the initial balance as the break-even reference line
- Compact view shows only essential progress info (progress bar, time remaining, trade count)
- Detailed view includes all metrics plus the equity curve chart
