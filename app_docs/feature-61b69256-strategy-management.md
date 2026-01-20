# Strategy Management System

**ADW ID:** 61b69256
**Date:** 2026-01-20
**Specification:** /home/ubuntu/algotrading/trees/61b69256/specs/issue-82-adw-61b69256-sdlc_planner-strategy-management.md

## Overview

A comprehensive strategy management system that enables traders to load, duplicate, delete, export, and import trading strategies. This feature completes the strategy lifecycle management by integrating with the existing Save Strategy functionality, allowing efficient organization of strategy libraries, creation of strategy variations, backup/restore capabilities, and strategy sharing.

## What Was Built

- **Load Strategy (US-VSB-026)**: Strategy browser modal with list view, search/filter, sorting, preview panel, and unsaved changes protection
- **Duplicate Strategy (US-VSB-027)**: Create copies with automatic naming convention ("Name - Copy", "Name - Copy (2)") and immediate editing
- **Delete Strategy (US-VSB-028)**: Single delete with confirmation dialog and 30-second undo capability
- **Export Strategy (US-VSB-029)**: Download strategy as JSON file with security-conscious data exclusion
- **Import Strategy (US-VSB-030)**: Upload and validate JSON files with version compatibility checking and conflict resolution

## Technical Implementation

### Files Modified

- `app/server/core/data_models.py`: Added StrategyExport, StrategyListItemExtended, ImportValidationResult, and API request/response models
- `app/server/core/strategy_service.py`: Added duplicate, export, import, and extended list operations
- `app/server/server.py`: Added 6 new API endpoints for strategy management
- `app/client/src/pages/Strategy.jsx`: Added load, duplicate, delete, export, import handlers and toolbar buttons
- `app/client/src/app/api.js`: Added API client functions for new endpoints
- `app/client/src/app/constants.js`: Added export schema version, direction icons, and undo duration constants

### New Files

- `app/client/src/components/LoadStrategyDialog.jsx`: 719-line modal component for strategy browser
- `app/client/src/components/ImportStrategyDialog.jsx`: 496-line modal for import with validation preview
- `app/client/src/components/StrategyListItem.jsx`: 171-line list item component for strategy browser
- `app/server/tests/core/test_strategy_service.py`: 350 lines of unit tests
- `.claude/commands/e2e/test_strategy_management.md`: E2E test specification

### Key Changes

- **Strategy Browser Modal**: Two-column layout with strategy list on left, preview panel on right. Supports real-time search filtering by name/tags, direction filtering (All/Long/Short/Both), and sorting (Name A-Z/Z-A, Date Modified, Date Created)
- **Export Schema**: Version 1.0 JSON format with `schema_version`, `export_date`, and `strategy` fields. Excludes internal IDs and timestamps for clean exports
- **Import Validation**: Validates JSON structure, schema version compatibility, required fields, name length limits, and trade direction values. Provides detailed error messages and warnings
- **Duplicate Naming**: Automatically generates unique names ("Copy", "Copy (2)", etc.) with max 50 character limit handling
- **Undo Delete**: 30-second window to undo deletion via toast notification click

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/strategies/extended` | GET | List strategies with counts (indicators, conditions, drawings) |
| `/api/strategies/{id}/duplicate` | POST | Duplicate strategy with auto-generated name |
| `/api/strategies/{id}/export` | GET | Export strategy as JSON with Content-Disposition header |
| `/api/strategies/import/validate` | POST | Validate import data without saving |
| `/api/strategies/import/save` | POST | Save validated import with conflict resolution |

## How to Use

### Loading a Strategy

1. Click the **Load** button in the Strategy page toolbar
2. Browse the list of saved strategies (search, filter, or sort as needed)
3. Click a strategy to see preview details
4. Double-click or click **Load** button to load the strategy
5. If you have unsaved changes, confirm whether to discard or save first

### Duplicating a Strategy

1. Load a strategy or select one in the Load dialog
2. Click **Duplicate** in the toolbar (or use the context menu in Load dialog)
3. The strategy is copied with a unique name and loaded for editing

### Deleting a Strategy

1. Select a strategy in the Load dialog
2. Click the delete icon or use context menu
3. Confirm deletion in the dialog
4. If deleted by mistake, click the toast notification within 30 seconds to undo

### Exporting a Strategy

1. Load a strategy or select one in the Load dialog
2. Click **Export** in the toolbar (or use the context menu)
3. A JSON file is downloaded: `strategy_[name]_[YYYYMMDD].json`

### Importing a Strategy

1. Click the **Import** button in the Strategy page toolbar
2. Drag-and-drop a JSON file or click to browse
3. Review validation results and strategy preview
4. If name conflicts exist, choose: Keep both, Replace existing, or Rename
5. Click **Import** to save the strategy

## Configuration

### Export Schema Version

The current export schema version is `1.0`. The schema includes:

```json
{
  "schema_version": "1.0",
  "export_date": "2026-01-20T10:30:00Z",
  "strategy": {
    "name": "Strategy Name",
    "description": "...",
    "pair": "EUR_USD",
    "timeframe": "H1",
    "trade_direction": "both",
    "indicators": [...],
    "conditions": [...],
    "drawings": [...]
  }
}
```

### Security Exclusions

The following are never included in exports:
- Internal database IDs
- Timestamps (created_at, updated_at)
- API keys or account credentials
- Personal user data

## Testing

### Backend Tests

```bash
cd app/server && uv run pytest tests/core/test_strategy_service.py -v
```

Tests cover:
- Duplicate strategy with various naming scenarios
- Copy number incrementing
- Export schema structure
- Import validation (valid, invalid, missing fields)
- List strategies with counts

### E2E Tests

Run the Strategy Management E2E test via the `/test_e2e` skill with `test_strategy_management.md`.

## Notes

- **Unsaved Changes Protection**: Loading a new strategy prompts if current work is unsaved
- **Keyboard Navigation**: Escape closes dialogs, arrow keys navigate strategy list
- **Drag-and-Drop**: Import dialog supports drag-and-drop file upload
- **Context Menus**: Right-click strategies in Load dialog for quick actions
- **Bot Integration**: Delete protection for strategies in use by running bot is planned for future enhancement once the bot tracks active strategy
