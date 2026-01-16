# Bug: Account Summary endpoint missing from server

## Metadata
issue_number: `111`
adw_id: `111`
issue_json: `"our Account Summary Unable to load account data. Please try again later. Able to load account details"`

## Bug Description
The Account Summary component on the frontend displays "Unable to load account data. Please try again later." This error message appears when the `account` state is null after the API call fails. The frontend client calls `/api/account` endpoint to fetch account data, but this endpoint does not exist in the FastAPI server routes. The `OpenFxApi` class has a `get_account_summary()` method that can retrieve account data from the OpenFX API, but no server route exposes this functionality.

## Problem Statement
The `/api/account` endpoint is missing from `server.py`. The server startup banner mentions the endpoint exists (line 282), but the actual route handler was never implemented. This causes the frontend `AccountSummary.jsx` component to receive a 404 error when calling `endPoints.account()`, resulting in the error state being displayed to users.

## Solution Statement
Add the missing `/api/account` endpoint to `server.py` that:
1. Calls `api.get_account_summary()` to fetch account data from OpenFX API
2. Returns the raw account data directly to the frontend (the frontend expects fields like `Id`, `Balance`, `Equity`, `Profit`, `Margin`, `MarginLevel`, `Leverage`)
3. Handles errors gracefully and returns appropriate error responses

## Steps to Reproduce
1. Start the backend server: `cd app/server && uv run python server.py`
2. Start the frontend client: `cd app/client && npm start`
3. Navigate to http://localhost:3000
4. Observe the Account Summary section displays "Unable to load account data. Please try again later."
5. Check browser DevTools Network tab - the `/api/account` request returns 404 Not Found

## Root Cause Analysis
The `/api/account` route was documented and mentioned in the server startup banner but was never actually implemented. Looking at `server.py`:
- Line 282 mentions: `• GET /api/account     - Account summary`
- The `api = OpenFxApi()` is initialized on line 75
- The `api.get_account_summary()` method exists in `core/openfx_api.py` (line 108)
- However, no `@app.get("/api/account")` route handler exists in `server.py`

The frontend `AccountSummary.jsx` component:
- Calls `endPoints.account()` which maps to `GET /api/account` (api.js line 12)
- Expects data with keys: `Id`, `Balance`, `Equity`, `Profit`, `Margin`, `MarginLevel`, `Leverage` (DATA_KEYS in AccountSummary.jsx lines 6-14)
- Sets `account` to `null` when the API call fails (line 30), triggering the error message display

## Relevant Files
Use these files to fix the bug:

- `app/server/server.py` - Main FastAPI server where the `/api/account` route needs to be added. This file already imports the `OpenFxApi` and has the `api` instance ready to use.
- `app/server/core/openfx_api.py` - Contains the `get_account_summary()` method (line 108) that fetches account data from the OpenFX API. Returns a dictionary with account fields or `None` on error.
- `app/server/core/data_models.py` - Contains `AccountSummaryResponse` Pydantic model (line 29) but this may not be needed since the frontend expects raw OpenFX API response fields.
- `app/client/src/components/AccountSummary.jsx` - Frontend component that displays account data. Shows the expected data keys: `Id`, `Balance`, `Equity`, `Profit`, `Margin`, `MarginLevel`, `Leverage`.
- `app/client/src/app/api.js` - Frontend API client that calls `/api/account` endpoint.
- `app/server/tests/core/test_openfx_api.py` - Contains existing tests for `get_account_summary()` that show expected response structure.
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_market_headlines.md` - Reference E2E test for Account Summary validation

### New Files
- `.claude/commands/e2e/test_account_summary.md` - New E2E test file to validate the Account Summary functionality

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add the /api/account endpoint to server.py

- Open `app/server/server.py`
- Add a new route handler for `/api/account` after the `/api/health` endpoint (around line 136)
- The route should:
  - Call `api.get_account_summary()` to fetch account data
  - Return the raw account data dictionary if successful
  - Return an empty dictionary with an error message if the API call fails
  - Log success and error cases appropriately
- Pattern to follow: Look at existing routes like `/api/headlines` (line 138) for consistent error handling patterns
- The endpoint should return the raw data from OpenFX API (not transform it) since the frontend expects keys like `Id`, `Balance`, `Equity`, `Profit`, `Margin`, `MarginLevel`, `Leverage`

### Step 2: Add unit test for the /api/account endpoint

- Open `app/server/tests/core/test_openfx_api.py`
- Add a new test class or tests for the account endpoint
- Test cases:
  - Successful account summary retrieval returns correct structure
  - Failed API call returns appropriate error response
- Mock the `OpenFxApi.get_account_summary()` method to avoid real API calls

### Step 3: Create E2E test file for Account Summary validation

- Read `.claude/commands/e2e/test_trading_dashboard.md` and `.claude/commands/e2e/test_market_headlines.md` as reference
- Create a new E2E test file at `.claude/commands/e2e/test_account_summary.md`
- The test should validate:
  - Navigate to the home page
  - Account Summary section is visible (not showing error message)
  - Account data fields are displayed (Balance, Equity, Profit, Margin, etc.)
  - Values are formatted correctly (currency values with $ prefix)
  - Take screenshots to document the working Account Summary
- Be specific with validation steps to prove the bug is fixed

### Step 4: Run validation commands

- Run all server tests to ensure no regressions
- Build the frontend to ensure no build errors
- Execute the E2E test to validate the bug is fixed

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_account_summary.md` E2E test file to validate the Account Summary functionality works

## Notes
- The frontend expects raw OpenFX API response fields (`Id`, `Balance`, `Equity`, `Profit`, `Margin`, `MarginLevel`, `Leverage`) - do NOT transform the response using the `AccountSummaryResponse` model as that uses different field names
- The `AccountSummaryResponse` Pydantic model in `data_models.py` uses snake_case field names (e.g., `margin_used`, `unrealized_pl`) which don't match what the frontend expects. The simplest fix is to return the raw API response.
- The OpenFX API returns `None` when credentials are invalid or the API call fails - handle this gracefully
- The frontend already handles the error state gracefully by showing a user-friendly message, so the backend just needs to return empty/error data properly
