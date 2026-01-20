# Feature: Strategy Management System

## Metadata
issue_number: `82`
adw_id: `61b69256`
issue_json: `{"number":82,"title":"Feature Strategy Management US-VSB-026 - US-VSB-030","body":"..."}`

## Feature Description
This feature implements a comprehensive strategy management system that allows traders to load, duplicate, delete, export, and import trading strategies. Building on the existing Save Strategy functionality, this feature completes the strategy lifecycle management by enabling traders to efficiently organize their strategy library, create variations of successful strategies, backup their work, and share strategies with others.

The feature includes:
- **Load Strategy (US-VSB-026)**: Strategy browser modal with list view, search/filter, sorting, preview panel, and unsaved changes protection
- **Duplicate Strategy (US-VSB-027)**: Create copies with automatic naming convention and immediate editing
- **Delete Strategy (US-VSB-028)**: Single and bulk delete with confirmation dialogs and undo capability
- **Export Strategy (US-VSB-029)**: Download strategy as JSON file with security-conscious data exclusion
- **Import Strategy (US-VSB-030)**: Upload and validate JSON files with version compatibility checking

## User Story
As a trader
I want to load, duplicate, delete, export, and import trading strategies
So that I can efficiently organize my strategy library, create variations of successful strategies, backup my work, and share strategies with others

## Problem Statement
Currently, traders can only save strategies to the database but lack the ability to manage their strategy library effectively. They cannot:
- Browse and load previously saved strategies
- Create copies of strategies to experiment with variations
- Delete obsolete strategies to keep their library organized
- Export strategies as files for backup or sharing
- Import strategies from files shared by others or restored from backups

## Solution Statement
Implement a complete strategy management interface that integrates with the existing strategy save functionality. This includes:
1. A Strategy Browser modal for loading saved strategies with rich filtering and preview capabilities
2. Duplicate functionality that creates copies with automatic naming
3. Delete functionality with confirmation dialogs and 30-second undo capability
4. Export as JSON with proper file naming and security exclusions
5. Import from JSON with comprehensive validation and version compatibility

## Relevant Files
Use these files to implement the feature:

### Backend Files
- `app/server/core/strategy_service.py` - Extend with duplicate and export/import validation logic
- `app/server/core/data_models.py` - Add models for export/import schema, strategy list items with metadata
- `app/server/server.py` - Add new API endpoints for duplicate, export, and enhanced list operations

### Frontend Files
- `app/client/src/pages/Strategy.jsx` - Add load, duplicate, delete, export, import handlers and state management
- `app/client/src/app/api.js` - Add API client functions for new endpoints
- `app/client/src/app/constants.js` - Add constants for export schema version, file naming patterns
- `app/client/src/components/SaveStrategyDialog.jsx` - Reference for dialog patterns
- `app/client/src/components/ConfirmDialog.jsx` - Reuse for delete confirmations
- `app/client/src/components/Toast.jsx` - Reuse for success/error notifications

### Test Files
- `app/server/tests/test_strategy_service.py` - Add tests for new operations
- `.claude/commands/test_e2e.md` - E2E test runner reference
- `.claude/commands/e2e/test_trading_dashboard.md` - E2E test format reference

### Documentation
- `app_docs/feature-f792fd5a-save-strategy.md` - Reference for existing save strategy implementation

### New Files
- `app/client/src/components/LoadStrategyDialog.jsx` - Strategy browser modal component
- `app/client/src/components/ImportStrategyDialog.jsx` - Import preview and validation dialog
- `app/client/src/components/StrategyListItem.jsx` - List item component for strategy browser
- `.claude/commands/e2e/test_strategy_management.md` - E2E test specification for strategy management

## Implementation Plan

### Phase 1: Foundation
1. Extend the database strategy model with additional metadata fields needed for listing
2. Create the backend API endpoints for enhanced listing (with pagination, sorting, filtering)
3. Add duplicate strategy endpoint
4. Define export JSON schema with version field

### Phase 2: Core Implementation
1. Create LoadStrategyDialog component with list view, search, filter, sort, and preview
2. Implement strategy loading with unsaved changes protection
3. Create duplicate strategy functionality with automatic naming
4. Implement delete with confirmation dialog and undo toast
5. Create export functionality with proper JSON schema
6. Create ImportStrategyDialog with file selection, validation, preview, and conflict resolution

