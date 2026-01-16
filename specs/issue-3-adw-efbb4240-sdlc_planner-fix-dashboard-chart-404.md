# Bug: Dashboard Chart 404 Error on Load

## Metadata
issue_number: `3`
adw_id: `efbb4240`
issue_json: `{"number":3,"title":"Bug 0pen dashboard page status code 404","body":"Using adw_plan_build_review\n\n/bug\n\nThere is a bug when I try to open dashboard page and select my pair and select my time tick and after I click the load button, it fails the load I'm not able to load the chart. It gives me this error.\n\nRequest failed with status code 404\n    at createError (http://localhost:3000/static/js/bundle.js:6298:15)\n    at settle (http://localhost:3000/static/js/bundle.js:6552:12)\n    at XMLHttpRequest.onloadend (http://localhost:3000/static/js/bundle.js:5684:7)"}`

## Bug Description
When users navigate to the Dashboard page, select a currency pair and timeframe, and click the "Load Data" button, the application fails to load the chart data. Instead of displaying the price chart and technical analysis data, an error is thrown with the message "Request failed with status code 404". This error originates from the Axios HTTP client when attempting to fetch data from the backend API endpoints.

The expected behavior is that after selecting a pair (e.g., EUR/USD) and timeframe (e.g., H1) and clicking "Load Data", the application should:
1. Successfully fetch technical analysis data from `/api/technicals/{pair}/{timeframe}`
2. Successfully fetch price candlestick data from `/api/prices/{pair}/{granularity}/{count}`
3. Display the candlestick chart and technical indicators on the page

The actual behavior is a 404 HTTP error, indicating the server cannot find the requested resource or the data retrieval failed.

## Problem Statement
The backend API returns a 404 status code when the frontend requests technical analysis or price data for a selected currency pair and timeframe. This prevents users from viewing any chart data on the Dashboard page.

## Solution Statement
Investigate and fix the root cause of the 404 error by:
1. Identifying which API endpoint(s) are returning 404 (technicals, prices, or both)
2. Adding proper error handling in the backend to return meaningful error messages instead of generic 404s
3. Improving the frontend error handling to display user-friendly error messages
4. Adding fallback behavior when external data sources (Investing.com, OpenFX API) are unavailable

## Steps to Reproduce
1. Start the backend server: `cd app/server && uv run python server.py`
2. Start the frontend client: `cd app/client && npm start`
3. Open browser and navigate to http://localhost:3000
4. Click on "Dashboard" in the navigation
5. Select a currency pair from the dropdown (e.g., "EUR_USD")
6. Select a timeframe from the dropdown (e.g., "H1")
7. Click the "Load Data" button
8. Observe the error: "Request failed with status code 404"

## Root Cause Analysis
The 404 error can originate from two backend endpoints:

1. **Technical Analysis Endpoint** (`/api/technicals/{pair}/{timeframe}` - `app/server/server.py:307-337`):
   - Calls `get_pair_technicals(pair, timeframe)` from `app/server/scraping/investing.py`
   - Returns 404 when `get_pair_technicals()` returns `None`
   - This happens when:
     - The pair is not found in `settings.INVESTING_COM_PAIRS` configuration
     - The external request to Investing.com fails (network error, blocking, rate limiting)
     - The response parsing fails (website structure changed)

2. **Prices Endpoint** (`/api/prices/{pair}/{granularity}/{count}` - `app/server/server.py:340-371`):
   - Calls `api.web_api_candles(pair, granularity, count)` from `app/server/core/openfx_api.py`
   - Returns 404 when `web_api_candles()` returns `None`
   - This happens when:
     - OpenFX API credentials are invalid or not configured in `.env`
     - The API request fails due to network issues
     - The requested pair is not available on the OpenFX platform
     - The candle data response is empty or malformed

3. **Frontend Error Handling** (`app/client/src/pages/Dashboard.jsx`):
   - The `loadTechnicals()` and `loadPrices()` functions don't have proper error handling
   - When the API returns an error, it's not caught and displayed to the user
   - The axios client in `app/client/src/app/api.js` doesn't handle errors gracefully

## Relevant Files
Use these files to fix the bug:

