# Feature: Interactive OHLC Candlestick Chart for Strategy Builder

## Metadata
issue_number: `30`
adw_id: `dc50bbc5`
issue_json: `{"number":30,"title":"Feature Interactive OHLC Candlestick Chart for Strategy Builder","body":"\nadw_sdlc_iso\n\n/feature\n\nAdd an interactive candlestick chart as the central visualization component in the Strategy page, allowing traders to analyze price action for selected currency pairs and timeframes. The chart integrates with the existing `/api/prices/{pair}/{granularity}/{count}` endpoint and renders within the `PriceChart.jsx` component using Plotly.js for high-performance charting.\n\nImplementation details:\n* Add candlestick chart container in the `Strategy.jsx` page, positioned as the primary content area (xl:col-span-2) alongside the technicals sidebar\n* Trigger chart rendering when user clicks \"Load Data\" button after selecting currency pair and timeframe from dropdowns\n* Fetch OHLC data via `endPoints.prices(pair, granularity, count)` API call, which returns `{time, mid_o, mid_h, mid_l, mid_c}` arrays\n* Process price data through `drawChart()` function in `app/chart.js` to configure Plotly candlestick trace with color-coding (green=#22c55e for bullish where close > open, red=#ef4444 for bearish)\n* Render interactive Plotly chart with zoom, pan, and hover tooltips showing OHLC values for each candle\n* Display loading spinner during data fetch; show success state with rendered chart or error toast on failure\n\nThe chart component should handle:\n* Performance optimization for up to 1000 candles (lazy rendering, WebGL acceleration via Plotly scattergl fallback)\n* Auto-scaling Y-axis to fit visible price range with 2% padding above/below extremes\n* X-axis time formatting based on granularity (HH:MM for intraday, MM-DD for daily+)\n* Empty state with centered message \"Select a currency pair and timeframe, then click Load Data\" when `priceData` is null\n* Responsive container sizing via `min-h-[500px]` with dynamic height `calc(100vh - 450px)`\n\nLoading states must show skeleton placeholder during fetch; errors display dismissible alert with retry option; chart controls (type selector, candle count, volume toggle, date range) remain accessible above chart area.\n\nCan you make sure please to follow the style guide MD for UI\n\n"}`

## Feature Description
This feature adds an interactive OHLC (Open-High-Low-Close) candlestick chart to the Strategy page of the Forex Trading Dashboard. The chart will serve as the central visualization component, allowing traders to analyze price action patterns for selected currency pairs across different timeframes. The implementation leverages the existing `/api/prices/{pair}/{granularity}/{count}` backend endpoint and renders high-performance interactive charts using Plotly.js within the existing `PriceChart.jsx` component.

The chart provides comprehensive trading analysis capabilities including multiple chart types (candlestick, OHLC, line, area), volume indicators, quick date range selection, and interactive features like zoom, pan, and hover tooltips. All UI components follow the established style guide to maintain visual consistency across the application.

## User Story
As a forex trader
I want to view interactive candlestick charts with customizable timeframes and chart types
So that I can analyze price action patterns, identify trading opportunities, and make informed trading decisions based on visual technical analysis

## Problem Statement
Currently, the Strategy page has the infrastructure for displaying price charts (PriceChart.jsx component, chart.js rendering logic, API endpoints) but lacks a fully integrated and feature-rich candlestick visualization. Traders need an interactive chart that displays OHLC data with professional-grade features like multiple chart types, volume indicators, date range selection, and smooth performance even with large datasets (up to 1000 candles).

The existing implementation has the foundation in place but requires:
1. Enhanced integration between the Strategy page and PriceChart component
2. Robust chart rendering with Plotly.js candlestick traces
3. Loading states, error handling, and empty states
4. Performance optimization for large datasets
5. UI consistency with the established style guide

## Solution Statement
Enhance the existing PriceChart.jsx component and chart.js rendering logic to provide a complete, production-ready interactive candlestick chart. The solution builds on the existing codebase structure:

1. **Chart Rendering**: Utilize the existing `drawChart()` function in `app/chart.js` with Plotly.js to render candlestick, OHLC, line, and area charts with proper color-coding (green for bullish, red for bearish)

