# E2E Test: View Trades on Chart

## User Story

As a trader
I want to see backtest trades plotted on the price chart
So that I can visually validate trade entries and exits

## Prerequisites

- Application is running and accessible
- A completed backtest exists with at least 10 trades (mix of winners and losers, long and short)
- Backtest has price data available for the tested pair and timeframe
- Test user is logged in (if authentication is required)

## Test Environment Setup

1. Navigate to the backtest results page for a completed backtest
2. Ensure the backtest has:
   - At least 10 trades total
   - Mix of winning and losing trades
   - Mix of long and short positions
   - Trades spread across different time periods
   - Price data loaded and visible

## Test Steps

### Part 1: Toggle Control and Basic Rendering

#### Step 1.1: Verify Initial State
- [ ] Navigate to backtest results summary page
- [ ] Verify "Price Chart" section is visible
- [ ] Verify "Show Trades on Chart" toggle exists
- [ ] Verify toggle is OFF (unchecked) by default
- [ ] Verify price chart renders candlesticks without trade markers
- [ ] Take screenshot: `01-initial-state-toggle-off.png`

#### Step 1.2: Enable Trade Visualization
- [ ] Click the "Show Trades on Chart" toggle
- [ ] Verify toggle becomes checked
- [ ] Verify trade markers appear on the chart
- [ ] Take screenshot: `02-toggle-on-markers-visible.png`

#### Step 1.3: Verify Entry Markers
- [ ] Count long trade entry markers (green arrows pointing up, below bars)
- [ ] Count short trade entry markers (red arrows pointing down, above bars)
- [ ] Verify entry marker count matches expected number of trades
- [ ] Verify entry markers are positioned correctly relative to candles
- [ ] Take screenshot: `03-entry-markers-detail.png`

#### Step 1.4: Verify Exit Markers
- [ ] Verify winning trade exit markers are green
- [ ] Verify losing trade exit markers are red
- [ ] Verify exit markers show P/L values in text
- [ ] Verify exit marker positions (above bars for long, below bars for short)
- [ ] Take screenshot: `04-exit-markers-detail.png`

#### Step 1.5: Verify Connecting Lines
- [ ] Verify dashed lines connect each entry to its exit
- [ ] Verify line colors: green for winners, red for losers
- [ ] Verify lines connect correct entry/exit prices
- [ ] Zoom in on a trade to see line detail
- [ ] Take screenshot: `05-connecting-lines.png`

#### Step 1.6: Toggle Off
- [ ] Click the "Show Trades on Chart" toggle to uncheck it
- [ ] Verify all trade markers disappear immediately
- [ ] Verify all connecting lines disappear
- [ ] Verify chart still shows candlesticks normally
- [ ] Take screenshot: `06-toggle-off-markers-removed.png`

#### Step 1.7: Toggle On Again
- [ ] Click the "Show Trades on Chart" toggle to check it again
- [ ] Verify trade markers reappear
- [ ] Verify the same number of markers as before
- [ ] Take screenshot: `07-toggle-on-again.png`

### Part 2: Trade Marker Interaction

#### Step 2.1: Hover Over Entry Marker
- [ ] Hover mouse over a long trade entry marker
- [ ] Verify marker text shows entry price
- [ ] Verify marker text shows trade type (Long/Short)
- [ ] Take screenshot: `08-hover-entry-marker.png`

#### Step 2.2: Hover Over Exit Marker
- [ ] Hover mouse over a winning trade exit marker
- [ ] Verify marker text shows P/L amount
- [ ] Verify marker text shows exit reason
- [ ] Take screenshot: `09-hover-exit-marker-winner.png`

#### Step 2.3: Click Trade Marker - Navigate to List
- [ ] Click on a trade entry marker
- [ ] Verify trade list section expands (if collapsed)
- [ ] Verify the corresponding trade row is selected/highlighted
- [ ] Verify page scrolls to show the selected trade in the list
- [ ] Take screenshot: `10-click-marker-selects-trade.png`

#### Step 2.4: Bidirectional Selection - List to Chart
- [ ] Click on a different trade in the trade list
- [ ] Verify the corresponding trade markers on chart are highlighted
- [ ] Verify highlighted markers are larger/more prominent
- [ ] Verify previously selected markers return to normal size
- [ ] Take screenshot: `11-click-list-highlights-chart.png`

#### Step 2.5: Click Same Trade Again to Deselect
- [ ] Click the currently selected trade in the list again
- [ ] Verify trade becomes deselected
- [ ] Verify chart markers return to normal (not highlighted)
- [ ] Take screenshot: `12-deselect-trade.png`

### Part 3: Filter Integration

