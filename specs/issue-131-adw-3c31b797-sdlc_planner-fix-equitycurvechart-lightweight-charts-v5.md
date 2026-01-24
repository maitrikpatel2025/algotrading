# Bug: EquityCurveChart lightweight-charts v5 API Compatibility

## Metadata
issue_number: `131`
adw_id: `3c31b797`
issue_json: `{"number":131,"title":"bug on this component to work with lightweight-charts v5 API","body":"/bug\n\n\n\nadw_sdlc_iso.py\n\nmodel_set heavy\n\nhttp://localhost:3000/backtests/e6308c9c-fabd-4e00-bc08-ebb5b9a1f839\n\n\nthe EquityCurveChart.jsx component to work with lightweight-charts v5 API. The library  \n  changed its API from v4 to v5:                                                                  \n                                                                                                  \n  1. Series creation m                                                            \n  - chart.addAreaSeries(options) → chart.addSeries(AreaSeries, options)                           \n  - chart.addLineSeries(options) → chart.addSeries(LineSeries, options)                           \n                                                                                                  \n  2. Markers API \n  - series.setMarkers(markers) → createSeriesMarkers(series, markers)                             \n                                                                                                  \n  3. Updated imports:                                                                             \n  // Before                                                                                       \n  import { createChart } from 'lightweight-charts';                                               \n                                                                                                  \n  // After                                                                                        \n  import { createChart, AreaSeries, LineSeries, createSeriesMarkers } from 'lightweight-charts';  \n                                                                                                  \n  These solve the runtime errors:                                                      \n  - chart.addAreaSeries is not a function                                                         \n  - equitySeries.setMarkers is not a function    \n\n\nClear webpack cache (node_modules/.cache) and restart the dev server, OR serve the production build which was successfully compiled. The git diff confirms the code fix is correct (app/client/src/components/EquityCurveChart.jsx lines 112 and 137), but the dev environment needs cache clearing to serve the updated code.\n\n\nuse The git diff confirms  and get that code\nUncaught runtime errors:\n×\nERROR\nchart.addAreaSeries is not a function\nTypeError: chart.addAreaSeries is not a function\n    at http://localhost:3000/static/js/bundle.js:88484:32\n    at commitHookEffectListMount (http://localhost:3000/static/js/bundle.js:52892:30)\n    at commitPassiveMountOnFiber (http://localhost:3000/static/js/bundle.js:54385:17)\n    at commitPassiveMountEffects_complete (http://localhost:3000/static/js/bundle.js:54357:13)\n    at commitPassiveMountEffects_begin (http://localhost:3000/static/js/bundle.js:54347:11)\n    at commitPassiveMountEffects (http://localhost:3000/static/js/bundle.js:54337:7)\n    at flushPassiveEffectsImpl (http://localhost:3000/static/js/bundle.js:56220:7)\n    at flushPassiveEffects (http://localhost:3000/static/js/bundle.js:56173:18)\n    at http://localhost:3000/static/js/bundle.js:55988:13\n    at workLoop (http://localhost:3000/static/js/bundle.js:66263:38)"}`

## Bug Description
The EquityCurveChart.jsx component fails at runtime with the error "chart.addAreaSeries is not a function" when navigating to the backtest results page (e.g., `http://localhost:3000/backtests/e6308c9c-fabd-4e00-bc08-ebb5b9a1f839`). This is caused by an API incompatibility with lightweight-charts v5. The library upgraded from v4 to v5 with breaking changes:

1. Series creation methods changed from `chart.addAreaSeries(options)` to `chart.addSeries(AreaSeries, options)`
2. Series creation methods changed from `chart.addLineSeries(options)` to `chart.addSeries(LineSeries, options)`
3. Markers API changed from `series.setMarkers(markers)` to `createSeriesMarkers(series, markers)`

**Expected behavior**: The equity curve chart should render properly showing the backtest equity curve with area fill, buy-and-hold comparison line, drawdown markers, and tooltips.

**Actual behavior**: JavaScript runtime error "chart.addAreaSeries is not a function" crashes the component and prevents the chart from rendering.

## Problem Statement
The EquityCurveChart.jsx component code has been updated in the git repository to use the v5 API, but the webpack development server is serving cached/stale code with the old v4 API calls. The webpack cache needs to be cleared and the development server restarted to serve the updated code.

