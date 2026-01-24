# Feature: Compare Backtest Results

## Metadata
issue_number: `135`
adw_id: `96de4387`
issue_json: `{"number":135,"title":"Feature Compare Backtest Results US-BT-016","body":"\n/feature\nadw_sdlc_iso\nmodel_set heavy\n\nCompare Backtest Results\n\nI want to compare results from multiple backtests side by side\nSo that I can evaluate which strategy variation performs best\nAcceptance Criteria:\n\n Select 2-4 saved backtest results for comparison\n Side-by-side metrics table\n Overlaid equity curves (different colors)\n Highlight best value for each metric\n Calculate statistical significance of differences\n Notes field to document what changed between versions\n Export comparison report"}`

## Feature Description
This feature enables traders to compare results from multiple backtests (2-4) side by side in a comprehensive comparison view. The comparison includes a side-by-side metrics table with best value highlighting, overlaid equity curves with different colors for each backtest, statistical significance calculations for key metric differences, comparison notes documentation, and the ability to export the comparison report. This helps traders evaluate which strategy variation performs best by providing clear visual and statistical comparisons.

## User Story
As a trader
I want to compare results from multiple backtests side by side
So that I can evaluate which strategy variation performs best

## Problem Statement
Currently, traders must manually review individual backtest results one at a time, making it difficult to objectively compare strategy variations. Without side-by-side comparison, traders may miss subtle performance differences or make decisions based on incomplete analysis. This feature addresses the need for a unified comparison view that highlights differences and helps identify the best-performing strategy variation.

## Solution Statement
Implement a comprehensive backtest comparison feature that allows users to:
1. Select 2-4 completed backtests from the library for comparison
2. View a side-by-side metrics table with automatic best-value highlighting
3. Visualize overlaid equity curves with distinct colors for each backtest
4. Calculate and display statistical significance of metric differences
5. Add comparison notes to document what changed between strategy versions
6. Export the comparison report in multiple formats (CSV, JSON, PDF)

The solution follows existing patterns in the codebase for backtest management, data models, and component architecture.

## Relevant Files
Use these files to implement the feature:

**Backend Files:**
- `app/server/server.py` - Add comparison API endpoints (GET /api/backtests/compare, POST /api/backtests/compare/export)
- `app/server/core/data_models.py` - Add BacktestComparisonResult and BacktestComparisonConfig Pydantic models
- `app/server/core/backtest_service.py` - Add comparison data fetching and aggregation methods
- `app/server/utils/export_generators.py` - Add comparison report export generators (CSV, JSON, PDF)

**Frontend Files:**
- `app/client/src/pages/BacktestLibrary.jsx` - Add multi-select mode and "Compare" button
- `app/client/src/app/api.js` - Add comparison API client methods
- `app/client/src/app/metricDefinitions.js` - Reference existing metric definitions for comparison table

**Documentation Files:**
- `app_docs/feature-b503685d-backtest-configuration.md` - Understand backtest data model and library patterns
- `app_docs/feature-632a538d-backtest-summary-statistics.md` - Understand metrics structure and calculations
- `app_docs/feature-69a9dc86-equity-curve-chart.md` - Understand equity curve visualization with lightweight-charts
- `app_docs/feature-ffe0f2e6-save-backtest-results.md` - Understand export patterns and notes functionality

**E2E Test Reference:**
- `.claude/commands/test_e2e.md` - Understand E2E test runner framework
- `.claude/commands/e2e/test_backtest_configuration.md` - Example E2E test for backtest features

### New Files

**Frontend Components:**
- `app/client/src/pages/BacktestComparison.jsx` - Main comparison page component
- `app/client/src/components/ComparisonMetricsTable.jsx` - Side-by-side metrics table with highlighting
- `app/client/src/components/ComparisonEquityCurve.jsx` - Overlaid equity curves chart
- `app/client/src/components/ComparisonStatistics.jsx` - Statistical significance display
- `app/client/src/components/ComparisonNotesEditor.jsx` - Notes field for documenting changes
- `app/client/src/components/ComparisonExportDialog.jsx` - Export format selection dialog

