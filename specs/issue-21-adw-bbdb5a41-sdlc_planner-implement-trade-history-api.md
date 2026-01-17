# Bug: Update Account Page: Implement Trade History API and Rename Order History to Trade History

## Metadata
issue_number: `21`
adw_id: `bbdb5a41`
issue_json: `{"number":21,"title":"bug Update Account Page: Implement Trade History API and Rename Order History to Trade History","body":"/bug \n\nadw_sdlc_iso\n\n\nthis issue updates the Account page to implement proper trade history functionality using the FXOpen Web API's Trade History endpoint (POST /api/v2/tradehistory) and renames the \"Order History\" component to \"Trade History\" for consistency with the API terminology.\n\n\nCurrently, the trade history endpoint returns an empty response with a placeholder message. \n\nThis enhancement will connect to the actual \n\nFXOpen  use ai_docs for documenation Trade History API to display real historical trade data including closed positions, filled orders, and transaction history.\n\n\nObjectives\nBackend: Implement trade history fetching using FXOpen POST /api/v2/tradehistory API\nBackend: Update the /api/trades/history endpoint to return real trade history data\nFrontend: Rename OrderHistory.jsx component to TradeHistory.jsx\nFrontend: Ensure consistent styling following the UI Style Guide\nTesting: Update unit tests and E2E tests to reflect changes\n\n"}`

## Bug Description
The Account page currently displays "Order History" but should use "Trade History" terminology to align with the FXOpen Web API documentation. Additionally, the backend trade history endpoint returns a placeholder message instead of fetching real historical trade data from the FXOpen API's POST `/api/v2/tradehistory` endpoint.

**Current Issues:**
1. The OrderHistory.jsx component uses incorrect terminology ("Order History" instead of "Trade History")
2. The backend `/api/trades/history` endpoint returns an empty response with a placeholder message
3. The FXOpen API's POST `/api/v2/tradehistory` endpoint is not implemented in the OpenFX API client
4. Component filename OrderHistory.jsx doesn't align with trade history terminology

## Problem Statement
The Account page needs to:
1. Fetch real historical trade data from FXOpen's POST `/api/v2/tradehistory` API endpoint
2. Rename all references from "Order History" to "Trade History" to match trading industry standards
3. Update the backend to actually call the FXOpen trade history API instead of returning a placeholder
4. Rename the OrderHistory.jsx component file to TradeHistory.jsx for consistency

## Solution Statement
1. **Backend**: Implement a `get_trade_history()` method in `OpenFxApi` class that calls POST `/api/v2/tradehistory`
2. **Backend**: Update the `/api/trades/history` endpoint to use the new `get_trade_history()` method
3. **Frontend**: Rename OrderHistory.jsx to TradeHistory.jsx and update all imports
4. **Frontend**: Update display text from "Order History" to "Trade History" throughout the component
5. **Testing**: Update unit tests and create E2E test to validate the trade history functionality

## Steps to Reproduce
1. Navigate to http://localhost:3000
2. Click on "Account" in the navigation bar
3. Observe the second section titled "Order History" (should be "Trade History")
4. Note the empty state message: "Trade history is not available from the current API"
5. The backend is not calling the FXOpen POST `/api/v2/tradehistory` endpoint

