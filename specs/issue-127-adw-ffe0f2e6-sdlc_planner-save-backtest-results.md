# Feature: Save Backtest Results

## Metadata
issue_number: `127`
adw_id: `ffe0f2e6`
issue_json: `{"number":127,"title":"Freature View Trades on Chart US-BT-013","body":"/feature\n\nadw_sdlc_iso\n\nView Trades on Chart\n\n\nSave Backtest Results\n\nI want to save my backtest results for future reference\nSo that I can track strategy development over time\n\n\n \"Save Results\" button after backtest completion\n Auto-generated name: \"[Strategy Name] - [Date] - [Time]\"\n Optional custom name and notes\n Saved results include: all metrics, trade list, configuration used\n Results browser shows all saved backtests\n Sort/filter by strategy, date, performance metrics\n Delete old results option\n"}`

## Feature Description
Implement a comprehensive backtest results management system that allows traders to save, organize, browse, and export backtest results for future reference and comparison. This feature extends the existing backtest infrastructure to provide a results archive with auto-naming, optional custom notes, filtering capabilities, and export functionality. Results are already persisted in the database after backtest completion, but this feature adds user-friendly management, browsing, and export capabilities to make historical backtest data accessible and actionable.

## User Story
As a trader
I want to save my backtest results for future reference
So that I can track strategy development over time and compare different configurations

## Problem Statement
The current backtest system executes backtests and stores results in the database, but there is no user-facing mechanism to:
- View a historical archive of completed backtest results
- Export results in common formats (CSV, JSON, PDF) for external analysis
- Add custom notes or annotations to backtest runs for context
- Compare multiple backtest results side-by-side
- Filter and sort backtest results by performance metrics, strategy, or date
- Organize results with tags or categories for better tracking

Traders need to maintain a historical record of their backtesting work to track strategy evolution, document what works and what doesn't, and make data-driven decisions about strategy improvements.

## Solution Statement
Enhance the existing Backtest Library to function as both a configuration manager and a results archive. Add export capabilities (CSV, JSON, PDF) accessible from both the library view and individual result pages. Implement a notes field for custom annotations on backtest results. Add advanced filtering by performance metrics (ROI, win rate, profit factor, drawdown) and sorting options. Auto-generate descriptive names for backtests using the pattern "[Strategy Name] - [Date] - [Time]" with the option to customize. Provide bulk operations for exporting multiple results and archiving/deleting old results.

## Relevant Files
Use these files to implement the feature:

**Backend - Backtest Service Layer**
- `app/server/core/backtest_service.py` - Contains existing CRUD operations for backtests; extend with export methods, notes update, and advanced filtering/sorting logic
- `app/server/core/data_models.py` - Contains `BacktestConfig`, `BacktestResultsSummary`, and `BacktestListItem` models; add notes field and export-related models

**Backend - Export Generation**
- `app/server/core/backtest_executor.py` - Contains backtest execution and results calculation logic; reference for understanding results structure
- `app/server/utils/export_generators.py` (NEW) - Create utility functions for generating CSV, JSON, and PDF exports from backtest results

**Backend - API Endpoints**
- `app/server/server.py` - Contains existing backtest API endpoints; add new endpoints for export, notes updates, and enhanced listing with metric filtering

**Frontend - Backtest Library**
- `app/client/src/pages/BacktestLibrary.jsx` - Existing library page with grid display, search, filters; enhance with results view, performance metric filters, export buttons
- `app/client/src/components/BacktestResultsSummary.jsx` - Existing results summary component; add export buttons and notes editor

**Frontend - API Client**
- `app/client/src/app/api.js` - Contains existing backtest API methods; add methods for export endpoints, notes updates, and enhanced listing

**Frontend - New Components**
- `app/client/src/components/BacktestNotesEditor.jsx` (NEW) - Component for adding/editing custom notes on backtest results
- `app/client/src/components/BacktestExportDialog.jsx` (NEW) - Dialog for selecting export format (CSV, JSON, PDF) and options
- `app/client/src/components/BacktestComparisonView.jsx` (NEW) - Side-by-side comparison view for multiple backtest results
- `app/client/src/components/MetricFilterPanel.jsx` (NEW) - Advanced filtering by performance metrics (ROI range, win rate range, etc.)

**Database**
- `app/server/db/migrations/004_add_backtest_notes_field.sql` (NEW) - Migration to add notes field to backtests table
- `app/server/scripts/run_migration.py` - Existing migration runner; use to apply new migration

