# Feature: Live Trading Dashboard

## Metadata
issue_number: `139`
adw_id: `1a8f76c4`
issue_json: `{"number":139,"title":"Feature US-LM-001 View Live Trading Dashboard","body":"/feature\nadw_sdlc_iso\nmodel_set heavy\n\n\n\nLive Monitor\n Live Dashboard\n\nChange the current monitor page to\nI want to see a comprehensive dashboard of my live trading activity\nSo that I can monitor all my bots and positions at a glance\n\n\n Dashboard shows: Account summary, Active bots grid, Open positions, Recent trades, Active alerts\n Real-time updates (no manual refresh needed)\n Connection status indicator (connected/reconnecting/disconnected)\n Last data update timestamp\n Responsive layout adapts to screen size\n Dark mode support for extended monitoring\n"}`

## Feature Description
Transform the existing Monitor page into a comprehensive Live Trading Dashboard that provides real-time visibility into all trading activity. The dashboard will display account summary metrics, active bot status, open positions, recent trades, and active alerts in a unified view with automatic data refresh, connection status indicators, and responsive layout that adapts to different screen sizes while supporting dark mode for extended monitoring sessions.

## User Story
As a trader
I want to see a comprehensive dashboard of my live trading activity
So that I can monitor all my bots and positions at a glance

## Problem Statement
The current Monitor page only shows basic bot status and market headlines, requiring traders to navigate between multiple pages to get a complete view of their trading activity. Traders need a centralized dashboard that consolidates all live trading information with real-time updates, eliminating the need for manual refreshes and page switching during active trading sessions.

## Solution Statement
Redesign the Monitor page as a Live Trading Dashboard with the following sections:
1. **Account Summary Card** - Key account metrics (Balance, Equity, P/L, Margin) with real-time updates
2. **Active Bots Grid** - Grid view of all configured trading bots with status indicators
3. **Open Positions Table** - Live view of all open trades with P/L updates
4. **Recent Trades Feed** - Activity feed of recently closed trades
5. **Active Alerts Panel** - System alerts and notifications
6. **Connection Status Indicator** - Real-time connection health display
7. **Auto-refresh System** - Polling-based updates with configurable interval
8. **Dark Mode Support** - Theme toggle for extended monitoring

## Relevant Files
Use these files to implement the feature:

### Existing Files to Modify
- `app/client/src/pages/Monitor.jsx` - Main page component to be transformed into Live Trading Dashboard
- `app/client/src/app/api.js` - Add any new API endpoint functions if needed
- `app/client/src/styles/design-tokens.css` - Dark mode CSS variables are already defined, may need activation logic

### Existing Components to Reuse/Reference
- `app/client/src/components/BotStatus.jsx` - Reference for bot status card pattern, polling logic, toast notifications, and status indicators
- `app/client/src/components/AccountSummary.jsx` - Reference for account metrics display pattern
- `app/client/src/components/OpenTrades.jsx` - Reference for open positions table pattern
- `app/client/src/components/TradeHistory.jsx` - Reference for trade history table pattern
- `app/client/src/components/MetricCard.jsx` - Reusable metric card component for dashboard KPIs
- `app/client/src/components/NavigationBar.jsx` - Reference for market status indicator pattern

### Server Files
- `app/server/server.py` - Contains existing API endpoints: `/api/account`, `/api/trades/open`, `/api/trades/history`, `/api/bot/status`
- `app/server/core/bot_status.py` - BotStatusTracker class with status response structure

### Style/Utility Files
- `app/client/src/lib/utils.js` - `cn()` utility function for conditional classnames
- `app/client/src/styles/design-tokens.css` - Design system tokens including dark mode variables

### Documentation Files
- Read `.claude/commands/test_e2e.md` - E2E test runner documentation for creating E2E tests
- Read `.claude/commands/e2e/test_account_page.md` - Example E2E test file for reference

### New Files
- `app/client/src/components/LiveDashboard/AccountMetrics.jsx` - Account summary metrics card with real-time updates
- `app/client/src/components/LiveDashboard/ActiveBotsGrid.jsx` - Grid view of active trading bots
- `app/client/src/components/LiveDashboard/OpenPositions.jsx` - Live open positions table
- `app/client/src/components/LiveDashboard/RecentTrades.jsx` - Recent trades activity feed
- `app/client/src/components/LiveDashboard/AlertsPanel.jsx` - Active alerts display
- `app/client/src/components/LiveDashboard/ConnectionStatus.jsx` - Connection status indicator
- `app/client/src/components/LiveDashboard/DashboardHeader.jsx` - Dashboard header with refresh controls and last update timestamp
- `app/client/src/hooks/useDashboardData.js` - Custom hook for coordinated data fetching with polling
- `app/client/src/hooks/useDarkMode.js` - Custom hook for dark mode toggle with localStorage persistence
- `.claude/commands/e2e/test_live_trading_dashboard.md` - E2E test specification for the dashboard

## Implementation Plan

