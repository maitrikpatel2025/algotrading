# Feature: BacktestConfiguration to Dialog-Based UX

## Metadata
issue_number: `120`
adw_id: `c3ba5521`
issue_json: `{"number":120,"title":"Feature BacktestConfiguration to Dialog-Based UX","body":"/feature\n\nadw_sdlc_iso\n\nCurrently, the `BacktestConfiguration.jsx` page (`app/client/src/pages/BacktestConfiguration.jsx`) serves as a **full-page configuration and dashboard** for backtests. It contains:\n- Full-page layout with configuration forms (strategy selector, date range, position sizing, risk management)\n- Execution controls (Save, Run Backtest buttons)\n- Progress tracking via `BacktestProgressModal` \n- Results display via `BacktestResultsSummary` component inline\n\n### **Desired Transformation**\n\nTransform the backtest configuration experience to match the **Strategy page's indicator pattern**, where:\n- **Configuration settings** are presented in a **dialog/modal popup** (similar to `IndicatorSettingsDialog.jsx`)\n- **Execution results and dashboards** remain on the **main page** (similar to how chart and results are displayed on the Strategy page)\n\n### **Specific Requirements**\n\n#### **1. Create New BacktestConfigurationDialog Component**\n\nCreate a new component `app/client/src/components/BacktestConfigurationDialog.jsx` that:\n\n- **Is a modal/dialog** (not a full page) that opens from the Backtest Library page\n- **Contains all configuration sections** currently in the full-page BacktestConfiguration:\n  - Strategy selector with preview\n  - Date range picker with presets\n  - Initial balance and currency selection\n  - Position sizing form\n  - Risk management form\n  - Risk preview chart\n- **Has a clean dialog header** with:\n  - Title: \"Configure Backtest\" (when creating new) or \"Edit Backtest Configuration\" (when editing)\n  - Close button (X icon)\n- **Footer action buttons**:\n  - \"Cancel\" button (secondary style)\n  - \"Save Configuration\" button (primary style)\n  - \"Save & Run Backtest\" button (success style) - saves config and immediately starts execution\n- **Dialog styling** should follow the existing patterns from:\n  - `IndicatorSettingsDialog.jsx` for overall modal structure\n  - `LoadStrategyDialog.jsx` for layout patterns\n  - Precision Swiss Design System (card, dialog shadow-elevated, rounded-md borders)\n- **Props interface**:\n  ```javascript\n  {\n    isOpen: boolean,\n    onClose: function,\n    onSave: function(backtestConfig),\n    onSaveAndRun: function(backtestConfig),\n    editingBacktest: object | null, // null for new, populated for edit\n    strategies: array // list of available strategies\n  }\n  ```\n\n#### **2. Transform BacktestConfiguration Page into Dashboard Page**\n\nRefactor `app/client/src/pages/BacktestConfiguration.jsx` to become **BacktestDashboard.jsx**:\n\n- **Remove all configuration form UI** (strategy selector, date picker, position sizing, risk management sections)\n- **Keep only execution and results UI**:\n  - Page header with backtest name and basic info\n  - \"Edit Configuration\" button (opens BacktestConfigurationDialog)\n  - \"Run Backtest\" button (if not already running)\n  - Real-time progress display (using BacktestProgressModal or inline)\n  - BacktestResultsSummary component for completed backtests\n  - Equity curve chart\n  - Trade list table\n- **Page structure**:\n \n\n#### **3. Update BacktestLibrary.jsx Integration**\n\nModify `app/client/src/pages/BacktestLibrary.jsx` to:\n\n- **\"New Backtest\" button** opens `BacktestConfigurationDialog` (not navigate to full page)\n- **\"Edit\" action** on backtest cards opens `BacktestConfigurationDialog` with pre-filled data\n- **Clicking a backtest card** navigates to `BacktestDashboard` page (shows execution/results)\n- **After saving in dialog**:\n  - Save-only: Close dialog, refresh library list, show toast \"Backtest saved\"\n  - Save & Run: Close dialog, navigate to BacktestDashboard, show progress modal\n\n#### **4. Routing Updates**\n\nUpdate `app/client/src/App.jsx` routing:\n\n- Change route from `/backtests/new` and `/backtests/:id/edit` to just `/backtests/:id` (dashboard view)\n- No separate \"new\" or \"edit\" routes needed since configuration happens in dialog\n- Route structure:\n  ```javascript\n  /backtests → BacktestLibrary (list view)\n  /backtests/:id → BacktestDashboard (execution & results view)\n  ```\n\n#### **5. State Management Flow**\n\n**In BacktestLibrary:**\n```javascript\nconst [configDialogOpen, setConfigDialogOpen] = useState(false);\nconst [editingBacktest, setEditingBacktest] = useState(null);\n\nconst handleNewBacktest = () => {\n  setEditingBacktest(null);\n  setConfigDialogOpen(true);\n};\n\nconst handleEditBacktest = (backtest) => {\n  setEditingBacktest(backtest);\n  setConfigDialogOpen(true);\n};\n\nconst handleSaveConfig = async (config) => {\n  // Save to backend\n  // Close dialog\n  // Refresh list\n};\n\nconst handleSaveAndRun = async (config) => {\n  // Save to backend\n  // Navigate to dashboard page\n  // Start execution\n};\n```\n\n**In BacktestDashboard:**\n```javascript\nconst { id } = useParams(); // backtest ID from URL\nconst [backtest, setBacktest] = useState(null);\nconst [configDialogOpen, setConfigDialogOpen] = useState(false);\nconst [executionProgress, setExecutionProgress] = useState(null);\nconst [results, setResults] = useState(null);\n\n// Load backtest data on mount\nuseEffect(() => {\n  loadBacktest(id);\n}, [id]);\n\n// Poll for progress if status is \"running\"\n// Display results if status is \"completed\"\n```\n\n#### **6. Preserve All Existing Functionality**\n\nEnsure these features remain intact:\n- Strategy selection with preview (pair, direction, indicator count)\n- Date range validation and presets\n- Position sizing options (percentage, fixed, risk-based, leverage, compounding)\n- Risk management (stop loss, take profit, trailing stop, partial closes)\n- Risk preview chart (entry price, SL, TP visualization)\n- Real-time progress tracking during execution\n- Cancel backtest functionality\n- Performance mode toggle\n- Results summary with equity curve, trade statistics, and trade list\n- All existing validation rules and error handling\n\n#### **7. Design System Compliance**\n\nFollow the **Precision Swiss Design System** established in the codebase:\n- Use `card` class for section containers\n- Use `btn btn-primary`, `btn-secondary`, `btn-success` for buttons\n- Use `dialog` overlay pattern with backdrop blur\n- Use `shadow-elevated` for modal shadows\n- Use `animate-fade-in` for smooth transitions\n- Maintain consistent spacing with `space-y-6`, `gap-4` patterns\n- Use `text-neutral-*` color scales for text hierarchy\n- Implement proper loading states with `Loader2` spinning icon\n- Use `Toast` component for success/error notifications\n\n#### **8. Accessibility Requirements**\n\nMaintain accessibility standards:\n- Dialog should trap focus when open\n- ESC key closes dialog\n- Proper ARIA labels (`role=\"dialog\"`, `aria-modal=\"true\"`, `aria-labelledby`)\n- Focus management (return focus to trigger button on close)\n- Keyboard navigation support\n\n---\n\n### **Summary of Changes**\n\n| **Component** | **Before** | **After** |\n|--------------|-----------|----------|\n| BacktestConfiguration.jsx | Full-page form + dashboard | Dashboard only (rename to BacktestDashboard.jsx) |\n| BacktestConfigurationDialog.jsx | N/A | New modal component with all config forms |\n| BacktestLibrary.jsx | Navigates to full page on \"New\" | Opens dialog on \"New\" |\n| Routing | `/backtests/new`, `/backtests/:id/edit` | `/backtests/:id` (dashboard only) |\n| UX Pattern | Full-page navigation | Dialog-based configuration, page-based execution |\n\n---\n\n\n"}`

## Feature Description

This feature transforms the backtest configuration experience from a full-page workflow to a dialog-based UX pattern that aligns with the Strategy Builder's indicator configuration pattern. The transformation separates configuration (modal dialog) from execution and results viewing (dedicated dashboard page), creating a more intuitive and efficient user experience.

Currently, the BacktestConfiguration page combines configuration forms, execution controls, and results display in a single full-page layout. This creates navigation overhead and mixes distinct user workflows. The new approach follows the established pattern from the Strategy page where configuration happens in lightweight dialogs (similar to IndicatorSettingsDialog) while execution and analysis remain on dedicated pages.

## User Story

As a trader
I want to configure backtests through a quick dialog interface and view execution/results on a dedicated dashboard
So that I can efficiently create, edit, and manage backtest configurations without navigating through multiple pages, while having a focused view for analyzing backtest execution and results

## Problem Statement

The current full-page BacktestConfiguration layout creates several UX friction points:

1. **Navigation Overhead**: Creating or editing a backtest requires full page navigation, disrupting workflow continuity
2. **Mixed Concerns**: Configuration, execution, and results are all on one page, creating cognitive overload
3. **Inconsistent Patterns**: The Strategy page uses dialogs for configuration (IndicatorSettingsDialog, LoadStrategyDialog) while Backtests use full pages, creating inconsistent UX
4. **Inefficient Workflow**: Users must navigate to `/backtests/new` or `/backtests/:id/edit` to configure, then back to library, then to results
5. **Poor Dashboard Experience**: Results are shown inline on the configuration page rather than having a dedicated dashboard for analysis

## Solution Statement

Transform the backtest configuration workflow into a two-component system:

1. **BacktestConfigurationDialog**: A modal dialog component that handles all configuration (strategy selection, date range, position sizing, risk management) accessible from the BacktestLibrary page. This dialog follows the established patterns from IndicatorSettingsDialog and LoadStrategyDialog, providing a lightweight, focused configuration experience.

2. **BacktestDashboard**: A dedicated page for backtest execution and results viewing. This page displays backtest metadata, real-time execution progress, and comprehensive results analysis (equity curve, trade list, statistics).

This approach:
- Reduces navigation by keeping configuration in dialogs
- Separates concerns (configure vs execute/analyze)
- Aligns with established Strategy page patterns
- Provides a dedicated dashboard for in-depth backtest analysis
- Simplifies routing (one route per backtest instead of three)

## Relevant Files

### Existing Files to Modify

- **`app/client/src/pages/BacktestLibrary.jsx`** - Backtest library listing page
  - Add state management for BacktestConfigurationDialog (isOpen, editingBacktest)
  - Change "New Backtest" button to open dialog instead of navigation
  - Change "Edit" menu action to open dialog with pre-filled data
  - Change card click to navigate to BacktestDashboard instead of edit page
  - Add handlers for save (close dialog, refresh list) and save-and-run (navigate to dashboard)

- **`app/client/src/pages/BacktestConfiguration.jsx`** - Current full-page configuration
  - Rename to `BacktestDashboard.jsx`
  - Remove all configuration form sections (strategy selector, date picker, position sizing, risk management)
  - Keep execution controls (Run Backtest button, Cancel button)
  - Keep progress tracking (BacktestProgressModal)
  - Keep results display (BacktestResultsSummary, equity curve, trade list)
  - Add "Edit Configuration" button to open BacktestConfigurationDialog
  - Load backtest data via ID from URL params
  - Display backtest metadata in page header

- **`app/client/src/App.jsx`** - Application routing
  - Remove `/backtests/new` route
  - Remove `/backtests/:id/edit` route
  - Update `/backtests/:id` to render BacktestDashboard (not BacktestConfiguration)
  - Update isBuilderPage logic to exclude backtest routes since dialog handles configuration

### New Files

- **`app/client/src/components/BacktestConfigurationDialog.jsx`** - New modal dialog for backtest configuration
  - Modal dialog with backdrop blur overlay
  - Header with title ("Configure Backtest" or "Edit Backtest Configuration") and close button
  - Form sections:
    - Basic info (name, description)
    - Strategy selector (reuse StrategySelector component)
    - Date range picker (reuse DateRangePicker component)
    - Initial balance and currency
    - Position sizing (reuse PositionSizingForm component)
    - Risk management (reuse RiskManagementForm component)
    - Risk preview chart (reuse RiskPreviewChart component)
  - Footer with three buttons: Cancel (secondary), Save Configuration (primary), Save & Run (success)
  - Props: isOpen, onClose, onSave, onSaveAndRun, editingBacktest, strategies
  - Validation logic from original BacktestConfiguration
  - Focus management and keyboard handlers (ESC to close, Enter to submit)

- **`.claude/commands/e2e/test_backtest_config_dialog_ux.md`** - E2E test specification
  - Test opening dialog from library "New Backtest" button
  - Test dialog displays all configuration sections
  - Test saving configuration (dialog closes, list refreshes)
  - Test save-and-run (navigates to dashboard, starts execution)
  - Test editing existing backtest (dialog pre-fills data)
  - Test dialog cancel/close behavior
  - Test validation errors
  - Test accessibility (keyboard navigation, ESC key, focus management)

### Documentation to Read

Based on `.claude/commands/conditional_docs.md`, this feature requires reading:

- **`README.md`** - Already read, contains project structure and commands
- **`.claude/commands/test_e2e.md`** - Needed for creating E2E test specification
- **`.claude/commands/e2e/test_backtest_configuration.md`** - Example E2E test to understand format and structure
- **`app_docs/feature-b503685d-backtest-configuration.md`** - Documentation on existing backtest configuration functionality
- **`app_docs/feature-2bf4bcfd-backtest-execution-progress-cancel.md`** - Documentation on backtest execution and progress tracking

## Implementation Plan

### Phase 1: Foundation
Create the BacktestConfigurationDialog component and establish the dialog-based configuration pattern. This component will encapsulate all existing configuration logic from BacktestConfiguration page but in a modal format. Ensure all validation, form handling, and sub-components (StrategySelector, DateRangePicker, PositionSizingForm, RiskManagementForm, RiskPreviewChart) work correctly within the dialog.

### Phase 2: Core Implementation
Transform BacktestConfiguration page into BacktestDashboard by removing configuration UI and focusing on execution/results display. Update BacktestLibrary to use the new dialog for configuration instead of page navigation. This phase restructures the user workflow from multi-page navigation to dialog-based configuration.

### Phase 3: Integration
Update routing in App.jsx, ensure state management flows correctly between BacktestLibrary and BacktestDashboard, test all user flows (new backtest, edit backtest, save, save-and-run, cancel), and create comprehensive E2E tests to validate the new UX pattern.

## Step by Step Tasks

### 1. Create BacktestConfigurationDialog Component

- Read `app/client/src/components/IndicatorSettingsDialog.jsx` and `app/client/src/components/LoadStrategyDialog.jsx` to understand existing dialog patterns
- Read `app/client/src/pages/BacktestConfiguration.jsx` to understand all configuration logic that needs to be moved
- Create `app/client/src/components/BacktestConfigurationDialog.jsx` with the following structure:
  - Modal overlay with backdrop blur (follow IndicatorSettingsDialog pattern)
  - Dialog container with card styling, shadow-elevated, rounded-lg
  - Header section: Title (dynamic based on edit mode), close button (X icon)
  - Scrollable content area with all configuration sections:
    - Basic info section: Name input (required), Description textarea
    - Strategy section: StrategySelector component
    - Date range section: DateRangePicker component with presets
    - Account settings section: Initial balance input, Currency selector
    - Position sizing section: PositionSizingForm component
    - Risk management section: Grid layout with RiskManagementForm and RiskPreviewChart
  - Footer section: Three buttons (Cancel, Save Configuration, Save & Run Backtest)
  - Implement props interface: `{ isOpen, onClose, onSave, onSaveAndRun, editingBacktest, strategies }`
  - Add form state management (useState for all config fields)
  - Add validation logic (same as original BacktestConfiguration)
  - Add keyboard handlers (ESC to close, prevent body scroll when open)
  - Add focus management (focus first input on open, return focus on close)
  - Add ARIA attributes for accessibility

### 2. Refactor BacktestConfiguration to BacktestDashboard

- Rename `app/client/src/pages/BacktestConfiguration.jsx` to `app/client/src/pages/BacktestDashboard.jsx`
- Remove all configuration form sections:
  - Basic Info card (name, description inputs)
  - Strategy Selection card
  - Date Range card
  - Account Settings card (initial balance, currency)
  - Position Sizing card
  - Risk Management card and Risk Preview Chart
- Update component imports: Remove form components, keep execution/results components
- Restructure page layout:
  - Page header with backtest name and metadata (strategy, pair, timeframe, date range)
  - Action buttons section: "Edit Configuration" (opens dialog), "Run Backtest" (if not running)
  - Execution status section: Real-time progress or results based on backtest status
  - Results section: BacktestResultsSummary, equity curve, trade list (shown when completed)
- Update state management:
  - Load backtest by ID from URL params on mount
  - Remove form state (moved to dialog)
  - Keep execution state (isRunning, progress, results)
  - Add state for BacktestConfigurationDialog (isOpen, strategies list)
- Add handlers for "Edit Configuration" button (open dialog with current backtest data)
- Update "Run Backtest" handler to work without local form state (uses saved backtest config)
- Ensure BacktestProgressModal and result display logic remains intact

### 3. Update BacktestLibrary Integration

- Open `app/client/src/pages/BacktestLibrary.jsx`
- Add state for BacktestConfigurationDialog:
  - `const [configDialogOpen, setConfigDialogOpen] = useState(false);`
  - `const [editingBacktest, setEditingBacktest] = useState(null);`
  - `const [strategies, setStrategies] = useState([]);`
- Add strategies loading on component mount (call `endPoints.listStrategiesExtended()`)
- Update "New Backtest" button handler:
  - Change from `navigate('/backtests/new')` to open dialog
  - `handleNewBacktest = () => { setEditingBacktest(null); setConfigDialogOpen(true); }`
- Update backtest card click handler:
  - Change from `navigate(/backtests/${id}/edit)` to `navigate(/backtests/${id})`
- Update context menu "Edit" action:
  - Change from navigation to opening dialog with data
  - `handleEditClick = (backtest) => { setEditingBacktest(backtest); setConfigDialogOpen(true); }`
- Add `handleSaveConfig` function:
  - Call `endPoints.saveBacktest(config)`
  - Close dialog on success
  - Refresh backtest list
  - Show toast "Backtest saved"
- Add `handleSaveAndRun` function:
  - Call `endPoints.saveBacktest(config)`
  - Navigate to `/backtests/${id}` on success
  - Dashboard will auto-start execution
- Render BacktestConfigurationDialog component with props:
  - `isOpen={configDialogOpen}`
  - `onClose={() => setConfigDialogOpen(false)}`
  - `onSave={handleSaveConfig}`
  - `onSaveAndRun={handleSaveAndRun}`
  - `editingBacktest={editingBacktest}`
  - `strategies={strategies}`

### 4. Update Routing in App.jsx

- Open `app/client/src/App.jsx`
- Update import: Change `BacktestConfiguration` to `BacktestDashboard`
- Remove route: `<Route path="/backtests/new" element={<BacktestConfiguration />} />`
- Remove route: `<Route path="/backtests/:id/edit" element={<BacktestConfiguration />} />`
- Add/update route: `<Route path="/backtests/:id" element={<BacktestDashboard />} />`
- Update `isBuilderPage` logic in AppLayout:
  - Remove backtest path checks since configuration is now in dialog
  - Keep strategy path checks: `location.pathname.includes('/strategies/') && (location.pathname.includes('/edit') || location.pathname.includes('/new'))`

### 5. Test Core Workflows Manually

- Start the application (`./scripts/start.sh`)
- Navigate to `/backtests` (BacktestLibrary)
- Click "New Backtest" - verify dialog opens
- Fill in all configuration fields in dialog
- Click "Save Configuration" - verify dialog closes, list refreshes, toast appears
- Click on a backtest card - verify navigation to `/backtests/:id` (BacktestDashboard)
- On dashboard, click "Edit Configuration" - verify dialog opens with pre-filled data
- Change configuration and click "Save Configuration" - verify changes persist
- Create new backtest and click "Save & Run Backtest" - verify navigation to dashboard and execution starts
- Test validation: Try saving with missing required fields - verify error messages
- Test cancel: Open dialog, make changes, click Cancel - verify dialog closes without saving
- Test ESC key: Open dialog, press ESC - verify dialog closes
- Test keyboard navigation: Tab through form fields in dialog

### 6. Create E2E Test Specification

- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_backtest_configuration.md` as a reference example
- Create `.claude/commands/e2e/test_backtest_config_dialog_ux.md` with comprehensive test steps:
  - Navigate to `/backtests`
  - Verify "New Backtest" button opens dialog (not navigation)
  - Verify dialog contains all configuration sections
  - Test creating new backtest via dialog
  - Verify save closes dialog and refreshes list
  - Verify save-and-run navigates to dashboard
  - Test editing existing backtest
  - Verify edit opens dialog with pre-filled data
  - Test validation errors in dialog
  - Test cancel/close behavior
  - Test keyboard shortcuts (ESC to close)
  - Verify clicking backtest card navigates to dashboard (not edit page)
  - Verify dashboard has "Edit Configuration" button
  - Verify clicking "Edit Configuration" on dashboard opens dialog
  - Take 15+ screenshots documenting all workflows

### 7. Run Validation Commands

Execute validation commands to ensure zero regressions:

- Run E2E test: `Read .claude/commands/test_e2e.md`, then execute the new E2E test file `.claude/commands/e2e/test_backtest_config_dialog_ux.md` to validate all functionality works correctly
- Run server tests: `cd app/server && uv run pytest` to ensure backend is unaffected
- Run frontend build: `cd app/client && npm run build` to validate no build errors

## Testing Strategy

### Unit Tests

No new backend unit tests required - all changes are frontend UI/UX. Existing backend tests for `/api/backtests` endpoints should continue passing without modification.

Frontend component tests (if implementing):
- BacktestConfigurationDialog: Test dialog open/close, form validation, save handlers
- BacktestDashboard: Test loading backtest data, execution controls, results display
- BacktestLibrary: Test dialog state management, save callbacks

### Edge Cases

1. **Empty Strategy List**: When opening dialog with no saved strategies, verify StrategySelector shows appropriate empty state message
2. **Invalid Date Range**: Test that start_date > end_date shows validation error in dialog
3. **Unsaved Changes Warning**: If implementing, warn user when closing dialog with unsaved changes
4. **Concurrent Edits**: Handle case where backtest is edited in dialog while dashboard is open (refresh on save)
5. **Long Backtest Names**: Test that dialog and dashboard handle very long backtest names gracefully
6. **Network Errors**: Test save failures (API errors) show appropriate error messages and don't close dialog
7. **Missing Backtest Data**: Test dashboard behavior when navigating to `/backtests/:id` with invalid/deleted ID
8. **Running Backtest Edit**: Prevent editing configuration while backtest is running (show message or disable edit button)
9. **Multiple Dialogs**: Ensure only one BacktestConfigurationDialog can be open at a time
10. **Browser Back Button**: Test browser back/forward navigation works correctly with dialog-based workflow

## Acceptance Criteria

1. **Dialog Creation**: BacktestConfigurationDialog component exists and contains all configuration sections from original page
2. **Dialog Styling**: Dialog follows Precision Swiss Design System (backdrop blur, shadow-elevated, card styling, proper spacing)
3. **Dialog Accessibility**: Dialog has proper ARIA labels, focus management, ESC key support, keyboard navigation
4. **New Backtest Flow**: Clicking "New Backtest" in library opens dialog (not navigation), saving creates backtest and closes dialog
5. **Edit Backtest Flow**: Clicking "Edit" on backtest card or menu opens dialog with pre-filled data
6. **Save Functionality**: "Save Configuration" button saves backtest, closes dialog, refreshes library list, shows toast
7. **Save & Run Functionality**: "Save & Run Backtest" button saves backtest, navigates to dashboard, starts execution
8. **Dashboard Creation**: BacktestDashboard page displays backtest metadata, execution controls, progress, and results
9. **Dashboard Navigation**: Clicking backtest card navigates to `/backtests/:id` (dashboard view, not edit page)
10. **Edit from Dashboard**: Dashboard has "Edit Configuration" button that opens BacktestConfigurationDialog
11. **Routing Updated**: App.jsx routes updated to `/backtests/:id` only (no `/new` or `/edit` routes)
12. **Validation Preserved**: All form validation from original BacktestConfiguration works in dialog
13. **Execution Preserved**: Backtest execution, progress tracking, and cancellation work from dashboard
14. **Results Preserved**: Backtest results display (equity curve, trade list, statistics) work from dashboard
15. **No Regressions**: All existing backtest functionality works without regressions
16. **E2E Test Created**: Comprehensive E2E test validates all workflows with 15+ screenshots
17. **E2E Test Passes**: E2E test executes successfully with all assertions passing
18. **Server Tests Pass**: All backend tests pass without modification
19. **Build Success**: Frontend build completes without errors or warnings
20. **UX Consistency**: Backtest configuration UX now matches Strategy page patterns (dialogs for config, pages for analysis)

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

1. Read `.claude/commands/test_e2e.md` to understand E2E test execution
2. Execute `.claude/commands/e2e/test_backtest_config_dialog_ux.md` to run comprehensive E2E test validating:
   - Dialog opens from library "New Backtest" button
   - Dialog contains all configuration sections
   - Save functionality (close dialog, refresh list, toast)
   - Save-and-run functionality (navigate to dashboard, start execution)
   - Edit functionality (open dialog with pre-filled data)
   - Dashboard displays backtest metadata and execution controls
   - Dashboard "Edit Configuration" button opens dialog
   - Validation errors display correctly
   - Accessibility features work (ESC key, keyboard navigation)
   - All screenshots captured successfully
3. `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
4. `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes

### Implementation Considerations

1. **Code Reuse**: BacktestConfigurationDialog should reuse all existing sub-components (StrategySelector, DateRangePicker, PositionSizingForm, RiskManagementForm, RiskPreviewChart) without modification. This minimizes changes and ensures consistency.

2. **State Management**: The dialog will manage its own form state internally, similar to IndicatorSettingsDialog. When editing, it receives `editingBacktest` prop and initializes form state from it. When creating new, it uses default values.

3. **Validation Logic**: Copy validation functions from BacktestConfiguration into the dialog component. Consider extracting shared validation to a utility file if it becomes complex.

4. **Save vs Save-and-Run**: The two save actions differ in behavior:
   - **Save**: Persist to backend, close dialog, refresh library, stay on library page
   - **Save-and-Run**: Persist to backend, close dialog, navigate to dashboard, auto-start execution

5. **Dialog Size**: The configuration form is extensive. Ensure dialog is scrollable and has appropriate max-height to fit on smaller screens. Consider a two-column layout for desktop to reduce vertical scroll.

6. **Loading States**: Add loading spinner to dialog while saving. Disable save buttons during save operation to prevent double-submission.

7. **Error Handling**: If save fails (network error, validation error from backend), show error message in dialog and keep it open so user can correct issues.

8. **Performance**: The dialog renders heavy components (RiskPreviewChart, StrategySelector with strategy list). Ensure it opens quickly by lazy-loading or memoizing expensive calculations.

9. **Mobile UX**: On mobile, dialog should be nearly full-screen for better form interaction. Consider making it a slide-up sheet on small screens.

10. **Focus Management**: When dialog opens, focus the name input field. When dialog closes, return focus to the trigger button (New Backtest or Edit button).

### Future Enhancements

1. **Unsaved Changes Warning**: Add confirmation dialog when user tries to close with unsaved changes
2. **Keyboard Shortcuts**: Add Cmd/Ctrl+S to save, Cmd/Ctrl+Enter to save-and-run
3. **Form Persistence**: Save draft configuration to localStorage to recover if user accidentally closes
4. **Preset Templates**: Allow users to save configuration templates for quick backtest creation
5. **Bulk Operations**: Select multiple backtests in library and configure them with same settings via dialog

### Architectural Benefits

This refactor provides several architectural improvements:

1. **Separation of Concerns**: Configuration logic (dialog) is separate from execution/analysis (dashboard)
2. **Consistent UX Patterns**: Aligns with Strategy page pattern where dialogs handle configuration
3. **Simplified Routing**: One route per backtest instead of three (view, new, edit)
4. **Reduced Navigation**: Dialog-based config eliminates page transitions
5. **Component Reusability**: BacktestConfigurationDialog could be reused in other contexts (e.g., batch backtest creation)
6. **Improved Performance**: Dashboard page is lighter without form rendering overhead
7. **Better Testing**: Dialog and dashboard can be tested independently
