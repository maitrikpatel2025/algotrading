# Feature: Chart Drawing Tools (US-VSB-020 to US-VSB-024)

## Metadata
issue_number: `78`
adw_id: `81932c3d`
issue_json: `{"number":78,"title":"Feature Drawing Tools US-VSB-020 to US-VSB-024","body":"..."}`

## Feature Description
Implement a complete suite of drawing tools integrated into the chart interface that allows users to annotate charts with horizontal lines, trendlines, and Fibonacci retracements. These drawings can be used as inputs to trading strategy conditions, enabling visual-based trading strategy creation.

The feature includes:
1. **Drawing Tools Panel & Toolbar** - A toolbar above the chart with tool selection, keyboard shortcuts, and visual feedback
2. **Horizontal Lines** - Click-to-place price level lines with drag adjustment, properties dialog, and context menu
3. **Trendlines** - Two-point diagonal lines with extension options, parallel line creation, and snap-to-candle
4. **Fibonacci Retracement** - Multi-level retracement tool with customizable levels and color options
5. **Condition Builder Integration** - Horizontal lines can be used as condition inputs with price-based triggers

## User Story
As a **trader**
I want to **annotate charts with horizontal lines, trendlines, and Fibonacci retracements**
So that **I can visually mark important price levels and use these drawings as inputs to my trading strategy conditions**

## Problem Statement
Currently, the trading dashboard lacks visual annotation tools. Traders cannot:
- Mark support/resistance levels directly on charts
- Draw trendlines to visualize price trends
- Add Fibonacci retracement levels for technical analysis
- Use visual price levels as inputs to automated trading conditions

This limits the expressiveness of trading strategies and requires traders to manually monitor price levels instead of automating responses to visual technical analysis.

## Solution Statement
Implement a comprehensive drawing tools system that:
1. Provides an intuitive toolbar with drawing tool selection and keyboard shortcuts
2. Supports three drawing types: horizontal lines, trendlines, and Fibonacci retracements
3. Enables interactive editing via drag handles, double-click properties dialogs, and right-click context menus
4. Integrates horizontal lines with the existing condition builder system
5. Persists drawings to localStorage for session continuity
6. Uses Plotly.js shapes API for efficient rendering integrated with existing chart infrastructure

## Relevant Files
Use these files to implement the feature:

### Core Chart Files
- `app/client/src/app/chart.js` - Main chart rendering logic using Plotly.js. Add drawing shape rendering, handle drawing mode interactions
- `app/client/src/components/PriceChart.jsx` - Chart wrapper component. Add toolbar rendering, drawing mode state, mouse event handling for drawing creation/editing
- `app/client/src/app/chartConstants.js` - Chart styling constants. Add drawing tool styling constants

### Strategy Page Integration
- `app/client/src/pages/Strategy.jsx` - Main Strategy page orchestrator (~1792 lines). Add drawing state management, drawing-related handlers, toolbar state, condition integration

### Condition System Files
- `app/client/src/app/conditionDefaults.js` - Condition creation/validation logic. Add horizontal line condition types and operand options
- `app/client/src/components/ConditionBlock.jsx` - Condition UI component. Add support for horizontal line operands
- `app/client/src/components/ConditionDropdown.jsx` - Dropdown for condition operand selection. Add horizontal line options
- `app/client/src/components/LogicPanel.jsx` - Logic panel component. May need updates for horizontal line condition display

### Constants and Configuration
- `app/client/src/app/constants.js` - Application constants. Add drawing-related constants (limits, storage keys)

### E2E Testing
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test file

### New Files
The following new files will be created:

- `app/client/src/components/DrawingToolbar.jsx` - Toolbar component with tool selection buttons, active state indication, and keyboard shortcut handling
- `app/client/src/components/DrawingPropertiesDialog.jsx` - Modal dialog for editing drawing properties (color, style, thickness, label, Fib levels)
- `app/client/src/components/DrawingContextMenu.jsx` - Right-click context menu for drawings (Edit, Duplicate, Delete, Use in Condition)
- `app/client/src/app/drawingUtils.js` - Utility functions for drawing calculations (Fib levels, trendline slope, snap-to-price)
- `app/client/src/app/drawingTypes.js` - Type definitions and constants for drawings (tool types, default properties, limits)
- `.claude/commands/e2e/test_chart_drawing_tools.md` - E2E test specification for drawing tools

## Implementation Plan

