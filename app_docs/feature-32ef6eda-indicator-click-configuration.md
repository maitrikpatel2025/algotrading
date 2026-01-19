# Indicator Click Configuration

**ADW ID:** 32ef6eda
**Date:** 2026-01-19
**Specification:** specs/issue-56-adw-32ef6eda-sdlc_planner-indicator-configuration-modal.md

## Overview

This feature adds interactive click functionality to indicator lines and bands directly on the chart. Users can now left-click on any indicator visualization to open its configuration modal, or right-click to access a context menu with quick actions (Configure, Remove, Duplicate). This provides a more intuitive and direct way to manage indicators compared to clicking badges in the header.

## What Was Built

- **Direct Indicator Click**: Left-click on any indicator line or band to open the configuration dialog
- **Context Menu**: Right-click on indicators to access quick actions menu
- **Indicator Duplication**: Create copies of indicators with the same parameters via context menu
- **Indicator Metadata**: Enhanced chart traces with metadata to enable click detection
- **Smart Positioning**: Context menu intelligently positions itself to stay within viewport bounds

## Technical Implementation

### Files Modified

- `app/client/src/components/IndicatorContextMenu.jsx`: New component implementing a context menu with Configure, Duplicate, and Remove options. Includes viewport-aware positioning and keyboard/click-outside handling.

- `app/client/src/app/chart.js`: Added `customdata` and `meta` fields to all indicator traces (SMA, EMA, Bollinger Bands, Keltner Channel, RSI, MACD) to store `instanceId` and `indicatorId` for click detection.

- `app/client/src/components/PriceChart.jsx`:
  - Added `plotly_click` event listener to detect clicks on indicator traces
  - Added `contextmenu` event listener for right-click detection with Plotly hit-testing
  - Implemented context menu state management
  - Integrated IndicatorContextMenu component

- `app/client/src/pages/Strategy.jsx`:
  - Added `handleIndicatorClick` callback to open settings dialog when indicator is clicked
  - Added `handleIndicatorConfigure` callback for context menu Configure action
  - Added `handleIndicatorDuplicate` callback to create indicator copies with unique instanceIds
  - Connected all handlers to PriceChart component

- `.claude/commands/e2e/test_indicator_click_configuration.md`: Comprehensive E2E test specification for validating click and context menu functionality.

### Key Changes

- **Trace Metadata Enhancement**: Every indicator trace now includes `customdata` array and `meta` object containing the indicator's `instanceId`, enabling accurate mapping from clicked trace back to the indicator instance.

- **Event Handling**: Implemented dual event handling - `plotly_click` for left-click configuration access and native `contextmenu` for right-click menu. The context menu handler uses Plotly's hover system for accurate hit-testing at cursor position.

- **Indicator Duplication Logic**: New functionality creates a complete copy of an indicator with the same parameters but a unique `instanceId` (timestamp-based). The duplicate also auto-creates an associated condition block.

- **Viewport-Aware Positioning**: Context menu calculates its position to ensure it stays within viewport bounds, adjusting horizontally and vertically as needed to prevent off-screen rendering.

- **Event Cleanup**: Proper cleanup of both Plotly and DOM event listeners in useEffect to prevent memory leaks.

## How to Use

### Left-Click to Configure

1. Add one or more indicators to your chart (SMA, EMA, RSI, Bollinger Bands, etc.)
2. Click directly on any indicator line or band in the chart
3. The indicator configuration dialog opens automatically with current parameters pre-filled
4. Modify parameters and click Save to apply changes

### Right-Click Context Menu

1. Right-click on any indicator line or band in the chart
2. A context menu appears near your cursor with three options:
   - **Configure**: Opens the settings dialog (same as left-click)
   - **Duplicate**: Creates a copy of the indicator with identical parameters
   - **Remove**: Removes the indicator from the chart
3. Click an option to execute the action
4. Click outside the menu or press Escape to close without action

### Duplicating Indicators

1. Right-click on an indicator you want to duplicate
2. Select "Duplicate" from the context menu
3. A new instance appears on the chart with the same parameters but a different color
4. Both instances can be configured independently

## Configuration

No additional configuration required. The feature works automatically with all supported indicator types:

- **Overlay Indicators**: SMA, EMA, Bollinger Bands, Keltner Channel
- **Subchart Indicators**: RSI, MACD, Stochastic, ATR

## Testing

The feature includes comprehensive E2E testing coverage:

- Test file: `.claude/commands/e2e/test_indicator_click_configuration.md`
- Validates click detection on overlay and subchart indicators
- Tests context menu positioning and all menu actions
- Verifies duplicate functionality creates working instances
- Confirms keyboard shortcuts (Escape) and click-outside behavior

To run tests:
```bash
# Read and execute the E2E test
# The test will validate all functionality with screenshots
```

## Notes

### Implementation Details

- **Hit-Testing**: Right-click detection uses Plotly's `Fx.hover()` method to trigger synthetic hover at the cursor position, ensuring accurate trace detection even when the mouse isn't already hovering.

- **Trace Identification**: Indicators that create multiple traces (like Bollinger Bands with upper, middle, lower) share the same `instanceId` in their metadata, so clicking any band opens the same configuration.

- **Event Priority**: Left-click opens the configuration dialog immediately. Right-click shows the context menu with Configure as the first option. Both paths provide quick access to configuration.

- **Performance**: Click handlers are lightweight and don't impact chart rendering. Event listeners are properly cleaned up to prevent memory leaks.

### Edge Cases Handled

- Clicking on overlapping indicators returns the topmost trace
- Context menu repositions when near viewport edges
- Multiple rapid clicks are handled gracefully without opening multiple dialogs
- Context menu closes when the indicator is removed via badge while menu is open
- No interference with existing chart zoom, pan, or drag-and-drop functionality

### Future Enhancements

- Hover preview showing indicator parameters without clicking
- Shift+Click multi-select for batch operations
- Indicator locking to prevent accidental configuration changes
- Long-press gesture support for mobile/touch devices
