# Feature: Trading Bot Start/Stop Control

## Metadata
issue_number: `25`
adw_id: `edc8ccb5`
issue_json: `{"number":25,"title":"Feature Trading Bot Start/Stop Bot Control","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nImplement bot control functionality allowing traders to start and stop the trading bot directly from the UI..."}`

## Feature Description
This feature enables traders to start and stop the automated trading bot directly from the UI without needing terminal access. The implementation adds a BotController class that manages the bot subprocess lifecycle, new API endpoints for bot control operations (start/stop/restart), and UI controls integrated into the existing BotStatus component. The system ensures only one bot instance can run at a time using a lock file mechanism, provides real-time status feedback, and handles graceful shutdown with SIGTERM followed by SIGKILL timeout.

## User Story
As a trader
I want to start and stop my trading bot from the dashboard UI
So that I can quickly respond to market conditions and manage my automated trading without needing terminal access

## Problem Statement
Currently, traders must use terminal commands to start and stop the trading bot, which requires technical knowledge and is inconvenient for quick responses to market conditions. There is no UI-based control mechanism, making it difficult for non-technical users to manage their automated trading system.

## Solution Statement
Implement a comprehensive bot control system consisting of:
1. **Backend**: A BotController class that manages subprocess lifecycle with PID tracking, lock file mechanism, heartbeat monitoring, and graceful shutdown handling
2. **API Endpoints**: POST endpoints for `/api/bot/start`, `/api/bot/stop`, and `/api/bot/restart` with proper validation and error handling
3. **Frontend**: Start/Stop toggle buttons with loading states, configuration selector for strategy and pairs, confirmation dialog before stopping, and toast notifications for feedback

The solution integrates with the existing BotStatusTracker to reflect real-time status changes and prevents multiple bot instances from running simultaneously.

## Relevant Files
Use these files to implement the feature:

**Backend - Core Implementation:**
- `app/server/core/bot_status.py` - Existing BotStatusTracker singleton that tracks bot state; will be updated to integrate with BotController
- `app/server/core/data_models.py` - Pydantic models for API requests/responses; add new models for bot control endpoints
- `app/server/server.py` - Main FastAPI application; add new bot control endpoints

**Backend - Configuration:**
- `app/server/config/__init__.py` - Server settings; check for any needed configuration additions
- `app/bot/config/settings.json` - Bot configuration file that defines trading pairs and strategy parameters

**Bot Entry Point:**
- `app/bot/run.py` - Trading bot entry point; the script that will be spawned as a subprocess

**Frontend - Components:**
- `app/client/src/components/BotStatus.jsx` - Existing component displaying bot status; add Start/Stop controls and configuration panel
- `app/client/src/app/api.js` - API client; add new endpoints for bot control

**Frontend - Pages:**
- `app/client/src/pages/Home.jsx` - Home page that renders BotStatus component; may need updates for toast notifications

**Scripts:**
- `scripts/start_bot.sh` - Existing shell script for starting bot; reference for environment setup

**Tests:**
- `app/server/tests/test_bot_status_endpoint.py` - Existing tests for bot status; reference pattern for new tests

**Documentation:**
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test file
- `.claude/commands/e2e/test_bot_status.md` - Existing bot status E2E test

### New Files
- `app/server/core/bot_controller.py` - New BotController class for subprocess management
- `app/server/tests/test_bot_controller.py` - Unit tests for BotController class
- `app/server/tests/test_bot_control_endpoints.py` - Unit tests for bot control API endpoints
- `.claude/commands/e2e/test_bot_control.md` - E2E test specification for bot control feature

## Implementation Plan

### Phase 1: Foundation
1. Create the BotController class with subprocess management, PID tracking, and lock file mechanism
2. Add Pydantic models for bot control request/response schemas
3. Implement basic start/stop functionality with proper process handling

### Phase 2: Core Implementation
1. Add API endpoints for `/api/bot/start`, `/api/bot/stop`, `/api/bot/restart`
2. Integrate BotController with existing BotStatusTracker for real-time status updates
3. Implement heartbeat monitoring and crash detection
4. Add configuration validation before bot launch

