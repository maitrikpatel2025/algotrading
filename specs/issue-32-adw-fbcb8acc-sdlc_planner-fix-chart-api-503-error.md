# Bug: Fix Chart API 503 Error on Strategy Page

## Metadata
issue_number: `32`
adw_id: `fbcb8acc`
issue_json: `{"number":32,"title":"Bug for generating chart for ui","body":"/bug \n\nadw_sdlc_iso\n\nmodel_set heavy\n\nStrategy page while loading the data for the chart, it gives me this the external trading API is currently unavailable (503 errors) can you fix? you might need to check the server."}`

## Bug Description
When loading chart data on the Strategy page, users receive a 503 Service Unavailable error indicating the external trading API is unavailable. The error message displayed is: "The external trading API is currently unavailable (503 errors)". This prevents users from viewing price charts and technical analysis data for currency pairs, which is a core feature of the trading dashboard.

Expected behavior: The Strategy page should successfully load and display candlestick chart data for the selected currency pair and timeframe.

Actual behavior: The page displays an error message about the external trading API being unavailable (503 error).

## Problem Statement
The OpenFX API client (`app/server/core/openfx_api.py`) does not implement retry logic for transient failures. When the external OpenFX trading API returns errors or is temporarily unavailable, the `_make_request()` method fails immediately on the first attempt without retrying. This causes 503 errors to propagate to the frontend without any resilience mechanisms.

## Solution Statement
Implement retry logic with exponential backoff in the `_make_request()` method of the OpenFX API client. This will automatically retry failed requests (especially for transient 503 errors) before returning a failure. The retry mechanism should:
1. Retry up to 3 times with exponential backoff delays (1s, 2s, 4s)
2. Only retry on transient errors (5xx status codes, connection errors)
3. Log retry attempts for debugging
4. Preserve the existing error handling behavior after all retries are exhausted

## Steps to Reproduce
1. Start the application using `./scripts/start.sh`
2. Navigate to http://localhost:3000 (redirects to Monitor page)
3. Click "Strategy" in the navigation bar
4. Select a currency pair (e.g., EUR/USD) and timeframe (e.g., H1)
5. Click "Load Data" button
6. Observe the 503 error message: "Unable to Load Data - The trading API may be unavailable"

## Root Cause Analysis
The root cause is in `app/server/core/openfx_api.py` at the `_make_request()` method (lines 52-102):

1. **No retry logic**: The `_make_request()` method makes a single HTTP request and immediately returns failure if the response status doesn't match the expected code
2. **No differentiation of error types**: Transient errors (503, 502, network timeouts) are treated the same as permanent errors
3. **Immediate failure propagation**: When `fetch_candles()` (line 182-188) calls `_make_request()` and it fails, the failure propagates immediately to `get_candles_df()` (line 220-223) which returns `None`
4. **503 conversion**: The `web_api_candles()` method (line 295-300) converts `None` responses to an `api_error` dictionary, which the server endpoint (`server.py` lines 643-648) converts to a 503 HTTP status

The chain of failure:
```
External API 503 → _make_request() returns (False, error) → fetch_candles() returns (False, None) → get_candles_df() returns None → web_api_candles() returns {'error': 'api_error', ...} → /api/prices endpoint raises HTTPException 503
```

## Relevant Files
Use these files to fix the bug:

- `app/server/core/openfx_api.py` - Contains the `_make_request()` method that needs retry logic. This is the primary file to modify.
- `app/server/server.py` - Contains the `/api/prices` endpoint that handles the error response. No changes needed, but useful for understanding the error flow.
- `app/client/src/pages/Strategy.jsx` - Contains the Strategy page component that displays the error. No changes needed, but useful for testing.
- `app/client/src/app/api.js` - Contains the Axios interceptor for error handling. No changes needed.
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test for Strategy page

### New Files
- `.claude/commands/e2e/test_strategy_chart_load.md` - New E2E test to validate the chart loading functionality works after the fix

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add retry logic to `_make_request()` method
- Open `app/server/core/openfx_api.py`
- Modify the `_make_request()` method to implement retry logic with exponential backoff
- Add a `max_retries` parameter (default 3) and `backoff_base` parameter (default 1.0 seconds)
- Implement retry loop that:
  - Catches transient errors (5xx status codes, connection errors, timeouts)
  - Waits with exponential backoff (backoff_base * 2^attempt seconds)
  - Logs each retry attempt with the attempt number and wait time
  - Returns the last error after all retries are exhausted
- Only retry for transient errors, not for 4xx client errors which are permanent

### 2. Add logging for retry attempts
- Add log statements that indicate:
  - When a retry is being attempted (warning level)
  - The attempt number and total retries remaining
  - The wait time before the next attempt
  - The final failure after all retries exhausted (error level)

### 3. Run server tests to verify changes
- Execute `cd app/server && uv run pytest` to ensure all existing tests pass
- Verify no regressions are introduced

### 4. Run frontend build to verify no breaking changes
- Execute `cd app/client && npm run build` to ensure the frontend builds successfully

### 5. Create E2E test file for Strategy page chart loading
- Read `.claude/commands/e2e/test_trading_dashboard.md` and `.claude/commands/e2e/test_market_headlines.md` for examples
- Create a new E2E test file at `.claude/commands/e2e/test_strategy_chart_load.md`
- The test should validate:
  - Navigate to Strategy page
  - Select a currency pair and timeframe
  - Click Load Data
  - Verify the chart loads successfully (candlestick chart visible)
  - Verify no error message is displayed
  - Take screenshots at key steps

### 6. Run validation commands
- Execute all validation commands listed below to confirm the bug is fixed with zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_strategy_chart_load.md` to validate the Strategy page chart loading works correctly

## Notes
- The retry logic should use `time.sleep()` for the exponential backoff delay
- Be careful not to retry on 4xx errors as these are client errors that won't succeed on retry
- The retry logic should be transparent to callers of `_make_request()` - the return signature should not change
- Consider adding a small jitter to the backoff time to prevent thundering herd problems (optional enhancement)
- The existing throttling logic (`_throttle()`) should continue to work before each request attempt
