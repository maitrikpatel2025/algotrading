# Patch: Fix .env configuration and validate Multi-TF button

## Metadata
adw_id: `27834e18`
review_change_request: `Issue #1: The 'Multi-TF' button (implemented in LogicPanel.jsx lines 547-561) does not render in the UI. During testing, the dev server was running from worktree 6d049c54 instead of the current branch 27834e18, causing old code to be served. Multiple attempts to restart services from the correct worktree failed due to environment configuration issues (.env file had conflicting API URLs on lines 12 vs 20 pointing to ports 8000 vs 9102). The code implementation exists and appears correct, but runtime validation could not be completed. Resolution: 1. Ensure the dev server is running from the correct worktree (27834e18). 2. Fix the .env file to have consistent API URL configuration (remove duplicate REACT_APP_API_URL declarations). 3. Restart both backend (port 8000) and frontend (port 3000) services. 4. Verify the Multi-TF button appears below each 'Add Condition' button in the Logic Panel sections. 5. Test the full multi-timeframe condition workflow per the E2E test specification. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-74-adw-27834e18-sdlc_planner-multi-timeframe-conditions.md`
**Issue:** The Multi-TF button could not be validated at runtime due to: (1) dev server running from wrong worktree, (2) duplicate REACT_APP_API_URL declarations in .env file on lines 12 and 20
**Solution:** Fix the .env file by removing the duplicate REACT_APP_API_URL declaration, then start services from the correct worktree and validate the Multi-TF button renders correctly

## Files to Modify
Use these files to implement the patch:

- `app/client/.env` - Remove duplicate REACT_APP_API_URL declaration on line 20

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Fix .env file duplicate declaration
- Edit `app/client/.env` to remove the duplicate `REACT_APP_API_URL=http://localhost:8000/api` on line 20
- Keep only the declaration on line 12: `REACT_APP_API_URL=http://localhost:8000/api`
- Ensure the file has consistent configuration:
  ```
  REACT_APP_API_URL=http://localhost:8000/api
  BACKEND_PORT=8000
  FRONTEND_PORT=3000
  VITE_BACKEND_URL=http://localhost:8000
  ```

### Step 2: Verify correct worktree
- Run `pwd` to confirm working directory is `/home/ubuntu/algotrading/trees/27834e18`
- Run `git branch --show-current` to confirm branch is `feature-issue-74-adw-27834e18-multi-timeframe-conditions`

### Step 3: Start services from correct worktree
- Stop any existing services: `scripts/stop.sh`
- Start backend and frontend: `scripts/start.sh`
- Wait for services to be ready on ports 8000 (backend) and 3000 (frontend)

### Step 4: Validate Multi-TF button renders
- Use Playwright to navigate to http://localhost:3000
- Navigate to Strategy page
- Load price data for EUR/USD M15
- Verify the Multi-TF button appears below each "Add Condition" button in Logic Panel sections
- Take screenshots to document the button is visible

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd /home/ubuntu/algotrading/trees/27834e18 && cat app/client/.env | grep -c "REACT_APP_API_URL"` - Should return `1` (only one declaration)
2. `cd /home/ubuntu/algotrading/trees/27834e18/app/server && uv run pytest` - Backend tests pass
3. `cd /home/ubuntu/algotrading/trees/27834e18/app/client && npm run build` - Frontend build succeeds
4. Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_multi_timeframe_conditions.md` - E2E test passes (at minimum Phase 1 and Phase 2 verifying the Multi-TF button is visible)

## Patch Scope
**Lines of code to change:** 1 (remove duplicate line)
**Risk level:** low
**Testing required:** E2E validation of Multi-TF button visibility
