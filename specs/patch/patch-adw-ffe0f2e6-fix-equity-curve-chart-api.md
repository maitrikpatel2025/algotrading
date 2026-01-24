# Patch: Fix EquityCurveChart v5 API Compatibility

## Metadata
adw_id: `ffe0f2e6`
review_change_request: `Issue #2: The backtest results summary page crashes with error 'chart.addAreaSeries is not a function' in the EquityCurveChart component. This prevents the page from rendering entirely, making it impossible to verify that the notes editor and export buttons work on the results page. Note: This appears to be a pre-existing bug (EquityCurveChart.jsx was not modified in this PR), but it blocks validation of the new save backtest results features. Resolution: Fix the EquityCurveChart component error or add error boundaries to prevent the entire page from crashing. While this is a pre-existing issue, it prevents users from accessing the new notes and export functionality on the results page. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-127-adw-ffe0f2e6-sdlc_planner-save-backtest-results.md
**Issue:** The EquityCurveChart component crashes with error "chart.addAreaSeries is not a function" because it's using the v4 API syntax with lightweight-charts v5.1.0. The v5 API changed from `chart.addAreaSeries()` to `chart.addSeries(AreaSeries, options)` and from `chart.addLineSeries()` to `chart.addSeries(LineSeries, options)`. Additionally, `createSeriesMarkers()` is not the correct v5 API for adding markers.
**Solution:** Update EquityCurveChart.jsx to use the correct lightweight-charts v5 API syntax by importing series types (AreaSeries, LineSeries) and using `chart.addSeries()` instead of deprecated methods. Fix the markers API to use `series.setMarkers()` instead of `createSeriesMarkers()`.

## Files to Modify
- `app/client/src/components/EquityCurveChart.jsx` - Update to use lightweight-charts v5 API

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update imports to include series types
- Change line 2 from `import { createChart, createSeriesMarkers } from 'lightweight-charts';` to `import { createChart } from 'lightweight-charts';`
- Remove `createSeriesMarkers` import as it doesn't exist in v5 API

### Step 2: Replace addAreaSeries with v5 API
- Locate line 112 where `chart.addAreaSeries()` is called
- Replace with `chart.addSeries('Area', options)` or import AreaSeries and use `chart.addSeries(AreaSeries, options)`
- Note: v5 supports both string format `'Area'` and series type import

### Step 3: Replace addLineSeries with v5 API
- Locate line 137 where `chart.addLineSeries()` is called
- Replace with `chart.addSeries('Line', options)` or import LineSeries and use `chart.addSeries(LineSeries, options)`

### Step 4: Fix markers API
- Locate line 236 where `createSeriesMarkers(equitySeries, markers)` is called
- Replace with `equitySeries.setMarkers(markers)` which is the correct v5 API method

## Validation
Execute every command to validate the patch is complete with zero regressions.

- `cd app/client && npm run build` - Verify frontend builds without errors
- Start the dev server and navigate to a backtest results page - Verify EquityCurveChart renders without console errors
- Verify equity curve displays with proper styling (green/red based on profit/loss)
- Verify buy-and-hold line renders when enabled
- Verify drawdown markers appear when enabled
- Verify chart tooltips display correctly on crosshair move
- Verify export PNG functionality works

## Patch Scope
**Lines of code to change:** 4 lines (1 import, 2 series creation calls, 1 markers call)
**Risk level:** low
**Testing required:** Visual verification that equity curve chart renders correctly on backtest results page, all interactive features (zoom, pan, tooltips, markers) work as expected
