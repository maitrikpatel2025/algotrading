# Patch: Configure Supabase Database Connection

## Metadata
adw_id: `1`
review_change_request: `Issue #1: Save Strategy functionality fails because Supabase database is not connected. When attempting to save a strategy, the backend returns errors due to database connectivity issues (database_connected: false in health check). The UI works correctly but the actual save operation cannot complete. Resolution: Configure and connect the Supabase database. Verify SUPABASE_URL and SUPABASE_KEY environment variables are set correctly. Ensure the database is accessible from the server. The strategies table schema should be created as documented in the spec. Once the database is connected, the save functionality should work as the frontend and backend code are properly implemented. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-80-adw-f792fd5a-sdlc_planner-save-strategy.md`
**Issue:** The Save Strategy feature fails because Supabase environment variables in `app/server/.env` contain placeholder values (`SUPABASE_URL=https://your-project.supabase.co`, `SUPABASE_ANON_KEY=your_anon_key_here`). The health check endpoint returns `database_connected: false` because the credentials are not configured with real Supabase project values.
**Solution:** Configure valid Supabase credentials in `app/server/.env` and create the `strategies` table in the Supabase database. This is a configuration issue, not a code issue - the implementation is correct.

## Files to Modify
- `app/server/.env` - Update with real Supabase credentials (SUPABASE_URL and SUPABASE_ANON_KEY)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Obtain Supabase Credentials
- Go to https://supabase.com/dashboard
- Create a new project or select an existing project
- Navigate to Project Settings > API
- Copy the following values:
  - **Project URL** → `SUPABASE_URL` (format: `https://xxxxx.supabase.co`)
  - **anon public key** → `SUPABASE_ANON_KEY`
  - **service_role secret** → `SUPABASE_SERVICE_KEY` (optional but recommended for server-side operations)

### Step 2: Update Environment Variables
- Edit `app/server/.env`
- Replace placeholder values with real Supabase credentials:
  ```bash
  SUPABASE_URL=https://your-actual-project.supabase.co
  SUPABASE_ANON_KEY=your_actual_anon_key
  SUPABASE_SERVICE_KEY=your_actual_service_key
  ```

### Step 3: Create Strategies Table in Supabase
- Open Supabase SQL Editor in the dashboard
- Execute the following SQL to create the strategies table:
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

### Step 4: Restart the Backend Server
- Stop the running server if active
- Restart the server to pick up the new environment variables:
  ```bash
  ./scripts/stop_apps.sh
  ./scripts/start.sh
  ```

### Step 5: Verify Database Connection
- Check the health endpoint returns `database_connected: true`:
  ```bash
  curl http://localhost:8000/api/health
  ```
- Expected response should include `"database_connected": true`

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/server && uv run python -m py_compile server.py core/*.py` - Python syntax check
2. `cd app/server && uv run ruff check .` - Backend linting
3. `cd app/server && uv run pytest tests/ -v --tb=short` - Backend tests
4. `cd app/client && npm run build` - Frontend build (must pass)
5. `curl http://localhost:8000/api/health | jq .database_connected` - Verify database connection returns `true`
6. Run E2E test: Read and execute `.claude/commands/e2e/test_save_strategy.md` to verify Save Strategy functionality works end-to-end

## Patch Scope
**Lines of code to change:** 0 (configuration only - update environment variables)
**Risk level:** low
**Testing required:** Verify health check returns database_connected: true, then run E2E test for Save Strategy feature
