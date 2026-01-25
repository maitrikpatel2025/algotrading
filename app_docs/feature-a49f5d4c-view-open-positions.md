# View Open Positions with Real-Time P/L

**ADW ID:** a49f5d4c
**Date:** 2026-01-25
**Specification:** specs/issue-145-adw-a49f5d4c-sdlc_planner-view-open-positions.md

## Overview

Enhanced Open Positions display on both the Live Trading Dashboard (Monitor page) and Account page with comprehensive real-time position monitoring. The feature includes additional columns (Current Price, P/L in pips, Duration, Bot Name), sortable columns, a total P/L summary row, click-to-view-on-chart functionality, and a manual close position button with confirmation dialog.

## What Was Built

- **Extended position data model** with current price, P/L in pips, duration, open time, and bot name fields
- **Enhanced `/api/trades/open` endpoint** that fetches current market prices and calculates P/L in pips
- **New `POST /api/trades/{trade_id}/close` endpoint** for manual position closing
- **Sortable table columns** in OpenTrades component with ascending/descending sort indicators
- **Total P/L summary row** showing aggregate P/L in dollars and pips
- **Position Close Dialog** with confirmation, loading state, and error handling
- **Click-to-chart navigation** from position rows to Strategy page with entry price highlight
- **Color-coded P/L values** (green for profit, red for loss)

## Technical Implementation

### Files Modified

- `app/server/core/data_models.py`: Added new fields to TradeInfo model (current_price, pips_pl, open_time, duration_seconds, bot_name) and CloseTradeResponse model
- `app/server/server.py`: Enhanced `/api/trades/open` to fetch current prices and calculate pips P/L; added `/api/trades/{trade_id}/close` endpoint
- `app/server/models/open_trade.py`: Extended OpenTrade model with open_time, comment, and side fields
- `app/client/src/components/OpenTrades.jsx`: Added sortable columns, summary row, close button, and chart navigation
- `app/client/src/components/PositionCloseDialog.jsx`: New confirmation dialog component
- `app/client/src/components/LiveDashboard/OpenPositions.jsx`: Added Current Price, P/L (pips) columns, and row click handler
- `app/client/src/app/api.js`: Added `closeTrade(tradeId)` API method
- `app/client/src/pages/Account.jsx`: Updated to pass `onTradeClose` handler to OpenTrades
- `app/client/src/pages/Strategy.jsx`: Added handling for incoming position data from navigation state

### Key Changes

- **P/L in pips calculation**: Automatically detects JPY pairs (pip at 0.01) vs standard pairs (pip at 0.0001) for accurate pip calculations
- **Duration tracking**: Computes duration in seconds from open_time, formatted as "< 1m", "Xh Ym", or "Xd Yh"
- **Current price determination**: Uses bid price for long positions (sell to close) and ask price for short positions (buy to close)
- **Sortable columns**: Implemented sort state management with visual indicators (ArrowUp/ArrowDown/ArrowUpDown icons)
- **Chart navigation**: Routes to Strategy page with selectedPair, highlightPrice, and position data in navigation state

## How to Use

1. **View Open Positions**: Navigate to the Monitor page to see the top 5 positions, or the Account page for the full list
2. **Sort positions**: Click any column header to sort ascending; click again for descending
3. **View total P/L**: Check the summary row at the bottom showing aggregate P/L in dollars and pips
4. **View on chart**: Click any position row to navigate to the Strategy page with that pair's chart
5. **Close a position**: Click the X button on any row to open the confirmation dialog, then confirm to close

## Configuration

No additional configuration required. The feature uses the existing:
- 10-second polling interval from `useDashboardData.js` hook for real-time updates
- FXOpen API integration for current prices and trade closing

## Testing

- Backend tests: `cd app/server && uv run pytest tests/test_trades_endpoints.py`
- Frontend build validation: `cd app/client && npm run build`
- E2E test specification: `.claude/commands/e2e/test_view_open_positions.md`

## Notes

- Bot name is extracted from trade comment field if available; otherwise displays "Manual"
- P/L colors: green (`text-success`) for profit, red (`text-destructive`) for loss
- Close trade functionality calls FXOpen API and handles broker rejection gracefully
- Position close dialog prevents accidental closes with a confirmation step and displays position details
