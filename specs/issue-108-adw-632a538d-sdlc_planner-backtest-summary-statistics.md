# Feature: Backtest Summary Statistics Dashboard

## Metadata
issue_number: `108`
adw_id: `632a538d`
issue_json: `{"number":108,"title":"Feature View Backtest Summary Statistics US-BT-009","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nAlso make sure all the configuration goes to the pop-up and all the run model comes to the main page. You understand what I'm trying to say basically similar to how we have indicators for this strategy page same as all our configuration setting goes as a pop-up, same as indicator. \nView Backtest Summary Statistics\nwant to see comprehensive performance statistics after backtest completionSo that I can evaluate if my strategy is profitable and robust\n\t∙\tSummary dashboard displays:\n\t∙\tTotal Net Profit/Loss ($)\n\t∙\tReturn on Investment (%)\n\t∙\tTotal Trades\n\t∙\tWin Rate (%)\n\t∙\tProfit Factor\n\t∙\tAverage Win / Average Loss\n\t∙\tLargest Win / Largest Loss\n\t∙\tAverage Trade Duration\n\t∙\tMaximum Drawdown ($ and %)\n\t∙\tRecovery Factor\n\t∙\tSharpe Ratio\n\t∙\tSortino Ratio\n\t∙\tExpectancy\n\t∙\tComparison to buy-and-hold benchmark\n\t∙\tColor coding: green for positive metrics, red for concerning values\n\t∙\tTooltip explanations for each metric\n"}`

## Feature Description
This feature implements a comprehensive backtest summary statistics dashboard that displays after a backtest completes. The summary shows key performance metrics like Total Net Profit/Loss, ROI, Win Rate, Profit Factor, Sharpe Ratio, Sortino Ratio, Maximum Drawdown, and buy-and-hold benchmark comparison. The UI follows the established popup/dialog pattern (similar to IndicatorSettingsDialog) for configuration display, while the main results are shown inline on the BacktestConfiguration page.

The design maintains consistency with the existing codebase patterns:
- Configuration settings use popup/modal dialogs (like indicator settings)
- Run results and statistics display inline on the main page (like the progress modal evolves to show final results)
- Color coding for positive (green) and concerning (red) metrics
- Tooltip explanations for each metric to educate users

## User Story
As a trader
I want to see comprehensive performance statistics after backtest completion
So that I can evaluate if my strategy is profitable and robust

## Problem Statement
After running a backtest, traders need to evaluate whether their strategy is worth deploying with real capital. The current system executes backtests and shows progress, but lacks a comprehensive summary of performance metrics. Traders need to see key statistics like Sharpe Ratio, Sortino Ratio, Maximum Drawdown, Recovery Factor, Expectancy, and buy-and-hold comparison to make informed decisions about their strategies.

## Solution Statement
Implement a backtest summary statistics dashboard with two parts:
1. **Backend Enhancement**: Extend the BacktestExecutor to calculate comprehensive statistics including Sharpe Ratio, Sortino Ratio, Maximum Drawdown ($ and %), Recovery Factor, Expectancy, Average Trade Duration, Largest Win/Loss, and buy-and-hold benchmark comparison
2. **Frontend Summary Panel**: Create a BacktestResultsSummary component that displays on the BacktestConfiguration page after backtest completion, with:
   - KPI cards for primary metrics (Total P/L, ROI, Win Rate, Profit Factor)
   - Detailed statistics grid with all calculated metrics
   - Color coding (green for positive, red for concerning values)
   - Tooltip explanations for each metric
   - Full equity curve visualization
   - Buy-and-hold comparison chart

## Relevant Files
Use these files to implement the feature:

### Backend Files
- `app/server/core/backtest_executor.py` - Contains the `_calculate_results()` method that needs to be extended with additional statistics (Sharpe, Sortino, drawdown, expectancy, trade duration, buy-and-hold)
- `app/server/core/data_models.py` - Contains BacktestConfig and BacktestProgress models; needs new BacktestResultsSummary model
- `app/server/server.py` - API endpoints for backtests; may need endpoint to get detailed results

### Frontend Files
- `app/client/src/pages/BacktestConfiguration.jsx` - Main page where results should display after completion; needs to show BacktestResultsSummary
- `app/client/src/components/BacktestProgressModal.jsx` - Contains MiniEquityCurve component and progress display pattern; reference for styling
- `app/client/src/components/IndicatorSettingsDialog.jsx` - Reference for popup/modal pattern for configuration settings
- `app/client/src/app/api.js` - API client; may need getBacktestResults method
- `app/client/src/app/chart.js` - Chart rendering utilities; reference for equity curve chart

