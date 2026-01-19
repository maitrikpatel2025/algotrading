# Feature: Open Indicator Configuration on Click

## Metadata
issue_number: `56`
adw_id: `32ef6eda`
issue_json: `{"number":56,"title":"Feature Open Indicator Configuration on Click US-VSB-009","body":"/feature\n\nadw_sdlc_iso\n\n\n\nDrag Pattern Recognition onto Chart\n\nI want to click on an indicator line/area on the chart to open its configuration modal\nSo that I can easily access and modify indicator parameters\nAcceptance Criteria:\n\n Clicking indicator line/band opens configuration modal\n Modal displays indicator name, description, and all configurable parameters\n Current parameter values pre-populated in form fields\n Modal positioned near click point, not obscuring indicator\n Click outside modal or press Escape closes modal\n Right-click indicator shows context menu: Configure, Remove, Duplicate"}`

## Feature Description

This feature adds interactive click functionality to indicator lines and bands directly on the chart, allowing users to open the indicator configuration modal by clicking on the visual representation of the indicator. This provides a more intuitive and direct way to modify indicator settings compared to clicking on badges. Additionally, it includes right-click context menu support for quick actions like Configure, Remove, and Duplicate.

The feature enhances the user experience by making indicator management more intuitive, similar to professional trading platforms like TradingView. Users can click directly on what they see to configure it, rather than having to find and click the corresponding badge.

## User Story

As a forex trader
I want to click on an indicator line/area on the chart to open its configuration modal
So that I can easily access and modify indicator parameters without searching for badges

## Problem Statement

Currently, users can only edit indicators by clicking on their badges in the header section of the PriceChart component. This requires:
1. Scrolling to find the correct badge among multiple active indicators
2. Visual disconnect between the chart element and the control mechanism
3. No way to interact directly with what's displayed on the chart

This creates a less intuitive workflow, especially when multiple indicators are active. Users want to click directly on the visual representation (the indicator line or band) to configure it.

## Solution Statement

Implement Plotly click event handling on indicator traces to detect when users click on indicator lines or bands. When a click is detected on an indicator trace, identify which indicator instance was clicked and open the IndicatorSettingsDialog in edit mode with that indicator's current parameters pre-populated.

Additionally, implement right-click context menu functionality that appears near the click point with options to Configure, Remove, or Duplicate the indicator. The context menu will be positioned intelligently to avoid obscuring the indicator and will close when clicking outside or pressing Escape.

The solution leverages Plotly's `plotly_click` event to capture click events on specific traces, then maps those traces back to indicator instances using trace metadata. For right-click, we'll use the browser's native `contextmenu` event with a custom-styled menu component.

## Relevant Files

Use these files to implement the feature:

- `app/client/src/components/PriceChart.jsx` - Contains the chart component that needs click and right-click event handling for indicator traces. This component already handles drag-and-drop for indicators and manages the chart display.

- `app/client/src/app/chart.js` - Contains the `drawChart` function that creates Plotly traces for indicators. We need to add metadata to indicator traces so they can be identified when clicked, and set up the click event listener.

- `app/client/src/pages/Strategy.jsx` - Manages indicator state and the IndicatorSettingsDialog. We need to add handlers to open the settings dialog when an indicator is clicked on the chart, and manage context menu state.

- `app/client/src/components/IndicatorSettingsDialog.jsx` - The existing dialog component for configuring indicators. No changes needed, but we'll use it to understand the interface for opening in edit mode.

- `app/client/src/app/indicators.js` - Contains indicator definitions including `INDICATOR_TYPES`. Useful for understanding indicator metadata structure.

- `app/client/src/components/ConfirmDialog.jsx` - Reference for dialog/modal patterns used in the application. We can use similar patterns for the context menu component.

### New Files

- `app/client/src/components/IndicatorContextMenu.jsx` - New component that displays a context menu near the click point with options: Configure, Remove, Duplicate. Styled to match the application's UI design system.

- `.claude/commands/e2e/test_indicator_click_configuration.md` - E2E test specification to validate clicking indicators on the chart opens the configuration dialog and context menu works correctly.

### Documentation Files to Read

- `.claude/commands/test_e2e.md` - To understand how to create an E2E test file for this feature
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test file to use as a template
- `.claude/commands/e2e/test_indicator_settings.md` - Reference for testing indicator settings dialog functionality

## Implementation Plan

### Phase 1: Foundation