**Backend:**
- `app/server/core/comparison_service.py` - Comparison business logic and statistical calculations

**E2E Test:**
- `.claude/commands/e2e/test_compare_backtest_results.md` - E2E test specification for comparison feature

## Implementation Plan
### Phase 1: Foundation
1. Create Pydantic data models for comparison requests and responses
2. Add comparison service with data aggregation and statistical calculations
3. Add comparison API endpoints to server.py
4. Add API client methods for comparison endpoints

### Phase 2: Core Implementation
1. Implement multi-select mode in BacktestLibrary with checkboxes
2. Create BacktestComparison page with routing
3. Implement ComparisonMetricsTable with best-value highlighting
4. Implement ComparisonEquityCurve with overlaid curves using lightweight-charts
5. Implement ComparisonStatistics for statistical significance
6. Implement ComparisonNotesEditor for documentation
7. Implement ComparisonExportDialog and export generators

### Phase 3: Integration
1. Add navigation from BacktestLibrary to comparison view
2. Add "Compare" button that appears when 2-4 backtests are selected
3. Integrate export functionality with existing patterns
4. Add E2E tests for comparison workflow

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test framework
- Read `.claude/commands/e2e/test_backtest_configuration.md` as an example
- Create `.claude/commands/e2e/test_compare_backtest_results.md` with test steps for:
  - Selecting multiple backtests in library
  - Navigating to comparison view
  - Verifying metrics table with highlighting
  - Verifying overlaid equity curves
  - Testing statistical significance display
  - Testing notes editor
  - Testing export functionality

### Step 2: Create Backend Data Models
- Add `BacktestComparisonConfig` model to `app/server/core/data_models.py`:
  - `backtest_ids: List[str]` (2-4 UUIDs)
  - `notes: Optional[str]` - Comparison notes
- Add `BacktestComparisonResult` model to `app/server/core/data_models.py`:
  - `backtests: List[BacktestConfig]` - Full backtest configs with results
  - `metrics_comparison: Dict[str, List[MetricValue]]` - Metrics keyed by name
  - `best_values: Dict[str, int]` - Index of best backtest for each metric
  - `statistical_significance: Dict[str, StatisticalTest]` - Significance results
  - `notes: Optional[str]`
- Add `MetricValue` model with `backtest_id`, `value`, `formatted_value`
- Add `StatisticalTest` model with `metric`, `p_value`, `is_significant`, `interpretation`

### Step 3: Create Comparison Service
- Create `app/server/core/comparison_service.py` with:
  - `get_comparison_data(backtest_ids: List[str])` - Fetch and aggregate backtest data
  - `calculate_best_values(metrics: Dict)` - Determine best backtest for each metric
  - `calculate_statistical_significance(backtests: List)` - Paired t-test or bootstrap for key metrics
  - `_determine_metric_direction(metric_name)` - Higher/lower is better logic
- Statistical significance methods:
  - Use paired comparison for metrics like ROI, Sharpe Ratio, Win Rate
  - Calculate p-values and flag significance at 0.05 level
  - Handle edge cases (same values, missing data)

### Step 4: Add Comparison API Endpoints
- Add to `app/server/server.py`:
  - `POST /api/backtests/compare` - Get comparison data for selected backtests
    - Request body: `BacktestComparisonConfig`
    - Response: `BacktestComparisonResult`
  - `GET /api/backtests/{id1}/compare/{id2}/.../{idN}` - Alternative URL-based comparison
  - `POST /api/backtests/compare/export/{format}` - Export comparison (csv, json, pdf)
- Follow existing endpoint patterns for error handling and response formatting

### Step 5: Add Frontend API Client Methods
- Add to `app/client/src/app/api.js`:
  - `compareBacktests(backtestIds, notes)` - POST to /api/backtests/compare
  - `exportComparison(backtestIds, format, notes)` - Export comparison report
- Follow existing blob download pattern for exports

