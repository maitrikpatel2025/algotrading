# Feature: Bot Controls (Start, Pause, Stop, Emergency Stop)

## Metadata
issue_number: `150`
adw_id: `cd9f1831`
issue_json: `{"number":150,"title":"Feature Bot Controls US-LM-006  to US-LM-009","body":"/feature\nadw_sdlc_iso\nmodel_set heavy\n\n Bot Controls\n Start Trading Bot\nI want to start a configured bot to begin live tradingSo that my strategy executes automatically in the market\nAcceptance Criteria:\n\t∙\t\"Start\" button on bot card and detail page\n\t∙\tPre-start checklist validates: Strategy assigned, Risk parameters set, Broker connected\n\t∙\tConfirmation dialog: \"Start [Bot Name]? It will begin trading with real money.\"\n\t∙\tBot status changes to \"Running\" with timestamp\n\t∙\tFirst signal check logged in activity log\n\t∙\tNotification confirms bot started\n\nPause Trading Bot\nI want to pause a running bot temporarilySo that I can stop new trades while keeping existing positions open\nAcceptance Criteria:\n\t∙\t\"Pause\" button on running bot\n\t∙\tPaused bot does not open new positions\n\t∙\tPaused bot continues to manage existing positions (SL/TP still active)\n\t∙\tStatus shows \"Paused\" with pause timestamp\n\t∙\t\"Resume\" button to restart trading\n\t∙\tOption to specify pause duration (e.g., pause for 2 hours)\n\nStop Trading Bot\nI want to stop a bot completelySo that I can end its trading activity\nAcceptance Criteria:\n\t∙\t\"Stop\" button on bot card and detail page\n\t∙\tOptions when stopping:\n\t∙\tStop and close all positions at market\n\t∙\tStop and keep positions open (manual management)\n\t∙\tStop after current position closes\n\t∙\tConfirmation for each option explaining implications\n\t∙\tBot status changes to \"Stopped\"\n\t∙\tSummary of final P/L displayed\n\t∙\tActivity log records stop event\n\nEmergency Stop All\nI want to immediately stop all bots and close all positionsSo that I can quickly limit losses in emergency situations\nAcceptance Criteria:\n\t∙\tProminent \"Emergency Stop\" button on dashboard (red, always visible)\n\t∙\tSingle confirmation: \"STOP ALL BOTS and CLOSE ALL POSITIONS immediately?\"\n\t∙\tExecutes all market close orders simultaneously\n\t∙\tAll bots set to \"Stopped\" status\n\t∙\tEmail notification sent with summary\n\t∙\tDetailed log of all actions taken\n\t∙\tPost-emergency summary: positions closed, P/L realized, bots stopped"}`

## Feature Description
This feature implements comprehensive bot control functionality for the trading dashboard, including:
1. **Start Trading Bot**: Start a configured bot with pre-start validation checklist ensuring strategy, risk parameters, and broker connectivity are verified before live trading begins
2. **Pause Trading Bot**: Temporarily pause a running bot to stop new trades while maintaining existing position management (SL/TP remain active), with optional timed pause duration
3. **Stop Trading Bot**: Completely stop a bot with multiple options - close all positions, keep positions open for manual management, or stop after current position closes
4. **Emergency Stop All**: Dashboard-wide panic button to immediately stop all bots and close all positions in emergency situations

## User Story
As a forex trader
I want comprehensive controls to start, pause, stop, and emergency stop my trading bots
So that I can manage my automated trading activity safely and respond quickly to market conditions

## Problem Statement
Currently, the trading dashboard provides basic start/stop functionality for a single bot process. Traders need more granular control including:
- Pre-start validation to prevent launching bots with incomplete configuration
- Ability to pause bots temporarily without losing position management
- Multiple stop options to handle different trading scenarios
- Emergency stop capability to quickly limit losses across all bots
- Individual bot control in the multi-bot grid

