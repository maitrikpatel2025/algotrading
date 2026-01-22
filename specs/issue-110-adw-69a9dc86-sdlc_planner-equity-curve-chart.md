# Feature: View Equity Curve Chart

## Metadata
issue_number: `110`
adw_id: `69a9dc86`
issue_json: `{"number":110,"title":"feature View Equity Curve Chart US-BT-010","body":"/feature\n\nadw_sdlc_iso.py\n\nView Equity Curve Chart\n want to see a visual equity curve of my backtest resultsSo that I can understand how my account balance changed over time\nAcceptance Criteria:\n\t∙\tLine chart showing account balance over time\n\t∙\tDrawdown periods shaded in red\n\t∙\tToggle to show/hide drawdown visualization\n\t∙\tOverlay option: Buy-and-hold comparison line\n\t∙\tZoom and pan capabilities\n\t∙\tHover shows: Date, Balance, Drawdown %, Trade count\n\t∙\tExport chart as PNG"}`

## Feature Description

Enhance the existing equity curve visualization with interactive charting capabilities using the lightweight-charts library. The enhanced chart will provide traders with deep insights into backtest performance through visual equity curve analysis, drawdown period highlighting, buy-and-hold comparison overlays, interactive zoom/pan controls, detailed hover tooltips showing date/balance/drawdown/trade count, and PNG export functionality. This transforms the basic SVG chart into a professional-grade trading analytics tool.

## User Story

As a trader
I want to see a visual equity curve of my backtest results
So that I can understand how my account balance changed over time

## Problem Statement

The current equity curve chart in the BacktestResultsSummary component uses a simple SVG implementation that lacks the interactivity and detailed information traders need to properly analyze backtest performance. Traders cannot zoom into specific time periods, cannot clearly see when drawdown periods occurred, and have limited information in hover tooltips. There is also no way to export the chart for reports or sharing. This limits the usefulness of the backtest results visualization for making informed trading decisions.

## Solution Statement

Replace the existing SVG-based EquityCurveChart component with an enhanced version using the lightweight-charts library (already installed in the project). The new chart will provide:

1. **Interactive Chart**: Full zoom and pan capabilities using mouse wheel and drag
2. **Drawdown Visualization**: Red shaded areas highlighting drawdown periods with toggle control
3. **Buy-and-Hold Overlay**: Optional comparison line showing benchmark performance
4. **Rich Tooltips**: Hover information including date, balance, drawdown %, and trade count at that point
5. **Export Functionality**: PNG export button for saving charts to reports
6. **Professional Appearance**: Match the Precision Swiss Design System styling used throughout the app

The solution leverages the existing equity curve data structure from the backend and enhances the frontend presentation without requiring backend changes.

## Relevant Files

Use these files to implement the feature:

- `app/client/src/components/EquityCurveChart.jsx` - Current SVG-based equity curve chart component that will be completely rewritten to use lightweight-charts with interactive features
- `app/client/src/components/BacktestResultsSummary.jsx` - Parent component that renders the equity curve chart, will need minor updates to pass additional data (dates, drawdowns, trade counts)
- `app/client/src/pages/BacktestConfiguration.jsx` - Page that displays backtest results, already passes results data to BacktestResultsSummary
- `app/client/package.json` - Contains lightweight-charts dependency (already installed at version ^5.1.0)
- `app/server/core/backtest_executor.py` - Backend executor that generates equity curve data, may need to include additional fields (dates array, trade count per candle) in the results
- `app/server/core/data_models.py` - Contains BacktestResultsSummary model, may need to add fields for dates, trade counts, and drawdown periods
- `app/client/src/lib/utils.js` - Utility functions for className merging (cn helper)
- `app/client/tailwind.config.js` - Tailwind configuration for design system colors

### New Files

- `.claude/commands/e2e/test_equity_curve_chart.md` - E2E test specification for validating the interactive equity curve chart features including zoom, pan, drawdown toggle, buy-and-hold overlay, tooltips, and PNG export

Read `.claude/commands/test_e2e.md` to understand how to create an E2E test file, and review `.claude/commands/e2e/test_backtest_summary_statistics.md` as a reference for testing backtest-related features.

