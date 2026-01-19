# Patch: Fix Right-Click Context Menu Event Listener

## Metadata
adw_id: `32ef6eda`
review_change_request: `Issue #3: Right-click context menu does not appear when right-clicking on indicator areas. Browser inspection showed no contextmenu event listener is attached (hasContextMenuListener: false). Resolution: Debug the contextmenu event listener registration in PriceChart.jsx. Verify the event listener is being added to the correct element and not being prevented by other handlers or removed prematurely. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-56-adw-32ef6eda-sdlc_planner-indicator-configuration-modal.md
**Issue:** The right-click context menu does not appear when right-clicking on indicator areas. Browser inspection reveals that no contextmenu event listener is attached to the chart element (hasContextMenuListener: false).
**Solution:** Debug and fix the contextmenu event listener registration in PriceChart.jsx:110-164. The listener is currently added to the chartElement but may be getting removed prematurely, not attached to the correct element, or blocked by Plotly's internal event handling.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/components/PriceChart.jsx` - Fix contextmenu event listener registration (lines 110-164)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Verify Event Listener Attachment Point
- The contextmenu listener is currently attached directly to the chartElement (line 151)
- Plotly may be intercepting or preventing this event from firing
- Try attaching to the parent container div with id="chartDiv" or using a wrapper element
- Ensure the element exists before adding the listener

### Step 2: Fix Event Listener Timing Issue
- Current implementation adds the listener synchronously after drawChart (line 151)
- Plotly may be re-rendering or replacing DOM elements after this
- Move contextmenu listener registration inside the setTimeout block (currently at line 104-108) along with plotly_click listener
- This ensures Plotly has fully initialized before attaching listeners
- Alternatively, use Plotly's built-in event system if available for contextmenu

### Step 3: Prevent Premature Cleanup
- Verify the useEffect cleanup function (lines 154-161) is not removing the listener prematurely
- Check if the useEffect dependencies (line 164) are causing unnecessary re-renders
- The current dependency array includes activeIndicators and activePatterns which change frequently
- Consider extracting the event listener logic to a separate useEffect with stable dependencies

### Step 4: Add Event Propagation and Debugging
- Ensure event.preventDefault() is called at the right time (currently line 141)
- Add console.log statements to verify when the listener is attached/removed
- Add console.log inside handleContextMenu to verify it's being called
- Verify Plotly's _hoverdata is populated when right-clicking (line 126)
- Test that chartElement._fullData exists and contains indicator traces with metadata

### Step 5: Verify Indicator Metadata Integrity
- The diagnostic logs at lines 70-76 show traces with metadata
- Verify that indicator traces have both meta.instanceId and proper structure
- Ensure the logic at lines 117-137 can find indicators in _fullData
- The current implementation relies on _hoverdata which may not be populated for right-click events

## Validation
Execute every command to validate the patch is complete with zero regressions.

```bash
# Start the application if not running
./scripts/start.sh

# Wait for application to be ready at http://localhost:3000

# Manual validation:
# 1. Navigate to Strategy page
# 2. Add SMA (20) indicator to chart
# 3. Hover over the SMA line to ensure hover data is populated
# 4. Right-click directly on the SMA line
# 5. Verify context menu appears with Configure, Remove, Duplicate options
# 6. Click outside to close menu
# 7. Add Stochastic (14, 3) indicator
# 8. Right-click on Stochastic indicator in subchart
# 9. Verify context menu appears for subchart indicators
# 10. Open browser DevTools > Elements > Event Listeners
# 11. Verify contextmenu listener is attached to chartDiv element

# Run build to validate no errors
cd app/client && npm run build

# Run server tests to validate no regressions
cd app/server && uv run pytest
```

## Patch Scope
**Lines of code to change:** 5-10 lines (event listener registration and timing)
**Risk level:** low
**Testing required:** Manual testing of right-click functionality on both overlay and subchart indicators, verification of event listener attachment in DevTools