### Reference Files for Patterns
- `app/client/src/components/ui/KPICard.jsx` - If exists, use for metric display; otherwise create
- `app_docs/feature-38950e42-indicator-settings-customization.md` - Reference for popup pattern
- `app_docs/feature-62d0b3e2-backtest-progress-visualization.md` - Reference for metrics display during execution
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_backtest_execution.md` - Reference for backtest E2E test pattern

### New Files
- `app/client/src/components/BacktestResultsSummary.jsx` - New component displaying comprehensive statistics
- `app/client/src/components/MetricCard.jsx` - Reusable metric card with tooltip, value, and color coding
- `app/client/src/components/EquityCurveChart.jsx` - Full equity curve chart with buy-and-hold comparison
- `.claude/commands/e2e/test_backtest_summary_statistics.md` - E2E test specification for this feature

## Implementation Plan
### Phase 1: Foundation
1. Extend backend data models for comprehensive statistics
2. Update `_calculate_results()` in BacktestExecutor to compute all required metrics
3. Create reusable MetricCard component for the frontend

### Phase 2: Core Implementation
1. Create BacktestResultsSummary component with all statistics display
2. Create EquityCurveChart component with buy-and-hold comparison
3. Integrate summary display into BacktestConfiguration page

### Phase 3: Integration
1. Add color coding logic for positive/negative metrics
2. Add tooltip explanations for each metric
3. Update BacktestProgressModal to transition smoothly to results view
4. Create E2E test to validate the complete flow

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_backtest_execution.md` as reference
- Create `.claude/commands/e2e/test_backtest_summary_statistics.md` with test steps for:
  - Running a backtest to completion
  - Verifying all summary statistics display correctly
  - Checking color coding (green/red) for metrics
  - Verifying tooltips appear on hover
  - Testing equity curve chart renders
  - Testing buy-and-hold comparison displays

### Task 2: Extend Backend Data Models
- Read `app/server/core/data_models.py`
- Add new `BacktestResultsSummary` Pydantic model with fields:
  - `total_net_profit`: float - Total Net Profit/Loss ($)
  - `return_on_investment`: float - ROI (%)
  - `total_trades`: int
  - `winning_trades`: int
  - `losing_trades`: int
  - `win_rate`: float - Win Rate (%)
  - `profit_factor`: float
  - `average_win`: float
  - `average_loss`: float
  - `win_loss_ratio`: float - Average Win / Average Loss
  - `largest_win`: float
  - `largest_loss`: float
  - `average_trade_duration_minutes`: float
  - `max_drawdown_dollars`: float - Maximum Drawdown ($)
  - `max_drawdown_percent`: float - Maximum Drawdown (%)
  - `recovery_factor`: float
  - `sharpe_ratio`: float
  - `sortino_ratio`: float
  - `expectancy`: float - Expected value per trade
  - `buy_hold_return`: float - Buy-and-hold benchmark return (%)
  - `strategy_vs_benchmark`: float - Strategy return minus buy-hold return
  - `equity_curve`: List[float] - Full equity curve data
  - `buy_hold_curve`: List[float] - Buy-and-hold equity curve for comparison
  - `final_balance`: float
- All fields should be Optional with sensible defaults

### Task 3: Enhance BacktestExecutor Statistics Calculation
- Read `app/server/core/backtest_executor.py` (especially `_calculate_results()` method around line 732)
- Create helper method `_calculate_sharpe_ratio()` using daily returns and risk-free rate of 0
- Create helper method `_calculate_sortino_ratio()` using only downside deviation
- Create helper method `_calculate_max_drawdown()` from equity curve returning both $ and %
- Create helper method `_calculate_recovery_factor()` = total_return / max_drawdown
- Create helper method `_calculate_expectancy()` = (win_rate * avg_win) - (loss_rate * avg_loss)
- Create helper method `_calculate_buy_hold_return()` comparing first candle open to last candle close
- Update `_calculate_results()` to:
  - Track equity curve throughout execution (store all points, not just last 50)
  - Calculate average trade duration from entry/exit timestamps
  - Find largest win and largest loss from trades list
  - Calculate Sharpe Ratio from daily returns
  - Calculate Sortino Ratio from downside deviation
  - Calculate Maximum Drawdown from equity curve
  - Calculate Recovery Factor
  - Calculate Expectancy
  - Calculate buy-and-hold benchmark
  - Return full BacktestResultsSummary data

