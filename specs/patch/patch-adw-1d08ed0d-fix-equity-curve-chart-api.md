# Patch: Revert EquityCurveChart to lightweight-charts v4 API

## Metadata
adw_id: `1d08ed0d`
review_change_request: `Issue #1: EquityCurveChart component fails with 'chart.addAreaSeries is not a function' error. The implementation incorrectly changed from chart.addSeries(AreaSeries, {...}) to chart.addAreaSeries({...}), causing a TypeError that crashes the entire backtest results page. Resolution: Revert the EquityCurveChart.jsx changes to use the original working API: chart.addSeries(AreaSeries, {...}) and chart.addSeries(LineSeries, {...}). Also restore the imports: import { createChart, AreaSeries, LineSeries, createSeriesMarkers } from 'lightweight-charts'. The changes made in lines 2, 112, and 137 of EquityCurveChart.jsx need to be reverted to match the main branch implementation. Severity: blocker`

## Issue Summary
**Original Spec:** specs/feature/feature-adw-1d08ed0d-view-trades-on-chart.md
**Issue:** The EquityCurveChart component was incorrectly updated to use non-existent v5 API methods `chart.addAreaSeries()` and `chart.addLineSeries()`. The actual lightweight-charts library in this project uses v4 API which requires `chart.addSeries(AreaSeries, {...})` and `chart.addSeries(LineSeries, {...})` with proper imports.
**Solution:** Revert lines 2, 112, and 137 to match the main branch implementation that uses the correct lightweight-charts v4 API.

## Files to Modify
- `app/client/src/components/EquityCurveChart.jsx` (lines 2, 112, 137)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Restore correct imports on line 2
- Add missing `AreaSeries, LineSeries` to the imports
- Change from: `import { createChart, createSeriesMarkers } from 'lightweight-charts';`
- Change to: `import { createChart, AreaSeries, LineSeries, createSeriesMarkers } from 'lightweight-charts';`

### Step 2: Fix equity series creation on line 112
- Revert to v4 API with AreaSeries parameter
- Change from: `const equitySeries = chart.addAreaSeries({`
- Change to: `const equitySeries = chart.addSeries(AreaSeries, {`

### Step 3: Fix buy-hold series creation on line 137
- Revert to v4 API with LineSeries parameter
- Change from: `const buyHoldSeries = chart.addLineSeries({`
- Change to: `const buyHoldSeries = chart.addSeries(LineSeries, {`

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Frontend Build**
   ```bash
   cd app/client && npm run build
   ```

2. **Backend Tests**
   ```bash
   cd app/server && uv run pytest tests/ -v --tb=short
   ```

3. **Visual Verification**
   - Start application: `./scripts/start.sh`
   - Navigate to backtest results page
   - Verify equity curve chart renders without errors
   - Check browser console for no TypeError about addAreaSeries

## Patch Scope
**Lines of code to change:** 3
**Risk level:** low
**Testing required:** Verify equity curve chart renders on backtest results page without console errors, frontend build passes
