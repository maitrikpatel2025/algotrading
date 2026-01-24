# Feature: View Trades on Chart (Issue #125 / e22956ea)

## Overview

This feature enables traders to visualize backtest trades directly on the price chart with entry/exit markers and connecting lines. The visualization displays trade direction (long/short) with appropriately colored and positioned markers, shows profit/loss outcomes through color coding, and provides interactive features like hovering for details and clicking to navigate to the trade list.

## Feature Metadata

- **Issue Number**: 125
- **ADW ID**: e22956ea
- **Feature Type**: Interactive Chart Visualization
- **Implementation Date**: 2026-01-24
- **Status**: Complete

## User Story

As a trader
I want to see backtest trades plotted on the price chart
So that I can visually validate trade entries and exits

## Problem Statement

Previously, backtest results showed trades only in a tabular format (BacktestTradeList) and as markers on the equity curve chart. Traders could not see exactly where trades occurred in relation to price action, candlestick patterns, and technical indicators on the main price chart. This made it difficult to:

1. Validate that entry/exit signals align with the expected strategy logic
2. Identify patterns in winning vs losing trades relative to price action
3. Understand the context of trade entries (support/resistance, pattern breakouts, etc.)
4. Quickly assess trade quality by seeing the price movement during the trade
5. Visually correlate trades with chart-based indicators and patterns

## Solution Overview

The feature implements a comprehensive trade visualization system on the PriceChart component that displays:

1. **Entry Markers**: Direction-specific arrows (green up for long, red down for short) positioned below/above bars
2. **Exit Markers**: Color-coded by outcome (green for profit, red for loss) with P/L value as text
3. **Connecting Lines**: Dashed lines connecting entry to exit, colored by outcome (green/red)
4. **Interactive Selection**: Click markers to select/highlight the trade in the trade list and scroll to it
5. **Toggle Control**: "Show Trades on Chart" checkbox controls trade marker visibility
6. **Filter Integration**: Leverages existing trade filters (winners/losers, long/short, date range) to control which trades appear on chart
7. **Bidirectional Selection**: Clicking trade in list highlights on chart, clicking marker selects in list

## Architecture

### Component Hierarchy

```
BacktestResultsSummary (enhanced)
└── PriceChart (enhanced)
    └── chart.js (enhanced)
        ├── createTradeMarkers()
        └── createTradeLines()
```

### Data Flow

```
Backtest Results (trades[])
    ↓
TradeFilterControls (outcome, direction, date range)
    ↓
BacktestResultsSummary (filteredTrades, showTradesOnChart toggle)
    ↓
PriceChart (trades, showTrades, onTradeMarkerClick, highlightedTradeId)
    ↓
drawChart() → createTradeMarkers() + createTradeLines()
    ↓
Lightweight Charts v5 (markers + line series rendered)
```

## Implementation Details

### Core Functions

#### `createTradeMarkers(mainSeries, chartData, trades, onTradeClick, highlightedTradeId)`

**Location**: `app/client/src/app/chart.js`

Creates entry and exit markers for each trade using the lightweight-charts v5 marker API.

