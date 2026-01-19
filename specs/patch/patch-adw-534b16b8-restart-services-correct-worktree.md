# Patch: Restart Services from Correct Worktree

## Metadata
adw_id: `534b16b8`
review_change_request: `Issue #1: The Indicator Settings Dialog is missing Line Thickness, Line Style, and Fill Opacity controls in the running application. The dialog only shows Parameters and Color sections. Investigation revealed that the React dev server is running from worktree 'a5444a1e' instead of the current worktree '534b16b8' where the feature was implemented. Process check shows: '/home/ubuntu/algotrading/trees/a5444a1e/app/client/node_modules/react-scripts/scripts/start.js' is running. Resolution: The application services must be restarted from the correct worktree (534b16b8). The start.sh script should be executed from /home/ubuntu/algotrading/trees/534b16b8 to serve the implemented code. The code implementation itself is complete and correct - this is purely an infrastructure/deployment issue. After restarting services from the correct directory, all styling controls should be visible and functional. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-60-adw-534b16b8-sdlc_planner-indicator-color-style-customization.md
**Issue:** The Indicator Settings Dialog is missing the newly implemented Line Thickness, Line Style, and Fill Opacity controls. Investigation revealed that application services (React dev server, FastAPI backend, trading bot) are currently running from `/home/ubuntu/algotrading` (main branch) instead of the feature worktree `/home/ubuntu/algotrading/trees/534b16b8` where the indicator styling feature was implemented.
**Solution:** Stop all currently running services and restart them from the correct worktree directory (`/home/ubuntu/algotrading/trees/534b16b8`) using the existing start.sh script. This is purely an infrastructure/deployment issue - no code changes are required.

## Files to Modify
No files need to be modified. This is an operational fix requiring service restart from the correct directory.

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Stop all currently running services
- Kill all processes running on ports 3000 (React dev server) and 8000 (FastAPI backend)
- Use `lsof -ti:3000 | xargs kill -9` and `lsof -ti:8000 | xargs kill -9`
- Verify no processes remain: `ps aux | grep -E "(react-scripts|server.py|start.sh)" | grep -v grep`
- Confirm ports are free: `lsof -i :3000 -i :8000`

### Step 2: Restart services from the correct worktree
- Navigate to the feature worktree: `cd /home/ubuntu/algotrading/trees/534b16b8`
- Verify we're in the correct directory: `pwd` should show `/home/ubuntu/algotrading/trees/534b16b8`
- Verify the branch: `git branch --show-current` should show `feature-issue-60-adw-534b16b8-indicator-color-style-customization`
- Start all services: `nohup ./scripts/start.sh > /tmp/534b16b8_start.log 2>&1 &`
- Wait for services to initialize: `sleep 10`

### Step 3: Verify services are running from correct worktree
- Check React dev server process: `ps aux | grep react-scripts | grep 534b16b8`
- Check backend server process: `ps aux | grep server.py`
- Verify frontend is accessible: `curl -s http://localhost:3000 | head -5`
- Verify backend is accessible: `curl -s http://localhost:8000/docs | head -5`
- Check startup logs: `cat /tmp/534b16b8_start.log`

### Step 4: Verify indicator styling controls are now visible
- Navigate to http://localhost:3000 in browser
- Open the Strategy page
- Drag an indicator (e.g., SMA) onto the chart
- Click the settings icon to open the Indicator Settings Dialog
- Verify the following sections are present:
  - Parameters section (existing)
  - Color section (existing)
  - **Line Thickness section** (new - should show 1px, 2px, 3px, 4px buttons)
  - **Line Style section** (new - should show Solid, Dashed, Dotted buttons)
  - **Fill Opacity section** (new - should show slider for Bollinger Bands/Keltner Channel)
  - Reset to Default button (new)

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Verify services are running from correct worktree:**
   ```bash
   ps aux | grep react-scripts | grep -o "/home/ubuntu/algotrading/trees/[^/]*" | uniq
   ```
   Expected output: `/home/ubuntu/algotrading/trees/534b16b8`

2. **Verify frontend build works:**
   ```bash
   cd /home/ubuntu/algotrading/trees/534b16b8 && cd app/client && npm run build
   ```
   Expected: Build completes successfully with no errors

3. **Verify backend tests pass:**
   ```bash
   cd /home/ubuntu/algotrading/trees/534b16b8 && cd app/server && uv run pytest tests/ -v --tb=short
   ```
   Expected: All tests pass

4. **Verify indicator styling E2E test:**
   ```bash
   cd /home/ubuntu/algotrading/trees/534b16b8 && /claude skill e2e:test_indicator_color_style
   ```
   Expected: E2E test passes with all styling controls functional

5. **Manual verification:**
   - Open http://localhost:3000
   - Add an indicator and open settings
   - Verify Line Thickness, Line Style, and Fill Opacity controls are visible and functional

## Patch Scope
**Lines of code to change:** 0 (operational fix only)
**Risk level:** low
**Testing required:** Verify services restart successfully and indicator styling controls are visible in the running application
