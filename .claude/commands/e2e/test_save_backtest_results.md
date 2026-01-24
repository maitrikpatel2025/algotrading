# E2E Test: Save Backtest Results

## Test Overview
This E2E test validates the save backtest results feature, including notes management and export functionality for completed backtests.

## Prerequisites
- Server is running on `http://localhost:9106`
- Client is running on `http://localhost:9206`
- Database has at least one completed backtest with results
- User is on the backtest results summary page

## Test Steps

### Test 1: Add Notes to Backtest
**Objective:** Verify that users can add custom notes to a completed backtest.

**Steps:**
1. Navigate to a completed backtest results page
2. Locate the "Notes" section
3. Click in the notes textarea
4. Type: "This backtest performed well during trending markets. Consider increasing position size for similar conditions."
5. Wait for auto-save (2 seconds)
6. Verify "Saved just now" message appears
7. Refresh the page
8. Verify notes are still present

**Expected Results:**
- Notes editor is visible and editable
- Character count shows current/max (e.g., 150/2000)
- Auto-save indicator appears after 2 seconds
- Success toast notification appears: "Notes saved successfully"
- Notes persist after page refresh

### Test 2: Export Backtest as CSV
**Objective:** Verify that users can export backtest results in CSV format.

**Steps:**
1. Navigate to a completed backtest results page
2. Click the "Export Results" button
3. Select "CSV" format in the export dialog
4. Verify CSV option description: "Spreadsheet format with all metrics and trades"
5. Click "Export CSV" button
6. Wait for download to complete
7. Open the downloaded CSV file
8. Verify it contains sections: Summary Metrics, Trade Statistics, Risk Metrics, Configuration, Trade List

**Expected Results:**
- Export dialog opens with format options
- CSV download initiates automatically
- Filename format: `[Backtest_Name].csv`
- CSV contains all backtest data properly formatted
- Toast notification: "Backtest exported as CSV successfully"

### Test 3: Export Backtest as JSON
**Objective:** Verify that users can export backtest results in JSON format.

**Steps:**
1. Navigate to a completed backtest results page
2. Click the "Export Results" button
3. Select "JSON" format in the export dialog
4. Verify JSON option description: "Complete data structure for programmatic use"
5. Click "Export JSON" button
6. Wait for download to complete
7. Open the downloaded JSON file
8. Verify it contains keys: metadata, configuration, results, trades

**Expected Results:**
- Export dialog opens with format options
- JSON download initiates automatically
- Filename format: `[Backtest_Name].json`
- JSON is valid and properly formatted
- Contains complete backtest configuration and results
- Toast notification: "Backtest exported as JSON successfully"

### Test 4: Export Backtest as PDF
**Objective:** Verify that users can export backtest results in PDF format.

**Steps:**
1. Navigate to a completed backtest results page
2. Click the "Export Results" button
3. Select "PDF" format in the export dialog
4. Verify PDF option description: "Formatted report for printing and sharing"
5. Click "Export PDF" button
6. Wait for download to complete
7. Open the downloaded PDF file
8. Verify it contains formatted tables with metrics, configuration, and trade list

**Expected Results:**
- Export dialog opens with format options
- PDF download initiates automatically
- Filename format: `[Backtest_Name].pdf`
- PDF is properly formatted with headers, tables, and data
- Toast notification: "Backtest exported as PDF successfully"

### Test 5: Notes Character Limit
**Objective:** Verify that notes field enforces 2000 character limit.

**Steps:**
1. Navigate to a completed backtest results page
2. Locate the notes editor
3. Paste or type text exceeding 2000 characters
4. Verify character count shows 2000/2000 in red
5. Verify additional characters cannot be typed

**Expected Results:**
- Character counter updates in real-time
- Counter turns red when at limit (2000/2000)
- Additional characters beyond 2000 are blocked
- Save button is enabled if notes changed

### Test 6: Export Dialog Cancel
**Objective:** Verify that export dialog can be cancelled.

**Steps:**
1. Navigate to a completed backtest results page
2. Click the "Export Results" button
3. Select a format (CSV, JSON, or PDF)
4. Click "Cancel" button
5. Verify dialog closes without downloading

**Expected Results:**
- Dialog closes immediately
- No download initiated
- No error messages or toasts
- User returns to results page

## Error Scenarios

### Error Test 1: Export Backtest Without Results
**Objective:** Verify proper error handling when exporting a backtest without results.

**Steps:**
1. Navigate to a pending/failed backtest (no results)
2. Attempt to click export button
3. Verify export button is disabled or not visible

**Expected Results:**
- Export functionality not available for backtests without results
- Clear indication that export requires completed backtest
- Error toast: "Backtest has no results to export"

### Error Test 2: Notes Save Failure
**Objective:** Verify error handling when notes fail to save.

**Steps:**
1. Stop the backend server
2. Navigate to a completed backtest results page
3. Add or modify notes
4. Wait for auto-save attempt
5. Verify error toast appears

**Expected Results:**
- Error toast: "Failed to save notes. Please try again."
- Notes remain in editor (not lost)
- Save button remains enabled for retry
- No false success indicators

## Success Criteria
- All notes operations work correctly (add, edit, auto-save, persist)
- All three export formats (CSV, JSON, PDF) download successfully
- Exported files contain complete and accurate data
- Character limits are enforced
- Error handling works as expected
- UI is responsive and provides clear feedback
- No console errors during any test operations

## Test Data Requirements
- At least one completed backtest with:
  - Multiple trades (minimum 10 for meaningful export)
  - Various result metrics (profit, loss, drawdown, etc.)
  - Strategy association
  - Date range spanning multiple months
- Database connection working correctly
- Export API endpoints functional

## Notes
- This test focuses on the core export and notes functionality
- Additional features like metric filtering, bulk export, and comparison view are future enhancements
- Tests should be run with both light and dark mode themes
- Verify mobile responsiveness if applicable
