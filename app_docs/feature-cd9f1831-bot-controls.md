# Bot Controls (Start, Pause, Stop, Emergency Stop)

**ADW ID:** cd9f1831
**Date:** 2026-01-25
**Specification:** specs/issue-150-adw-cd9f1831-sdlc_planner-bot-controls.md

## Overview

This feature implements comprehensive bot control functionality for the trading dashboard, providing traders with granular control over their automated trading bots. The implementation includes pre-start validation, pause/resume with optional duration, enhanced stop options, and an emergency stop button that immediately stops all bots and closes all positions.

## What Was Built

- **Pre-Start Checklist**: Validates strategy assignment, risk parameters, and broker connectivity before starting a bot
- **Pause/Resume Bot**: Temporarily pause trading while maintaining existing position management (SL/TP remain active)
- **Timed Pause**: Option to pause for specific duration (15 min, 30 min, 1 hour, 2 hours, custom)
- **Enhanced Stop Options**: Three stop modes - close all positions, keep positions open, or wait for current position to close
- **Emergency Stop All**: Dashboard-wide panic button to immediately stop all bots and close all positions

## Technical Implementation

### Files Modified

- `app/server/core/bot_controller.py`: Added `validate_pre_start()`, `pause_bot()`, `resume_bot()`, `stop_bot_with_options()`, and `emergency_stop_all()` methods
- `app/server/core/bot_status.py`: Extended with pause state tracking, `set_paused()`, `set_resumed()`, and `get_pause_info()` methods
- `app/server/core/data_models.py`: Added Pydantic models for pre-start checklist, pause/resume, stop options, and emergency stop
- `app/server/server.py`: Added API endpoints for `/api/bot/pre-start-check`, `/api/bot/pause`, `/api/bot/resume`, `/api/bot/stop-with-options`, `/api/bot/emergency-stop`
- `app/client/src/app/api.js`: Added API client methods for new endpoints
- `app/client/src/components/BotStatus.jsx`: Updated with pause/resume toggle and enhanced stop options
- `app/client/src/components/LiveDashboard/BotCard.jsx`: Added control buttons to individual bot cards
- `app/client/src/components/LiveDashboard/BotStatusGrid.jsx`: Added Emergency Stop button to grid header and dialog integrations

### New Files Created

- `app/client/src/components/BotControls/EmergencyStopButton.jsx`: Red emergency stop button with confirmation dialog and post-emergency summary
- `app/client/src/components/BotControls/PreStartChecklist.jsx`: Modal showing validation checklist with pass/fail/warning states
- `app/client/src/components/BotControls/PauseDurationDialog.jsx`: Dialog for selecting pause duration
- `app/client/src/components/BotControls/StopOptionsDialog.jsx`: Dialog presenting three stop options with implications
- `app/client/src/components/BotControls/index.js`: Barrel export for BotControls components
- `.claude/commands/e2e/test_bot_controls.md`: E2E test specification

### Key Changes

- **Signal-Based Pause**: Bot pause uses SIGUSR1/SIGUSR2 signals to the bot process, allowing it to continue managing existing positions while not opening new ones
- **Pre-Start Validation**: Three-point checklist validates strategy, risk parameters, and broker connectivity before allowing bot start
- **Stop Options Enum**: `StopOption` enum with `CLOSE_ALL`, `KEEP_POSITIONS`, and `WAIT_FOR_CLOSE` values
- **Emergency Stop Actions**: Returns detailed list of `EmergencyStopAction` objects documenting each action taken
- **Toast Notifications**: Success/error feedback for all bot control operations

## How to Use

### Starting a Bot
1. Click the "Start" button on a bot card or the BotStatus component
2. Review the pre-start checklist (Strategy assigned, Risk parameters set, Broker connected)
3. If all checks pass, click "Start Bot" to confirm
4. Bot status changes to "Running" with timestamp

### Pausing a Bot
1. Click the "Pause" button on a running bot
2. Select pause duration:
   - Quick options: 15 min, 30 min, 1 hour, 2 hours
   - Custom duration input
   - Indefinite (no auto-resume)
3. Bot continues managing existing positions but won't open new ones
4. Use "Resume" button to restart trading manually, or wait for auto-resume

### Stopping a Bot
1. Click the "Stop" button on a bot card
2. Choose a stop option:
   - **Stop and close all positions**: Closes all open positions at market price
   - **Stop and keep positions open**: Leaves positions for manual management
   - **Stop after current position closes**: Bot enters "stopping" state
3. Confirm the action
4. View final P/L summary in toast notification

### Emergency Stop
1. Click the red "Emergency Stop" button in the Bot Status Grid header
2. Review the warning: "STOP ALL BOTS and CLOSE ALL POSITIONS immediately?"
3. Click "CONFIRM EMERGENCY STOP"
4. All bots are force-stopped (SIGKILL), all positions closed at market
5. Review post-emergency summary showing bots stopped, positions closed, and P/L realized

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bot/pre-start-check` | GET | Validate pre-start checklist |
| `/api/bot/pause` | POST | Pause bot with optional duration |
| `/api/bot/resume` | POST | Resume paused bot |
| `/api/bot/stop-with-options` | POST | Stop bot with position handling options |
| `/api/bot/emergency-stop` | POST | Emergency stop all bots and close positions |

## Data Models

### PreStartChecklistResponse
```python
{
  "items": [
    {"name": "Strategy assigned", "status": "passed", "message": "..."},
    {"name": "Risk parameters set", "status": "passed", "message": "..."},
    {"name": "Broker connected", "status": "passed", "message": "..."}
  ],
  "can_start": true,
  "message": "All checks passed"
}
```

### BotPauseRequest
```python
{
  "duration_minutes": 30  # Optional, 1-1440. None = indefinite
}
```

### BotStopRequest
```python
{
  "stop_option": "close_all" | "keep_positions" | "wait_for_close"
}
```

### EmergencyStopResponse
```python
{
  "success": true,
  "bots_stopped": 3,
  "positions_closed": 5,
  "total_pnl_realized": 125.50,
  "actions": [...],  # Detailed action log
  "message": "Emergency stop complete: 3 bots stopped, 5 positions closed"
}
```

## Configuration

No additional configuration required. The feature uses existing bot configuration and broker API settings.

## Testing

Run the E2E test suite:
```bash
# Read and execute the E2E test specification
cat .claude/commands/e2e/test_bot_controls.md
```

Backend unit tests:
```bash
cd app/server && uv run pytest tests/test_bot_controller.py -v
cd app/server && uv run pytest tests/test_bot_control_endpoints.py -v
```

## Notes

- The pause functionality requires the bot process to handle SIGUSR1/SIGUSR2 signals
- Emergency stop uses SIGKILL which cannot be caught - lock file cleanup handles this scenario
- Timed pause auto-resume uses the status tracker to check for expiration
- All control operations are logged for audit purposes
- Toast notifications use the existing toast component pattern
- The emergency stop button has a subtle pulse animation to ensure visibility
