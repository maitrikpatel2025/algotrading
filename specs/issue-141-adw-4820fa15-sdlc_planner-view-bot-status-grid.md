# Feature: View Bot Status Grid

## Metadata
issue_number: `141`
adw_id: `4820fa15`
issue_json: `{"number":141,"title":"Feature View Bot Status Grid US-LM-002","body":"/feature\nadw_sdlc_iso\nmodel_set heavy\n\nfor  Live Monitor\nfor Live Dashboard\n\nView Bot Status Grid\nI want to see all my trading bots in a grid with their current status\nSo that I can quickly identify which bots are running, paused, or have issues\nAcceptance Criteria:\n\n Grid card for each bot shows: Name, Status (Running/Paused/Stopped/Error), Currency pair, Current P/L, Open position (if any)\n Status color coding: green (running), yellow (paused), gray (stopped), red (error)\n Sort options: Name, Status, P/L, Last activity\n Click card expands to detailed view or navigates to bot details\n Grid auto-refreshes every 5 seconds"}`

## Feature Description
Enhance the Live Trading Dashboard (Monitor page) with a comprehensive Bot Status Grid that displays all configured trading bots in an interactive card-based grid layout. Each bot card shows real-time status information including the bot name, operational status with color-coded indicators, assigned currency pair, current profit/loss, and any open positions. The grid supports sorting by multiple criteria and allows users to click on a card to expand it for detailed information. The data auto-refreshes every 5 seconds for real-time monitoring.

## User Story
As a trader
I want to see all my trading bots in a grid with their current status
So that I can quickly identify which bots are running, paused, or have issues

## Problem Statement
Currently, the Live Trading Dashboard shows bot status information in a basic card format through the `ActiveBotsGrid` component, but it only displays a single bot card with limited information. Traders managing multiple bots need a comprehensive grid view that shows all their bots at a glance with detailed status information, sorting capabilities, and the ability to drill down into individual bot details.

## Solution Statement
Extend the existing bot status infrastructure to support multiple bots and create an enhanced `BotStatusGrid` component that:
1. Displays all configured bots in a responsive card grid
2. Shows each bot's name, status, currency pair, current P/L, and open positions
3. Uses color-coded status indicators (green=running, yellow=paused, gray=stopped, red=error)
4. Provides sort controls for Name, Status, P/L, and Last Activity
5. Supports card expansion/click for detailed view
6. Auto-refreshes every 5 seconds using the existing polling infrastructure

## Relevant Files
Use these files to implement the feature:

**Backend (Server)**
- `app/server/core/data_models.py` - Add extended bot status models for multi-bot support and per-bot P/L data
- `app/server/core/bot_status.py` - Extend BotStatusTracker to support multiple bot instances with P/L tracking
- `app/server/server.py` - Add endpoint for fetching all bots status with extended data

**Frontend (Client)**
- `app/client/src/components/LiveDashboard/ActiveBotsGrid.jsx` - Replace/enhance with new BotStatusGrid component
- `app/client/src/hooks/useDashboardData.js` - Update to fetch multi-bot status with 5-second polling
- `app/client/src/pages/Monitor.jsx` - Integrate the new BotStatusGrid component
- `app/client/src/app/api.js` - Add endpoint for fetching all bots status

**Reference Files**
- `app/client/src/components/LiveDashboard/AccountMetrics.jsx` - Reference for card styling patterns
- `app/client/src/components/LiveDashboard/OpenPositions.jsx` - Reference for table/grid patterns
- `app/client/src/lib/utils.js` - cn utility for className merging

**Documentation**
- `app_docs/feature-1a8f76c4-live-trading-dashboard.md` - Reference for dashboard patterns and polling
- `app_docs/feature-7ce3e5be-trading-bot-status-dashboard.md` - Reference for bot status data models
- `.claude/commands/test_e2e.md` - Reference for E2E test format
- `.claude/commands/e2e/test_live_trading_dashboard.md` - Reference for dashboard E2E test patterns

