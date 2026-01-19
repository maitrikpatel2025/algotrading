# Drag Indicator onto Chart

**ADW ID:** 2b739aad
**Date:** 2026-01-19
**Specification:** /home/ubuntu/algotrading/trees/2b739aad/specs/issue-46-adw-2b739aad-sdlc_planner-drag-indicator-onto-chart.md

## Overview

This feature enables traders to drag technical indicators from the indicator library panel directly onto the price chart. Overlay indicators (SMA, EMA, Bollinger Bands, Keltner Channel) render on the main price chart, while subchart indicators (RSI, MACD, Stochastic, etc.) create separate panes below. The system enforces limits of 5 overlay and 3 subchart indicators, with Ctrl+Z undo support.

## What Was Built

- Drag-and-drop functionality for indicators from the library panel to the chart
- Visual drag preview showing indicator short name during drag
- Drop zone highlighting when dragging over the chart area
- Indicator calculation engine for 12 technical indicators
- Overlay indicator rendering (SMA, EMA, Bollinger Bands, Keltner Channel) on main chart
- Subchart indicator rendering (RSI, MACD, Stochastic, CCI, Williams %R, ADX, ATR, OBV) in separate panes
- Active indicator badges with removal capability
- Indicator limit enforcement (5 overlay, 3 subchart) with error messages
- Ctrl+Z keyboard shortcut to undo last added indicator
- E2E test specification for the feature

## Technical Implementation

### Files Modified

- `app/client/src/app/chart.js`: Extended to render indicator overlays and subcharts with dynamic y-axis domains
- `app/client/src/app/indicators.js`: Added `type` and `defaultParams` fields to indicator definitions
- `app/client/src/components/IndicatorLibrary.jsx`: Added drag functionality with custom drag preview
- `app/client/src/components/PriceChart.jsx`: Added drop zone handling and active indicator badges
- `app/client/src/pages/Strategy.jsx`: Added indicator state management, limits enforcement, and undo functionality

### New Files

- `app/client/src/app/indicatorCalculations.js`: Pure calculation functions for 12 technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, Stochastic, CCI, Williams %R, ADX, OBV, Keltner Channel)
- `.claude/commands/e2e/test_drag_indicator_onto_chart.md`: E2E test specification

### Key Changes

- Indicators in `indicators.js` now have `type: 'overlay' | 'subchart'` and `defaultParams` for calculation parameters
- `IndicatorLibrary.jsx` uses HTML5 Drag and Drop API with `draggable="true"`, custom drag image, and visual feedback
- `PriceChart.jsx` implements drop zone with `onDragOver`, `onDrop`, `onDragLeave` handlers and visual highlight
- `chart.js` creates overlay traces on main chart and subchart traces with dynamic y-axis allocation
- `Strategy.jsx` manages `activeOverlayIndicators`, `activeSubchartIndicators`, and `indicatorHistory` state arrays

## How to Use

1. Navigate to the Strategy page
2. Locate an indicator in the left sidebar library panel
3. Hover over an indicator to see the drag handle icon
4. Click and drag the indicator toward the chart area
5. Notice the chart highlights with a dashed border when hovering over it
6. Release to drop the indicator onto the chart
7. The indicator calculates and renders immediately:
   - Overlay indicators (SMA, EMA, BB, KC) appear as lines on the main chart
   - Subchart indicators (RSI, MACD, etc.) appear in a new pane below the chart
8. View active indicators as badges in the chart header
9. Click the X on a badge to remove that indicator
10. Press Ctrl+Z to undo the last added indicator

## Configuration

**Indicator Limits:**
- Maximum 5 overlay indicators on main chart
- Maximum 3 subchart indicators in separate panes

**Default Parameters:**
- SMA/EMA: period=20
- RSI: period=14
- MACD: fastPeriod=12, slowPeriod=26, signalPeriod=9
- Bollinger Bands: period=20, stdDev=2
- ATR: period=14
- Stochastic: kPeriod=14, dPeriod=3, smoothK=3
- CCI/Williams %R: period=14
- ADX: period=14
- Keltner Channel: period=20, atrMultiplier=2

## Testing

Run the E2E test to validate the feature:
```bash
# Read and execute the E2E test
cat .claude/commands/e2e/test_drag_indicator_onto_chart.md
```

Manual testing:
1. Drag SMA indicator to chart - should render as line overlay
2. Drag RSI indicator to chart - should create subchart pane
3. Attempt to add 6 overlay indicators - should show error message
4. Press Ctrl+Z - should remove last added indicator
5. Click X on indicator badge - should remove that indicator

## Notes

- Indicator calculations are performed client-side for immediate feedback
- Indicator state is not persisted across page refreshes (session-only)
- Touch drag-and-drop uses HTML5 events; mobile compatibility may vary
- Subchart y-axis domains are calculated dynamically based on number of active subcharts
- Each indicator instance has a unique `instanceId` to allow multiple instances of the same indicator type