2. **Data Flow**: Leverage the existing API integration (`endPoints.prices(pair, granularity, count)`) to fetch OHLC data and pass it through to the chart renderer

3. **UI Enhancement**: Implement loading skeletons, error alerts, and empty states in the PriceChart component while following the UI style guide

4. **Performance**: Optimize rendering for up to 1000 candles with auto-scaling Y-axis (2% padding) and responsive X-axis time formatting

5. **Interactive Features**: Enable zoom, pan, hover tooltips, chart type switching, volume toggle, and date range quick selection

The implementation maintains the existing architecture where Strategy.jsx manages state and coordinates between the pair/timeframe selectors and the PriceChart component, which handles all chart-specific rendering and interactions.

## Relevant Files
Use these files to implement the feature:

- **app/client/src/pages/Strategy.jsx** - Main Strategy page component that manages state for selectedPair, selectedGran, priceData, and coordinates between selectors and the chart. Already has the infrastructure for loading data and handling errors. Need to ensure proper integration with enhanced PriceChart component.

- **app/client/src/components/PriceChart.jsx** - Chart component that receives priceData and renders via drawChart(). Currently supports chart type selector, candle count selector, volume toggle, and date range buttons. Need to ensure all UI elements follow style guide and handle loading/error states properly.

- **app/client/src/app/chart.js** - Contains drawChart() function that uses Plotly.js to render charts. Already supports candlestick, OHLC, line, and area chart types with proper color-coding. Implements volume traces, auto-scaling, crosshair effects, and responsive configuration. May need minor refinements for performance optimization.

- **app/client/src/app/api.js** - API client with endPoints.prices(pair, granularity, count) method that fetches OHLC data from backend. Already configured with error interceptors and proper handling.

- **app/client/src/app/data.js** - Contains COUNTS, CHART_TYPES, DATE_RANGES constants and calculateCandleCount() utility function for date range calculations.

- **app/server/server.py** - Backend FastAPI server with `/api/prices/{pair}/{granularity}/{count}` endpoint that returns `{time, mid_o, mid_h, mid_l, mid_c}` arrays.

- **ai_docs/ui_style_guide.md** - Comprehensive UI style guide with color system, typography, spacing, component guidelines, and trading-specific patterns. All UI implementations must follow this guide.

- **.claude/commands/test_e2e.md** - E2E test runner documentation that explains how to structure and execute end-to-end tests using Playwright browser automation.

- **.claude/commands/e2e/test_trading_dashboard.md** - Existing E2E test for Strategy page functionality showing test structure and success criteria.

- **.claude/commands/e2e/test_advanced_chart.md** - Existing E2E test for advanced chart features (chart types, volume, date ranges) showing expected behavior.

### New Files

- **.claude/commands/e2e/test_candlestick_chart.md** - New E2E test file to validate the interactive OHLC candlestick chart functionality with all features working correctly.

## Implementation Plan

### Phase 1: Foundation
The existing codebase already has strong foundations in place:
- PriceChart.jsx component with chart type selector, volume toggle, and date range buttons
- chart.js with drawChart() function supporting multiple chart types via Plotly.js
- Strategy.jsx with state management and API integration
- Backend endpoint `/api/prices/{pair}/{granularity}/{count}` returning OHLC data
- UI style guide defining colors, typography, and component patterns

This phase focuses on auditing the existing implementation against requirements, identifying gaps, and ensuring all components properly follow the style guide before enhancements.