### Phase 1: Foundation
1. **Define drawing data structures and constants** - Create type definitions for horizontal lines, trendlines, and Fibonacci retracements with all required properties
2. **Set up state management in Strategy.jsx** - Add drawings state, active drawing tool state, localStorage persistence
3. **Create DrawingToolbar component** - Implement tool selection UI with icons, tooltips, keyboard shortcuts, and active state highlighting

### Phase 2: Core Implementation
4. **Implement horizontal line drawing** - Click-to-place, drag-to-adjust, Plotly shapes integration
5. **Implement trendline drawing** - Two-point creation, anchor point dragging, extension options
6. **Implement Fibonacci retracement** - Swing high/low anchors, level rendering, customizable levels
7. **Add drawing rendering to chart.js** - Integrate with existing Plotly layout using shapes API
8. **Implement mouse interaction handlers in PriceChart.jsx** - Tool-specific click/drag handlers, coordinate transformation

### Phase 3: Integration
9. **Create DrawingPropertiesDialog** - Universal dialog for editing all drawing properties
10. **Create DrawingContextMenu** - Right-click menu with drawing-specific actions
11. **Integrate horizontal lines with condition builder** - Add horizontal lines as condition operand options
12. **Add deletion protection for referenced lines** - Warning dialog when deleting lines used in conditions
13. **Add visual indicators for condition-linked drawings** - Special icon/styling on referenced drawings

## Step by Step Tasks

### Step 1: Create Drawing Type Definitions and Constants
- Create `app/client/src/app/drawingTypes.js` with:
  - `DRAWING_TOOLS` enum (POINTER, HORIZONTAL_LINE, TRENDLINE, FIBONACCI)
  - `DRAWING_TOOL_SHORTCUTS` mapping (H, T, F, Esc)
  - Default properties for each drawing type (color, style, thickness)
  - Fibonacci default levels (0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%)
  - Fibonacci extension levels (127.2%, 161.8%, 261.8%)
  - Drawing limits (MAX_HORIZONTAL_LINES=20, MAX_TRENDLINES=10, MAX_FIBONACCI=5)
  - Line style options (solid, dashed, dotted)
- Add to `app/client/src/app/constants.js`:
  - `DRAWINGS_STORAGE_KEY` for localStorage persistence

### Step 2: Create Drawing Utility Functions
- Create `app/client/src/app/drawingUtils.js` with:
  - `generateDrawingId()` - Generate unique drawing IDs
  - `calculateFibonacciLevels(startPrice, endPrice, levels)` - Calculate Fib price levels
  - `calculateTrendlineSlope(point1, point2)` - Calculate angle/slope for display
  - `snapToPrice(price, priceData, tolerance)` - Snap to nearest OHLC value
  - `getDrawingDisplayName(drawing)` - Get display name for condition builder
  - `isDrawingWithinBounds(drawing, priceData)` - Validate drawing positions
  - `extendTrendline(startPoint, endPoint, direction, dataRange)` - Calculate extended endpoints
  - `createParallelTrendline(originalTrendline, clickPoint)` - Create parallel line

### Step 3: Set Up Drawing State Management in Strategy.jsx
- Add new state variables:
  - `drawings` - Array of all drawing objects (horizontal lines, trendlines, Fibs)
  - `activeDrawingTool` - Currently selected tool (default: POINTER)
  - `drawingInProgress` - Partial drawing being created (for two-point tools)
  - `selectedDrawingId` - Currently selected drawing for editing
  - `drawingHistory` - History for undo support
- Add localStorage persistence for drawings (similar to conditions/groups pattern)
- Add handlers:
  - `handleDrawingToolSelect(tool)` - Tool selection with keyboard shortcut support
  - `handleDrawingCreate(drawing)` - Add new drawing
  - `handleDrawingUpdate(drawingId, updates)` - Update drawing properties
  - `handleDrawingDelete(drawingId)` - Delete with confirmation if referenced
  - `handleDrawingDuplicate(drawingId)` - Duplicate drawing
  - `handleUseDrawingInCondition(drawingId)` - Add to condition builder
- Add keyboard listener for drawing shortcuts (H, T, F, Esc)

### Step 4: Create DrawingToolbar Component
- Create `app/client/src/components/DrawingToolbar.jsx`:
  - Render toolbar above chart area (inside PriceChart card header)
  - Tool buttons: Pointer (default), Horizontal Line, Trendline, Fibonacci
  - Each button has: icon, tooltip with keyboard shortcut, active state styling
  - Active tool has distinct background/border (similar to volume toggle button)
  - Props: `activeTool`, `onToolSelect`, `drawingCounts` (for limit warnings)
  - Show warning badge when approaching drawing limits
  - Responsive: show all tools on desktop, maybe collapse on mobile