- `app/server/server.py` - Contains the `/api/technicals` and `/api/prices` endpoints that return 404 errors. Need to improve error responses with specific error messages.
- `app/server/scraping/investing.py` - Contains `get_pair_technicals()` function that scrapes Investing.com. Need to add better error handling and logging to identify why it returns None.
- `app/server/core/openfx_api.py` - Contains `web_api_candles()` function that fetches price data from OpenFX. Need to add better error handling and logging.
- `app/server/config/settings.py` - Contains API credentials and pair configurations. Need to verify configuration is correct.
- `app/client/src/pages/Dashboard.jsx` - Contains the frontend logic for loading data. Need to add try-catch error handling.
- `app/client/src/app/api.js` - Contains the axios API client. Need to add error interceptor for better error handling.
- `.claude/commands/test_e2e.md` - Reference for E2E test runner documentation.
- `.claude/commands/e2e/test_trading_dashboard.md` - Reference for E2E test format.

### New Files
- `.claude/commands/e2e/test_dashboard_chart_load.md` - New E2E test file to validate the dashboard chart loading functionality works correctly after the fix.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Error Handling to Backend Scraping Module
- Update `app/server/scraping/investing.py`:
  - Improve error logging in `fetch_technicals()` to log specific failure reasons (network errors, parsing errors, etc.)
  - Add more detailed exception handling to identify the exact point of failure
  - Return a descriptive error message instead of just `None` when scraping fails

### Step 2: Improve Backend OpenFX API Error Handling
- Update `app/server/core/openfx_api.py`:
  - Improve error logging in `web_api_candles()` to log when and why data fetching fails
  - Add more specific error handling for common failure scenarios (auth failure, network timeout, empty response)
  - Return descriptive error information when API calls fail

### Step 3: Update Backend API Endpoints with Better Error Responses
- Update `app/server/server.py`:
  - Modify the `/api/technicals/{pair}/{timeframe}` endpoint to return more specific error messages (e.g., "External data source unavailable" vs "Invalid pair")
  - Modify the `/api/prices/{pair}/{granularity}/{count}` endpoint to return more specific error messages
  - Consider returning a 503 (Service Unavailable) for external service failures instead of 404
  - Add proper logging to track which endpoint is failing and why

### Step 4: Add Frontend Error Handling
- Update `app/client/src/pages/Dashboard.jsx`:
  - Add try-catch blocks around the `loadTechnicals()` and `loadPrices()` API calls
  - Add an error state variable to track and display errors
  - Display a user-friendly error message when data loading fails
  - Allow users to retry loading data after an error

### Step 5: Add Axios Error Interceptor
- Update `app/client/src/app/api.js`:
  - Add an axios response interceptor to handle error responses globally
  - Transform error responses into user-friendly messages
  - Log errors to the console for debugging purposes

### Step 6: Create E2E Test for Dashboard Chart Loading
- Read `.claude/commands/e2e/test_trading_dashboard.md` and `.claude/commands/e2e/test_market_headlines.md` for reference
- Create `.claude/commands/e2e/test_dashboard_chart_load.md`:
  - Test that navigating to Dashboard works
  - Test that selecting a pair and timeframe works
  - Test that clicking "Load Data" either loads the chart successfully OR displays a user-friendly error message
  - Take screenshots at each step to validate the UI state
  - Validate that the application doesn't crash on error

### Step 7: Run Validation Commands
- Execute all validation commands to ensure the bug is fixed with zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

1. **Run server tests** to validate backend changes don't break existing functionality:
   ```bash
   cd app/server && uv run pytest
   ```

2. **Run frontend build** to validate frontend changes compile without errors:
   ```bash
   cd app/client && npm run build
   ```

3. **Manual test before fix** - reproduce the bug:
   - Start the app with `./scripts/start.sh`
   - Navigate to Dashboard, select pair/timeframe, click "Load Data"
   - Confirm the 404 error occurs

4. **Manual test after fix** - verify the fix:
   - Start the app with `./scripts/start.sh`
   - Navigate to Dashboard, select pair/timeframe, click "Load Data"
   - Confirm either: chart loads successfully OR a user-friendly error message is displayed (not a raw 404 error)

5. **E2E test validation** - Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_dashboard_chart_load.md` to validate the dashboard chart loading functionality works correctly.

## Notes
- The 404 error may be caused by external dependencies (Investing.com, OpenFX API) being unavailable or blocking requests. The fix should gracefully handle these scenarios.
- If OpenFX API credentials are not configured, the `.env` file needs to be checked and updated with valid credentials.
- The Investing.com scraper may need rate limiting or user-agent rotation if requests are being blocked.
- Consider implementing a caching layer in the future to reduce external API calls and improve reliability.
- The error stack trace in the bug report shows the error originates from axios (createError, settle, XMLHttpRequest.onloadend), confirming this is an HTTP request failure.
