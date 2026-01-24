# Patch: Add Export Buttons to BacktestLibrary Cards

## Metadata
adw_id: `ffe0f2e6`
review_change_request: `Issue #3: The spec required updating the BacktestLibrary page to show export quick action buttons on completed backtest cards and display key result metrics (Task 11). No changes were made to BacktestLibrary.jsx, so users cannot export from the library view. Resolution: Update BacktestLibrary.jsx to add export quick action buttons to completed backtest cards and display ROI, win rate, and total trades badges on each card as specified in the spec. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-127-adw-ffe0f2e6-sdlc_planner-save-backtest-results.md (Task 11)
**Issue:** BacktestLibrary.jsx was not updated to include export quick action buttons on completed backtest cards. While the BacktestResultsSummary.jsx now has export functionality (CSV, JSON, PDF buttons), users cannot export directly from the library view as specified in Task 11.
**Solution:** Add export quick action buttons (CSV, JSON, PDF) to completed backtest cards in BacktestLibrary.jsx and integrate the BacktestExportDialog component. The results metrics (ROI, Win Rate, Total Trades) are already displayed on cards (lines 481-526), so only export buttons need to be added.

## Files to Modify
- `app/client/src/pages/BacktestLibrary.jsx` - Add import for BacktestExportDialog, add state for export dialog, add export button to completed backtest cards

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Import BacktestExportDialog and Download icon
- Add `Download` to the lucide-react imports at line 7
- Add import for BacktestExportDialog component: `import BacktestExportDialog from '../components/BacktestExportDialog';`

### Step 2: Add export dialog state management
- Add state for export dialog after existing dialog states (around line 83):
  - `const [exportDialogOpen, setExportDialogOpen] = useState(false);`
  - `const [exportingBacktest, setExportingBacktest] = useState(null);`
  - `const [selectedExportFormat, setSelectedExportFormat] = useState('csv');`

### Step 3: Add export handler function
- Add handler function after `handleSaveAndRun` (around line 246):
```javascript
const handleExportClick = (backtest, format, e) => {
  if (e) e.stopPropagation();
  setExportingBacktest(backtest);
  setSelectedExportFormat(format);
  setExportDialogOpen(true);
  setOpenMenuId(null);
};
```

### Step 4: Add export quick action buttons to completed backtest cards
- Locate the "Results Preview for Completed Backtests" section (line 480)
- After the results metrics grid (after line 526), add export button group:
```javascript
{/* Export Quick Actions */}
<div className="flex items-center gap-1 pt-2">
  <button
    type="button"
    onClick={(e) => handleExportClick(backtest, 'csv', e)}
    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
    title="Export as CSV"
  >
    <Download className="h-3 w-3" />
    CSV
  </button>
  <button
    type="button"
    onClick={(e) => handleExportClick(backtest, 'json', e)}
    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
    title="Export as JSON"
  >
    <Download className="h-3 w-3" />
    JSON
  </button>
  <button
    type="button"
    onClick={(e) => handleExportClick(backtest, 'pdf', e)}
    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
    title="Export as PDF"
  >
    <Download className="h-3 w-3" />
    PDF
  </button>
</div>
```

### Step 5: Add BacktestExportDialog component to render
- After the BacktestConfigurationDialog component (after line 587), add:
```javascript
{/* Export Dialog */}
{exportingBacktest && (
  <BacktestExportDialog
    backtestId={exportingBacktest.id}
    backtestName={exportingBacktest.name}
    isOpen={exportDialogOpen}
    onClose={() => setExportDialogOpen(false)}
    initialFormat={selectedExportFormat}
  />
)}
```

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/client && npm run build` - Verify frontend builds without errors
2. `cd app/server && uv run pytest tests/ -v --tb=short` - Verify all backend tests pass
3. Start the application and verify:
   - Navigate to Backtests library page
   - Verify completed backtest cards show ROI, Win Rate, and Total Trades metrics
   - Verify export buttons (CSV, JSON, PDF) appear on completed backtest cards
   - Click CSV button and verify BacktestExportDialog opens with CSV pre-selected
   - Click JSON button and verify BacktestExportDialog opens with JSON pre-selected
   - Click PDF button and verify BacktestExportDialog opens with PDF pre-selected
   - Verify export buttons do not trigger card navigation
   - Verify export functionality works from library view

## Patch Scope
**Lines of code to change:** ~40 lines (3 imports, 3 state variables, 1 handler function, 1 export button group, 1 dialog component)
**Risk level:** low
**Testing required:** Frontend build validation, manual UI testing of export buttons on library cards, verify export dialog integration
