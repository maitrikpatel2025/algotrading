# Trading Bot Status Dashboard

**ADW ID:** 7ce3e5be
**Date:** 2026-01-18
**Specification:** /home/ubuntu/algotrading/trees/7ce3e5be/specs/issue-23-adw-7ce3e5be-sdlc_planner-trading-bot-status-dashboard.md

## Overview

A real-time dashboard component that displays the operational status of the automated trading bot. It provides traders with visibility into the bot's running state, uptime, monitored currency pairs, active trading strategy, and daily statistics (signals and trades). The component features auto-refresh polling and visual status indicators.

## What Was Built

- **Backend API endpoint** (`GET /api/bot/status`) to retrieve bot operational status
- **BotStatusTracker singleton** class to manage and track bot state
- **Pydantic data models** for bot status response, monitored pairs, and active strategy
- **React BotStatus component** with status badge, metrics grid, and auto-refresh
- **E2E test specification** for bot status feature validation
- **Unit tests** for the bot status API endpoint

## Technical Implementation

### Files Modified

- `app/server/core/data_models.py`: Added `MonitoredPair`, `ActiveStrategy`, and `BotStatusResponse` Pydantic models
- `app/server/server.py`: Added `/api/bot/status` endpoint with error handling
- `app/client/src/app/api.js`: Added `botStatus` endpoint to API client
- `app/client/src/pages/Home.jsx`: Integrated BotStatus component into the home page grid layout

### New Files Created

- `app/server/core/bot_status.py`: BotStatusTracker singleton class with state management methods
- `app/client/src/components/BotStatus.jsx`: React component for displaying bot status
- `app/server/tests/test_bot_status_endpoint.py`: Unit tests for the API endpoint
- `.claude/commands/e2e/test_bot_status.md`: E2E test specification

### Key Changes

- **Singleton Pattern**: BotStatusTracker uses thread-safe singleton to ensure consistent state across requests
- **Auto-Polling**: Frontend polls every 30 seconds for status updates with cleanup on unmount
- **Visual Indicators**: Status badge with pulse animation for "running" state, color-coded states (green/yellow/gray/red)
- **Configuration Loading**: Monitored pairs automatically loaded from `app/bot/config/settings.json`
- **Error Handling**: Graceful error states on both frontend and backend with user-friendly messaging

## How to Use

1. Navigate to the Home page of the trading application
2. The Bot Status card displays automatically in the dashboard grid
3. View the status badge in the top-right corner (Running/Stopped/Paused/Error)
4. Monitor key metrics:
   - **Uptime**: How long the bot has been running
   - **Last Signal**: When the last trading signal was generated
   - **Signals Today**: Number of trading signals generated today
   - **Trades Today**: Number of trades executed today
5. View the active trading strategy name and description
6. See all monitored currency pairs with their timeframes
7. Status auto-refreshes every 30 seconds

## Configuration

The BotStatusTracker loads monitored pairs from the bot configuration:
- Primary path: `app/bot/config/settings.json`
- Pairs are extracted from the `pairs` object in the configuration

To update bot status programmatically, use the tracker methods:
```python
from core.bot_status import bot_status_tracker

# Set bot to running
bot_status_tracker.set_running("Strategy Name", "Strategy description")

# Record a signal
bot_status_tracker.record_signal("EUR/USD", "BUY")

# Record a trade
bot_status_tracker.record_trade()

# Set error state
bot_status_tracker.set_error("Connection lost")
```

## Testing

### Unit Tests
Run backend tests:
```bash
cd app/server && uv run pytest tests/test_bot_status_endpoint.py -v
```

### E2E Tests
Execute the bot status E2E test:
```bash
# Follow instructions in .claude/commands/e2e/test_bot_status.md
```

### Frontend Build Validation
```bash
cd app/client && npm run build
```

## Notes

- The tracker initializes with "stopped" status by default
- Daily counters (signals_today, trades_today) need a scheduled reset at midnight in production
- Future enhancement: WebSocket for real-time updates instead of polling
- Future enhancement: Historical status logs for debugging
- The pulse animation on the status badge uses Tailwind's `animate-ping` class
