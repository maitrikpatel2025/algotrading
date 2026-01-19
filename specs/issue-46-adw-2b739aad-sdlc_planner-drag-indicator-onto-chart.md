# Feature: Drag Indicator onto Chart

## Metadata
issue_number: `46`
adw_id: `2b739aad`
issue_json: `{"number":46,"title":"Feature Drag Indicator onto Chart US-VSB-006","body":"adw_sdlc_iso\n\n/feature\n\nmodel_set heavy\n\nI want to drag an indicator from the library and drop it directly onto the chart\nSo that I can instantly see how the indicator looks on my price data\nAcceptance Criteria:\n\n Indicators are draggable using mouse or touch\n Visual drag preview shows indicator icon following cursor\n Chart area highlights as valid drop zone when indicator is dragged over it\n On drop, indicator immediately calculates and renders on chart\n Overlay indicators (MA, BB) render directly on price chart\n Separate-pane indicators (RSI, MACD) create new sub-chart below main chart\n Maximum 5 overlay indicators and 3 sub-chart indicators allowed\n Error message if limit exceeded: \"Maximum indicators reached. Remove one to add another.\"\n Undo action (Ctrl+Z) removes last added indicator"}`

## Feature Description
This feature enables traders to drag technical indicators from the indicator library panel directly onto the price chart. When an indicator is dragged over the chart area, the drop zone highlights to indicate valid placement. Upon dropping, the indicator immediately calculates based on the current price data and renders on the chart. Overlay indicators (like SMA, EMA, Bollinger Bands) render directly on the main price chart, while separate-pane indicators (like RSI, MACD) create new sub-charts below the main chart. The system enforces limits of 5 overlay indicators and 3 sub-chart indicators, displaying an error message when limits are exceeded. An undo action (Ctrl+Z) allows traders to quickly remove the last added indicator.

## User Story
As a forex trader
I want to drag an indicator from the library and drop it directly onto the chart
So that I can instantly see how the indicator looks on my price data

## Problem Statement
Currently, the indicator library panel displays available indicators but lacks functionality to add them to the chart. Traders must manually configure indicators through separate workflows, which disrupts analysis flow. There is no visual feedback during indicator selection, and no quick way to experiment with different indicators on the current price data.

