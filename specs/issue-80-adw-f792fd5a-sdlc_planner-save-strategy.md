# Feature: Save Strategy

## Metadata
issue_number: `80`
adw_id: `f792fd5a`
issue_json: `{"number":80,"title":"Feature Save Strategy US-VSB-025","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nSave Strategy\nAs a traderI want to save my strategy with a name and descriptionSo that I can reuse it later for backtesting or live trading\nAcceptance Criteria:\n\t∙\t\"Save Strategy\" button opens save dialog\n\t∙\tRequired fields: Strategy Name (max 50 chars)\n\t∙\tOptional fields: Description (max 500 chars), Tags\n\t∙\tDuplicate name check with warning: \"Strategy with this name exists. Overwrite?\"\n\t∙\tSave includes:\n\t∙\tAll indicators with parameters and styling\n\t∙\tAll conditions (entry/exit for Long/Short)\n\t∙\tAll drawings (horizontal lines, trendlines, Fibonacci)\n\t∙\tTrade direction setting\n\t∙\tCandle close confirmation setting\n\t∙\tChart settings (timeframe, currency pair)\n\t∙\tSuccess toast notification: \"Strategy '[name]' saved successfully\"\n\t∙\tAuto-save draft every 60 seconds with recovery prompt on return"}`

## Feature Description
This feature allows traders to save their complete strategy configuration including all indicators, conditions, drawings, and settings. The save functionality persists the strategy to the database (Supabase) with a user-defined name and optional description/tags. Auto-save draft functionality provides protection against data loss with a recovery prompt when returning to the page.

## User Story
As a trader
I want to save my strategy with a name and description
So that I can reuse it later for backtesting or live trading

## Problem Statement
Currently, strategy configurations (indicators, conditions, drawings, settings) are only persisted to localStorage as individual pieces. Traders cannot:
1. Save a complete strategy with a meaningful name for later retrieval
2. Share or organize multiple strategies
3. Recover from accidental page closures with draft auto-save
4. Manage strategy versions with overwrite warnings

## Solution Statement
Implement a comprehensive save strategy feature with:
1. **Save Strategy Dialog** - Modal with name (required), description (optional), and tags (optional)
2. **Backend API Endpoints** - CRUD operations for strategies in Supabase
3. **Database Schema** - Supabase table for storing strategy configurations
4. **Auto-save Draft** - Periodic draft saving with recovery prompt
5. **Toast Notifications** - Success/error feedback
6. **Duplicate Detection** - Warning dialog for overwrite confirmation

## Relevant Files
Use these files to implement the feature:

**Client-Side (Frontend)**
- `app/client/src/pages/Strategy.jsx` - Main strategy page containing all state management for indicators, conditions, drawings, trade direction, candle close confirmation, and chart settings
- `app/client/src/components/ConfirmDialog.jsx` - Existing dialog pattern to follow for confirmation dialogs
- `app/client/src/components/IndicatorSettingsDialog.jsx` - Example of modal dialog with form inputs
- `app/client/src/app/api.js` - API endpoint definitions (add new strategy endpoints)
- `app/client/src/app/constants.js` - Storage keys and constants (add new constants)
- `app/client/src/app/drawingUtils.js` - Contains `serializeDrawings` and `deserializeDrawings` for drawing persistence
- `app/client/src/lib/utils.js` - Utility functions including `cn` for classnames

**Server-Side (Backend)**
- `app/server/server.py` - FastAPI application with route definitions (add new strategy routes)
- `app/server/core/data_models.py` - Pydantic models (already has StrategyConfig, SaveStrategyRequest, SaveStrategyResponse models)
- `app/server/db/supabase_client.py` - Supabase client for database operations
- `app/server/api/routes.py` - Helper functions for routes

**E2E Testing**
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test for reference

### New Files
- `app/client/src/components/SaveStrategyDialog.jsx` - New dialog component for saving strategies
- `app/client/src/components/Toast.jsx` - Toast notification component
- `app/server/core/strategy_service.py` - Service layer for strategy persistence operations
- `.claude/commands/e2e/test_save_strategy.md` - E2E test specification for save strategy feature

## Implementation Plan

### Phase 1: Foundation
1. **Create Toast Notification Component** - Reusable toast component for success/error messages
2. **Extend Data Models** - Update StrategyConfig model to include drawings, groups, reference indicators, time filter, and tags
3. **Create Database Schema** - Design and implement Supabase table for strategies
4. **Create Strategy Service** - Backend service layer for CRUD operations

### Phase 2: Core Implementation
1. **Create SaveStrategyDialog Component** - Modal dialog with form validation
2. **Implement Save API Endpoint** - POST /api/strategies endpoint
3. **Implement Get Strategy Endpoint** - GET /api/strategies/{id} endpoint
4. **Implement List Strategies Endpoint** - GET /api/strategies endpoint
5. **Implement Duplicate Check Endpoint** - GET /api/strategies/check-name endpoint
6. **Add Strategy Serialization** - Function to collect all strategy state for saving
7. **Integrate Save Button** - Add "Save Strategy" button to Strategy page header