## Solution Statement
Extend the existing BotController and BotStatusTracker to support:
1. Pre-start checklist validation endpoint that verifies strategy, risk parameters, and broker connectivity
2. Pause functionality with optional timed duration that suspends new trade signals while maintaining position management
3. Enhanced stop options with confirmation dialogs explaining implications of each choice
4. Emergency stop endpoint that force-stops all bots and closes all positions immediately
5. UI controls on both the single bot status component and individual bot cards in the grid

## Relevant Files
Use these files to implement the feature:

**Backend Files:**
- `app/server/core/bot_controller.py` - Extend with pause_bot(), resume_bot(), emergency_stop_all() methods
- `app/server/core/bot_status.py` - Extend BotStatusTracker for pause state, pause timestamp, pause duration tracking, and multi-bot control
- `app/server/core/data_models.py` - Add new request/response models for pause, enhanced stop, and emergency stop operations
- `app/server/server.py` - Add new API endpoints for bot control operations
- `app/server/tests/test_bot_controller.py` - Add unit tests for new bot control methods
- `app/server/tests/test_bot_control_endpoints.py` - Add endpoint tests for new routes

**Frontend Files:**
- `app/client/src/components/BotStatus.jsx` - Add pause/resume buttons, enhanced stop dialog, pre-start checklist display
- `app/client/src/components/LiveDashboard/BotCard.jsx` - Add control buttons to individual bot cards
- `app/client/src/components/LiveDashboard/BotStatusGrid.jsx` - Add Emergency Stop All button to grid header
- `app/client/src/app/api.js` - Add API client methods for new endpoints
- `app/client/src/pages/Monitor.jsx` - Integrate Emergency Stop button in dashboard header

**Documentation:**
- `.claude/commands/test_e2e.md` - Reference for E2E test structure
- `.claude/commands/e2e/test_live_trading_dashboard.md` - Reference for dashboard E2E test patterns
- `app_docs/feature-edc8ccb5-bot-start-stop-control.md` - Existing bot control documentation
- `app_docs/feature-7ce3e5be-trading-bot-status-dashboard.md` - Existing bot status documentation
- `app_docs/feature-4820fa15-bot-status-grid.md` - Existing bot grid documentation

### New Files
- `app/server/tests/test_bot_pause_emergency.py` - Unit tests for pause and emergency stop functionality
- `app/client/src/components/PreStartChecklist.jsx` - Pre-start validation checklist component
- `app/client/src/components/StopOptionsDialog.jsx` - Enhanced stop options dialog component
- `app/client/src/components/PauseDurationDialog.jsx` - Pause duration selection dialog
- `app/client/src/components/EmergencyStopButton.jsx` - Emergency stop button with confirmation
- `.claude/commands/e2e/test_bot_controls.md` - E2E test specification for bot controls

## Implementation Plan

### Phase 1: Foundation
1. **Data Models**: Create new Pydantic models for pre-start checklist, pause requests, enhanced stop options, and emergency stop operations
2. **API Contracts**: Define clear request/response schemas for all new endpoints
3. **State Machine**: Extend bot status states to support pause transitions (running → paused → running/stopped)

### Phase 2: Core Implementation
1. **Backend Pre-Start Checklist**: Implement validation endpoint that checks strategy assignment, risk parameters, and broker connectivity
2. **Backend Pause/Resume**: Implement pause_bot() and resume_bot() methods with optional timed duration
3. **Backend Enhanced Stop**: Implement stop options (close positions, keep positions, wait for close)
4. **Backend Emergency Stop**: Implement emergency_stop_all() that force-stops all bots and closes all positions
5. **Activity Logging**: Add comprehensive logging for all bot control operations

### Phase 3: Integration
1. **Frontend Components**: Build UI components for pre-start checklist, pause dialog, stop options dialog, and emergency stop button
2. **API Integration**: Connect frontend components to new backend endpoints
3. **Real-time Updates**: Ensure status changes propagate to all UI components (BotStatus, BotCard, BotStatusGrid)
4. **Notifications**: Implement toast notifications for all bot control operations