### Phase 3: Integration
1. Add toolbar/header buttons for Load, Delete, Export, Import actions
2. Integrate all dialogs with Strategy page state management
3. Implement state restoration when loading a strategy
4. Add keyboard shortcuts for common operations
5. Comprehensive testing and validation

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_save_strategy.md` as a reference for test structure
- Create `.claude/commands/e2e/test_strategy_management.md` with test steps for:
  - Loading a strategy from the browser modal
  - Duplicating a strategy
  - Deleting a strategy with confirmation
  - Exporting a strategy as JSON
  - Importing a strategy from JSON
- Include screenshots at key verification points

### Task 2: Extend Backend Data Models
- Add `StrategyExport` model in `data_models.py` for export JSON schema with:
  - `schema_version`: String (e.g., "1.0")
  - `export_date`: ISO timestamp
  - `strategy`: Full StrategyConfig object
- Add `StrategyListItemExtended` model with additional fields:
  - `indicator_count`: int
  - `condition_count`: int
  - `drawing_count`: int
  - `pattern_count`: int
- Update `StrategyListItem` to include `direction` as visual indicator

### Task 3: Extend Strategy Service Layer
- Add `duplicate_strategy(strategy_id: str)` function:
  - Fetch existing strategy
  - Generate new name with " - Copy" suffix (handle "(2)", "(3)" if needed)
  - Clear ID and timestamps
  - Save as new strategy
  - Return new strategy ID
- Add `get_strategy_for_export(strategy_id: str)` function:
  - Fetch strategy
  - Wrap in StrategyExport schema with version and timestamp
  - Return export object
- Add `validate_import(strategy_data: dict)` function:
  - Validate JSON structure
  - Check schema version compatibility
  - Validate required fields
  - Return validation result with warnings/errors
- Extend `list_strategies()` to include summary counts (indicators, conditions, drawings)

### Task 4: Add Backend API Endpoints
- Add `POST /api/strategies/{id}/duplicate` endpoint:
  - Returns new strategy ID and name
- Add `GET /api/strategies/{id}/export` endpoint:
  - Returns JSON file with proper Content-Disposition header
  - File named `strategy_[name]_[YYYYMMDD].json`
- Add `POST /api/strategies/import` endpoint:
  - Accepts JSON in request body
  - Validates structure and version
  - Returns preview data or validation errors
- Add `POST /api/strategies/import/save` endpoint:
  - Saves validated import with optional name override
  - Handles name conflict resolution

### Task 5: Create StrategyListItem Component
- Create `app/client/src/components/StrategyListItem.jsx`:
  - Display: name (clickable), description preview (truncated), last modified date
  - Display: currency pair, direction indicator (↑/↓/↕), tags
  - Display: counts (indicators, conditions, drawings) as badges
  - Include checkbox for multi-select mode
  - Highlight on hover and when selected
  - Context menu trigger on right-click

### Task 6: Create LoadStrategyDialog Component
- Create `app/client/src/components/LoadStrategyDialog.jsx`:
  - Modal dialog with backdrop blur (following existing pattern)
  - Two-column layout: list on left, preview on right
  - List view with StrategyListItem components
  - Search input with real-time filtering (by name, tags)
  - Direction filter buttons (All, Long, Short, Both)
  - Sort dropdown (Name A-Z/Z-A, Date Modified Newest/Oldest, Date Created Newest/Oldest)
  - Preview panel showing full strategy details when item selected
  - Load button (disabled until strategy selected)
  - Cancel button
- Implement unsaved changes protection:
  - Check if current strategy has unsaved changes
  - Show confirmation dialog: "You have unsaved changes. Load anyway?"
  - Options: Cancel, Load Without Saving, Save & Load
- Handle loading state with spinner
- Keyboard navigation (Arrow keys, Enter to load, Escape to close)

### Task 7: Implement Strategy Loading in Strategy.jsx
- Add `loadStrategyFromId(strategyId: string)` function:
  - Call `endPoints.getStrategy(strategyId)`
  - Deserialize snake_case to camelCase
  - Restore all state: indicators, patterns, conditions, groups, drawings, settings
  - Update current strategy metadata (name, description, tags, id)
  - Clear draft after successful load
- Add `hasUnsavedChanges()` function:
  - Compare current state with last saved state
  - Return boolean indicating if there are changes
- Add state for LoadStrategyDialog visibility
- Add "Load Strategy" button to toolbar

### Task 8: Implement Duplicate Functionality
- Add `handleDuplicateStrategy()` function in Strategy.jsx:
  - If no strategy loaded, show error toast
  - Call `endPoints.duplicateStrategy(existingStrategyId)`
  - On success, load the duplicated strategy
  - Show success toast: "Strategy duplicated as '[new name]'"
- Add "Duplicate" button to toolbar (disabled if no strategy loaded)
- Add keyboard shortcut `Ctrl+Shift+D`
- Add "Duplicate" option to strategy context menu in LoadStrategyDialog

### Task 9: Implement Delete Functionality
- Add `handleDeleteStrategy(strategyId: string, strategyName: string)` function:
  - Show ConfirmDialog: "Are you sure you want to delete '[name]'? This cannot be undone."
  - On confirm, call `endPoints.deleteStrategy(strategyId)`
  - If currently loaded strategy, clear current state
  - Show undo toast with 30-second timeout
  - Implement undo by calling save with cached data
- Add "Delete" button to toolbar (disabled if no strategy loaded)
- Add "Delete" option to strategy context menu in LoadStrategyDialog
- Add bulk delete support:
  - Multi-select mode with checkboxes
  - "Delete Selected" button when multiple selected
  - Bulk confirmation dialog listing all strategies

### Task 10: Implement Export Functionality
- Add `handleExportStrategy()` function in Strategy.jsx:
  - Collect current strategy state
  - Create export object with schema version and timestamp
  - Generate filename: `strategy_[name]_[YYYYMMDD].json`
  - Trigger browser download
  - Show success toast
- Add security exclusions (no API keys, account info)
- Add `app/client/src/app/strategyExport.js` utility:
  - `createExportPayload(strategy)`: Creates export JSON structure
  - `downloadAsJson(data, filename)`: Triggers file download
- Add "Export" button to toolbar (disabled if no strategy to export)
- Add "Export" option to strategy context menu

### Task 11: Create ImportStrategyDialog Component
- Create `app/client/src/components/ImportStrategyDialog.jsx`:
  - File picker for .json files only
  - Validation display (errors, warnings)
  - Version compatibility check with warning for older formats
  - Preview panel showing imported strategy details:
    - Name, description, pair, direction, tags
    - List of indicators, condition count, drawing count
  - Name conflict resolution:
    - "A strategy named '[name]' already exists"
    - Options: Rename (text input), Replace existing, Keep both (auto-rename)
  - Import button (disabled until valid and conflicts resolved)
  - Cancel button
- Handle drag-and-drop file upload
- Display detailed validation errors with field paths

### Task 12: Implement Import Functionality in Strategy.jsx
- Add `handleImportStrategy(file: File)` function:
  - Read file contents
  - Parse JSON
  - Validate structure and version
  - Check name conflicts
  - Show ImportStrategyDialog with preview
- Add `handleConfirmImport(strategyData, options)` function:
  - Apply name resolution option
  - Save to database
  - Optionally load immediately
  - Show success toast
- Add "Import" button to toolbar
- Support drag-and-drop onto strategy list

### Task 13: Add API Client Functions
- Add to `app/client/src/app/api.js`:
  - `duplicateStrategy: (id) => requests.post(`/strategies/${id}/duplicate`)`
  - `exportStrategy: (id) => requests.get(`/strategies/${id}/export`)`
  - `validateImport: (data) => requests.post('/strategies/import', data)`
  - `saveImport: (data, options) => requests.post('/strategies/import/save', { data, ...options })`

### Task 14: Add Constants
- Add to `app/client/src/app/constants.js`:
  - `EXPORT_SCHEMA_VERSION = "1.0"`
  - `STRATEGY_EXPORT_EXCLUDED_FIELDS = ['api_keys', 'account_info', ...]`
  - `UNDO_TOAST_DURATION_MS = 30000`
  - `STRATEGY_FILE_EXTENSION = '.json'`
  - `DIRECTION_ICONS = { long: '↑', short: '↓', both: '↕' }`

### Task 15: Update Toolbar UI
- Add toolbar section in Strategy.jsx header with:
  - "Load Strategy" button (folder-open icon)
  - "Save Strategy" button (existing)
  - "Duplicate" button (copy icon, disabled if no strategy)
  - "Delete" button (trash icon, disabled if no strategy)
  - "Export" button (download icon, disabled if no strategy)
  - "Import" button (upload icon)
- Use consistent button styling with icons from lucide-react
- Add responsive design for mobile (collapse to dropdown menu)

### Task 16: Write Backend Unit Tests
- Add tests to `app/server/tests/test_strategy_service.py`:
  - `test_duplicate_strategy_creates_copy`
  - `test_duplicate_strategy_increments_copy_number`
  - `test_duplicate_strategy_not_found`
  - `test_export_strategy_includes_schema_version`
  - `test_export_strategy_excludes_sensitive_data`
  - `test_validate_import_valid_structure`
  - `test_validate_import_missing_required_fields`
  - `test_validate_import_incompatible_version`
  - `test_list_strategies_includes_counts`

### Task 17: Run Validation Commands
- Execute all validation commands to ensure the feature works correctly with zero regressions

## Testing Strategy

### Unit Tests
- Test strategy service duplicate function with various naming scenarios
- Test export JSON structure validation
- Test import validation for all error cases
- Test list strategies with metadata counts
- Test API endpoints with mocked service layer

### Edge Cases
- Duplicate strategy with name at max length (50 chars)
- Import strategy with missing optional fields
- Import strategy with newer schema version
- Delete strategy that's currently loaded
- Load strategy when current has unsaved changes
- Export strategy with special characters in name
- Import corrupted JSON file
- Network error during save/load operations
- Concurrent operations (duplicate while loading)

## Acceptance Criteria

### Load Existing Strategy (US-VSB-026)
- [ ] "Load Strategy" button opens strategy browser modal
- [ ] List view shows: Name, Description preview, Last Modified, Currency Pair, Direction (↑↓↕), Tags
- [ ] Sort options: Name, Date Modified, Date Created
- [ ] Search/filter by name, tags, or direction
- [ ] Preview panel shows strategy summary without loading
- [ ] "Load" applies strategy to chart, replacing current configuration
- [ ] All indicators, conditions, and drawings restored
- [ ] Confirmation if current unsaved work exists: "You have unsaved changes. Load anyway?"

### Duplicate Strategy (US-VSB-027)
- [ ] "Duplicate" option available when strategy is loaded
- [ ] Creates copy with name "[Original Name] - Copy"
- [ ] All parameters, indicators, conditions, and drawings duplicated
- [ ] Duplicate opens immediately for editing
- [ ] Original strategy remains unchanged

### Delete Strategy (US-VSB-028)
- [ ] "Delete" option in strategy toolbar
- [ ] Confirmation dialog: "Are you sure you want to delete '[name]'? This cannot be undone."
- [ ] Successful deletion removes from list with undo option (30 seconds)
- [ ] Bulk delete available with multi-select in strategy browser

### Export Strategy as JSON (US-VSB-029)
- [ ] "Export" button downloads strategy as `.json` file
- [ ] File named: `strategy_[name]_[date].json`
- [ ] JSON includes complete strategy definition (indicators, conditions, parameters, drawings)
- [ ] Sensitive data (API keys, account info) never included
- [ ] Export available when strategy is loaded

### Import Strategy from JSON (US-VSB-030)
- [ ] "Import" button opens file picker for `.json` files
- [ ] Validation checks JSON structure and required fields
- [ ] Error messages for invalid/corrupted files with specific issues
- [ ] Preview imported strategy before saving
- [ ] Option to rename during import if name conflicts
- [ ] Version compatibility check with warning for older format

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_strategy_management.md` to validate the E2E test passes
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/server && uv run pytest tests/test_strategy_service.py -v` - Run strategy service tests specifically
- `cd app/client && npm run build` - Run frontend build to validate the feature compiles with zero regressions
- `cd app/client && npm test -- --watchAll=false` - Run frontend tests if available

## Notes

### Future Considerations
- Strategy versioning and history tracking
- Strategy sharing via URL or code
- Cloud backup/sync
- Strategy templates and marketplace
- Batch operations (export all, import multiple)

### Bot Integration Note
The current bot implementation does not track which strategy it's running. The delete protection feature checking if a strategy is in use by a running bot cannot be fully implemented until the bot is updated to track its active strategy. For now, we should note this as a future enhancement and simply warn users before deleting.

### Export Schema
```json
{
  "schemaVersion": "1.0",
  "exportDate": "2025-01-20T10:30:00Z",
  "strategy": {
    "name": "Strategy Name",
    "description": "...",
    "pair": "EUR_USD",
    "timeframe": "H1",
    "trade_direction": "both",
    "indicators": [...],
    "conditions": [...],
    "drawings": [...],
    ...
  }
}
```

### Security Exclusions
The following should NEVER be included in exports:
- API keys (OpenFX, Supabase)
- Account credentials
- Personal user data
- Execution history
- Performance metrics
- Internal IDs that could leak system information

### Dependencies
This feature depends on the Save Strategy feature (issue #80, ADW f792fd5a) which has already been implemented. The existing strategy service, API endpoints, and data models provide the foundation for this feature.