### Step 5: Implement Drawing Rendering in chart.js
- Add `createDrawingShapes(drawings, chartData)` function:
  - Convert drawing objects to Plotly shapes
  - Horizontal lines: `type: 'line'`, x0=0, x1=1, y0=y1=price, xref='paper'
  - Trendlines: `type: 'line'`, x0/x1 as dates, y0/y1 as prices
  - Fibonacci: Multiple horizontal lines at each level with labels
- Add `createDrawingAnnotations(drawings, chartData)` function:
  - Price labels on Y-axis for horizontal lines
  - Level labels for Fibonacci (percentage + price)
  - Angle/slope tooltip data for trendlines
- Modify `drawChart()` to accept `activeDrawings` parameter
- Integrate shapes and annotations into Plotly layout
- Add visual indicator (small icon) for drawings used in conditions

### Step 6: Implement Mouse Interaction in PriceChart.jsx
- Add coordinate transformation helpers:
  - `pixelToDataCoordinates(pixelX, pixelY, chartElement)` - Convert click to price/time
  - `dataToPixelCoordinates(time, price, chartElement)` - Convert data to screen position
- Add drawing mode event handlers:
  - `handleChartClick(event)` - Tool-specific click handling
  - `handleChartMouseMove(event)` - Preview drawing while creating
  - `handleChartMouseDown(event)` - Start drag operations
  - `handleChartMouseUp(event)` - Complete drag operations
- For horizontal line:
  - Single click places line at click price
  - Optional snap-to-price (hold Shift to snap to nearest OHLC)
- For trendline:
  - First click sets anchor 1, shows preview line following cursor
  - Second click sets anchor 2, creates trendline
  - Esc cancels partial drawing
- For Fibonacci:
  - Click-drag from swing low to high (or vice versa)
  - Preview shows levels while dragging
- Add drag handlers for editing existing drawings:
  - Detect drag on horizontal line → vertical drag to adjust price
  - Detect drag on trendline anchor → reposition anchor point
  - Detect drag on Fib anchor → adjust range

### Step 7: Create DrawingPropertiesDialog Component
- Create `app/client/src/components/DrawingPropertiesDialog.jsx`:
  - Reusable dialog for all drawing types (similar to IndicatorSettingsDialog)
  - Props: `isOpen`, `onClose`, `onConfirm`, `drawing`, `drawingType`
  - Common properties section:
    - Color picker (using existing pattern from IndicatorSettingsDialog)
    - Line style dropdown (Solid, Dashed, Dotted)
    - Line thickness slider (1-5 pixels)
  - Horizontal line specific:
    - Price input (editable number field)
    - Label input (optional custom text)
  - Trendline specific:
    - Extend Left checkbox
    - Extend Right checkbox
    - Display angle/slope (read-only)
  - Fibonacci specific:
    - Level visibility checkboxes (toggle each level)
    - Color customization (per-level or all levels)
    - Show Prices checkbox
    - Show Percentages checkbox
  - Confirm/Cancel buttons

### Step 8: Create DrawingContextMenu Component
- Create `app/client/src/components/DrawingContextMenu.jsx`:
  - Similar pattern to IndicatorContextMenu
  - Props: `isOpen`, `position`, `drawing`, `onEdit`, `onDuplicate`, `onDelete`, `onUseInCondition`, `onCreateParallel`, `onFlip`, `onClose`
  - Common options:
    - Edit → Opens DrawingPropertiesDialog
    - Duplicate → Creates copy at same/nearby position
    - Delete → Removes drawing (with confirmation if referenced)
  - Horizontal line specific:
    - Use in Condition → Adds to condition builder
  - Trendline specific:
    - Create Parallel → Enters parallel line placement mode
  - Fibonacci specific:
    - Flip → Swaps high/low anchor points
  - Close on click outside or Esc

### Step 9: Integrate Horizontal Lines with Condition Builder
- Update `app/client/src/app/conditionDefaults.js`:
  - Add `DRAWING_CONDITION_OPERATORS`:
    - `price_crosses_above` - Price crosses from below to above the line
    - `price_crosses_below` - Price crosses from above to below the line
    - `price_is_above` - Price is currently above the line
    - `price_is_below` - Price is currently below the line
  - Add `createConditionFromHorizontalLine(drawing, section)` function
  - Update `buildOperandOptions()` to include horizontal lines group
  - Add `findConditionsUsingDrawing(drawingId, conditions)` function
