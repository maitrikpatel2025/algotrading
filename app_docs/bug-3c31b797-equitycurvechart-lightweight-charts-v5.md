# Bug Fix: EquityCurveChart lightweight-charts v5 API Compatibility

**ADW ID:** 3c31b797
**Date:** 2026-01-24
**Specification:** /home/ubuntu/algotrading/trees/3c31b797/specs/issue-131-adw-3c31b797-sdlc_planner-fix-equitycurvechart-lightweight-charts-v5.md

## Overview

This bug fix updates the EquityCurveChart component to use the lightweight-charts v5 API. The library upgraded from v4 to v5 with breaking changes to series creation methods and the markers API, which caused runtime errors preventing the equity curve chart from rendering on backtest results pages.

## What Was Built

- Updated EquityCurveChart.jsx to use lightweight-charts v5 API
- Fixed series creation from `chart.addAreaSeries()` to `chart.addSeries(AreaSeries, ...)`
- Fixed series creation from `chart.addLineSeries()` to `chart.addSeries(LineSeries, ...)`
- Fixed markers API from `series.setMarkers()` to `createSeriesMarkers(series, markers)`

## Technical Implementation

### Files Modified

- `app/client/src/components/EquityCurveChart.jsx`: Updated to use v5 API for series creation and markers

### Key Changes

- **Line 2 - Updated imports**: Changed from `import { createChart } from 'lightweight-charts'` to include v5 types:
  ```javascript
  import { createChart, AreaSeries, LineSeries, createSeriesMarkers } from 'lightweight-charts';
  ```

- **Line 112 - Area series creation**: Changed from `chart.addAreaSeries({...})` to:
  ```javascript
  const equitySeries = chart.addSeries(AreaSeries, {...});
  ```

- **Line 137 - Line series creation**: Changed from `chart.addLineSeries({...})` to:
  ```javascript
  const buyHoldSeries = chart.addSeries(LineSeries, {...});
  ```

- **Line 237 - Markers API**: Changed from `equitySeries.setMarkers(markers)` to:
  ```javascript
  createSeriesMarkers(equitySeries, markers);
  ```

## How to Use

1. The EquityCurveChart component is automatically used on backtest results pages
2. Navigate to any backtest results page (e.g., `/backtests/{backtest-id}`)
3. The equity curve chart will render with:
   - Main equity curve as an area chart (green for profit, red for loss)
   - Buy-and-hold comparison line (gray dashed)
   - Drawdown markers
   - Interactive tooltips showing date, balance, drawdown %, and trade count

## Configuration

No additional configuration required. The component uses the existing props:
- `equityCurve`: Array of equity values
- `buyHoldCurve`: Array of buy-and-hold comparison values
- `equityCurveDates`: Array of date strings
- `drawdownPeriods`: Array of drawdown period objects
- `highlightedTrade`: Optional trade object to highlight on the chart

## Testing

1. Clear webpack cache if necessary: `rm -rf app/client/node_modules/.cache`
2. Start the development server: `cd app/client && npm start`
3. Navigate to a backtest results page
4. Verify the equity curve chart renders without JavaScript errors
5. Test interactive features:
   - Zoom and pan functionality
   - Drawdown toggle button
   - Buy-and-hold toggle button
   - Tooltip on hover
   - PNG export button

## Notes

- The lightweight-charts v5 migration documentation is available at: https://tradingview.github.io/lightweight-charts/docs/migrations/from-v4-to-v5
- The webpack development server may serve cached code after code changes; clearing `node_modules/.cache` resolves this
- The component uses AreaSeries for the main equity curve with gradient fill and LineSeries for the buy-and-hold benchmark
