# Backtest Configuration Dialog-Based UX

**ADW ID:** c3ba5521
**Date:** 2026-01-24
**Specification:** specs/issue-120-adw-c3ba5521-sdlc_planner-backtest-config-dialog-ux.md

## Overview

Transformed the backtest configuration experience from a full-page workflow to a dialog-based UX pattern. Configuration now happens in a modal dialog (similar to IndicatorSettingsDialog), while execution and results viewing occur on a dedicated BacktestDashboard page. This change aligns backtest configuration with the Strategy page's pattern, reduces navigation overhead, and provides a more focused user experience.

## What Was Built

- **BacktestConfigurationDialog Component** - Modal dialog containing all backtest configuration forms (strategy selection, date range, position sizing, risk management)
- **BacktestDashboard Page** - Dedicated page for viewing backtest metadata, executing backtests, and analyzing results
- **Updated BacktestLibrary** - Modified to open configuration dialog instead of navigating to full pages
- **Simplified Routing** - Reduced from 3 routes (`/backtests`, `/backtests/new`, `/backtests/:id/edit`) to 2 routes (`/backtests`, `/backtests/:id`)
- **E2E Test Suite** - Comprehensive test coverage for dialog-based workflows

## Technical Implementation

### Files Modified

- `app/client/src/components/BacktestConfigurationDialog.jsx`: New modal dialog component (543 lines) containing all configuration forms with validation, keyboard handlers, and accessibility features
- `app/client/src/pages/BacktestDashboard.jsx`: New dashboard page (537 lines) for backtest execution and results viewing, replacing the configuration-focused BacktestConfiguration page
- `app/client/src/pages/BacktestLibrary.jsx`: Updated to manage configuration dialog state, load strategies, and provide save/save-and-run handlers
- `app/client/src/App.jsx`: Updated routing to use BacktestDashboard and removed `/new` and `/edit` routes
- `.claude/commands/e2e/test_backtest_config_dialog_ux.md`: New E2E test specification (239 lines) validating all dialog workflows

### Key Changes

**BacktestConfigurationDialog Component**
- Modal dialog with backdrop blur overlay following Precision Swiss Design System
- Contains all configuration sections: basic info, strategy selector, date range, account settings, position sizing, risk management, and risk preview chart
- Three action buttons: Cancel (secondary), Save Configuration (primary), Save & Run (success)
- Form validation with error display
- Focus management: focuses name input on open, returns focus to trigger on close
- Keyboard support: ESC to close, prevents body scroll when open
- ARIA attributes for accessibility (role="dialog", aria-modal="true", aria-labelledby)
- Reuses existing sub-components (StrategySelector, DateRangePicker, PositionSizingForm, RiskManagementForm, RiskPreviewChart)

**BacktestDashboard Page**
- Displays backtest metadata in header (name, strategy, pair, timeframe, date range)
- Action buttons: "Edit Configuration" (opens dialog), "Run Backtest" (starts execution)
- Real-time progress tracking via BacktestProgressModal
- Results display via BacktestResultsSummary with equity curve and trade list
- Loads backtest by ID from URL params on mount
- Polls for progress when backtest status is "running"
- Opens BacktestConfigurationDialog for editing configuration

**BacktestLibrary Updates**
- "New Backtest" button opens BacktestConfigurationDialog (not full page navigation)
- "Edit" context menu action opens dialog with pre-filled data
- Clicking backtest card navigates to `/backtests/:id` (dashboard view)
- Loads strategies list on mount for dialog usage
- `handleSaveConfig`: Saves backtest, closes dialog, refreshes list, shows toast
- `handleSaveAndRun`: Saves backtest, navigates to dashboard, auto-starts execution

**Routing Changes**
- Removed `/backtests/new` and `/backtests/:id/edit` routes
- `/backtests/:id` now renders BacktestDashboard (not BacktestConfiguration)
- Updated `isBuilderPage` logic to exclude backtest routes since configuration is dialog-based

## How to Use

### Creating a New Backtest