#### Step 3.1: Filter by Outcome - Winners Only
- [ ] Ensure "Show Trades on Chart" is ON
- [ ] In trade filter controls, select "Winners" in outcome filter
- [ ] Verify only winning trade markers appear on chart (green exits)
- [ ] Verify losing trade markers are removed from chart
- [ ] Verify trade list also shows only winners
- [ ] Count chart markers and verify they match winner count
- [ ] Take screenshot: `13-filter-winners-only.png`

#### Step 3.2: Filter by Outcome - Losers Only
- [ ] Change outcome filter to "Losers"
- [ ] Verify only losing trade markers appear on chart (red exits)
- [ ] Verify winning trade markers are removed
- [ ] Verify chart marker count matches loser count
- [ ] Take screenshot: `14-filter-losers-only.png`

#### Step 3.3: Filter by Direction - Long Only
- [ ] Change outcome filter back to "All"
- [ ] In direction filter, select "Long"
- [ ] Verify only long trade markers appear (entries below bars)
- [ ] Verify short trade markers are removed
- [ ] Verify chart marker count matches long trade count
- [ ] Take screenshot: `15-filter-long-only.png`

#### Step 3.4: Filter by Direction - Short Only
- [ ] Change direction filter to "Short"
- [ ] Verify only short trade markers appear (entries above bars)
- [ ] Verify long trade markers are removed
- [ ] Verify chart marker count matches short trade count
- [ ] Take screenshot: `16-filter-short-only.png`

#### Step 3.5: Combined Filters - Long Winners
- [ ] Set outcome filter to "Winners"
- [ ] Set direction filter to "Long"
- [ ] Verify only long winning trades show markers
- [ ] Verify all markers have green exit markers
- [ ] Verify all entry markers are below bars (long)
- [ ] Take screenshot: `17-filter-long-winners.png`

#### Step 3.6: Date Range Filter
- [ ] Reset outcome and direction filters to "All" / "Both"
- [ ] Apply a date range filter to show only trades in first half of backtest period
- [ ] Verify chart markers only appear for trades within date range
- [ ] Verify trades outside date range are not shown on chart
- [ ] Take screenshot: `18-filter-date-range.png`

#### Step 3.7: Clear All Filters
- [ ] Click "Clear Filters" button
- [ ] Verify all trade markers reappear on chart
- [ ] Verify marker count matches total trade count
- [ ] Verify both long and short, winners and losers are visible
- [ ] Take screenshot: `19-filters-cleared-all-trades.png`

### Part 4: Edge Cases and Robustness

#### Step 4.1: Zoom and Pan Chart
- [ ] Zoom in on chart to show fewer candles
- [ ] Verify trade markers remain correctly positioned on candles
- [ ] Pan chart to different time period
- [ ] Verify markers move with candles correctly
- [ ] Take screenshot: `20-zoom-pan-markers-stable.png`

#### Step 4.2: Multiple Trades at Same Time
- [ ] Identify if backtest has multiple trades at similar timestamps
- [ ] If yes, verify markers are distinguishable (not overlapping completely)
- [ ] If no, this is acceptable - note in test results
- [ ] Take screenshot: `21-multiple-trades-same-time.png` (if applicable)

#### Step 4.3: Very Long Trade Duration
- [ ] Find the longest duration trade in the list
- [ ] Select it from the trade list
- [ ] Verify connecting line spans the full distance
- [ ] Verify line is visible and properly styled
- [ ] Take screenshot: `22-long-duration-trade-line.png`

#### Step 4.4: Very Short Trade Duration
- [ ] Find the shortest duration trade in the list
- [ ] Select it from the trade list
- [ ] Verify both entry and exit markers are visible
- [ ] Verify connecting line is visible even if short
- [ ] Take screenshot: `23-short-duration-trade.png`

#### Step 4.5: Large Dataset Performance (if 100+ trades available)
- [ ] If backtest has 100+ trades, enable "Show Trades on Chart"
- [ ] Measure time for markers to appear (should be < 1 second)
- [ ] Verify chart remains interactive (can zoom, pan smoothly)
- [ ] Verify no lag when toggling filters
- [ ] Take screenshot: `24-large-dataset-performance.png`
- [ ] If performance warning appears, verify it's appropriate

#### Step 4.6: Trade with Missing Data (if applicable)
- [ ] Check browser console for any warnings
- [ ] Verify application handles trades gracefully even if some data is missing
- [ ] Verify no JavaScript errors in console
- [ ] Take screenshot: `25-console-no-errors.png`

### Part 5: Visual Quality and Styling

