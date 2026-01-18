# Navigation and Page Structure Refactor

**ADW ID:** bbcca085
**Date:** 2026-01-18
**Specification:** specs/issue-27-adw-bbcca085-sdlc_planner-navigation-refactor.md

## Overview

Comprehensive reorganization of the frontend user interface to align with the core trading workflow. The generic navigation labels "Home" and "Dashboard" have been replaced with workflow-oriented pages: "Monitor", "Strategy", and "Account". This creates a clearer mental model for users where Monitor shows what's happening right now, Strategy helps decide what to do, and Account shows how you're doing.

## Screenshots

### Monitor Page
![Monitor Page with Bot Status and Headlines](assets/01_monitor_page_navigation.png)

### Strategy Page
![Strategy Page with Chart and Technical Analysis](assets/02_strategy_page.png)

### Account Page
![Account Page with Summary Section](assets/03_account_page_with_summary.png)

## What Was Built

- **Monitor Page** (renamed from Home): Real-time monitoring of trading bot status and market headlines
- **Strategy Page** (renamed from Dashboard): Technical analysis, currency pairs, and chart analysis
- **Account Page Enhancement**: Added AccountSummary component to show account balance and metrics
- **Navigation Updates**: Updated navigation bar with new workflow-oriented labels
- **Route Structure**: New URL structure (`/monitor`, `/strategy`, `/account`) with redirect from root

## Technical Implementation

### Files Modified

- `app/client/src/App.jsx`: Updated routing configuration and added redirect from "/" to "/monitor"
- `app/client/src/components/NavigationBar.jsx`: Changed navigation labels from "Home/Dashboard" to "Monitor/Strategy"
- `app/client/src/pages/Monitor.jsx`: Renamed from Home.jsx, removed AccountSummary, kept BotStatus and Headlines
- `app/client/src/pages/Strategy.jsx`: Renamed from Dashboard.jsx, updated page title and descriptions
- `app/client/src/pages/Account.jsx`: Added AccountSummary component as first section

### Key Changes

- **Navigation Routes**: Implemented new route structure with backwards compatibility redirect
  - `/` → redirects to `/monitor`
  - `/monitor` → Monitor page (formerly Home)
  - `/strategy` → Strategy page (formerly Dashboard)
  - `/account` → Account page (enhanced with AccountSummary)

- **Component Reorganization**: Moved AccountSummary from Monitor page to Account page for better workflow separation

- **Page Renaming**: Files and components renamed to reflect their purpose
  - `Home.jsx` → `Monitor.jsx`
  - `Dashboard.jsx` → `Strategy.jsx`

- **UI Enhancements**: Updated page headers, descriptions, and hero sections to reflect the monitoring/strategy/account workflow model

## How to Use

### Navigating the Application

1. **Monitor Page** (`/monitor`): Start here to see real-time bot status and market news
   - View current bot status (running/stopped)
   - Check bot performance metrics
   - Read latest market headlines

2. **Strategy Page** (`/strategy`): Analyze markets and make trading decisions
   - Select currency pairs and timeframes
   - Load and analyze price charts with multiple chart types (candlestick, line, area, OHLC)
   - View technical indicators and analysis
   - Toggle volume display and adjust date ranges

3. **Account Page** (`/account`): Monitor account performance and trade history
   - View account summary with balance and metrics
   - Check open trades
   - Review trade history

### For Developers

- All old routes continue to work due to redirect from "/" to "/monitor"
- Navigation active states automatically highlight based on current route
- Mobile menu properly reflects the new navigation labels
- Component structure remains unchanged - only placement and naming changed

## Configuration

No configuration changes required. The refactor is purely frontend-based with no backend modifications needed.

## Testing

The implementation was validated with:
- Server tests: `cd app/server && uv run pytest` ✓
- Frontend build: `cd app/client && npm run build` ✓

### Manual Testing Checklist

- ✓ Clicking "Monitor" navigates to `/monitor`
- ✓ Clicking "Strategy" navigates to `/strategy`
- ✓ Clicking "Account" navigates to `/account`
- ✓ Accessing `/` redirects to `/monitor`
- ✓ Browser back/forward buttons work correctly
- ✓ Mobile menu navigation works properly
- ✓ Active route highlighting works
- ✓ All components render in their correct locations

## Notes

### Design Principles

This refactor follows a clear workflow-based mental model:
- **Monitor**: "What's happening right now?" (bot activity, news)
- **Strategy**: "What should I do?" (analysis, charts, decisions)
- **Account**: "How am I doing?" (balance, trades, history)

### Backwards Compatibility

A redirect from "/" to "/monitor" ensures existing bookmarks and links continue to work.

### No Backend Changes

This is purely a frontend refactor. All API endpoints and server-side code remain unchanged.

### UI Style Guide Compliance

All modified pages follow the established spacing standards:
- Main containers use `py-8 space-y-8` or `py-8 space-y-6`
- Cards use standard `.card` class with proper padding
- Grid layouts use responsive breakpoints with proper gap spacing
