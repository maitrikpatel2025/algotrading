# Feature: Account Management - Open Trades & Order History

## Metadata
issue_number: `1`
adw_id: `bfd1a7d1`
issue_json: `{"number":1,"title":"Account Management - Open Trades & Order History","body":"Using adw_plan_build_review\n\n/feature \n\nImplement Account Page with Open Trades & Order History\n\nI want to view my open trades and complete transaction trade history on a dedicated Account page\n\nFor back end you need to create end points\n\nMake sure for the frontend styling is used the style guide and keep the style consistent"}`

## Feature Description
Implement a dedicated Account page that displays the user's open trades and complete transaction/trade history. This feature provides traders with a comprehensive view of their trading activity, including currently active positions and historical transactions. The backend will expose new API endpoints to fetch open trades and trade history, while the frontend will present this data in a clean, consistent UI following the existing style guide.

## User Story
As a trader
I want to view my open trades and complete transaction trade history on a dedicated Account page
So that I can monitor my active positions and review my trading history in one place

## Problem Statement
Currently, the application only displays account summary information (balance, margin, P/L) on the Home page. Traders need visibility into their open positions and historical trades to effectively manage their trading activity. Without this feature, users cannot see what trades are currently active or review their past trading decisions.

## Solution Statement
Create a new Account page accessible from the navigation bar that displays:
1. **Open Trades Section**: Shows all currently active trading positions with details like instrument, price, amount, unrealized P/L, margin used, stop loss, and take profit levels
2. **Order History Section**: Displays historical/closed trades with execution details

The backend will provide two new API endpoints:
- `GET /api/trades/open` - Returns all currently open trades
- `GET /api/trades/history` - Returns trade history (closed trades)

The frontend will use the existing style guide (Tailwind CSS classes, card components, table styles) to ensure visual consistency with the rest of the application.

## Relevant Files
Use these files to implement the feature:

**Backend Files:**
- `app/server/server.py` - Main FastAPI application where new routes will be added
- `app/server/api/routes.py` - Helper functions for route logic
- `app/server/core/openfx_api.py` - OpenFX API client with existing `get_open_trades()` method to leverage
- `app/server/core/data_models.py` - Pydantic models including existing `OpenTradesResponse` and `TradeInfo` models
- `app/server/models/open_trade.py` - OpenTrade class for parsing API responses

**Frontend Files:**
- `app/client/src/App.jsx` - Router configuration where new Account route will be added
- `app/client/src/app/api.js` - API client where new endpoint methods will be added
- `app/client/src/components/NavigationBar.jsx` - Navigation bar where Account link will be added
- `app/client/src/index.css` - Style guide with card, table, and utility classes to follow
- `app/client/src/components/AccountSummary.jsx` - Reference component for styling patterns
- `app/client/src/pages/Home.jsx` - Reference page for layout patterns
- `app/client/src/pages/Dashboard.jsx` - Reference page for data fetching and loading state patterns

**E2E Test Reference Files:**
- `.claude/commands/test_e2e.md` - E2E test runner instructions
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test file for reference

### New Files
- `app/client/src/pages/Account.jsx` - New Account page component
- `app/client/src/components/OpenTrades.jsx` - Component to display open trades table
- `app/client/src/components/OrderHistory.jsx` - Component to display trade history table
- `.claude/commands/e2e/test_account_page.md` - E2E test specification for the Account page

## Implementation Plan

### Phase 1: Foundation
1. Add the new API endpoints to the backend server for fetching open trades and trade history
2. Define Pydantic response models for the new endpoints (leverage existing models in `data_models.py`)
3. Update the frontend API client with methods to call the new endpoints

### Phase 2: Core Implementation
1. Create the Account page component with proper layout and loading states
2. Build the OpenTrades component with a table displaying active positions
3. Build the OrderHistory component with a table displaying closed trades
4. Implement data fetching hooks and state management in the Account page

