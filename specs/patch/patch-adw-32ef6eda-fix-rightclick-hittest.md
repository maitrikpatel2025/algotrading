# Patch: Fix Right-Click Context Menu Hit-Testing

## Metadata
adw_id: `32ef6eda`
review_change_request: `Issue #1: Right-click context menu relies on chartElement._hoverdata to detect which indicator was clicked (PriceChart.jsx lines 120-129). However, Plotly's hover data is typically not populated or reliable during right-click events, only during hover events. This means right-clicking on an indicator may not trigger the context menu at all, or may trigger it for the wrong indicator if hover data is stale from a previous hover action. Resolution: Implement proper hit-testing for right-click events instead of relying on hover data. Options: 1) Use Plotly's built-in event system to get click coordinates and manually determine which trace is at that position, 2) Add oncontextmenu handlers directly to indicator traces if Plotly supports it, 3) Use a ray-casting or geometric approach to determine which indicator trace is at the right-click coordinates based on the plotted data points and trace positions. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-56-adw-32ef6eda-sdlc_planner-indicator-configuration-modal.md
**Issue:** The right-click context menu in PriceChart.jsx (lines 120-129) relies on `chartElement._hoverdata` to detect which indicator was clicked. Plotly's hover data is not reliably populated during right-click events, causing the context menu to either not appear or show for the wrong indicator based on stale hover state.
**Solution:** Replace hover data dependency with proper hit-testing using Plotly's built-in event system. Trigger a synthetic hover event at the right-click coordinates before checking hover data, ensuring accurate indicator detection at the exact cursor position.

## Files to Modify
- `app/client/src/components/PriceChart.jsx` - Replace `_hoverdata` check with proper hit-testing using Plotly.Fx.hover()

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Implement Proper Hit-Testing for Right-Click
- Replace the current `handleContextMenu` function (lines 104-146) with proper hit-testing logic
- Use `Plotly.Fx.hover()` to trigger a synthetic hover event at the right-click coordinates
- This ensures hover data is populated at the exact cursor position before we check it
- Convert event.clientX/Y to chart-relative coordinates for accurate positioning
- Extract indicator metadata from the hover result
- If an indicator is found at that position, show the context menu; otherwise, allow default behavior

### Step 2: Improve Coordinate Calculation
- Calculate the cursor position relative to the chart's bounding rectangle
- Use `chartElement.getBoundingClientRect()` to get chart position
- Convert `event.clientX - rect.left` and `event.clientY - rect.top` for chart-relative coordinates
- Pass these coordinates to `Plotly.Fx.hover()` to trigger hover at the exact click location

### Step 3: Handle Edge Cases
- Check if `Plotly.Fx.hover()` successfully populated hover data
- Verify the hovered point belongs to an indicator trace (has `meta.instanceId`)
- Clear any previous context menu state if no indicator is found
- Add error handling in case Plotly.Fx is unavailable or fails

## Validation
Execute every command to validate the patch is complete with zero regressions.

```bash
# Read and execute the E2E test for indicator click configuration
# This test validates that right-clicking on indicators properly detects them
cat .claude/commands/e2e/test_indicator_click_configuration.md

# Run frontend build to validate no syntax errors
cd app/client && npm run build

# Run backend tests to ensure no regressions
cd app/server && uv run pytest
```

Manual validation:
1. Start the application with `./scripts/start.sh`
2. Navigate to the Strategy page
3. Add multiple indicators (SMA, RSI, MACD)
4. Right-click directly on each indicator line/area
5. Verify context menu appears immediately at cursor position
6. Verify context menu shows correct indicator name
7. Test rapid right-clicks on different indicators to ensure accurate detection
8. Test right-clicking on areas without indicators (should not show context menu)

## Patch Scope
**Lines of code to change:** 15-20 lines
**Risk level:** low
**Testing required:** E2E test for indicator click configuration, manual validation of right-click behavior on multiple indicator types
