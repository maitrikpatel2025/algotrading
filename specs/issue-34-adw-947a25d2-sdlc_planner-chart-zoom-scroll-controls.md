# Feature: Chart Zoom and Scroll Controls for Enhanced Navigation

## Metadata
issue_number: `34`
adw_id: `947a25d2`
issue_json: `{"number":34,"title":"Feature Zoom and Scroll Controls for Candlestick Chart Navigation US-VSB-002","body":"\n\nadw_sdlc_iso\n\n/feature\n\n\nEnhance the existing PriceChart.jsx component with comprehensive zoom and scroll interactions, enabling traders to navigate through historical price data at varying detail levels. The implementation extends Plotly.js's built-in interaction modes with custom constraints, keyboard shortcuts, and touch gesture support for cross-device compatibility.\n\nImplementation details:\nConfigure Plotly layout with dragmode: 'pan' and scrollZoom: true in app/chart.js to enable native mouse wheel zoom and click-drag panning\nAdd event listener for plotly_relayout to enforce zoom constraints (min 50 candles, max 500 candles visible) by clamping xaxis.range values\nImplement pinch-to-zoom via Plotly's built-in touch support; add config: { responsive: true, scrollZoom: true } to chart initialization\nRegister dblclick handler on chart div to call Plotly.relayout(chartDiv, { 'xaxis.autorange': true, 'yaxis.autorange': true }) for zoom reset\nAdd useEffect hook in PriceChart.jsx for keyboard event listeners: +/= zooms in 20%, - zooms out 20%, ←/→ scrolls 10% of visible range\nEnsure 60fps performance by using requestAnimationFrame for scroll animations and Plotly's WebGL renderer (type: 'scattergl' fallback for large datasets)\nThe zoom/scroll system should handle:\nCursor-centered zooming by calculating zoom pivot from mouse position relative to X-axis range before applying scale factor\nBoundary constraints preventing scroll beyond available data range (first candle to last candle)\nSmooth easing transitions using CSS transition on chart container or Plotly's transition: { duration: 150 } for relayout calls\nTouch device detection via 'ontouchstart' in window to show appropriate interaction hints in UI\nFocus management ensuring keyboard shortcuts only activate when chart container or page body is focused (not when typing in inputs)\nDisplay zoom level indicator (e.g., \"Showing 120 candles\") below chart; show brief tooltip on first interaction explaining controls (\"Scroll to zoom • Drag to pan • Double-click to reset\"); handle edge case where zooming beyond data triggers fetch for additional historical candles via updated API call.\n\nCan you make sure please to follow the styleguide.md for UI."}`

## Feature Description
This feature enhances the PriceChart.jsx component with comprehensive zoom and scroll interactions, enabling forex traders to navigate through historical price data at varying detail levels. Traders can use mouse wheel zoom, click-drag panning, keyboard shortcuts, and touch gestures to explore candlestick data with precision. The implementation adds smart zoom constraints (50-500 candles visible), cursor-centered zooming, boundary detection, and visual feedback including a zoom level indicator and interaction hints tooltip. All interactions maintain 60fps performance through optimized event handling and Plotly's WebGL rendering capabilities.

## User Story
As a forex trader analyzing price patterns
I want to zoom in and out of candlestick charts and pan across historical data
So that I can examine price action at different detail levels and identify trading opportunities across various timeframes

## Problem Statement
The current PriceChart component has basic Plotly zoom/pan functionality enabled but lacks refined user controls for optimal trading chart navigation. Traders need:
- **Controlled zoom levels** to prevent excessive zoom-in (fewer than 50 candles, reducing pattern visibility) or zoom-out (more than 500 candles, reducing detail clarity)
- **Keyboard shortcuts** for precise incremental zoom and scroll adjustments without relying solely on mouse
- **Visual feedback** showing current zoom level and available interaction controls
- **Touch device support** for traders using tablets or mobile devices
- **Cursor-centered zooming** for intuitive zoom behavior where the chart zooms toward the price point under the cursor
- **Boundary constraints** to prevent scrolling beyond available data range

Without these enhancements, traders experience inefficient navigation, lack of control over detail levels, and poor touch device experience.

