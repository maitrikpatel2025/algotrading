# Feature: Advanced Trading Chart

## Metadata
issue_number: `5`
adw_id: `e2a5d817`
issue_json: `{"number":5,"title":"Feature - Advanced Trading Chart","body":"Using adw_plan_build_review\n\n/feature\n\nTransform a basic Plotly.js candlestick chart into a professional TradingView-like trading interface with real-time data, extended timeframes, volume indicators, and advanced interactions.\n\nCurrent State\n\nBasic candlestick chart using Plotly.js\nLimited timeframes: M5, M15, H1, D\nSimple candle count selector: 50, 100, 200\nNo volume, real-time prices, OHLC overlay, or date range buttons\n\n4. Quick Date Range Selection\nPreset buttons: [1D] [5D] [1M] [3M] [6M] [YTD] [1Y] [All]\n\n5. Chart Interactions\nMouse wheel zoom (Cmd/Ctrl for Y-axis only)\nClick and drag to pan\nDouble-click to reset zoom\nCrosshair following cursor with price/time at axis intersections\nChart type selector: Candlestick, OHLC Bars, Line, Area"}`

## Feature Description
Transform the existing basic Plotly.js candlestick chart into a professional TradingView-like trading interface. This enhancement will add extended timeframes, volume indicators, quick date range selection buttons, advanced chart interactions (zoom, pan, crosshair), and multiple chart type options (Candlestick, OHLC Bars, Line, Area). The goal is to provide traders with a more powerful and intuitive charting experience that matches industry-standard trading platforms.

## User Story
As a forex trader
I want an advanced trading chart with multiple chart types, volume indicators, and quick date range selection
So that I can analyze price movements more effectively and make better-informed trading decisions

## Problem Statement
The current trading dashboard has a basic candlestick chart with limited functionality:
- Only 4 timeframes available (M5, M15, H1, D)
- Simple candle count selector (50, 100, 200)
- No volume indicator to show trading activity
- No quick date range buttons for rapid time navigation
- Limited chart interaction capabilities
- Single chart type (candlestick only)

Traders need more advanced charting features to perform technical analysis effectively.

## Solution Statement
Implement a comprehensive chart upgrade with the following enhancements:

1. **Extended Timeframes**: Add H4 (4-hour) timeframe to existing M5, M15, H1, D options
2. **Quick Date Range Buttons**: Add preset buttons [1D] [5D] [1M] [3M] [6M] [YTD] [1Y] [All] for rapid time navigation
3. **Volume Indicator**: Add volume bars below the main price chart
4. **Chart Type Selector**: Allow switching between Candlestick, OHLC Bars, Line, and Area chart types
5. **Advanced Interactions**:
   - Mouse wheel zoom with Cmd/Ctrl modifier for Y-axis only zoom
   - Click and drag to pan
   - Double-click to reset zoom
   - Crosshair following cursor with price/time display at axis intersections

## Relevant Files
Use these files to implement the feature:

- `app/client/src/components/PriceChart.jsx` - Main chart component that renders the price chart and controls. Will be extended with new controls for chart type selection, date range buttons, and volume toggle.
- `app/client/src/app/chart.js` - Contains the `drawChart` function that configures Plotly.js. Will be refactored to support multiple chart types, volume subplot, and advanced interactions.
- `app/client/src/app/data.js` - Contains constants for pairs, granularities, and counts. Will be extended with chart type options and date range presets.
- `app/client/src/pages/Dashboard.jsx` - Dashboard page that uses PriceChart component. Will need state management for new chart options.
- `app/server/config/settings.py` - Server settings with TFS timeframe mappings. Will be extended with H4 timeframe.
- `app/server/server.py` - Main server with price data endpoint. No changes needed as the existing endpoint supports flexible count parameter.
- `app/server/api/routes.py` - Route helpers for options. Will need to return extended timeframes.
- `.claude/commands/test_e2e.md` - E2E test runner documentation for understanding test patterns
- `.claude/commands/e2e/test_trading_dashboard.md` - Existing E2E test for dashboard to understand test structure

### New Files
- `.claude/commands/e2e/test_advanced_chart.md` - New E2E test file to validate advanced chart functionality

## Implementation Plan

### Phase 1: Foundation
1. Add H4 (4-hour) timeframe to server settings
2. Define new constants in `data.js` for chart types and date range presets
3. Create utility functions for calculating candle counts from date ranges

### Phase 2: Core Implementation
1. Refactor `chart.js` to support multiple chart types (Candlestick, OHLC, Line, Area)
2. Add volume subplot to the chart with synchronized x-axis
3. Implement advanced Plotly.js interactions (zoom, pan, crosshair)
4. Update `PriceChart.jsx` with new controls UI

### Phase 3: Integration
1. Update `Dashboard.jsx` state management for new chart options
2. Connect date range buttons to calculate appropriate candle counts
3. Wire up chart type selector and volume toggle
4. Ensure all interactions work smoothly together

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test File for Advanced Chart
- Create `.claude/commands/e2e/test_advanced_chart.md` following the pattern in `test_trading_dashboard.md`
- Define test steps for:
  - Verifying chart type selector is present with 4 options
  - Verifying date range buttons are present
  - Testing chart type switching (Candlestick → Line → Area → OHLC)
  - Testing date range button functionality
  - Verifying volume indicator display
  - Testing zoom/pan interactions