### Phase 3: Integration
1. Add the Account route to the React Router in App.jsx
2. Add the Account link to the NavigationBar component
3. Create the E2E test specification for the Account page
4. Run validation commands to ensure everything works correctly

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_trading_dashboard.md` to understand the E2E test format
- Create `.claude/commands/e2e/test_account_page.md` with test steps for:
  - Navigating to the Account page
  - Verifying Open Trades section is visible
  - Verifying Order History section is visible
  - Checking that trade data displays correctly (if trades exist)
  - Verifying loading states work properly

### Step 2: Add Backend API Endpoint for Open Trades
- In `app/server/server.py`, add a new route `GET /api/trades/open`
- Use the existing `api.get_open_trades()` method from `OpenFxApi` class
- Return data using the `OpenTradesResponse` model from `data_models.py`
- Add proper error handling and logging following existing patterns
- Add the "Trades" tag for API documentation grouping

### Step 3: Add Backend API Endpoint for Trade History
- In `app/server/server.py`, add a new route `GET /api/trades/history`
- Check if OpenFX API supports trade history endpoint
- If not available, implement a placeholder that returns an empty response with appropriate message
- Create a `TradeHistoryResponse` Pydantic model in `data_models.py` if needed
- Add proper error handling and logging

### Step 4: Update Frontend API Client
- In `app/client/src/app/api.js`, add new methods:
  - `openTrades: () => requests.get("/trades/open")`
  - `tradeHistory: () => requests.get("/trades/history")`

### Step 5: Create OpenTrades Component
- Create `app/client/src/components/OpenTrades.jsx`
- Accept `trades` array and `loading` state as props
- Use the table styles from `index.css` (table, table-header, table-body, table-row, table-head, table-cell)
- Display columns: Instrument, Side, Amount, Entry Price, Current P/L, Margin, SL, TP
- Use `card` component styling for the container
- Add loading skeleton state following `AccountSummary.jsx` pattern
- Use `text-success` for positive P/L, `text-destructive` for negative P/L
- Show empty state message when no trades exist

### Step 6: Create OrderHistory Component
- Create `app/client/src/components/OrderHistory.jsx`
- Accept `history` array and `loading` state as props
- Use table styles consistent with OpenTrades component
- Display columns: Date, Instrument, Side, Amount, Entry Price, Exit Price, P/L
- Add card styling and loading skeleton state
- Show empty state when no history exists

### Step 7: Create Account Page
- Create `app/client/src/pages/Account.jsx`
- Follow the layout pattern from `Home.jsx` and `Dashboard.jsx`
- Include page header with title "Account" and description
- Implement `useEffect` to load data on mount
- Call `endPoints.openTrades()` and `endPoints.tradeHistory()` on load
- Manage loading state for initial page load
- Layout: Stack OpenTrades and OrderHistory vertically with gap-6 spacing
- Add appropriate icons from lucide-react (e.g., Briefcase, History, TrendingUp)

### Step 8: Add Route to App.jsx
- In `app/client/src/App.jsx`, import the new Account page
- Add route: `<Route exact path="/account" element={<Account />} />`

### Step 9: Update NavigationBar
- In `app/client/src/components/NavigationBar.jsx`, add Account to navItems:
  ```javascript
  { href: "/account", label: "Account" }
  ```

### Step 10: Add Unit Tests for Backend Endpoints
- In `app/server/tests/`, add tests for the new API endpoints
- Test successful response for `/api/trades/open`
- Test successful response for `/api/trades/history`
- Test error handling scenarios

### Step 11: Run Validation Commands
- Run all validation commands listed below to ensure feature works correctly with zero regressions

## Testing Strategy

### Unit Tests
- Test `/api/trades/open` endpoint returns correct response structure
- Test `/api/trades/open` endpoint handles API errors gracefully
- Test `/api/trades/history` endpoint returns correct response structure
- Test OpenTradesResponse model validation
- Test TradeInfo model validation

### Edge Cases
- No open trades (empty array)
- No trade history (empty array)
- API connection failure
- Invalid data from external API
- Large number of trades (pagination consideration for future)

## Acceptance Criteria
- [ ] Account page is accessible via navigation bar link
- [ ] Open Trades section displays all currently active trading positions
- [ ] Each open trade shows: instrument, side (buy/sell), amount, entry price, current P/L, margin used, stop loss, take profit
- [ ] Order History section displays historical/closed trades
- [ ] Loading states are shown while data is being fetched
- [ ] Empty states are shown when no trades or history exist
- [ ] Styling is consistent with the rest of the application (follows style guide)
- [ ] Backend endpoints return data in the documented format
- [ ] All existing tests pass (zero regressions)
- [ ] Frontend build completes successfully
- [ ] E2E test validates the feature works end-to-end

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_account_page.md` to validate this functionality works end-to-end

## Notes
- The OpenFX API already has a `get_open_trades()` method in `openfx_api.py` that returns `List[OpenTrade]` - this should be leveraged for the open trades endpoint
- The `OpenTradesResponse` and `TradeInfo` models already exist in `data_models.py` - these can be used directly
- Trade history may not be available from the OpenFX API - check API documentation. If not available, implement a placeholder endpoint that returns an empty response with a message indicating the feature is limited by the external API
- The existing `OpenTrade` model in `models/open_trade.py` has a `to_dict()` method that can be used for serialization
- Follow the exact styling patterns from existing components - use `card`, `card-header`, `card-title`, `card-content` classes
- Use tabular-nums class for financial numbers to ensure proper alignment
- Consider adding a refresh button to allow users to manually update the data
