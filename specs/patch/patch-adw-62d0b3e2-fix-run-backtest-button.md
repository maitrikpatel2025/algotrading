# Patch: Fix Missing Run Backtest Button

## Metadata
adw_id: `62d0b3e2`
review_change_request: `Issue #1: The 'Run Backtest' button is completely missing from the Backtest Configuration page header. Only 'Cancel' and 'Save Backtest' buttons are visible. This makes it impossible to initiate a backtest execution and test the progress visualization feature. The button should appear in the header when editing an existing backtest (isEditing === true), which is the current state. Resolution: The BacktestConfiguration.jsx file shows the button should render conditionally with {isEditing && (<button>Run Backtest</button>)} at line 431-450. Since the URL contains /edit and the page loads backtest data successfully, isEditing should be true. Need to investigate why the button is not rendering - potential React hydration issue, CSS hiding the element, or a regression in the rendering logic. The button must be made visible for users to access the feature. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-106-adw-62d0b3e2-sdlc_planner-backtest-progress-visualization.md
**Issue:** The Run Backtest button is not visible in the Backtest Configuration page header when editing an existing backtest, despite the code being present at lines 431-450.
**Solution:** The code at `BacktestConfiguration.jsx:431-450` is correct with the conditional `{isEditing && (...)}`. The screenshot shows "Edit Backtest" title (line 399 uses same `isEditing` condition), confirming `isEditing` is `true`. The issue is likely a stale build or browser cache. Resolution requires rebuilding the frontend and verifying the button renders. If the build cache is stale, running `npm run build` will resolve it.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/pages/BacktestConfiguration.jsx` - Verify the Run Backtest button code at lines 431-450 is present and correct (no modifications needed if code is correct)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Verify Code Integrity
- Read `app/client/src/pages/BacktestConfiguration.jsx` lines 430-452
- Confirm the following code exists:
  ```jsx
  {isEditing && (
    <button
      onClick={handleRunBacktest}
      disabled={saving || isRunning || !formData.strategy_id}
      className="btn btn-success flex items-center gap-2"
      title={!formData.strategy_id ? 'Select a strategy to run backtest' : 'Run Backtest'}
    >
  ```
- Verify `Play` icon is imported from `lucide-react` at line 3

### Step 2: Rebuild Frontend
- Run `cd app/client && npm run build` to ensure latest code is compiled
- This clears any build cache issues that may prevent the button from appearing

### Step 3: Verify CSS Class Exists
- Confirm `btn-success` class is defined in `app/client/src/index.css` at lines 148-155
- Ensure no CSS rules are hiding or overriding the button visibility

## Validation
Execute every command to validate the patch is complete with zero regressions.

- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/server && uv run ruff check .` - Run linter to check code style
- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/server && uv run ruff format --check .` - Verify code formatting
- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/server && uv run pytest tests/test_backtest_executor.py -v` - Run backtest executor tests
- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/server && uv run pytest` - Run all server tests to validate zero regressions
- `cd /home/ubuntu/algotrading/trees/62d0b3e2/app/client && npm run build` - Run frontend build to validate no TypeScript/compilation errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_backtest_progress_visualization.md` to validate the Run Backtest button is visible and functional

## Patch Scope
**Lines of code to change:** 0 (build cache refresh only)
**Risk level:** low
**Testing required:** Frontend build verification and E2E test for backtest progress visualization to confirm button renders and is functional
