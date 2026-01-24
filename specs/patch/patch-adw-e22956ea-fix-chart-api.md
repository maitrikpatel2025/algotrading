# Patch: Fix lightweight-charts v5 API Usage

## Metadata
adw_id: `e22956ea`
review_change_request: `Issue #1: BLOCKER: Runtime error 'chart.addAreaSeries is not a function' in EquityCurveChart.jsx prevents backtest results page from loading. The component incorrectly imports and uses AreaSeries and LineSeries from lightweight-charts (line 2) and attempts chart.addSeries(AreaSeries, ...) at line 112, but these are not valid exports in lightweight-charts v5. This was introduced in commit 8e706f9 which attempted to migrate to v5 API but used incorrect syntax. Resolution: Fix EquityCurveChart.jsx by removing the incorrect imports (line 2: AreaSeries, LineSeries) and changing line 112 from 'chart.addSeries(AreaSeries, ...)' to 'chart.addAreaSeries(...)' and line 137 from 'chart.addSeries(LineSeries, ...)' to 'chart.addLineSeries(...)'. The lightweight-charts v5 API still uses addAreaSeries() and addLineSeries() methods, not addSeries() with type parameters. Severity: blocker`

## Issue Summary
**Original Spec:** N/A (regression fix)
**Issue:** Runtime error in EquityCurveChart.jsx caused by incorrect lightweight-charts v5 API usage. Component imports non-existent exports (AreaSeries, LineSeries) and calls non-existent method (chart.addSeries) introduced in commit 8e706f9.
**Solution:** Remove incorrect imports and replace chart.addSeries() calls with correct v5 API methods: chart.addAreaSeries() and chart.addLineSeries().

## Files to Modify
Use these files to implement the patch:

- `app/client/src/components/EquityCurveChart.jsx` - Fix incorrect lightweight-charts v5 API usage

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Remove incorrect imports from line 2
- Remove `AreaSeries, LineSeries` from the import statement
- Keep only `createChart, createSeriesMarkers` imports from lightweight-charts
- Updated import: `import { createChart, createSeriesMarkers } from 'lightweight-charts';`

### Step 2: Fix area series creation at line 112
- Replace `chart.addSeries(AreaSeries, {` with `chart.addAreaSeries({`
- This uses the correct v5 API method for creating area series

### Step 3: Fix line series creation at line 137
- Replace `chart.addSeries(LineSeries, {` with `chart.addLineSeries({`
- This uses the correct v5 API method for creating line series

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. Frontend build validation: `cd app/client && npm run build`
2. Manual verification: Start the application and navigate to backtest results page to confirm equity curve chart renders without errors
3. Browser console check: Verify no "chart.addAreaSeries is not a function" errors appear

## Patch Scope
**Lines of code to change:** 3 lines (1 import statement, 2 method calls)
**Risk level:** low
**Testing required:** Frontend build must pass; visual confirmation that equity curve chart renders correctly on backtest results page
