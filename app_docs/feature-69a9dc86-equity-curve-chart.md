# Interactive Equity Curve Chart

**ADW ID:** 69a9dc86
**Date:** 2026-01-22
**Specification:** specs/issue-110-adw-69a9dc86-sdlc_planner-equity-curve-chart.md

## Overview

Enhanced the equity curve visualization with interactive charting capabilities using the lightweight-charts library. The new chart provides traders with professional-grade analytics including interactive zoom/pan controls, drawdown period highlighting, buy-and-hold comparison overlays, rich tooltips showing date/balance/drawdown/trade count, and PNG export functionality. This transforms the basic SVG chart into a comprehensive trading analytics tool.

## What Was Built

- **Interactive Chart Component**: Complete rewrite of EquityCurveChart using lightweight-charts library with 663 lines of enhanced functionality
- **Backend Data Enrichment**: Extended BacktestResultsSummary model with temporal data (equity_curve_dates, trade_counts_per_candle, drawdown_periods)
- **Drawdown Analysis**: Automatic identification and highlighting of drawdown periods during backtest execution
- **Rich Tooltips**: Custom crosshair handler displaying date, balance, drawdown %, and trade count at each point
- **PNG Export**: Chart screenshot download functionality with timestamped filenames
- **E2E Test Suite**: Comprehensive test specification covering all interactive features with 120+ test steps

## Technical Implementation

### Files Modified

- `app/client/src/components/EquityCurveChart.jsx`: Complete rewrite (336 deletions, 663 insertions) to implement interactive chart with lightweight-charts, replacing SVG-based implementation
- `app/server/core/backtest_executor.py`: Added 110 lines including `_identify_drawdown_periods()` method and enhanced equity curve tracking with dates and trade counts
- `app/server/core/data_models.py`: Extended BacktestResultsSummary with 14 lines adding equity_curve_dates, trade_counts_per_candle, and drawdown_periods fields
- `app/server/tests/test_backtest_executor.py`: Added 169 lines of unit tests validating drawdown identification and data field population
- `app/client/src/components/BacktestResultsSummary.jsx`: Updated to pass new data props to EquityCurveChart
- `.claude/commands/e2e/test_equity_curve_chart.md`: Created 271-line E2E test specification

### Key Changes

**Frontend Architecture (EquityCurveChart.jsx)**
- Migrated from static SVG rendering to dynamic lightweight-charts library integration
- Implemented useEffect hooks for chart initialization, cleanup, and responsive resizing
- Created area series for equity curve with gradient fill (green for profit, red for loss)
- Added line series for buy-and-hold comparison with dashed styling
- Built custom crosshair move handler for rich tooltip display with date, balance, drawdown %, and trade count
- Implemented toggle controls for drawdowns and buy-hold overlay visibility
- Added PNG export using chart.takeScreenshot() API with automatic download

**Backend Data Model (data_models.py)**
- Added `equity_curve_dates: Optional[List[str]]` - ISO 8601 timestamps for each equity point
- Added `trade_counts_per_candle: Optional[List[int]]` - Number of trades executed at each candle
- Added `drawdown_periods: Optional[List[Dict[str, Any]]]` - Drawdown periods with start_index, end_index, max_drawdown_pct

**Backend Processing (backtest_executor.py)**
- Implemented `_identify_drawdown_periods()` algorithm tracking peak equity and calculating drawdown percentages
- Extended `_calculate_results_summary()` to extract ISO 8601 dates from candle data
- Added trade count tracking by mapping trade exit times to candle indices
- Ensured backward compatibility by making all new fields optional with None defaults

**Test Coverage**
- Created comprehensive E2E test with 120+ steps covering zoom, pan, tooltips, toggles, export, and edge cases
- Added backend unit tests validating drawdown period identification accuracy
- Verified all interactive features work correctly with different backtest scenarios

## How to Use

### Viewing the Equity Curve Chart

1. Navigate to the Backtest page from the main navigation
2. Select a completed backtest from the Backtest Library
3. The equity curve chart displays in the results section showing:
   - Green area series for profitable backtests
   - Red area series for unprofitable backtests
   - Gray dashed line for buy-and-hold comparison
   - Red arrows/markers indicating drawdown periods

### Interactive Controls

**Zoom Functionality**
- Scroll mouse wheel forward (away from you) to zoom in and see more detail
- Scroll mouse wheel backward (toward you) to zoom out for broader view
- Double-click on chart to reset zoom and fit all content
- Time scale automatically adjusts to show zoomed timeframe