## Solution Statement
Implement a drag-and-drop system using HTML5 Drag and Drop API with React integration. The IndicatorLibrary component will make indicator items draggable, while the PriceChart component will become a drop target. Visual feedback (drag preview, drop zone highlight) guides users through the interaction. Upon drop, indicator calculations run against the current price data and the chart re-renders with the new indicator overlay or sub-chart. State management tracks active indicators with enforcement of limits and undo capability.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/components/IndicatorLibrary.jsx` - Add drag functionality to indicator items. Update indicator buttons to be draggable with data-transfer of indicator metadata.
- `app/client/src/components/PriceChart.jsx` - Add drop zone functionality. Handle drop events, manage active indicators state, render overlay indicators on the main chart and sub-chart indicators in separate panes.
- `app/client/src/app/indicators.js` - Add indicator type classification (overlay vs sub-chart), default parameters, and calculation functions for each indicator.
- `app/client/src/app/chart.js` - Extend `drawChart()` to support rendering indicator overlays (SMA, EMA, Bollinger Bands) and sub-chart traces (RSI, MACD). Add functions to calculate indicator values from OHLC data.
- `app/client/src/pages/Strategy.jsx` - Manage active indicators state at page level. Pass indicator state and handlers to PriceChart and IndicatorLibrary components. Implement undo stack for Ctrl+Z functionality.
- `app/client/src/lib/utils.js` - Potentially add utility functions for indicator calculations if needed.
- `.claude/commands/test_e2e.md` - Reference for E2E test format and execution.
- `.claude/commands/e2e/test_trading_dashboard.md` - Reference for E2E test structure.

### New Files
- `app/client/src/app/indicatorCalculations.js` - New file containing indicator calculation functions (SMA, EMA, RSI, MACD, Bollinger Bands, etc.) that operate on OHLC price data arrays.
- `.claude/commands/e2e/test_drag_indicator_onto_chart.md` - E2E test specification validating drag-and-drop indicator functionality.

## Implementation Plan
### Phase 1: Foundation
1. Extend indicator data model in `indicators.js` to include:
   - `type`: 'overlay' | 'subchart' - determines rendering location
   - `defaultParams`: object with default calculation parameters (period, etc.)
   - Classify existing indicators: overlay (SMA, EMA, Bollinger Bands, Keltner Channel) vs subchart (RSI, MACD, Stochastic, CCI, Williams %R, ADX, ATR, OBV, Volume Profile)

2. Create `indicatorCalculations.js` with pure calculation functions:
   - `calculateSMA(prices, period)` - Simple Moving Average
   - `calculateEMA(prices, period)` - Exponential Moving Average
   - `calculateRSI(prices, period)` - Relative Strength Index
   - `calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod)` - MACD with signal line
   - `calculateBollingerBands(prices, period, stdDev)` - Upper, middle, lower bands
   - All functions take price arrays and return indicator value arrays

### Phase 2: Core Implementation
3. Add drag functionality to IndicatorLibrary:
   - Make indicator buttons draggable with `draggable="true"`
   - Set drag data with indicator id and metadata in `onDragStart`
   - Create visual drag preview showing indicator short name
   - Add drag state styling (opacity reduction on drag source)

4. Add drop zone to PriceChart:
   - Wrap chart container with drop zone div
   - Handle `onDragOver` to show visual highlight (border, background)
   - Handle `onDrop` to receive indicator data and trigger addition
   - Handle `onDragLeave` to remove highlight

5. Implement indicator state management in Strategy.jsx:
   - `activeOverlayIndicators` array (max 5 items)
   - `activeSubchartIndicators` array (max 3 items)
   - `indicatorHistory` stack for undo functionality
   - `addIndicator(indicator)` - validates limits, adds to appropriate array
   - `removeIndicator(indicatorId)` - removes from array
   - `undoLastIndicator()` - pops from history stack

6. Extend chart.js to render indicators:
   - Add `createIndicatorOverlayTrace(chartData, indicator)` for overlay types
   - Add `createIndicatorSubchartTrace(chartData, indicator)` for subchart types
   - Modify `drawChart()` to accept `activeIndicators` parameter
   - Dynamically create y-axis domains for sub-charts
   - Apply appropriate colors from style guide for each indicator

### Phase 3: Integration
7. Wire up components in Strategy.jsx:
   - Pass `onIndicatorDrop` handler to PriceChart
   - Pass `activeIndicators` to PriceChart for rendering
   - Add keyboard listener for Ctrl+Z undo
   - Show toast/alert when indicator limit exceeded

8. Add error handling and user feedback:
   - Toast notification when limit exceeded: "Maximum indicators reached. Remove one to add another."
   - Visual feedback for successful indicator addition
   - Loading state during indicator calculation

## Step by Step Tasks
### Task 1: Create E2E Test Specification
- Create `.claude/commands/e2e/test_drag_indicator_onto_chart.md` with test steps covering:
  - Dragging an indicator from the library
  - Verifying drag preview follows cursor
  - Dropping on chart and seeing indicator render
  - Testing overlay indicator on main chart (SMA)
  - Testing subchart indicator in separate pane (RSI)
  - Verifying limit enforcement (try adding 6th overlay)
  - Testing Ctrl+Z undo removes last indicator
- Follow the format from existing E2E tests like `test_indicator_library_panel.md`

### Task 2: Extend Indicator Data Model
- Update `app/client/src/app/indicators.js`:
  - Add `type` field to each indicator ('overlay' or 'subchart')
  - Add `defaultParams` object with default calculation parameters
  - Overlay indicators: SMA, EMA, Bollinger Bands, Keltner Channel
  - Subchart indicators: RSI, MACD, Stochastic, CCI, Williams %R, ADX, ATR, OBV, Volume Profile

### Task 3: Create Indicator Calculation Functions
- Create `app/client/src/app/indicatorCalculations.js`:
  - `calculateSMA(closes, period)` - returns array of SMA values
  - `calculateEMA(closes, period)` - returns array of EMA values
  - `calculateRSI(closes, period)` - returns array of RSI values (0-100)
  - `calculateMACD(closes, fastPeriod, slowPeriod, signalPeriod)` - returns { macd, signal, histogram }
  - `calculateBollingerBands(closes, period, stdDev)` - returns { upper, middle, lower }
  - Handle edge cases: insufficient data, null values
  - Export all functions for use in chart.js

### Task 4: Add Drag Functionality to IndicatorLibrary
- Update `app/client/src/components/IndicatorLibrary.jsx`:
  - Add `draggable="true"` to indicator button elements
  - Implement `handleDragStart(e, indicator)`:
    - Set `e.dataTransfer.setData('application/json', JSON.stringify(indicator))`
    - Set `e.dataTransfer.effectAllowed = 'copy'`
    - Create custom drag image showing indicator short name
  - Add `onDragEnd` to reset any drag state
  - Style dragging item with reduced opacity (0.5)
  - Add touch support using touch events for mobile

### Task 5: Add Drop Zone to PriceChart
- Update `app/client/src/components/PriceChart.jsx`:
  - Add new prop: `onIndicatorDrop(indicator)` callback
  - Add new prop: `activeIndicators` array for rendering
  - Wrap chart container with drop zone div
  - Add `isDragOver` state for visual feedback
  - Implement `handleDragOver(e)`:
    - `e.preventDefault()` to allow drop
    - `e.dataTransfer.dropEffect = 'copy'`
    - Set `isDragOver(true)`
  - Implement `handleDrop(e)`:
    - Parse indicator from `e.dataTransfer.getData('application/json')`
    - Call `onIndicatorDrop(indicator)`
    - Set `isDragOver(false)`
  - Implement `handleDragLeave()`: Set `isDragOver(false)`
  - Apply visual highlight styles when `isDragOver` is true (ring-2 ring-primary border-dashed)

### Task 6: Extend Chart Rendering for Indicators
- Update `app/client/src/app/chart.js`:
  - Add `createOverlayIndicatorTrace(chartData, indicator, colors)` function:
    - Calculate indicator values using functions from indicatorCalculations.js
    - Return Plotly trace config for SMA/EMA (line on main chart)
    - Return multiple traces for Bollinger Bands (upper, middle, lower lines)
  - Add `createSubchartIndicatorTrace(chartData, indicator)` function:
    - Calculate indicator values
    - Return trace config with `yaxis: 'y3'`, `yaxis: 'y4'` etc. for sub-charts
  - Update `drawChart()` signature: `drawChart(chartData, p, g, divName, chartType, showVolume, activeIndicators)`
  - Dynamically calculate y-axis domains based on number of sub-chart indicators
  - Add indicator-specific colors: SMA (blue), EMA (orange), RSI (purple), MACD (green/red), BB (gray bands)

### Task 7: Implement Indicator State Management in Strategy
- Update `app/client/src/pages/Strategy.jsx`:
  - Add state: `const [activeOverlayIndicators, setActiveOverlayIndicators] = useState([])`
  - Add state: `const [activeSubchartIndicators, setActiveSubchartIndicators] = useState([])`
  - Add state: `const [indicatorHistory, setIndicatorHistory] = useState([])`
  - Add state: `const [indicatorError, setIndicatorError] = useState(null)`
  - Implement `handleIndicatorDrop(indicator)`:
    - Check limits (5 overlay, 3 subchart)
    - If limit exceeded, set error message and return
    - Add to appropriate state array
    - Push to history stack
  - Implement `handleUndoIndicator()`:
    - Pop from history stack
    - Remove from appropriate state array
  - Add keyboard listener for Ctrl+Z in useEffect
  - Pass handlers and state to PriceChart component

### Task 8: Add Error Message Display
- Update `app/client/src/pages/Strategy.jsx`:
  - Add indicator error display below the controls section
  - Style with warning colors (amber/yellow) similar to existing error display
  - Auto-dismiss after 5 seconds or manual dismiss
  - Message: "Maximum indicators reached. Remove one to add another."

### Task 9: Add Indicator Removal UI
- Update `app/client/src/components/PriceChart.jsx`:
  - Add "Active Indicators" section in the header showing badges for each active indicator
  - Each badge has an X button to remove the indicator
  - Badges are color-coded by indicator type
  - Pass `onRemoveIndicator(indicatorId)` callback from Strategy.jsx

### Task 10: Validate and Test
- Run `cd app/server && uv run pytest` - Ensure backend tests pass
- Run `cd app/client && npm run build` - Ensure frontend build succeeds
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_drag_indicator_onto_chart.md` to validate the feature works end-to-end