## Solution Statement
Extend the existing Plotly.js chart in app/client/src/app/chart.js with advanced interaction controls:

1. **Enhanced Plotly Configuration**: Configure dragmode='pan', scrollZoom=true, and add plotly_relayout event listener to enforce zoom constraints (50-500 visible candles) by clamping xaxis.range values
2. **Keyboard Navigation**: Implement useEffect hook in PriceChart.jsx with keyboard event listeners for +/= (zoom in 20%), - (zoom out 20%), ←/→ (scroll 10% of visible range) with focus management to prevent interference with form inputs
3. **Zoom Level Indicator**: Display "Showing X candles" below chart with real-time updates during zoom/pan operations
4. **Interaction Hints**: Show tooltip on first interaction: "Scroll to zoom • Drag to pan • Double-click to reset" with localStorage-based dismissal
5. **Touch Support**: Detect touch devices via 'ontouchstart' in window and show appropriate mobile interaction hints
6. **Performance Optimization**: Use requestAnimationFrame for smooth scroll animations and Plotly's WebGL renderer (type: 'scattergl') for datasets exceeding 500 candles
7. **Cursor-Centered Zoom**: Calculate zoom pivot from mouse position relative to X-axis range before applying scale factor for intuitive zooming behavior

## Relevant Files
Use these files to implement the feature:

- **app/client/src/app/chart.js** - Core Plotly.js chart rendering logic with drawChart() function. Needs modification to:
  - Add plotly_relayout event listener for zoom constraint enforcement
  - Implement zoom calculation utilities (getVisibleCandleCount, clampZoomRange)
  - Add cursor position tracking for cursor-centered zoom
  - Configure Plotly with enhanced interaction settings (dragmode, scrollZoom, doubleClick)

- **app/client/src/components/PriceChart.jsx** - React component wrapper for chart. Needs modification to:
  - Add useEffect hook for keyboard event listeners with cleanup
  - Implement focus management logic to prevent keyboard shortcuts in input fields
  - Add state for zoomLevel and showInteractionHint
  - Render zoom level indicator below chart
  - Render interaction hints tooltip with dismiss functionality
  - Pass chartRef to useEffect for direct Plotly manipulation

- **app/client/src/pages/Strategy.jsx** - Parent component managing chart state. Minimal changes:
  - No direct changes required, but verify chart re-renders don't interfere with interaction state

- **ai_docs/ui_style_guide.md** - UI style guide for consistent component styling. Reference for:
  - Color tokens for zoom indicator and tooltip (bg-muted, text-muted-foreground)
  - Typography classes for zoom level text (text-sm, font-medium)
  - Animation utilities for tooltip fade-in/fade-out

- **.claude/commands/test_e2e.md** - E2E test runner documentation for understanding test structure
- **.claude/commands/e2e/test_trading_dashboard.md** - Example E2E test for reference on test format
- **.claude/commands/e2e/test_candlestick_chart.md** - Existing candlestick chart E2E test to extend with zoom/scroll validation

### New Files

- **.claude/commands/e2e/test_chart_zoom_scroll.md** - New E2E test specification file to validate all zoom and scroll functionality including:
  - Mouse wheel zoom in/out with constraint verification
  - Click-drag panning with boundary detection
  - Keyboard shortcuts (+/-, arrow keys) with focus management
  - Double-click reset to autorange
  - Zoom level indicator updates
  - Interaction hints tooltip display and dismissal
  - Touch device interaction hints
  - Performance with 500+ candles
  - Screenshots at key interaction states

## Implementation Plan

### Phase 1: Foundation
**Objective**: Configure Plotly.js with enhanced interaction capabilities and zoom constraint infrastructure

1. Modify app/client/src/app/chart.js to add Plotly configuration for zoom/pan interactions
2. Implement utility functions for zoom calculations (getVisibleCandleCount, clampZoomRange, calculateZoomPivot)
3. Add plotly_relayout event listener to enforce zoom constraints (50-500 candles visible)
4. Configure double-click handler for zoom reset to autorange

### Phase 2: Core Implementation
**Objective**: Implement keyboard navigation, zoom indicator, and interaction hints in PriceChart component