## Step by Step Tasks

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_live_trading_dashboard.md` for E2E test patterns
- Create `.claude/commands/e2e/test_bot_controls.md` with test steps for:
  - Pre-start checklist validation display
  - Start bot with confirmation dialog
  - Pause bot with duration selection
  - Resume bot from paused state
  - Stop bot with options dialog
  - Emergency stop all functionality
- Include screenshot verification points throughout

### Step 2: Add Data Models for Bot Controls
- Edit `app/server/core/data_models.py` to add:
  - `PreStartChecklistItem` model with name, status (passed/failed/warning), and message fields
  - `PreStartChecklistResponse` model with items list and overall can_start boolean
  - `BotPauseRequest` model with optional duration_minutes field
  - `BotPauseResponse` model with success, paused_at, resume_at (if timed), and message fields
  - `BotStopRequest` model with stop_option enum (close_all, keep_positions, wait_for_close)
  - `BotStopResponse` model with success, positions_closed, final_pnl, and message fields
  - `EmergencyStopResponse` model with bots_stopped, positions_closed, total_pnl_realized, and detailed actions list

### Step 3: Extend BotStatusTracker for Pause State
- Edit `app/server/core/bot_status.py` to add:
  - `paused_at` timestamp field
  - `pause_duration_minutes` optional field
  - `resume_at` calculated timestamp for timed pause
  - `set_paused(duration_minutes=None)` method
  - `set_resumed()` method that transitions back to running
  - `check_auto_resume()` method to handle timed pause expiration
  - Update `get_status()` to include pause-related fields

### Step 4: Implement Pre-Start Checklist Validation
- Edit `app/server/core/bot_controller.py` to add:
  - `validate_pre_start()` method that returns PreStartChecklistResponse
  - Check 1: Strategy assigned (verify active_strategy is set)
  - Check 2: Risk parameters configured (verify trading pairs have settings)
  - Check 3: Broker connected (test API connectivity)
  - Return list of checklist items with pass/fail/warning status
- Edit `app/server/server.py` to add:
  - `GET /api/bot/pre-start-check` endpoint returning PreStartChecklistResponse

### Step 5: Implement Pause/Resume Bot Functionality
- Edit `app/server/core/bot_controller.py` to add:
  - `pause_bot(duration_minutes=None)` method that sends SIGUSR1 to pause trading signals
  - `resume_bot()` method that sends SIGUSR2 to resume trading signals
  - Handle timed pause by scheduling auto-resume
- Edit `app/server/server.py` to add:
  - `POST /api/bot/pause` endpoint accepting BotPauseRequest
  - `POST /api/bot/resume` endpoint returning BotControlResponse
- Write unit tests in `app/server/tests/test_bot_pause_emergency.py`

### Step 6: Implement Enhanced Stop Options
- Edit `app/server/core/bot_controller.py` to add:
  - `stop_bot_with_options(option: StopOption)` method
  - Option 1: close_all - Stop bot and close all positions at market price
  - Option 2: keep_positions - Stop bot but leave positions for manual management
  - Option 3: wait_for_close - Set bot to "stopping" state, stop after current position closes
- Edit `app/server/server.py` to update:
  - `POST /api/bot/stop` endpoint to accept BotStopRequest with stop_option
  - Return BotStopResponse with positions_closed count and final_pnl
- Update existing tests in `app/server/tests/test_bot_control_endpoints.py`

### Step 7: Implement Emergency Stop All Functionality
- Edit `app/server/core/bot_controller.py` to add:
  - `emergency_stop_all()` method that:
    - Sends SIGKILL to all running bot processes immediately
    - Closes all open positions at market price via broker API
    - Logs all actions taken
    - Returns comprehensive summary
- Edit `app/server/server.py` to add:
  - `POST /api/bot/emergency-stop` endpoint returning EmergencyStopResponse
  - Include detailed actions list in response
- Write unit tests in `app/server/tests/test_bot_pause_emergency.py`

### Step 8: Add API Client Methods
- Edit `app/client/src/app/api.js` to add:
  - `botPreStartCheck: () => requests.get("/bot/pre-start-check")`
  - `botPause: (config = {}) => requests.post("/bot/pause", config)`
  - `botResume: () => requests.post("/bot/resume")`
  - `botStopWithOptions: (options = {}) => requests.post("/bot/stop", options)`
  - `emergencyStopAll: () => requests.post("/bot/emergency-stop")`

### Step 9: Create PreStartChecklist Component
- Create `app/client/src/components/PreStartChecklist.jsx`:
  - Display checklist items with icons (check, x, warning)
  - Color-code items (green passed, red failed, yellow warning)
  - Show overall status and "Start Bot" button (disabled if any checks fail)
  - Auto-refresh checklist when configuration changes

### Step 10: Create PauseDurationDialog Component
- Create `app/client/src/components/PauseDurationDialog.jsx`:
  - Modal dialog with pause duration options (15 min, 30 min, 1 hour, 2 hours, custom, indefinite)
  - Custom duration input field
  - Cancel and "Pause Bot" buttons
  - Show message about existing positions being managed

### Step 11: Create StopOptionsDialog Component
- Create `app/client/src/components/StopOptionsDialog.jsx`:
  - Modal dialog with three stop options as radio buttons
  - Option 1: "Stop and close all positions" with warning about market execution
  - Option 2: "Stop and keep positions open" with note about manual management
  - Option 3: "Stop after current position closes" with note about pending state
  - Cancel and "Stop Bot" buttons
  - Clear explanation of implications for each option

### Step 12: Create EmergencyStopButton Component
- Create `app/client/src/components/EmergencyStopButton.jsx`:
  - Red button with warning icon, always visible in dashboard header
  - Single-click shows confirmation dialog
  - Confirmation dialog with clear warning message
  - Loading state during execution
  - Post-emergency summary modal showing actions taken

### Step 13: Update BotStatus Component
- Edit `app/client/src/components/BotStatus.jsx`:
  - Replace existing Start button with pre-start checklist validation
  - Add Pause/Resume toggle button (show Pause when running, Resume when paused)
  - Replace Stop button with enhanced stop options trigger
  - Display pause timestamp and resume countdown when paused
  - Show final P/L summary after stop

### Step 14: Update BotCard Component
- Edit `app/client/src/components/LiveDashboard/BotCard.jsx`:
  - Add Start/Pause/Resume/Stop buttons to each card based on status
  - Start button shows pre-start checklist on click
  - Pause button shows duration dialog on click
  - Stop button shows options dialog on click
  - Disabled styling when action not available
  - Tooltip explaining why button is disabled

### Step 15: Update BotStatusGrid Component
- Edit `app/client/src/components/LiveDashboard/BotStatusGrid.jsx`:
  - Add Emergency Stop All button to grid header
  - Style button prominently (red background, white text, warning icon)
  - Position button so it's always visible
  - Add "All Bots Running/Paused/Stopped" status summary

### Step 16: Update Monitor Page
- Edit `app/client/src/pages/Monitor.jsx`:
  - Import and integrate EmergencyStopButton in dashboard header
  - Position emergency stop in consistent location across viewports
  - Ensure emergency stop is visible on mobile layouts

### Step 17: Run Backend Tests
- Run `cd app/server && uv run pytest tests/test_bot_pause_emergency.py -v`
- Run `cd app/server && uv run pytest tests/test_bot_control_endpoints.py -v`
- Fix any failing tests

### Step 18: Run Frontend Build
- Run `cd app/client && npm run build`
- Fix any TypeScript/ESLint errors

### Step 19: Run E2E Tests
- Read `.claude/commands/test_e2e.md` and execute `.claude/commands/e2e/test_bot_controls.md`
- Capture screenshots at each verification point
- Verify all acceptance criteria are met

### Step 20: Run Full Validation Suite
- Execute all validation commands to ensure zero regressions

## Testing Strategy

### Unit Tests
- `test_validate_pre_start_all_pass`: All checklist items pass
- `test_validate_pre_start_no_strategy`: Fails when no strategy assigned
- `test_validate_pre_start_no_broker`: Fails when broker not connected
- `test_pause_bot_indefinite`: Pause without duration
- `test_pause_bot_with_duration`: Pause with 30-minute duration
- `test_pause_bot_auto_resume`: Auto-resume after duration expires
- `test_resume_bot_from_paused`: Resume manually
- `test_stop_close_all_positions`: Stop and close all positions
- `test_stop_keep_positions`: Stop and keep positions open
- `test_stop_wait_for_close`: Stop after current position closes
- `test_emergency_stop_all`: Emergency stop closes all positions and stops all bots
- `test_emergency_stop_logging`: Verify all actions logged

### Edge Cases
- Pause when no positions open (should still work)
- Pause when bot not running (should return error)
- Resume when not paused (should return error)
- Stop with no open positions (should succeed immediately)
- Emergency stop with no bots running (should succeed with empty summary)
- Pre-start check with broker timeout (should return warning/failed)
- Timed pause with very short duration (minimum 1 minute)
- Emergency stop during active trade execution

## Acceptance Criteria

### Start Trading Bot
- [ ] "Start" button visible on bot card and BotStatus component when bot is stopped
- [ ] Pre-start checklist validates: Strategy assigned, Risk parameters set, Broker connected
- [ ] Confirmation dialog displays: "Start [Bot Name]? It will begin trading with real money."
- [ ] Bot status changes to "Running" with timestamp after successful start
- [ ] First signal check logged in activity log
- [ ] Toast notification confirms bot started

### Pause Trading Bot
- [ ] "Pause" button visible on running bot card and BotStatus component
- [ ] Paused bot does not open new positions
- [ ] Paused bot continues to manage existing positions (SL/TP still active)
- [ ] Status shows "Paused" with pause timestamp
- [ ] "Resume" button appears to restart trading
- [ ] Option to specify pause duration (15 min, 30 min, 1 hour, 2 hours, custom, indefinite)
- [ ] Auto-resume works when timed pause expires

### Stop Trading Bot
- [ ] "Stop" button visible on bot card and BotStatus component
- [ ] Options dialog shows three stop options:
  - Stop and close all positions at market
  - Stop and keep positions open (manual management)
  - Stop after current position closes
- [ ] Confirmation dialog explains implications of each option
- [ ] Bot status changes to "Stopped" after stop completes
- [ ] Summary of final P/L displayed in toast notification
- [ ] Activity log records stop event

### Emergency Stop All
- [ ] Prominent "Emergency Stop" button visible in dashboard header (red, always visible)
- [ ] Single confirmation dialog: "STOP ALL BOTS and CLOSE ALL POSITIONS immediately?"
- [ ] Executes all market close orders simultaneously on confirmation
- [ ] All bots set to "Stopped" status
- [ ] Detailed log of all actions taken displayed
- [ ] Post-emergency summary shows: positions closed, P/L realized, bots stopped

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest tests/test_bot_pause_emergency.py -v` - Run new pause/emergency tests
- `cd app/server && uv run pytest tests/test_bot_controller.py -v` - Run bot controller tests
- `cd app/server && uv run pytest tests/test_bot_control_endpoints.py -v` - Run bot control endpoint tests
- `cd app/server && uv run pytest` - Run all server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_bot_controls.md` to validate this functionality works

## Notes

- The existing BotController uses a singleton pattern - maintain this pattern for the new methods
- The pause functionality requires the bot process to handle SIGUSR1/SIGUSR2 signals - this may need bot-side changes in `app/bot/run.py`
- Emergency stop uses SIGKILL which cannot be caught - ensure lock file cleanup handles this scenario
- Consider rate limiting the emergency stop endpoint to prevent accidental multiple triggers
- The timed pause auto-resume should use a background task or scheduled job
- For position closing, use the existing broker API integration in the server
- Toast notifications should use the existing toast component pattern from BotStatus.jsx
- All new dialogs should follow the existing confirmation dialog pattern
- Consider adding WebSocket support in future for real-time status updates instead of polling
- The email notification for emergency stop is mentioned in requirements but may be deferred to a future iteration if email service is not configured
