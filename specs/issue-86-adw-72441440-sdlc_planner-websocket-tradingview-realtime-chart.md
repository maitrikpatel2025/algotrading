# Feature: WebSocket TradingView Lightweight Chart

## Metadata
issue_number: `86`
adw_id: `72441440`
issue_json: `{"number":86,"title":"Feature WebSocket  TradingView Lightweight Chart","body":"/feature\n\nadw_sdlc_iso.py\n\nI want to see real-time price data from FX Open streamed via WebSocket and displayed on TradingView Lightweight Charts,\nSo that I can monitor live market prices and make quick trading decisions.\n\n\nWebSocket connects and logs in to FX Open API \n Price subscriptions work for configured symbols\n TradingView Lightweight Chart displays and updates\n Candles aggregate correctly from ticks\n Auto-reconnect works when connection drops\n Plotly.js removed from the project\n\nRest of the functionality same if you are changing anything you want. Make sure to follow the style guide. You are basically style guide MD."}`

## Feature Description
This feature replaces the existing Plotly.js-based chart with TradingView Lightweight Charts and implements real-time price data streaming via WebSocket from the FX Open API. Users will see live price updates on the chart as ticks arrive from the WebSocket connection, with automatic candle aggregation based on the selected timeframe. The system will maintain a persistent WebSocket connection with automatic reconnection capabilities to ensure continuous data flow.

## User Story
As a trader
I want to see real-time price data from FX Open streamed via WebSocket and displayed on TradingView Lightweight Charts
So that I can monitor live market prices and make quick trading decisions

## Problem Statement
The current implementation uses Plotly.js for static historical chart visualization with manual data refresh. This approach does not provide real-time updates and requires users to manually reload data to see the latest prices. Traders need to see live price movements as they happen to make timely trading decisions. Additionally, Plotly.js adds significant bundle size and the current architecture doesn't support streaming data updates.

## Solution Statement
We will implement a WebSocket client that connects to the FX Open API to receive real-time tick data. The backend will manage the WebSocket connection, authenticate with the API, subscribe to configured currency pairs, and stream updates to the frontend via Server-Sent Events (SSE) or WebSocket. The frontend will replace Plotly.js with TradingView Lightweight Charts, which is optimized for financial data visualization and real-time updates. The system will aggregate incoming ticks into candles based on the selected timeframe and update the chart smoothly without full reloads. Auto-reconnect logic will ensure the connection recovers from network interruptions.

## Relevant Files
Use these files to implement the feature:

- `app/server/server.py` - Main FastAPI server, add WebSocket endpoint for real-time price streaming
- `app/server/core/openfx_api.py` - OpenFX API client, add WebSocket connection and authentication methods
- `app/server/requirements.txt` or `app/server/pyproject.toml` - Add WebSocket libraries (websockets, python-socketio)
- `app/client/package.json` - Remove plotly.js-dist, add lightweight-charts library
- `app/client/src/components/PriceChart.jsx` - Complete rewrite to use TradingView Lightweight Charts instead of Plotly
- `app/client/src/app/chart.js` - Refactor or replace chart rendering logic for Lightweight Charts
- `app/client/src/app/chartConstants.js` - Update constants for TradingView Lightweight Charts configuration
- `app/client/src/pages/Strategy.jsx` - Update to handle real-time data streams and candle aggregation state
- `app/client/src/app/api.js` - Add API methods for WebSocket connection management
- `README.md` - Update technology stack to reflect TradingView Lightweight Charts instead of Plotly.js
- `.claude/commands/conditional_docs.md` - Update documentation references to reflect new charting library

### New Files

- `app/server/core/websocket_manager.py` - WebSocket connection manager for FX Open API with authentication, subscription, and reconnection logic
- `app/server/core/candle_aggregator.py` - Tick-to-candle aggregation engine for various timeframes (M1, M5, M15, M30, H1, H4, D)
- `app/client/src/hooks/useWebSocket.js` - React hook for managing WebSocket connections with automatic reconnection
- `app/client/src/hooks/useCandleAggregator.js` - React hook for aggregating real-time ticks into candles on the client side
- `app/client/src/app/tradingViewChart.js` - TradingView Lightweight Charts configuration and helper functions
- `.claude/commands/e2e/test_websocket_realtime_chart.md` - E2E test specification for validating real-time WebSocket chart updates

