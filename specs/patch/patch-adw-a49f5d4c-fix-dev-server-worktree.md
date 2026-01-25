# Patch: Fix Dev Server Worktree Mismatch

## Metadata
adw_id: `a49f5d4c`
review_change_request: `Issue #1: Account page is stuck in infinite loading state showing 'Loading account data...' and never renders the Open Trades table. The page makes successful API calls (200 status) but the React component's loading state never transitions to false. This prevents validation of all the enhanced Open Trades features including sortable columns, P/L display, duration, bot name, total summary row, and the close position dialog. Resolution: Root cause: The frontend dev server (running on port 3000) is serving code from worktree 07b7ce3f instead of the current worktree a49f5d4c. This causes a version mismatch between the frontend code and the API responses. Resolution: Restart the dev server from the correct worktree (a49f5d4c) using 'cd /home/ubuntu/algotrading/trees/a49f5d4c && ./scripts/start.sh' to serve the updated frontend code with the enhanced Open Trades component. Severity: blocker`

## Issue Summary
**Original Spec:** N/A (Deployment/Environment Issue)
**Issue:** The frontend dev server is serving code from the wrong worktree (07b7ce3f) instead of the current worktree (a49f5d4c), causing a version mismatch that leaves the Account page stuck in an infinite loading state.
**Solution:** Stop all running services and restart them from the correct worktree (a49f5d4c) to serve the updated frontend code with the enhanced Open Trades features.

## Files to Modify
This is an operational fix - no code changes required. Only script execution needed:

- `scripts/stop_apps.sh` - Stop running services
- `scripts/start.sh` - Start services from correct worktree

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Stop all running services
- Execute `./scripts/stop_apps.sh` from the a49f5d4c worktree to kill all processes on ports 3000, 8000, and related services
- This ensures no stale processes from other worktrees remain running

### Step 2: Verify ports are free
- Check that ports 3000 and 8000 are not in use
- Command: `lsof -ti:3000,8000` should return empty

### Step 3: Start services from correct worktree
- Execute `./scripts/start.sh` from `/home/ubuntu/algotrading/trees/a49f5d4c`
- Wait for services to fully initialize (backend, frontend, bot)

### Step 4: Verify Account page loads correctly
- Navigate to the Account page in browser
- Confirm Open Trades table renders with all enhanced features:
  - Sortable columns
  - P/L display with color coding
  - Duration column
  - Bot name column
  - Total summary row

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Check services are running from correct worktree:**
   ```bash
   lsof -ti:3000 && lsof -ti:8000
   ```
   Expected: Both ports should show active processes

2. **Verify frontend serves correct code:**
   Navigate to http://localhost:3000/account and confirm:
   - Page loads without infinite loading spinner
   - Open Trades table displays with all columns
   - No console errors related to API response parsing

3. **Run backend tests:**
   ```bash
   cd /home/ubuntu/algotrading/trees/a49f5d4c/app/server && uv run pytest tests/ -v --tb=short
   ```

4. **Run frontend build:**
   ```bash
   cd /home/ubuntu/algotrading/trees/a49f5d4c/app/client && npm run build
   ```

## Patch Scope
**Lines of code to change:** 0 (operational fix only)
**Risk level:** low
**Testing required:** Manual verification that Account page renders correctly with Open Trades features
