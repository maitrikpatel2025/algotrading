# Patch: Fix FXOpen Trade History API Timeout

## Metadata
adw_id: `bbdb5a41`
review_change_request: `Issue #1: The /api/trades/history endpoint times out when calling the FXOpen Trade History API (POST /api/v2/tradehistory), causing the Account page to hang indefinitely on 'Loading account data...'. Despite setting a timeout of (5, 10) seconds in the code (openfx_api.py:87), the API call hangs for over 90 seconds without returning. This completely blocks the Account page from rendering and prevents users from viewing any account information including open trades and trade history. Resolution: Investigate why the FXOpen API call is timing out. Possible solutions: 1) Verify FXOpen API credentials and endpoint availability, 2) Add better error handling and fallback behavior to allow the page to render even if trade history fails, 3) Check if the request body format matches FXOpen API expectations, 4) Consider implementing client-side timeout and error states so the UI doesn't hang indefinitely, 5) Add proper exception catching for timeout errors in the trade_history endpoint. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-21-adw-bbdb5a41-sdlc_planner-implement-trade-history-api.md
**Issue:** The /api/trades/history endpoint causes the Account page to hang indefinitely when the FXOpen API call to POST /api/v2/tradehistory times out. The timeout setting of (5, 10) seconds is not being respected, and the call hangs for 90+ seconds. This blocks the entire Account page from rendering.
**Solution:** Add proper timeout exception handling in the backend trade_history endpoint, implement graceful degradation to allow the page to render even when trade history fails, and add client-side timeout/error handling to prevent indefinite loading states.

## Files to Modify
- `app/server/server.py` (lines 217-280) - Add timeout exception handling and graceful error responses in trade_history endpoint
- `app/client/src/components/TradeHistory.jsx` - Add loading timeout and error state handling on client side
- `app/client/src/pages/Account.jsx` - Ensure parallel data fetching so trade history failure doesn't block other data

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add timeout exception handling in backend trade_history endpoint
- Open `app/server/server.py` and locate the `trade_history()` endpoint (lines 217-280)
- Import `requests.exceptions.Timeout` and `requests.exceptions.RequestException` at the top
- Wrap the `api.get_trade_history()` call in a try-except block that specifically catches:
  - `requests.exceptions.Timeout` - for connection and read timeouts
  - `requests.exceptions.RequestException` - for other network errors
- When timeout occurs, log a warning with the specific error and return a successful response with empty trades list and an informative message like "Trade history request timed out. Please try again later."
- Ensure the response allows the frontend to render gracefully instead of hanging

### Step 2: Add client-side timeout handling in TradeHistory component
- Open `app/client/src/components/TradeHistory.jsx`
- Implement a client-side timeout (e.g., 15 seconds) using AbortController or setTimeout
- If the API request exceeds the timeout, cancel the request and show an error message: "Unable to load trade history. The request timed out."
- Add an error state to display when the API fails or times out
- Add a "Retry" button in the error state to allow users to manually retry loading trade history
- Ensure the component doesn't block indefinitely with the loading spinner

### Step 3: Verify parallel data fetching in Account page
- Open `app/client/src/pages/Account.jsx`
- Verify that the Account page fetches account summary, open trades, and trade history in parallel (not sequentially)
- Ensure that if trade history fails or times out, the other sections (account summary and open trades) still render successfully
- If data fetching is sequential, refactor to use Promise.allSettled() or parallel useEffect hooks so failures are isolated

## Validation
Execute every command to validate the patch is complete with zero regressions.

### Backend Tests
```bash
cd app/server && uv run pytest tests/test_trades_endpoints.py -v
```

### Frontend Build
```bash
cd app/client && npm run build
```

### Manual Verification
1. Start the application: `./scripts/start.sh`
2. Navigate to http://localhost:3000/account
3. Verify the page loads within 15 seconds even if trade history fails
4. Verify account summary and open trades sections render even if trade history times out
5. Verify trade history shows appropriate error message if timeout occurs
6. Verify "Retry" button works if implemented

### E2E Test
```bash
cd .claude/commands && cat e2e/test_account_page.md
```
Execute the E2E test to verify Account page functionality

## Patch Scope
**Lines of code to change:** ~30-50 lines (backend exception handling, client timeout logic, error UI states)
**Risk level:** low (adding defensive error handling, no breaking changes to successful code paths)
**Testing required:** Unit tests for timeout handling, manual testing of Account page with slow/failing API, E2E test verification