**Testing**
- `app/server/tests/test_backtest_service.py` - Existing tests; add tests for export generation and notes updates
- `app/server/tests/test_export_generators.py` (NEW) - Unit tests for CSV, JSON, PDF export generation

**Documentation**
- Read `.claude/commands/conditional_docs.md` to check for relevant documentation
- Read `app_docs/feature-b503685d-backtest-configuration.md` - Backtest configuration system architecture
- Read `app_docs/feature-632a538d-backtest-summary-statistics.md` - Backtest results summary structure
- Read `.claude/commands/test_e2e.md` - E2E test framework instructions
- Read `.claude/commands/e2e/test_backtest_execution.md` - Example E2E test for backtest features
- Read `.claude/commands/e2e/test_view_trade_list.md` - Example E2E test for trade list features

### New Files
- `app/server/utils/export_generators.py` - Export generation utilities (CSV, JSON, PDF)
- `app/server/db/migrations/004_add_backtest_notes_field.sql` - Database migration for notes field
- `app/server/tests/test_export_generators.py` - Unit tests for export generators
- `app/client/src/components/BacktestNotesEditor.jsx` - Notes editor component
- `app/client/src/components/BacktestExportDialog.jsx` - Export dialog component
- `app/client/src/components/BacktestComparisonView.jsx` - Comparison view component
- `app/client/src/components/MetricFilterPanel.jsx` - Advanced metric filtering component
- `.claude/commands/e2e/test_save_backtest_results.md` - E2E test specification for this feature

## Implementation Plan

### Phase 1: Foundation - Database and Backend Infrastructure
Prepare the data layer and backend utilities to support notes, enhanced filtering, and export generation.

**Tasks:**
1. Add notes field to backtests table via database migration
2. Create export generator utilities for CSV, JSON, and PDF formats
3. Update data models to include notes field
4. Add unit tests for export generators

### Phase 2: Core Implementation - API and Export Functionality
Implement the API endpoints for managing notes, exporting results, and filtering by metrics.

**Tasks:**
1. Extend backtest service with notes update methods
2. Add export endpoints for CSV, JSON, and PDF formats
3. Enhance list endpoint with metric-based filtering and sorting
4. Add API client methods for new endpoints
5. Test all endpoints with unit tests

### Phase 3: Integration - Frontend Components and User Experience
Build the user interface for browsing results, adding notes, exporting data, and comparing backtests.

**Tasks:**
1. Create BacktestNotesEditor component
2. Create BacktestExportDialog component
3. Create MetricFilterPanel component
4. Enhance BacktestLibrary with results view and metric filters
5. Add export buttons to BacktestResultsSummary
6. Implement auto-generated naming convention
7. Build BacktestComparisonView for side-by-side comparison
8. Create E2E test specification
9. Run validation commands to ensure zero regressions

## Step by Step Tasks

### Task 1: Create Database Migration for Notes Field
- Create migration file `004_add_backtest_notes_field.sql` in `app/server/db/migrations/`
- Add `notes` column to `backtests` table as TEXT type, nullable
- Run migration using `app/server/scripts/run_migration.py`
- Verify migration succeeds without errors

### Task 2: Update Data Models with Notes Field
- Open `app/server/core/data_models.py`
- Add `notes: Optional[str] = None` field to `BacktestConfig` model
- Add `notes: Optional[str] = None` field to `BacktestListItem` model
- Ensure serialization/deserialization handles notes field correctly

### Task 3: Create Export Generator Utilities
- Create new file `app/server/utils/export_generators.py`
- Implement `generate_csv_export(backtest_result: BacktestResultsSummary, backtest_config: BacktestConfig) -> str` function
  - Generate CSV with sections: Summary Metrics, Trade Statistics, Risk Metrics, Trade List
  - Include configuration details in header comments
- Implement `generate_json_export(backtest_result: BacktestResultsSummary, backtest_config: BacktestConfig) -> dict` function
  - Create comprehensive JSON structure with all results, configuration, and metadata
- Implement `generate_pdf_export(backtest_result: BacktestResultsSummary, backtest_config: BacktestConfig) -> bytes` function
  - Use ReportLab or similar library (add via `uv add reportlab`)
  - Generate PDF with formatted tables, equity curve chart image, and summary statistics
- Add helper functions for formatting currency, percentages, and dates consistently

### Task 4: Write Unit Tests for Export Generators
- Create new file `app/server/tests/test_export_generators.py`
- Write tests for CSV export generation with sample backtest data
- Write tests for JSON export generation with sample backtest data
- Write tests for PDF export generation (verify PDF bytes are generated)
- Test edge cases: zero trades, negative results, missing data
- Ensure all tests pass with `cd app/server && uv run pytest tests/test_export_generators.py`