### Task 4: Create MetricCard Component
- Create `app/client/src/components/MetricCard.jsx`
- Props: `label`, `value`, `prefix`, `suffix`, `tooltip`, `trend` ('positive', 'negative', 'neutral')
- Display:
  - Label at top in small uppercase text
  - Large value with optional prefix/suffix
  - Color coding: green for positive trend, red for negative, gray for neutral
  - Info icon that shows tooltip on hover
- Use existing Tailwind classes for consistency
- Include animation on mount for visual polish

### Task 5: Create EquityCurveChart Component
- Create `app/client/src/components/EquityCurveChart.jsx`
- Use Plotly.js (already in project) for rendering
- Props: `equityCurve`, `buyHoldCurve`, `initialBalance`
- Display:
  - Strategy equity curve as primary line (blue)
  - Buy-and-hold curve as secondary line (gray dashed)
  - Break-even reference line at initial balance
  - Hover tooltips showing value at each point
  - Legend showing "Strategy" vs "Buy & Hold"
- Responsive sizing to fit container
- Match existing chart styling from PriceChart component

### Task 6: Create BacktestResultsSummary Component
- Create `app/client/src/components/BacktestResultsSummary.jsx`
- Props: `results` (BacktestResultsSummary data), `initialBalance`, `onClose` (optional)
- Layout structure:
  ```
  ┌──────────────────────────────────────────────────────────┐
  │ Header: "Backtest Results" with status badge (Completed) │
  ├──────────────────────────────────────────────────────────┤
  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
  │ │ Net P/L │ │   ROI   │ │Win Rate │ │ Profit  │         │
  │ │ $1,234  │ │ +12.3%  │ │  58.2%  │ │ Factor  │         │
  │ │         │ │         │ │         │ │  1.45   │         │
  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
  ├──────────────────────────────────────────────────────────┤
  │                   Equity Curve Chart                      │
  │            (Strategy vs Buy-and-Hold)                    │
  ├──────────────────────────────────────────────────────────┤
  │ Trade Statistics          │ Risk Metrics                 │
  │ ─────────────────────────│ ─────────────────────────    │
  │ Total Trades: 47          │ Max Drawdown: $234 (2.34%)   │
  │ Winners/Losers: 27/20     │ Recovery Factor: 5.2         │
  │ Avg Win: $85.50           │ Sharpe Ratio: 1.82           │
  │ Avg Loss: $52.30          │ Sortino Ratio: 2.15          │
  │ Win/Loss Ratio: 1.63      │ Expectancy: $15.20           │
  │ Largest Win: $234.00      │                              │
  │ Largest Loss: $123.00     │ Benchmark Comparison         │
  │ Avg Duration: 4h 23m      │ Buy & Hold: +8.5%            │
  │                           │ Strategy vs B&H: +3.8%       │
  └──────────────────────────────────────────────────────────┘
  ```
- Use MetricCard for primary KPIs
- Two-column grid for detailed stats
- Color coding:
  - Green: positive P/L, high win rate (>50%), profit factor >1, positive Sharpe, strategy beats benchmark
  - Red: negative P/L, low win rate (<40%), profit factor <1, negative Sharpe, max drawdown >20%
  - Neutral: metrics in between thresholds
- Tooltip definitions for each metric (see Acceptance Criteria for text)

### Task 7: Integrate Results into BacktestConfiguration Page
- Read `app/client/src/pages/BacktestConfiguration.jsx`
- Add state: `showResults` (boolean), `backtestResults` (object)
- After backtest completion (status === 'completed'):
  - Fetch full results from API or use cached results
  - Set `showResults = true` and populate `backtestResults`
  - Display BacktestResultsSummary component below the configuration form
- Add "View Results" button that shows/hides the results section
- When backtest status is 'completed', auto-show results section
- Results section should be collapsible
- Update BacktestProgressModal to transition to showing summary on completion (or close and show inline)

### Task 8: Update BacktestLibrary Display
- Read `app/client/src/pages/BacktestLibrary.jsx`
- For completed backtests, add key metrics preview:
  - Return (%) with color coding
  - Win Rate (%)
  - Total Trades
- Add "View Results" quick action for completed backtests
- On click, navigate to backtest configuration with results visible

