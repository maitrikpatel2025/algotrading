# WebSocket TradingView Real-Time Chart

**ADW ID:** 72441440
**Date:** 2026-01-21
**Specification:** specs/issue-86-adw-72441440-sdlc_planner-websocket-tradingview-realtime-chart.md

## Overview

Replaced the legacy Plotly.js-based static chart with TradingView Lightweight Charts and implemented real-time price data streaming via WebSocket from the FX Open API. Users now see live price updates on the chart as ticks arrive, with automatic candle aggregation based on selected timeframes and robust auto-reconnection capabilities.

## What Was Built

- **Backend WebSocket Manager** (`app/server/core/websocket_manager.py`) - Manages WebSocket connections to FX Open API with authentication, subscription management, and auto-reconnect logic
- **Backend Candle Aggregator** (`app/server/core/candle_aggregator.py`) - Aggregates real-time ticks into OHLC candles for various timeframes (M1, M5, M15, M30, H1, H4, D)
- **Frontend WebSocket Hook** (`app/client/src/hooks/useWebSocket.js`) - React hook for managing WebSocket connections with connection state tracking and exponential backoff reconnection
- **Frontend Candle Aggregator Hook** (`app/client/src/hooks/useCandleAggregator.js`) - React hook for aggregating real-time ticks into candles on the client side
- **TradingView Chart Integration** (`app/client/src/app/tradingViewChart.js`) - Helper functions for creating and managing TradingView Lightweight Charts
- **Rewritten PriceChart Component** (`app/client/src/components/PriceChart.jsx`) - Completely refactored to use TradingView Lightweight Charts instead of Plotly.js, with WebSocket integration for real-time updates
- **WebSocket Server Endpoint** (`app/server/server.py`) - FastAPI WebSocket endpoint at `/ws/prices/{pair}/{granularity}` for streaming real-time price data
- **E2E Test Specification** (`.claude/commands/e2e/test_websocket_realtime_chart.md`) - End-to-end test for validating real-time WebSocket chart functionality

## Technical Implementation

### Files Modified

- `app/server/server.py`: Added WebSocket endpoint `/ws/prices/{pair}/{granularity}` for streaming real-time price updates to frontend clients
- `app/server/core/openfx_api.py`: Refactored to support WebSocket-based tick data retrieval from FX Open API
- `app/server/core/data_models.py`: Added data models for candle aggregation and WebSocket message formats
- `app/server/core/constants.py`: Added WebSocket-related constants (timeframe mappings, connection settings)
- `app/server/core/strategy_service.py`: Updated to support WebSocket-based price streaming
- `app/server/api/routes.py`: Added API routes for WebSocket status and connection health checks
- `app/server/config/settings.py`: Added WebSocket configuration settings
- `app/client/package.json`: Removed `plotly.js-dist` dependency, added `lightweight-charts` library
- `app/client/src/components/PriceChart.jsx`: Complete rewrite (~1096 lines changed) to use TradingView Lightweight Charts with WebSocket integration
- `app/client/src/pages/Strategy.jsx`: Updated to manage WebSocket connection lifecycle and display connection status
- `README.md`: Updated technology stack to reflect TradingView Lightweight Charts instead of Plotly.js

### New Files Created

- `app/server/core/websocket_manager.py` (345 lines): WebSocket connection manager with authentication, subscription management, auto-reconnect with exponential backoff
- `app/server/core/candle_aggregator.py` (261 lines): Tick-to-candle aggregation engine for various timeframes
- `app/client/src/hooks/useWebSocket.js` (274 lines): React hook for WebSocket connection management with automatic reconnection
- `app/client/src/hooks/useCandleAggregator.js` (149 lines): React hook for client-side candle aggregation
- `app/client/src/app/tradingViewChart.js` (323 lines): TradingView Lightweight Charts configuration and helper functions
- `.claude/commands/e2e/test_websocket_realtime_chart.md` (90 lines): E2E test specification

### Key Changes

- **Real-Time Data Streaming**: Implemented full-duplex WebSocket communication between frontend and backend for live tick updates, replacing the previous polling-based approach
- **Candle Aggregation**: Built time-based candle aggregation system that transforms raw ticks into OHLC candles on the backend, with client-side updates for current (incomplete) candles
- **Chart Library Migration**: Replaced Plotly.js (~3MB bundle) with TradingView Lightweight Charts (~200KB), significantly reducing bundle size and improving performance for financial charting
- **Auto-Reconnection**: Implemented exponential backoff reconnection strategy (max 10 retries, backoff up to 30 seconds) to handle network interruptions gracefully
- **Connection Status UI**: Added visual connection status indicator with states: connected (green), disconnected (red), reconnecting (yellow), error (orange)

## How to Use

### Viewing Real-Time Charts

1. Navigate to the Strategy Builder page in the application
2. Select a currency pair (e.g., EUR/USD) from the pair selector
3. Select a timeframe (e.g., M5 for 5-minute candles) from the granularity selector
4. The chart will automatically:
   - Load historical data via REST API
   - Establish WebSocket connection to backend
   - Begin receiving real-time tick updates
   - Display connection status in the top-right corner

### Connection Status Indicators

