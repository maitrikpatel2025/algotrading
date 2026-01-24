# Compare Backtest Results

**ADW ID:** 96de4387
**Date:** 2026-01-24
**Specification:** /home/ubuntu/algotrading/trees/96de4387/specs/issue-135-adw-96de4387-sdlc_planner-compare-backtest-results.md

## Overview

This feature enables traders to compare 2-4 backtest results side by side in a comprehensive comparison view. The comparison includes a side-by-side metrics table with best value highlighting, overlaid equity curves with distinct colors, statistical significance calculations using bootstrap resampling, comparison notes with localStorage persistence, and export functionality in CSV, JSON, and PDF formats.

## What Was Built

- Multi-select mode in BacktestLibrary for selecting 2-4 completed backtests
- BacktestComparison page with metrics table, equity curves, and statistical analysis
- ComparisonMetricsTable component with best value highlighting
- ComparisonEquityCurve component with overlaid curves using lightweight-charts
- ComparisonStatistics component displaying statistical significance results
- ComparisonNotesEditor component with localStorage auto-save
- ComparisonExportDialog for exporting comparison reports
- Backend comparison service with bootstrap statistical testing
- Comparison API endpoints and export generators

## Technical Implementation

### Files Modified

- `app/client/src/App.jsx`: Added route for `/backtests/compare`
- `app/client/src/app/api.js`: Added comparison API client methods (compareBacktests, exportComparisonCSV/JSON/PDF)
- `app/client/src/pages/BacktestLibrary.jsx`: Added multi-select mode with checkboxes and "Compare Selected" button
- `app/server/server.py`: Added comparison API endpoints (POST /api/backtests/compare, POST /api/backtests/compare/export/{format})
- `app/server/core/data_models.py`: Added comparison data models (MetricValue, StatisticalTest, BacktestComparisonConfig, BacktestComparisonResult)
- `app/server/utils/export_generators.py`: Added comparison export generators for CSV, JSON, and PDF formats

### New Files

- `app/client/src/pages/BacktestComparison.jsx`: Main comparison page component
- `app/client/src/components/ComparisonMetricsTable.jsx`: Side-by-side metrics table with highlighting
- `app/client/src/components/ComparisonEquityCurve.jsx`: Overlaid equity curves chart
- `app/client/src/components/ComparisonStatistics.jsx`: Statistical significance display
- `app/client/src/components/ComparisonNotesEditor.jsx`: Notes editor with auto-save
- `app/client/src/components/ComparisonExportDialog.jsx`: Export format selection dialog
- `app/server/core/comparison_service.py`: Comparison business logic and statistical calculations
- `app/server/tests/test_comparison_service.py`: Unit tests for comparison service
- `.claude/commands/e2e/test_compare_backtest_results.md`: E2E test specification

### Key Changes

- **Multi-select UX**: BacktestLibrary now has a "Select for Compare" toggle that enables selection mode with checkboxes on completed backtest cards
- **Statistical Significance**: Bootstrap resampling (permutation test) is used to calculate p-values for key metrics (ROI, Win Rate, Profit Factor, Sharpe Ratio, Max Drawdown)
- **Best Value Highlighting**: Metrics are automatically highlighted based on direction (higher is better vs lower is better)
- **Colorblind-friendly Colors**: Equity curves use Blue (#3b82f6), Orange (#f97316), Purple (#8b5cf6), Green (#22c55e)
- **Notes Persistence**: Comparison notes are auto-saved to localStorage with a key based on sorted backtest IDs

## How to Use

1. Navigate to the Backtest Library page
2. Click the "Select for Compare" button to enter selection mode
3. Click on 2-4 completed backtests to select them (checkboxes appear on cards)
4. Click "Compare Selected" to navigate to the comparison view
5. Review the metrics comparison table with highlighted best values
6. Analyze overlaid equity curves with interactive zoom and pan
7. Check statistical significance results for key metrics
8. Add comparison notes to document observations
9. Export the comparison report in CSV, JSON, or PDF format

## Configuration

No additional configuration required. Comparison notes are automatically persisted to localStorage.

## Testing

Run backend tests:
```bash
cd app/server && uv run pytest tests/test_comparison_service.py
```

Run frontend build:
```bash
cd app/client && npm run build
```

Run E2E tests by executing the test specification at `.claude/commands/e2e/test_compare_backtest_results.md`.

## Notes

- Only completed backtests can be selected for comparison
- Minimum 2 and maximum 4 backtests can be compared at once
- Statistical significance requires at least 5 trades per backtest for meaningful results
- Bootstrap resampling uses 1000 iterations for p-value calculation
- Metric direction reference:
  - Higher is better: ROI, Win Rate, Profit Factor, Sharpe Ratio, Sortino Ratio, Expectancy, Recovery Factor
  - Lower is better: Max Drawdown (%), Average Loss, Largest Loss