### Step 6: Implement Multi-Select in BacktestLibrary
- Modify `app/client/src/pages/BacktestLibrary.jsx`:
  - Add `selectionMode` state (boolean) and `selectedBacktests` state (Set<string>)
  - Add "Select for Compare" toggle button in header
  - When selectionMode is true:
    - Show checkbox on each completed backtest card
    - Clicking card toggles selection (not navigation)
    - Show selection count badge
  - Add "Compare Selected" button that appears when 2-4 backtests selected
    - Button disabled if <2 or >4 selected
    - Tooltip explains "Select 2-4 backtests to compare"
  - Add "Cancel" button to exit selection mode
- Ensure only completed backtests can be selected for comparison

### Step 7: Create BacktestComparison Page
- Create `app/client/src/pages/BacktestComparison.jsx`:
  - URL route: `/backtests/compare?ids=id1,id2,id3,id4`
  - Fetch comparison data on mount using backtest IDs from query params
  - Display loading state while fetching
  - Error state if fetch fails or invalid IDs
  - Layout sections:
    - Header with backtest names and "Back to Library" button
    - Metrics comparison table (top)
    - Equity curves overlay (middle)
    - Statistical significance summary (below curves)
    - Comparison notes editor (bottom)
    - Export buttons (floating or in header)
- Add route to `app/client/src/App.jsx`: `/backtests/compare`

### Step 8: Implement ComparisonMetricsTable
- Create `app/client/src/components/ComparisonMetricsTable.jsx`:
  - Table with rows for each metric, columns for each backtest
  - Metrics to include (from metricDefinitions.js):
    - Total Net Profit, ROI, Final Balance
    - Total Trades, Win Rate, Profit Factor
    - Sharpe Ratio, Sortino Ratio, Max Drawdown
    - Average Win, Average Loss, Largest Win, Largest Loss
    - Expectancy, Recovery Factor
  - Best value highlighting:
    - Green background/bold for best value in each row
    - Use metric direction (higher better vs lower better)
  - Tooltip on hover showing metric description
  - Collapsible sections: Performance, Trade Statistics, Risk Metrics
- Use existing MetricCard patterns for formatting

