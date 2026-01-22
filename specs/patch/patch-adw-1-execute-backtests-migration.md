# Patch: Execute Backtests Database Migration

## Metadata
adw_id: `1`
review_change_request: `Issue #1: Database migration 003_create_backtests_table.sql has not been executed in Supabase. The API returns error: 'Could not find the table public.backtests in the schema cache'. While the migration SQL file was created correctly, it was never run against the database, making the entire backtest feature non-functional. Resolution: Execute the migration file app/server/db/migrations/003_create_backtests_table.sql in the Supabase database dashboard or via migration script. This will create the backtests table with all required columns, indexes, and constraints. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-102-adw-b503685d-sdlc_planner-backtest-configuration.md`
**Issue:** The backtests table does not exist in the Supabase database despite the migration SQL file being created. API calls to `/api/backtests/*` fail with error: 'Could not find the table public.backtests in the schema cache'.
**Solution:** Execute the migration SQL file `003_create_backtests_table.sql` in the Supabase SQL Editor to create the backtests table with all required columns, indexes, constraints, and triggers.

## Files to Modify
No code changes required. This is a database administration task:

- `app/server/db/migrations/003_create_backtests_table.sql` - SQL file to execute (already exists, no modifications needed)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Execute Migration SQL in Supabase Dashboard
- Open the Supabase Dashboard for the project
- Navigate to **SQL Editor** (left sidebar)
- Create a new query
- Copy the entire contents of `app/server/db/migrations/003_create_backtests_table.sql`
- Execute the SQL migration
- Verify the query runs successfully without errors

### Step 2: Verify Table Creation
- In Supabase Dashboard, navigate to **Table Editor** (left sidebar)
- Confirm the `backtests` table appears in the list
- Verify the table has the following columns:
  - `id` (UUID, primary key)
  - `name` (VARCHAR(100))
  - `description` (TEXT)
  - `strategy_id` (UUID, foreign key)
  - `pair` (VARCHAR(20))
  - `timeframe` (VARCHAR(10))
  - `start_date` (TIMESTAMPTZ)
  - `end_date` (TIMESTAMPTZ)
  - `initial_balance` (DECIMAL)
  - `currency` (VARCHAR(3))
  - `position_sizing` (JSONB)
  - `risk_management` (JSONB)
  - `status` (VARCHAR(20))
  - `results` (JSONB)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

### Step 3: Verify Indexes and Constraints
- In Supabase SQL Editor, run: `SELECT indexname FROM pg_indexes WHERE tablename = 'backtests';`
- Confirm these indexes exist:
  - `backtests_pkey`
  - `backtests_updated_at_idx`
  - `backtests_strategy_id_idx`
  - `backtests_status_idx`

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **API Health Check**: Start the server and verify API responds without database errors
   ```bash
   cd app/server && ./scripts/start_server.sh
   ```

2. **Test Backtests API Endpoint**: Verify the backtests list endpoint returns successfully
   ```bash
   curl -s http://localhost:8000/api/backtests | jq .
   ```
   - Expected: Empty array `[]` or list of backtests (no schema cache error)

3. **Run Backend Tests**: Verify all backend tests pass
   ```bash
   cd app/server && uv run pytest tests/ -v --tb=short
   ```

4. **Frontend Build**: Verify frontend builds without errors
   ```bash
   cd app/client && npm run build
   ```

5. **E2E Test**: Run the backtest configuration E2E test to verify full functionality
   - Navigate to Backtest Library page
   - Create a new backtest configuration
   - Verify save operation completes without errors

## Patch Scope
**Lines of code to change:** 0 (database administration only)
**Risk level:** low
**Testing required:** API endpoint verification, backend tests, E2E validation of backtest creation flow
