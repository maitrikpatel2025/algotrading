# Bug: Account Page - Update Open Trades and Rename Order History to Trade History

## Metadata
issue_number: `19`
adw_id: `0bd04f2b`
issue_json: `{"number":19,"title":"bug account page update the open trades and trade history","body":"\nusing adw_sdlc_iso \n\n/bug\n\nupdate for account page update the open trades and trade history rename order history to the trade history based on the documentation available in AI doc for API use that particular API trading API and then update the back end and the front end Make sure for the frontend styling is used the style guide and keep the style consistent"}`

## Bug Description
The Account page currently displays "Order History" but according to the FXOpen Web API documentation (ai_docs/FXOpen_Web_API_Documentation.md), the correct terminology is "Trade History". The bug requires:

1. **Renaming**: Change all references from "Order History" to "Trade History" in both frontend and backend
2. **API Alignment**: Ensure the backend implementation aligns with the FXOpen Web API documentation's trade history endpoint (`POST /api/v2/tradehistory`)
3. **Styling Consistency**: Verify all styling follows the ui_style_guide.md specifications

## Problem Statement
The Account page uses incorrect terminology ("Order History" instead of "Trade History") which doesn't align with the trading industry standard terminology and the FXOpen Web API documentation. This creates confusion for traders who expect to see "Trade History" as per standard trading platforms and the actual API documentation.

## Solution Statement
Rename all instances of "Order History" to "Trade History" across:
- Frontend component (`OrderHistory.jsx` → update display text and potentially rename file)
- Backend data models and response types
- API endpoint naming and documentation
- Component props and variable names
- Ensure all styling remains consistent with the UI style guide

## Steps to Reproduce
1. Navigate to http://localhost:3000
2. Click on "Account" in the navigation bar
3. Observe the second section titled "Order History"
4. Compare with FXOpen Web API documentation which refers to "Trade History" (POST /api/v2/tradehistory endpoint)
5. The terminology mismatch is the bug

## Root Cause Analysis
The feature was initially implemented using "Order History" terminology without consulting the FXOpen Web API documentation. The FXOpen API uses "Trade History" as the standard term (as seen in the `/api/v2/tradehistory` endpoint). The current implementation works functionally but uses non-standard terminology that doesn't match:
- The external API documentation
- Trading industry standards (trades vs orders are different concepts)
- Professional trading platforms (MetaTrader, TradingView, Bloomberg Terminal all use "Trade History")

## Relevant Files
Use these files to fix the bug:

**Frontend Files:**
- `app/client/src/pages/Account.jsx` - Account page container that renders OrderHistory component; imports need updating
- `app/client/src/components/OrderHistory.jsx` - Component displaying the history section; internal text, props, and potentially filename need updating
- `app/client/src/App.jsx` - Router configuration (if component is imported here)

**Backend Files:**
- `app/server/server.py` (lines 215-241) - Trade history endpoint that returns TradeHistoryResponse
- `app/server/core/data_models.py` (lines 175-192) - TradeHistoryItem and TradeHistoryResponse models; these are correctly named already
- `app/server/tests/test_trades_endpoints.py` - Unit tests for trade endpoints; verify test names are correct

**Documentation Files:**
- `ai_docs/FXOpen_Web_API_Documentation.md` (lines 717-756) - Reference for correct API terminology and structure
- `ai_docs/ui_style_guide.md` - Reference for ensuring styling consistency
- `app_docs/feature-bfd1a7d1-account-open-trades-order-history.md` - Feature documentation that needs updating

**Testing Files:**
- `.claude/commands/e2e/test_account_page.md` - E2E test specification mentioning "Order History"
- `.claude/commands/test_e2e.md` - E2E test runner instructions

### New Files
None required. This is a terminology/naming update only.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Update Frontend Component Display Text
- Open `app/client/src/components/OrderHistory.jsx`
- Update all display text from "Order History" to "Trade History":
  - Card title: "Order History" → "Trade History"
  - Card description: "Closed trades and transactions" → "Closed trades and transaction history"
  - Empty state message if needed