Set up the infrastructure for capturing click events on indicator traces and mapping them back to indicator instances. This includes:
- Adding metadata to Plotly indicator traces (in `chart.js`) so they can be identified when clicked
- Creating the context menu component with proper styling and positioning logic
- Understanding the existing indicator state management flow in Strategy.jsx

### Phase 2: Core Implementation

Implement the primary click-to-configure functionality:
- Add Plotly `plotly_click` event listener in PriceChart component
- Implement trace-to-indicator mapping logic to identify which indicator was clicked
- Wire up the click handler to open IndicatorSettingsDialog in edit mode
- Implement right-click context menu handling with custom menu component
- Add intelligent positioning logic to prevent the context menu from obscuring the indicator

### Phase 3: Integration

Complete the feature with context menu actions and polish:
- Implement all context menu actions (Configure, Remove, Duplicate)
- Add indicator duplication logic (create new instance with same parameters but different instanceId)
- Ensure proper event handling (close on outside click, close on Escape, prevent default right-click)
- Add visual feedback and hover states for better UX
- Create comprehensive E2E test specification
- Test across different scenarios (overlay indicators, subchart indicators, multiple instances)

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create the IndicatorContextMenu Component

- Create new file `app/client/src/components/IndicatorContextMenu.jsx`
- Implement a context menu component that:
  - Displays a menu with three options: Configure, Remove, Duplicate
  - Positions itself near the click point (x, y coordinates passed as props)
  - Uses portal rendering to appear above all other elements
  - Includes intelligent positioning to stay within viewport bounds
  - Styles match the application's UI design system (using Tailwind classes like existing components)
  - Closes when clicking outside the menu (click away listener)
  - Closes when pressing Escape key
  - Each menu item shows an icon (Settings, X, Copy) using lucide-react icons
- Component props: `isOpen`, `position` (x, y), `indicatorName`, `onConfigure`, `onRemove`, `onDuplicate`, `onClose`
- Reference ConfirmDialog.jsx and IndicatorSettingsDialog.jsx for modal/overlay patterns

### Task 2: Add Metadata to Indicator Traces in chart.js

- Open `app/client/src/app/chart.js`
- Locate the section where indicator traces are created (search for overlay and subchart indicator rendering)
- For each indicator trace created, add custom data to identify it:
  - Add `customdata` field with indicator instanceId
  - Add `meta` field with indicator type information
  - Example: `customdata: [indicatorInstanceId]`, `meta: { indicatorId: indicator.id, instanceId: indicator.instanceId }`
- This metadata will allow us to identify which indicator was clicked when processing Plotly click events
- Ensure both overlay indicators and subchart indicators get this metadata

### Task 3: Add Click Event Handling in PriceChart Component

- Open `app/client/src/components/PriceChart.jsx`
- After the chart is drawn (in the useEffect that calls `drawChart`), add a Plotly click event listener
- Listen for `plotly_click` events on the chart element
- In the click handler:
  - Check if the clicked trace has indicator metadata (customdata or meta)
  - Extract the indicator instanceId from the click data
  - Call a new callback prop `onIndicatorClick(instanceId)` passed from Strategy.jsx
  - Prevent the event from bubbling to avoid unintended side effects
- Add the `onIndicatorClick` prop to PriceChart component signature
- Clean up the event listener in the useEffect cleanup function

### Task 4: Add Right-Click Context Menu Handling in PriceChart Component

- In `app/client/src/components/PriceChart.jsx`, add context menu state:
  - `contextMenu` state object with `{ isOpen: false, position: { x: 0, y: 0 }, indicatorInstanceId: null }`
- Add a `contextmenu` event listener to the chart container element
- In the context menu handler:
  - Prevent default browser context menu with `e.preventDefault()`
  - Check if click is on an indicator trace using Plotly's event data
  - If on an indicator, extract instanceId and position
  - Set contextMenu state to open with position and instanceId
  - If not on an indicator, do nothing (allow default behavior or close existing menu)
- Import and render the IndicatorContextMenu component
- Pass appropriate props including callbacks for Configure, Remove, Duplicate actions
- Wire up callbacks to call the corresponding handler props from Strategy.jsx

### Task 5: Implement Indicator Click Handler in Strategy.jsx

- Open `app/client/src/pages/Strategy.jsx`
- Add a new callback `handleIndicatorClick(instanceId)`
- In this handler:
  - Find the indicator in `activeIndicators` array using the instanceId
  - If found, call `handleEditIndicator(instanceId)` to open the settings dialog in edit mode
  - This reuses the existing edit functionality already implemented for badge clicks