### Phase 1: Foundation
1. Create the data fetching infrastructure with a custom `useDashboardData` hook that coordinates polling for all dashboard data (account, trades, bot status) with a configurable refresh interval (default 10 seconds)
2. Create the `useDarkMode` hook for dark mode toggle with localStorage persistence
3. Create the `ConnectionStatus` component to display real-time connection health
4. Create the `DashboardHeader` component with page title, last update timestamp, manual refresh button, and dark mode toggle

### Phase 2: Core Implementation
1. Create the `AccountMetrics` component - compact card showing Balance, Equity, P/L, Margin Level with color-coded indicators
2. Create the `ActiveBotsGrid` component - grid layout showing each configured bot with status badge, uptime, and last signal
3. Create the `OpenPositions` component - streamlined table of active trades with real-time P/L
4. Create the `RecentTrades` component - activity feed showing last 5-10 closed trades
5. Create the `AlertsPanel` component - collapsible panel for system alerts and notifications

### Phase 3: Integration
1. Transform `Monitor.jsx` to use the new dashboard layout with responsive grid
2. Integrate all dashboard components with the `useDashboardData` hook
3. Implement dark mode support by activating the `.dark` class on the root element
4. Add responsive breakpoints for mobile, tablet, and desktop layouts
5. Ensure all components follow the Precision Swiss Design System patterns

## Step by Step Tasks

### Task 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand the E2E test format
- Read `.claude/commands/e2e/test_account_page.md` as a reference example
- Create `.claude/commands/e2e/test_live_trading_dashboard.md` with test steps for:
  - Navigate to Monitor page and verify it loads as Live Trading Dashboard
  - Verify Account Metrics section displays Balance, Equity, P/L, Margin
  - Verify Active Bots section shows bot status grid
  - Verify Open Positions table displays any active trades
  - Verify Recent Trades section shows recent activity
  - Verify Connection Status indicator is visible
  - Verify Last Updated timestamp is displayed
  - Verify Refresh button works and updates timestamp
  - Verify Dark Mode toggle works and applies dark theme
  - Verify responsive layout adapts at different viewport sizes

### Task 2: Create Data Fetching Hook
- Create `app/client/src/hooks/useDashboardData.js`
- Implement coordinated data fetching for:
  - Account data via `endPoints.account()`
  - Open trades via `endPoints.openTrades()`
  - Trade history via `endPoints.tradeHistory()`
  - Bot status via `endPoints.botStatus()`
- Implement polling with configurable interval (default 10 seconds)
- Track connection status (connected/reconnecting/disconnected)
- Track last successful update timestamp
- Provide manual refresh function
- Handle errors gracefully with retry logic

### Task 3: Create Dark Mode Hook
- Create `app/client/src/hooks/useDarkMode.js`
- Implement dark mode toggle that adds/removes `.dark` class on `document.documentElement`
- Persist preference to localStorage with key `theme`
- Initialize from localStorage on mount, defaulting to light mode
- Return `{ isDark, toggleDarkMode }` from the hook

### Task 4: Create Connection Status Component
- Create `app/client/src/components/LiveDashboard/ConnectionStatus.jsx`
- Display connection status with animated indicator:
  - Green pulsing dot for "connected"
  - Yellow pulsing dot for "reconnecting"
  - Red static dot for "disconnected"
- Show status label text
- Follow Precision Swiss Design System patterns

### Task 5: Create Dashboard Header Component
- Create `app/client/src/components/LiveDashboard/DashboardHeader.jsx`
- Include:
  - Page title "Live Trading Dashboard"
  - Subtitle "Real-time monitoring"
  - Last updated timestamp (e.g., "Updated 5s ago")
  - Manual refresh button with loading state
  - Dark mode toggle button (sun/moon icon)
  - Connection status indicator (using ConnectionStatus component)
- Follow existing page header pattern from Account.jsx
- Make responsive for mobile/desktop

### Task 6: Create Account Metrics Component
- Create `app/client/src/components/LiveDashboard/AccountMetrics.jsx`
- Display key metrics in a compact grid:
  - Balance (with dollar sign)
  - Equity (with dollar sign)
  - Unrealized P/L (green if positive, red if negative)
  - Margin Level (with percentage)
- Use MetricCard or similar styling pattern
- Show loading skeleton while data is fetching
- Show error state if data fails to load
- Use `tabular-nums` for numeric values

### Task 7: Create Active Bots Grid Component
- Create `app/client/src/components/LiveDashboard/ActiveBotsGrid.jsx`
- Display bots in a responsive grid layout (2-4 columns based on screen size)
- Each bot card shows:
  - Bot name/strategy
  - Status badge (running/stopped/error) with appropriate color
  - Uptime if running
  - Last signal time (relative)
  - Monitored pairs count
- Show "No active bots" empty state if no bots configured
- Reference BotStatus.jsx for status indicator patterns

### Task 8: Create Open Positions Component
- Create `app/client/src/components/LiveDashboard/OpenPositions.jsx`
- Display open trades in a compact table:
  - Instrument
  - Side (Buy/Sell with icon)
  - Amount
  - Entry Price
  - Current P/L (colored)
