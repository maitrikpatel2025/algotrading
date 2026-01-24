# Feature: View Trades on Chart

## Metadata
issue_number: `125`
adw_id: `e22956ea`
issue_json: `{"number":125,"title":"Feature View Trades on Chart","body":"/feature\n\nadw_sdlc_iso\n\nView Trades on Chart\n\nI want to see backtest trades plotted on the price chart\nSo that I can visually validate trade entries and exits\n\nEntry markers: green arrow up (long), red arrow down (short)\nExit markers: exit icon with color based on outcome\nConnecting line between entry and exit\nLine color: green for winners, red for losers\nHover shows trade details: P/L, duration, exit reason\nClick marker navigates to trade in trade list\nToggle to show/hide trades on chart\nFilter to show only winning or losing trades"}`

## Feature Description

This feature enables traders to visualize backtest trades directly on the price chart with entry/exit markers and connecting lines. The visualization will display trade direction (long/short) with appropriately colored and positioned markers, show profit/loss outcomes through color coding, and provide interactive features like hovering for details and clicking to navigate to the trade list. Users will have full control over which trades appear through toggle and filter controls.

The implementation leverages the existing lightweight-charts v5 marker API (similar to the pattern marker system) and integrates with the BacktestResultsSummary component where both the PriceChart and trade data coexist.

## User Story

As a trader
I want to see backtest trades plotted on the price chart
So that I can visually validate trade entries and exits

## Problem Statement

Currently, backtest results show trades only in a tabular format (BacktestTradeList) and as markers on the equity curve chart. Traders cannot see exactly where trades occurred in relation to price action, candlestick patterns, and technical indicators on the main price chart. This makes it difficult to:

1. Validate that entry/exit signals align with the expected strategy logic
2. Identify patterns in winning vs losing trades relative to price action
3. Understand the context of trade entries (support/resistance, pattern breakouts, etc.)
4. Quickly assess trade quality by seeing the price movement during the trade
5. Visually correlate trades with chart-based indicators and patterns

Without trade visualization on the price chart, traders must mentally map trade timing from the trade list to the chart, which is time-consuming and error-prone.

## Solution Statement

Implement a comprehensive trade visualization system on the PriceChart component that displays:

1. **Entry Markers**: Direction-specific arrows (green up for long, red down for short) positioned below/above bars
2. **Exit Markers**: Color-coded by outcome (green for profit, red for loss) with P/L value as text
3. **Connecting Lines**: Dashed lines connecting entry to exit, colored by outcome (green/red)
4. **Interactive Tooltips**: Hover over markers to see trade details (P/L, duration, exit reason)
5. **Click Navigation**: Click markers to select/highlight the trade in the trade list and scroll to it
6. **Toggle Control**: "Show Trades on Chart" checkbox in BacktestResultsSummary controls card
7. **Filter Integration**: Leverage existing trade filters (winners/losers, long/short, date range) to control which trades appear on chart

The solution will reuse the proven marker system from pattern detection (`createPatternMarkers` function in `chart.js`) and integrate seamlessly with the existing BacktestResultsSummary component's state management for trade selection and filtering.

## Relevant Files

Use these files to implement the feature:

### Core Chart Module
- **`app/client/src/app/chart.js`** (lines 631-728)
  - Contains `createPatternMarkers()` function to use as reference template
  - Contains `parseTimeToUnix()` utility for timestamp conversion (lines 64-92)
  - Contains `CHART_COLORS` constants for consistent color scheme (lines 28-39)
  - Will add new `createTradeMarkers()` function for entry/exit markers
  - Will add new `createTradeLines()` function for connecting lines between entry/exit
  - Will update `drawChart()` signature (line 733) to accept trades and showTrades parameters

### Chart Component
- **`app/client/src/components/PriceChart.jsx`** (lines 1-590)
  - React wrapper for chart.js rendering
  - Will add `trades` prop to pass backtest trade data
  - Will add `showTrades` prop for toggle control
  - Will add `onTradeMarkerClick` callback handler for marker clicks
  - Will pass trades to `drawChart()` function in rendering effect (line 115)

