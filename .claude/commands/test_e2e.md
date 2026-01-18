# E2E Test Runner

Execute end-to-end (E2E) tests for the Forex Trading Dashboard application using Playwright browser automation (MCP Server). If any errors occur and assertions fail, mark the test as failed and explain exactly what went wrong.

## Application Overview

The Forex Trading Dashboard is a full-stack application for forex trading with:

- **Frontend (React 18)**: `app/client/` - React with React Router v6, Tailwind CSS, Plotly.js charts
  - Routes: Monitor (`/monitor`), Strategy (`/strategy`), Account (`/account`)
  - Note: `/` redirects to `/monitor`
  - Components: BotStatus, Headlines (Monitor), PriceChart, Technicals, Select (Strategy), AccountSummary, OpenTrades, TradeHistory (Account), NavigationBar
  
- **Backend (FastAPI)**: `app/server/` - Python FastAPI with UV package manager
  - Health: `/api/test`, `/api/health`
  - Market Data: `/api/headlines`, `/api/options`
  - Trading: `/api/account`, `/api/technicals/{pair}/{tf}`, `/api/prices/{pair}/{gran}/{count}`
  - API Docs: `/docs` (Swagger UI), `/redoc` (ReDoc)

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `adw_id` | Unique workflow identifier | `$1` if provided, otherwise generate random 8 character hex string |
| `agent_name` | Agent executing the test | `$2` if provided, otherwise `test_e2e` |
| `e2e_test_file` | Path to the E2E test specification | `$3` (required) |
| `application_url` | Base URL for the frontend application | `$4` if provided, otherwise `http://localhost:3000` |

## Test File Location

E2E test specifications are located in `.claude/commands/e2e/`:
- `test_api_health.md` - Backend API health and connectivity tests
- `test_trading_dashboard.md` - Dashboard functionality tests
- `test_market_headlines.md` - Home page and headlines tests

## Instructions

### Phase 1: Preparation

1. Read the `e2e_test_file` specified in the variables
2. Digest the `User Story` to understand what functionality is being validated
3. Note the `Success Criteria` to understand pass/fail conditions

### Phase 2: Setup

Execute `.claude/commands/prepare_app.md` to ensure the application is running:
- Backend API should be running on `http://localhost:8000`
- Frontend should be running on `http://localhost:3000`

### Phase 3: Test Execution

1. **Initialize Playwright browser** in headed mode for visibility
2. Navigate to the `application_url`
3. **Execute each `Test Step`** from the test file in sequence
4. For each **Verify** step:
   - Check the assertion
   - If it fails, immediately mark the test as failed
   - Format failure as: `(Step N ❌) [Step description] - [Error details]`
5. **Capture screenshots** as specified in the test steps
6. Allow time for async operations and element visibility (React state updates, API calls)

### Phase 4: Screenshot Management

Save screenshots to the designated directory with descriptive names:

**Directory Structure:**
```
<codebase_root>/agents/<adw_id>/<agent_name>/img/<test_directory_name>/
```

**Naming Convention:**
```
01_<descriptive_name>.png
02_<descriptive_name>.png
```

Example for `test_trading_dashboard.md` with `adw_id=abc12345` and `agent_name=e2e_tester`:
```
/path/to/codebase/agents/abc12345/e2e_tester/img/trading_dashboard/01_initial_strategy_page.png
```

Use `pwd` or equivalent to get the absolute path to the codebase for correct screenshot paths.

### Phase 5: Error Handling

If you encounter an error:
1. Mark the test as **failed** immediately
2. Report the exact step where the failure occurred
3. Include the specific error message
4. Example: `(Step 3 ❌) Failed to find element with selector "pair-selector" on page "http://localhost:3000/strategy"`

## Common Test Scenarios

### Frontend Elements to Test

| Element | Selector Hints | Pages |
|---------|----------------|-------|
| Navigation Bar | nav links (Monitor, Strategy, Account) | All |
| Bot Status | status badge, metrics, controls | Monitor |
| Headlines | headline items, links | Monitor |
| Pair Selector | dropdown with EUR_USD, GBP_JPY, etc. | Strategy |
| Timeframe Selector | M5, M15, H1, H4, D options | Strategy |
| Price Chart | Plotly candlestick chart | Strategy |
| Technicals | support/resistance levels | Strategy |
| Account Summary | balance, margin, P/L fields | Account |
| Open Trades | active positions table | Account |
| Trade History | past trades table | Account |

### API Endpoints to Test

| Endpoint | Expected Response |
|----------|-------------------|
| `GET /api/health` | `{"status": "ok", "service": "forex-trading-api", ...}` |
| `GET /api/test` | `{"message": "Forex Trading API is running!"}` |
| `GET /api/options` | `{"pairs": [...], "granularities": [...]}` |
| `GET /api/headlines` | `{"headlines": [...], "count": N}` |

## Output Format

Return results in the following JSON format:

```json
{
  "test_name": "Test Name Here",
  "status": "passed|failed",
  "steps_completed": 5,
  "total_steps": 10,
  "screenshots": [
    "<absolute_path>/agents/<adw_id>/<agent_name>/img/<test_name>/01_<descriptive_name>.png",
    "<absolute_path>/agents/<adw_id>/<agent_name>/img/<test_name>/02_<descriptive_name>.png"
  ],
  "error": null,
  "failed_step": null
}
```

### On Failure

```json
{
  "test_name": "Test Name Here",
  "status": "failed",
  "steps_completed": 3,
  "total_steps": 10,
  "screenshots": [
    "<absolute_path>/agents/<adw_id>/<agent_name>/img/<test_name>/01_<descriptive_name>.png"
  ],
  "error": "Element 'pair-selector' not found on Dashboard page",
  "failed_step": "(Step 4 ❌) Verify pair selector dropdown is present"
}
```

## Best Practices

1. **Think deeply** about each test step before executing
2. **Wait for elements** to be visible before interacting (React renders asynchronously)
3. **Wait for API responses** when testing data-dependent components
4. **Use absolute paths** for all screenshot operations
5. **Create directories** if they don't exist before saving screenshots
6. **Review Success Criteria** at the end to ensure all conditions are met
7. **Capture intermediate screenshots** to document the test flow even on failure

## Integration with ADW

This test runner integrates with the AI Developer Workflow (ADW) system:
- Screenshots are stored in the ADW workspace: `agents/{adw_id}/`
- Test results can be consumed by `adw_test.py` for automated testing
- Failed tests can be resolved using `.claude/commands/resolve_failed_e2e_test.md`