### Phase 2: Core Implementation
Enhance the chart rendering and UI components to meet all feature requirements:
- Refine chart.js drawChart() function for optimal performance with up to 1000 candles
- Implement loading skeleton states in PriceChart.jsx following style guide patterns
- Add empty state UI with proper messaging and styling
- Enhance error handling UI with dismissible alerts and retry options
- Ensure all chart controls (type selector, count, volume, date range) are styled per style guide
- Optimize Plotly configuration for responsive sizing, auto-scaling, and smooth interactions
- Validate color-coding (green=#22c55e bullish, red=#ef4444 bearish) matches style guide
- Ensure proper X-axis time formatting (HH:MM for intraday, MM-DD for daily+)

### Phase 3: Integration
Complete end-to-end integration and validation:
- Verify Strategy.jsx properly orchestrates data flow to PriceChart component
- Test all interactive features (zoom, pan, hover tooltips, chart type switching)
- Validate performance with maximum 1000 candles across all chart types
- Test error scenarios and ensure proper error UI display
- Verify responsive behavior across different screen sizes
- Create comprehensive E2E test file validating all functionality
- Execute E2E tests to confirm feature works as expected
- Run full test suite to ensure zero regressions

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Audit Existing Implementation
- Read and analyze Strategy.jsx to understand current state management and data flow
- Read and analyze PriceChart.jsx to understand current UI structure and chart integration
- Read and analyze chart.js to understand Plotly configuration and rendering logic
- Document any gaps between current implementation and feature requirements
- Verify API endpoint `/api/prices/{pair}/{granularity}/{count}` returns correct data structure

### Step 2: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test structure and requirements
- Read `.claude/commands/e2e/test_trading_dashboard.md` and `.claude/commands/e2e/test_advanced_chart.md` as reference examples
- Create `.claude/commands/e2e/test_candlestick_chart.md` with comprehensive test steps covering:
  - Initial load and empty state verification
  - Currency pair and timeframe selection
  - Chart rendering with candlestick data
  - All chart type switches (candlestick, OHLC, line, area)
  - Volume toggle on/off verification
  - Date range button functionality (1D, 5D, 1M, 3M, 6M, YTD, 1Y, All)
  - Interactive features (zoom, pan, hover tooltips)
  - Loading states during data fetch
  - Error handling and retry scenarios
  - Responsive behavior
  - Performance with maximum candle count

### Step 3: Enhance Loading States in PriceChart Component
- Open PriceChart.jsx and add loading skeleton state when priceData is loading
- Follow ai_docs/ui_style_guide.md section on "Loading States" and "Skeleton" component
- Implement skeleton placeholder for chart area with proper dimensions (min-h-[500px])
- Ensure loading skeleton matches the overall card design and style guide

### Step 4: Implement Empty State UI
- In PriceChart.jsx, add empty state when priceData is null
- Display centered message: "Select a currency pair and timeframe, then click Load Data"
- Follow style guide for empty state design (icon, heading, description pattern)
- Use appropriate spacing and typography per style guide

### Step 5: Enhance Error Handling UI
- In Strategy.jsx, verify error state UI follows style guide
- Ensure error alerts are dismissible with proper close button
- Add retry option if not present
- Follow style guide for destructive/error states (border-destructive, bg-destructive/10)
- Use AlertTriangle icon and proper text hierarchy

### Step 6: Refine Chart Rendering in chart.js
- Open chart.js and review drawChart() function
- Verify candlestick colors match style guide: green=#22c55e (bullish), red=#ef4444 (bearish)
- Confirm auto-scaling Y-axis with appropriate padding for visible price range
- Ensure X-axis time formatting adjusts based on granularity (HH:MM for intraday, MM-DD for daily+)
- Optimize Plotly configuration for performance with up to 1000 candles
- Verify responsive container sizing works with min-h-[500px] and calc(100vh - 450px)
- Test hover tooltips display correct OHLC values for each candle

### Step 7: Validate Chart Controls Styling
- In PriceChart.jsx, verify chart type selector follows style guide
- Verify candle count selector styling matches style guide
- Verify volume toggle button uses proper colors and states per style guide
- Verify date range buttons follow style guide button patterns
- Ensure all controls have proper spacing, typography, and responsive behavior
- Check accessibility (ARIA labels, keyboard navigation, focus states)

### Step 8: Test All Chart Types
- Manually test or write unit tests for candlestick chart rendering
- Test OHLC chart rendering
- Test line chart rendering
- Test area chart rendering
- Verify each chart type displays correct data and follows color scheme
- Ensure smooth transitions between chart types

### Step 9: Test Volume Indicator
- Test volume toggle on/off functionality
- Verify volume bars appear below main price chart when enabled
- Verify volume bars use correct color-coding (bullish vs bearish)
- Test that volume subplot sizing is appropriate and doesn't crowd main chart
- Verify volume data source (actual volume or proxy from price range)

### Step 10: Test Date Range Functionality
- Test each date range button (1D, 5D, 1M, 3M, 6M, YTD, 1Y, All)
- Verify calculateCandleCount() function returns appropriate candle counts
- Verify chart updates with correct amount of historical data
- Test that selecting a date range properly highlights the active button

### Step 11: Test Interactive Features
- Test zoom functionality (mouse wheel, zoom controls)
- Test pan functionality (drag to pan chart)
- Test hover tooltips show correct OHLC values
- Test double-click to reset zoom
- Verify crosshair spike lines appear on hover
- Test that all interactions are smooth and responsive

### Step 12: Performance Testing
- Load chart with maximum 1000 candles
- Verify rendering performance is acceptable (< 1 second)
- Test responsiveness of interactions with large dataset
- Monitor browser console for any performance warnings
- Test across different chart types with 1000 candles

### Step 13: Responsive Design Validation
- Test chart rendering on mobile viewport (< 640px)
- Test chart rendering on tablet viewport (640px - 1024px)
- Test chart rendering on desktop viewport (> 1024px)
- Verify all controls remain accessible and usable on small screens
- Verify chart sizing adapts appropriately to container width

### Step 14: Integration Testing with Strategy Page
- Test complete user flow: select pair → select granularity → click Load Data → chart renders
- Verify loading states appear during API call
- Verify error states appear if API fails
- Test changing pair/granularity and reloading data
- Verify chart updates properly when priceData changes
- Test integration with Technicals sidebar component

### Step 15: Run E2E Test
- Read `.claude/commands/test_e2e.md` to understand execution process
- Execute the E2E test file `.claude/commands/e2e/test_candlestick_chart.md` following the test runner instructions
- Verify all test steps pass successfully
- Review screenshots captured during test execution
- If any test fails, fix the issue and re-run the test

### Step 16: Execute Validation Commands
- Run all validation commands listed in the Validation Commands section below
- Execute E2E test for candlestick chart functionality
- Run server tests with `cd app/server && uv run pytest`
- Run frontend build with `cd app/client && npm run build`
- Verify all commands execute without errors
- Fix any issues discovered during validation

## Testing Strategy

### Unit Tests
- **Chart Rendering Tests**: Test drawChart() function with various data inputs
  - Test candlestick trace creation with valid OHLC data
  - Test OHLC trace creation
  - Test line trace creation
  - Test area trace creation
  - Test volume trace creation with and without actual volume data

- **Data Processing Tests**: Test calculateCandleCount() function
  - Test with each date range (1D, 5D, 1M, 3M, 6M, YTD, 1Y, All)
  - Test with different granularities (M5, M15, H1, H4, D)
  - Verify calculated counts are within min (10) and max (1000) bounds

- **API Integration Tests**: Test endPoints.prices() calls
  - Mock successful API responses
  - Mock API error responses
  - Verify error handling and retry logic

### Edge Cases
- **Empty/Null Data**: Chart handles null or empty priceData gracefully with empty state
- **Single Candle**: Chart renders correctly with minimal data (1-5 candles)
- **Maximum Candles**: Chart performs well with 1000 candles
- **Invalid Data**: Chart handles malformed data (missing fields, invalid values) without crashing
- **API Timeout**: Loading state persists appropriately, error UI displays after timeout
- **Network Error**: Offline state shows appropriate error message with retry option
- **Rapid Chart Type Switching**: No visual glitches or performance degradation when quickly switching chart types
- **Zoom Extremes**: Chart handles maximum zoom in/out without breaking layout
- **Narrow Viewports**: Chart controls remain accessible on small screens (mobile)
- **Missing Volume Data**: Volume indicator works with proxy volume calculation when actual volume unavailable
- **Zero or Negative Prices**: Chart handles unusual price data gracefully (though unlikely in forex)

## Acceptance Criteria
- ✅ Interactive candlestick chart renders on Strategy page when user selects pair/timeframe and clicks "Load Data"
- ✅ Chart fetches OHLC data from `/api/prices/{pair}/{granularity}/{count}` endpoint
- ✅ Candlestick colors follow style guide: green (#22c55e) for bullish candles, red (#ef4444) for bearish candles
- ✅ Chart supports 4 chart types: candlestick, OHLC, line, and area
- ✅ Volume indicator can be toggled on/off and displays below main chart when enabled
- ✅ Date range buttons (1D, 5D, 1M, 3M, 6M, YTD, 1Y, All) update chart with appropriate historical data
- ✅ Candle count selector allows choosing 50, 100, or 200 candles
- ✅ Chart displays loading skeleton during data fetch
- ✅ Chart displays empty state with message when no data loaded
- ✅ Chart displays error alert (dismissible with retry) when API call fails
- ✅ Interactive features work: zoom (mouse wheel), pan (drag), hover tooltips with OHLC values
- ✅ Double-click resets chart zoom to original view
- ✅ Y-axis auto-scales to fit visible price range
- ✅ X-axis time formatting adjusts based on granularity (HH:MM for intraday, MM-DD for daily)
- ✅ Chart handles up to 1000 candles with good performance (< 1 second render time)
- ✅ Chart is responsive and adapts to different screen sizes (mobile, tablet, desktop)
- ✅ All UI components follow the established style guide (colors, typography, spacing, components)
- ✅ Chart container uses min-h-[500px] with dynamic height calc(100vh - 450px)
- ✅ All chart controls remain accessible above chart area
- ✅ Crosshair spike lines appear on hover for precise reading
- ✅ Chart integrates properly with Technicals sidebar in xl:col-span-2 layout
- ✅ E2E test passes with all steps verified
- ✅ No regressions in existing functionality (server tests pass, frontend builds successfully)

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_candlestick_chart.md` to validate the interactive candlestick chart functionality works end-to-end with all features (chart types, volume, date ranges, interactions, loading states, error handling)
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Existing Implementation Status
Based on code review, the following components are already implemented:
- PriceChart.jsx has chart type selector, volume toggle, date range buttons, and chart controls
- chart.js drawChart() function supports all 4 chart types with proper Plotly configuration
- chart.js implements volume traces with color-coding based on bullish/bearish candles
- chart.js uses CHART_COLORS matching the style guide requirements
- Strategy.jsx manages state and error handling with proper UI display
- API integration is complete with endPoints.prices() method
- Backend endpoint `/api/prices/{pair}/{granularity}/{count}` is functional

### Implementation Focus Areas
Since much of the infrastructure exists, focus on:
1. **Verification**: Ensure all existing features work as specified and follow style guide
2. **Polish**: Refine loading states, empty states, error handling UI
3. **Performance**: Verify performance with large datasets (1000 candles)
4. **Testing**: Create comprehensive E2E test and validate all functionality
5. **Consistency**: Ensure all UI elements strictly follow ai_docs/ui_style_guide.md

### Performance Considerations
- Plotly.js is already optimized for large datasets with built-in WebGL support
- The chart.js config includes scrollZoom, responsive sizing, and efficient render modes
- Maximum 1000 candles is enforced in calculateCandleCount() function
- Consider using Plotly's scattergl for line/area charts if performance issues arise

### UI Style Guide Compliance
All UI must follow ai_docs/ui_style_guide.md:
- Colors: Use CSS variable tokens (--primary, --success, --destructive, etc.)
- Typography: Anek Odia font family, proper font weights and sizes
- Components: Use Shadcn UI patterns where applicable (Card, Button, Badge, Progress, Skeleton)
- Spacing: Follow 4px base unit system
- Accessibility: Proper ARIA labels, keyboard navigation, color contrast (WCAG AA minimum)
- Animation: Respect prefers-reduced-motion, use standard durations (150-350ms)

### Future Enhancements
Consider for future iterations (not in this feature scope):
- Technical indicator overlays (moving averages, Bollinger Bands, RSI)
- Drawing tools (trend lines, support/resistance levels)
- Multi-timeframe analysis in split view
- Chart pattern recognition and alerts
- Export chart as image or PDF
- Save/load chart configurations
- Real-time price updates via WebSocket
- Comparison with multiple currency pairs on same chart
