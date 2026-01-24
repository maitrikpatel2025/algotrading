# Patch: Fix loadStrategies ReferenceError in BacktestLibrary

## Metadata
adw_id: `c3ba5521`
review_change_request: `Issue #1: ReferenceError: Cannot access 'loadStrategies' before initialization. In BacktestLibrary.jsx, the useEffect on line 104-107 calls loadStrategies() on line 106, but loadStrategies is defined later on line 110. This is a JavaScript hoisting issue where the function is used before it's declared. Resolution: Move the loadStrategies function definition (lines 110-119) to appear before the useEffect that uses it (before line 104). Alternatively, move loadStrategies call inside useEffect to after loadBacktests definition, or remove loadStrategies from the dependency array and call it directly after definition. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-120-adw-c3ba5521-sdlc_planner-backtest-config-dialog-ux.md`
**Issue:** BacktestLibrary.jsx has a ReferenceError where useEffect on line 104-107 calls `loadStrategies()` before the function is defined. The function is declared as a `useCallback` on line 110, but it's referenced in the useEffect dependency array on line 107 before initialization.
**Solution:** Move the `loadStrategies` function definition (lines 110-119) to appear before the `useEffect` hook that depends on it (before line 104). This ensures the function is declared before being referenced in the dependency array.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/pages/BacktestLibrary.jsx` - Move loadStrategies function definition before the useEffect that uses it

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Fix function ordering in BacktestLibrary.jsx
- Read `app/client/src/pages/BacktestLibrary.jsx` to confirm current structure
- Move the `loadStrategies` function definition (lines 110-119) to appear immediately after the `loadBacktests` function definition (after line 102, before line 104)
- Ensure the useEffect that calls both functions (lines 104-107) now references both functions that are already defined
- Verify no other code changes are needed

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Verify the fix locally**
   - Command: `cd app/client && npm run build`
   - Purpose: Ensure the build passes without ReferenceError

2. **Run all backend tests**
   - Command: `cd app/server && uv run pytest tests/ -v --tb=short`
   - Purpose: Ensure no backend regressions

3. **Run frontend build**
   - Command: `cd app/client && npm run build`
   - Purpose: Ensure frontend compiles successfully

## Patch Scope
**Lines of code to change:** ~10 lines (moving function definition)
**Risk level:** low
**Testing required:** Verify build passes, manually test BacktestLibrary page loads without errors, confirm strategies load correctly in configuration dialog