- Update `app/client/src/components/ConditionBlock.jsx`:
  - Handle `type: 'horizontalLine'` operands
  - Display line price value in condition preview
  - Update when drawing price changes (dynamic reference)
- Update `app/client/src/components/ConditionDropdown.jsx`:
  - Add "Horizontal Lines" group in dropdown
  - Display line label or auto-generated name "Horizontal Line @ {price}"
  - Show line color indicator

### Step 10: Add Deletion Protection and Visual Indicators
- In Strategy.jsx `handleDrawingDelete()`:
  - Check if drawing is referenced in any condition
  - If referenced, show ConfirmDialog: "This line is used in a condition. Delete anyway?"
  - If confirmed, delete drawing (condition becomes invalid but remains for user to fix)
- Add visual indicator for referenced drawings:
  - In chart.js `createDrawingShapes()`: Add small icon/badge for referenced lines
  - Use a small strategy icon (similar to Sparkles from lucide-react) positioned on the line
  - Different styling (glow effect or badge) to indicate condition linkage
- Update condition display:
  - In ConditionBlock, show current price value of referenced horizontal line
  - Re-render when drawing moves to reflect updated price

### Step 11: Implement Snap-to-Price Functionality
- Add snap toggle to DrawingToolbar (optional Shift key modifier)
- In `drawingUtils.js`:
  - `findNearestOHLC(clickPrice, clickTime, priceData, tolerance)`:
    - Find candle at clicked time
    - Return nearest of Open, High, Low, Close within tolerance
  - `snapToCandle(point, priceData, snapMode)`:
    - For trendlines: snap to High or Low
    - For Fib: snap to swing high (highest high) or swing low (lowest low)
- Visual feedback when snapping occurs (brief highlight)

### Step 12: Create E2E Test Specification
- Create `.claude/commands/e2e/test_chart_drawing_tools.md`:
  - User Story: As a trader, I want to annotate charts with drawing tools
  - Test Steps:
    1. Navigate to Strategy page, load data
    2. Verify drawing toolbar is visible
    3. Select Horizontal Line tool (click or press H)
    4. Click on chart to place horizontal line
    5. Verify line appears at clicked price level
    6. Double-click line to open properties dialog
    7. Change line color and confirm
    8. Verify line color updated
    9. Right-click line, select "Use in Condition"
    10. Verify condition appears in Logic Panel
    11. Select Trendline tool (press T)
    12. Click two points to create trendline
    13. Verify trendline appears connecting the points
    14. Select Fibonacci tool (press F)
    15. Click and drag to create Fib retracement
    16. Verify Fib levels are displayed
    17. Press Esc to return to Pointer tool
    18. Verify tool deselected, can pan/zoom normally
  - Success Criteria: All drawing tools functional, properties dialogs work, condition integration works

### Step 13: Add Keyboard Shortcut Handling
- In Strategy.jsx, update keyboard listener:
  - `H` key → Select Horizontal Line tool (if not in input field)
  - `T` key → Select Trendline tool
  - `F` key → Select Fibonacci tool
  - `Esc` key → Return to Pointer tool, cancel drawing in progress
  - `Delete` or `Backspace` → Delete selected drawing (with confirmation)
- Ensure shortcuts don't conflict with existing shortcuts (+/- zoom, arrows scroll)
- Don't trigger when focus is in input/textarea/select

### Step 14: Run Validation Commands
- Execute server tests: `cd app/server && uv run pytest`
- Execute client build: `cd app/client && npm run build`
- Read `.claude/commands/test_e2e.md`, then execute `.claude/commands/e2e/test_chart_drawing_tools.md`

## Testing Strategy

### Unit Tests
- Test `drawingUtils.js` functions:
  - `calculateFibonacciLevels()` with various price ranges
  - `calculateTrendlineSlope()` with different point combinations
  - `snapToPrice()` with edge cases (exact match, boundary)
  - `extendTrendline()` with both/neither/single direction extensions
- Test `conditionDefaults.js` updates:
  - `createConditionFromHorizontalLine()` generates correct condition structure
  - `buildOperandOptions()` includes horizontal lines group
  - `findConditionsUsingDrawing()` finds all referencing conditions

