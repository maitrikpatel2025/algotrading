# Chart Drawing Tools

**ADW ID:** 81932c3d
**Date:** 2026-01-20
**Specification:** specs/issue-78-adw-81932c3d-sdlc_planner-chart-drawing-tools.md

## Overview

This feature implements a complete suite of chart drawing tools that allows traders to annotate price charts with horizontal lines, trendlines, and Fibonacci retracements. Users can interact with drawings via properties dialogs and context menus, customize appearance, and use horizontal lines as inputs to trading strategy conditions.

## What Was Built

- **DrawingToolbar** - Toolbar with tool selection buttons, keyboard shortcuts (H, T, F, Esc), active state indication, and limit warnings
- **Horizontal Lines** - Click-to-place price level lines with drag adjustment
- **Trendlines** - Two-point diagonal lines with anchor point dragging
- **Fibonacci Retracement** - Multi-level retracement tool with customizable levels and extension levels
- **DrawingPropertiesDialog** - Modal dialog for editing drawing properties (color, style, thickness, labels, Fib levels)
- **DrawingContextMenu** - Right-click context menu for drawings (Edit, Duplicate, Delete, Use in Condition)
- **Condition Integration** - Horizontal lines appear as selectable options in condition builder
- **LocalStorage Persistence** - Drawings persist across sessions

## Technical Implementation

### Files Modified

- `app/client/src/app/chart.js`: Added drawing shape rendering using Plotly shapes API, `createDrawingShapes()` and `createDrawingAnnotations()` functions
- `app/client/src/app/constants.js`: Added `DRAWINGS_STORAGE_KEY` for localStorage persistence
- `app/client/src/components/PriceChart.jsx`: Added mouse event handling for drawing creation/editing, coordinate transformation, and drawing mode interactions
- `app/client/src/pages/Strategy.jsx`: Added drawing state management, tool selection handlers, keyboard shortcuts, and condition integration

### New Files Created

- `app/client/src/app/drawingTypes.js`: Type definitions, constants, and default property factories for all drawing types
- `app/client/src/app/drawingUtils.js`: Utility functions for drawing calculations (Fibonacci levels, trendline slope, snap-to-price, validation)
- `app/client/src/components/DrawingToolbar.jsx`: Toolbar component with tool selection and limit indicators
- `app/client/src/components/DrawingPropertiesDialog.jsx`: Modal dialog for editing drawing properties
- `app/client/src/components/DrawingContextMenu.jsx`: Right-click context menu for drawing actions
- `.claude/commands/e2e/test_chart_drawing_tools.md`: E2E test specification

### Key Changes

- Drawing tools use Plotly's native shapes API for efficient rendering integrated with existing chart infrastructure
- Keyboard shortcuts: H (Horizontal Line), T (Trendline), F (Fibonacci), Esc (return to Pointer)
- Drawing limits: 20 horizontal lines, 10 trendlines, 5 Fibonacci retracements per chart
- Snap-to-price functionality for precise placement on candle OHLC values
- Horizontal lines can be used in condition builder with operators: crosses above/below, is above/below

## How to Use

1. Navigate to the Strategy page with price data loaded
2. Locate the Drawing Toolbar above the chart area
3. Select a drawing tool by clicking its button or pressing the keyboard shortcut:
   - **H** - Horizontal Line: Click on chart to place a line at that price level
   - **T** - Trendline: Click first point, then click second point to create a line
   - **F** - Fibonacci: Click and drag from swing low to swing high (or vice versa)
   - **Esc** - Return to Pointer tool
4. To edit a drawing:
   - **Double-click** the drawing to open the Properties Dialog
   - **Right-click** the drawing to open the Context Menu
   - **Drag** the drawing or its anchor points to reposition
5. To use a horizontal line in a condition:
   - Right-click the line and select "Use in Condition"
   - Or select the line from the condition builder dropdown

## Configuration

### Drawing Limits

| Drawing Type | Maximum Count |
|--------------|---------------|
| Horizontal Lines | 20 |
| Trendlines | 10 |
| Fibonacci | 5 |

### Line Style Options

- Solid, Dashed, Dotted
- Line thickness: 1-5 pixels
- Custom colors via color picker

### Fibonacci Default Levels

- Retracement: 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%
- Extensions (disabled by default): 127.2%, 161.8%, 261.8%

### LocalStorage

Drawings are persisted to localStorage using the key defined in `constants.js` (`DRAWINGS_STORAGE_KEY`).

## Testing

Run the E2E test to validate drawing tools functionality:

```bash
# Read and execute the E2E test specification
# Located at: .claude/commands/e2e/test_chart_drawing_tools.md
```

The test verifies:
- Drawing toolbar visibility
- Horizontal line placement and properties editing
- Trendline creation with two points
- Fibonacci retracement creation
- Keyboard shortcuts functionality
- Condition builder integration

## Notes

- Drawings are rendered using Plotly's shapes and annotations API for seamless integration with existing chart infrastructure
- Coordinate transformation uses Plotly's `d2p()` and `p2d()` functions for accurate click-to-data mapping
- Warning indicators appear when approaching drawing limits (80% threshold shows amber warning, 100% shows red limit)
- Condition-linked drawings display a visual indicator to show they are referenced in trading conditions
- Deletion of referenced drawings shows a confirmation dialog warning the user
