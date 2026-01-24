# Feature: View Trades on Chart

## Metadata
issue_number: `122`
adw_id: `1d08ed0d`
issue_json: `{"number":122,"title":"Feature View Trades on Chart US-BT-012","body":"/feature\n\nadw_sdlc_iso\n\nView Trades on Chart\n\nI want to see backtest trades plotted on the price chart\nSo that I can visually validate trade entries and exits\n\n Entry markers: green arrow up (long), red arrow down (short)\n Exit markers: exit icon with color based on outcome\n Connecting line between entry and exit\n Line color: green for winners, red for losers\n Hover shows trade details: P/L, duration, exit reason\n Click marker navigates to trade in trade list\n Toggle to show/hide trades on chart\n Filter to show only winning or losing trades"}`

## Feature Description
This feature enables users to visualize backtest trades directly on price charts, providing an intuitive way to analyze trade performance in the context of price action. Users will see entry and exit markers with connecting lines on the chart, color-coded by profitability (green for winners, red for losers). Each marker will display trade details on hover and allow navigation to the corresponding trade in the trade list.

## User Story
As a trader analyzing backtest results
I want to see backtest trades plotted on the price chart
So that I can visually validate trade entries and exits in the context of market price movements

## Problem Statement
Currently, backtest results display trades in a table format (BacktestTradeList) separate from the price chart visualization. Users must mentally correlate entry/exit times and prices between the trade list and chart, making it difficult to understand the price context of trade decisions. There's no visual representation of where trades occurred relative to candlestick patterns, support/resistance levels, or technical indicators.

## Solution Statement
Integrate trade visualization directly on the price chart by:
1. Extending the PriceChart component to accept and render backtest trades
2. Adding trade markers (arrows) at entry/exit points with color coding based on profitability
3. Drawing connecting lines between entry and exit markers
4. Providing interactive tooltips showing trade details (P/L, duration, exit reason)
5. Enabling click-to-navigate from chart markers to the trade list
6. Adding UI controls to toggle trade display and filter by outcome (winners/losers)

This leverages the existing lightweight-charts v5 marker system (already used for pattern detection) and integrates seamlessly with the current backtest results workflow.

## Relevant Files
Use these files to implement the feature:

### Backend - Models & API
- `app/server/core/data_models.py` (lines 910-975) - BacktestResultsSummary model contains trades array with entry_time, exit_time, entry_price, exit_price, pnl, type, exit_reason
- `app/server/core/backtest_executor.py` (lines 556-568) - Trade structure creation during backtest execution

### Frontend - Chart Rendering
- `app/client/src/app/chart.js` (lines 631-900+) - Core chart rendering logic using lightweight-charts v5
  - `drawChart()` function orchestrates chart creation
  - `createPatternMarkers()` (lines 631-692) demonstrates marker creation with lightweight-charts
  - `createSeriesMarkers(mainSeries, markersArray)` API for adding markers
- `app/client/src/components/PriceChart.jsx` - Main price chart component used on Strategy page
  - Accepts priceData, activeIndicators, activePatterns, drawings props
  - Needs new `trades` prop and trade display controls

### Frontend - Backtest Results Display
- `app/client/src/components/BacktestResultsSummary.jsx` - Orchestrates backtest results display
  - Contains EquityCurveChart and BacktestTradeList
  - Has highlightedTrade state (lines 62) for equity curve highlighting
  - Needs integration with new trade chart view
- `app/client/src/components/BacktestTradeList.jsx` - Trade list table component
  - Handles trade selection and highlighting
  - Needs scrollToTrade() method for marker click navigation
- `app/client/src/pages/BacktestDashboard.jsx` - Backtest execution and results page
  - Loads backtest results including trades array
  - Displays BacktestResultsSummary component

### Frontend - Utilities
- `app/client/src/app/tradeUtils.js` - Trade filtering, sorting, formatting functions
  - `filterTrades()` - filters by outcome (winners/losers), direction, date range
  - `formatTradeDuration()`, `formatExitReason()`, `calculateTradePnlPercent()`