### Backtest Results Component
- **`app/client/src/components/BacktestResultsSummary.jsx`** (lines 1-500)
  - Already manages trade selection state (`selectedTradeId`, `highlightedTrade` on lines 61-62)
  - Already renders PriceChart component with price data
  - Will add "Show Trades on Chart" toggle control
  - Will pass filtered trades to PriceChart based on toggle state
  - Will handle bidirectional selection (trade list ↔ chart markers)

### Trade Data Models
- **`app/server/core/data_models.py`** (lines 974+)
  - `BacktestResultsSummary` model contains `trades: List[Dict[str, Any]]`
  - Trade object fields: `id`, `type`, `entry_time`, `exit_time`, `entry_price`, `exit_price`, `size`, `pnl`, `exit_reason`
  - No backend changes needed - data structure already supports the feature

### Trade Utilities
- **`app/client/src/app/tradeUtils.js`**
  - Contains `formatTradeDuration()` for duration formatting
  - Contains `calculateTradePnlPercent()` for P/L percentage
  - Contains `filterTrades()` used by BacktestResultsSummary
  - Will add `findClosestTimeIndex()` helper to map trade timestamps to chart candle indices
  - Will add `formatTradeTooltip()` to generate rich tooltip text

### Trade Filter Controls
- **`app/client/src/components/TradeFilterControls.jsx`**
  - Already provides outcome (all/winners/losers) and direction (both/long/short) filters
  - Used by BacktestResultsSummary to filter trade list
  - Same filters will control which trades appear on chart (no changes needed)

### Existing Reference Implementation
- **`app/client/src/components/EquityCurveChart.jsx`** (lines 172-233)
  - Shows how to create markers for trades on equity curve
  - Demonstrates marker positioning and color coding logic
  - Reference for `highlightedTrade` integration pattern

### New Files

#### E2E Test File
- **`.claude/commands/e2e/test_view_trades_on_chart.md`**
  - Comprehensive E2E test specification for trade visualization feature
  - Tests toggle control, marker rendering, line connections, tooltips, click navigation
  - Tests filter integration (winners/losers, long/short, date ranges)
  - Tests bidirectional selection between chart and trade list
  - Validates marker colors, positions, and styling
  - Includes 30+ verification steps with screenshots

## Implementation Plan

### Phase 1: Foundation - Chart Marker Infrastructure
Build the core marker and line rendering functions in `chart.js` that can display trades on the chart using the lightweight-charts v5 API.

**Deliverables**:
- `createTradeMarkers()` function that converts trade objects to marker objects
- `findClosestTimeIndex()` helper to map ISO timestamps to chart candle indices
- Marker configuration with proper colors, shapes, and positions for entry/exit
- Integration with existing `drawChart()` function to render trade markers

### Phase 2: Core Implementation - Chart Component Integration
Connect the PriceChart React component to accept and display trades, handling the state management and props needed for the visualization.

**Deliverables**:
- PriceChart accepts `trades`, `showTrades`, `onTradeMarkerClick` props
- Chart re-renders when trades or filters change
- Click handlers on markers to trigger trade selection callback
- Proper cleanup of markers when component unmounts or trades change

### Phase 3: Integration - Results Summary & Controls
Integrate the chart visualization with BacktestResultsSummary, adding the toggle control and connecting bidirectional selection between the trade list and chart markers.

**Deliverables**:
- "Show Trades on Chart" toggle control in results summary
- Filtered trades passed to PriceChart based on toggle state
- Bidirectional selection: clicking trade in list highlights on chart, clicking marker selects in list
- Integration with existing TradeFilterControls to filter visible trades on chart
- Auto-scroll to trade list when marker is clicked

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Time Index Helper Function to tradeUtils.js

- Open `app/client/src/app/tradeUtils.js`
- Add `findClosestTimeIndex(chartTimes, targetTime)` function
  - Accept array of chart timestamps and ISO date string target
  - Convert target to timestamp for comparison
  - Find the index of the closest time in the array
  - Return -1 if no valid match found within reasonable threshold
- Add unit test for the helper function in `app/client/src/app/tradeUtils.test.js` (create if needed)

### Step 2: Create Trade Marker Generation Function in chart.js

