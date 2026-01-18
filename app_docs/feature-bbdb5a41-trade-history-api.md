# Trade History API Implementation

**ADW ID:** bbdb5a41
**Date:** 2026-01-18
**Specification:** specs/issue-21-adw-bbdb5a41-sdlc_planner-implement-trade-history-api.md

## Overview

This feature implements proper trade history functionality by integrating with the FXOpen Web API's Trade History endpoint (POST /api/v2/tradehistory). The implementation replaces the placeholder "Order History" component with a fully functional "Trade History" component that displays real historical trade data including closed positions, filled orders, and transaction history.

## What Was Built

- **Backend Trade History API**: New `get_trade_history()` method in OpenFxApi class that calls FXOpen's POST /api/v2/tradehistory endpoint
- **Enhanced Trade History Endpoint**: Updated `/api/trades/history` endpoint to fetch and return real historical trade data with configurable date ranges
- **Component Rename**: Renamed OrderHistory.jsx to TradeHistory.jsx for consistent terminology alignment with trading industry standards
- **Data Model Updates**: Extended TradeHistoryItem model to include additional fields from FXOpen API (transaction type, reason, position details)
- **Error Handling**: Added timeout support and robust error handling for API requests
- **Comprehensive Testing**: Updated unit tests and created E2E test suite for trade history validation

## Technical Implementation

### Files Modified

- `app/server/core/openfx_api.py`: Added `get_trade_history()` method that calls POST /api/v2/tradehistory with timestamp parameters and returns WebApiTradeHistoryReport data; added timeout support (5s connect, 10s read) to all HTTP requests
- `app/server/server.py`: Updated `/api/trades/history` endpoint to accept optional timestamp_from/timestamp_to query parameters (defaults to last 30 days), fetch real data from FXOpen API, and transform response to TradeHistoryResponse model
- `app/server/core/data_models.py`: Extended TradeHistoryItem model with additional fields including transaction_type, transaction_reason, transaction_timestamp, position details, commission, and swap
- `app/client/src/components/TradeHistory.jsx`: Renamed from OrderHistory.jsx; updated component to display trade history with proper error handling, loading states, and retry functionality
- `app/client/src/pages/Account.jsx`: Updated import from OrderHistory to TradeHistory and replaced component usage
- `app/server/tests/test_trades_endpoints.py`: Added comprehensive test coverage for trade history endpoint including successful retrieval, empty responses, and error handling
- `.claude/commands/e2e/test_account_page_trade_history.md`: Created new E2E test specification for validating trade history functionality
- `app_docs/feature-bfd1a7d1-account-open-trades-order-history.md`: Updated references from "Order History" to "Trade History"

### Key Changes

- **FXOpen API Integration**: Implemented POST /api/v2/tradehistory API call with proper request body structure including TimestampFrom, TimestampTo, RequestDirection ("Forward"), RequestPageSize (1000), and SkipCancelOrder (false)
- **Timeout Configuration**: Added explicit timeout configuration (5s connect, 10s read) to all HTTP requests in OpenFxApi to prevent hanging connections
- **Data Transformation**: Transforms FXOpen WebApiTradeHistory records to TradeHistoryItem format, mapping fields like TradeId, Symbol, TradeSide, TradeAmount, TradePrice, PositionClosePrice, BalanceMovement, Commission, and Swap
- **Default Date Range**: Automatically defaults to last 30 days when timestamp parameters are not provided, preventing unnecessarily large API responses
- **Component Terminology**: Updated all references from "Order History" to "Trade History" to align with FXOpen API documentation and trading industry standards
- **Enhanced Error Handling**: Returns appropriate error messages and empty states when API calls fail or return no data

## How to Use

1. **Access Trade History**: Navigate to the Account page at http://localhost:3000/account
2. **View Historical Trades**: The "Trade History" section displays closed trades and transaction history from the last 30 days by default
3. **Custom Date Range (API)**: Send GET request to `/api/trades/history?timestamp_from={start_ms}&timestamp_to={end_ms}` to fetch specific date ranges (timestamps in milliseconds)
4. **Interpret Data**: Each trade record includes:
   - Instrument (trading symbol)
   - Side (Buy/Sell)
   - Amount (position size)
   - Entry and exit prices
   - Realized P&L (profit/loss)
   - Transaction details (type, reason, timestamp)
   - Commissions and swap fees

## Configuration

### API Endpoint
- **URL**: `/api/trades/history`
- **Method**: GET
- **Query Parameters**:
  - `timestamp_from` (optional): Start timestamp in milliseconds (Unix time)
  - `timestamp_to` (optional): End timestamp in milliseconds (Unix time)
- **Default Behavior**: Returns last 30 days of trade history when parameters are not specified

### FXOpen API Configuration
- **Endpoint**: POST /api/v2/tradehistory
- **Authentication**: HMAC-based (configured in OpenFxApi)
- **Request Parameters**:
  - `TimestampFrom`: Start timestamp (milliseconds)
  - `TimestampTo`: End timestamp (milliseconds)
  - `RequestPageSize`: Maximum records per request (1000)
  - `RequestDirection`: "Forward" pagination
  - `SkipCancelOrder`: false (include cancelled orders)
- **Timeout**: 5 seconds for connection, 10 seconds for read

## Testing

### Unit Tests
Run backend tests to validate trade history API integration:
```bash
cd app/server && uv run pytest
```

Key test scenarios:
- Successful trade history retrieval with real data
- Empty trade history response handling
- API failure and error handling
- Custom timestamp range queries
- Response structure validation against TradeHistoryResponse model

### E2E Tests
Execute the trade history E2E test:
```bash
# Read and execute the E2E test specification
.claude/commands/e2e/test_account_page_trade_history.md
```

Validates:
- "Trade History" terminology is displayed (not "Order History")
- Historical trade data is rendered correctly
- Empty state messages are appropriate when no data exists
- Styling consistency with UI style guide
- Component loads without errors

### Frontend Build
Validate frontend compilation:
```bash
cd app/client && npm run build
```

## Notes

### Terminology Clarification
In trading platforms, "Orders" and "Trades" are distinct concepts:
- **Orders**: Instructions to buy/sell (can be pending, cancelled, or executed)
- **Trades**: Executed transactions (filled orders that resulted in positions)

This implementation correctly uses "Trade History" terminology to match the FXOpen Web API documentation and trading industry standards.

### Implementation Considerations
- **Pagination**: Current implementation fetches first page only (RequestPageSize: 1000). Future enhancement could add pagination support for accounts with extensive trade history.
- **Performance**: Default 30-day date range balances data freshness with API response size. Adjust as needed based on user requirements.
- **Error Resilience**: Timeout configuration prevents hanging connections to FXOpen API; graceful fallbacks ensure the UI remains responsive even when API calls fail.
- **Data Mapping**: Transform layer maps FXOpen API response structure to frontend-compatible format, allowing flexibility to change either side independently.

### Backward Compatibility
- Backend endpoint path `/api/trades/history` remains unchanged
- Frontend component props interface remains unchanged
- Component export name changed from OrderHistory to TradeHistory (import statements updated accordingly)
- No breaking changes to existing functionality

### Related Documentation
- `ai_docs/FXOpen_Web_API_Documentation.md`: FXOpen API reference for /api/v2/tradehistory endpoint
- `ai_docs/ui_style_guide.md`: UI styling guidelines for component consistency
- `app_docs/feature-bfd1a7d1-account-open-trades-order-history.md`: Related Account page documentation