- Limit to showing 5 rows by default with "View All" link to Account page
- Show "No open positions" empty state with appropriate icon
- Reference OpenTrades.jsx for table patterns

### Task 9: Create Recent Trades Component
- Create `app/client/src/components/LiveDashboard/RecentTrades.jsx`
- Display last 5 closed trades as an activity feed:
  - Timestamp (relative, e.g., "2m ago")
  - Instrument and side
  - P/L result (colored)
- Show "No recent trades" empty state if history is empty
- Reference TradeHistory.jsx for data formatting

### Task 10: Create Alerts Panel Component
- Create `app/client/src/components/LiveDashboard/AlertsPanel.jsx`
- Display system alerts in a collapsible panel:
  - Alert icon (warning/info/error)
  - Alert message
  - Timestamp
  - Dismiss button
- Show alerts for:
  - Connection issues
  - Bot errors
  - Margin warnings (if margin level < 150%)
- Show "No active alerts" if no alerts
- Store dismissed alerts in state (not persisted)

### Task 11: Transform Monitor Page
- Refactor `app/client/src/pages/Monitor.jsx` to be the Live Trading Dashboard
- Use the `useDashboardData` hook for all data
- Use the `useDarkMode` hook for theme toggle
- Implement responsive grid layout:
  - Desktop: 4-column grid with account metrics spanning full width, bots/positions/trades in columns
  - Tablet: 2-column grid
  - Mobile: Single column stack
- Add DashboardHeader component
- Add AccountMetrics component (full width)
- Add row with ActiveBotsGrid and AlertsPanel
- Add row with OpenPositions and RecentTrades
- Apply dark mode class to root container when active
- Ensure all existing functionality (BotStatus, Headlines) is preserved or enhanced

### Task 12: Add Dark Mode Styling
- Verify dark mode tokens in `design-tokens.css` are complete
- Add dark mode variant classes to new components using Tailwind `dark:` prefix
- Ensure all colors have appropriate dark mode variants:
  - Background: neutral-900
  - Surface/cards: neutral-800
  - Text: neutral-50 (primary), neutral-400 (secondary)
  - Borders: neutral-700
- Test dark mode toggle works correctly

### Task 13: Run Validation
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_live_trading_dashboard.md` to validate the feature
- Run `cd app/server && uv run pytest` to ensure no server regressions
- Run `cd app/client && npm run build` to ensure frontend builds successfully

## Testing Strategy

### Unit Tests
- Test `useDashboardData` hook:
  - Verify data fetching on mount
  - Verify polling interval works correctly
  - Verify manual refresh function
  - Verify connection status tracking
  - Verify error handling
- Test `useDarkMode` hook:
  - Verify toggle functionality
  - Verify localStorage persistence
  - Verify initial state from localStorage

### Edge Cases
- Connection loss during polling (should show "reconnecting" status)
- API returns empty data (should show appropriate empty states)
- API returns error (should show error states with retry)
- Multiple rapid refresh clicks (should debounce)
- Very long uptime values (should format correctly)
- Large number of open positions (should handle pagination/limiting)
- Dark mode toggle during data refresh (should maintain state)
- Mobile viewport with many open positions (should scroll horizontally)

## Acceptance Criteria
- [ ] Monitor page displays as "Live Trading Dashboard" with new title
- [ ] Account summary section shows Balance, Equity, P/L, and Margin Level
- [ ] Active Bots grid displays all configured bots with status indicators
- [ ] Open Positions section shows current open trades with live P/L
- [ ] Recent Trades section shows last 5 closed trades
- [ ] Alerts panel displays any active system alerts
- [ ] Data refreshes automatically every 10 seconds without manual action
- [ ] Connection status indicator shows connected/reconnecting/disconnected states
- [ ] Last updated timestamp displays and updates with each refresh
- [ ] Manual refresh button triggers immediate data refresh
- [ ] Dark mode toggle switches between light and dark themes
- [ ] Dark mode preference persists across page reloads
- [ ] Layout is responsive across mobile, tablet, and desktop
- [ ] All loading states show appropriate skeleton loaders
- [ ] All error states show appropriate error messages with retry option
- [ ] Empty states display appropriate messaging

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_live_trading_dashboard.md` to validate the Live Trading Dashboard functionality works as expected
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- The existing API endpoints (`/api/account`, `/api/trades/open`, `/api/trades/history`, `/api/bot/status`) are sufficient for this feature - no new backend endpoints are needed
- Polling is preferred over WebSocket for this implementation as the existing codebase uses polling patterns consistently (BotStatus uses 30s, we'll use 10s for the dashboard)
- Dark mode tokens are already defined in `design-tokens.css` but need activation logic via the useDarkMode hook
- The Headlines component can be retained as an optional section or moved to a separate area to maintain market context
- Consider future enhancement: Add WebSocket support for sub-second updates if trading volume increases
- Consider future enhancement: Add customizable dashboard layout where users can rearrange sections
