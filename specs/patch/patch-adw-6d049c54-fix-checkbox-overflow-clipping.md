# Patch: Fix Selection Checkbox Overflow Clipping

## Metadata
adw_id: `6d049c54`
review_change_request: `Issue #1: Selection checkboxes for conditions are not rendering. The code in LogicPanel.jsx lines 467-483 shows checkboxes should appear with 'absolute -left-1' positioning next to each condition, but these elements are completely missing from the DOM. Without checkboxes, users cannot select multiple conditions to group them together. Resolution: Investigate why the conditional rendering or component structure is preventing the checkboxes from appearing. Check if there's a missing wrapper element, incorrect conditional logic, or if ungroupedConditions.map() is not executing properly. The section may need to be debugged to understand why the selection UI is not being rendered. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-72-adw-6d049c54-sdlc_planner-combine-conditions-and-or-logic.md`
**Issue:** Selection checkboxes for ungrouped conditions are not visible because they use `absolute -left-1` positioning which places them outside the container boundary, and the parent containers have default overflow behavior that clips the content.
**Solution:** Add `overflow-visible` to the section content container to allow the absolutely positioned checkboxes (which extend past the left boundary) to render visibly.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/components/LogicPanel.jsx` - Line 417: Add overflow-visible to the section content container

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add overflow-visible to Section Content Container
- Open `app/client/src/components/LogicPanel.jsx`
- Locate line 417: `<div className="p-3 space-y-3 min-h-[80px]">`
- Change to: `<div className="p-3 space-y-3 min-h-[80px] overflow-visible">`
- This allows the absolutely positioned checkboxes at `-left-1` to render outside the padding boundary

### Step 2: Verify the Checkbox Positioning Remains Correct
- The checkbox button at lines 468-483 uses:
  - `absolute -left-1 top-1/2 -translate-y-1/2 z-10`
  - This positions the checkbox 0.25rem to the left of the condition block
- The parent wrapper at line 463-465 has `className="relative"` which is correct
- The condition block at lines 485-497 has `className="ml-5"` which provides space for the checkbox
- No additional changes needed - the structure is correct, only overflow was the issue

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd /home/ubuntu/algotrading/trees/6d049c54/app/client && npm run build` - Verify frontend builds without errors
2. `cd /home/ubuntu/algotrading/trees/6d049c54/app/server && uv run pytest` - Verify backend tests pass
3. Manual E2E validation: Navigate to Strategy page, add indicators to create conditions, verify checkboxes appear to the left of each ungrouped condition in the Logic Panel, verify clicking checkboxes selects conditions, verify "Group Selected" button appears when 2+ conditions are selected

## Patch Scope
**Lines of code to change:** 1
**Risk level:** low
**Testing required:** Visual verification that checkboxes appear next to ungrouped conditions, functional verification that condition selection and grouping works