### Phase 3: Integration
1. Add frontend API client methods for bot control endpoints
2. Implement Start/Stop toggle buttons with loading states in BotStatus component
3. Add configuration selector dropdown for strategy and pairs
4. Implement confirmation dialog before stopping bot
5. Add toast notifications for success/failure feedback
6. Create E2E test specification

## Step by Step Tasks

### Task 1: Create BotController Class
- Create `app/server/core/bot_controller.py` with the BotController class
- Implement singleton pattern for thread-safe access
- Add methods: `start_bot()`, `stop_bot()`, `restart_bot()`, `get_status()`, `is_running()`
- Implement lock file mechanism at `app/server/.bot.lock` to prevent multiple instances
- Store PID for process tracking
- Implement graceful shutdown with SIGTERM followed by SIGKILL after 5-second timeout
- Redirect subprocess stdout/stderr to log files
- Set proper environment variables (PYTHONPATH) when spawning subprocess

### Task 2: Add Pydantic Models for Bot Control
- Add to `app/server/core/data_models.py`:
  - `BotStartRequest` model with fields: `strategy` (optional), `pairs` (optional list), `timeframe` (optional)
  - `BotControlResponse` model with fields: `success`, `message`, `status`, `pid` (optional), `error` (optional)
  - Update `BotStatusResponse` to include `pid` and `can_start`/`can_stop` boolean flags

### Task 3: Integrate BotController with BotStatusTracker
- Update `app/server/core/bot_status.py` to import and use BotController
- Add method to check if process is actually running (via PID check)
- Implement heartbeat monitoring that sets status to "stopped" if process dies
- Add `set_starting()` and `set_stopping()` transitional states

### Task 4: Create Bot Control API Endpoints
- Add to `app/server/server.py`:
  - `POST /api/bot/start` - Start the bot with optional configuration
  - `POST /api/bot/stop` - Gracefully stop the bot
  - `POST /api/bot/restart` - Restart the bot (stop + start)
- Implement proper error handling and validation
- Return appropriate HTTP status codes (200 success, 400 validation error, 409 conflict for already running, 500 server error)
- Log all control operations

### Task 5: Create Unit Tests for BotController
- Create `app/server/tests/test_bot_controller.py`
- Test cases:
  - Start bot successfully when not running
  - Prevent starting when already running (lock file exists)
  - Stop bot gracefully
  - Stop bot with force (SIGKILL) if SIGTERM fails
  - Lock file cleanup on stop
  - Lock file cleanup on crash detection
  - PID tracking accuracy
  - Process health check

### Task 6: Create Unit Tests for Bot Control Endpoints
- Create `app/server/tests/test_bot_control_endpoints.py`
- Test cases:
  - POST /api/bot/start returns 200 when bot starts successfully
  - POST /api/bot/start returns 409 when bot already running
  - POST /api/bot/stop returns 200 when bot stops successfully
  - POST /api/bot/stop returns 400 when bot not running
  - POST /api/bot/restart returns 200 on successful restart
  - Invalid configuration returns 400 with validation error
  - Response structure validation

### Task 7: Add Frontend API Client Methods
- Update `app/client/src/app/api.js`:
  - Add `botStart: (config) => requests.post("/bot/start", config)`
  - Add `botStop: () => requests.post("/bot/stop")`
  - Add `botRestart: () => requests.post("/bot/restart")`
- Add POST request method to the requests object

### Task 8: Update BotStatus Component with Control Buttons
- Update `app/client/src/components/BotStatus.jsx`:
  - Add state for loading transitions (`isStarting`, `isStopping`)
  - Add Start button (green, enabled when stopped, with Play icon)
  - Add Stop button (red, enabled when running, with Square/Stop icon)
  - Show loading spinner on buttons during transitions
  - Disable buttons during transitional states
  - Call API endpoints on button clicks
  - Refresh status after control operations complete

### Task 9: Add Configuration Panel to BotStatus
- Update `app/client/src/components/BotStatus.jsx`:
  - Add collapsible configuration section (shown when bot is stopped)
  - Add dropdown for strategy selection (default: "Bollinger Bands Strategy")
  - Add multi-select for trading pairs (loaded from bot config)
  - Add timeframe selector dropdown
  - Pass selected configuration to start endpoint

### Task 10: Add Confirmation Dialog
- Update `app/client/src/components/BotStatus.jsx`:
  - Create a confirmation modal component
  - Show dialog when Stop button clicked with message: "Are you sure you want to stop the trading bot?"
  - Include warning about active trades if applicable
  - Add Cancel and Confirm buttons
  - Only proceed with stop if confirmed

