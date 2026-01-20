# Patch: Pass referenceIndicators prop to ConditionBlock

## Metadata
adw_id: `27834e18`
review_change_request: `Issue #1: Multi-timeframe conditions show incorrect warning 'The referenced indicator from another timeframe has been removed' even though the reference indicator exists and has a calculated value (1.0855). The issue is in LogicPanel.jsx lines 507-517 where ConditionBlock is rendered without passing the referenceIndicators prop, causing validation to fail. Resolution: Pass referenceIndicators prop to ConditionBlock component in LogicPanel.jsx at line 507-517 and also in ConditionGroup.jsx wherever ConditionBlock is rendered. The prop is available in LogicPanel but not being passed down. Severity: blocker`

## Issue Summary
**Original Spec:** N/A
**Issue:** Multi-timeframe conditions show false validation warnings because the `referenceIndicators` prop is not passed to `ConditionBlock` components. The `validateCondition` function in `ConditionBlock.jsx:175` requires this prop to validate multi-timeframe conditions, but it's missing in both `LogicPanel.jsx:507-517` and `ConditionGroup.jsx:283-295`.
**Solution:** Add the `referenceIndicators` prop to all `ConditionBlock` component renders in `LogicPanel.jsx` and `ConditionGroup.jsx`. The prop is already available in `LogicPanel` (received at line 96) and needs to be passed to `ConditionGroup` and then to `ConditionBlock`.

## Files to Modify
Use these files to implement the patch:

1. `app/client/src/components/LogicPanel.jsx` - Add `referenceIndicators` prop to `ConditionBlock` (line 517) and to `ConditionGroup` (line 478)
2. `app/client/src/components/ConditionGroup.jsx` - Accept `referenceIndicators` prop and pass it to `ConditionBlock` (line 295) and recursive `ConditionGroup` renders (line 281)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update ConditionGroup.jsx to accept and pass referenceIndicators prop
- Add `referenceIndicators = []` to the function parameters (around line 48)
- Pass `referenceIndicators={referenceIndicators}` to recursive `ConditionGroup` render at line 263-281
- Pass `referenceIndicators={referenceIndicators}` to `ConditionBlock` render at line 283-295

### Step 2: Update LogicPanel.jsx to pass referenceIndicators to ConditionGroup
- Add `referenceIndicators={referenceIndicators}` to `ConditionGroup` render at lines 460-479

### Step 3: Update LogicPanel.jsx to pass referenceIndicators to ConditionBlock
- Add `referenceIndicators={referenceIndicators}` to `ConditionBlock` render at lines 507-517

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/server && uv run python -m py_compile server.py core/*.py` - Python syntax check
2. `cd app/server && uv run ruff check .` - Backend linting
3. `cd app/server && uv run pytest tests/ -v --tb=short` - Backend tests
4. `cd app/client && npm run build` - Frontend build (validates prop passing and JSX syntax)

## Patch Scope
**Lines of code to change:** ~6 lines (adding 4 prop assignments)
**Risk level:** low
**Testing required:** Frontend build validation and manual verification that multi-timeframe conditions no longer show false warning