- `app/client/src/app/constants.js` - Application constants
  - Add TRADE_MARKERS_STORAGE_KEY for persisting show/hide preference
  - Add TRADE_MARKER_COLORS for consistent color scheme

### Documentation
- `app_docs/feature-69a9dc86-equity-curve-chart.md` - Equity curve chart implementation (uses lightweight-charts v5)
- `app_docs/feature-50dfaeee-view-trade-list.md` - Trade list feature documentation
- `app_docs/feature-2bf4bcfd-backtest-execution-progress-cancel.md` - Backtest execution flow
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_view_trade_list.md` - Example E2E test structure

### New Files
- `app/client/src/components/TradeChartOverlay.jsx` - New component for trade visualization controls (toggle, filters)
- `app/client/src/app/tradeMarkerUtils.js` - Utility functions for creating trade markers and connecting lines
- `.claude/commands/e2e/test_view_trades_on_chart.md` - E2E test specification for this feature

## Implementation Plan

### Phase 1: Foundation
Create the utility functions and data structures needed to map backtest trades to chart markers. This includes converting ISO datetime strings to Unix timestamps, mapping trades to candlestick times, and defining marker color schemes. Establish the marker data structure compatible with lightweight-charts v5 API.

### Phase 2: Core Implementation
Extend the PriceChart component to accept trades as a prop and render trade markers using the lightweight-charts v5 marker system. Implement entry/exit markers with appropriate shapes (arrowUp for long entry, arrowDown for short entry/exit) and color coding based on trade profitability. Add connecting lines between entry and exit points using the lightweight-charts shapes API.

### Phase 3: Integration
Integrate trade visualization into the BacktestResultsSummary component with UI controls for toggling visibility and filtering trades. Connect chart marker clicks to trade list navigation. Add localStorage persistence for user preferences (show/hide trades). Test the complete flow from backtest execution to trade visualization.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create Trade Marker Utilities
- Create `app/client/src/app/tradeMarkerUtils.js` with utility functions:
  - `convertISOToUnixTimestamp(isoString)` - Converts ISO 8601 datetime to Unix seconds
  - `findClosestCandleIndex(targetTimestamp, candleTimes)` - Maps trade time to nearest candle
  - `createTradeMarker(trade, candleTime, isEntry, tradeNumber)` - Creates marker object for lightweight-charts
  - `createConnectingLine(entryMarker, exitMarker, isProfitable)` - Creates line shape between entry/exit
  - `getTradeMarkerColor(trade, isEntry)` - Returns appropriate color based on trade outcome
- Add unit tests for timestamp conversion and candle mapping logic

### Step 2: Add Trade Display Constants
- Update `app/client/src/app/constants.js`:
  - Add `TRADE_MARKERS_VISIBLE_KEY = 'forex_dash_trade_markers_visible'` for localStorage persistence
  - Add `TRADE_MARKERS_FILTER_KEY = 'forex_dash_trade_markers_filter'` for filter persistence
  - Add color constants:
    ```javascript
    export const TRADE_MARKER_COLORS = {
      LONG_ENTRY: '#22c55e',     // Green for long entry
      SHORT_ENTRY: '#ef4444',    // Red for short entry
      PROFITABLE_EXIT: '#22c55e', // Green for winning exit
      LOSING_EXIT: '#ef4444',     // Red for losing exit
      CONNECTING_LINE_WIN: '#22c55e',
      CONNECTING_LINE_LOSS: '#ef4444',
    };
    ```

### Step 3: Extend Chart.js with Trade Marker Rendering
- Update `app/client/src/app/chart.js`:
  - Add `createTradeMarkers(mainSeries, chartData, trades, visibleFilter)` function (similar to `createPatternMarkers` on lines 631-692)
  - Function should:
    - Filter trades based on visibleFilter ('all', 'winners', 'losers')
    - Map trade entry_time and exit_time to candle timestamps
    - Create entry markers with appropriate arrows and colors
    - Create exit markers with labels showing P/L
    - Call `createSeriesMarkers(mainSeries, combinedMarkers)` to render all markers
  - Add `createTradingLines(mainSeries, chartData, trades, visibleFilter)` function
  - Function should create shape objects for connecting lines between entry/exit points
- Update `drawChart()` function to accept `trades` and `tradesVisible` parameters
- Call `createTradeMarkers()` and `createTradingLines()` after pattern markers are created

### Step 4: Extend PriceChart Component
- Update `app/client/src/components/PriceChart.jsx`:
  - Add new props: `trades` (array), `tradesVisible` (boolean), `tradesFilter` (string: 'all'|'winners'|'losers')
  - Add prop: `onTradeMarkerClick` callback for handling marker clicks
  - Pass trades to `drawChart()` in chart.js
  - Add click event handler for trade markers that calls `onTradeMarkerClick(trade, tradeNumber)`
- Ensure backward compatibility by making trades optional (default: null)

### Step 5: Create Trade Chart Overlay Controls Component
- Create `app/client/src/components/TradeChartOverlay.jsx`:
  - Toggle button to show/hide trades on chart (eye icon)
  - Filter buttons: All | Winners | Losers
  - Active trade count badge (e.g., "12 trades")
  - Compact design matching existing UI patterns
- Use Tailwind CSS with design system colors
- Persist toggle state to localStorage using `TRADE_MARKERS_VISIBLE_KEY`
- Persist filter state to localStorage using `TRADE_MARKERS_FILTER_KEY`

### Step 6: Create Price Chart View in Backtest Results
- Update `app/client/src/components/BacktestResultsSummary.jsx`:
  - Add new state: `showPriceChartView` (boolean), `tradesVisible` (boolean), `tradesFilter` (string)
  - Add "View on Price Chart" button in results header (next to equity curve)
  - When clicked, display PriceChart component with backtest trades
  - Fetch price data for the backtest's pair, timeframe, and date range using `/api/prices` endpoint
  - Pass trades array to PriceChart component
  - Add TradeChartOverlay controls above the price chart
  - Handle `onTradeMarkerClick` to scroll to trade in BacktestTradeList and highlight row

### Step 7: Implement Trade List Navigation from Chart
- Update `app/client/src/components/BacktestTradeList.jsx`:
  - Add `scrollToTradeRef` ref for external access
  - Expose `scrollToTrade(tradeNumber)` method via useImperativeHandle
  - Method should:
    - Find trade row by trade number
    - Scroll row into view with smooth behavior
    - Highlight row with temporary animation/flash
- Update BacktestResultsSummary to use ref and call scrollToTrade when marker is clicked

### Step 8: Add Hover Tooltips for Trade Markers
- Update `createTradeMarkers()` in chart.js:
  - Add custom tooltip logic using lightweight-charts tooltip API
  - Tooltip should display:
    - "Long Entry" or "Short Entry" for entry markers
    - "Exit: +$X.XX (Stop Loss)" for exit markers with P/L, exit reason
    - Trade duration (e.g., "2h 15m")
  - Use `formatTradeDuration()` and `formatExitReason()` from tradeUtils.js
- Style tooltips consistently with existing chart tooltips

### Step 9: Implement Connecting Lines Between Entry/Exit
- Update `createTradingLines()` in chart.js:
  - For each trade, create a line shape from entry point to exit point
  - Use lightweight-charts shapes API: `mainSeries.createPriceLine()` or custom shapes
  - Color: green (#22c55e) for winners, red (#ef4444) for losers
  - Line style: solid with 1px width
  - Add hover effect to highlight line and show trade summary tooltip

### Step 10: Add Loading and Empty States
- In BacktestResultsSummary price chart view:
  - Show loading spinner while fetching price data
  - Display "No price data available" message if API fails
  - Show "No trades to display" if no trades match current filter
  - Handle case where backtest date range exceeds available price data

### Step 11: Create E2E Test Specification
- Create `.claude/commands/e2e/test_view_trades_on_chart.md` based on test_view_trade_list.md format
- Test steps should validate:
  - "View on Price Chart" button appears in backtest results
  - Clicking button displays price chart with trade markers
  - Entry markers appear at correct candle with correct color (green for long, red for short)
  - Exit markers appear with P/L labels
  - Connecting lines are drawn between entry/exit
  - Toggle control hides/shows all trades
  - Filter controls show only winners or losers
  - Clicking marker scrolls to trade in trade list and highlights row
  - Hover tooltips display correct trade details
  - Trade markers render correctly with 100+ trades
  - Screenshots documenting all interactions (15+ screenshots)

### Step 12: Integration Testing
- Test complete workflow:
  - Run backtest with 20+ trades (mix of winners/losers, long/short)
  - Verify trades appear in trade list
  - Click "View on Price Chart"
  - Verify all trades render correctly on chart
  - Test toggle show/hide
  - Test filter winners only, losers only
  - Click various trade markers and verify navigation to trade list
  - Verify localStorage persistence (refresh page, settings retained)

### Step 13: Run Validation Commands
- Execute all commands from Validation Commands section below
- Fix any regressions or test failures
- Verify zero errors in server tests
- Verify zero errors in frontend build
- Run E2E test and verify all steps pass with screenshots

## Testing Strategy

### Unit Tests
- **tradeMarkerUtils.js**:
  - `convertISOToUnixTimestamp()` correctly converts ISO 8601 to Unix seconds
  - `findClosestCandleIndex()` maps trade time to nearest candle (test edge cases: before first candle, after last candle, exact match)
  - `createTradeMarker()` generates correct marker structure for lightweight-charts
  - `getTradeMarkerColor()` returns correct colors based on trade profitability

- **chart.js**:
  - `createTradeMarkers()` filters trades correctly (all, winners, losers)
  - `createTradeMarkers()` creates correct number of markers (2 per trade: entry + exit)
  - `createTradingLines()` creates lines for each trade with correct colors

### Integration Tests
- **PriceChart with trades**:
  - Component renders without trades prop (backward compatibility)
  - Component renders with empty trades array
  - Component renders with 1 trade (entry + exit markers appear)
  - Component renders with 100+ trades (performance test)
  - Toggle visibility hides/shows markers correctly
  - Filter updates visible markers correctly

- **BacktestResultsSummary**:
  - "View on Price Chart" button appears when results have trades
  - Clicking button fetches price data and displays chart
  - Marker click navigates to trade list
  - Trade list highlight syncs with selected marker

### Edge Cases
- **Empty or missing data**:
  - Backtest with zero trades (no markers rendered, empty state shown)
  - Trade entry_time before price data start (marker not rendered or warning shown)
  - Trade exit_time after price data end (marker not rendered or warning shown)

- **Timestamp mapping**:
  - Trade time exactly matches candle time (exact match)
  - Trade time between candles (rounds to nearest)
  - Multiple trades on same candle (markers stacked or offset)

- **Profitability edge cases**:
  - Trade with exactly $0.00 P/L (neutral color or fallback to gray)
  - Trade with very large profit/loss (label formatting handles large numbers)

- **UI interactions**:
  - Toggle trades while chart is zoomed (markers remain visible in viewport)
  - Filter to winners when all trades are losers (empty state shown)
  - Click marker for trade on last page of trade list (pagination changes, row scrolls into view)

- **Performance**:
  - Render 500+ trades on chart (smooth rendering, no lag)
  - Toggle visibility with 500+ trades (instant hide/show)
  - Filter 500+ trades (fast update)

## Acceptance Criteria
- "View on Price Chart" button appears in BacktestResultsSummary when trades exist
- Clicking button displays PriceChart with trade markers overlaid on candlesticks
- Entry markers:
  - Long positions: green arrow up at entry price/time
  - Short positions: red arrow down at entry price/time
- Exit markers:
  - Icon/arrow at exit price/time
  - Color: green for profitable trades, red for losing trades
  - Label shows P/L amount (e.g., "+$12.50" or "-$5.25")
- Connecting lines:
  - Solid line from entry marker to exit marker
  - Color: green for winners, red for losers
  - 1px width, no hover effect initially (can be enhanced later)
- Hover tooltips:
  - Entry markers show: "Long Entry" or "Short Entry", timestamp, entry price
  - Exit markers show: P/L, duration, exit reason, exit price
- Click interactions:
  - Clicking trade marker navigates to BacktestTradeList
  - Trade list scrolls to selected trade
  - Trade row highlights with animation
- Toggle control:
  - Eye icon button to show/hide all trade markers
  - State persists to localStorage
  - Smooth transition when toggling
- Filter control:
  - Buttons: All | Winners | Losers
  - Active filter highlighted
  - Only matching trades displayed on chart
  - Filter state persists to localStorage
- Trade count badge displays number of visible trades (e.g., "8 of 25 trades")
- Loading state shown while fetching price data
- Empty state shown when no trades match filter
- Error handling for price data fetch failures
- Backward compatibility: PriceChart works without trades prop (Strategy page unaffected)
- Performance: Smooth rendering with 100+ trades
- E2E test passes with 15+ screenshots documenting the feature

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_view_trades_on_chart.md` test file to validate this functionality works.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Lightweight-Charts v5 API Resources
- Marker API: `createSeriesMarkers(series, markersArray)` where each marker is `{ time, position, color, shape, text }`
- Shape API: `series.createPriceLine({ price, color, lineWidth, lineStyle, title })` for horizontal lines
- Custom shapes: Can use `series.setMarkers()` for complex overlays
- Reference: app/client/src/app/chart.js lines 631-692 (pattern marker implementation)