- Open `app/client/src/app/chart.js`
- Add `createTradeMarkers(mainSeries, chartData, trades, onTradeClick)` function below `createPatternMarkers()` (after line 692)
  - Import `findClosestTimeIndex` from tradeUtils.js
  - Accept trades array, chartData, mainSeries, and click callback
  - For each trade, create entry marker:
    - Use `findClosestTimeIndex()` to find chart index for `entry_time`
    - Position: `belowBar` for long, `aboveBar` for short
    - Shape: `arrowUp` for long, `arrowDown` for short
    - Color: `CHART_COLORS.bullish` (#22c55e) for long, `CHART_COLORS.bearish` (#ef4444) for short
    - Text: `"${trade.type} Entry"`
    - Store trade ID in marker metadata for click handling
  - For each trade, create exit marker:
    - Use `findClosestTimeIndex()` to find chart index for `exit_time`
    - Position: `aboveBar` for long, `belowBar` for short
    - Shape: `arrowDown` for long, `arrowUp` for short
    - Color: green if `pnl >= 0`, red if `pnl < 0`
    - Text: `"Exit: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}"`
    - Store trade ID in marker metadata
  - Sort all markers by time (ascending)
  - Apply markers using `createSeriesMarkers(mainSeries, markers)`
  - Set up click handler if `onTradeClick` callback provided
- Follow the pattern structure from `createPatternMarkers()` (lines 631-692)

### Step 3: Add Trade Line Connection Function to chart.js

- In `app/client/src/app/chart.js`, add `createTradeLines(chart, trades, chartData)` function
  - For each trade, create a LineSeries connecting entry to exit
  - Line color: green (`#22c55e`) for profitable trades (pnl >= 0), red (`#ef4444`) for losses
  - Line width: 2px
  - Line style: 2 (dashed)
  - Use `findClosestTimeIndex()` to get entry and exit indices
  - Line data: `[{ time: entryTime, value: entry_price }, { time: exitTime, value: exit_price }]`
  - Return array of created line series for later cleanup
- Store references to trade lines so they can be removed when trades change

### Step 4: Update drawChart Function Signature

- In `app/client/src/app/chart.js`, update `drawChart()` function (line 733)
  - Add `trades = []` parameter
  - Add `showTrades = false` parameter
  - Add `onTradeClick = null` parameter
- After pattern markers are rendered (around line 880), conditionally render trade markers:
  ```javascript
  if (showTrades && trades && trades.length > 0) {
    createTradeMarkers(mainSeries, chartData, trades, onTradeClick);
    const tradeLines = createTradeLines(chart, trades, chartData);
    // Store tradeLines reference for cleanup if needed
  }
  ```
- Ensure trade markers render on top of patterns but below drawings

### Step 5: Add Trade Props to PriceChart Component

- Open `app/client/src/components/PriceChart.jsx`
- Add new props to function signature (line 23):
  - `trades = []`
  - `showTrades = false`
  - `onTradeMarkerClick = null`
- Pass trades to `drawChart()` in the rendering effect (around line 115):
  ```javascript
  drawChart(
    chartRef.current,
    chartData,
    /* ...existing params... */,
    trades,
    showTrades,
    handleTradeMarkerClick
  );
  ```

### Step 6: Add Trade Marker Click Handler in PriceChart

- In `app/client/src/components/PriceChart.jsx`, add `handleTradeMarkerClick` callback function
  - Accept trade object from marker metadata
  - Call `onTradeMarkerClick(trade)` if prop provided
  - Handle edge cases (no callback, invalid trade object)
- Position handler before the `useEffect` for chart rendering (around line 97)

### Step 7: Add Show Trades Toggle to BacktestResultsSummary

- Open `app/client/src/components/BacktestResultsSummary.jsx`
- Add state: `const [showTradesOnChart, setShowTradesOnChart] = useState(false);`
- In the controls card section (where timeframe/candle count are displayed), add a checkbox control:
  - Label: "Show Trades on Chart"
  - Icon: Use `Target` from lucide-react
  - Styling: Match existing toggle controls in the component
  - Position: Below candle count selector, above chart
- Bind checkbox to `showTradesOnChart` state

### Step 8: Pass Trades to PriceChart from BacktestResultsSummary

- In `BacktestResultsSummary.jsx`, locate the PriceChart component rendering
- Pass new props to PriceChart:
  ```jsx
  <PriceChart
    /* ...existing props... */
    trades={showTradesOnChart ? displayedTrades : []}
    showTrades={showTradesOnChart}
    onTradeMarkerClick={handleTradeMarkerClickFromChart}
  />
  ```
- Use `displayedTrades` (already filtered by TradeFilterControls) so filters automatically apply to chart

### Step 9: Implement Bidirectional Trade Selection

- In `BacktestResultsSummary.jsx`, add `handleTradeMarkerClickFromChart` function:
  - Accept trade object from chart marker click
  - Update `selectedTradeId` state with trade.id
  - Update `highlightedTrade` state with trade object
  - Scroll to trade in trade list using `tradeListRef.current.scrollIntoView()`
  - Expand trade list section if collapsed (`setIsTradeListExpanded(true)`)
- Update existing `handleTradeClick` function (line 100) to also highlight on chart:
  - When a trade is clicked in the list, update `highlightedTrade` state
  - This will re-render PriceChart with the selected trade highlighted

### Step 10: Add Trade Highlighting on Chart

- In `chart.js`, update `createTradeMarkers()` to accept `highlightedTradeId` parameter
- Add visual distinction for highlighted trade markers:
  - Increase marker size by 1.5x
  - Add a border or glow effect (increase line width)
  - Keep the highlighted markers on top (render last)
- Update `drawChart()` to pass `highlightedTradeId` to `createTradeMarkers()`

### Step 11: Create E2E Test Specification File

- Create `.claude/commands/e2e/test_view_trades_on_chart.md`
- Structure based on `test_view_trade_list.md` and `test_backtest_execution.md` examples
- Include sections:
  - User Story
  - Prerequisites (completed backtest with 10+ trades)
  - Test Steps with 30+ verification points:
    - Navigate to backtest results
    - Verify "Show Trades on Chart" toggle exists and is off by default
    - Enable toggle and verify entry markers appear (green up for long, red down for short)
    - Verify exit markers appear with correct colors based on P/L
    - Verify connecting lines appear between entry/exit
    - Verify line colors match trade outcome (green/red)
    - Hover over marker and verify tooltip shows trade details
    - Click marker and verify trade is selected in trade list
    - Click trade in list and verify marker is highlighted on chart
    - Apply "Winners" filter and verify only winning trades shown on chart
    - Apply "Losers" filter and verify only losing trades shown on chart
    - Apply "Long" direction filter and verify only long trade markers shown
    - Apply "Short" direction filter and verify only short trade markers shown
    - Apply date range filter and verify chart markers update
    - Clear filters and verify all trades reappear
    - Disable toggle and verify markers disappear
    - Re-enable toggle and verify markers reappear
    - Test with multiple trades at same timestamp
    - Test with large dataset (100+ trades)
    - Screenshot every major interaction (30+ screenshots)
  - Success Criteria
    - All markers render correctly with proper colors and positions
    - Filters apply to both trade list and chart markers
    - Bidirectional selection works (list ↔ chart)
    - Toggle control works smoothly
    - Performance is acceptable with 100+ trades
    - No console errors during any interaction

### Step 12: Write Unit Tests for Trade Marker Functions

- Create `app/client/src/app/chart.test.js` (if doesn't exist)
- Test `createTradeMarkers()`:
  - Verify correct number of markers created (2 per trade: entry + exit)
  - Verify marker colors match trade type and outcome
  - Verify marker positions (belowBar/aboveBar) based on direction
  - Verify marker text labels are formatted correctly
  - Verify markers are sorted by time
- Test `createTradeLines()`:
  - Verify one line created per trade
  - Verify line colors match P/L outcome
  - Verify line connects correct entry/exit prices
  - Verify line style is dashed

### Step 13: Test Trade Visualization Manually

- Start the application (`./scripts/start.sh`)
- Navigate to a completed backtest with 10+ trades
- Enable "Show Trades on Chart" toggle
- Verify entry markers appear:
  - Long trades: green arrow up below bars
  - Short trades: red arrow down above bars
- Verify exit markers appear:
  - Color based on outcome (green profit, red loss)
  - Positioned opposite of entry (above for long, below for short)
  - Text shows P/L amount
- Verify connecting lines:
  - Dashed lines from entry to exit
  - Green for winners, red for losers
- Click a trade in the list → verify marker is highlighted on chart
- Click a marker on the chart → verify trade is selected and scrolled to in list
- Apply filters:
  - "Winners" → only winning trades visible on chart
  - "Losers" → only losing trades visible on chart
  - "Long" → only long trade markers visible
  - "Short" → only short trade markers visible
  - Date range → markers update to match
- Disable toggle → markers disappear
- Re-enable toggle → markers reappear

### Step 14: Handle Edge Cases and Error States

- In `createTradeMarkers()`, handle edge cases:
  - Empty trades array → return early, no markers
  - Trade missing entry_time or exit_time → skip marker creation for that point
  - Trade timestamp outside chart data range → skip marker (log warning)
  - Invalid P/L value (null/undefined) → default to 0, neutral color
- In PriceChart component, handle:
  - Trades prop not provided → no error, just don't render markers
  - showTrades true but trades empty → no markers, no error
  - onTradeMarkerClick not provided → markers still clickable but no action
- Add console warnings for development (not errors) when data issues detected

### Step 15: Optimize Performance for Large Trade Datasets

- In `createTradeMarkers()`, add performance optimization:
  - If trades.length > 100, show only trades within visible chart range
  - Use binary search to find trades in visible time range (don't iterate all)
  - Limit maximum markers rendered to 200 (100 trades) to prevent slowdown
  - Add warning toast if trade count exceeds limit: "Showing first 100 trades on chart. Apply filters to see specific trades."
- In BacktestResultsSummary, add performance hint:
  - If displayedTrades.length > 100, show info message suggesting filters

### Step 16: Add Tooltip Rich Content for Trade Markers

- In `chart.js`, enhance marker text to support rich tooltips:
  - Entry marker text: `"Entry: ${type} @ $${entry_price.toFixed(5)}"`
  - Exit marker text: `"Exit: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${exit_reason})"`
- Research lightweight-charts v5 tooltip API for hover details
  - If supported, add custom tooltip div showing:
    - Trade number
    - Direction (Long/Short)
    - Entry: date, price
    - Exit: date, price
    - Duration (formatted with `formatTradeDuration`)
    - P/L ($)
    - P/L (%)
    - Exit reason
  - If not supported natively, consider adding a React tooltip overlay component

### Step 17: Test Integration with Existing Filters

- Verify TradeFilterControls filters apply to chart:
  - Outcome filter (all/winners/losers) → chart markers update
  - Direction filter (both/long/short) → chart markers update
  - Date range filter → chart markers update
  - Combined filters → chart shows intersection of all active filters
- Verify filter count badge includes chart state
- Verify "Clear Filters" button resets chart markers to show all trades

### Step 18: Style and Polish UI Controls

- Style "Show Trades on Chart" toggle control:
  - Use Tailwind classes consistent with BacktestResultsSummary design
  - Match spacing, fonts, and colors with existing controls
  - Add hover state and focus state for accessibility
  - Add `Target` icon from lucide-react next to label
- Add subtle animation when toggle is switched:
  - Fade in/out markers with CSS transition
  - Smooth line drawing effect (if feasible with lightweight-charts API)
- Ensure toggle is keyboard accessible (space/enter to toggle)

### Step 19: Add Feature Documentation

- Update `app_docs/` with new feature documentation file:
  - Create `app_docs/feature-e22956ea-view-trades-on-chart.md`
  - Document the feature design, implementation approach, and usage
  - Include screenshots showing markers, lines, and toggle control
  - Document the marker API structure and color coding rules
  - Explain bidirectional selection pattern
  - List edge cases and performance considerations
- Update `README.md` features list to mention trade visualization on charts
- Add JSDoc comments to new functions in `chart.js` and `tradeUtils.js`

### Step 20: Run E2E Test to Validate Feature

- Read `.claude/commands/test_e2e.md`
- Read and execute `.claude/commands/e2e/test_view_trades_on_chart.md`
- Verify all test steps pass with 0 failures
- Capture 30+ screenshots documenting the flow
- Fix any issues discovered during E2E testing
- Re-run E2E test until all assertions pass

### Step 21: Run Validation Commands

Execute every validation command to ensure zero regressions:

- `cd app/server && uv run pytest` - Run server tests
- `cd app/client && npm run build` - Run frontend build
- Read and execute `.claude/commands/e2e/test_view_trades_on_chart.md` - E2E test for this feature
- Manually test the feature end-to-end in the browser
- Verify no console errors or warnings
- Verify backtest results page loads correctly with and without the toggle enabled
- Verify performance is acceptable with 100+ trade dataset

## Testing Strategy

### Unit Tests

**Frontend Unit Tests** (`app/client/src/app/chart.test.js`):
- `createTradeMarkers()` function:
  - Returns correct number of markers (2 per trade)
  - Creates entry markers with correct position (belowBar for long, aboveBar for short)
  - Creates exit markers with correct color based on P/L (green/red)
  - Handles empty trades array gracefully
  - Handles missing timestamp fields
  - Sorts markers by time correctly
- `createTradeLines()` function:
  - Creates one line per trade
  - Line color matches trade outcome
  - Line connects correct entry/exit points
  - Handles trades outside chart range
- `findClosestTimeIndex()` helper:
  - Finds exact match when timestamp exists
  - Finds nearest timestamp when exact match doesn't exist
  - Returns -1 when no reasonable match exists
  - Handles edge cases (empty array, invalid timestamp)

**Integration Tests** (`app/client/src/components/PriceChart.test.jsx`):
- PriceChart renders without trades (no errors)
- PriceChart renders with trades and showTrades=true
- PriceChart calls onTradeMarkerClick when marker clicked
- PriceChart re-renders when trades prop changes
- PriceChart cleans up markers when unmounted

### Edge Cases

1. **Empty or Missing Data**:
   - No trades in backtest results → toggle disabled or hidden
   - Trades array is empty → no markers rendered, no errors
   - Trade missing entry_time → skip entry marker, log warning
   - Trade missing exit_time → skip exit marker, log warning

2. **Timestamp Mismatches**:
   - Trade entry_time before chart data start → skip marker or show at first candle with indicator
   - Trade exit_time after chart data end → skip marker or show at last candle with indicator
   - Trade occurs between candles → marker placed at nearest candle

3. **Large Datasets**:
   - 100+ trades → limit markers rendered to first 100, show warning
   - 1000+ trades → performance mode activated, only render trades in visible range
   - Filtering reduces trades to 0 → show "No trades match filters" message

4. **Marker Collisions**:
   - Multiple trades at same timestamp → stack markers vertically with offset
   - Entry and exit at same candle (very short duration) → show both markers with slight offset

5. **Invalid Data**:
   - P/L is null/undefined → default to 0, use neutral color
   - entry_price or exit_price is invalid → skip line drawing, show markers only
   - Trade type is neither "long" nor "short" → default to long styling, log warning

6. **User Interactions**:
   - Click marker when onTradeMarkerClick not provided → no action, no error
   - Click marker for trade not in current filtered list → marker highlights but selection fails gracefully
   - Toggle off while trade is selected → selection persists in trade list, markers just hidden

7. **Filter Edge Cases**:
   - All filters applied result in 0 trades → chart shows no markers, message displayed
   - Date range filters exclude all trades → chart empty with message
   - Switch between filters rapidly → chart updates smoothly, no race conditions

8. **Chart Type Compatibility**:
   - Ensure markers work on candlestick charts (primary)
   - Verify markers work on line charts (if applicable)
   - Verify markers work with drawing tools active (no interference)

## Acceptance Criteria

- "Show Trades on Chart" toggle control is visible in BacktestResultsSummary controls section
- Toggle is disabled when no trades exist in the backtest results
- Toggle default state is OFF (unchecked) to avoid overwhelming users initially
- Entry markers appear with correct styling:
  - Long trades: green arrow up, positioned below bars
  - Short trades: red arrow down, positioned above bars
- Exit markers appear with correct styling:
  - Profitable trades (P/L >= 0): green color, opposite position of entry
  - Losing trades (P/L < 0): red color, opposite position of entry
  - Text displays P/L amount: "Exit: +$XX.XX" or "Exit: -$XX.XX"
- Connecting lines appear between entry and exit markers:
  - Dashed line style (line style 2)
  - Green color for winning trades
  - Red color for losing trades
  - Line connects entry_price to exit_price
- Markers display rich tooltips on hover showing:
  - Trade number
  - Direction (Long/Short)
  - Entry date and price
  - Exit date and price
  - Duration (human-readable format)
  - P/L ($) and P/L (%)
  - Exit reason
- Clicking a marker selects the corresponding trade in the trade list:
  - Trade row is highlighted
  - Trade list section auto-expands if collapsed
  - Page scrolls to show the selected trade
  - `selectedTradeId` state updates
- Clicking a trade in the list highlights the marker on the chart:
  - Marker size increases by 1.5x
  - Marker appears on top of other markers
  - Connecting line becomes thicker
- Existing TradeFilterControls filters apply to chart markers:
  - Outcome filter (All/Winners/Losers) → chart updates
  - Direction filter (Both/Long/Short) → chart updates
  - Date range filter (Start/End) → chart updates
  - Combined filters show intersection of all active filters
- "Clear Filters" button resets chart to show all trades
- Toggle OFF hides all markers and lines immediately
- Toggle ON shows markers for currently filtered trades
- Performance remains acceptable with 100+ trade dataset:
  - Markers render within 500ms
  - Chart remains interactive and responsive
  - No lag when applying filters or scrolling
- Edge cases handled gracefully:
  - Missing timestamps → markers skipped with console warning
  - Trades outside chart range → markers not rendered
  - Invalid P/L values → default to 0, neutral styling
  - Multiple trades at same timestamp → markers stacked with offset
- No console errors during any interaction
- No visual glitches or marker overlap issues
- Feature works on all supported chart types (candlestick, line)
- Feature does not interfere with existing chart features (indicators, patterns, drawings)
- E2E test passes with 0 failures and 30+ screenshots captured

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_view_trades_on_chart.md` to validate this functionality works end-to-end with comprehensive verification steps and screenshots.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Technical Implementation Notes

1. **Lightweight Charts v5 API**: The feature leverages the `createSeriesMarkers()` API introduced in lightweight-charts v5. This is the same API used by the pattern marker system, so we have a proven reference implementation.

2. **Marker Metadata**: Store trade ID in marker metadata to enable click handling and selection correlation. This follows the pattern used in `createPatternMarkers()`.

3. **Time Synchronization**: Use `parseTimeToUnix()` utility (already exists in chart.js) to convert ISO timestamps to Unix format for chart compatibility.

4. **Color Consistency**: Use `CHART_COLORS` constants for consistent styling with the rest of the application (green=#22c55e for bullish/profit, red=#ef4444 for bearish/loss).

5. **Performance Optimization**: For datasets with 100+ trades, implement lazy rendering - only render markers for trades within the visible chart range. Use binary search to efficiently find trades in range.

6. **State Management**: Leverage existing state in BacktestResultsSummary for trade selection (`selectedTradeId`, `highlightedTrade`). No new state management libraries needed.

### Future Enhancements (Out of Scope for This Feature)

1. **Trade Grouping**: Cluster nearby trades into a single marker with expandable detail view
2. **Trade Statistics Overlay**: Show aggregate P/L for trades in visible chart range
3. **Trade Path Animation**: Animate the drawing of connecting lines when toggle is enabled
4. **Custom Marker Shapes**: Allow users to choose different marker shapes/icons for entries/exits
5. **Trade Notes**: Allow users to add custom notes to trades and display in tooltips
6. **Trade Heatmap**: Color-code chart background based on trade density or profitability
7. **Multi-Backtest Comparison**: Show trades from multiple backtests on the same chart with different colors

### Dependencies

- No new npm packages required - feature uses existing lightweight-charts v5
- No new backend dependencies - all data already available in BacktestResultsSummary
- No database schema changes needed

### Accessibility Considerations

- Toggle control is keyboard accessible (space/enter to toggle)
- Markers have sufficient color contrast for visibility
- Tooltips are readable and contain all critical information
- Screen reader announcements when toggle state changes
- Focus management when navigating from chart to trade list

### Browser Compatibility

- Feature tested on Chrome, Firefox, Safari, Edge (latest versions)
- Marker rendering works on all modern browsers supporting Canvas API
- Touch device support for marker clicks (mobile/tablet)

### Related Documentation to Read

Based on `.claude/commands/conditional_docs.md`, the following documentation is relevant:

- `app_docs/feature-632a538d-backtest-summary-statistics.md` - Working with backtest results and summary statistics
- `app_docs/feature-69a9dc86-equity-curve-chart.md` - Interactive chart implementation with lightweight-charts
- `app_docs/feature-50dfaeee-view-trade-list.md` - Trade list display and filtering
- `app_docs/feature-dc50bbc5-interactive-ohlc-chart.md` - PriceChart component patterns
- `.claude/commands/test_e2e.md` - E2E test runner documentation