### Task 5: Extend Backtest Service with Notes and Export Methods
- Open `app/server/core/backtest_service.py`
- Add `update_notes(backtest_id: str, notes: str) -> BacktestConfig` method
  - Update notes field in database for specified backtest
  - Return updated BacktestConfig
- Add `get_backtest_with_results(backtest_id: str) -> Tuple[BacktestConfig, BacktestResultsSummary]` method
  - Fetch both config and results for export purposes
- Add filtering logic to `list_backtests()` method:
  - Accept optional parameters: `min_roi`, `max_roi`, `min_win_rate`, `max_win_rate`, `min_profit_factor`, `max_profit_factor`, `min_drawdown`, `max_drawdown`
  - Filter backtests by metric ranges from results JSONB field
  - Return only backtests that match all specified filters
- Add sorting logic to `list_backtests()` method:
  - Accept `sort_by` parameter with options: `roi`, `win_rate`, `profit_factor`, `drawdown`, `total_trades`, `created_at`, `updated_at`
  - Sort backtests by specified metric from results JSONB field

### Task 6: Add Export API Endpoints
- Open `app/server/server.py`
- Add `PUT /api/backtests/{id}/notes` endpoint
  - Accept JSON body with `notes` field
  - Call `backtest_service.update_notes()`
  - Return updated backtest config
- Add `GET /api/backtests/{id}/export/csv` endpoint
  - Fetch backtest config and results
  - Call `generate_csv_export()`
  - Return CSV file with appropriate headers (`Content-Type: text/csv`, `Content-Disposition: attachment`)
- Add `GET /api/backtests/{id}/export/json` endpoint
  - Fetch backtest config and results
  - Call `generate_json_export()`
  - Return JSON with appropriate headers
- Add `GET /api/backtests/{id}/export/pdf` endpoint
  - Fetch backtest config and results
  - Call `generate_pdf_export()`
  - Return PDF bytes with appropriate headers (`Content-Type: application/pdf`, `Content-Disposition: attachment`)
- Add `POST /api/backtests/export/bulk` endpoint
  - Accept array of backtest IDs
  - Generate ZIP file containing all exports in specified format
  - Return ZIP file with appropriate headers

### Task 7: Add API Client Methods for New Endpoints
- Open `app/client/src/app/api.js`
- Add `updateBacktestNotes(id, notes)` method
  - PUT request to `/api/backtests/${id}/notes`
  - Return updated backtest config
- Add `exportBacktestCSV(id)` method
  - GET request to `/api/backtests/${id}/export/csv`
  - Trigger browser download
- Add `exportBacktestJSON(id)` method
  - GET request to `/api/backtests/${id}/export/json`
  - Trigger browser download
- Add `exportBacktestPDF(id)` method
  - GET request to `/api/backtests/${id}/export/pdf`
  - Trigger browser download
- Add `bulkExportBacktests(ids, format)` method
  - POST request to `/api/backtests/export/bulk`
  - Trigger browser download of ZIP file
- Add support for metric filtering in `listBacktests()` method
  - Accept optional filter parameters for ROI, win rate, profit factor, drawdown ranges
  - Include in query string

### Task 8: Create BacktestNotesEditor Component
- Create new file `app/client/src/components/BacktestNotesEditor.jsx`
- Implement component with:
  - Textarea for entering/editing notes
  - Save button with loading state
  - Character count indicator (max 2000 characters)
  - Auto-save functionality (debounced, 2-second delay)
  - Toast notifications for save success/failure
- Style with Tailwind CSS to match existing design patterns
- Add to BacktestResultsSummary component as collapsible section

### Task 9: Create BacktestExportDialog Component
- Create new file `app/client/src/components/BacktestExportDialog.jsx`
- Implement modal dialog with:
  - Format selection: CSV, JSON, PDF (radio buttons)
  - Options section:
    - "Include full trade list" checkbox (default: true)
    - "Include equity curve data" checkbox (default: true for JSON/CSV)
  - Export button with loading state during download
  - Close/Cancel button
- Handle file downloads by calling appropriate API client methods
- Show toast notification on successful export
- Style with Tailwind CSS to match existing dialogs

