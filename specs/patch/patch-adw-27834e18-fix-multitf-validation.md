# Patch: Fix multi-timeframe condition validation warning

## Metadata
adw_id: `27834e18`
review_change_request: `Issue #1: Immediately after adding a multi-timeframe condition [H4] EMA(20) is above 0, the condition block displays a warning message 'The referenced indicator from another timeframe has been removed' even though the indicator is present in the Reference Indicators panel below with a calculated value of 1.0918. This is a validation bug that incorrectly flags the condition as having a missing indicator. Resolution: Fix the validation logic in ConditionBlock.jsx or conditionDefaults.js to properly check if the reference indicator exists before showing the 'removed' warning. The condition should not show this error when the reference indicator is present and has a calculated value. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-74-adw-27834e18-sdlc_planner-multi-timeframe-conditions.md`
**Issue:** Multi-timeframe conditions incorrectly show "The referenced indicator from another timeframe has been removed" warning because the `referenceIndicators` prop is not being passed to the `ConditionBlock` component in `LogicPanel.jsx`. The validation logic in `conditionDefaults.js` correctly checks `referenceIndicators`, but receives an empty array because the prop is missing.
**Solution:** Pass the `referenceIndicators` prop to the `ConditionBlock` component in `LogicPanel.jsx` (line ~507-517). The validation logic is correct - the issue is simply that the data isn't being passed to where it's needed.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/components/LogicPanel.jsx` - Add `referenceIndicators` prop to `ConditionBlock` component (line ~517)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add referenceIndicators prop to ConditionBlock in LogicPanel.jsx
- Locate the `<ConditionBlock` component rendering around line 507-517
- Add `referenceIndicators={referenceIndicators}` prop after the existing props (before the closing `/>`)
- The component already receives `referenceIndicators` as a prop (line 80) and it's available in scope

**Code change:**
```jsx
// Before (lines ~507-517):
<ConditionBlock
  condition={condition}
  activeIndicators={activeIndicators}
  activePatterns={activePatterns}
  getIndicatorDisplayName={getIndicatorDisplayName}
  onUpdate={onConditionUpdate}
  onDelete={onConditionDelete}
  onHover={onIndicatorHover}
  isHighlighted={highlightedIndicatorId === (condition.indicatorInstanceId || condition.patternInstanceId)}
  indicatorColor={getConditionColor(condition)}
/>

// After:
<ConditionBlock
  condition={condition}
  activeIndicators={activeIndicators}
  activePatterns={activePatterns}
  getIndicatorDisplayName={getIndicatorDisplayName}
  onUpdate={onConditionUpdate}
  onDelete={onConditionDelete}
  onHover={onIndicatorHover}
  isHighlighted={highlightedIndicatorId === (condition.indicatorInstanceId || condition.patternInstanceId)}
  indicatorColor={getConditionColor(condition)}
  referenceIndicators={referenceIndicators}
/>
```

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd /home/ubuntu/algotrading/trees/27834e18/app/server && uv run python -m py_compile server.py core/*.py` - Python syntax check passes
2. `cd /home/ubuntu/algotrading/trees/27834e18/app/server && uv run ruff check .` - Backend linting passes
3. `cd /home/ubuntu/algotrading/trees/27834e18/app/server && uv run pytest tests/ -v --tb=short` - Backend tests pass
4. `cd /home/ubuntu/algotrading/trees/27834e18/app/client && npm run build` - Frontend build succeeds (validates JSX syntax)
5. Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_multi_timeframe_conditions.md` - E2E test passes, verifying multi-timeframe conditions no longer show false validation warnings

## Patch Scope
**Lines of code to change:** 1 (add one prop line)
**Risk level:** low
**Testing required:** E2E validation of multi-timeframe condition workflow to confirm warning no longer appears when reference indicator exists
