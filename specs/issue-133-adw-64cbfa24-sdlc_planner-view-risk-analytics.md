# Feature: View Risk Analytics

## Metadata
issue_number: `133`
adw_id: `64cbfa24`
issue_json: `{"number":133,"title":"Feature  View Risk Analytics US-BT-015","body":"/feature\n\nadw_sdlc_iso.py\n\nmodel_set heavy\n\n\n\nView Risk Analytics\n\nI want to see detailed risk metrics and distributions\nSo that I can understand the risk profile of my strategy\nAcceptance Criteria:\n\n Maximum consecutive wins/losses\n Average consecutive wins/losses\n Win/Loss distribution histogram\n Trade P/L scatter plot (entry time vs P/L)\n Holding period distribution\n Risk of ruin calculation (Monte Carlo)\n Drawdown duration analysis\n VaR (Value at Risk) at 95% and 99% confidence\n"}`

## Feature Description
This feature adds a comprehensive Risk Analytics section to the Backtest Results Summary page. It provides detailed risk metrics and visualizations that help traders understand the risk profile of their strategy beyond the basic metrics already displayed. The section includes streak analysis (consecutive wins/losses), distribution histograms (win/loss and holding period), a P/L scatter plot, Monte Carlo-based Risk of Ruin calculation, drawdown duration analysis, and Value at Risk (VaR) calculations at 95% and 99% confidence levels.

## User Story
As a trader
I want to see detailed risk metrics and distributions
So that I can understand the risk profile of my strategy

## Problem Statement
The current backtest results provide basic risk metrics (Sharpe ratio, Sortino ratio, max drawdown), but traders need deeper risk analysis to make informed decisions about strategy deployment. Without streak analysis, distribution analysis, Monte Carlo simulations, and VaR calculations, traders cannot fully understand tail risks, potential for ruin, or the statistical distribution of their strategy's performance.

## Solution Statement
Add a new collapsible "Risk Analytics" section to the BacktestResultsSummary component that displays:
1. **Streak Analysis Card**: Maximum and average consecutive wins/losses
2. **Win/Loss Distribution Histogram**: Visual distribution of trade P/L values
3. **P/L Scatter Plot**: Entry time vs P/L scatter plot to identify time-based patterns
4. **Holding Period Distribution**: Histogram showing distribution of trade durations
5. **Risk of Ruin Calculator**: Monte Carlo simulation-based probability of account ruin
6. **Drawdown Duration Analysis**: Statistics on how long drawdowns last
7. **VaR Metrics**: Value at Risk at 95% and 99% confidence levels

All calculations will be performed in the backend (backtest_executor.py) and stored in the BacktestResultsSummary model for efficient retrieval.

## Relevant Files
Use these files to implement the feature:

**Backend Files:**
- `app/server/core/backtest_executor.py` - Add new risk analytics calculation methods
- `app/server/core/data_models.py` - Extend BacktestResultsSummary model with new risk analytics fields
- `app/server/tests/test_backtest_executor.py` - Add unit tests for new calculation methods

**Frontend Files:**
- `app/client/src/components/BacktestResultsSummary.jsx` - Add the new RiskAnalytics section
- `app/client/src/app/metricDefinitions.js` - Add metric definitions for new risk metrics

**Documentation:**
- `.claude/commands/test_e2e.md` - E2E test runner reference
- `.claude/commands/e2e/test_backtest_summary_statistics.md` - Example E2E test for reference

### New Files
- `app/client/src/components/RiskAnalytics.jsx` - New component for risk analytics section with all visualizations
- `app/client/src/components/WinLossHistogram.jsx` - Histogram component for win/loss distribution
- `app/client/src/components/PLScatterPlot.jsx` - Scatter plot component for entry time vs P/L
- `app/client/src/components/HoldingPeriodHistogram.jsx` - Histogram component for holding period distribution
- `app/client/src/components/RiskOfRuinCard.jsx` - Monte Carlo risk of ruin display card
- `app/client/src/components/DrawdownDurationCard.jsx` - Drawdown duration statistics card
- `app/client/src/components/VaRCard.jsx` - Value at Risk display card
- `.claude/commands/e2e/test_risk_analytics.md` - E2E test specification for risk analytics feature

## Implementation Plan
### Phase 1: Foundation
1. Extend the BacktestResultsSummary Pydantic model in `data_models.py` with new fields for risk analytics data
2. Add calculation methods to `backtest_executor.py` for all new risk metrics
3. Integrate the new calculations into the backtest execution flow
4. Add unit tests for all new calculation methods

### Phase 2: Core Implementation
1. Create the RiskAnalytics parent component with collapsible section design
2. Implement each visualization sub-component (histograms, scatter plot, cards)
3. Add metric definitions for new metrics in metricDefinitions.js
4. Style components following existing design patterns (Precision Swiss Design System)

