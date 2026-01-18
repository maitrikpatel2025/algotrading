# Feature: Trading Bot Status Dashboard

## Metadata
issue_number: `23`
adw_id: `7ce3e5be`
issue_json: `{"number":23,"title":"Feature Trading Bot Status Dashboard","body":"Display trading bot operational status with health indicators and monitored pairs..."}`

## Feature Description
Implement a Trading Bot Status Dashboard that provides traders with real-time visibility into their automated trading bot's operational state. The feature displays whether the bot is running, paused, or stopped, along with critical metrics including uptime, monitored currency pairs, last signal time, active strategy details, and daily trading statistics. This gives traders at-a-glance insight into their automated trading system's health and activity.

## User Story
As a trader using an automated trading bot
I want to see real-time status information about my trading bot
So that I can verify the bot is operational, monitor which pairs it's tracking, and understand its recent activity

## Problem Statement
Traders using the automated trading bot have no visibility into whether the bot is running, what pairs it's monitoring, when the last signal was generated, or what strategy is active. This lack of visibility creates uncertainty about the bot's operational status and makes it difficult to verify the system is working correctly.

## Solution Statement
Create a comprehensive Bot Status Dashboard component that:
1. Displays the current operational status (running/stopped/paused/error) with visual indicators
2. Shows key metrics: uptime, last signal time, signals today, trades today
3. Lists all monitored currency pairs with their timeframe configurations
4. Displays the active trading strategy name and description
5. Implements auto-refresh polling to keep data current
6. Provides clear error messaging when issues occur

## Relevant Files
Use these files to implement the feature:

**Backend - Server:**
- `app/server/server.py` - Main FastAPI server where the new `/api/bot/status` endpoint will be added
- `app/server/core/data_models.py` - Pydantic models where `BotStatusResponse`, `MonitoredPair`, and `ActiveStrategy` models will be added
- `app/server/tests/test_trades_endpoints.py` - Reference for test patterns, will add new test file

**Backend - Bot Status Tracking:**
- `app/bot/core/models.py` - Existing Pydantic models for bot configuration (reference for patterns)
- `app/bot/config/settings.json` - Bot configuration file showing pair settings structure
- `app/bot/run.py` - Bot entry point (reference for understanding bot state)

**Frontend:**
- `app/client/src/components/AccountSummary.jsx` - Reference component showing metrics display patterns, loading states, and styling
- `app/client/src/components/Headlines.jsx` - Reference for card-based component structure
- `app/client/src/app/api.js` - API client where `botStatus` endpoint will be added
- `app/client/src/pages/Home.jsx` - Page where BotStatus component will be integrated
- `app/client/src/index.css` - CSS utilities and component classes (badge, card, skeleton)

**Testing & E2E:**
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Reference E2E test format
- `.claude/commands/e2e/test_market_headlines.md` - Reference for home page E2E tests

### New Files
- `app/server/core/bot_status.py` - BotStatusTracker singleton class
- `app/server/tests/test_bot_status_endpoint.py` - Unit tests for bot status endpoint
- `app/client/src/components/BotStatus.jsx` - Bot status React component
- `.claude/commands/e2e/test_bot_status.md` - E2E test specification for bot status feature

## Implementation Plan
### Phase 1: Foundation
1. Create the Pydantic data models for bot status (`BotStatusResponse`, `MonitoredPair`, `ActiveStrategy`) in `data_models.py`
2. Create the `BotStatusTracker` singleton class in a new `bot_status.py` file that manages bot state
3. Initialize the tracker with default values from the bot configuration

### Phase 2: Core Implementation
1. Implement the `/api/bot/status` endpoint in `server.py`
2. Add the `botStatus` API call to the frontend API client
3. Create the `BotStatus.jsx` React component with:
   - Status badge with pulse animation for running state
   - Metrics grid (uptime, last signal, signals today, trades today)
   - Active strategy card
   - Monitored pairs badges
   - Loading skeleton state
   - Error banner for error state