- Pass `handleIndicatorClick` as `onIndicatorClick` prop to PriceChart component
- No changes needed to IndicatorSettingsDialog as it already supports edit mode

### Task 6: Implement Context Menu Action Handlers in Strategy.jsx

- Add handlers for context menu actions that will be passed to PriceChart:
  - `handleIndicatorConfigure(instanceId)` - Same as `handleIndicatorClick`, opens settings dialog
  - `handleIndicatorRemove(instanceId)` - Calls existing `handleRemoveIndicator(instanceId)`
  - `handleIndicatorDuplicate(instanceId)` - New function to duplicate an indicator:
    - Find the indicator by instanceId
    - Create a new instance with same params and color but new unique instanceId
    - Add to activeIndicators array
    - Auto-create a condition for the new instance (like when dropping new indicator)
    - Show success feedback or brief notification
- Pass these handlers to PriceChart component as props
- Update PriceChart to forward these to IndicatorContextMenu component

### Task 7: Add Visual Feedback for Clickable Indicators

- In `app/client/src/app/chart.js`, add hover effects to indicator traces to show they're interactive
- Set `hoverinfo` property on indicator traces to show indicator name and value on hover
- Consider adding subtle cursor pointer indication (may require custom Plotly configuration)
- Ensure the hover state doesn't interfere with existing zoom/pan controls

### Task 8: Handle Edge Cases and Refinement

- Test clicking on different indicator types (overlay vs subchart)
- Test with multiple instances of the same indicator
- Verify context menu positioning works correctly near viewport edges (top, right, bottom, left)
- Ensure context menu closes properly when:
  - Clicking outside the menu
  - Pressing Escape key
  - Clicking a menu action
  - Opening another context menu
- Verify no memory leaks from event listeners (proper cleanup in useEffect)
- Test interaction doesn't interfere with chart zoom/pan controls
- Add error handling for cases where indicator data might be missing

### Task 9: Create E2E Test Specification

- Create `.claude/commands/e2e/test_indicator_click_configuration.md`
- Follow the format from `test_trading_dashboard.md` and `test_indicator_settings.md`
- Include test steps for:
  - Adding indicators to the chart (setup)
  - Clicking on an indicator line to open settings dialog
  - Verifying dialog opens with correct indicator parameters
  - Modifying parameters and saving
  - Right-clicking an indicator to open context menu
  - Using Configure option from context menu
  - Using Remove option from context menu
  - Using Duplicate option from context menu
  - Verifying duplicated indicator appears with same settings but new instance
  - Testing with both overlay and subchart indicators
  - Clicking outside context menu to close
  - Pressing Escape to close context menu
- Include success criteria and screenshot requirements
- Reference the test file format from `.claude/commands/test_e2e.md`

### Task 10: Validation - Run All Tests and Verify Feature

- Read `.claude/commands/test_e2e.md` to understand E2E test execution
- Read and execute the new E2E test file `.claude/commands/e2e/test_indicator_click_configuration.md`
- Verify all test steps pass with screenshots documenting the functionality
- Run `cd app/client && npm run build` to validate no build errors
- Run `cd app/server && uv run pytest` to validate server tests pass
- Manually test the feature end-to-end on the Strategy page:
  - Add multiple indicators (SMA, EMA, RSI, MACD, etc.)
  - Click on each indicator line/area to verify settings dialog opens
  - Right-click on indicators to verify context menu appears
  - Test all context menu actions
  - Verify duplicate functionality creates working copies
  - Test edge cases (viewport boundaries, multiple instances, rapid clicks)

## Testing Strategy

### Unit Tests

Since this is primarily a frontend interaction feature with React components, we'll rely on E2E testing for validation. However, the following aspects should be tested:

- **Trace Metadata Addition**: Verify indicator traces in chart.js include correct customdata and meta fields
- **Event Handler Registration**: Verify click and contextmenu listeners are properly attached and cleaned up
- **Instance ID Mapping**: Verify clicked traces correctly map back to indicator instances
- **Duplicate Logic**: Verify duplicated indicators get unique instanceIds and correct parameters
- **Context Menu Positioning**: Verify context menu stays within viewport bounds

### Edge Cases