1. Add state management in PriceChart.jsx for zoomLevel, showInteractionHint, and isTouchDevice
2. Implement useEffect hook for keyboard event listeners with focus management logic
3. Add zoom level indicator UI component below chart with real-time candle count display
4. Create interaction hints tooltip component with localStorage-based dismissal
5. Implement touch device detection and conditional hint rendering
6. Add cursor position tracking for cursor-centered zoom behavior

### Phase 3: Integration
**Objective**: Integrate zoom/scroll features with existing chart functionality and validate cross-device compatibility

1. Test keyboard shortcuts don't interfere with existing Select dropdowns and input fields
2. Verify zoom constraints work correctly with all chart types (candlestick, OHLC, line, area)
3. Test interaction on touch devices (tablets/mobile) for pinch-to-zoom and pan gestures
4. Validate performance with large datasets (500-1000 candles) using requestAnimationFrame
5. Ensure zoom level indicator updates correctly during all interaction modes
6. Create comprehensive E2E test specification in .claude/commands/e2e/test_chart_zoom_scroll.md

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Enhance chart.js with zoom constraint infrastructure
- Read app/client/src/app/chart.js to understand current Plotly configuration
- Add utility function `getVisibleCandleCount(xaxisRange, chartData)` to calculate number of visible candles based on X-axis range
- Add utility function `clampZoomRange(newRange, chartData, minCandles=50, maxCandles=500)` to enforce zoom constraints by adjusting X-axis range
- Add utility function `calculateZoomPivot(mouseX, chartDiv, xaxisRange)` to compute zoom center based on cursor position
- Update `drawChart()` function to store chartData reference for event handlers (use closure or attach to DOM element data attribute)