### Edge Cases
- Drawing at chart boundaries (first/last candle)
- Drawing when no price data loaded (should be disabled)
- Maximum drawings limit reached (show warning, prevent new)
- Deleting drawing while properties dialog open
- Rapid tool switching
- Drawing while chart is zoomed/scrolled
- Trendline with same start/end point (should be rejected or show error)
- Fibonacci with zero range (should be rejected)
- Very small price movements (precision handling)
- Horizontal line at exact candle OHLC value (snap test)
- Concurrent drawing and condition editing
- localStorage with corrupted drawing data (graceful recovery)

## Acceptance Criteria

### Drawing Tools Panel
- [ ] Drawing toolbar visible above or beside chart area when chart is displayed
- [ ] Tools available: Pointer (default), Horizontal Line, Trendline, Fibonacci Retracement
- [ ] Each tool has icon with tooltip description
- [ ] Active tool visually highlighted when selected
- [ ] Keyboard shortcuts work: H (horizontal), T (trendline), F (fibonacci), Esc (pointer)
- [ ] Tool selection persists until different tool selected or Esc pressed

### Horizontal Lines
- [ ] Click anywhere on chart places horizontal line at that price level
- [ ] Line extends across entire visible chart area
- [ ] Price label displayed on Y-axis showing exact price value
- [ ] Line is draggable to adjust price level (vertical movement only)
- [ ] Double-click line opens properties: Price (editable), Color, Style, Thickness, Label
- [ ] Right-click context menu: Edit, Duplicate, Delete, Use in Condition
- [ ] Snap-to-price option for precise placement on candle OHLC values
- [ ] Maximum 20 horizontal lines per chart

### Trendlines
- [ ] Click first point, drag to second point creates trendline
- [ ] Line can be extended infinitely in both directions (toggle option)
- [ ] Anchor points (start/end) are draggable to adjust line angle
- [ ] Angle and slope displayed on hover
- [ ] Snap-to-candle option to align with High/Low points
- [ ] Double-click opens properties: Color, Style, Thickness, Extend Left/Right
- [ ] Right-click context menu: Edit, Duplicate, Delete, Create Parallel
- [ ] "Create Parallel" allows clicking to place parallel line
- [ ] Maximum 10 trendlines per chart

### Fibonacci Retracement
- [ ] Click swing low, drag to swing high (or vice versa) creates Fib levels
- [ ] Default levels displayed: 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%
- [ ] Optional extension levels: 127.2%, 161.8%, 261.8%
- [ ] Each level shows price value label
- [ ] Levels can be individually toggled on/off
- [ ] Color customization for each level or all levels
- [ ] Anchor points draggable to adjust range
- [ ] Double-click opens properties: Level visibility, Colors, Show prices, Show percentages
- [ ] Right-click context menu: Edit, Flip (swap high/low), Delete
- [ ] Maximum 5 Fibonacci tools per chart

### Condition Integration
- [ ] Horizontal lines appear as selectable options in condition builder dropdown
- [ ] Lines identified by label or auto-generated name ("Horizontal Line @ 1.0850")
- [ ] Condition types supported: Price crosses above, Price crosses below, Price is above, Price is below
- [ ] Line value updates in condition if line is moved on chart
- [ ] Warning dialog if referenced line is deleted: "This line is used in a condition. Delete anyway?"
- [ ] Condition shows current line price value for clarity
- [ ] Lines used in conditions have special visual indicator

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_chart_drawing_tools.md` E2E test file to validate this functionality works

## Notes

### Technical Considerations
- **Plotly Shapes API**: Use Plotly's native shapes for drawing rendering. This integrates seamlessly with existing chart infrastructure and supports all required line types. Shapes are added to `layout.shapes` array.
- **Coordinate Transformation**: Plotly provides `plotly_click` event with `xaxis.d2p()` and `yaxis.d2p()` for coordinate transformation. Use these for accurate click-to-data mapping.
- **Performance**: With limits of 20+10+5=35 max drawings, performance should not be an issue. Shapes are rendered efficiently by Plotly.
- **State Persistence**: Follow existing localStorage pattern (similar to conditions, groups, reference indicators) for drawing persistence.

### Future Considerations
- **Trendline Alerts**: Could extend to trigger alerts when price touches trendline
- **Drawing Templates**: Save and load drawing configurations as templates
- **Multi-Chart Sync**: Sync drawings across multiple timeframe views
- **Drawing Export/Import**: Export drawings as JSON for sharing/backup
- **Additional Drawing Types**: Rectangles, arrows, text annotations could be added following same pattern

### Dependencies
- No new library dependencies required. Uses existing:
  - Plotly.js for chart rendering and shapes
  - Lucide React for icons
  - Existing color picker pattern from IndicatorSettingsDialog