1. Navigate to `/backtests` (Backtest Library)
2. Click "New Backtest" button
3. BacktestConfigurationDialog opens
4. Fill in configuration:
   - Name and description
   - Select strategy
   - Choose date range (or use presets)
   - Set initial balance and currency
   - Configure position sizing
   - Set risk management rules
   - Preview risk levels on chart
5. Click "Save Configuration" to save without running
6. Or click "Save & Run Backtest" to save and immediately start execution

### Editing an Existing Backtest

1. From Backtest Library: Click the context menu (⋮) on a backtest card and select "Edit"
2. Or from Backtest Dashboard: Click "Edit Configuration" button
3. BacktestConfigurationDialog opens with pre-filled data
4. Make changes to configuration
5. Click "Save Configuration" to save changes

### Viewing Backtest Results

1. Click on a backtest card in Backtest Library
2. Navigate to `/backtests/:id` (BacktestDashboard)
3. View backtest metadata, execution status, and results
4. If backtest is running, see real-time progress
5. If backtest is completed, analyze equity curve, trade list, and statistics

## Configuration

No new configuration options or environment variables required. All existing backtest functionality is preserved with the new UX pattern.

## Testing

The feature includes a comprehensive E2E test suite in `.claude/commands/e2e/test_backtest_config_dialog_ux.md` that validates:

1. Dialog opens from "New Backtest" button (not navigation)
2. Dialog contains all configuration sections
3. Save functionality (closes dialog, refreshes list, shows toast)
4. Save-and-run functionality (navigates to dashboard, starts execution)
5. Edit functionality (opens dialog with pre-filled data)
6. Dashboard displays backtest metadata and execution controls
7. Dashboard "Edit Configuration" button opens dialog
8. Validation errors display correctly
9. Accessibility features (ESC key, keyboard navigation, focus management)
10. Dialog cancel/close behavior

Run the test with:
```bash
# Read E2E test execution guide
cat .claude/commands/test_e2e.md

# Execute the test
# Follow instructions in test_e2e.md to run the test specification
```

## Notes

### Design System Compliance

The implementation follows the Precision Swiss Design System:
- `card` class for section containers
- `btn btn-primary`, `btn-secondary`, `btn-success` for buttons
- `dialog` overlay with backdrop blur
- `shadow-elevated` for modal shadows
- `animate-fade-in` for smooth transitions
- Consistent spacing with `space-y-6`, `gap-4`
- `text-neutral-*` color scales for text hierarchy
- `Loader2` spinning icon for loading states
- `Toast` component for notifications

### UX Benefits

1. **Reduced Navigation**: Configuration happens in dialogs without page transitions
2. **Separation of Concerns**: Configuration (dialog) is separate from execution/analysis (dashboard)
3. **Consistent Patterns**: Aligns with Strategy page where dialogs handle configuration
4. **Simplified Routing**: One route per backtest instead of three
5. **Focused Dashboard**: Dedicated page for backtest execution and results analysis
6. **Improved Workflow**: Quick access to configuration from both library and dashboard views

### Implementation Details

- Dialog manages its own form state internally (similar to IndicatorSettingsDialog)
- When editing, dialog receives `editingBacktest` prop and initializes form state
- When creating new, dialog uses default values with 3-month date range
- Save vs Save-and-Run behavior:
  - **Save**: Persist to backend, close dialog, refresh library, stay on library page
  - **Save-and-Run**: Persist to backend, close dialog, navigate to dashboard, auto-start execution
- Dialog is scrollable for smaller screens
- Loading spinner shown on save buttons during save operation
- Buttons disabled during save to prevent double-submission

### Preserved Functionality

All existing backtest features remain intact:
- Strategy selection with preview (pair, direction, indicator count)
- Date range validation and presets
- Position sizing options (percentage, fixed, risk-based, leverage, compounding)
- Risk management (stop loss, take profit, trailing stop, partial closes)
- Risk preview chart (entry price, SL, TP visualization)
- Real-time progress tracking during execution
- Cancel backtest functionality
- Performance mode toggle
- Results summary with equity curve, trade statistics, and trade list
- All validation rules and error handling