### Phase 3: Integration
1. Add the BotStatus component to the Home page
2. Implement 30-second auto-refresh polling
3. Write unit tests for the backend endpoint
4. Create E2E test specification

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Add Pydantic Data Models
- Open `app/server/core/data_models.py`
- Add `MonitoredPair` model with fields: `symbol` (str), `timeframe` (str), `is_active` (bool)
- Add `ActiveStrategy` model with fields: `name` (str), `description` (str), `parameters` (Optional[Dict])
- Add `BotStatusResponse` model with fields:
  - `status`: Literal["running", "stopped", "paused", "error"]
  - `started_at`: Optional[datetime]
  - `uptime_seconds`: Optional[float]
  - `last_heartbeat`: Optional[datetime]
  - `last_signal_time`: Optional[datetime]
  - `last_signal_pair`: Optional[str]
  - `last_signal_type`: Optional[str] (e.g., "BUY", "SELL")
  - `monitored_pairs`: List[MonitoredPair]
  - `active_strategy`: Optional[ActiveStrategy]
  - `signals_today`: int
  - `trades_today`: int
  - `error_message`: Optional[str]

### Task 2: Create BotStatusTracker Singleton
- Create new file `app/server/core/bot_status.py`
- Implement `BotStatusTracker` class as a singleton
- Add methods:
  - `get_status()` - returns current BotStatusResponse
  - `set_running(strategy_name, strategy_description)` - set status to running
  - `set_stopped()` - set status to stopped
  - `set_paused()` - set status to paused
  - `set_error(message)` - set status to error with message
  - `record_heartbeat()` - update last_heartbeat timestamp
  - `record_signal(pair, signal_type)` - record signal and increment counter
  - `record_trade()` - increment trades_today counter
  - `set_monitored_pairs(pairs)` - update list of monitored pairs
  - `reset_daily_counters()` - reset signals_today and trades_today
  - `calculate_uptime()` - calculate uptime from started_at
- Initialize with default "stopped" status
- Load monitored pairs from bot settings.json if available

### Task 3: Create E2E Test Specification
- Create new file `.claude/commands/e2e/test_bot_status.md`
- Define user story: "As a trader, I want to see bot status so that I know if my automated trading is running"
- Define test steps:
  1. Navigate to Home page
  2. Verify BotStatus component is visible
  3. Verify status badge displays (running/stopped/paused/error)
  4. Verify metrics cards are present (Uptime, Last Signal, Signals Today, Trades Today)
  5. Verify monitored pairs section shows currency pair badges
  6. Verify active strategy section shows strategy name
  7. Take screenshots at key points
- Define success criteria

### Task 4: Add Bot Status API Endpoint
- Open `app/server/server.py`
- Import `BotStatusResponse` from `data_models.py`
- Import `bot_status_tracker` singleton from `bot_status.py`
- Add new endpoint `GET /api/bot/status` with response_model=BotStatusResponse
- Add "Bot" tag for API documentation
- Return current status from `bot_status_tracker.get_status()`
- Add appropriate logging

### Task 5: Add API Client Endpoint
- Open `app/client/src/app/api.js`
- Add `botStatus: () => requests.get("/bot/status")` to endPoints object

### Task 6: Create BotStatus React Component
- Create new file `app/client/src/components/BotStatus.jsx`
- Import React hooks (useState, useEffect)
- Import endPoints from api.js
- Import cn utility (create if needed, or inline classnames logic)
- Import Lucide icons: Bot, Activity, Clock, Signal, TrendingUp, AlertCircle
- Implement component structure:
  - State: botStatus, loading, error
  - useEffect for initial fetch and 30-second polling interval
  - Loading skeleton UI (similar to AccountSummary pattern)
  - Error state UI with error message banner
  - Main UI with:
    - Card header with Bot icon and "Trading Bot Status" title
    - Status badge with conditional styling:
      - "running" - green with pulse animation
      - "stopped" - gray
      - "paused" - yellow/warning
      - "error" - red
    - Metrics grid (2x2) with cards for:
      - Uptime (formatted as "Xh Xm Xs")
      - Last Signal (relative time like "5m ago")
      - Signals Today (count)
      - Trades Today (count)
    - Active Strategy section (bordered card with name and description)
    - Monitored Pairs section (badges showing symbol and timeframe)
    - Error banner (conditionally shown when status is "error")
