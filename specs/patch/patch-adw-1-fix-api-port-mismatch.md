# Patch: Fix API configuration port mismatch

## Metadata
adw_id: `1`
review_change_request: `API configuration mismatch: The client .env file (app/client/.env) has REACT_APP_API_URL set to http://localhost:9101/api, but the backend server is running on port 8000. This causes the Strategy Selector to show 'Failed to load strategies' and prevents users from selecting a strategy, which is required to create a backtest. Resolution: Update app/client/.env file to set REACT_APP_API_URL=http://localhost:8000/api (or update all BACKEND_PORT references from 9101 to 8000). Then rebuild the client with 'npm run build' and restart the services. Severity: blocker`

## Issue Summary
**Original Spec:** N/A
**Issue:** The `app/client/.env` file has duplicate `REACT_APP_API_URL` entries - the second entry at line 20 overrides the correct value (port 8000) with an incorrect value (port 9101). Additionally, `BACKEND_PORT` and `VITE_BACKEND_URL` reference port 9101 instead of 8000.
**Solution:** Remove the duplicate/incorrect configuration entries (lines 17-20) that override the correct API URL, then rebuild the client.

## Files to Modify
Use these files to implement the patch:

- `app/client/.env` - Remove duplicate/incorrect port configuration entries

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Fix the .env file configuration
- Remove lines 17-20 from `app/client/.env` which contain incorrect port references:
  - `BACKEND_PORT=9101`
  - `FRONTEND_PORT=9201`
  - `VITE_BACKEND_URL=http://localhost:9101`
  - `REACT_APP_API_URL=http://localhost:9101/api` (duplicate that overrides correct value)
- The correct `REACT_APP_API_URL=http://localhost:8000/api` at line 12 will remain

### Step 2: Rebuild the client
- Run `cd app/client && npm run build` to rebuild with the corrected configuration

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Verify .env configuration:**
   - Command: `grep -n "REACT_APP_API_URL" app/client/.env`
   - Expected: Single entry pointing to port 8000

2. **Frontend Build:**
   - Command: `cd app/client && npm run build`
   - Expected: Build completes successfully

3. **Backend Tests:**
   - Command: `cd app/server && uv run pytest tests/ -v --tb=short`
   - Expected: All tests pass

## Patch Scope
**Lines of code to change:** 4 lines removed
**Risk level:** low
**Testing required:** Frontend build verification, manual verification that Strategy Selector loads strategies correctly
