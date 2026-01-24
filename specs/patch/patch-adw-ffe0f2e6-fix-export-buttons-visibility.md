# Patch: Fix Export Buttons Visibility in Backtest Cards

## Metadata
adw_id: `ffe0f2e6`
review_change_request: `Issue #1: Export buttons (CSV, JSON, PDF) are implemented in the code for completed backtest cards but are not visible in the UI. The code shows the buttons should appear below the metrics (ROI, Win, Trades), but the cards appear to have a fixed height that cuts off content. Users cannot access the export functionality from the library view as required by the spec. Resolution: Adjust the card CSS to ensure all content including export buttons is visible, or make the card height dynamic to accommodate the export buttons. The buttons are in the DOM but not visible to users. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-127-adw-ffe0f2e6-sdlc_planner-save-backtest-results.md
**Issue:** Export buttons (CSV, JSON, PDF) are implemented in BacktestLibrary.jsx for completed backtest cards but are not visible in the UI. The buttons exist in the DOM but appear to be cut off by the card container.
**Solution:** Remove any height constraints from backtest cards and ensure the card container properly expands to show all content including the export buttons.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/pages/BacktestLibrary.jsx` - Add explicit spacing/layout classes to ensure export buttons are visible
- `app/client/src/index.css` - Verify `.card` class has no overflow or height constraints

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Inspect card container for overflow constraints
- Open `app/client/src/index.css`
- Verify `.card` class does not have `overflow: hidden` or fixed `height` properties
- If overflow constraints exist, remove them or add a specific class for backtest library cards

### Step 2: Update BacktestLibrary card layout
- Open `app/client/src/pages/BacktestLibrary.jsx`
- Locate the backtest card container (line ~423-427)
- Ensure the card's inner container (`<div className="p-4 space-y-3">`) uses `space-y-3` for consistent vertical spacing
- Verify the export buttons section (lines ~545-570) is properly nested within the card's content area
- Add explicit `flex-shrink-0` class to export buttons container to prevent it from being compressed

### Step 3: Test export buttons visibility
- Start the development server with `cd app/client && npm run dev`
- Navigate to the Backtest Library page
- Verify that completed backtest cards show:
  - Metrics grid (ROI, Win Rate, Trades)
  - Export buttons row (CSV, JSON, PDF) immediately below the metrics
  - All buttons are fully visible and clickable
- Test with different screen sizes to ensure responsive behavior

## Validation
Execute every command to validate the patch is complete with zero regressions.

- `cd app/client && npm run build` - Validate frontend build completes without errors
- Visual inspection: Open Backtest Library in browser and verify export buttons are visible on completed backtest cards
- Click each export button (CSV, JSON, PDF) to verify they open the export dialog
- Test responsive layout at different viewport widths (mobile, tablet, desktop)

## Patch Scope
**Lines of code to change:** 5-10
**Risk level:** low
**Testing required:** Visual inspection in browser, verify export buttons are visible and functional
