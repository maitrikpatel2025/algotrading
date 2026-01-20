# Patch: Fix Active Indicator Chips Display in Control Bar

## Metadata
adw_id: `81b4393a`
review_change_request: `Issue #1: Active indicators are not displayed as removable chips in the Control Bar. According to the spec (Phase 3, Step 8), when indicators are added to the chart, they should appear as chips/tags in the control bar with a color stripe on the left border and an X button for removal. Currently, indicators can be added (RSI is active in the screenshot) but there are no indicator chips visible in the control bar area. Resolution: Implement the active indicators chip display in the control bar as specified in Step 8: Move active indicators display from PriceChart component to control bar, create removable chip components with indicator color stripe on left border, add X button on each chip for removal, and wire up remove handler to existing onRemoveIndicator callback. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-84-adw-81b4393a-sdlc_planner-strategy-builder-layout.md
**Issue:** Active indicators are not displaying as removable chips in the Control Bar when indicators are added to the chart.
**Solution:** The chip implementation exists in Strategy.jsx but may have visibility issues due to the flex layout. Verify the implementation is correct and ensure chips display properly by adjusting the layout positioning to make them more prominent.

## Analysis
Upon code review, the active indicator chips implementation already exists in Strategy.jsx (lines 2375-2429) with:
- Conditional rendering based on `activeIndicators.length > 0`
- Color stripe on left border via inline style `borderLeft: 3px solid ${indicator.color}`
- X button for removal with `handleRemoveIndicator` callback
- Click handler to open settings dialog via `handleEditIndicator`

The issue appears to be that the chips section is positioned in the middle of a flex container with `flex-1` which may cause visibility issues when there's limited horizontal space. Additionally, the E2E test screenshot shows RSI highlighted/selected in the library but possibly not actually dragged onto the chart.

## Files to Modify

- `app/client/src/pages/Strategy.jsx` - Verify and potentially adjust the Control Bar layout to ensure indicator chips are prominently displayed

## Implementation Steps

### Step 1: Verify Active Indicator Chips Are Rendering Correctly
- Confirm the chip implementation at lines 2375-2429 in Strategy.jsx is complete
- The code should conditionally render when `activeIndicators.length > 0`
- Each chip should have:
  - Color stripe on left border (`style={{ borderLeft: '3px solid ${indicator.color}' }}`)
  - X button for removal
  - Click handler to open settings dialog
- If any of these are missing, add them

### Step 2: Adjust Control Bar Layout for Better Chip Visibility
- Review the Control Bar flex container layout at line 2335
- Current layout: `flex flex-col lg:flex-row lg:items-center gap-4 flex-wrap`
- The chips section has `flex-1` which may cause it to be compressed
- Consider making the chips section always visible on its own row for clarity:
  - Move chips section outside the main flex row OR
  - Add a dedicated row for active indicators when present
- Ensure chips section has minimum visibility even with many controls

### Step 3: Run Validation Tests
- Run `cd app/server && uv run pytest tests/ -v --tb=short` to ensure no backend regressions
- Run `cd app/client && npm run build` to ensure frontend builds successfully
- Visually verify by:
  1. Navigate to Strategy page
  2. Load data for a currency pair
  3. Drag an indicator (e.g., RSI) from the Indicator Library onto the chart
  4. Confirm the indicator chip appears in the Control Bar with color stripe and X button
  5. Click the chip to verify settings dialog opens
  6. Click the X button to verify indicator is removed

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/server && uv run pytest tests/ -v --tb=short` - Run backend tests
2. `cd app/client && npm run build` - Build frontend to catch compilation errors
3. Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_strategy_builder_layout.md` - Run E2E test to verify:
   - Drag RSI indicator onto chart
   - Verify chip appears in Control Bar with color stripe
   - Verify X button removes the indicator
   - Verify clicking chip opens settings dialog

## Patch Scope
**Lines of code to change:** ~10-20 lines (layout adjustment)
**Risk level:** low
**Testing required:** E2E test for Active Indicators Test (steps 14-20 in test_strategy_builder_layout.md)