### Task 10: Create MetricFilterPanel Component
- Create new file `app/client/src/components/MetricFilterPanel.jsx`
- Implement collapsible filter panel with:
  - ROI range filter (min/max input fields with % suffix)
  - Win rate range filter (min/max input fields with % suffix)
  - Profit factor range filter (min/max input fields)
  - Max drawdown range filter (min/max input fields with % suffix)
  - Total trades range filter (min/max input fields)
  - Apply Filters button
  - Clear Filters button
  - Active filter count badge
- Use controlled inputs with validation (min <= max)
- Call `listBacktests()` with filter parameters when Apply is clicked
- Style with Tailwind CSS to match existing filter components

### Task 11: Enhance BacktestLibrary with Results View and Filters
- Open `app/client/src/pages/BacktestLibrary.jsx`
- Add MetricFilterPanel component below search bar
- Update backtest cards to show key result metrics for completed backtests:
  - ROI badge (green if positive, red if negative)
  - Win rate badge
  - Total trades count
- Add "Export" quick action button to completed backtest cards
  - Opens BacktestExportDialog when clicked
- Add checkbox selection mode for bulk operations:
  - "Select Mode" toggle button
  - Checkboxes on each card when in select mode
  - Bulk export button (exports all selected backtests as ZIP)
  - Bulk delete button with confirmation dialog
- Update sorting dropdown to include result metrics (ROI, Win Rate, Profit Factor)
- Handle empty state when no backtests match filters

### Task 12: Add Export Buttons to BacktestResultsSummary
- Open `app/client/src/components/BacktestResultsSummary.jsx`
- Add "Export Results" button group to header section:
  - CSV export button
  - JSON export button
  - PDF export button
- Each button opens BacktestExportDialog with pre-selected format
- Add BacktestNotesEditor component as collapsible section below results metrics
- Ensure layout remains responsive on mobile devices

### Task 13: Implement Auto-Generated Naming Convention
- Open `app/client/src/pages/BacktestConfiguration.jsx`
- When creating a new backtest, auto-populate name field with pattern:
  - `[Strategy Name] - [Date] - [Time]`
  - Example: `Bollinger Bands Breakout - 2026-01-24 - 14:30`
- Allow user to edit the auto-generated name before saving
- Show "(Auto-generated)" hint text next to name field when using default name
- Clear hint text when user manually edits the name

### Task 14: Create BacktestComparisonView Component (Future Enhancement)
- Create new file `app/client/src/components/BacktestComparisonView.jsx`
- Implement side-by-side comparison table for 2-4 backtests:
  - Strategy name row
  - Configuration summary row (pair, timeframe, date range)
  - Key metrics rows (ROI, Win Rate, Profit Factor, Max Drawdown, Sharpe Ratio, Sortino Ratio)
  - Trade statistics rows (Total Trades, Winners, Losers, Avg Win, Avg Loss)
  - Highlight best/worst values in each row with color coding
- Add "Compare" mode to BacktestLibrary:
  - Enable checkbox selection
  - "Compare Selected" button appears when 2-4 backtests selected
  - Opens comparison view in modal or new page
- Style with Tailwind CSS for responsive grid layout
- NOTE: This is marked as future enhancement; prioritize core export and notes functionality first

### Task 15: Create E2E Test Specification
- Create new file `.claude/commands/e2e/test_save_backtest_results.md`
- Follow the format of existing E2E tests in `.claude/commands/e2e/`
- Include test steps for:
  - Adding notes to a completed backtest
  - Verifying notes auto-save functionality
  - Exporting backtest results in CSV format
  - Exporting backtest results in JSON format
  - Exporting backtest results in PDF format
  - Filtering backtests by ROI range
  - Filtering backtests by win rate range
  - Sorting backtests by performance metrics
  - Bulk exporting multiple backtests
  - Verifying auto-generated naming convention
- Define success criteria for each test step
- Include 20+ screenshots documenting the complete flow

### Task 16: Run Validation Commands
- Execute all validation commands to ensure zero regressions
- Fix any errors or test failures before completion

## Testing Strategy

### Unit Tests
- Test export generator functions with sample backtest data
  - CSV export with valid results
  - JSON export with valid results
  - PDF export with valid results
  - Edge cases: zero trades, negative results, missing data
- Test backtest service methods
  - Update notes successfully
  - Filter backtests by metric ranges
  - Sort backtests by different metrics
  - Handle invalid backtest IDs gracefully

### Integration Tests
- Test API endpoints with mock data
  - Update notes endpoint returns updated config
  - Export endpoints return correct file types and headers
  - Bulk export creates valid ZIP file
  - Filtering endpoint returns filtered results