**Pan Functionality**
- Click and hold anywhere on the chart
- Drag left to view later time periods
- Drag right to view earlier time periods
- Time scale updates in real-time during pan

**Tooltip Information**
- Hover over any point on the equity curve
- Tooltip appears showing:
  - **Date**: Human-readable timestamp (e.g., "Jan 15, 2026 14:30")
  - **Balance**: Current equity formatted as currency (e.g., "$10,543.87")
  - **Drawdown**: Percentage below peak equity (e.g., "5.32%", or "0.00%" at peak)
  - **Trades**: Number of trades executed at that candle
  - **Buy & Hold**: Benchmark balance when overlay is enabled
- Tooltip automatically positions to avoid going off-screen

### Toggle Controls

**Drawdowns Toggle**
- Click "Drawdowns" button (eye icon) to hide/show drawdown period markers
- Active state: Button highlighted, red drawdown markers visible
- Inactive state: Button dimmed, drawdown markers hidden
- Useful for focusing on pure equity movement without visual noise

**Buy & Hold Toggle**
- Click "Buy & Hold" button (trending up icon) to hide/show benchmark comparison
- Active state: Button highlighted, gray dashed line visible
- Inactive state: Button dimmed, comparison line hidden
- Enables direct comparison of strategy performance vs. passive holding

### Export Chart as PNG

1. Click "Export PNG" button (download icon) in chart controls
2. PNG file automatically downloads with filename format: `equity-curve-YYYY-MM-DD.png`
3. Chart exports at high quality suitable for reports and presentations
4. Export preserves current view state including active toggles

## Configuration

No configuration required. The chart automatically:
- Adapts to available screen width (responsive design)
- Uses Precision Swiss Design System colors from tailwind.config.js
- Handles missing optional data gracefully (dates, trade counts, drawdown periods)
- Scales appropriately for datasets from 2 to 10,000+ data points

## Testing

### Backend Tests
```bash
cd app/server && uv run pytest tests/test_backtest_executor.py -v
```

Tests validate:
- Drawdown period identification algorithm accuracy
- Equity curve dates array matches equity values length
- Trade counts per candle tracking correctness
- All fields serialize properly to JSON

### Frontend Build
```bash
cd app/client && npm run build
```

Validates no TypeScript/ESLint errors in enhanced component.

### E2E Tests
Execute the comprehensive E2E test specification:
```
Read and run: .claude/commands/e2e/test_equity_curve_chart.md
```

Covers 120+ test steps including zoom, pan, drawdown toggle, buy-hold overlay, tooltip accuracy, PNG export, responsiveness, performance, and edge cases.

## Notes

### Performance Optimization
- Chart performs smoothly with 1000+ equity curve points
- Tooltip updates use lightweight-charts native crosshair handler (no custom throttling needed)
- Chart cleanup properly disposes instance on component unmount to prevent memory leaks

### Backward Compatibility
- All new data fields (equity_curve_dates, trade_counts_per_candle, drawdown_periods) are optional
- Chart gracefully falls back if new fields are missing from older backtests
- Empty arrays provided as defaults in BacktestResultsSummary integration

### Design System Compliance
- Matches Precision Swiss Design System with neutral gray background (#fafafa)
- Uses semantic colors: green (#22c55e) for profit, red (#ef4444) for loss/drawdowns
- Control buttons styled with consistent spacing and hover states
- Chart maintains professional appearance across different viewport sizes

### Drawdown Calculation
- Drawdown periods identified on backend for accuracy and consistency
- Algorithm tracks peak equity and calculates percentage below peak
- Only records drawdowns > 0.01% to filter out negligible fluctuations
- Handles edge case where backtest ends during drawdown period

### Responsive Behavior
- Chart automatically resizes on window resize events
- Maintains readability on tablet screen sizes (1024px and below)
- Controls remain accessible without overlap at smaller widths

### Export Functionality
- Uses lightweight-charts built-in takeScreenshot() API
- Generates PNG at chart's current rendered dimensions
- Filename includes timestamp for easy organization
- Toast notification confirms successful export (implementation detail varies)

### Limitations and Future Enhancements
- Maximum zoom level limited by lightweight-charts to prevent rendering issues
- Export resolution determined by chart container size (responsive to viewport)
- Tooltip shows single-candle trade count (trades executed at that specific candle)
- Consider adding annotation features for marking significant events in future iterations