## Root Cause Analysis
When the Account page feature was initially implemented (issue #19), the trade history endpoint was left as a placeholder because:
1. The FXOpen POST `/api/v2/tradehistory` endpoint requires a POST request with timestamp parameters
2. The implementation was deferred due to the additional complexity of the POST request format
3. The component was named OrderHistory.jsx instead of TradeHistory.jsx
4. The terminology "Order History" was used instead of the correct "Trade History" term

The FXOpen API documentation clearly shows that `/api/v2/tradehistory` is available and returns `WebApiTradeHistoryReport` with historical trade records.

## Relevant Files
Use these files to fix the bug:

**Backend Files:**
- `app/server/core/openfx_api.py` (lines 395-407) - OpenFX API client; need to add `get_trade_history()` method that calls POST `/api/v2/tradehistory`
- `app/server/server.py` (lines 216-231) - Trade history endpoint; need to update to call the new `get_trade_history()` method
- `app/server/core/data_models.py` (lines 175-192) - TradeHistoryItem and TradeHistoryResponse models; may need updates to match FXOpen API response structure
- `app/server/tests/test_trades_endpoints.py` - Unit tests for trade endpoints; need to update tests to validate real trade history data

**Frontend Files:**
- `app/client/src/components/OrderHistory.jsx` - Component to be renamed to TradeHistory.jsx; update display text
- `app/client/src/pages/Account.jsx` - Account page; update import from OrderHistory to TradeHistory
- `app/client/src/App.jsx` - Check if OrderHistory is imported here (likely not, but verify)

**Documentation Files:**
- `ai_docs/FXOpen_Web_API_Documentation.md` (lines 717-756) - Reference for POST `/api/v2/tradehistory` endpoint structure
- `ai_docs/ui_style_guide.md` - Reference for ensuring styling consistency
- `app_docs/feature-bfd1a7d1-account-open-trades-order-history.md` - Feature documentation; update references to Order History
- `.claude/commands/e2e/test_account_page.md` - E2E test specification; update to validate Trade History

**Test Files:**
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test for reference
- `.claude/commands/e2e/test_market_headlines.md` - Example E2E test for reference

### New Files
- `.claude/commands/e2e/test_account_page_trade_history.md` - New E2E test file to validate trade history functionality

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Implement FXOpen Trade History API Method
- Read `ai_docs/FXOpen_Web_API_Documentation.md` lines 717-756 to understand the POST `/api/v2/tradehistory` endpoint structure
- Open `app/server/core/openfx_api.py`
- Add a new method `get_trade_history(timestamp_from: int, timestamp_to: int, request_page_size: int = 1000)` after the `get_open_trades()` method
- The method should:
  - Accept `timestamp_from` and `timestamp_to` parameters (Unix timestamps in milliseconds)
  - Create a request body with: `TimestampFrom`, `TimestampTo`, `RequestDirection: "Forward"`, `RequestPageSize`, `SkipCancelOrder: false`
  - Use `_make_request("tradehistory", verb="post", json_data=request_body)` to call the API
  - Return a list of trade history records or None on error
  - Parse the response according to `WebApiTradeHistoryReport` structure from the documentation

### Update Backend Trade History Endpoint
- Open `app/server/server.py` and locate the `trade_history()` endpoint (lines 216-231)
- Update the endpoint to:
  - Accept optional query parameters: `timestamp_from` and `timestamp_to` (default to last 30 days if not provided)
  - Call `api.get_trade_history(timestamp_from, timestamp_to)` to fetch real data
  - Transform the FXOpen API response into the `TradeHistoryResponse` model format
  - Handle errors gracefully and return appropriate error messages
  - Update the docstring to reflect the new functionality

### Update Data Models for Trade History
- Open `app/server/core/data_models.py` and review the `TradeHistoryItem` and `TradeHistoryResponse` models (lines 175-192)
- Compare with the `WebApiTradeHistory` structure from `ai_docs/FXOpen_Web_API_Documentation.md` (lines 1553-1593)
- Update `TradeHistoryItem` to include fields from the FXOpen API response:
  - Add fields like `transaction_type`, `transaction_reason`, `transaction_timestamp`
  - Add optional fields for position data: `position_id`, `position_amount`, `position_close_price`
  - Ensure all fields have appropriate types and defaults
- Keep the existing fields that map to the frontend component

### Rename Frontend Component File
- Rename `app/client/src/components/OrderHistory.jsx` to `app/client/src/components/TradeHistory.jsx`
- Update the component display text:
  - Change card title from "Trade History" to "Trade History" (already correct in the file)
  - Update card description to "Closed trades and transaction history"
  - Verify empty state messages use "Trade History" terminology
- Verify all styling classes remain consistent with `ai_docs/ui_style_guide.md`

### Update Frontend Account Page Imports
- Open `app/client/src/pages/Account.jsx`
- Update the import statement from `import OrderHistory from '../components/OrderHistory'` to `import TradeHistory from '../components/TradeHistory'`
- Update the JSX to use `<TradeHistory />` instead of `<OrderHistory />`
- Update the page description from "View your open trades and trade history" (already correct, just verify)
- Verify all references to the component use the new name

### Update Backend Unit Tests
- Open `app/server/tests/test_trades_endpoints.py`
- Update tests for the `/api/trades/history` endpoint to:
  - Mock the new `api.get_trade_history()` method
  - Test successful trade history retrieval with real data
  - Test empty trade history response
  - Test API failure handling
  - Test with different timestamp ranges
- Add assertions to verify the response structure matches `TradeHistoryResponse` model

### Update Documentation Files
- Update `app_docs/feature-bfd1a7d1-account-open-trades-order-history.md`:
  - Replace all references to "Order History" with "Trade History"
  - Update the component filename reference from OrderHistory.jsx to TradeHistory.jsx
  - Update the implementation notes to reflect that trade history now fetches real data from FXOpen API
- Update `.claude/commands/e2e/test_account_page.md`:
  - Replace "Order History" with "Trade History" in test steps and success criteria
  - Update verification steps to check for trade history data display

### Create E2E Test for Trade History
- Read `.claude/commands/e2e/test_trading_dashboard.md` and `.claude/commands/e2e/test_market_headlines.md` to understand the E2E test format
- Create `.claude/commands/e2e/test_account_page_trade_history.md` with the following structure:
  - User Story: Validate that the Account page displays Trade History (not Order History) and shows real historical trade data
  - Test Steps:
    1. Navigate to application URL
    2. Take screenshot of home page
    3. Click "Account" navigation link
    4. Verify "Trade History" section is visible (not "Order History")
    5. Verify Trade History table displays data or appropriate empty state
    6. Take screenshot of Account page showing Trade History section
    7. Verify styling matches UI style guide
  - Success Criteria:
    - Trade History section displays correct terminology
    - Historical trade data is shown if available
    - Empty state message is appropriate if no data
    - Styling is consistent with application
    - 2 screenshots captured

### Run Validation Commands
- Execute all validation commands listed below to ensure the bug is fixed with zero regressions
- All commands must complete successfully

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

**Manual verification before automated tests:**
1. Start the application: `./scripts/start.sh`
2. Navigate to http://localhost:3000/account
3. Verify the second section displays "Trade History" (not "Order History")
4. Verify trade history data is displayed if available from the API
5. Verify styling is consistent and unchanged
6. Take a screenshot of the Account page showing "Trade History" section

**Backend validation:**
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions

**Frontend validation:**
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions

**E2E test validation:**
- Read `.claude/commands/test_e2e.md`
- Read and execute your new E2E test file `.claude/commands/e2e/test_account_page_trade_history.md` to validate this functionality works

**Documentation validation:**
- `grep -r "Order History" app/client/src app/server .claude/commands/e2e app_docs/ specs/ --exclude-dir=node_modules --exclude-dir=.git` - Verify no unwanted instances of "Order History" remain

## Notes

**Terminology Clarification:**
In trading platforms, "Orders" and "Trades" are distinct concepts:
- **Orders**: Instructions to buy/sell (can be pending, cancelled, or executed)
- **Trades**: Executed transactions (filled orders that resulted in positions)

The FXOpen Web API documentation uses "Trade History" for the `/api/v2/tradehistory` endpoint, which returns historical executed trades.

**FXOpen Trade History API Details:**
- **Endpoint**: POST `/api/v2/tradehistory`
- **Request Body**: `WebApiTradeHistoryRequest` with timestamp range and pagination parameters
- **Response**: `WebApiTradeHistoryReport` with array of `WebApiTradeHistory` records
- **Record Fields**: Includes transaction type, transaction reason, trade details, position details, balance movements

**Implementation Considerations:**
1. The POST request requires HMAC authentication (already implemented in `_make_request`)
2. Default timestamp range should be reasonable (e.g., last 30 days) to avoid large responses
3. The API supports pagination via `RequestPageSize`, `RequestDirection`, and `RequestLastId`
4. For initial implementation, fetch first page only (can add pagination later)
5. Transform FXOpen API response to match frontend component expectations

**No Breaking Changes:**
- The frontend component API (props) remains unchanged
- The backend endpoint path `/api/trades/history` remains unchanged
- Only the data source changes from placeholder to real API
- Component filename changes but maintains export compatibility

**Style Guide Compliance:**
Verify the TradeHistory component per `ai_docs/ui_style_guide.md`:
- Card component uses: `card`, `card-header`, `card-title`, `card-content`
- Table styling uses: `table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`
- History icon uses Lucide React's `History` icon
- Empty state follows the pattern: icon + message
- Color scheme remains consistent with CSS variables

**Testing Strategy:**
- Unit tests validate the backend API integration
- E2E tests validate the end-to-end functionality and UI
- Manual testing validates the user experience
- All tests must pass before considering this bug resolved