## Implementation Plan

### Phase 1: Foundation
Extend the backend data model to include temporal information (dates/timestamps) and per-candle trade counts in the equity curve data. Update the backtest executor to track and return this additional information alongside the existing equity curve values. This provides the foundation for rich tooltips showing date and trade count.

### Phase 2: Core Implementation
Completely rewrite the EquityCurveChart component using lightweight-charts library. Implement the base chart with equity curve line, zoom/pan capabilities, and hover tooltips showing date, balance, drawdown %, and trade count. Add drawdown period highlighting with a toggle control. Implement buy-and-hold comparison overlay with a toggle control. Add PNG export button using chart.takeScreenshot() API.

### Phase 3: Integration
Integrate the enhanced chart into BacktestResultsSummary and ensure proper data flow from the backend through the component hierarchy. Test the complete flow from backtest execution through results display. Create E2E tests to validate all interactive features work correctly. Ensure the chart matches the Precision Swiss Design System styling and responds properly to different viewport sizes.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Extend Backend Data Model

- Read `app/server/core/data_models.py` to understand the BacktestResultsSummary model structure
- Add optional fields to BacktestResultsSummary:
  - `equity_curve_dates: Optional[List[str]]` - ISO 8601 date strings for each equity curve point
  - `trade_counts_per_candle: Optional[List[int]]` - Number of trades executed at each candle
  - `drawdown_periods: Optional[List[Dict[str, Any]]]` - List of drawdown periods with start_index, end_index, max_drawdown_pct
- Update the docstring to document these new fields

### Extend Backend Equity Curve Tracking

- Read `app/server/core/backtest_executor.py` focusing on the equity curve tracking and statistics calculation logic
- In the `_run_backtest_logic` method, extend equity curve tracking to include:
  - Track the date/timestamp for each equity curve point
  - Track the number of trades executed at each candle/equity point
  - Identify drawdown periods by finding sequences where equity is below the previous peak
  - Calculate drawdown percentage for each drawdown period
- Ensure the dates are formatted as ISO 8601 strings for JSON serialization
- Store these arrays in the results dictionary before saving to database

### Write Backend Unit Tests

- Create or update `app/server/tests/test_backtest_executor.py`
- Add test cases to verify:
  - Equity curve dates array matches equity curve values array in length
  - Trade counts per candle array matches equity curve length
  - Drawdown periods are correctly identified (start/end indices, max drawdown %)
  - All arrays serialize properly to JSON
- Run tests: `cd app/server && uv run pytest tests/test_backtest_executor.py -v`

### Create Enhanced EquityCurveChart Component

- Read `app/client/src/components/EquityCurveChart.jsx` to understand current implementation and props interface
- Create a backup copy or completely replace the component with a new implementation
- Import lightweight-charts: `import { createChart } from 'lightweight-charts'`
- Implement component state:
  - `showDrawdowns: boolean` - Toggle for drawdown visualization
  - `showBuyHold: boolean` - Toggle for buy-and-hold overlay
  - `chartRef: useRef` - Reference to chart container div
  - `chartInstance: useRef` - Reference to lightweight-charts instance
- Initialize chart in useEffect:
  - Create chart with createChart() using chartRef
  - Configure chart options (colors, layout, grid, crosshair, time scale, price scale)
  - Create area series for equity curve with gradient fill
  - Create line series for buy-and-hold overlay (optional, dashed style)
  - Add drawdown shaded rectangles using createPriceLine or markers (if showDrawdowns is true)
  - Set up custom tooltip handler to show date, balance, drawdown %, trade count on hover
- Implement cleanup in useEffect return to properly dispose chart instance
- Add control buttons:
  - "Toggle Drawdowns" button with icon
  - "Toggle Buy & Hold" button with icon
  - "Export PNG" button that calls chartInstance.current.takeScreenshot()
- Style the component using Tailwind classes matching the Precision Swiss Design System
- Add proper TypeScript/JSDoc prop documentation

### Implement Tooltip Customization

