# Patch: Restart Dev Server from Correct Worktree

## Metadata
adw_id: `e22956ea`
review_change_request: `Issue #1: Runtime error 'chart.addAreaSeries is not a function' in EquityCurveChart.jsx prevents the backtest results page from loading. The page displays an uncaught runtime error overlay and the content underneath is blank/white. This completely blocks access to the backtest results page where the new trade visualization feature would be displayed. Resolution: The root cause is that the dev server is running from worktree c3ba5521 instead of the current worktree e22956ea, so it's serving stale bundle.js that contains old lightweight-charts API calls. The code in e22956ea has been correctly updated (EquityCurveChart.jsx lines 2, 112, 137 use the correct v5 API: chart.addAreaSeries() and chart.addLineSeries()). Resolution: Restart the dev server from the correct worktree (e22956ea) or point the dev server to serve from this worktree's app/client directory so the updated code is bundled and served. Severity: blocker`

## Issue Summary
**Original Spec:** N/A
**Issue:** Dev server is running from worktree c3ba5521 instead of e22956ea, serving stale bundle.js with old lightweight-charts API calls. This causes runtime error "chart.addAreaSeries is not a function" that prevents backtest results page from loading.
**Solution:** Stop the dev server running from c3ba5521 and restart it from the current worktree e22956ea so the updated EquityCurveChart.jsx code is bundled and served.

## Files to Modify
No file modifications required - this is a dev environment fix.

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Stop the stale dev server
- Identify the npm process running from `/home/ubuntu/algotrading/trees/c3ba5521/app/client`
- Kill the process to stop serving stale bundle.js
- Run: `pkill -f "npm start" || true`

### Step 2: Start dev server from current worktree
- Navigate to current worktree's client directory: `/home/ubuntu/algotrading/trees/e22956ea/app/client`
- Start the dev server to bundle and serve the updated code
- Run: `cd /home/ubuntu/algotrading/trees/e22956ea && ./scripts/start_client.sh &`

### Step 3: Verify the fix
- Wait for dev server to compile and start (typically 10-20 seconds)
- Check that the server is listening on port 3000
- Verify the process is running from the correct worktree path
- Run: `lsof -i:3000` and `pwdx $(pgrep -f "npm start")`

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Verify dev server worktree**: `pwdx $(pgrep -f "npm start")` - should show `/home/ubuntu/algotrading/trees/e22956ea/app/client`
2. **Check server is running**: `lsof -i:3000` - should show node process listening on port 3000
3. **Frontend build validation**: `cd /home/ubuntu/algotrading/trees/e22956ea/app/client && npm run build` - should complete without errors
4. **E2E test for backtest page**: Run E2E test to verify backtest results page loads without runtime errors

## Patch Scope
**Lines of code to change:** 0
**Risk level:** low
**Testing required:** Verify dev server is running from correct worktree and backtest results page loads without chart API errors
