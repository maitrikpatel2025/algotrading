# Patch: Apply Database Migrations for Backtest Table

## Metadata
adw_id: `2bf4bcfd`
review_change_request: `Database migration 004_add_backtest_progress_fields.sql has not been applied to the running database instance. The server is running from tree b503685d while the current branch is in tree 2bf4bcfd. All backtest-related API calls fail with error: 'Could not find the table public.backtests in the schema cache'.`

## Issue Summary
**Original Spec:** N/A (database migration issue)
**Issue:** The backtests table and progress tracking fields have not been applied to the running Supabase database. Server from tree b503685d is running but missing migrations 003 and 004 which create the backtests table and add progress tracking fields.
**Solution:** Apply the database migrations to the running Supabase instance using the run_migration.py script.

## Files to Modify
No code changes required. This patch involves running database migrations:

- `app/server/db/migrations/003_create_backtests_table.sql` - Creates the backtests table
- `app/server/db/migrations/004_add_backtest_progress_fields.sql` - Adds progress tracking fields

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Apply Migration 003 - Create Backtests Table
- Run the migration script to create the base backtests table
- Command: `cd app/server && uv run python scripts/run_migration.py db/migrations/003_create_backtests_table.sql`
- This creates the backtests table with columns: id, name, description, strategy_id, pair, timeframe, start_date, end_date, initial_balance, currency, position_sizing, risk_management, status, results, created_at, updated_at

### Step 2: Apply Migration 004 - Add Progress Tracking Fields
- Run the migration script to add progress tracking columns
- Command: `cd app/server && uv run python scripts/run_migration.py db/migrations/004_add_backtest_progress_fields.sql`
- This adds columns: progress_percentage, current_date_processed, total_candles, candles_processed, trade_count, started_at, completed_at, error_message, partial_results
- Also updates status constraint to include 'cancelling' status

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Verify Table Exists**: After migrations, the output should show 'backtests' in the list of tables
2. **Python Syntax Check**: `cd app/server && uv run python -m py_compile server.py core/*.py`
3. **Backend Linting**: `cd app/server && uv run ruff check .`
4. **Backend Tests**: `cd app/server && uv run pytest tests/ -v --tb=short`
5. **Frontend Build**: `cd app/client && npm run build`

## Patch Scope
**Lines of code to change:** 0 (database migration only)
**Risk level:** low
**Testing required:** Verify migrations applied successfully by checking table list output and running backend tests