## Testing Strategy
### Unit Tests
- Test indicator calculation functions with known input/output pairs
- Test SMA calculation: [1,2,3,4,5] with period 3 should return [null, null, 2, 3, 4]
- Test EMA calculation with proper weighting
- Test RSI calculation produces values between 0-100
- Test MACD produces correct signal line crossovers
- Test Bollinger Bands produce proper standard deviation bands

### Edge Cases
- Drag and drop with empty price data (should show error/no-op)
- Adding same indicator twice (should be allowed as separate instance)
- Undo when no indicators added (should no-op)
- Touch drag on mobile devices
- Keyboard undo (Ctrl+Z) when input is focused (should not trigger)
- Indicator calculation with insufficient data points (period > data length)
- Rapid drag-and-drop operations
- Browser page refresh (indicators should not persist - acceptable for MVP)

## Acceptance Criteria
- [ ] Indicators are draggable using mouse with visual drag preview
- [ ] Indicators are draggable using touch on mobile devices
- [ ] Visual drag preview shows indicator short name following cursor
- [ ] Chart area highlights with dashed border when indicator is dragged over it
- [ ] On drop, indicator immediately calculates and renders on chart
- [ ] Overlay indicators (SMA, EMA, BB) render directly on price chart as line traces
- [ ] Separate-pane indicators (RSI, MACD) create new sub-chart below main chart
- [ ] Maximum 5 overlay indicators enforced with error message
- [ ] Maximum 3 sub-chart indicators enforced with error message
- [ ] Error message displays: "Maximum indicators reached. Remove one to add another."
- [ ] Undo action (Ctrl+Z) removes last added indicator
- [ ] Active indicators displayed as removable badges in chart header
- [ ] All existing tests pass (backend pytest, frontend build)
- [ ] E2E test validates complete drag-drop-render workflow

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_drag_indicator_onto_chart.md` to validate this functionality works.

## Notes
- The indicator calculations are performed client-side for immediate feedback. For large datasets, this may have performance implications. Consider web workers for heavy calculations in future iterations.
- Touch drag-and-drop can be tricky on mobile. The implementation should use touch events (`touchstart`, `touchmove`, `touchend`) in addition to HTML5 drag events for broader compatibility.
- Indicator state is not persisted across page refreshes in this MVP. Future enhancement could save active indicators to localStorage.
- Color choices for indicator lines should follow the UI style guide for consistency.
- The sub-chart implementation reuses Plotly's multi-axis capability. Each sub-chart gets its own y-axis domain calculated dynamically.
- Consider adding indicator parameter customization (e.g., SMA period) in a future iteration via a settings popover.
