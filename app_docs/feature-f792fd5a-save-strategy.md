# Save Strategy

**ADW ID:** f792fd5a
**Date:** 2026-01-20
**Specification:** /home/ubuntu/algotrading/trees/f792fd5a/specs/issue-80-adw-f792fd5a-sdlc_planner-save-strategy.md

## Overview

This feature enables traders to save their complete strategy configuration to a Supabase database with a user-defined name, optional description, and tags. It includes auto-save draft functionality with a 60-second interval for protection against data loss, duplicate name detection with overwrite confirmation, and toast notifications for user feedback.

## What Was Built

- **Save Strategy Dialog** - Modal dialog with form validation for strategy name (required, max 50 chars), description (optional, max 500 chars), and tags (comma-separated)
- **Toast Notification System** - Reusable toast component supporting success, error, warning, and info types with auto-dismiss
- **Backend API Endpoints** - Full CRUD operations for strategies (POST, GET, DELETE) plus name uniqueness checking
- **Strategy Service Layer** - Service module for database operations with Supabase
- **Auto-save Draft** - Automatic localStorage draft saving every 60 seconds with recovery prompt on page return
- **Duplicate Name Detection** - Warning dialog when attempting to save with an existing strategy name
- **Strategy Serialization** - Comprehensive collection of all strategy state including indicators, patterns, conditions, groups, drawings, and settings

## Technical Implementation

### Files Modified

- `app/client/src/pages/Strategy.jsx`: Added Save Strategy button, dialog integration, auto-save draft logic, and strategy serialization (~370 lines added)
- `app/client/src/app/api.js`: Added strategy CRUD endpoints (saveStrategy, listStrategies, getStrategy, deleteStrategy, checkStrategyName)
- `app/client/src/app/constants.js`: Added strategy persistence constants (draft storage keys, auto-save interval, name/description length limits)
- `app/server/server.py`: Added 5 new API endpoints for strategy operations (~200 lines added)
- `app/server/core/data_models.py`: Extended StrategyConfig model with new fields (tags, drawings, groups, reference_indicators, time_filter, patterns) and added supporting models

### New Files Created

- `app/client/src/components/SaveStrategyDialog.jsx`: Modal dialog component for saving strategies with form validation
- `app/client/src/components/Toast.jsx`: Toast notification component with useToast hook for state management
- `app/server/core/strategy_service.py`: Service layer for strategy CRUD operations with Supabase
- `app/server/db/migrations/002_create_strategies_table.sql`: Database migration for strategies table
- `app/server/scripts/create_strategies_table.sql`: SQL script for manual table creation
- `.claude/commands/e2e/test_save_strategy.md`: E2E test specification

### Key Changes

- **Strategy serialization** captures all state: indicators with parameters/styling, patterns, conditions (all V2 sections), condition groups, reference indicators, time filter, drawings, trade direction, candle close confirmation, and chart settings
- **Auto-save draft** runs every 60 seconds when meaningful data exists (indicators, conditions, or drawings) and expires after 24 hours
- **Duplicate name checking** queries the database before save and shows an overwrite confirmation dialog if a strategy with the same name exists
- **Toast notifications** provide immediate feedback on save success/failure with auto-dismiss after 5 seconds
- **Database schema** uses JSONB columns for complex nested data (indicators, conditions, drawings) with indexes on name (unique) and updated_at

## How to Use

1. Build your strategy by adding indicators, patterns, conditions, and drawings on the Strategy page
2. Click the **Save Strategy** button in the page header
3. Enter a strategy name (required, max 50 characters)
4. Optionally add a description and comma-separated tags
5. Click **Save Strategy** to persist to the database
6. If a strategy with the same name exists, confirm whether to overwrite
7. A success toast confirms the save; the strategy can later be retrieved by ID

### Draft Recovery

If you navigate away or close the browser without saving:
- The auto-save system captures your work every 60 seconds
- When you return within 24 hours, a recovery dialog appears
- Choose **Recover** to restore your draft or **Discard** to start fresh

## Configuration

### Database Requirements

The Supabase database must have a `strategies` table with the following structure:

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

CREATE UNIQUE INDEX strategies_name_idx ON strategies (name);
CREATE INDEX strategies_updated_at_idx ON strategies (updated_at DESC);
```

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `STRATEGY_NAME_MAX_LENGTH` | 50 | Maximum characters for strategy name |
| `STRATEGY_DESCRIPTION_MAX_LENGTH` | 500 | Maximum characters for description |
| `AUTO_SAVE_INTERVAL_MS` | 60000 | Auto-save interval (60 seconds) |
| `STRATEGY_DRAFT_EXPIRY_MS` | 86400000 | Draft expiry time (24 hours) |

## Testing

### Manual Testing

1. Open the Strategy page and add at least one indicator
2. Click "Save Strategy" and verify the dialog opens
3. Test validation: empty name shows error, character counters work
4. Save with a unique name and verify success toast
5. Try saving with the same name and verify overwrite dialog appears
6. Wait 60+ seconds and check localStorage for draft data
7. Refresh the page and verify recovery dialog appears

### E2E Test

Run the E2E test specification at `.claude/commands/e2e/test_save_strategy.md`:
- Tests Save Strategy button visibility and dialog functionality
- Tests form validation and character limits
- Tests successful save flow with toast notification
- Tests duplicate name detection and overwrite confirmation

### Backend Tests

```bash
cd app/server && uv run pytest
```

## Notes

- The Load Strategy feature (companion to Save) is planned for future implementation
- Strategy versioning and history are future considerations
- Export/import to JSON files is not yet implemented
- The unique name constraint is enforced at the database level
- Draft auto-save only triggers when there's meaningful data (at least one indicator, condition, or drawing)
