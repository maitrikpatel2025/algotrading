# Feature: Backtest Progress Visualization

## Metadata
issue_number: `106`
adw_id: `62d0b3e2`
issue_json: `{"number":106,"title":"Feature View Backtest Progress Visualization US-BT-008","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nView Backtest Progress Visualization\n want to see key metrics updating in real-time during the backtestSo that I get early feedback on strategy performance\n\n\t∙\tLive updating display shows:\n\t∙\tRunning P/L\n\t∙\tWin Rate (%)\n\t∙\tTotal Trades\n\t∙\tCurrent Drawdown\n\t∙\tMini equity curve drawing as backtest progresses\n\t∙\tAbility to toggle between "compact" and "detailed" progress view\n\t∙\tPerformance mode option to disable live updates for faster execution"}`

## Feature Description
This feature enhances the existing backtest progress modal with real-time key performance metrics visualization. During backtest execution, users will see live-updating displays of Running P/L, Win Rate (%), Total Trades, and Current Drawdown. A mini equity curve chart will render progressively as the backtest runs, providing visual feedback on strategy performance. Users can toggle between "compact" (minimal metrics) and "detailed" (full metrics + equity curve) views. A performance mode option allows disabling live metric updates and reducing polling frequency for faster execution on longer backtests.

## User Story
As a trader
I want to see key metrics updating in real-time during the backtest
So that I get early feedback on strategy performance

## Problem Statement
Currently, the backtest progress modal only displays basic progress information (percentage, candles processed, trade count). Traders cannot see how their strategy is performing until the backtest completes. This lack of early feedback means users must wait for potentially long backtests to finish before learning if their strategy is viable, wasting time on poor-performing strategies.

## Solution Statement
Enhance the BacktestProgressModal with real-time performance metrics (Running P/L, Win Rate, Current Drawdown) and a mini equity curve chart. The backend will calculate these metrics during execution and include them in progress updates. View modes (compact/detailed) provide flexibility for different user preferences, while performance mode allows disabling live updates to prioritize execution speed over visual feedback.

## Relevant Files
Use these files to implement the feature:

### Backend Files
- `app/server/core/backtest_executor.py` - The main backtest execution engine. Needs modification to track live P/L, win rate, drawdown, and equity curve during execution. The `BacktestExecution` dataclass (line 22-37) needs new fields, and the execution loop needs to calculate running metrics.
- `app/server/core/data_models.py` - Contains Pydantic models including `BacktestProgress` (lines 712-757). Needs new fields for current_pnl, running_win_rate, current_drawdown, and equity_curve.
- `app/server/server.py` - Contains the `/api/backtests/{id}/progress` endpoint (lines 1470-1503). May need modification to support performance_mode query parameter.
- `app/server/tests/test_backtest_executor.py` - Existing tests for BacktestExecutor. Needs new tests for live metrics calculation.

### Frontend Files
- `app/client/src/components/BacktestProgressModal.jsx` - The modal component displaying backtest progress (277 lines). Needs significant enhancement to display new metrics, equity curve chart, view mode toggle, and performance mode option.
- `app/client/src/pages/BacktestConfiguration.jsx` - Contains polling logic for progress updates. Needs modification to support performance mode polling interval.
- `app/client/src/app/api.js` - API client methods. May need enhancement to support performance_mode query parameter.

### Documentation Files
- `.claude/commands/test_e2e.md` - E2E test runner documentation for creating the E2E test
- `.claude/commands/e2e/test_backtest_execution.md` - Existing E2E test for backtest execution to understand test patterns
- `app_docs/feature-2bf4bcfd-backtest-execution-progress-cancel.md` - Documentation of the existing backtest execution feature

### New Files
- `.claude/commands/e2e/test_backtest_progress_visualization.md` - New E2E test file to validate the progress visualization feature

## Implementation Plan

### Phase 1: Foundation
Extend the backend data models and executor to track and calculate live performance metrics during backtest execution. This includes adding new fields to the BacktestExecution dataclass and BacktestProgress Pydantic model, then implementing the calculation logic for running P/L, win rate, drawdown, and equity curve points.

### Phase 2: Core Implementation
Update the BacktestProgressModal component to display the new metrics with appropriate formatting and styling. Implement the mini equity curve chart using a lightweight charting library (Recharts is already available in the project). Add the view mode toggle (compact/detailed) and performance mode option.

### Phase 3: Integration
Connect the frontend enhancements to the backend progress endpoint. Implement variable polling intervals based on performance mode. Create comprehensive tests for both backend metrics calculation and frontend visualization components.