### Phase 3: Integration
1. Integrate RiskAnalytics component into BacktestResultsSummary
2. Ensure data flows correctly from backend to frontend
3. Test with existing backtests to validate calculations
4. Add E2E test to validate user-facing functionality

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_backtest_summary_statistics.md` as a reference
- Create `.claude/commands/e2e/test_risk_analytics.md` with test steps for:
  - Navigating to a completed backtest
  - Verifying Risk Analytics section appears
  - Verifying streak analysis metrics (max/avg consecutive wins/losses)
  - Verifying Win/Loss distribution histogram renders
  - Verifying P/L scatter plot renders with correct data points
  - Verifying Holding period histogram renders
  - Verifying Risk of Ruin calculation displays
  - Verifying Drawdown duration analysis displays
  - Verifying VaR at 95% and 99% confidence levels display
  - Verifying section is collapsible
  - Taking screenshots at key steps

### Step 2: Extend Data Models
- Open `app/server/core/data_models.py`
- Add new fields to `BacktestResultsSummary` class:
  - `max_consecutive_wins: int` - Maximum consecutive winning trades
  - `max_consecutive_losses: int` - Maximum consecutive losing trades
  - `avg_consecutive_wins: float` - Average consecutive wins streak
  - `avg_consecutive_losses: float` - Average consecutive losses streak
  - `win_loss_distribution: Optional[List[Dict[str, Any]]]` - Histogram bucket data for P/L distribution
  - `holding_period_distribution: Optional[List[Dict[str, Any]]]` - Histogram bucket data for holding periods
  - `pl_scatter_data: Optional[List[Dict[str, Any]]]` - Scatter plot data (entry_time, pnl)
  - `risk_of_ruin: Optional[float]` - Probability of account ruin (Monte Carlo)
  - `risk_of_ruin_simulations: int` - Number of Monte Carlo simulations run
  - `drawdown_durations: Optional[List[Dict[str, Any]]]` - List of drawdown periods with durations
  - `avg_drawdown_duration_minutes: Optional[float]` - Average drawdown duration
  - `max_drawdown_duration_minutes: Optional[float]` - Maximum drawdown duration
  - `var_95: Optional[float]` - Value at Risk at 95% confidence
  - `var_99: Optional[float]` - Value at Risk at 99% confidence

### Step 3: Add Risk Analytics Calculation Methods to Backend
- Open `app/server/core/backtest_executor.py`
- Add method `_calculate_consecutive_streaks(trades: List[Dict]) -> Dict[str, Any]`:
  - Iterate through trades tracking consecutive wins/losses
  - Return max and average streaks for both wins and losses
- Add method `_calculate_win_loss_distribution(trades: List[Dict]) -> List[Dict]`:
  - Create histogram buckets for P/L values
  - Return list of {bucket_min, bucket_max, count, is_winner}
- Add method `_calculate_holding_period_distribution(trades: List[Dict]) -> List[Dict]`:
  - Calculate holding duration for each trade
  - Create histogram buckets for durations
  - Return list of {bucket_min_minutes, bucket_max_minutes, count}
- Add method `_calculate_pl_scatter_data(trades: List[Dict]) -> List[Dict]`:
  - Extract entry_time and pnl for each trade
  - Return list of {entry_time: ISO string, pnl: float, is_winner: bool}
- Add method `_calculate_risk_of_ruin(trades: List[Dict], initial_balance: float, ruin_threshold: float = 0.5, simulations: int = 10000) -> float`:
  - Run Monte Carlo simulation resampling trade returns
  - Track how many simulations hit the ruin threshold
  - Return probability of ruin
- Add method `_calculate_drawdown_durations(equity_curve: List[float], equity_dates: List[str]) -> Dict[str, Any]`:
  - Use existing drawdown periods
  - Calculate duration in minutes for each period
  - Return avg and max duration plus list of durations
- Add method `_calculate_var(trades: List[Dict], confidence_levels: List[float] = [0.95, 0.99]) -> Dict[str, float]`:
  - Sort trade P/L values
  - Calculate VaR at each confidence level using historical method
  - Return dict with var_95 and var_99

### Step 4: Integrate Risk Analytics into Backtest Execution
- In `backtest_executor.py`, locate the `_complete_backtest` method
- After existing metrics calculations, call new methods:
  - Call `_calculate_consecutive_streaks(trades)` and add to results
  - Call `_calculate_win_loss_distribution(trades)` and add to results
  - Call `_calculate_holding_period_distribution(trades)` and add to results
  - Call `_calculate_pl_scatter_data(trades)` and add to results
  - Call `_calculate_risk_of_ruin(trades, initial_balance)` and add to results
  - Call `_calculate_drawdown_durations(equity_curve, equity_dates)` and add to results
  - Call `_calculate_var(trades)` and add to results
- Ensure all new fields are included in the BacktestResultsSummary creation

### Step 5: Add Unit Tests for Backend Calculations
- Open or create `app/server/tests/test_backtest_executor.py`
- Add test `test_calculate_consecutive_streaks`:
  - Test with alternating wins/losses
  - Test with all wins
  - Test with all losses
  - Test with mixed streaks
- Add test `test_calculate_win_loss_distribution`:
  - Verify histogram buckets are created correctly
  - Verify trades fall into correct buckets
- Add test `test_calculate_holding_period_distribution`:
  - Verify duration calculations
  - Verify histogram bucket assignment
- Add test `test_calculate_risk_of_ruin`:
  - Test with profitable strategy (should be low risk)
  - Test with unprofitable strategy (should be high risk)
  - Verify simulation count
- Add test `test_calculate_drawdown_durations`:
  - Test with multiple drawdown periods
  - Verify duration calculations
- Add test `test_calculate_var`:
  - Test VaR calculation with known distribution
  - Verify 95% and 99% levels

### Step 6: Add Metric Definitions to Frontend
- Open `app/client/src/app/metricDefinitions.js`
- Add definitions for new metrics:
  - `max_consecutive_wins`: label "Max Consecutive Wins", format integer, trend positive
  - `max_consecutive_losses`: label "Max Consecutive Losses", format integer, trend negative
  - `avg_consecutive_wins`: label "Avg Win Streak", format decimal 1 place
  - `avg_consecutive_losses`: label "Avg Loss Streak", format decimal 1 place
  - `risk_of_ruin`: label "Risk of Ruin", format percentage, trend negative
  - `avg_drawdown_duration_minutes`: label "Avg Drawdown Duration", format duration
  - `max_drawdown_duration_minutes`: label "Max Drawdown Duration", format duration
  - `var_95`: label "VaR (95%)", format currency, trend negative
  - `var_99`: label "VaR (99%)", format currency, trend negative
- Add tooltips explaining each metric

### Step 7: Create WinLossHistogram Component
- Create `app/client/src/components/WinLossHistogram.jsx`
- Component receives `distribution` prop (array of bucket data)
- Use Plotly.js bar chart to render histogram
- Color winners green, losers red
- Add X-axis label "P/L ($)", Y-axis label "Number of Trades"
- Add hover tooltips showing bucket range and count
- Follow existing chart styling patterns (see EquityCurveChart, HourlyPerformanceChart)

### Step 8: Create PLScatterPlot Component
- Create `app/client/src/components/PLScatterPlot.jsx`
- Component receives `scatterData` prop (array of {entry_time, pnl, is_winner})
- Use Plotly.js scatter chart
- X-axis: entry time (formatted dates)
- Y-axis: P/L value
- Color points green for winners, red for losers
- Add horizontal line at y=0 for reference
- Add hover tooltips showing date and P/L
- Support zoom and pan interactions

### Step 9: Create HoldingPeriodHistogram Component
- Create `app/client/src/components/HoldingPeriodHistogram.jsx`
- Component receives `distribution` prop (array of bucket data)
- Use Plotly.js bar chart to render histogram
- Single color (neutral blue or similar)
- X-axis: "Holding Period", Y-axis: "Number of Trades"
- Format durations appropriately (minutes, hours, days)
- Add hover tooltips showing bucket range and count

### Step 10: Create RiskOfRuinCard Component
- Create `app/client/src/components/RiskOfRuinCard.jsx`
- Component receives `riskOfRuin` and `simulationCount` props
- Display probability as percentage with color coding:
  - Green for < 5%
  - Yellow/Orange for 5-20%
  - Red for > 20%
- Show simulation count as subtitle
- Add tooltip explaining Risk of Ruin calculation
- Include info icon with Monte Carlo explanation

### Step 11: Create DrawdownDurationCard Component
- Create `app/client/src/components/DrawdownDurationCard.jsx`
- Component receives `avgDuration`, `maxDuration`, and `durations` props
- Display average and max drawdown durations formatted nicely
- Optionally show mini bar chart of duration distribution
- Add tooltips explaining drawdown duration metrics

### Step 12: Create VaRCard Component
- Create `app/client/src/components/VaRCard.jsx`
- Component receives `var95` and `var99` props
- Display both VaR values with currency formatting
- Color code based on severity (larger absolute values = more red)
- Add tooltip explaining VaR interpretation
- Include "per trade" context in display

### Step 13: Create RiskAnalytics Parent Component
- Create `app/client/src/components/RiskAnalytics.jsx`
- Import all sub-components (histograms, scatter plot, cards)
- Receive `results` prop containing all risk analytics data
- Layout structure:
  - Section header with "Risk Analytics" title and TrendingDown icon
  - Collapsible section (follow existing pattern from PerformanceByTimePeriod)
  - First row: Streak Analysis cards (2 columns)
  - Second row: VaR card and Risk of Ruin card (2 columns)
  - Third row: Drawdown Duration card
  - Fourth row: Win/Loss Distribution histogram (full width)
  - Fifth row: P/L Scatter Plot (full width)
  - Sixth row: Holding Period Distribution histogram (full width)
- Handle null/missing data gracefully with "Insufficient data" messages
- Follow existing design patterns (Precision Swiss Design System)

### Step 14: Integrate RiskAnalytics into BacktestResultsSummary
- Open `app/client/src/components/BacktestResultsSummary.jsx`
- Import RiskAnalytics component
- Add RiskAnalytics section after the existing Risk Metrics section
- Pass `results` prop to RiskAnalytics component
- Ensure section appears between Risk Metrics and Performance by Time Period

### Step 15: Run Backend Tests
- Run `cd app/server && uv run pytest tests/test_backtest_executor.py -v`
- Verify all new unit tests pass
- Fix any failing tests

### Step 16: Run Full Backend Test Suite
- Run `cd app/server && uv run pytest`
- Verify no regressions in existing tests
- Fix any failures

### Step 17: Build Frontend
- Run `cd app/client && npm run build`
- Verify build completes without errors
- Fix any TypeScript or build errors

### Step 18: Execute E2E Test
- Read `.claude/commands/test_e2e.md`
- Read and execute `.claude/commands/e2e/test_risk_analytics.md`
- Verify all test steps pass
- Capture screenshots as specified

### Step 19: Run Validation Commands
- Run all validation commands to ensure zero regressions

## Testing Strategy
### Unit Tests
- Test `_calculate_consecutive_streaks` with edge cases (empty trades, single trade, all same outcome)
- Test `_calculate_win_loss_distribution` with various P/L ranges
- Test `_calculate_holding_period_distribution` with trades of different durations
- Test `_calculate_pl_scatter_data` data extraction
- Test `_calculate_risk_of_ruin` Monte Carlo convergence and edge cases
- Test `_calculate_drawdown_durations` with various equity curves
- Test `_calculate_var` with known distributions for verification

### Edge Cases
- Empty trade list (no trades to analyze)
- Single trade (not enough data for distributions)
- All winning trades (no losses for distribution)
- All losing trades (no wins for distribution)
- Very short holding periods (sub-minute)
- Very long holding periods (weeks)
- Trades with zero P/L
- Extreme outliers in P/L
- Monte Carlo with very few trades (may not converge)
- Equity curve with no drawdowns
- Missing entry/exit times on trades

## Acceptance Criteria
- [x] Maximum consecutive wins/losses are calculated and displayed
- [x] Average consecutive wins/losses are calculated and displayed
- [x] Win/Loss distribution histogram renders with proper color coding
- [x] Trade P/L scatter plot shows entry time vs P/L with colored points
- [x] Holding period distribution histogram displays trade duration distribution
- [x] Risk of ruin is calculated using Monte Carlo simulation (10,000 iterations)
- [x] Drawdown duration analysis shows average and maximum durations
- [x] VaR (Value at Risk) at 95% and 99% confidence levels are displayed
- [x] Risk Analytics section is collapsible
- [x] All metrics have tooltips explaining their meaning
- [x] Backend unit tests pass for all new calculations
- [x] E2E test validates all UI elements render correctly
- [x] No regressions in existing backtest functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_risk_analytics.md` to validate the Risk Analytics functionality works.

- `cd app/server && uv run pytest tests/test_backtest_executor.py -v` - Run backtest executor tests
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- **Monte Carlo Simulation Performance**: The risk of ruin calculation uses 10,000 simulations by default. This should complete quickly even for backtests with many trades. If performance becomes an issue, consider reducing simulation count or running asynchronously.
- **VaR Methodology**: Using the historical simulation method for VaR calculation as it's intuitive and works well with trade data. Alternative methods (parametric, Monte Carlo) could be added in future iterations.
- **Histogram Binning**: Use automatic binning algorithms (Sturges' or Scott's rule) for distribution histograms to handle varying trade counts appropriately.
- **Plotly.js Consistency**: All charts use Plotly.js for consistency with existing charts (PriceChart, EquityCurveChart, HourlyPerformanceChart).
- **Responsive Design**: Ensure all visualizations work on tablet and mobile views, following existing responsive patterns.
- **Data Persistence**: Risk analytics data is stored with backtest results, so users can view historical risk analysis without re-calculation.