## Solution Statement
1. Clear the webpack cache located at `app/client/node_modules/.cache`
2. Restart the development server to pick up the code changes
3. Verify the v5 API code is correctly implemented in EquityCurveChart.jsx
4. Verify the chart renders correctly on the backtest results page

## Steps to Reproduce
1. Start the frontend development server: `cd app/client && npm start`
2. Navigate to `http://localhost:3000/backtests/e6308c9c-fabd-4e00-bc08-ebb5b9a1f839`
3. Observe the JavaScript error: "chart.addAreaSeries is not a function"
4. The equity curve chart fails to render

## Root Cause Analysis
The root cause is a webpack development server caching issue. The code in `EquityCurveChart.jsx` has been correctly updated to use the lightweight-charts v5 API:

- Line 2: Import statement includes `AreaSeries, LineSeries, createSeriesMarkers`
- Line 112: Uses `chart.addSeries(AreaSeries, {...})` instead of `chart.addAreaSeries({...})`
- Line 137: Uses `chart.addSeries(LineSeries, {...})` instead of `chart.addLineSeries({...})`
- Line 237: Uses `createSeriesMarkers(equitySeries, markers)` instead of `equitySeries.setMarkers(markers)`

However, the webpack development server is serving a cached version of the bundle that still contains the old v4 API calls. This is evidenced by:
1. The production build compiles successfully (v5 code is valid)
2. The git diff shows the correct v5 API changes are in the source code
3. The error occurs at runtime in the dev bundle, not at compile time

## Relevant Files
Use these files to fix the bug:

- `app/client/src/components/EquityCurveChart.jsx` - The main component file that uses lightweight-charts to render the equity curve. This file has already been updated to use v5 API but cached code is being served.
- `app/client/package.json` - Contains the lightweight-charts dependency at version ^5.1.0
- `app/client/node_modules/.cache` - Webpack cache directory that needs to be cleared
- `.claude/commands/e2e/test_equity_curve_chart.md` - E2E test specification for validating the equity curve chart functionality

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Verify the Current Code is Correct
- Read `app/client/src/components/EquityCurveChart.jsx` and verify it uses v5 API:
  - Import statement should include `AreaSeries, LineSeries, createSeriesMarkers` from `lightweight-charts`
  - Line ~112 should use `chart.addSeries(AreaSeries, {...})` not `chart.addAreaSeries({...})`
  - Line ~137 should use `chart.addSeries(LineSeries, {...})` not `chart.addLineSeries({...})`
  - Line ~237 should use `createSeriesMarkers(equitySeries, markers)` not `equitySeries.setMarkers(markers)`

### Step 2: Clear Webpack Cache
- Delete the webpack cache directory: `rm -rf app/client/node_modules/.cache`
- This forces webpack to rebuild all modules fresh without stale cached bundles

### Step 3: Restart the Development Server
- Stop any running development server processes
- Start the client development server: `cd app/client && npm start`
- Wait for the compilation to complete

### Step 4: Verify the Build Succeeds
- Run a production build to verify the code compiles without errors: `cd app/client && npm run build`
- Confirm there are no TypeScript or JavaScript errors related to lightweight-charts API

### Step 5: Run Validation Commands
- Execute all validation commands below to verify the bug is fixed with zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `rm -rf app/client/node_modules/.cache` - Clear webpack cache to force fresh compilation
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_equity_curve_chart.md` E2E test file to validate the equity curve chart functionality works

## Notes
- The lightweight-charts library was upgraded from v4 to v5 which introduced breaking API changes
- The v5 API changes are documented at: https://tradingview.github.io/lightweight-charts/docs/migrations/from-v4-to-v5
- Key v5 API changes used in this component:
  - Series creation: `chart.addSeries(SeriesType, options)` instead of `chart.addTypeSeries(options)`
  - Markers: `createSeriesMarkers(series, markers)` instead of `series.setMarkers(markers)`
- The EquityCurveChart.jsx component uses:
  - `AreaSeries` for the main equity curve visualization with gradient fill
  - `LineSeries` for the buy-and-hold benchmark comparison (gray dashed line)
  - `createSeriesMarkers` for drawdown period markers and highlighted trade entry/exit markers
- After clearing cache, the development server should hot-reload and serve the correct v5 code
