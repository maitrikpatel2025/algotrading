# Patch: Fix Plotly Click Event Listener Registration

## Metadata
adw_id: `32ef6eda`
review_change_request: `Issue #1: Clicking on indicator lines does not open the configuration dialog. Testing revealed that plotly_click event listeners are not being attached to the chart element (hasClickListener: false in browser inspection). Resolution: Debug why the Plotly event listener registration in PriceChart.jsx line 95 (chartElement.on('plotly_click', handlePlotlyClick)) is not executing or being cleaned up prematurely. Verify the chartElement ref is correct and the useEffect dependencies are properly configured. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-56-adw-32ef6eda-sdlc_planner-indicator-configuration-modal.md
**Issue:** The Plotly `plotly_click` event listener at PriceChart.jsx:95 is not being registered or is being cleaned up prematurely, preventing users from clicking on indicator lines to open the configuration dialog. Browser inspection shows `hasClickListener: false`.
**Solution:** The issue is that Plotly uses a different API for event listeners. Instead of using `chartElement.on('plotly_click', handler)`, we need to use the correct Plotly.js event listener API which is `chartElement.on('plotly_click', handler)` but the element must be the actual Plotly div, not a stale reference. The real issue is likely that the chartElement reference is being obtained before Plotly finishes rendering, or the event listener method syntax is incorrect for Plotly.js-dist.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/components/PriceChart.jsx` - Fix the Plotly event listener registration syntax and ensure proper timing

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Fix Plotly Event Listener Registration
- Replace the incorrect `chartElement.on('plotly_click', handlePlotlyClick)` syntax with the correct Plotly.js API
- Plotly.js-dist requires using `chartElement.on('plotly_click', handlePlotlyClick)` BUT the element must be the Plotly-rendered div
- The issue is that we're trying to register the listener immediately after `drawChart`, but we need to ensure Plotly has fully rendered
- Use a small timeout or wait for the Plotly render to complete before attaching listeners
- Update the event listener registration to use the correct Plotly.js event API pattern

### Step 2: Verify Event Listener Cleanup
- Ensure the cleanup function properly removes the event listener using `chartElement.removeAllListeners('plotly_click')` or the appropriate Plotly.js cleanup method
- Verify that the cleanup doesn't run prematurely due to dependency array issues

### Step 3: Test the Fix
- Manually test clicking on indicator lines (SMA overlay indicator and Stochastic subchart indicator)
- Verify the configuration dialog opens when clicking on indicator traces
- Inspect the browser console to confirm event listeners are attached
- Verify no console errors related to Plotly events

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/client && npm run build` - Verify frontend builds without errors
2. `cd app/server && uv run pytest` - Verify backend tests pass
3. Manual testing: Start the application with `./scripts/start.sh`, navigate to Strategy page, add SMA and Stochastic indicators, click on the indicator lines to verify the configuration dialog opens
4. Browser inspection: Check that the chartDiv element has `plotly_click` event listeners registered

## Patch Scope
**Lines of code to change:** ~5-10 lines
**Risk level:** low
**Testing required:** Manual testing of indicator click functionality to verify event listeners are registered and the configuration dialog opens. Verify existing functionality (right-click context menu, drag-and-drop) continues to work.