- Add utility function for formatting uptime
- Add utility function for relative time formatting
- Cleanup polling interval on unmount

### Task 7: Integrate BotStatus into Home Page
- Open `app/client/src/pages/Home.jsx`
- Import BotStatus component
- Add BotStatus component to the main content grid alongside AccountSummary and Headlines
- Consider placement: Add as a new row or integrate into existing grid

### Task 8: Write Unit Tests for Bot Status Endpoint
- Create new file `app/server/tests/test_bot_status_endpoint.py`
- Add pytest fixture for test client
- Test cases:
  - `test_bot_status_returns_default_stopped_state` - verify initial state
  - `test_bot_status_running_state` - verify running status response
  - `test_bot_status_with_monitored_pairs` - verify pairs are included
  - `test_bot_status_with_active_strategy` - verify strategy is included
  - `test_bot_status_error_state` - verify error message included
  - `test_bot_status_uptime_calculation` - verify uptime is calculated
  - `test_bot_status_response_structure` - verify all fields present

### Task 9: Run Validation Commands
- Run `cd app/server && uv run pytest` to validate all backend tests pass
- Run `cd app/client && npm run build` to validate frontend builds successfully
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_bot_status.md` E2E test to validate the feature works

## Testing Strategy
### Unit Tests
- Test BotStatusTracker singleton initialization
- Test all state transitions (stopped -> running -> paused -> error)
- Test daily counter increments and resets
- Test uptime calculation accuracy
- Test monitored pairs loading from config
- Test API endpoint returns correct response format
- Test API endpoint handles tracker state correctly

### Edge Cases
- Bot status when no pairs are configured
- Bot status when strategy is not set
- Uptime calculation when bot has never started
- Last signal time when no signals have been recorded
- Error state with various error message lengths
- Frontend handling of null/undefined values from API
- Polling cleanup when component unmounts
- Auto-refresh when user navigates away and back

## Acceptance Criteria
- [ ] Bot status endpoint returns valid BotStatusResponse JSON
- [ ] BotStatus component displays on Home page
- [ ] Status badge shows correct state with appropriate styling
- [ ] Pulse animation shows when bot is "running"
- [ ] Uptime displays in human-readable format (e.g., "2h 15m 30s")
- [ ] Last signal time displays as relative time (e.g., "5m ago")
- [ ] Monitored pairs display as styled badges with symbol and timeframe
- [ ] Active strategy shows name and description
- [ ] Daily statistics (signals today, trades today) display correctly
- [ ] Auto-refresh polls every 30 seconds
- [ ] Loading skeleton displays during initial fetch
- [ ] Error banner displays when status is "error"
- [ ] All backend tests pass
- [ ] Frontend builds without errors
- [ ] E2E test validates feature works correctly

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_bot_status.md` E2E test to validate this functionality works

## Notes
- The BotStatusTracker is a singleton to ensure consistent state across requests
- In a production environment, the bot would call tracker methods to update status; for now, the tracker initializes with mock/default state
- The daily counters (signals_today, trades_today) would need a scheduled reset at midnight in production
- Future enhancement: WebSocket for real-time status updates instead of polling
- Future enhancement: Historical status logs for debugging
- The pulse animation uses Tailwind's `animate-ping` with opacity modifications for the running state indicator
- Consider adding a "Refresh" button for manual status refresh in addition to auto-polling