### Task 11: Add Toast Notifications
- Check if toast library exists in project, if not recommend adding one or use simple notification state
- Add toast/notification display for:
  - "Bot started successfully" (success)
  - "Bot stopped successfully" (success)
  - "Failed to start bot: {error}" (error)
  - "Failed to stop bot: {error}" (error)
  - "Bot restarted successfully" (success)

### Task 12: Create E2E Test Specification
- Create `.claude/commands/e2e/test_bot_control.md`:
  - Test starting the bot from UI
  - Test stopping the bot from UI
  - Test configuration selection before start
  - Test confirmation dialog on stop
  - Test loading states during transitions
  - Test error handling for failed operations
  - Verify status badge updates correctly

### Task 13: Run Validation Commands
- Execute all validation commands to ensure zero regressions
- Fix any issues discovered during validation

## Testing Strategy

### Unit Tests
- `test_bot_controller.py`: Test BotController subprocess management, lock file handling, PID tracking, graceful shutdown
- `test_bot_control_endpoints.py`: Test API endpoint behavior, validation, error responses, status codes

### Edge Cases
- Starting bot when already running → should return 409 Conflict
- Stopping bot when not running → should return 400 Bad Request
- Bot crashes unexpectedly → status should automatically update to "stopped" via heartbeat check
- Lock file exists but process is dead (stale lock) → should clean up and allow start
- Multiple rapid start/stop requests → should handle gracefully with proper locking
- Invalid configuration parameters → should return 400 with validation errors
- Network timeout during stop → should fallback to SIGKILL after timeout

## Acceptance Criteria
- [ ] Trader can start the bot from the UI by clicking the Start button
- [ ] Trader can stop the bot from the UI by clicking the Stop button
- [ ] Confirmation dialog appears before stopping the bot
- [ ] Loading spinners display during start/stop transitions
- [ ] Status badge updates in real-time (stopped → starting → running, running → stopping → stopped)
- [ ] Only one bot instance can run at a time (mutex/lock prevents duplicates)
- [ ] Toast notifications appear for success/failure of operations
- [ ] Configuration panel allows selecting strategy and pairs before start
- [ ] Bot process terminates gracefully with SIGTERM, falls back to SIGKILL
- [ ] PID is tracked and displayed (optional in advanced UI)
- [ ] All existing bot status functionality continues to work
- [ ] All backend tests pass
- [ ] Frontend builds without errors
- [ ] E2E test validates the feature works correctly

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd /home/ubuntu/algotrading/trees/edc8ccb5/app/server && uv run pytest tests/test_bot_controller.py -v` - Run BotController unit tests
- `cd /home/ubuntu/algotrading/trees/edc8ccb5/app/server && uv run pytest tests/test_bot_control_endpoints.py -v` - Run bot control endpoint tests
- `cd /home/ubuntu/algotrading/trees/edc8ccb5/app/server && uv run pytest tests/test_bot_status_endpoint.py -v` - Run existing bot status tests (regression check)
- `cd /home/ubuntu/algotrading/trees/edc8ccb5/app/server && uv run pytest` - Run all server tests to validate zero regressions
- `cd /home/ubuntu/algotrading/trees/edc8ccb5/app/client && npm run build` - Run frontend build to validate no compilation errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_bot_control.md` to validate this functionality works end-to-end

## Notes
- The bot subprocess will be spawned using Python's `subprocess.Popen` with the command: `uv run python run.py` executed from the `app/bot` directory
- Environment variables (especially PYTHONPATH) must be properly set when spawning the subprocess to ensure server modules are accessible
- The lock file approach is simpler than a database-based PID tracking and works well for single-server deployments
- For production, consider adding WebSocket support for real-time status updates instead of polling
- The heartbeat monitoring interval should be configurable (default: 30 seconds)
- Graceful shutdown timeout before SIGKILL should be configurable (default: 5 seconds)
- Consider adding a "Force Stop" button for cases where graceful shutdown hangs
- The confirmation dialog could be enhanced to show current trade positions in future iterations
- Strategy selection is simplified to a single default strategy; future iterations could support multiple strategy configurations