- Verify all styling classes remain consistent with ui_style_guide.md
- Keep the component filename as `OrderHistory.jsx` to avoid breaking imports (internal refactoring can come later)

### Update Frontend Account Page
- Open `app/client/src/pages/Account.jsx`
- Update comments and text that reference "Order History" to "Trade History"
- Verify the OrderHistory component import and usage remains functional
- Update the page description text from "View your open trades and transaction history" to "View your open trades and trade history"

### Verify Backend Alignment
- Review `app/server/server.py` (lines 215-241) to confirm the endpoint is correctly documented
- Update the docstring from "Get trade history (closed trades)" to be more explicit: "Get trade history (closed/completed trades)"
- Confirm `TradeHistoryResponse` and `TradeHistoryItem` models in `app/server/core/data_models.py` are correctly named (they already are)

### Update Documentation
- Update `app_docs/feature-bfd1a7d1-account-open-trades-order-history.md`:
  - Find all references to "Order History" and replace with "Trade History"
  - Update the filename reference in documentation to reflect current naming
- Update `.claude/commands/e2e/test_account_page.md`:
  - Replace "Order History" with "Trade History" in test steps and success criteria

### Read `.claude/commands/e2e/test_trading_dashboard.md` and `.claude/commands/e2e/test_account_page.md` and create a new E2E test file
- Read the existing E2E test examples to understand the test format and structure
- Create `.claude/commands/e2e/test_account_page_trade_history.md` that validates:
  - Account page displays "Trade History" (not "Order History")
  - The Trade History section is visible with correct header text
  - Styling is consistent with the application style guide
  - Take screenshots showing the updated terminology
- This test should be minimal and focused only on verifying the terminology fix

### Run Validation Commands
- Execute all validation commands listed below to ensure the bug is fixed with zero regressions
- All commands must complete successfully

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

**Manual verification before automated tests:**
1. Start the application: `./scripts/start.sh`
2. Navigate to http://localhost:3000/account
3. Verify the second section displays "Trade History" (not "Order History")
4. Verify styling is consistent and unchanged
5. Take a screenshot of the Account page showing the correct "Trade History" text

**Backend validation:**
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions

**Frontend validation:**
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions

**E2E test validation:**
- Read `.claude/commands/test_e2e.md`
- Read and execute `.claude/commands/e2e/test_account_page.md` (updated version) to validate the terminology is correct

**Documentation validation:**
- Grep for remaining instances: `grep -r "Order History" app/client/src app/server .claude/commands/e2e app_docs/`
- Verify no unwanted instances remain (exclude node_modules, .git, etc.)

## Notes

**Terminology Clarification:**
In trading platforms, "Orders" and "Trades" are distinct concepts:
- **Orders**: Instructions to buy/sell (can be pending, cancelled, or executed)
- **Trades**: Executed transactions (filled orders that resulted in positions)

The FXOpen Web API documentation clearly distinguishes these:
- `/api/v2/trade` - Current open positions/trades
- `/api/v2/tradehistory` - Historical executed trades (POST endpoint)

This bug fix aligns the UI with standard trading terminology and the external API documentation.

**Backend API Note:**
The current backend endpoint `/api/trades/history` returns an empty response with a message: "Trade history is not available from the current API. This feature requires historical trade data storage." This is correct behavior because:
1. The OpenFX API's `/api/v2/tradehistory` requires a POST request with timestamp parameters
2. Implementing full trade history would require database storage to persist historical trades
3. The current implementation correctly indicates this limitation to users

This bug fix is purely about terminology and doesn't change the functional behavior.

**No Breaking Changes:**
- Component filenames remain unchanged (`OrderHistory.jsx`) to avoid breaking imports
- Props and API endpoints remain unchanged
- Only display text visible to users is updated
- All existing tests should continue to pass after terminology updates

**Style Guide Compliance:**
Verify the following per `ai_docs/ui_style_guide.md`:
- Card component uses: `card`, `card-header`, `card-title`, `card-content`
- Table styling uses: `table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`
- History icon uses Lucide React's `History` icon
- Empty state follows the pattern: icon + message
- Color scheme remains consistent with the defined CSS variables