### Phase 3: Integration
1. **Auto-save Draft Feature** - 60-second interval localStorage draft with recovery prompt
2. **Overwrite Confirmation** - Dialog for duplicate name warning
3. **Toast Integration** - Show success/error notifications
4. **E2E Test Creation** - Create test specification for save strategy feature

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_trading_dashboard.md` to understand E2E test format
- Create `.claude/commands/e2e/test_save_strategy.md` with test steps for:
  - Opening save dialog via button click
  - Validating required name field (max 50 chars)
  - Entering optional description (max 500 chars) and tags
  - Successfully saving a strategy
  - Verifying toast notification
  - Testing duplicate name warning and overwrite flow
  - Testing draft recovery prompt

### Task 2: Create Toast Notification Component
- Create `app/client/src/components/Toast.jsx`
- Support types: 'success', 'error', 'warning', 'info'
- Auto-dismiss after configurable duration (default 5 seconds)
- Position: fixed bottom-right corner
- Include close button
- Follow existing component styling patterns (Tailwind CSS)

### Task 3: Extend Backend Data Models
- Update `app/server/core/data_models.py`:
  - Add `tags` field (List[str]) to StrategyConfig
  - Add `drawings` field (List[Dict]) to StrategyConfig
  - Add `groups` field (List[Dict]) for condition groups
  - Add `reference_indicators` field (List[Dict]) for multi-timeframe
  - Add `time_filter` field (Dict) for time-based restrictions
  - Add `confirm_on_candle_close` field (str) for candle close setting
  - Add `candle_count` field (Optional[str]) for chart candle count
  - Update section type to include V2 sections (long_entry, long_exit, short_entry, short_exit)
  - Add `StrategyDraft` model for auto-save drafts
  - Add `CheckNameRequest` and `CheckNameResponse` models

### Task 4: Create Strategy Service Layer
- Create `app/server/core/strategy_service.py`
- Implement functions:
  - `save_strategy(strategy: StrategyConfig)` - Save/update strategy to Supabase
  - `get_strategy(strategy_id: str)` - Get strategy by ID
  - `list_strategies()` - List all saved strategies
  - `delete_strategy(strategy_id: str)` - Delete a strategy
  - `check_name_exists(name: str)` - Check if strategy name already exists
- Handle Supabase errors gracefully
- Generate UUID for new strategies

### Task 5: Add API Endpoints
- Update `app/server/server.py` with new endpoints:
  - `POST /api/strategies` - Save a new strategy or update existing
  - `GET /api/strategies` - List all strategies
  - `GET /api/strategies/{strategy_id}` - Get a specific strategy
  - `DELETE /api/strategies/{strategy_id}` - Delete a strategy
  - `GET /api/strategies/check-name/{name}` - Check if name exists
- Add proper error handling and logging
- Import new models and service functions

### Task 6: Update Frontend API Client
- Update `app/client/src/app/api.js` with new endpoints:
  - `saveStrategy: (strategy) => requests.post("/strategies", strategy)`
  - `listStrategies: () => requests.get("/strategies")`
  - `getStrategy: (id) => requests.get(`/strategies/${id}`)`
  - `deleteStrategy: (id) => requests.delete(`/strategies/${id}`)`
  - `checkStrategyName: (name) => requests.get(`/strategies/check-name/${encodeURIComponent(name)}`)`
- Add `delete` method to requests object

### Task 7: Add Constants for Strategy Persistence
- Update `app/client/src/app/constants.js`:
  - Add `STRATEGY_DRAFT_STORAGE_KEY = 'forex_dash_strategy_draft'`
  - Add `STRATEGY_DRAFT_TIMESTAMP_KEY = 'forex_dash_strategy_draft_timestamp'`
  - Add `AUTO_SAVE_INTERVAL_MS = 60000` (60 seconds)
  - Add `STRATEGY_NAME_MAX_LENGTH = 50`
  - Add `STRATEGY_DESCRIPTION_MAX_LENGTH = 500`

### Task 8: Create SaveStrategyDialog Component
- Create `app/client/src/components/SaveStrategyDialog.jsx`
- Props: `isOpen`, `onClose`, `onSave`, `existingName?`, `existingDescription?`, `existingTags?`
- Form fields:
  - Strategy Name (required, max 50 chars, text input)
  - Description (optional, max 500 chars, textarea)
  - Tags (optional, comma-separated input or tag chips)
- Character counters for name and description
- Validation:
  - Name cannot be empty
  - Name cannot exceed 50 characters
  - Description cannot exceed 500 characters
- Save button disabled when name invalid
- Cancel button to close dialog
- Follow ConfirmDialog and IndicatorSettingsDialog patterns

### Task 9: Create Strategy Serialization Utility
- Add to Strategy.jsx a function `collectStrategyState()` that returns:
  ```javascript
  {
    name: string,
    description: string,
    tags: string[],
    trade_direction: string,
    confirm_on_candle_close: string,
    pair: string,
    timeframe: string,
    candle_count: string,
    indicators: activeIndicators,
    patterns: activePatterns, // Include pattern definitions, not detected instances
    conditions: conditions,
    groups: groups,
    reference_indicators: referenceIndicators,
    time_filter: timeFilter,
    drawings: drawings // Use serializeDrawings for proper format
  }
  ```
- Handle serialization of all complex objects

### Task 10: Integrate Save Strategy into Strategy Page
- Add "Save Strategy" button to Strategy page header (near Load Data button)
- Add SaveStrategyDialog state management
- Add Toast state management
- Implement save flow:
  1. Click "Save Strategy" button
  2. Open SaveStrategyDialog
  3. User enters name/description/tags
  4. Check for duplicate name via API
  5. If duplicate, show overwrite confirmation dialog
  6. Call save API
  7. Show success/error toast
  8. Close dialog

### Task 11: Implement Auto-save Draft Feature
- Add draft auto-save logic to Strategy.jsx:
  - useEffect with 60-second interval
  - Save current strategy state to localStorage (STRATEGY_DRAFT_STORAGE_KEY)
  - Save timestamp (STRATEGY_DRAFT_TIMESTAMP_KEY)
- Add draft recovery detection:
  - On component mount, check for existing draft
  - If draft exists and is newer than last saved strategy
  - Show confirmation dialog: "Unsaved draft found. Would you like to recover it?"
  - "Recover" button loads draft, "Discard" button clears draft
- Clear draft after successful save to server

### Task 12: Implement Duplicate Name Warning Flow
- Before saving, call `checkStrategyName` API
- If name exists, show ConfirmDialog:
  - Title: "Strategy Already Exists"
  - Message: "A strategy with the name '[name]' already exists. Do you want to overwrite it?"
  - Actions: "Cancel", "Overwrite"
- If user confirms overwrite, proceed with save (pass existing strategy ID)

### Task 13: Run Validation Commands
Execute all validation commands to ensure the feature works correctly with zero regressions.

## Testing Strategy

### Unit Tests
- `app/server/tests/test_strategy_service.py`:
  - Test save_strategy with valid data
  - Test save_strategy with missing required fields
  - Test get_strategy with valid ID
  - Test get_strategy with invalid ID
  - Test list_strategies returns correct format
  - Test check_name_exists with existing/non-existing names
  - Test delete_strategy

### Edge Cases
- Strategy name with special characters (should be allowed)
- Strategy name with only whitespace (should be rejected)
- Very long descriptions at exactly 500 characters
- Empty indicators/conditions/drawings arrays
- Saving strategy with no drawings but with indicators
- Auto-save draft when localStorage is full (graceful degradation)
- Concurrent saves (last write wins)
- Network failure during save (show error toast)
- Recovery prompt when draft is very old (>24 hours - consider auto-discard)

## Acceptance Criteria
1. "Save Strategy" button is visible in Strategy page header
2. Clicking "Save Strategy" opens save dialog
3. Strategy Name field is required with max 50 characters
4. Description field is optional with max 500 characters
5. Tags field is optional
6. Duplicate name triggers warning: "Strategy with this name exists. Overwrite?"
7. Save captures all data:
   - All indicators with parameters and styling
   - All conditions (entry/exit for Long/Short)
   - All drawings (horizontal lines, trendlines, Fibonacci)
   - Trade direction setting
   - Candle close confirmation setting
   - Chart settings (timeframe, currency pair)
8. Success toast shows: "Strategy '[name]' saved successfully"
9. Auto-save draft runs every 60 seconds
10. Recovery prompt appears when returning with unsaved draft

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_save_strategy.md` E2E test to validate this functionality works

## Notes

### Database Schema (Supabase)
The strategies table should be created with the following structure:
```sql
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  tags TEXT[],
  trade_direction VARCHAR(10) NOT NULL DEFAULT 'both',
  confirm_on_candle_close VARCHAR(3) NOT NULL DEFAULT 'yes',
  pair VARCHAR(20),
  timeframe VARCHAR(10),
  candle_count VARCHAR(10),
  indicators JSONB DEFAULT '[]',
  patterns JSONB DEFAULT '[]',
  conditions JSONB DEFAULT '[]',
  groups JSONB DEFAULT '[]',
  reference_indicators JSONB DEFAULT '[]',
  time_filter JSONB,
  drawings JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for name uniqueness check
CREATE UNIQUE INDEX strategies_name_idx ON strategies (name);

-- Index for listing strategies
CREATE INDEX strategies_updated_at_idx ON strategies (updated_at DESC);
```

### Future Considerations
- Strategy versioning and history
- Strategy export/import (JSON file)
- Strategy sharing between users
- Strategy categories/folders
- Strategy templates
- Strategy comparison feature
- Load Strategy dialog (companion to Save Strategy)
