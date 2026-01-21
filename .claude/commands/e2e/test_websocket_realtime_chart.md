# E2E Test: WebSocket Real-Time Chart

Test the real-time WebSocket price streaming and TradingView Lightweight Charts functionality.

## User Story

As a trader
I want to see real-time price data from FX Open streamed via WebSocket and displayed on TradingView Lightweight Charts
So that I can monitor live market prices and make quick trading decisions

## Test Steps

1. Navigate to the `Application URL` (redirects to Monitor page)
2. Take a screenshot of the initial state (Monitor page)
3. **Verify** the page loads successfully

4. Click on "Strategy" in the navigation
5. Take a screenshot of the Strategy page
6. **Verify** the Strategy page loads

7. **Verify** the following elements are present:
   - Pair selector dropdown (EUR/USD, GBP/JPY, etc.)
   - Timeframe selector dropdown (M5, M15, H1, etc.)
   - Load Data button
   - WebSocket connection status indicator (badge or icon)
   - Price chart area (empty state initially)

8. Select a currency pair (e.g., "EUR/USD") from the dropdown
9. Select a timeframe (e.g., "M5")
10. Click "Load Data" button
11. Take a screenshot of the initial chart load
12. **Verify** the price chart displays historical candlestick data
13. **Verify** the chart is rendered using TradingView Lightweight Charts (not Plotly.js)

14. **Verify** WebSocket connection establishes:
    - Connection status indicator shows "connected" or green badge
    - No error messages in the console
    - Take a screenshot of the connection indicator

15. Wait for 30 seconds to observe real-time updates
16. **Verify** the chart updates with real-time tick data:
    - The current (last) candle updates its high/low/close values
    - The chart does not flicker or freeze
    - New candles appear when the timeframe boundary is crossed

17. Take a screenshot of the chart after real-time updates
18. **Verify** candle aggregation works correctly:
    - Current candle updates smoothly as ticks arrive
    - Completed candles remain static and do not change
    - Candle OHLC values are reasonable (no zero or negative values)

19. Change the timeframe (e.g., from M5 to M15)
20. **Verify** the WebSocket reconnects with the new timeframe:
    - Connection status briefly shows "reconnecting" or yellow badge
    - Chart updates with new timeframe candles
    - Real-time updates continue with the new timeframe

21. Take a screenshot of the new timeframe chart

22. Simulate connection drop (optional: disable network in browser DevTools for 5 seconds)
23. **Verify** auto-reconnect logic activates:
    - Connection status shows "disconnected" or red badge
    - After network restoration, status changes to "reconnecting" then "connected"
    - Chart resumes real-time updates after reconnection

24. Take a screenshot of the final state showing successful reconnection

25. **Verify** no Plotly.js references exist:
    - Inspect the page HTML and verify no Plotly.js elements are present
    - Console should not show any Plotly.js errors or warnings

## Success Criteria
- Strategy page loads successfully with TradingView Lightweight Charts
- Historical candlestick data displays on initial load
- WebSocket connection establishes successfully (connection indicator shows "connected")
- Real-time tick updates are reflected in the current candle
- Candles aggregate correctly for the selected timeframe
- Completed candles remain static while current candle updates
- Connection status indicator accurately reflects connection state
- Auto-reconnect works when connection is lost and restored
- Timeframe changes trigger WebSocket reconnection
- Plotly.js is completely removed from the page
- Chart updates are smooth without visible flicker or lag
- 6-8 screenshots are taken documenting the test flow

## Notes
- This test validates the complete WebSocket infrastructure including connection management, real-time data streaming, candle aggregation, and auto-reconnect
- The test requires the backend WebSocket endpoint to be functional and connected to FX Open API
- If FX Open API is unavailable, the test should gracefully fail with appropriate error messages
- Real-time updates may vary based on market activity; during off-hours, tick frequency may be low