### 2. Configure Plotly with enhanced interaction settings
- In `drawChart()` function, update `layout.dragmode` to `'pan'` (already set, verify it's working)
- In `config` object, verify `scrollZoom: true` is enabled (already set)
- In `config` object, set `doubleClick: 'reset'` (already set, verify it triggers autorange)
- Add `layout.xaxis.fixedrange = false` and `layout.yaxis.fixedrange = false` to enable zoom/pan on both axes

### 3. Implement plotly_relayout event listener for zoom constraints
- After `Plotly.newPlot()` call in `drawChart()`, add event listener: `chartElement.on('plotly_relayout', eventData => {...})`
- In event handler, check if `eventData['xaxis.range[0]']` and `eventData['xaxis.range[1]']` exist (indicates zoom/pan operation)
- Call `getVisibleCandleCount()` to determine current visible candles
- If visible candles < 50 or > 500, call `clampZoomRange()` to compute corrected range
- Use `Plotly.relayout(chartElement, { 'xaxis.range': [correctedStart, correctedEnd] })` to apply constraints
- Add debouncing with `requestAnimationFrame` to prevent excessive relayout calls

### 4. Add state and chartRef to PriceChart.jsx
- Read app/client/src/components/PriceChart.jsx to understand current component structure
- Add `useRef` hook: `const chartRef = useRef(null)` for direct Plotly element access
- Add state: `const [visibleCandleCount, setVisibleCandleCount] = useState(null)` for zoom level indicator
- Add state: `const [showInteractionHint, setShowInteractionHint] = useState(false)` for tooltip visibility
- Add state: `const [isTouchDevice, setIsTouchDevice] = useState(false)` for device detection
- In the chart div, add `ref={chartRef}` to enable direct DOM access

### 5. Implement touch device detection
- Add `useEffect` hook in PriceChart.jsx that runs once on mount
- Inside useEffect, check `'ontouchstart' in window` to detect touch support
- Call `setIsTouchDevice(true)` if touch is supported
- Read from localStorage: `const hintDismissed = localStorage.getItem('chart-interaction-hint-dismissed')`
- If `!hintDismissed`, call `setShowInteractionHint(true)` to show tooltip on first load

### 6. Implement keyboard event listeners with focus management
- Add `useEffect` hook in PriceChart.jsx with dependency on `priceData` and `chartRef.current`
- Inside useEffect, define `handleKeyDown` function to process keyboard events
- Check if active element is an input/textarea/select: `if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;`
- Handle `+` or `=` key: zoom in by 20% using `Plotly.relayout(chartRef.current, { 'xaxis.range': computeZoomedInRange() })`
- Handle `-` key: zoom out by 20% using `Plotly.relayout(chartRef.current, { 'xaxis.range': computeZoomedOutRange() })`
- Handle `ArrowLeft` key: scroll left by 10% of visible range
- Handle `ArrowRight` key: scroll right by 10% of visible range
- Add event listener: `document.addEventListener('keydown', handleKeyDown)`
- Return cleanup function: `() => document.removeEventListener('keydown', handleKeyDown)`

### 7. Create zoom calculation utility functions
- In chart.js or new utility file, implement `computeZoomedInRange(currentRange, zoomFactor=0.8)` to reduce visible range by 20%
- Implement `computeZoomedOutRange(currentRange, zoomFactor=1.2)` to increase visible range by 20%
- Implement `computeScrolledRange(currentRange, direction='left', scrollPercent=0.1)` to shift range left/right by 10%
- Ensure all functions return clamped ranges that respect data boundaries (first candle to last candle timestamps)

### 8. Implement zoom level indicator UI component
- In PriceChart.jsx, add a div below the chart container (after `#chartDiv`) to display zoom level
- Use conditional rendering: `{visibleCandleCount && <div className="mt-2 text-center">...</div>}`
- Display text: `"Showing {visibleCandleCount} candles"` using `text-sm text-muted-foreground font-medium` classes per style guide
- Update `visibleCandleCount` state whenever chart zooms/pans by adding listener to plotly_relayout event
- Extract candle count from X-axis range by counting data points between range[0] and range[1]

### 9. Create interaction hints tooltip component
- In PriceChart.jsx, add conditional rendering for tooltip: `{showInteractionHint && <div className="interaction-hint-tooltip">...}</div>}`
- Position tooltip absolutely over the chart area with semi-transparent dark background (`bg-black/80 text-white`)
- Display hint text based on device type:
  - Desktop: "Scroll to zoom • Drag to pan • Double-click to reset • Keyboard: +/- to zoom, ←/→ to scroll"
  - Touch: "Pinch to zoom • Drag to pan • Tap to dismiss"
- Add dismiss button/click handler that calls `localStorage.setItem('chart-interaction-hint-dismissed', 'true')` and `setShowInteractionHint(false)`
- Style with fade-in animation using `animate-fade-in` class per style guide

### 10. Implement cursor-centered zooming
- In chart.js plotly_relayout event handler, capture mouse position during wheel events
- Add event listener for 'wheel' event on chartElement to track cursor X position
- Calculate relative position: `relativeX = (mouseX - chartBounds.left) / chartBounds.width` (0 to 1)
- When zooming, compute new range centered on cursor position: `newCenter = currentRange[0] + relativeX * (currentRange[1] - currentRange[0])`
- Adjust new range so that `newCenter` remains at the same relative position after zoom

### 11. Add smooth transitions with requestAnimationFrame
- Wrap all Plotly.relayout calls in keyboard handlers with `requestAnimationFrame(() => Plotly.relayout(...))`
- For scroll animations, implement gradual transition over 150ms using Plotly's `transition` option: `Plotly.relayout(chartDiv, updates, { transition: { duration: 150 } })`
- Ensure smooth 60fps performance by avoiding synchronous relayout calls during rapid keyboard input

### 12. Create E2E test specification file
- Read .claude/commands/e2e/test_trading_dashboard.md and .claude/commands/e2e/test_candlestick_chart.md for reference format
- Create new file .claude/commands/e2e/test_chart_zoom_scroll.md following the same structure
- Define User Story: "As a trader, I want to zoom and scroll through chart data, so that I can analyze price patterns at different detail levels"
- List comprehensive Test Steps covering:
  - Navigate to Strategy page and load chart data
  - Test mouse wheel zoom in/out and verify visible candle count changes
  - Test zoom constraints: attempt to zoom beyond 50 candles (should be prevented), attempt to zoom beyond 500 candles (should be prevented)
  - Test click-drag panning left/right and verify chart scrolls
  - Test boundary constraints: attempt to scroll before first candle (should stop), attempt to scroll after last candle (should stop)
  - Test keyboard shortcuts: press + to zoom in, press - to zoom out, press ← to scroll left, press → to scroll right
  - Test focus management: click into a Select dropdown, press + key, verify chart doesn't zoom (input should receive key)
  - Test double-click reset to autorange
  - Test zoom level indicator displays and updates correctly
  - Test interaction hints tooltip appears on first load and can be dismissed
  - Test touch device hints display correctly on mobile viewport
  - Take screenshots at each major interaction state (initial load with tooltip, zoomed in, zoomed out, panned left, panned right, after reset)
- Define Success Criteria: all zoom/scroll interactions work smoothly, constraints enforced, keyboard shortcuts functional with proper focus management, visual feedback accurate

### 13. Manual testing of zoom constraints
- Start the application and navigate to Strategy page
- Load a chart with 200 candles initially
- Use mouse wheel to zoom in progressively until constraint is hit (should stop at 50 candles visible)
- Verify zoom level indicator shows "Showing 50 candles"
- Use mouse wheel to zoom out progressively until constraint is hit (should stop at 500 candles visible)
- Verify zoom level indicator shows "Showing 500 candles"
- Verify smooth animation during zoom operations

### 14. Manual testing of keyboard navigation
- With chart loaded, ensure no input field is focused
- Press `+` key multiple times and verify chart zooms in incrementally
- Press `-` key multiple times and verify chart zooms out incrementally
- Press `←` key and verify chart scrolls left
- Press `→` key and verify chart scrolls right
- Click into the "Currency Pair" Select dropdown
- Press `+` key and verify dropdown receives the key, chart doesn't zoom
- Press Escape to close dropdown, verify keyboard shortcuts work again

### 15. Manual testing of cursor-centered zoom
- Load chart and position mouse cursor over a specific candle in the middle of the chart
- Use mouse wheel to zoom in while keeping cursor stationary
- Verify the chart zooms toward the candle under the cursor (candle stays under cursor after zoom)
- Repeat test with cursor at left edge and right edge of chart
- Verify zoom behavior feels intuitive and follows cursor position

### 16. Manual testing of interaction hints
- Clear localStorage: `localStorage.removeItem('chart-interaction-hint-dismissed')`
- Reload Strategy page and load chart data
- Verify interaction hints tooltip appears over the chart
- Click dismiss button or click anywhere on tooltip
- Verify tooltip disappears and doesn't reappear on subsequent chart loads
- Check localStorage to confirm `'chart-interaction-hint-dismissed'` is set to `'true'`

### 17. Manual testing of touch device support
- Open browser DevTools and enable device emulation (e.g., iPad, iPhone)
- Navigate to Strategy page and load chart
- Verify touch-specific interaction hints are displayed ("Pinch to zoom • Drag to pan")
- Use pinch gesture to zoom in/out (simulate with DevTools or test on actual device)
- Use drag gesture to pan left/right
- Verify all gestures work smoothly and constraints are enforced

### 18. Performance testing with large datasets
- Load chart with 1000 candles (select "All" date range or manually fetch via API)
- Verify chart renders using WebGL (check for scattergl trace type in Plotly)
- Perform rapid zoom in/out operations using mouse wheel
- Monitor browser DevTools Performance tab to ensure 60fps maintained
- Verify no lag or stuttering during keyboard scrolling with large dataset
- Check that zoom level indicator updates smoothly without delays

### 19. Run comprehensive E2E test
- Read .claude/commands/test_e2e.md to understand E2E test execution
- Execute the new E2E test specification: read and run .claude/commands/e2e/test_chart_zoom_scroll.md
- Verify all test steps pass successfully
- Review screenshots to confirm visual correctness
- Address any test failures by debugging and fixing the implementation

### 20. Run validation commands
- Execute all validation commands listed in the Validation Commands section below
- Verify server tests pass: `cd app/server && uv run pytest`
- Verify client build succeeds: `cd app/client && npm run build`
- Confirm zero regressions in existing functionality
- Verify E2E test passes: execute test_chart_zoom_scroll.md

## Testing Strategy

### Unit Tests
While this feature primarily involves UI interactions that are better suited for E2E tests, consider adding lightweight unit tests for:

- **Utility function tests** (if extracted to separate module):
  - `getVisibleCandleCount(xaxisRange, chartData)` - test with various range inputs, verify accurate candle count calculation
  - `clampZoomRange(newRange, chartData, minCandles, maxCandles)` - test boundary conditions (range too small, range too large, range within limits)
  - `computeZoomedInRange(currentRange, zoomFactor)` - verify correct range reduction by zoom factor
  - `computeZoomedOutRange(currentRange, zoomFactor)` - verify correct range expansion by zoom factor
  - `computeScrolledRange(currentRange, direction, scrollPercent)` - verify correct range shift in both directions

Note: Full integration testing is better suited for E2E tests due to heavy reliance on Plotly.js DOM manipulation and user interactions.

### Edge Cases
- **Zoom constraints edge cases**:
  - Attempting to zoom in when already at minimum (50 candles visible) - should prevent further zoom
  - Attempting to zoom out when already at maximum (500 candles visible) - should prevent further zoom
  - Zooming with less than 50 total candles in dataset - should show all candles, not enforce 50 minimum
  - Loading dataset with exactly 50 or 500 candles - boundary test for constraint logic

- **Boundary scroll edge cases**:
  - Scrolling left when already at first candle - should stop scrolling, not go beyond data
  - Scrolling right when already at last candle - should stop scrolling, not go beyond data
  - Panning with mouse drag beyond chart boundaries - should clamp to data range

- **Keyboard focus edge cases**:
  - Pressing keyboard shortcuts while typing in Select dropdown - should not trigger chart zoom/scroll
  - Pressing keyboard shortcuts while typing in a hypothetical search input - should not trigger chart zoom/scroll
  - Pressing keyboard shortcuts when chart is not mounted/visible - should not throw errors

- **Device detection edge cases**:
  - Desktop browser with touchscreen (hybrid device) - should show both mouse and touch hints, or prioritize touch hints
  - Browser with no touch support - should show desktop keyboard hints
  - Switching from mobile to desktop viewport (responsive design) - should update hints accordingly

- **Performance edge cases**:
  - Rapid mouse wheel scrolling (dozens of events per second) - should debounce and maintain 60fps
  - Holding down keyboard shortcut key (key repeat) - should smooth zoom/scroll without stuttering
  - Chart with 1000 candles during simultaneous zoom and pan operations - should use WebGL and maintain performance

- **Interaction hints edge cases**:
  - First-time visitor - should show tooltip
  - Returning visitor (localStorage dismissed) - should not show tooltip
  - localStorage cleared manually - should show tooltip again
  - Multiple charts on same page (future scenario) - should track dismissal globally or per-chart

## Acceptance Criteria
1. **Mouse wheel zoom** zooms in/out on the chart with cursor-centered zooming behavior
2. **Zoom constraints** enforce minimum 50 candles and maximum 500 candles visible at all times (with exception for datasets smaller than 50 candles)
3. **Click-drag panning** allows horizontal scrolling through price data
4. **Boundary constraints** prevent scrolling beyond first/last candle in dataset
5. **Double-click reset** restores chart to autorange (full data view)
6. **Keyboard shortcuts** work as specified:
   - `+` or `=` zooms in by 20%
   - `-` zooms out by 20%
   - `←` scrolls left by 10% of visible range
   - `→` scrolls right by 10% of visible range
7. **Focus management** prevents keyboard shortcuts from triggering when typing in input fields, Select dropdowns, or textareas
8. **Zoom level indicator** displays "Showing X candles" below chart and updates in real-time during zoom/pan operations
9. **Interaction hints tooltip** appears on first chart load showing appropriate controls for device type (desktop vs touch)
10. **Tooltip dismissal** allows user to permanently hide hints, stored in localStorage
11. **Touch device support** displays touch-specific hints ("Pinch to zoom • Drag to pan") on mobile/tablet devices
12. **Performance** maintains 60fps during all zoom/scroll operations, even with 500-1000 candles
13. **WebGL rendering** activates for datasets with 500+ candles to ensure smooth performance
14. **Smooth transitions** use requestAnimationFrame and Plotly transition options for fluid animations (150ms duration)
15. **No regressions** in existing chart functionality (chart types, volume toggle, date ranges, candle count selector)
16. **E2E test passes** with all interaction scenarios validated and screenshots captured
17. **Style guide compliance** all new UI elements follow ai_docs/ui_style_guide.md color tokens, typography, and spacing guidelines

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md` to understand the E2E test runner
- Read and execute the new E2E test file `.claude/commands/e2e/test_chart_zoom_scroll.md` to validate zoom and scroll functionality works correctly
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Style Guide Compliance
All new UI elements follow ai_docs/ui_style_guide.md:
- **Zoom level indicator**: Uses `text-sm text-muted-foreground font-medium` classes for consistent typography
- **Interaction hints tooltip**: Uses `bg-black/80 text-white rounded-md p-4 shadow-lg` for dark semi-transparent background matching style guide overlay patterns
- **Animation**: Uses `animate-fade-in` utility class for smooth tooltip appearance per style guide animation principles
- **Spacing**: Uses `mt-2` (8px) gap between chart and zoom indicator per 4px base unit spacing system

### Performance Considerations
- **requestAnimationFrame**: All keyboard-triggered zoom/scroll operations wrapped in RAF to prevent layout thrashing
- **Debouncing**: plotly_relayout event handler uses RAF to debounce rapid zoom constraint checks
- **WebGL rendering**: Plotly automatically uses WebGL for large datasets (500+ points) via scattergl trace type fallback
- **Event cleanup**: All event listeners properly removed in useEffect cleanup to prevent memory leaks
- **Smooth transitions**: Plotly transition option set to 150ms for fluid zoom/scroll animations without jank

### Plotly.js Integration Points
- **dragmode**: Set to 'pan' to enable click-drag panning by default (already configured)
- **scrollZoom**: Set to true to enable mouse wheel zoom (already configured)
- **doubleClick**: Set to 'reset' to enable double-click zoom reset (already configured)
- **plotly_relayout event**: Emitted whenever zoom/pan occurs, used to enforce constraints and update zoom indicator
- **Plotly.relayout()**: Method used to programmatically update axis ranges for keyboard shortcuts and constraint enforcement
- **fixedrange**: Set to false on both axes to allow zoom/pan (default is false, but explicitly set for clarity)

### localStorage Usage
- **Key**: `'chart-interaction-hint-dismissed'`
- **Value**: `'true'` when user dismisses tooltip
- **Behavior**: On component mount, check if key exists; if not, show tooltip; if exists, hide tooltip permanently
- **Privacy**: Only stores a simple boolean flag, no user data or tracking information

### Future Enhancement Considerations
The following features were considered but not included in this implementation (potential future iterations):
- **Pinch-to-zoom enhancement**: Custom pinch gesture handler for more granular touch control beyond Plotly's built-in support
- **Zoom history**: Back/forward buttons to navigate through zoom state history
- **Mini-map navigator**: Small overview chart showing current visible range within full dataset
- **Zoom to selection**: Click-drag box to zoom into specific region (Plotly supports this with dragmode='zoom' but not in current implementation)
- **API-triggered data loading**: Fetch additional historical candles when zooming beyond current dataset boundaries
- **Zoom presets**: Buttons for "1 hour", "4 hours", "1 day" zoom levels
- **Crosshair lock**: Lock crosshair at specific price/time while zooming for reference point comparison
- **Synchronized zoom**: Zoom multiple charts in sync when viewing multiple timeframes (advanced feature)

### Known Limitations
- **Minimum dataset size**: If dataset has fewer than 50 candles, the 50-candle minimum constraint is not enforced (all candles shown)
- **Keyboard shortcuts conflicts**: If user's browser or OS has keyboard shortcuts for +/- (e.g., browser zoom), those may conflict; users can use mouse instead
- **Touch device detection**: Detection via 'ontouchstart' is simple and may not perfectly distinguish hybrid devices; tooltip shows desktop hints by default if ambiguous
- **WebGL compatibility**: Very old browsers may not support WebGL; Plotly falls back to SVG rendering but performance may degrade with 500+ candles
- **Constraint calculation performance**: For extremely large datasets (5000+ candles), visible candle count calculation may have slight delay; current implementation optimized for up to 1000 candles
