# Patch: Fix Test Logic Button Not Rendering

## Metadata
adw_id: `6d049c54`
review_change_request: `Issue #3: Test Logic button is not rendering despite having conditions present. The code at LogicPanel.jsx lines 541-557 shows the button should appear when sectionConditions.length > 0, which was true (2 conditions existed). The button with FlaskConical icon and 'Test Logic' text is missing from the DOM. Resolution: Investigate the 'Action buttons' div rendering at line 506. Check if sectionConditions variable is properly populated and if the conditional at line 542 is evaluating correctly. Verify that the entire action buttons container is being rendered and not hidden by CSS or removed by React. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-72-adw-6d049c54-sdlc_planner-combine-conditions-and-or-logic.md`
**Issue:** The Test Logic button is not appearing in the DOM despite conditions being present. The section badge correctly shows "2" conditions, and the Add Condition button renders, but the Test Logic button with `ml-auto` styling is missing. Analysis shows the conditional `sectionConditions.length > 0` should evaluate to `true` (same variable shows "2" in badge), but the button is absent from the rendered output.
**Solution:** After extensive analysis, the issue appears to be related to the flex layout with `ml-auto`. When `ml-auto` is applied in a `flex-wrap` container with limited width, the button may be positioned in a way that makes it invisible or clipped. The fix involves restructuring the action buttons layout to ensure all buttons are always visible, moving the Test Logic button to a more reliable position, and adding test IDs for verification.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/components/LogicPanel.jsx` - Lines 506-558: Restructure action buttons layout to ensure Test Logic button visibility

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add data-testid to Test Logic Button for Debugging
- Open `app/client/src/components/LogicPanel.jsx`
- Locate the Test Logic button at line 543
- Add `data-testid="test-logic-button"` attribute to the button element
- This allows easier DOM inspection and E2E testing

### Step 2: Restructure Action Buttons Layout
- The current layout uses `flex flex-wrap gap-2 pt-2` with `ml-auto` on Test Logic button
- The issue is that `ml-auto` in a wrapping flex container can cause unpredictable positioning
- Change the action buttons container structure to use a two-row layout:
  - First row: Add Condition button + Group Selected button (when visible)
  - Second row: Test Logic button (when conditions exist)
- Or alternatively, change to `flex justify-between` with proper grouping
- Implementation:
  - At line 506, change `<div className="flex flex-wrap gap-2 pt-2">` to `<div className="space-y-2 pt-2">`
  - Wrap Add Condition and Group Selected buttons in their own flex container: `<div className="flex flex-wrap gap-2">`
  - Keep Test Logic button in a separate div with proper alignment: `<div className="flex justify-end">`
  - Remove `ml-auto` from Test Logic button since it will be in its own right-aligned container

### Step 3: Verify Button Renders for All Sections with Conditions
- The Test Logic button should appear in any section where `sectionConditions.length > 0`
- Ensure the conditional rendering logic remains: `{sectionConditions.length > 0 && (...button...)}`
- The button should be clearly visible below or next to the Add Condition button

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd /home/ubuntu/algotrading/trees/6d049c54/app/client && npm run build` - Verify frontend builds without errors
2. `cd /home/ubuntu/algotrading/trees/6d049c54/app/server && uv run pytest` - Verify backend tests pass
3. Manual E2E validation:
   - Navigate to Strategy page
   - Add an indicator to the chart to create a condition
   - Verify the Test Logic button with FlaskConical icon appears in the Logic Panel section
   - Verify clicking Test Logic button opens the Test Logic dialog
   - Verify the button appears for all sections that have conditions (Long Entry, Long Exit, Short Entry, Short Exit)
   - Verify the button does NOT appear for sections with no conditions

## Patch Scope
**Lines of code to change:** ~15
**Risk level:** low
**Testing required:** Visual verification that Test Logic button appears when conditions exist, functional verification that clicking the button opens the dialog