### Task 9: Add Metric Tooltips Content
- Create constants file or add to existing constants: `app/client/src/app/metricDefinitions.js`
- Define tooltip content for each metric:
  - Total Net Profit/Loss: "The total profit or loss from all trades, in account currency"
  - ROI: "Return on Investment - the percentage gain or loss relative to initial capital"
  - Win Rate: "Percentage of trades that were profitable"
  - Profit Factor: "Gross profit divided by gross loss. Values above 1.0 indicate profitability"
  - Average Win: "Average profit from winning trades"
  - Average Loss: "Average loss from losing trades"
  - Win/Loss Ratio: "Average win divided by average loss"
  - Largest Win/Loss: "The single best and worst trades"
  - Average Trade Duration: "Mean time from entry to exit across all trades"
  - Maximum Drawdown: "Largest peak-to-trough decline in equity"
  - Recovery Factor: "Net profit divided by maximum drawdown. Higher is better"
  - Sharpe Ratio: "Risk-adjusted return. Above 1.0 is good, above 2.0 is excellent"
  - Sortino Ratio: "Like Sharpe but only penalizes downside volatility"
  - Expectancy: "Average expected profit per trade based on win rate and average wins/losses"
  - Buy & Hold Return: "What you would have earned simply buying and holding the asset"
  - Strategy vs Benchmark: "How much the strategy outperformed or underperformed buy-and-hold"

### Task 10: Unit Tests for Backend Statistics
- Read `app/server/tests/test_backtest_executor.py`
- Add test cases for new statistics calculations:
  - Test Sharpe ratio calculation with known returns
  - Test Sortino ratio calculation with known downside deviation
  - Test max drawdown calculation from equity curve
  - Test recovery factor calculation
  - Test expectancy calculation
  - Test buy-and-hold calculation
  - Test edge cases (no trades, all winners, all losers)

### Task 11: Run Validation Commands
- Run all validation commands to ensure zero regressions
- Execute E2E test to validate the feature works as expected

## Testing Strategy
### Unit Tests
- Test `_calculate_sharpe_ratio()` with various return sequences
- Test `_calculate_sortino_ratio()` with known downside deviation
- Test `_calculate_max_drawdown()` with equity curves having known drawdowns
- Test `_calculate_recovery_factor()` edge cases (zero drawdown)
- Test `_calculate_expectancy()` with various win rates
- Test `_calculate_buy_hold_return()` with price data
- Test complete `_calculate_results()` returns all required fields

### Edge Cases
- Backtest with zero trades (should show zeros/N/A)
- Backtest with all winning trades (Sortino should handle zero downside)
- Backtest with all losing trades (Sharpe should be negative)
- Backtest cancelled with partial results (show partial statistics)
- Very short backtest (1-5 trades) - statistics may be unreliable
- Long backtest with thousands of trades (performance test)
- Buy-and-hold calculation when price ends at same level (zero return)

## Acceptance Criteria
- Summary dashboard displays after backtest completes
- All 15+ metrics are calculated and displayed:
  - Total Net Profit/Loss ($) with + sign for positive
  - Return on Investment (%) with + sign for positive
  - Total Trades (integer count)
  - Win Rate (%) to 1 decimal place
  - Profit Factor to 2 decimal places
  - Average Win ($) to 2 decimal places
  - Average Loss ($) to 2 decimal places
  - Win/Loss Ratio to 2 decimal places
  - Largest Win ($) to 2 decimal places
  - Largest Loss ($) to 2 decimal places
  - Average Trade Duration (formatted as Xh Xm)
  - Maximum Drawdown ($ and %) both displayed
  - Recovery Factor to 2 decimal places
  - Sharpe Ratio to 2 decimal places
  - Sortino Ratio to 2 decimal places
  - Expectancy ($) to 2 decimal places
  - Buy & Hold Return (%)
  - Strategy vs Benchmark (%)
- Color coding applied: green for positive/good metrics, red for negative/concerning values
- Tooltip explanations appear on hover for each metric
- Equity curve chart displays with buy-and-hold comparison line
- Results auto-display after backtest completion
- Results can be viewed from BacktestLibrary for completed backtests
- All backend unit tests pass
- All frontend builds without errors
- E2E test validates the complete flow

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_backtest_summary_statistics.md` to validate this functionality works
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- The Sharpe Ratio calculation assumes a risk-free rate of 0% for simplicity. In production, this could be configurable.
- Sortino Ratio uses only downside deviation (negative returns) in the denominator, making it more appropriate for trading strategies.
- The buy-and-hold benchmark uses the first and last price in the backtest date range, assuming a single buy at start and sell at end.
- Recovery Factor = Net Profit / Max Drawdown. A higher value indicates the strategy recovers well from drawdowns.
- Expectancy = (Win Rate * Avg Win) - (Loss Rate * Avg Loss). This gives expected profit per trade.
- For backtests with very few trades (<10), consider showing a warning that statistics may not be statistically significant.
- The equity curve stores all balance points (not limited to 50 like progress tracking) for accurate visualization.
- Consider caching calculated results to avoid re-computation when viewing results multiple times.
- Future enhancement: Add export functionality for results (PDF, CSV).