- Within the EquityCurveChart component, implement a custom crosshair move handler
- On crosshair move, extract:
  - Date from the time series point
  - Balance from the equity curve series value
  - Find the corresponding drawdown % at that point (interpolate from drawdown_periods)
  - Find the trade count at that index from trade_counts_per_candle
- Render a custom tooltip div positioned near the crosshair showing:
  - Date: formatted as "MMM DD, YYYY HH:mm" or similar
  - Balance: formatted as currency with $ prefix and 2 decimals
  - Drawdown: formatted as percentage with 2 decimals (show "0.00%" if at peak)
  - Trades: integer count
- Style the tooltip with white background, border, shadow, and proper positioning to avoid going off-screen

### Implement PNG Export Functionality

- Add an "Export Chart" button in the chart controls area
- Import an export/download icon from lucide-react (e.g., Download icon)
- On button click, call `chartInstance.current.takeScreenshot()` which returns a canvas
- Convert the canvas to a data URL: `canvas.toDataURL('image/png')`
- Create a temporary anchor element with download attribute
- Set href to the data URL and download filename to `equity-curve-${backtestName}-${timestamp}.png`
- Trigger click on the anchor to download the file
- Show a toast notification confirming successful export
- Handle errors gracefully with error toast

### Implement Drawdown Period Highlighting

- Parse the `drawdown_periods` array from props
- For each drawdown period:
  - Use the start_index and end_index to determine the time range
  - Use lightweight-charts createPriceLine() or markers API to add red shaded areas
  - Alternatively, use background shading by adding a colored area series
- Ensure the drawdown highlighting is only visible when `showDrawdowns` is true
- Update the highlighting when the toggle state changes
- Add subtle animation/transition when toggling drawdowns on/off

### Update BacktestResultsSummary Integration

- Read `app/client/src/components/BacktestResultsSummary.jsx`
- Update the EquityCurveChart usage to pass the new props:
  - `equityCurveDates={results.equity_curve_dates || []}`
  - `tradeCountsPerCandle={results.trade_counts_per_candle || []}`
  - `drawdownPeriods={results.drawdown_periods || []}`
- Ensure backward compatibility by providing empty array defaults if fields are missing
- Test that the chart renders correctly with and without the new data fields

### Create E2E Test Specification

- Read `.claude/commands/test_e2e.md` to understand E2E test format and structure
- Read `.claude/commands/e2e/test_backtest_summary_statistics.md` as a reference example
- Create `.claude/commands/e2e/test_equity_curve_chart.md` with the following sections:
  - User Story: As a trader, I want to interact with the equity curve chart to analyze my backtest performance
  - Prerequisites: At least one completed backtest with results available
  - Test Steps covering:
    - Navigate to backtest results page
    - Verify equity curve chart is visible
    - Test zoom functionality (mouse wheel and drag)
    - Test pan functionality (click and drag)
    - Toggle drawdown visualization and verify red shaded areas appear/disappear
    - Toggle buy-and-hold overlay and verify comparison line appears/disappears
    - Hover over different points and verify tooltip shows date, balance, drawdown %, trade count
    - Click export button and verify PNG file downloads
    - Take screenshots at each major step
  - Success Criteria: All interactive features work correctly, chart is visually polished, export generates valid PNG file

### Frontend Build Validation

- Run the frontend build to ensure no compilation errors: `cd app/client && npm run build`
- Fix any TypeScript/ESLint errors that arise
- Verify the bundle size hasn't increased excessively (lightweight-charts is already installed)

### Manual Testing and Refinement

- Start the application: `./scripts/start.sh`
- Navigate to a completed backtest in the Backtest Configuration page
- Manually test all interactive features:
  - Zoom in/out using mouse wheel
  - Pan left/right by dragging
  - Toggle drawdowns on/off
  - Toggle buy-and-hold comparison on/off
  - Hover over various points and verify tooltip accuracy
  - Export chart as PNG and verify file quality
- Verify responsive behavior on different screen sizes
- Ensure chart matches the Precision Swiss Design System aesthetic

### Execute Validation Commands

- Read `.claude/commands/test_e2e.md`
- Read and execute the new E2E test file `.claude/commands/e2e/test_equity_curve_chart.md`
- Verify all E2E test steps pass
- Review screenshots to confirm visual correctness
- Run backend tests: `cd app/server && uv run pytest tests/test_backtest_executor.py -v`
- Run frontend build: `cd app/client && npm run build`

