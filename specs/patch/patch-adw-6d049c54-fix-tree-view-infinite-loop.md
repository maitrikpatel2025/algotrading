# Patch: Fix LogicTreeView Infinite Render Loop

## Metadata
adw_id: `6d049c54`
review_change_request: `Issue #1: Tree view toggle causes infinite render loop with 'Maximum update depth exceeded' React errors. Once the tree view is activated, the error persists across page reloads and localStorage clears. The LogicTreeView component has a setState call that triggers repeatedly in an endless loop, making the application unstable. Resolution: Fix the infinite setState loop in the LogicTreeView component. The component likely has a useState or useEffect with missing or incorrect dependencies causing continuous re-renders. Review the LogicTreeView.jsx implementation to identify where setState is being called without proper conditions or with circular dependencies. Severity: blocker`

## Issue Summary
**Original Spec:** N/A (blocker bug fix)
**Issue:** The `LogicTreeView` component has a `useEffect` at lines 203-217 with `tree.children` as a dependency. Since `tree` is computed fresh on every render via `buildLogicTree()` at line 42, the array reference changes on each render. This causes the effect to call `setExpandedNodes()`, triggering a re-render, which creates a new `tree`, which runs the effect again - creating an infinite loop.
**Solution:** Replace the `tree.children` dependency with a stable value that only changes when the actual group IDs change. Use `useMemo` to memoize the tree structure and derive a stable dependency (e.g., a JSON string of group IDs) to prevent unnecessary effect executions.

## Files to Modify
- `app/client/src/components/LogicTreeView.jsx` - Fix the infinite loop by stabilizing the useEffect dependency

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add useMemo import and memoize tree computation
- Import `useMemo` from React at line 1
- Wrap the `buildLogicTree()` call in `useMemo` to memoize the tree based on `conditions`, `groups`, and `section`

### Step 2: Fix the useEffect dependency to prevent infinite loop
- Change the useEffect (lines 203-217) to use a stable dependency instead of `tree.children`
- Create a stable string representation of group IDs (e.g., JSON.stringify of sorted group IDs) to use as the dependency
- This ensures the effect only runs when the actual groups change, not on every render

### Step 3: Add initialization guard
- Add a condition to check if nodes need to be added to expandedNodes before calling setExpandedNodes
- This prevents unnecessary state updates when the expanded nodes already contain the group IDs

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Frontend Build**: `cd app/client && npm run build`
   - Verifies no TypeScript/JavaScript compilation errors

2. **Python Syntax Check**: `cd app/server && uv run python -m py_compile server.py core/*.py`
   - Validates Python syntax

3. **Backend Linting**: `cd app/server && uv run ruff check .`
   - Validates Python code quality

4. **All Backend Tests**: `cd app/server && uv run pytest tests/ -v --tb=short`
   - Validates all backend functionality

5. **Manual Verification**: Navigate to Strategy page, toggle to tree view, verify no infinite loop errors in console

## Patch Scope
**Lines of code to change:** ~15-20
**Risk level:** low
**Testing required:** Frontend build must pass; manual verification that tree view toggle works without causing infinite render loop