## Step by Step Tasks

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_backtest_execution.md` to understand E2E test patterns
- Create `.claude/commands/e2e/test_backtest_progress_visualization.md` with test steps for:
  - Verifying Running P/L displays and updates during execution
  - Verifying Win Rate (%) displays and updates
  - Verifying Current Drawdown displays and updates
  - Verifying mini equity curve renders and updates
  - Verifying compact/detailed view toggle works
  - Verifying performance mode checkbox affects polling behavior
  - Taking screenshots at key states (initial, mid-progress, completion)

### Task 2: Extend Backend Data Models
- Update `app/server/core/data_models.py`:
  - Add `current_pnl: Optional[float] = None` to BacktestProgress
  - Add `running_win_rate: Optional[float] = None` to BacktestProgress
  - Add `current_drawdown: Optional[float] = None` to BacktestProgress
  - Add `equity_curve: Optional[List[float]] = None` to BacktestProgress (stores last 50 points)
  - Add `peak_equity: Optional[float] = None` to BacktestProgress (for drawdown calculation display)

### Task 3: Extend BacktestExecution Dataclass
- Update `app/server/core/backtest_executor.py`:
  - Add `current_pnl: float = 0.0` to BacktestExecution dataclass
  - Add `running_win_rate: float = 0.0` to BacktestExecution dataclass
  - Add `current_drawdown: float = 0.0` to BacktestExecution dataclass
  - Add `equity_curve: List[float] = field(default_factory=list)` to BacktestExecution dataclass
  - Add `peak_equity: float = 0.0` to BacktestExecution dataclass

### Task 4: Implement Live Metrics Calculation in Executor
- Update the `_execute_backtest()` method in `backtest_executor.py`:
  - After each trade completes, calculate cumulative P/L (sum of all trade PnLs)
  - Calculate running win rate: `(winning_trades / total_trades) * 100`
  - Track equity curve: append current balance to equity_curve list at each progress update (every 100 candles)
  - Limit equity_curve to last 50 points to minimize payload size
  - Calculate current drawdown: `((peak_equity - current_equity) / peak_equity) * 100`
  - Update peak_equity whenever current equity exceeds it
- Update the `get_progress()` method to include new metrics in the response

### Task 5: Add Backend Unit Tests for Live Metrics
- Update `app/server/tests/test_backtest_executor.py`:
  - Add test for P/L calculation accuracy during execution
  - Add test for win rate calculation (verify percentage format)
  - Add test for drawdown calculation (verify it tracks peak correctly)
  - Add test for equity curve (verify it limits to 50 points)
  - Add test for metrics included in progress response

### Task 6: Update BacktestProgressModal with New Metrics Display
- Update `app/client/src/components/BacktestProgressModal.jsx`:
  - Add state for viewMode: `const [viewMode, setViewMode] = useState('detailed')`
  - Add state for performanceMode: `const [performanceMode, setPerformanceMode] = useState(false)`
  - Add callback prop `onPerformanceModeChange` to notify parent of mode changes
  - Create a new stats section with 4 metric cards:
    - Running P/L: Show with +/- sign, green for positive, red for negative
    - Win Rate: Show as percentage with % symbol
    - Total Trades: Already exists, keep in grid
    - Current Drawdown: Show as percentage, red color when > 0
  - Add view mode toggle button in modal header (compact/detailed icons)
  - Add performance mode checkbox in modal footer

### Task 7: Implement Mini Equity Curve Chart
- Update `app/client/src/components/BacktestProgressModal.jsx`:
  - Import Recharts components (LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine)
  - Create a mini chart container (height: 120px) above the stats grid
  - Render equity curve data with:
    - Blue line for equity
    - Red reference line at initial balance (break-even)
    - Minimal styling (no axis labels, just line)
    - Area fill: green gradient when above break-even, red below
  - Only render chart in "detailed" view mode
  - Add empty state message when no equity data available yet

### Task 8: Implement Compact View Mode
- Update `app/client/src/components/BacktestProgressModal.jsx`:
  - In compact mode, hide:
    - Mini equity curve chart
    - Detailed stats grid (P/L, win rate, drawdown)
    - Only show: progress bar, percentage, time remaining, trade count
  - Reduce modal size in compact mode
  - Persist view mode preference to localStorage

### Task 9: Implement Performance Mode
- Update `app/client/src/pages/BacktestConfiguration.jsx`:
  - Accept performanceMode state from BacktestProgressModal
  - Modify polling interval based on mode:
    - Normal mode: 1500ms (current)
    - Performance mode: 5000ms
  - Pass performanceMode to API call if needed

### Task 10: Update API Client (Optional Enhancement)
- Update `app/client/src/app/api.js`:
  - Add optional `performanceMode` query parameter to `getBacktestProgress`
  - When performance mode is true, backend could return minimal data (optional optimization)

### Task 11: Add Frontend Component Tests
- Create or update tests for BacktestProgressModal:
  - Test that new metrics display when provided in progress data
  - Test view mode toggle changes display
  - Test performance mode checkbox triggers callback
  - Test equity curve renders with sample data
  - Test color coding for P/L (green/red)
  - Test drawdown displays correctly

### Task 12: Run Validation Commands
- Run all validation commands to ensure zero regressions
- Execute E2E test to validate feature works end-to-end

## Testing Strategy

### Unit Tests
- **Backend (test_backtest_executor.py):**
  - Test `current_pnl` calculation with multiple trades (wins and losses)
  - Test `running_win_rate` calculation (0%, 50%, 100% scenarios)
  - Test `current_drawdown` calculation (verify peak tracking)
  - Test `equity_curve` array management (limit to 50 points)
  - Test progress response includes all new fields

- **Frontend:**
  - Test BacktestProgressModal renders new metrics correctly
  - Test view mode toggle switches between compact/detailed
  - Test performance mode callback fires on checkbox change
  - Test equity curve chart renders with valid data
  - Test empty states when metrics not yet available

### Edge Cases
- Backtest with zero trades (win rate should be 0% or N/A, not error)
- Backtest with all winning trades (win rate 100%, no drawdown)
- Backtest with all losing trades (win rate 0%, continuous drawdown)
- Very short backtests (< 50 candles - equity curve has fewer points)
- Cancelled backtests (metrics should show partial state)
- Rapid polling (ensure no race conditions in metric updates)
- Large equity curve values (verify number formatting)
- Negative P/L display (ensure proper formatting with minus sign)

## Acceptance Criteria
- [ ] Running P/L displays in real-time with correct formatting (+$X.XX or -$X.XX) and color coding (green/red)
- [ ] Win Rate displays as percentage (e.g., "65.4%") and updates after each trade
- [ ] Total Trades count displays and increments in real-time (already exists, verify maintained)
- [ ] Current Drawdown displays as percentage (e.g., "2.5%") with appropriate warning styling
- [ ] Mini equity curve chart renders and updates every progress poll
- [ ] Equity curve shows break-even reference line
- [ ] Compact view mode hides detailed metrics and chart, shows only progress essentials
- [ ] Detailed view mode shows all metrics and equity curve
- [ ] View mode preference persists across sessions (localStorage)
- [ ] Performance mode checkbox disables frequent updates
- [ ] Performance mode increases polling interval from 1.5s to 5s
- [ ] All new metrics are optional (backward compatible with older progress data)
- [ ] Backend unit tests pass with 100% coverage on new calculation logic
- [ ] E2E test validates complete feature flow with screenshots

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/server && uv run ruff check .` - Run linter to check code style
- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/server && uv run ruff format --check .` - Verify code formatting
- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/server && uv run pytest tests/test_backtest_executor.py -v` - Run backtest executor tests
- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/server && uv run pytest` - Run all server tests to validate zero regressions
- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/client && npm run build` - Run frontend build to validate no TypeScript/compilation errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_backtest_progress_visualization.md` to validate this functionality works

## Notes
- **Recharts Availability**: The project already uses Plotly.js for charts. For the mini equity curve, consider using Recharts for its lightweight nature and React integration, or a minimal Plotly implementation. Check `package.json` for available charting libraries.
- **Polling Performance**: The current 1.5s polling interval is reasonable. Performance mode at 5s significantly reduces server load for long backtests.
- **Equity Curve Resolution**: Storing 50 points provides good visualization while keeping payload small. At 100 candles per update, this covers 5000 candles of history.
- **Drawdown Calculation**: Current implementation has `max_drawdown: 0.0` hardcoded. This feature adds live drawdown tracking which can later be used for the final results as well.
- **Thread Safety**: All new metric updates must occur within the existing lock mechanism in BacktestExecutor to prevent race conditions.
- **Backward Compatibility**: All new fields in BacktestProgress are optional, ensuring older clients continue to work without modification.
