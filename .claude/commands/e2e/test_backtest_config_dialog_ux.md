# E2E Test: Backtest Configuration Dialog UX

## Test Description
This E2E test validates the transformation of backtest configuration from a full-page workflow to a dialog-based UX pattern. It ensures that configuration happens through BacktestConfigurationDialog, navigation leads to BacktestDashboard, and all existing functionality is preserved.

## Prerequisites
- Application server is running (`./scripts/start.sh`)
- Browser automation is available
- Test data includes at least one saved strategy

## Test Steps

### 1. Navigate to Backtest Library
**Action:** Navigate to `/backtests`
**Expected:** Backtest library page loads successfully with "New Backtest" button visible
**Screenshot:** `01-backtest-library.png`

### 2. Open Configuration Dialog via New Backtest Button
**Action:** Click "New Backtest" button
**Expected:**
- BacktestConfigurationDialog opens as modal overlay
- Dialog displays title "Configure Backtest"
- Dialog contains all configuration sections:
  - Basic Information (Name, Description)
  - Strategy selector
  - Date range picker
  - Account Settings (Initial Balance, Currency)
  - Position Sizing form
  - Risk Management form and preview chart
- Three footer buttons visible: Cancel, Save Configuration, Save & Run Backtest
**Screenshot:** `02-new-backtest-dialog-opened.png`

### 3. Verify Dialog Contains All Configuration Sections
**Action:** Scroll through dialog content
**Expected:**
- All form sections render correctly
- Strategy selector shows strategies
- Date range has default 3-month period
- Position sizing shows method options
- Risk management form displays all fields
- Risk preview chart renders
**Screenshot:** `03-dialog-full-content.png`

### 4. Fill In Backtest Configuration
**Action:** Fill in configuration fields:
- Name: "E2E Test Backtest - Dialog UX"
- Description: "Testing dialog-based configuration"
- Select first available strategy
- Keep default date range
- Set initial balance to $20,000
- Currency: USD
- Position sizing: 2% percentage method
**Expected:** All fields accept input and update correctly
**Screenshot:** `04-dialog-filled-configuration.png`

### 5. Test Cancel Button
**Action:** Click "Cancel" button
**Expected:**
- Dialog closes
- Returns to backtest library
- No backtest created
**Screenshot:** `05-after-cancel.png`

### 6. Re-open Dialog and Save Configuration
**Action:**
- Click "New Backtest" again
- Fill same configuration as step 4
- Click "Save Configuration" button
**Expected:**
- Dialog shows loading state on button
- Dialog closes after successful save
- Toast notification: "Backtest saved"
- Backtest library refreshes and shows new backtest
**Screenshot:** `06-after-save-library-refreshed.png`

### 7. Verify New Backtest in Library
**Action:** Locate the newly created backtest in the library
**Expected:**
- Backtest card displays with name "E2E Test Backtest - Dialog UX"
- Status shows "Pending"
- Initial balance shows $20,000
- Strategy name displayed
**Screenshot:** `07-new-backtest-card.png`

### 8. Navigate to Dashboard via Card Click
**Action:** Click on the newly created backtest card
**Expected:**
- Navigate to `/backtests/{id}` (BacktestDashboard)
- Page shows backtest name as heading
- Metadata card displays:
  - Strategy name
  - Date range
  - Initial balance
  - Status: Pending
- "Edit Configuration" button visible
- "Run Backtest" button visible
- Pending state message: "Ready to Run"
**Screenshot:** `08-backtest-dashboard.png`

### 9. Open Configuration Dialog from Dashboard
**Action:** Click "Edit Configuration" button on dashboard
**Expected:**
- BacktestConfigurationDialog opens
- Dialog title: "Edit Backtest Configuration"
- All fields pre-filled with existing backtest data
- Name: "E2E Test Backtest - Dialog UX"
- All other fields match saved configuration
**Screenshot:** `09-edit-dialog-from-dashboard.png`