### E2E Tests
- Test complete user flow from backtest completion to export
- Test notes editor with auto-save functionality
- Test export dialog with all format options
- Test metric filtering and sorting in library view
- Test bulk export of multiple backtests
- Verify auto-generated naming convention

### Edge Cases
- Exporting backtest with zero trades
- Exporting backtest with missing results data
- Updating notes with very long text (>2000 characters)
- Filtering with invalid metric ranges (min > max)
- Bulk exporting with mixed status backtests (pending, completed, failed)
- PDF export with very large trade lists (1000+ trades)

## Acceptance Criteria
- Notes field is added to backtests table and accessible via API
- Notes can be added/edited on completed backtests with auto-save functionality
- Backtests can be exported in CSV, JSON, and PDF formats
- CSV export includes summary metrics, trade statistics, risk metrics, and full trade list
- JSON export includes complete backtest configuration and results
- PDF export includes formatted tables, charts, and summary statistics
- BacktestLibrary displays key result metrics (ROI, Win Rate, Total Trades) on completed backtest cards
- Backtests can be filtered by ROI range, win rate range, profit factor range, and max drawdown range
- Backtests can be sorted by performance metrics (ROI, Win Rate, Profit Factor, etc.)
- Multiple backtests can be selected and bulk exported as ZIP file
- Auto-generated backtest names follow pattern "[Strategy Name] - [Date] - [Time]"
- Export buttons are accessible from both BacktestLibrary cards and BacktestResultsSummary page
- All exports trigger browser downloads with appropriate filenames
- UI remains responsive during export generation
- Toast notifications confirm successful exports
- E2E test validates complete save/export/filter workflow

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest tests/test_export_generators.py -v` - Run export generator unit tests
- `cd app/server && uv run pytest tests/test_backtest_service.py -v` - Run backtest service unit tests
- `cd app/server && uv run pytest` - Run all server tests to validate zero regressions
- `cd app/client && npm run build` - Run frontend build to validate zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_save_backtest_results.md` to validate the save backtest results functionality works

## Notes

### Auto-Generated Naming Convention
- Use format: `[Strategy Name] - [Date] - [Time]`
- Date format: `YYYY-MM-DD`
- Time format: `HH:MM` (24-hour format)
- Example: `Bollinger Bands Breakout - 2026-01-24 - 14:30`
- Allow users to customize the auto-generated name before saving

### Export Format Specifications

**CSV Format:**
- Section 1: Summary Metrics (Total Net P/L, ROI, Final Balance, etc.)
- Section 2: Trade Statistics (Total Trades, Winners, Losers, Win Rate, etc.)
- Section 3: Risk Metrics (Max Drawdown, Sharpe Ratio, Sortino Ratio, etc.)
- Section 4: Configuration Details (Strategy, Pair, Timeframe, Date Range, etc.)
- Section 5: Trade List (all columns from BacktestTradeList)

**JSON Format:**
- Root object with keys: `metadata`, `configuration`, `results`, `trades`
- Full BacktestConfig serialized in `configuration`
- Full BacktestResultsSummary serialized in `results`
- Complete trade list in `trades` array
- ISO 8601 datetime formatting for all timestamps

**PDF Format:**
- Page 1: Cover page with backtest name, strategy, date range, and key metrics
- Page 2-3: Summary tables with metrics and configuration
- Page 4: Equity curve chart (embedded as image)
- Page 5+: Trade list table (paginated if >100 trades)
- Footer on all pages: Generated date, page numbers

### Library Dependencies
- Add `reportlab` for PDF generation: `uv add reportlab`
- Use existing libraries for CSV (Python csv module) and JSON (Python json module)
- Consider adding `pillow` for chart image embedding in PDFs: `uv add pillow`

### Future Enhancements (Not in Scope for This Feature)
- Comparison view for side-by-side analysis of multiple backtests
- Export to Excel format with multiple sheets
- Email export functionality (send results via email)
- Scheduled exports (daily/weekly summary reports)
- Cloud storage integration (Google Drive, Dropbox)
- Version history for backtest configurations
- Tags/categories for organizing backtests
- Annotations on equity curve chart (mark significant events)
- Integration with external analytics tools (Google Sheets, Tableau)

### Performance Considerations
- Limit bulk export to 50 backtests maximum to avoid timeout
- Stream large CSV/JSON exports to avoid memory issues
- Use background jobs for PDF generation if >500 trades
- Cache export files for 15 minutes to avoid regeneration on repeated downloads
- Add pagination to comparison view if comparing >4 backtests