## Implementation Plan
### Phase 1: Foundation
1. **Research and Setup**
   - Read TradingView Lightweight Charts documentation to understand API and best practices
   - Read FX Open WebSocket API documentation to understand authentication flow and message format
   - Determine optimal architecture: backend WebSocket proxy vs direct client WebSocket connection
   - Decision: Use backend WebSocket proxy to handle authentication and connection management

2. **Backend Infrastructure**
   - Install WebSocket library (`websockets` or `python-socketio`) via `uv add`
   - Create `websocket_manager.py` for FX Open WebSocket connection management
   - Create `candle_aggregator.py` for tick-to-candle aggregation logic
   - Implement authentication flow for FX Open WebSocket API
   - Implement subscription management for currency pairs
   - Implement auto-reconnect logic with exponential backoff

3. **Frontend Infrastructure**
   - Remove `plotly.js-dist` from package.json
   - Add `lightweight-charts` to package.json via `npm install`
   - Create `useWebSocket.js` hook for managing WebSocket connections
   - Create `useCandleAggregator.js` hook for client-side candle aggregation
   - Create `tradingViewChart.js` with TradingView Lightweight Charts configuration

### Phase 2: Core Implementation
1. **WebSocket Backend Implementation**
   - Implement WebSocket connection to FX Open API in `websocket_manager.py`
   - Implement login and authentication with API credentials
   - Implement price subscription for configured symbols
   - Implement tick data parsing and forwarding
   - Implement candle aggregation for M1, M5, M15, M30, H1, H4, D timeframes
   - Add WebSocket endpoint in `server.py` to stream data to frontend
   - Implement connection state management and error handling

2. **Frontend Chart Replacement**
   - Completely rewrite `PriceChart.jsx` to use TradingView Lightweight Charts
   - Remove all Plotly.js references and imports
   - Implement chart initialization with candlestick series
   - Implement volume display as histogram series
   - Implement real-time candle updates on tick arrival
   - Maintain existing features: indicators overlay, patterns, drawings, zoom/pan
   - Implement smooth chart updates without flicker

3. **Candle Aggregation Logic**
   - Implement time-based candle aggregation in `candle_aggregator.py`
   - Handle candle open/close logic based on timeframe
   - Handle OHLC calculation from incoming ticks
   - Implement candle completion detection
   - Support all existing timeframes (M1, M5, M15, M30, H1, H4, D, W1)
   - Persist partial candle state for reconnection scenarios

### Phase 3: Integration
1. **State Management and Data Flow**
   - Update `Strategy.jsx` to manage WebSocket connection lifecycle
   - Implement connection state UI indicators (connected/disconnected/reconnecting)
   - Merge real-time data with historical data seamlessly
   - Implement data persistence during timeframe or pair changes
   - Handle edge cases: connection loss, duplicate data, out-of-order ticks

2. **Indicator and Drawing Integration**
   - Migrate indicator rendering from Plotly to TradingView Lightweight Charts
   - Implement indicator overlay on price series (SMA, EMA, Bollinger Bands)
   - Implement separate panes for oscillators (RSI, MACD)
   - Migrate drawing tools (horizontal lines, trendlines, fibonacci) to TradingView format
   - Update `chart.js` or replace with `tradingViewChart.js` for all chart operations

3. **Auto-Reconnect and Error Handling**
   - Implement exponential backoff for WebSocket reconnection
   - Display connection status to user (badge or notification)
   - Handle authentication failures gracefully
   - Implement fallback to REST API if WebSocket unavailable
   - Log WebSocket events for debugging