## Testing Strategy

### Unit Tests

- **Backend Tests** (`test_backtest_executor.py`):
  - Test equity curve dates array generation
  - Test trade counts per candle tracking
  - Test drawdown period identification algorithm
  - Test that arrays are correctly serialized in BacktestResultsSummary
- **Frontend Tests** (optional component tests):
  - Test EquityCurveChart renders without crashing
  - Test toggle states (drawdowns, buy-and-hold) update UI correctly
  - Test export button triggers download

### Edge Cases

- **Empty/Incomplete Data**:
  - Chart handles missing equity_curve_dates gracefully
  - Chart handles missing trade_counts_per_candle gracefully
  - Chart handles missing drawdown_periods gracefully
  - Display appropriate fallback message if equity curve has < 2 points
- **Performance**:
  - Chart performs well with 1000+ equity curve points
  - Zoom/pan operations remain smooth with large datasets
  - Tooltip updates without lag during crosshair movement
- **Export Edge Cases**:
  - Export works on different browsers (Chrome, Firefox, Safari)
  - Export generates valid PNG with proper dimensions
  - Error handling if takeScreenshot() fails
- **Responsive Design**:
  - Chart resizes properly on window resize
  - Chart is usable on tablet screen sizes (1024px and below)
  - Controls don't overlap or become unusable on smaller screens
- **Drawdown Highlighting**:
  - Handles backtests with zero drawdown periods
  - Handles backtests with one continuous drawdown
  - Correctly identifies multiple distinct drawdown periods
- **Tooltip Positioning**:
  - Tooltip doesn't go off-screen on left/right edges
  - Tooltip doesn't overlap with chart controls

## Acceptance Criteria

- Line chart displays account balance over time using lightweight-charts library
- Drawdown periods are shaded in red and can be toggled on/off with a button
- Buy-and-hold comparison line can be toggled on/off with a button
- Chart supports zoom functionality using mouse wheel (zoom in/out)
- Chart supports pan functionality using click and drag
- Hovering over any point shows a tooltip with:
  - Date in readable format (e.g., "Jan 15, 2026 14:30")
  - Balance formatted as currency (e.g., "$10,543.87")
  - Drawdown percentage at that point (e.g., "5.32%")
  - Number of trades executed at that candle (e.g., "2 trades")
- Export button generates and downloads the chart as a PNG file
- Chart matches the Precision Swiss Design System styling (colors, fonts, spacing)
- Chart is responsive and works on desktop and tablet screen sizes
- All existing functionality in BacktestResultsSummary continues to work
- Chart performance is smooth with large datasets (1000+ points)

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

Read `.claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_equity_curve_chart.md` test file to validate this functionality works.

- `cd app/server && uv run pytest tests/test_backtest_executor.py -v` - Run backend tests to validate equity curve data generation with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

- The lightweight-charts library is already installed in the project at version ^5.1.0, so no additional dependencies need to be added
- The existing EquityCurveChart component uses a simple SVG implementation; this feature will completely replace it with a much more advanced implementation
- Consider using `html2canvas` or chart.takeScreenshot() API from lightweight-charts for PNG export - the library may have built-in export capabilities
- Drawdown periods should be calculated on the backend to ensure accuracy and avoid duplicating calculation logic on the frontend
- The chart should automatically resize when the window is resized using a resize observer or window resize event listener
- For optimal performance, consider throttling/debouncing the tooltip update handler if it causes performance issues
- The buy-and-hold curve already exists in the results data, so no backend changes are needed for that overlay
- Ensure the chart's time scale properly handles the date format from the backend (ISO 8601 strings)
- Consider adding a loading state while the chart initializes to prevent layout shift
- The Precision Swiss Design System uses specific color values defined in tailwind.config.js - reference these for consistency
- If lightweight-charts doesn't support area shading for drawdowns natively, consider using background color rectangles or creative use of multiple series
- The export functionality should preserve the chart quality and dimensions suitable for inclusion in reports (at least 1200px wide recommended)
