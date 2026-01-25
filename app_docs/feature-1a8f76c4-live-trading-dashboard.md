# Live Trading Dashboard

**ADW ID:** 1a8f76c4
**Date:** 2026-01-25
**Specification:** specs/issue-139-adw-1a8f76c4-sdlc_planner-live-trading-dashboard.md

## Overview

The Monitor page has been transformed into a comprehensive Live Trading Dashboard that provides real-time visibility into all trading activity. The dashboard displays account summary metrics, active bot status, open positions, recent trades, and active alerts with automatic data refresh every 10 seconds, connection status indicators, responsive layout, and dark mode support.

## What Was Built

- **Account Metrics Card** - Real-time display of Balance, Equity, P/L, and Margin Level
- **Active Bots Grid** - Grid view of all configured trading bots with status indicators
- **Open Positions Table** - Live view of open trades with real-time P/L updates
- **Recent Trades Feed** - Activity feed of recently closed trades
- **Alerts Panel** - System alerts including connection issues, bot errors, and margin warnings
- **Connection Status Indicator** - Animated indicator showing connected/reconnecting/disconnected states
- **Dashboard Header** - Title, last updated timestamp, manual refresh button, and dark mode toggle
- **Auto-refresh System** - 10-second polling interval with coordinated data fetching
- **Dark Mode Support** - Toggle with localStorage persistence

## Technical Implementation

### Files Modified

- `app/client/src/pages/Monitor.jsx`: Transformed from basic monitor page to Live Trading Dashboard
- `app/client/src/styles/design-tokens.css`: Added dark mode token activations
- `app/client/src/index.css`: Added dark mode CSS custom properties
- `app/client/tailwind.config.js`: Added dark mode class configuration

### New Files Created

- `app/client/src/components/LiveDashboard/AccountMetrics.jsx`: Account summary metrics card component
- `app/client/src/components/LiveDashboard/ActiveBotsGrid.jsx`: Bot status grid with responsive layout
- `app/client/src/components/LiveDashboard/AlertsPanel.jsx`: Collapsible alerts panel with dismiss functionality
- `app/client/src/components/LiveDashboard/ConnectionStatus.jsx`: Animated connection status indicator
- `app/client/src/components/LiveDashboard/DashboardHeader.jsx`: Dashboard header with controls
- `app/client/src/components/LiveDashboard/OpenPositions.jsx`: Open positions table component
- `app/client/src/components/LiveDashboard/RecentTrades.jsx`: Recent trades activity feed
- `app/client/src/components/LiveDashboard/index.js`: Component barrel export file
- `app/client/src/hooks/useDashboardData.js`: Custom hook for coordinated data fetching with polling
- `app/client/src/hooks/useDarkMode.js`: Custom hook for dark mode toggle with localStorage persistence
- `.claude/commands/e2e/test_live_trading_dashboard.md`: E2E test specification

### Key Changes

- **Coordinated Data Fetching**: The `useDashboardData` hook fetches account, trades, history, and bot status in parallel with Promise.all, implementing 10-second polling with connection status tracking
- **Dark Mode Implementation**: The `useDarkMode` hook adds/removes `.dark` class on `document.documentElement` with localStorage persistence under the key 'theme'
- **Responsive Grid Layout**: Desktop uses 3-column grid (lg:grid-cols-3), tablet and mobile stack vertically
- **Connection Health Monitoring**: Tracks consecutive API failures (3+ failures = disconnected, 1-2 failures = reconnecting)
- **Alert Generation**: Automatically generates alerts for connection issues, bot errors, and low margin levels (<150%)

## How to Use

1. Navigate to the **Monitor** page from the navigation bar
2. The dashboard loads automatically and displays all sections:
   - Account metrics at the top (Balance, Equity, P/L, Margin Level)
   - Active bots grid and alerts panel on the left column
   - Open positions and recent trades on the right column
3. Data refreshes automatically every 10 seconds
4. Click the **Refresh** button (rotate icon) in the header for manual refresh
5. Click the **Sun/Moon** icon to toggle between light and dark modes
6. Monitor the **Connection Status** indicator (green=connected, yellow=reconnecting, red=disconnected)
7. View the **Last Updated** timestamp to see when data was last refreshed
8. Dismiss alerts by clicking the X button on each alert card

## Configuration

- **Polling Interval**: Default 10 seconds, configurable via `useDashboardData(pollInterval)` parameter
- **Dark Mode**: Persisted to localStorage with key `theme` (values: 'dark' or 'light')
- **Max Consecutive Errors**: 3 failures before marking as disconnected (configurable in `useDashboardData.js`)

## Testing

Run the E2E test to validate the dashboard functionality:

```bash
# Read and execute the E2E test specification
cat .claude/commands/e2e/test_live_trading_dashboard.md
```

Validate with other tests:
```bash
cd app/server && uv run pytest  # Server tests
cd app/client && npm run build   # Frontend build
```

## Notes

- The existing BotStatus and Headlines components are preserved in the dashboard layout for bot controls and market context
- Uses existing API endpoints (`/api/account`, `/api/trades/open`, `/api/trades/history`, `/api/bot/status`) - no new backend endpoints required
- Polling is used instead of WebSocket for consistency with existing codebase patterns
- Dark mode tokens are defined in `design-tokens.css` and activated via Tailwind's `dark:` prefix
- Future enhancement: WebSocket support for sub-second updates if trading volume increases
- Future enhancement: Customizable dashboard layout where users can rearrange sections