4. **Documentation and Cleanup**
   - Update `README.md` to reflect TradingView Lightweight Charts in tech stack
   - Remove all Plotly.js references from documentation
   - Update `.claude/commands/conditional_docs.md` with new chart documentation references
   - Document WebSocket endpoint and message format
   - Document candle aggregation algorithm

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_trading_dashboard.md` and `.claude/commands/e2e/test_market_headlines.md` as examples
- Create `.claude/commands/e2e/test_websocket_realtime_chart.md` with detailed steps to:
  - Navigate to Strategy page
  - Select a currency pair and timeframe
  - Verify initial historical chart loads
  - Verify WebSocket connection establishes (check connection indicator)
  - Wait for real-time tick updates (observe chart updating)
  - Verify candle aggregation works correctly
  - Simulate connection drop and verify auto-reconnect
  - Take screenshots at each validation step

### 2. Backend WebSocket Infrastructure Setup
- Install WebSocket library: `cd app/server && uv add websockets`
- Create `app/server/core/websocket_manager.py`:
  - Implement `WebSocketManager` class with connection lifecycle methods
  - Implement `connect()` method to establish WebSocket connection to FX Open API
  - Implement `authenticate()` method to login with API credentials
  - Implement `subscribe(symbol)` method to subscribe to price updates
  - Implement `unsubscribe(symbol)` method to unsubscribe from price updates
  - Implement `disconnect()` method to close WebSocket gracefully
  - Implement auto-reconnect with exponential backoff (max retries: 10, backoff: 2^n seconds)
  - Implement message parsing and tick data extraction
  - Add comprehensive logging for debugging
  - Add unit tests in `app/server/tests/test_websocket_manager.py`

### 3. Backend Candle Aggregation Engine
- Create `app/server/core/candle_aggregator.py`:
  - Implement `CandleAggregator` class with timeframe-based aggregation
  - Implement `add_tick(timestamp, price, volume)` method to process incoming ticks
  - Implement `get_current_candle()` method to retrieve in-progress candle
  - Implement `get_completed_candles()` method to retrieve finished candles
  - Implement candle completion logic based on timeframe boundaries (M1, M5, M15, M30, H1, H4, D)
  - Implement OHLC calculation: Open (first tick), High (max), Low (min), Close (last tick)
  - Implement volume aggregation
  - Handle edge cases: first tick, candle rollover, missing timestamps
  - Add unit tests in `app/server/tests/test_candle_aggregator.py`

### 4. Backend WebSocket Endpoint
- Update `app/server/server.py`:
  - Add WebSocket endpoint: `/ws/prices/{pair}/{granularity}`
  - Implement WebSocket handler to stream real-time price updates
  - Initialize `WebSocketManager` on connection
  - Initialize `CandleAggregator` with selected granularity
  - Subscribe to FX Open WebSocket for the selected pair
  - Stream aggregated candles and ticks to frontend via WebSocket
  - Handle client disconnection and cleanup
  - Add error handling and logging
  - Add health check endpoint: `/api/websocket/status` to report connection state

### 5. Frontend Library Migration
- Update `app/client/package.json`:
  - Remove `plotly.js-dist` dependency
  - Add `lightweight-charts` dependency via `npm install lightweight-charts`
- Run `cd app/client && npm install` to install new dependency
- Verify build succeeds: `cd app/client && npm run build`

### 6. Frontend WebSocket Hook
- Create `app/client/src/hooks/useWebSocket.js`:
  - Implement `useWebSocket(url, options)` hook
  - Manage WebSocket connection state (connecting, connected, disconnected, error)
  - Implement auto-reconnect with exponential backoff
  - Emit events for: `onOpen`, `onMessage`, `onClose`, `onError`
  - Implement `send(data)` method to send messages to server
  - Implement `disconnect()` method to close connection
  - Return connection state and methods

### 7. Frontend Candle Aggregation Hook
- Create `app/client/src/hooks/useCandleAggregator.js`:
  - Implement `useCandleAggregator(timeframe)` hook
  - Maintain candle buffer state (historical + real-time candles)
  - Implement `addTick(tick)` method to process incoming ticks
  - Implement `addCandle(candle)` method to add completed candles
  - Implement `updateCurrentCandle(tick)` method to update in-progress candle
  - Return candle buffer and update methods

### 8. TradingView Chart Configuration
- Create `app/client/src/app/tradingViewChart.js`:
  - Implement `createChart(container, options)` function to initialize TradingView chart
  - Implement `addCandlestickSeries(chart, data)` function to create candlestick series
  - Implement `addVolumeSeries(chart, data)` function to create volume histogram
  - Implement `updateCandlestickSeries(series, candles)` function to update chart data
  - Implement `addIndicatorSeries(chart, indicator, data)` function to overlay indicators
  - Implement default chart options (theme, grid, crosshair, time scale)
  - Implement color schemes for bullish/bearish candles
  - Export chart management functions

### 9. Rewrite PriceChart Component
- Completely rewrite `app/client/src/components/PriceChart.jsx`:
  - Remove all Plotly.js imports and references
  - Import TradingView Lightweight Charts: `import { createChart } from 'lightweight-charts'`
  - Import `useWebSocket` and `useCandleAggregator` hooks
  - Initialize TradingView chart in `useEffect` with container ref
  - Create candlestick series and volume series
  - Connect to WebSocket endpoint: `ws://localhost:8000/ws/prices/{pair}/{granularity}`
  - Process incoming tick messages and update candles via `useCandleAggregator`
  - Update chart series when candle buffer changes
  - Implement connection status indicator (badge: connected/disconnected/reconnecting)
  - Maintain existing props: `selectedPair`, `selectedGranularity`, `activeIndicators`, `drawings`
  - Preserve drag-and-drop functionality for indicators
  - Preserve keyboard navigation (zoom, pan)
  - Add cleanup on unmount: disconnect WebSocket, destroy chart