### Time Mapping Strategy
- Backtest trades use ISO 8601 timestamps (e.g., "2026-01-21T10:30:00")
- Price data uses Unix timestamps in seconds
- Need conversion: `new Date(isoString).getTime() / 1000`
- Lightweight-charts expects Unix timestamps in seconds for marker time property
- Use binary search or find closest match for mapping trade time to candle time

### Color Scheme
- Consistent with existing design system:
  - Green (#22c55e / text-green-500): Long entries, profitable trades
  - Red (#ef4444 / text-red-500): Short entries, losing trades
  - Gray/neutral for $0 P/L trades (rare edge case)

### Performance Considerations
- Limit initial render to 200 visible trades (add pagination or warning if exceeded)
- Use lightweight-charts built-in performance optimizations
- Debounce filter changes to avoid rapid re-renders
- Consider virtualizing trade list if 500+ trades

### Future Enhancements (Not in Scope)
- Interactive line editing (drag entry/exit points to simulate different exits)
- Multi-trade selection (click multiple markers to compare trades)
- Trade clustering for multiple trades on same candle (grouped marker)
- Export chart with trades as PNG/SVG
- Animate trades chronologically (playback mode)
- Show trade indicators/patterns that triggered entry (context markers)

### Backward Compatibility
- PriceChart component must work without trades prop (Strategy page uses it for indicators/patterns only)
- Default all new props to null/false/undefined
- No breaking changes to existing chart.js functions
- TradeChartOverlay is optional, only shown when trades prop is provided

### Accessibility
- Keyboard navigation for toggle/filter controls (Tab, Enter, Space)
- Screen reader labels for all buttons ("Toggle trade visibility", "Show only winners")
- Sufficient color contrast for markers and labels
- Focus indicators for interactive elements

### Mobile Responsiveness
- Trade markers scale appropriately on small screens
- Toggle/filter controls stack vertically on mobile
- Tooltips position within viewport bounds
- Touch-friendly tap targets for markers (minimum 44x44px)