- **Multiple Overlapping Indicators**: Clicking where multiple indicators overlap - Plotly should return the topmost trace
- **Subchart Indicators**: Clicking on subchart indicators (RSI, MACD) in separate panes
- **Viewport Boundaries**: Right-clicking near screen edges - context menu should reposition to stay visible
- **Rapid Clicks**: Multiple rapid clicks shouldn't open multiple dialogs or menus
- **No Indicators**: Clicking on chart with no indicators - should not error
- **Removed Indicator**: Context menu open for an indicator that gets removed via badge - should close gracefully
- **Mobile/Touch**: Touch interactions on mobile devices (may not support right-click, that's acceptable)
- **Keyboard Navigation**: Escape key closes context menu and dialog
- **Click Outside**: Clicking outside context menu closes it without triggering chart actions

## Acceptance Criteria

- [ ] Clicking on an indicator line or band on the chart opens the IndicatorSettingsDialog in edit mode
- [ ] The dialog displays the indicator name, description, and all configurable parameters
- [ ] Current parameter values are pre-populated in the form fields
- [ ] The dialog can be closed by clicking outside, pressing Escape, or clicking Cancel
- [ ] Right-clicking on an indicator displays a context menu near the click point
- [ ] Context menu includes three options: Configure, Remove, Duplicate
- [ ] Context menu is positioned to avoid obscuring the indicator and stays within viewport
- [ ] Configure option opens the settings dialog (same as left-click)
- [ ] Remove option removes the indicator from the chart
- [ ] Duplicate option creates a new instance with the same parameters
- [ ] Context menu closes when clicking outside, pressing Escape, or selecting an action
- [ ] Feature works for both overlay indicators (SMA, EMA, BB) and subchart indicators (RSI, MACD)
- [ ] Feature works with multiple instances of the same indicator type
- [ ] Visual feedback (hover states) indicates indicators are clickable
- [ ] No interference with existing chart zoom, pan, or drag-and-drop functionality
- [ ] E2E test passes with comprehensive screenshots

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# Start the application (if not already running)
./scripts/start.sh

# Wait for both frontend and backend to be ready
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

After application is running:

- Read `.claude/commands/test_e2e.md` to understand E2E test execution
- Read and execute `.claude/commands/e2e/test_indicator_click_configuration.md` to validate the click-to-configure and context menu functionality works correctly with comprehensive visual documentation
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Implementation Considerations

- **Plotly Click Events**: The `plotly_click` event provides data about which trace was clicked and the data point. We'll use the trace index and metadata to identify indicators.
- **Trace Identification**: Each indicator trace needs unique metadata. We can use `customdata` array or `meta` object on traces.
- **Event Conflicts**: Clicking should not interfere with chart drag/pan. Plotly handles this by differentiating click from drag gestures.
- **Context Menu Native Override**: Using `e.preventDefault()` on contextmenu event prevents browser's default right-click menu. This is intentional for indicators only.
- **Performance**: Click event handlers are lightweight and shouldn't impact chart rendering performance.

### Future Enhancements

- **Hover Preview**: Show indicator parameters on hover (already partially implemented via hoverinfo)
- **Shift+Click Multi-Select**: Allow selecting multiple indicators for batch operations
- **Indicator Locking**: Prevent accidental clicks by locking indicators (toggle lock icon in context menu)
- **Custom Context Menu Items**: Allow plugins to add custom context menu items for specific indicator types
- **Touch Gestures**: Long-press on mobile to show context menu (requires additional touch event handling)
- **Indicator Linking**: Link indicator parameters together (e.g., fast and slow EMAs) for coordinated editing

### Design Decisions

- **Context Menu vs Modal**: We use a lightweight context menu for quick actions and the existing modal for detailed configuration. This follows the principle of progressive disclosure.
- **Duplicate vs Copy**: "Duplicate" creates an immediate copy with the same settings. This is faster than manually adding and configuring another instance.
- **Reuse Existing Dialog**: We reuse IndicatorSettingsDialog instead of creating a new modal, maintaining consistency and reducing code duplication.
- **Click Priority**: Left-click opens settings dialog directly. Right-click shows context menu with Configure as the first option. Both paths lead to configuration, providing flexibility.

### Testing Notes

- The E2E test should verify both overlay and subchart indicators since they render differently
- Context menu positioning near edges requires viewport size in test to be consistent
- Screenshots should capture the context menu positioned correctly without obscuring the indicator
- Test should verify indicator duplication creates functional instances, not just visual copies