### 10. Migrate Indicator Rendering
- Update indicator rendering in `PriceChart.jsx`:
  - Implement indicator overlay using TradingView `addLineSeries()` for line-based indicators (SMA, EMA, Bollinger Bands)
  - Implement separate panes using `createPane()` for oscillators (RSI, MACD)
  - Update indicator color and line style rendering
  - Update indicator calculation triggers to work with real-time data
  - Ensure indicators update smoothly as new candles arrive
  - Maintain indicator settings dialog functionality

### 11. Migrate Drawing Tools
- Update drawing tools rendering:
  - Implement horizontal line drawing using TradingView `createPriceLine()`
  - Implement trendline drawing using TradingView line series
  - Implement Fibonacci retracement using multiple price lines
  - Update drawing persistence and state management
  - Update drawing interaction handlers (click, drag, delete)
  - Ensure drawings remain visible during real-time updates

### 12. Update Strategy Page State Management
- Update `app/client/src/pages/Strategy.jsx`:
  - Add WebSocket connection state management
  - Add connection status UI indicator (badge in top-right corner)
  - Handle pair and timeframe changes: disconnect old WebSocket, connect new WebSocket
  - Merge historical data (from REST API) with real-time data (from WebSocket)
  - Implement loading state for initial historical data fetch
  - Implement error handling for WebSocket connection failures
  - Add toggle to enable/disable real-time updates (optional feature)

### 13. Update Chart Constants
- Update `app/client/src/app/chartConstants.js`:
  - Replace Plotly.js-specific constants with TradingView Lightweight Charts equivalents
  - Add TradingView chart options: `layout`, `timeScale`, `priceScale`, `crosshair`, `grid`
  - Add candlestick colors: `upColor`, `downColor`, `borderUpColor`, `borderDownColor`, `wickUpColor`, `wickDownColor`
  - Add volume colors: `upColor`, `downColor`
  - Remove Plotly-specific constants

### 14. Remove Legacy Chart Code
- Update or replace `app/client/src/app/chart.js`:
  - Remove all Plotly.js rendering functions (`drawChart`, `Plotly.newPlot`, `Plotly.relayout`)
  - Migrate utility functions (zoom calculations, range calculations) to `tradingViewChart.js`
  - Keep utility functions that are library-agnostic
  - Remove Plotly-specific imports