### Step 9: Implement ComparisonEquityCurve
- Create `app/client/src/components/ComparisonEquityCurve.jsx`:
  - Use lightweight-charts library (consistent with EquityCurveChart.jsx)
  - Display 2-4 equity curves with distinct colors:
    - Backtest 1: Blue (#3b82f6)
    - Backtest 2: Orange (#f97316)
    - Backtest 3: Purple (#8b5cf6)
    - Backtest 4: Green (#22c55e)
  - Legend showing backtest name and color
  - Interactive features:
    - Zoom in/out with mouse wheel
    - Pan with click and drag
    - Double-click to reset
  - Crosshair tooltip showing all values at current time:
    - Date
    - Balance for each backtest
  - Toggle controls:
    - Show/hide individual backtests
    - "Normalize" toggle to show percentage return (start at 0%)
  - Handle different date ranges gracefully (only show overlapping period or full ranges with gaps)

### Step 10: Implement ComparisonStatistics
- Create `app/client/src/components/ComparisonStatistics.jsx`:
  - Display statistical significance results in card format
  - For each key metric with significant difference:
    - Show metric name
    - Show p-value and confidence level
    - Interpretation text (e.g., "Backtest A's ROI is significantly higher than Backtest B's")
  - Visual indicators:
    - Green checkmark for significant improvements
    - Yellow warning for inconclusive
    - Clear explanation for non-technical users
  - Collapsible "Methodology" section explaining statistical tests used

### Step 11: Implement ComparisonNotesEditor
- Create `app/client/src/components/ComparisonNotesEditor.jsx`:
  - Multi-line textarea for comparison notes
  - Pre-populated fields to document:
    - What changed between backtest versions
    - Key observations
    - Recommended next steps
  - Auto-save with debounce (2 seconds) - save to localStorage for session persistence
  - Character counter (2000 max)
  - Notes are included in export

### Step 12: Implement ComparisonExportDialog
- Create `app/client/src/components/ComparisonExportDialog.jsx`:
  - Modal dialog with format selection (CSV, JSON, PDF)
  - Include comparison notes in export checkbox
  - Preview of what will be exported
  - Follow existing BacktestExportDialog patterns

### Step 13: Add Export Generators for Comparison
- Add to `app/server/utils/export_generators.py`:
  - `generate_comparison_csv(comparison_result)` - Side-by-side CSV format
  - `generate_comparison_json(comparison_result)` - Structured JSON export
  - `generate_comparison_pdf(comparison_result)` - PDF report with:
    - Header with comparison title and date
    - Metrics table with highlighting
    - Equity curve chart (embedded image or placeholder)
    - Statistical significance summary
    - Comparison notes
- Follow existing export generator patterns

### Step 14: Add Backend Unit Tests
- Add tests to `app/server/tests/test_comparison_service.py`:
  - Test `get_comparison_data` with valid/invalid IDs
  - Test `calculate_best_values` for different metric types
  - Test `calculate_statistical_significance` with sample data
  - Test edge cases (identical values, missing data, single backtest)
- Add API endpoint tests

### Step 15: Run Validation Commands
- Run `cd app/server && uv run pytest` to verify all backend tests pass
- Run `cd app/client && npm run build` to verify frontend builds without errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_compare_backtest_results.md` to validate the feature end-to-end

## Testing Strategy
### Unit Tests
- `test_comparison_service.py`:
  - Test data aggregation from multiple backtests
  - Test best value calculation for higher-is-better metrics (ROI, Win Rate, Sharpe)
  - Test best value calculation for lower-is-better metrics (Max Drawdown)
  - Test statistical significance calculations with known test data
  - Test edge cases (identical backtests, missing results, empty trades)

### Edge Cases
- Compare backtests with different date ranges (show union or intersection)
- Compare backtests with different currencies (show warning or convert)
- Compare backtest with zero trades vs backtest with trades
- Compare backtests from different strategies (allowed, with warning)
- Handle missing equity curve data gracefully
- Statistical significance with small sample sizes (<10 trades)
- Selecting more than 4 backtests (disable compare button, show tooltip)
- Selecting fewer than 2 backtests (disable compare button)
- Network errors during comparison fetch
- Large backtests with 1000+ equity curve points (performance)

## Acceptance Criteria
- [ ] Users can select 2-4 completed backtests in the library for comparison
- [ ] Side-by-side metrics table displays all key performance metrics
- [ ] Best value for each metric is highlighted (green background/bold)
- [ ] Overlaid equity curves display with distinct colors for each backtest
- [ ] Equity curves support zoom, pan, and tooltips showing all backtest values
- [ ] Statistical significance is calculated and displayed for key metric differences
- [ ] Users can add comparison notes to document what changed between versions
- [ ] Comparison report can be exported in CSV, JSON, and PDF formats
- [ ] Multi-select mode has clear UX (checkboxes, selection count, compare button)
- [ ] "Compare" button is disabled when <2 or >4 backtests are selected
- [ ] Only completed backtests can be selected for comparison
- [ ] All existing tests pass (zero regressions)
- [ ] Frontend builds without errors
- [ ] E2E test validates the complete comparison workflow

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_compare_backtest_results.md` E2E test file to validate this functionality works

## Notes
- **Color Palette for Equity Curves**: Use distinct, colorblind-friendly colors:
  - Blue (#3b82f6), Orange (#f97316), Purple (#8b5cf6), Green (#22c55e)
- **Statistical Tests**: Use bootstrap resampling for comparing metrics since trade returns are not normally distributed. Calculate 95% confidence intervals and flag significant differences.
- **Performance Consideration**: Limit equity curve data points for comparison to prevent performance issues. Consider sampling to ~500 points if needed.
- **Metric Direction Reference**:
  - Higher is better: ROI, Win Rate, Profit Factor, Sharpe Ratio, Sortino Ratio, Expectancy, Recovery Factor
  - Lower is better: Max Drawdown (%), Average Loss, Largest Loss
  - Neutral (context-dependent): Total Trades, Average Holding Period
- **Future Enhancements** (not in scope):
  - Save comparison configurations for later review
  - Share comparison via URL
  - Automated comparison recommendations based on user goals
  - Monte Carlo simulation comparison for risk analysis
