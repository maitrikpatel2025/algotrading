# Patch: Auto-load Chart Data on Pair/Timeframe Selection

## Metadata
adw_id: `72441440`
review_change_request: `Issue #1: Chart does not load when currency pair (EUR_USD) and timeframe (5m) are selected. The page remains in 'Ready to Analyze' empty state with no price data fetched. Network logs show only /api/technicals calls but no /api/prices calls, and no WebSocket connection is established. This completely blocks testing of the WebSocket real-time chart feature. Resolution: The Strategy.jsx page needs to be updated to automatically trigger data loading (loadTechnicals function) when selectedPair and selectedGran change. Add a useEffect hook that calls loadTechnicals() when these dependencies change, or restore the auto-load behavior that existed before the frontend redesign. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-86-adw-72441440-sdlc_planner-websocket-tradingview-realtime-chart.md
**Issue:** The Strategy page does not automatically load chart data when a currency pair and timeframe are selected. The loadTechnicals function exists but is never called automatically when selectedPair or selectedGran change, leaving the chart in an empty "Ready to Analyze" state.
**Solution:** Add a useEffect hook in Strategy.jsx that monitors selectedPair and selectedGran and automatically calls loadTechnicals() when both values are set and valid.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/pages/Strategy.jsx` - Add useEffect hook to auto-trigger loadTechnicals when selectedPair and selectedGran change

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Auto-load useEffect Hook
- Locate the existing loadTechnicals function in Strategy.jsx (around line 563)
- Add a new useEffect hook after the existing useEffect hooks (after line 2340 or similar)
- The useEffect should:
  - Depend on [selectedPair, selectedGran]
  - Check if both selectedPair and selectedGran are truthy (not null/undefined)
  - Call loadTechnicals() if both values are valid
  - Skip calling if either value is null/undefined to avoid unnecessary API calls during initialization
- Use a guard condition at the start: `if (!selectedPair || !selectedGran) return;`

### Step 2: Verify Implementation
- Ensure the useEffect is placed in the correct location with other effect hooks
- Confirm the dependency array includes only selectedPair and selectedGran
- Verify no infinite loop can occur (loadTechnicals should not update selectedPair or selectedGran)

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Build Validation**
   ```bash
   cd app/client && npm run build
   ```
   - Should complete with zero errors

2. **Backend Tests**
   ```bash
   cd app/server && uv run pytest tests/ -v --tb=short
   ```
   - Should pass with zero failures

3. **Manual UI Test**
   - Start the application
   - Navigate to Strategy page
   - Select a currency pair (EUR_USD)
   - Select a timeframe (M5)
   - Verify the chart loads automatically without clicking any "Load" button
   - Check browser network tab for /api/prices and /api/technicals calls
   - Verify chart displays price data

4. **E2E Test**
   - Read `.claude/commands/test_e2e.md`
   - Read and execute `.claude/commands/e2e/test_websocket_realtime_chart.md`
   - Verify the test passes with the auto-load behavior working correctly

## Patch Scope
**Lines of code to change:** ~10 lines (one new useEffect hook with guard condition)
**Risk level:** low
**Testing required:** Frontend build validation, manual UI testing to confirm auto-load triggers correctly, E2E test for WebSocket chart feature