### 15. Update API Client
- Update `app/client/src/app/api.js`:
  - Add `getWebSocketUrl(pair, granularity)` function to construct WebSocket URL
  - Add `getWebSocketStatus()` function to check WebSocket health endpoint
  - Keep existing REST endpoints for historical data fetch

### 16. Update Documentation
- Update `README.md`:
  - Change Frontend Technology Stack: Replace "Plotly.js - Interactive charts" with "TradingView Lightweight Charts - Real-time financial charts"
  - Add Features: "📡 Real-time price streaming via WebSocket"
  - Add note about WebSocket connection to FX Open API
- Update `.claude/commands/conditional_docs.md`:
  - Update chart-related documentation paths to reference TradingView Lightweight Charts instead of Plotly.js
  - Add WebSocket documentation reference

### 17. Add Unit Tests
- Create `app/server/tests/test_websocket_manager.py`:
  - Test WebSocket connection lifecycle
  - Test authentication flow
  - Test subscription and unsubscription
  - Test reconnection logic
  - Test error handling
- Create `app/server/tests/test_candle_aggregator.py`:
  - Test candle creation from ticks
  - Test OHLC calculation correctness
  - Test candle completion detection
  - Test timeframe boundary handling
  - Test edge cases (first tick, missing data)

### 18. Run Validation Commands
- Execute all validation commands to ensure zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_websocket_realtime_chart.md` to validate real-time WebSocket functionality
- Fix any issues discovered during validation

## Testing Strategy
### Unit Tests
- **WebSocket Manager Tests** (`test_websocket_manager.py`):
  - Test connection establishment to FX Open API
  - Test authentication with valid and invalid credentials
  - Test symbol subscription and unsubscription
  - Test tick data parsing
  - Test reconnection logic with exponential backoff
  - Test graceful disconnection
  - Mock WebSocket server for isolated testing

- **Candle Aggregator Tests** (`test_candle_aggregator.py`):
  - Test M1 candle aggregation (1-minute candles)
  - Test H1 candle aggregation (1-hour candles)
  - Test D candle aggregation (daily candles)
  - Test OHLC correctness: Open = first tick, High = max, Low = min, Close = last tick
  - Test volume aggregation
  - Test candle boundary detection (candle close at timeframe boundary)
  - Test edge case: single tick candle (Open = High = Low = Close)
  - Test edge case: candle with no volume

- **Frontend Hook Tests**:
  - Test `useWebSocket` connection state transitions
  - Test `useWebSocket` auto-reconnect behavior
  - Test `useCandleAggregator` tick-to-candle aggregation
  - Test `useCandleAggregator` candle buffer management

### Edge Cases
- **WebSocket Connection**:
  - Network interruption during trading hours (auto-reconnect should restore connection)
  - Authentication failure (display error to user, do not retry infinitely)
  - Subscription to non-existent symbol (handle gracefully, show error)
  - Server closes connection unexpectedly (auto-reconnect)
  - Client navigates away from page (cleanup WebSocket connection)

- **Candle Aggregation**:
  - Tick arrives exactly at candle boundary (should start new candle)
  - Ticks arrive out of order (should handle or reject)
  - No ticks for extended period (current candle remains incomplete)
  - First tick after market open (initialize candle correctly)
  - Duplicate tick data (should deduplicate or ignore)

- **Chart Rendering**:
  - Switching currency pair mid-stream (disconnect old pair, subscribe to new pair)
  - Switching timeframe mid-stream (re-aggregate candles for new timeframe)
  - Large number of historical candles (performance test, ensure smooth rendering)
  - Rapid tick updates (ensure chart updates efficiently without lag)
  - User zooms/pans during real-time updates (chart should not jump)

- **Indicator Integration**:
  - Indicator calculation with incomplete candle (should use current candle data)
  - Indicator overlay on real-time chart (should update smoothly)
  - Multiple indicators active during real-time updates (performance test)

## Acceptance Criteria
- WebSocket connection establishes successfully to FX Open API on Strategy page load
- Authentication with FX Open API succeeds using configured credentials
- Price subscriptions work for all supported currency pairs (EUR_USD, GBP_JPY, USD_JPY, etc.)
- TradingView Lightweight Chart displays historical candlestick data on initial load
- TradingView Lightweight Chart updates in real-time as ticks arrive from WebSocket
- Candles aggregate correctly for all timeframes: M1, M5, M15, M30, H1, H4, D
- Current (incomplete) candle updates smoothly as ticks arrive
- Completed candles remain static and do not change
- Auto-reconnect logic activates when WebSocket connection drops
- Connection status indicator displays current state: connected (green), disconnected (red), reconnecting (yellow)
- Plotly.js is completely removed from the project (no imports, no dependencies)
- All existing chart features remain functional: indicators, patterns, drawings, zoom, pan
- Performance is acceptable: chart updates within 100ms of tick arrival, no visible lag
- Frontend build succeeds with zero errors: `cd app/client && npm run build`
- Backend tests pass with zero failures: `cd app/server && uv run pytest`
- E2E test validates real-time WebSocket chart functionality end-to-end
- Documentation reflects new architecture with TradingView Lightweight Charts

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/server && uv run ruff check .` - Run linter to ensure code quality
- `cd app/server && uv run ruff format .` - Format server code
- `grep -r "plotly" app/client/src --include="*.jsx" --include="*.js"` - Verify Plotly.js is completely removed (should return no results)
- `grep -r "Plotly" app/client/src --include="*.jsx" --include="*.js"` - Verify Plotly.js is completely removed (should return no results)
- `grep "plotly.js-dist" app/client/package.json` - Verify Plotly.js removed from dependencies (should return no results)
- `grep "lightweight-charts" app/client/package.json` - Verify TradingView Lightweight Charts added to dependencies
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_websocket_realtime_chart.md` to validate real-time WebSocket chart functionality works as expected

## Notes
- **WebSocket Library Choice**: Use `websockets` library for asyncio-compatible WebSocket client. This integrates well with FastAPI's async architecture.
- **TradingView Lightweight Charts**: This library is significantly lighter than Plotly.js (~200KB vs ~3MB) and is specifically optimized for financial charting with excellent real-time update performance.
- **Candle Aggregation Strategy**: Implement aggregation on the backend to reduce network traffic. Send only completed candles and current candle updates to the frontend, not raw ticks.
- **Fallback Mechanism**: If WebSocket connection fails, the application should fall back to REST API with manual refresh. This ensures the application remains functional even without real-time data.
- **Connection Pooling**: Consider connection pooling if multiple users connect to the same currency pair. A single backend WebSocket can fan out to multiple frontend clients via Server-Sent Events or WebSocket broadcast.
- **Rate Limiting**: FX Open API may have rate limits on WebSocket connections. Implement connection management to avoid exceeding limits.
- **Time Zones**: Ensure all timestamps are in UTC to avoid timezone-related bugs in candle aggregation.
- **Indicator Migration**: TradingView Lightweight Charts uses a different API for indicators. Indicators may need to be rendered as separate line series overlaid on the price chart. Some advanced Plotly features (like 3D charts) are not available in TradingView Lightweight Charts, but these are not used in the current implementation.
- **Drawing Tools**: TradingView Lightweight Charts has limited native support for drawing tools. Horizontal lines can be implemented using `createPriceLine()`. Trendlines and Fibonacci may require custom rendering using HTML overlays or canvas drawing.
- **Performance Optimization**: Batch chart updates if multiple ticks arrive within a short time window (e.g., 100ms). This prevents excessive re-renders and keeps the UI responsive.
- **User Preference**: Consider adding a toggle to switch between "real-time mode" and "historical mode" for users who prefer static charts.
- **Future Enhancement**: Consider implementing a chart replay feature to visualize historical tick data at accelerated speed for backtesting purposes.