- Define success criteria for each test step

### Task 2: Add H4 Timeframe to Server
- Edit `app/server/config/settings.py`:
  - Add `"H4": 14400` to the `TFS` dictionary (4 hours = 14400 seconds)
  - Position it between H1 and D for logical ordering

### Task 3: Add Chart Constants to Frontend
- Edit `app/client/src/app/data.js`:
  - Add `CHART_TYPES` constant array with options: Candlestick, OHLC, Line, Area
  - Add `DATE_RANGES` constant array with presets: 1D, 5D, 1M, 3M, 6M, YTD, 1Y, All
  - Add helper function `calculateCandleCount(dateRange, granularity)` to compute candle count from date range and timeframe

### Task 4: Refactor Chart Drawing Function
- Edit `app/client/src/app/chart.js`:
  - Update `drawChart` function signature to accept `chartType` and `showVolume` parameters
  - Add logic to create different trace types based on `chartType`:
    - `candlestick`: existing candlestick trace
    - `ohlc`: Plotly OHLC trace with same data
    - `line`: scatter trace using close prices with fill
    - `area`: scatter trace with filled area below
  - Add volume subplot:
    - Create secondary y-axis for volume
    - Add bar trace for volume data with color coding (green for up candles, red for down)
    - Configure subplot layout with volume at 20% height below main chart
  - Configure advanced interactions:
    - Set `scrollZoom: true` in config
    - Configure `dragmode: 'pan'` for click-drag panning
    - Add `doubleClick: 'reset'` for zoom reset
    - Configure crosshair with `hovermode: 'x unified'` and spike lines

### Task 5: Update PriceChart Component UI
- Edit `app/client/src/components/PriceChart.jsx`:
  - Add props for `chartType`, `onChartTypeChange`, `showVolume`, `onVolumeToggle`, `selectedDateRange`, `onDateRangeChange`
  - Add chart type selector dropdown in header controls
  - Add date range button group (1D, 5D, 1M, 3M, 6M, YTD, 1Y, All)
  - Add volume toggle button/checkbox
  - Update `drawChart` call to pass new parameters
  - Style controls to match existing UI patterns (Tailwind classes)

### Task 6: Update Dashboard State Management
- Edit `app/client/src/pages/Dashboard.jsx`:
  - Add state for `chartType` (default: 'candlestick')
  - Add state for `showVolume` (default: false)
  - Add state for `selectedDateRange` (default: null - use candle count)
  - Add handler `handleChartTypeChange`
  - Add handler `handleVolumeToggle`
  - Add handler `handleDateRangeChange` that:
    - Calculates appropriate candle count based on date range and selected granularity
    - Calls `loadPrices` with calculated count
  - Pass new props to `PriceChart` component

### Task 7: Add Volume Data Support
- Verify the existing price data API already returns volume data
- If not available from OpenFX API, use a placeholder volume calculation:
  - Generate volume based on price range (high - low) as a proxy
  - Document this limitation in code comments
- Update chart.js to handle both real and calculated volume

### Task 8: Run Validation Commands
- Run `cd app/server && uv run pytest` to validate server tests pass
- Run `cd app/client && npm run build` to validate frontend builds without errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_advanced_chart.md` to validate feature works

## Testing Strategy

### Unit Tests
- Test `calculateCandleCount` function with various date ranges and granularities
- Test chart type trace generation for each type
- Verify volume calculation/display logic

### Edge Cases
- Very short date ranges (1D) with long timeframes (D) - should show minimum candles
- YTD calculation at beginning of year
- Missing or null volume data handling
- Rapid switching between chart types
- Zoom/pan state preservation when changing date ranges

## Acceptance Criteria
1. H4 timeframe is available in the granularity selector dropdown
2. Chart type selector displays 4 options: Candlestick, OHLC, Line, Area
3. All 4 chart types render correctly when selected
4. Date range buttons (1D, 5D, 1M, 3M, 6M, YTD, 1Y, All) are visible and functional
5. Clicking a date range button loads the appropriate number of candles
6. Volume indicator can be toggled on/off
7. Volume bars display below the main chart with synchronized x-axis
8. Mouse wheel zooms the chart (Cmd/Ctrl + wheel zooms Y-axis only)
9. Click and drag pans the chart
10. Double-click resets zoom to original view
11. Crosshair follows cursor with price/time displayed at axis intersections
12. All existing functionality continues to work (no regressions)
13. Frontend builds without errors
14. Server tests pass without errors

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_advanced_chart.md` to validate this functionality works

## Notes
- The OpenFX API may not provide volume data. If volume is not available, we'll calculate a proxy volume based on candle range (high - low) or use a placeholder. This should be documented in the code.
- Plotly.js supports all the required chart interactions natively, but configuration is key:
  - `scrollZoom: true` enables mouse wheel zoom
  - `dragmode: 'pan'` enables click-drag panning
  - `doubleClick: 'reset'` enables zoom reset
  - Spike lines with `spikemode: 'across'` create crosshair effect
- The date range to candle count calculation depends on the selected timeframe:
  - 1D with M5: 288 candles (24 hours × 12 per hour)
  - 1D with H1: 24 candles
  - 1M with D: ~21 candles (trading days)
- Consider future enhancements: real-time price updates via WebSocket, additional indicators (MA, RSI), drawing tools