### New Files
- `app/client/src/components/LiveDashboard/BotStatusGrid.jsx` - New comprehensive bot status grid component
- `app/client/src/components/LiveDashboard/BotCard.jsx` - Individual bot card component with expand functionality
- `app/server/tests/test_multi_bot_status.py` - Unit tests for multi-bot status endpoint
- `.claude/commands/e2e/test_bot_status_grid.md` - E2E test specification for bot status grid

## Implementation Plan
### Phase 1: Foundation
1. Extend backend data models to support multiple bots with per-bot metrics (P/L, positions, currency pair)
2. Modify BotStatusTracker to manage multiple bot instances
3. Create new API endpoint `/api/bots/status` to return all bots with extended data

### Phase 2: Core Implementation
1. Create BotCard component for individual bot display with status badge, metrics, and expand functionality
2. Create BotStatusGrid component with card grid layout and sort controls
3. Update useDashboardData hook with 5-second polling interval for bot grid
4. Add botsStatus endpoint to api.js

### Phase 3: Integration
1. Replace ActiveBotsGrid with BotStatusGrid in Monitor page
2. Update index.js barrel exports
3. Add unit tests for backend
4. Create E2E test specification

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_live_trading_dashboard.md` for reference
- Create `.claude/commands/e2e/test_bot_status_grid.md` with test steps for:
  - Verifying bot grid displays on Monitor page
  - Verifying each bot card shows Name, Status, Currency Pair, P/L, Open Position
  - Verifying status color coding (green, yellow, gray, red)
  - Verifying sort controls work (Name, Status, P/L, Last Activity)
  - Verifying card click expands to detailed view
  - Verifying 5-second auto-refresh updates data
  - Taking screenshots at each verification step

### Task 2: Extend Backend Data Models
- Open `app/server/core/data_models.py`
- Add `BotInstance` model with fields:
  - `id: str` - Unique bot identifier
  - `name: str` - Bot display name
  - `status: Literal["running", "paused", "stopped", "error"]` - Current status
  - `currency_pair: Optional[str]` - Assigned currency pair
  - `current_pnl: Optional[float]` - Current P/L in account currency
  - `open_position: Optional[Dict[str, Any]]` - Open position details if any
  - `last_activity: Optional[datetime]` - Last activity timestamp
  - `strategy_name: Optional[str]` - Active strategy name
  - `error_message: Optional[str]` - Error message if in error state
- Add `AllBotsStatusResponse` model with fields:
  - `bots: List[BotInstance]` - List of all bot instances
  - `count: int` - Number of bots
  - `last_updated: Optional[datetime]` - Timestamp of last update

### Task 3: Extend Bot Status Tracker
- Open `app/server/core/bot_status.py`
- Add `_bots: Dict[str, BotInstance]` to track multiple bot instances
- Add method `get_all_bots() -> AllBotsStatusResponse` to return all bots
- Add method `register_bot(bot_id: str, name: str, currency_pair: str)` to register a new bot
- Add method `update_bot_pnl(bot_id: str, pnl: float)` to update bot P/L
- Add method `update_bot_position(bot_id: str, position: Dict)` to update open position
- Maintain backward compatibility with existing single-bot methods
- Initialize with default bot configurations from `app/bot/config/settings.json`

### Task 4: Add Backend API Endpoint
- Open `app/server/server.py`
- Add endpoint `GET /api/bots/status` that returns `AllBotsStatusResponse`
- Include error handling and logging
- Add to Bot tags for API documentation

### Task 5: Add Backend Unit Tests
- Create `app/server/tests/test_multi_bot_status.py`
- Test `get_all_bots()` returns correct data structure
- Test `register_bot()` adds new bot correctly
- Test `update_bot_pnl()` updates P/L correctly
- Test `update_bot_position()` updates position correctly
- Test `/api/bots/status` endpoint returns expected response

### Task 6: Add Frontend API Endpoint
- Open `app/client/src/app/api.js`
- Add `botsStatus: () => requests.get("/bots/status")` endpoint

### Task 7: Create BotCard Component
- Create `app/client/src/components/LiveDashboard/BotCard.jsx`
- Implement card with:
  - Header: Bot name and status badge with color coding
  - Body: Currency pair, Current P/L (colored green/red), Open position (if any)
  - Footer: Last activity timestamp
  - Expand/collapse functionality on click
  - Expanded view shows: strategy name, detailed position info, error message (if any)
- Use existing design patterns from AccountMetrics and ActiveBotsGrid
- Use Tailwind classes and dark mode support
- Use lucide-react icons: Bot, TrendingUp, TrendingDown, Clock, AlertCircle, ChevronDown, ChevronUp

### Task 8: Create BotStatusGrid Component
- Create `app/client/src/components/LiveDashboard/BotStatusGrid.jsx`
- Implement grid with:
  - Header: Title "Bot Status Grid" with subtitle showing count
  - Sort controls: Dropdown or buttons for Name, Status, P/L, Last Activity
  - Sort direction toggle (ascending/descending)
  - Responsive grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop
  - Empty state: "No bots configured" message
  - Loading skeleton state
- Sort logic for each option:
  - Name: Alphabetical A-Z / Z-A
  - Status: running > paused > stopped > error (or reverse)
  - P/L: Highest to lowest (or reverse)
  - Last Activity: Most recent first (or reverse)
- Use BotCard component for each bot

### Task 9: Update Dashboard Data Hook
- Open `app/client/src/hooks/useDashboardData.js`
- Change `DEFAULT_POLL_INTERVAL` from 10000 to 5000 (5 seconds)
- Add `botsStatus` state and fetch
- Update `fetchData` to include `endPoints.botsStatus()`
- Return `botsStatus` in hook return value

### Task 10: Update LiveDashboard Index Exports
- Open `app/client/src/components/LiveDashboard/index.js`
- Add exports for BotStatusGrid and BotCard components

### Task 11: Integrate into Monitor Page
- Open `app/client/src/pages/Monitor.jsx`
- Import BotStatusGrid component
- Replace ActiveBotsGrid with BotStatusGrid
- Pass `botsStatus` data from useDashboardData hook
- Ensure loading state is passed correctly

### Task 12: Run Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

## Testing Strategy
### Unit Tests
- Test BotStatusTracker multi-bot methods (register, update P/L, update position, get all)
- Test AllBotsStatusResponse model serialization
- Test /api/bots/status endpoint response format
- Test sort functions for each criteria (name, status, P/L, last activity)

### Edge Cases
- Empty bots list (no bots configured)
- Single bot (backward compatibility)
- All bots in same status (sorting edge case)
- Null/undefined P/L values
- Missing open position data
- Bot in error state with error message
- Network error during fetch (connection status should update)
- Large number of bots (10+) for grid performance

## Acceptance Criteria
- [ ] Grid card for each bot shows: Name, Status (Running/Paused/Stopped/Error), Currency pair, Current P/L, Open position (if any)
- [ ] Status color coding: green (running), yellow (paused), gray (stopped), red (error)
- [ ] Sort options available: Name, Status, P/L, Last activity
- [ ] Click on card expands to show detailed view
- [ ] Grid auto-refreshes every 5 seconds
- [ ] Responsive layout (1/2/3 columns based on viewport)
- [ ] Dark mode support
- [ ] Loading and empty states display correctly
- [ ] Backward compatibility with existing single-bot status
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Frontend builds without errors
- [ ] Backend tests pass without regressions

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_bot_status_grid.md` to validate this functionality works
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- The existing `ActiveBotsGrid` component can be kept as a fallback or removed after migration
- The 5-second polling interval is more aggressive than the current 10-second interval; monitor for performance impact
- Future enhancement: Add WebSocket support for real-time updates without polling
- Future enhancement: Add bot grouping by strategy or currency pair
- Future enhancement: Add quick actions (start/stop/pause) directly from grid cards
- The bot status tracker initializes from `app/bot/config/settings.json` for default bot configurations
- P/L values should be formatted with currency symbol and appropriate decimal places
- Consider adding a "Last refreshed" indicator specific to the bot grid