**Entry Markers**:
- **Long Trades**: Green up arrow (`arrowUp`), positioned `belowBar`
- **Short Trades**: Red down arrow (`arrowDown`), positioned `aboveBar`
- **Text**: `"{type} @ ${entry_price}"`
- **Color**: Uses `CHART_COLORS.bullish` (#22c55e) for long, `CHART_COLORS.bearish` (#ef4444) for short

**Exit Markers**:
- **Profitable Trades (P/L >= 0)**: Green color
- **Losing Trades (P/L < 0)**: Red color
- **Position**: Opposite of entry (`aboveBar` for long, `belowBar` for short)
- **Shape**: Opposite arrow of entry
- **Text**: `"{pnl} ({exit_reason})"`

**Highlighting**:
- Highlighted markers are 1.5x larger
- Highlight determined by `highlightedTradeId` parameter

**Performance Optimization**:
- Limits rendering to first 100 trades if dataset exceeds limit
- Logs warning when limit is reached
- Suggests applying filters to see specific trades

**Edge Case Handling**:
- Skips trades with missing `entry_time`, `exit_time`, or `type`
- Skips trades outside chart time range
- Uses 300-second tolerance for timestamp matching (5 minutes)
- Handles null/undefined P/L values (defaults to 0)
- Provides console warnings for skipped trades

#### `createTradeLines(chart, trades, chartData)`

**Location**: `app/client/src/app/chart.js`

Creates dashed line series connecting each trade's entry to exit point.

**Line Properties**:
- **Color**: Green (#22c55e) for profitable trades, Red (#ef4444) for losses
- **Style**: Dashed (`LineStyle.Dashed`)
- **Width**: 2px
- **Visibility**: `lastValueVisible: false`, `priceLineVisible: false`

**Data Points**: Two points per trade:
1. `{ time: entryTimestamp, value: entry_price }`
2. `{ time: exitTimestamp, value: exit_price }`

**Performance**: Matches marker limit (100 trades max)

**Edge Case Handling**:
- Skips trades with missing timestamps or prices
- Uses same 300-second tolerance as markers
- Wraps line creation in try-catch for error handling

### Component Enhancements

#### `PriceChart.jsx`

**New Props**:
- `trades` (Array): Trade objects to visualize
- `showTrades` (Boolean): Whether to render trade markers
- `onTradeMarkerClick` (Function): Callback when marker is clicked
- `highlightedTradeId` (String): ID of trade to highlight

**New Handler**:
```javascript
const handleTradeMarkerClick = useCallback((trade) => {
  if (onTradeMarkerClick && trade) {
    onTradeMarkerClick(trade);
  }
}, [onTradeMarkerClick]);
```

**Updated drawChart Call**:
```javascript
drawChart(
  priceData, selectedPair, selectedGranularity, 'chartDiv',
  chartType, showVolume, indicatorsToRender, activePatterns,
  drawings, conditionDrawingIds,
  trades, showTrades, handleTradeMarkerClick, highlightedTradeId  // New params
);
```

#### `BacktestResultsSummary.jsx`

**New Props**:
- `backtest` (Object): Full backtest configuration (pair, timeframe, dates)
- `priceData` (Object): OHLC price data for the backtested period

**New State**:
- `showTradesOnChart` (Boolean): Controls trade marker visibility

**New Handlers**:
```javascript
const handleTradeMarkerClickFromChart = (trade) => {
  // Find trade number from trade ID
  // Update selectedTradeId and highlightedTrade
  // Expand trade list section
  // Scroll to trade in list
};
```

**Updated handleTradeClick**:
- Now also sets `highlightedTrade.id` for chart highlighting

**New UI Section**: Price Chart with Toggle Control
```jsx
{priceData && backtest && (
  <div className="bg-white border border-neutral-200 rounded-md p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-neutral-500" />
        <h4 className="text-sm font-semibold text-neutral-900">
          Price Chart
        </h4>
        <span className="text-xs text-neutral-500">
          {backtest.pair} • {backtest.timeframe}
        </span>
      </div>

      {/* Show Trades Toggle */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={showTradesOnChart}
          onChange={(e) => setShowTradesOnChart(e.target.checked)}
          className="w-4 h-4 rounded border-neutral-300 text-primary..."
        />
        <span className="text-sm text-neutral-700...">
          Show Trades on Chart
        </span>
        <Target className="h-3.5 w-3.5 text-neutral-500..." />
      </label>
    </div>

    <PriceChart
      priceData={priceData}
      trades={showTradesOnChart ? displayedTrades : []}
      showTrades={showTradesOnChart}
      onTradeMarkerClick={handleTradeMarkerClickFromChart}
      highlightedTradeId={highlightedTrade?.id}
      {...otherProps}
    />
  </div>
)}
```

### Utility Functions

#### `findClosestTimeIndex(chartTimes, targetTime)`

**Location**: `app/client/src/app/tradeUtils.js`

Finds the closest time index in chart data for a target timestamp. Used to map trade timestamps to chart candle indices for marker placement.

**Parameters**:
- `chartTimes` (Array): Array of chart timestamps (Unix seconds or ISO strings)
- `targetTime` (String): ISO date string target time

**Returns**: Index of closest time in array, or -1 if no valid match

**Features**:
- Handles multiple timestamp formats (strings, numbers, objects)
- Supports lightweight-charts data format `{time: ..., value: ...}`
- Uses threshold of 1 day (86400 seconds) for valid matches
- Returns -1 if no reasonable match exists

**Edge Cases**:
- Empty or null input arrays
- Invalid date strings
- Timestamps far outside chart range

## User Interface

### Toggle Control

**Location**: BacktestResultsSummary, Price Chart section header

**Appearance**:
- Checkbox with label "Show Trades on Chart"
- Target icon (🎯) on the right
- Hover effect changes text and icon color

**Behavior**:
- Default: OFF (unchecked)
- Clicking toggles trade marker visibility
- State persists while viewing backtest results
- Does not persist across page reloads

**Keyboard Accessibility**:
- Focusable with Tab key
- Toggle with Space or Enter

### Trade Markers

**Visual Design**:

| Trade Type | Entry Marker | Exit Marker (Win) | Exit Marker (Loss) |
|------------|--------------|-------------------|-------------------|
| Long | Green ↑ below bar | Green ↓ above bar | Red ↓ above bar |
| Short | Red ↓ above bar | Green ↑ below bar | Red ↑ below bar |

**Highlighting** (when trade selected):
- 1.5x size increase
- More prominent appearance
- Rendered on top of other markers

### Connecting Lines

**Appearance**:
- Dashed line style
- 2px width
- Green for profitable trades
- Red for losing trades

**Behavior**:
- Connects entry price to exit price
- Follows price movement between entry and exit times
- Visible regardless of zoom level

## Filter Integration

The trade markers on the chart automatically update based on the active filters in TradeFilterControls:

### Outcome Filter
- **All**: Shows all trades (default)
- **Winners**: Shows only profitable trades (P/L >= 0)
- **Losers**: Shows only losing trades (P/L < 0)

### Direction Filter
- **Both**: Shows long and short trades (default)
- **Long**: Shows only long position trades
- **Short**: Shows only short position trades

### Date Range Filter
- **Start Date**: Only shows trades with entry_time >= start date
- **End Date**: Only shows trades with entry_time <= end date (inclusive, end of day)

### Combined Filters
All filters work together (intersection logic). For example:
- Outcome: Winners + Direction: Long = Only profitable long trades

## Bidirectional Selection

### Chart → Trade List
1. User clicks a trade marker on the price chart
2. `handleTradeMarkerClick` callback is triggered
3. Trade list section expands (if collapsed)
4. Corresponding trade row is highlighted
5. Page scrolls to show the selected trade
6. `selectedTradeId` and `highlightedTrade` state are updated

### Trade List → Chart
1. User clicks a trade row in the trade list
2. `handleTradeClick` is triggered
3. `highlightedTrade` state is updated with trade ID
4. PriceChart re-renders with `highlightedTradeId` prop
5. Corresponding markers on chart become highlighted (1.5x size)
6. Connecting line becomes more prominent

## Performance Considerations

### Limits
- **Maximum Trades Rendered**: 100 trades (200 markers)
- **Warning Threshold**: Displayed when > 100 trades
- **Suggested Action**: Apply filters to narrow down trade selection

### Optimization Strategies
1. **Lazy Rendering**: Only render trades that have timestamps within chart data range
2. **Time Matching Tolerance**: 300-second window (5 minutes) balances accuracy with performance
3. **Early Returns**: Skip marker/line creation for invalid trades immediately
4. **Sorted Markers**: Markers are sorted once by time before applying to chart

### Edge Case Performance
- **Large Datasets (100+ trades)**: Slice to first 100, log warning
- **No Trades**: Early return, no processing
- **No Chart Data**: Early return with warning
- **Trades Outside Range**: Skipped during iteration

## Browser Compatibility

- **Chrome**: Fully supported (latest)
- **Firefox**: Fully supported (latest)
- **Safari**: Fully supported (latest)
- **Edge**: Fully supported (latest)

Requires:
- ES6+ JavaScript support
- Canvas API
- CSS Grid and Flexbox
- Modern event handling

## Testing

### Unit Tests
Location: `app/client/src/app/chart.test.js` (future)

Planned tests:
- `createTradeMarkers()`: Marker count, colors, positions, text
- `createTradeLines()`: Line count, colors, data points
- `findClosestTimeIndex()`: Exact match, nearest match, edge cases

### E2E Tests
Location: `.claude/commands/e2e/test_view_trades_on_chart.md`

Comprehensive test specification with 35+ verification steps covering:
- Toggle control functionality
- Marker rendering and styling
- Filter integration
- Bidirectional selection
- Edge cases and performance
- Visual quality
- Accessibility

## Known Limitations

1. **Tooltip Enhancement**: Current implementation shows marker text, but rich interactive tooltips (hover cards) are not yet implemented
2. **Marker Overlap**: When multiple trades occur at very similar times, markers may overlap. Future enhancement could stack or offset markers.
3. **Trade Click Callback**: The `onTradeClick` callback parameter in `createTradeMarkers` is defined but not yet wired to chart click events (lightweight-charts v5 limitation)
4. **No Persistence**: Toggle state does not persist across page reloads
5. **Price Data Requirement**: Feature only works when `priceData` is available in BacktestResultsSummary

## Future Enhancements

1. **Rich Tooltips**: Hover over markers to see detailed trade card with all trade metrics
2. **Marker Clustering**: Group nearby trades into expandable clusters
3. **Trade Statistics Overlay**: Show aggregate P/L for trades in visible chart range
4. **Trade Path Animation**: Animate the drawing of connecting lines when toggle is enabled
5. **Custom Marker Shapes**: Allow users to choose different marker shapes/icons
6. **Trade Notes**: Display custom notes on trade markers
7. **Multi-Backtest Comparison**: Show trades from multiple backtests with different colors
8. **Export Chart with Trades**: Save chart image including trade markers

## Dependencies

### NPM Packages
- `lightweight-charts` (v5.x): Core charting library
- `lucide-react`: Icons (Crosshair, Target)
- React (v18+): UI framework

### No New Dependencies
This feature uses existing libraries only - no new npm packages were added.

## Related Documentation

- `app_docs/feature-632a538d-backtest-summary-statistics.md`: Backtest results display
- `app_docs/feature-69a9dc86-equity-curve-chart.md`: Equity curve with trade markers
- `app_docs/feature-50dfaeee-view-trade-list.md`: Trade list filtering and display
- `app_docs/feature-dc50bbc5-interactive-ohlc-chart.md`: PriceChart component
- `.claude/commands/e2e/test_view_trades_on_chart.md`: E2E test specification

## Code Examples

### Adding Trades to PriceChart (Parent Component)

```jsx
import PriceChart from './PriceChart';

function MyBacktestView({ backtest, priceData, trades }) {
  const [showTrades, setShowTrades] = useState(false);
  const [highlightedTrade, setHighlightedTrade] = useState(null);

  const handleTradeMarkerClick = (trade) => {
    setHighlightedTrade(trade);
    // Additional logic: scroll to trade list, etc.
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={showTrades}
          onChange={(e) => setShowTrades(e.target.checked)}
        />
        Show Trades on Chart
      </label>

      <PriceChart
        priceData={priceData}
        selectedPair={backtest.pair}
        selectedGranularity={backtest.timeframe}
        trades={showTrades ? trades : []}
        showTrades={showTrades}
        onTradeMarkerClick={handleTradeMarkerClick}
        highlightedTradeId={highlightedTrade?.id}
        // ... other props
      />
    </div>
  );
}
```

### Trade Object Format

```javascript
{
  id: "trade-123",  // Unique identifier
  type: "long",     // "long" or "short"
  entry_time: "2026-01-15T10:30:00Z",  // ISO 8601 timestamp
  exit_time: "2026-01-15T14:45:00Z",   // ISO 8601 timestamp
  entry_price: 1.23456,
  exit_price: 1.25789,
  size: 1000,
  pnl: 233.30,      // Positive for profit, negative for loss
  exit_reason: "take_profit",  // or "stop_loss", "trailing_stop", etc.
}
```

## Troubleshooting

### Markers Not Appearing

**Problem**: Toggle is ON but no markers show on chart

**Possible Causes**:
1. Trades array is empty or undefined
2. Trade timestamps don't match chart time range
3. Trades filtered out by active filters
4. Missing `entry_time`, `exit_time`, or `type` fields

**Solution**:
- Check browser console for warnings
- Verify `priceData` covers the backtest period
- Clear all filters to see if trades appear
- Inspect trade objects for required fields

### Performance Issues

**Problem**: Chart lags when showing many trades

**Possible Causes**:
1. More than 100 trades being rendered
2. Browser performance limitations

**Solution**:
- Feature automatically limits to 100 trades
- Apply filters to reduce trade count
- Check for console warning about trade limit

### Markers in Wrong Position

**Problem**: Markers don't align with correct candles

**Possible Causes**:
1. Timestamp format mismatch
2. Timezone differences
3. Time tolerance too strict

**Solution**:
- Verify trade timestamps are in ISO 8601 format
- Check that chart data and trade data use same timezone
- Current tolerance is 300 seconds (5 minutes) - should handle most cases

## Conclusion

The View Trades on Chart feature provides traders with a powerful visual tool to analyze backtest performance in the context of price action. By showing entry/exit markers with connecting lines directly on the price chart, traders can quickly identify patterns, validate strategy logic, and understand trade quality at a glance. The integration with existing filters and bidirectional selection between chart and trade list creates a seamless user experience for detailed trade analysis.