- **🟢 Connected** (green): WebSocket is connected and receiving real-time data
- **🔴 Disconnected** (red): WebSocket is disconnected, no real-time updates
- **🟡 Reconnecting** (yellow): WebSocket is attempting to reconnect
- **🟠 Error** (orange): WebSocket encountered an error

### Real-Time Updates

- **Current Candle**: The most recent candle updates in real-time as ticks arrive, showing live price movements
- **Completed Candles**: Once a candle timeframe completes (e.g., M5 candle closes after 5 minutes), it becomes static and a new current candle begins
- **Volume Data**: Volume aggregates in real-time and displays as histogram bars below the price chart

### Changing Pairs or Timeframes

- When you change the currency pair or timeframe:
  - The WebSocket disconnects from the previous subscription
  - New historical data loads via REST API
  - WebSocket reconnects with the new pair/timeframe configuration
  - Real-time updates resume for the new selection

## Configuration

### Backend WebSocket Settings

Configuration is managed in `app/server/config/settings.py`:

```python
# WebSocket connection settings
WEBSOCKET_CONNECT_TIMEOUT = 30  # seconds
WEBSOCKET_PING_INTERVAL = 20    # seconds
WEBSOCKET_MAX_RETRIES = 10
WEBSOCKET_BACKOFF_BASE = 2      # exponential backoff base
```

### Frontend WebSocket Settings

Configuration is defined in `app/client/src/hooks/useWebSocket.js`:

```javascript
const INITIAL_BACKOFF = 1000;   // 1 second
const MAX_BACKOFF = 30000;       // 30 seconds
const MAX_RETRIES = 10;
```

### Supported Timeframes

The following timeframes are supported for candle aggregation:

- **M1**: 1-minute candles
- **M5**: 5-minute candles
- **M15**: 15-minute candles
- **M30**: 30-minute candles
- **H1**: 1-hour candles
- **H4**: 4-hour candles
- **D**: Daily candles

## Testing

### Unit Tests

Backend tests are located in:
- `app/server/tests/core/test_data_models.py` - Updated for candle aggregation data models
- `app/server/tests/core/test_openfx_api.py` - Updated for WebSocket-based API interactions
- `app/server/tests/core/test_strategy_service.py` - Updated for WebSocket price streaming

Run backend tests:
```bash
cd app/server && uv run pytest
```

### E2E Tests

End-to-end test specification: `.claude/commands/e2e/test_websocket_realtime_chart.md`

Run E2E test:
```bash
# Read the E2E test command documentation
cat .claude/commands/test_e2e.md

# Execute the WebSocket real-time chart test
# Follow instructions in test_e2e.md to run the test
```

### Manual Testing

1. Start the backend server: `cd app/server && uv run uvicorn server:app --reload`
2. Start the frontend: `cd app/client && npm start`
3. Navigate to Strategy Builder page
4. Select EUR/USD and M5 timeframe
5. Verify:
   - Chart loads with historical data
   - Connection status shows "Connected"
   - Current candle updates in real-time
   - Completed candles remain static
   - Disconnect network and verify auto-reconnect

## Notes

### Architecture Decisions

- **Backend WebSocket Proxy**: Chose to proxy WebSocket connections through the backend rather than direct client connections to handle FX Open API authentication and connection management centrally
- **Candle Aggregation Location**: Implemented aggregation on the backend to reduce network traffic and ensure consistent candle calculations across clients
- **Chart Library Selection**: TradingView Lightweight Charts was selected over Plotly.js for its lighter bundle size (~200KB vs ~3MB), superior performance for real-time financial data, and built-in candlestick chart optimizations

### Performance Optimizations

- Chart updates are batched if multiple ticks arrive within 100ms window to prevent excessive re-renders
- Historical data is loaded once via REST API, then merged seamlessly with real-time WebSocket data
- TradingView Lightweight Charts uses hardware-accelerated canvas rendering for smooth 60fps updates

### Limitations

- **Drawing Tools**: TradingView Lightweight Charts has limited native support for advanced drawing tools compared to Plotly.js. Horizontal lines are implemented using `createPriceLine()`, but trendlines and Fibonacci retracements may require custom canvas overlays
- **Max Reconnection Attempts**: After 10 failed reconnection attempts, the system stops retrying. Users must manually refresh the page to re-establish connection
- **Time Zone**: All timestamps are in UTC. Ensure server and client clocks are synchronized for accurate candle boundaries

### Future Enhancements

- Add user preference toggle to switch between "real-time mode" and "historical mode"
- Implement chart replay feature to visualize historical tick data at accelerated speed for backtesting
- Add connection pooling to support multiple clients subscribing to the same currency pair with a single backend WebSocket
- Implement WebSocket message compression to reduce bandwidth usage
- Add candle snapshot persistence to restore in-progress candles after reconnection

### Migration from Plotly.js

The following Plotly.js features were migrated to TradingView Lightweight Charts equivalents:

- **Candlestick Charts**: `Plotly.newPlot()` → `createChart()` + `addCandlestickSeries()`
- **Volume Histogram**: Plotly bar chart → TradingView histogram series
- **Indicators**: Plotly scatter/line traces → TradingView line series
- **Zoom/Pan**: Plotly relayout events → TradingView time scale API
- **Crosshair**: Plotly hovermode → TradingView crosshair built-in

All Plotly.js dependencies have been completely removed from the codebase.
