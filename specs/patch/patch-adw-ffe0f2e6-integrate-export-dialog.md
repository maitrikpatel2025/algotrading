# Patch: Integrate BacktestExportDialog into BacktestResultsSummary

## Metadata
adw_id: `ffe0f2e6`
review_change_request: `Issue #2: The BacktestExportDialog component was created but never integrated into the BacktestResultsSummary component. There are no export buttons visible to users, making the entire export feature (CSV, JSON, PDF) inaccessible despite the backend being fully implemented. Resolution: Import BacktestExportDialog in BacktestResultsSummary.jsx, add export buttons to the header section, and implement state management to control the dialog's open/close state. This was specified in Task 12 of the spec but was not completed. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-127-adw-ffe0f2e6-sdlc_planner-save-backtest-results.md (Task 12)
**Issue:** The BacktestExportDialog component exists at app/client/src/components/BacktestExportDialog.jsx but is not imported or used in BacktestResultsSummary.jsx. Users cannot access the export functionality (CSV, JSON, PDF) because there are no export buttons visible in the UI.
**Solution:** Import BacktestExportDialog component, add export button group to the header section of BacktestResultsSummary, implement state management for dialog open/close, and ensure proper props are passed to the dialog.

## Files to Modify
- `app/client/src/components/BacktestResultsSummary.jsx`

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Import BacktestExportDialog and Add State Management
- Add import for BacktestExportDialog component at the top of BacktestResultsSummary.jsx (after line 20)
- Add state variable for dialog open/close: `const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)`
- Add state variable for selected export format: `const [selectedExportFormat, setSelectedExportFormat] = useState('csv')`

### Step 2: Add Export Button Group to Header Section
- Locate the header section (lines 206-239) in BacktestResultsSummary.jsx
- Add export button group between the title/trades info div and the expand/collapse button
- Create a button group with three export buttons: CSV, JSON, PDF
- Each button should open the BacktestExportDialog with the appropriate format pre-selected
- Use lucide-react Download icon for export buttons
- Style buttons to match existing design patterns (neutral colors, hover states)

### Step 3: Integrate BacktestExportDialog Component
- Add BacktestExportDialog component at the end of the return statement (before closing div)
- Pass required props: `backtestId={backtest?.id}`, `backtestName={results.strategy_name || 'Backtest'}`, `isOpen={isExportDialogOpen}`, `onClose={() => setIsExportDialogOpen(false)}`, `initialFormat={selectedExportFormat}`
- Ensure dialog only renders when backtest object is available

### Step 4: Add Export Button Click Handlers
- Create handler function `handleExportClick(format)` that sets the selected format and opens the dialog
- Wire up each export button to call `handleExportClick` with the appropriate format ('csv', 'json', or 'pdf')

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Python Syntax Check**
   ```bash
   cd app/server && uv run python -m py_compile server.py core/*.py
   ```

2. **Backend Code Quality Check**
   ```bash
   cd app/server && uv run ruff check .
   ```

3. **Frontend Build Check**
   ```bash
   cd app/client && npm run build
   ```

4. **Start Development Server**
   ```bash
   bash scripts/start.sh
   ```

5. **Manual UI Verification**
   - Navigate to Strategy Builder page
   - Load an existing strategy
   - Run a backtest
   - Verify export buttons (CSV, JSON, PDF) are visible in BacktestResultsSummary header
   - Click each export button and verify BacktestExportDialog opens with correct format pre-selected
   - Verify dialog can be closed and reopened

6. **E2E Test: Save Backtest Results**
   ```bash
   /test_e2e save_backtest_results
   ```

## Patch Scope
**Lines of code to change:** ~25 lines (3 imports, 3 state variables, 15 lines for button group UI, 4 lines for dialog component)
**Risk level:** low
**Testing required:** Frontend build verification, manual UI testing to confirm export buttons appear and dialog opens correctly, E2E test for save backtest results feature