### 10. Update Configuration from Dashboard
**Action:**
- Change name to "E2E Test - Updated via Dashboard"
- Change initial balance to $25,000
- Click "Save Configuration"
**Expected:**
- Dialog closes
- Toast: "Backtest updated successfully"
- Dashboard refreshes with updated data
- Name updated in header
- Initial balance shows $25,000
**Screenshot:** `10-dashboard-after-update.png`

### 11. Return to Library and Edit via Context Menu
**Action:**
- Navigate back to `/backtests`
- Hover over the backtest card
- Click context menu (three dots)
- Click "Edit Configuration"
**Expected:**
- BacktestConfigurationDialog opens
- Dialog pre-filled with current data (updated name and balance)
**Screenshot:** `11-edit-via-context-menu.png`

### 12. Test Save & Run Backtest Flow
**Action:**
- In the configuration dialog, verify all fields
- Click "Save & Run Backtest" button
**Expected:**
- Dialog closes
- Navigates to `/backtests/{id}` (dashboard)
- Progress modal appears
- Backtest execution starts
- Status changes to "Running"
**Screenshot:** `12-save-and-run-execution.png`

### 13. Test Validation Errors
**Action:**
- Return to library
- Click "New Backtest"
- Leave name field empty
- Click "Save Configuration"
**Expected:**
- Dialog remains open
- Validation error shown: "Name is required"
- Save button remains enabled for retry
**Screenshot:** `13-validation-error.png`

### 14. Test Date Range Validation
**Action:**
- Fill name: "Test Validation"
- Set start date after end date
- Click "Save Configuration"
**Expected:**
- Validation error: "Start date must be before end date"
**Screenshot:** `14-date-validation-error.png`

### 15. Test Dialog Close via ESC Key
**Action:**
- With dialog open, press ESC key
**Expected:**
- Dialog closes
- Returns to library
**Screenshot:** `15-esc-key-close.png`

### 16. Test Dialog Close via Backdrop Click
**Action:**
- Open dialog
- Click on backdrop (outside dialog)
**Expected:**
- Dialog closes
**Screenshot:** `16-backdrop-click-close.png`

### 17. Verify Running Backtest Cannot Be Edited During Execution
**Action:**
- Navigate to a running backtest dashboard
**Expected:**
- "Edit Configuration" button is disabled during execution
- Button shows disabled state
**Screenshot:** `17-edit-disabled-during-run.png`

### 18. Test Completed Backtest Dashboard View
**Action:**
- Wait for backtest to complete or navigate to completed backtest
**Expected:**
- Dashboard shows "Completed" status
- BacktestResultsSummary component displays
- "Edit Configuration" button remains functional
- No "Run Backtest" button (already completed)
**Screenshot:** `18-completed-dashboard-with-results.png`

### 19. Verify No Legacy Routes Work
**Action:** Attempt to navigate to:
- `/backtests/new`
- `/backtests/{id}/edit`
**Expected:**
- Routes not found or redirect appropriately
- Configuration only accessible via dialog
**Screenshot:** `19-no-legacy-routes.png`

### 20. Test Dialog Responsiveness on Mobile
**Action:** Resize browser to mobile viewport (375px width)
**Expected:**
- Dialog adjusts to mobile view
- Content remains scrollable
- All fields accessible
- Buttons stack vertically on small screens
**Screenshot:** `20-mobile-responsive-dialog.png`

## Success Criteria
- All 20 test steps pass without errors
- All screenshots captured successfully
- Dialog-based configuration works for create, edit, and save-and-run flows
- Dashboard displays backtest metadata and provides edit access
- Navigation follows new pattern: library → dashboard (not library → config page)
- All validation works correctly
- Accessibility features work (ESC key, focus management)
- No regressions in backtest execution or results display
- Mobile responsive layout works

## Cleanup
After test completion:
- Delete test backtests created during E2E test
- Return application to clean state

## Notes
- This test validates the complete transformation from full-page to dialog-based UX
- Ensures separation of concerns: configuration (dialog) vs execution/results (dashboard)
- Confirms alignment with Strategy page patterns (dialogs for config)
- Validates all acceptance criteria from the feature specification