#### Step 5.1: Marker Color Accuracy
- [ ] Verify green color matches success color from style guide (#22c55e)
- [ ] Verify red color matches destructive color from style guide (#ef4444)
- [ ] Verify colors are visually distinct and accessible
- [ ] Take screenshot: `26-marker-colors-accurate.png`

#### Step 5.2: Marker Size and Positioning
- [ ] Verify markers are appropriately sized (not too large or too small)
- [ ] Verify markers don't obscure candlestick data
- [ ] Verify markers align with their respective candles
- [ ] Take screenshot: `27-marker-size-positioning.png`

#### Step 5.3: Line Style and Visibility
- [ ] Verify connecting lines are dashed (not solid)
- [ ] Verify line width is appropriate (2px)
- [ ] Verify lines are visible against chart background
- [ ] Take screenshot: `28-line-style-visibility.png`

#### Step 5.4: Toggle Control Styling
- [ ] Verify toggle checkbox styling matches app design system
- [ ] Verify label text is readable
- [ ] Verify Target icon is visible and appropriate
- [ ] Verify hover state shows visual feedback
- [ ] Take screenshot: `29-toggle-control-styling.png`

#### Step 5.5: Highlighted Trade Visual Treatment
- [ ] Select a trade from the list
- [ ] Verify highlighted markers are 1.5x larger
- [ ] Verify highlighted markers are visually prominent
- [ ] Verify highlight effect is clear but not overwhelming
- [ ] Take screenshot: `30-highlighted-trade-visual.png`

### Part 6: Integration with Existing Features

#### Step 6.1: Equity Curve Chart Compatibility
- [ ] Verify equity curve chart still works when trades are shown on price chart
- [ ] Click a trade marker on the price chart
- [ ] Verify equity curve chart also highlights the same trade
- [ ] Take screenshot: `31-equity-curve-integration.png`

#### Step 6.2: Chart Type Compatibility
- [ ] If chart type can be changed, try switching to Line chart
- [ ] Verify trade markers still work on line chart
- [ ] Try Area chart if available
- [ ] Return to Candlestick chart
- [ ] Take screenshot: `32-chart-type-compatibility.png`

#### Step 6.3: No Interference with Other Chart Elements
- [ ] Verify indicators (if any) still display correctly
- [ ] Verify chart drawings (if any) still work
- [ ] Verify volume bars (if shown) are not obscured
- [ ] Take screenshot: `33-no-interference.png`

### Part 7: Accessibility and Usability

#### Step 7.1: Keyboard Navigation
- [ ] Use Tab key to navigate to "Show Trades on Chart" toggle
- [ ] Press Space or Enter to toggle
- [ ] Verify toggle state changes with keyboard
- [ ] Take screenshot: `34-keyboard-navigation.png`

#### Step 7.2: Responsive Behavior (if applicable)
- [ ] Resize browser window to smaller width
- [ ] Verify chart and markers adapt to smaller size
- [ ] Verify toggle control remains accessible
- [ ] Return to normal size
- [ ] Take screenshot: `35-responsive-behavior.png`

## Success Criteria

All test steps must pass with the following conditions:

1. **Toggle Control**: "Show Trades on Chart" toggle works correctly (on/off)
2. **Marker Rendering**: Trade markers render with correct colors, shapes, and positions
3. **Entry Markers**: Green up arrows for long (below bars), red down arrows for short (above bars)
4. **Exit Markers**: Color-coded by P/L outcome (green for profit, red for loss)
5. **Connecting Lines**: Dashed lines connect entry to exit with correct color (green/red)
6. **Bidirectional Selection**: Clicking marker selects trade in list, clicking trade highlights marker
7. **Filter Integration**: All trade filters (outcome, direction, date range) apply to chart markers
8. **Performance**: Markers render quickly (< 1 second) even with 100 trades
9. **Visual Quality**: Colors, sizes, and positions match specification and style guide
10. **No Errors**: Zero JavaScript console errors during any interaction
11. **Accessibility**: Toggle is keyboard accessible
12. **Integration**: Feature works alongside equity curve and other chart features

## Test Data Requirements

- Backtest with at least 10 trades
- Mix of long (50%) and short (50%) trades
- Mix of winners (50-70%) and losers (30-50%)
- Trades spanning at least 1 month of price data
- At least one very long duration trade (> 1 week)
- At least one very short duration trade (< 1 hour)
- Price data with clear candlestick patterns

## Notes

- Take all 35+ screenshots as specified
- If any step fails, document the failure with description and screenshot
- Check browser console after each major section for warnings/errors
- Test in latest Chrome, Firefox, and Safari if possible
- Report any performance issues if rendering takes > 1 second
- Note any visual inconsistencies or styling issues
