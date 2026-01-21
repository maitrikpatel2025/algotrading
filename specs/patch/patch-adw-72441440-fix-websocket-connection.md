# Patch: Fix WebSocket Connection Failure

## Metadata
adw_id: `72441440`
review_change_request: `Issue #1: WebSocket connection fails to establish. The UI shows 'WebSocket Error - WebSocket connection error' badge and 'Disconnected' status. The chart area remains empty with only 'Loading chart data...' message, indicating the WebSocket client cannot connect to ws://localhost:8000/ws/prices/{pair}/{granularity} endpoint. This prevents real-time data from being displayed. Resolution: Investigate the WebSocket connection failure by checking: 1) Browser console errors for exact WebSocket error messages, 2) Backend logs for WebSocket connection attempts, 3) CORS configuration for WebSocket connections, 4) WebSocket URL construction in useWebSocket hook, 5) Ensure WebSocket endpoint is properly accepting connections. The backend endpoint exists at server.py:705 but the client connection is failing. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-86-adw-72441440-sdlc_planner-websocket-tradingview-realtime-chart.md
**Issue:** WebSocket connection fails to establish from the client to the backend. The UI displays 'WebSocket Error - WebSocket connection error' and 'Disconnected' status. The chart remains stuck on 'Loading chart data...' message. The backend WebSocket endpoint exists at server.py:705 but client connections are failing.
**Solution:** Investigate and fix the WebSocket connection failure by: 1) Testing the WebSocket endpoint is accepting connections, 2) Verifying the WebSocket URL construction is correct, 3) Checking CORS configuration allows WebSocket connections, 4) Examining browser console for specific error messages, 5) Reviewing backend logs for connection attempts, 6) Ensuring the WebSocket handshake completes successfully.

## Files to Modify
Use these files to implement the patch:

- `app/server/server.py` - WebSocket endpoint at line 705, verify it's accepting connections properly
- `app/client/src/hooks/useWebSocket.js` - WebSocket hook that constructs URL and manages connection
- `app/client/src/components/PriceChart.jsx` - Component that uses WebSocket hook, check URL construction at line 56

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Investigate WebSocket connection failure
- Start the backend server: `cd app/server && uv run uvicorn server:app --reload`
- Start the frontend dev server: `cd app/client && npm run dev`
- Open browser developer tools console
- Navigate to Strategy page
- Select a currency pair (EUR_USD) and timeframe (M5)
- Examine browser console for WebSocket error messages
- Examine backend terminal logs for WebSocket connection attempts
- Document the exact error message and status codes

### Step 2: Test WebSocket endpoint directly
- Use a WebSocket testing tool or browser console to test the endpoint directly
- Test connection to: `ws://localhost:8000/ws/prices/EUR_USD/M5`
- Verify the WebSocket handshake completes (HTTP 101 Switching Protocols)
- Check if the endpoint sends the initial connection_status message
- If connection fails, examine the HTTP response headers and status code

### Step 3: Fix WebSocket URL or endpoint configuration
- If URL is incorrect, update the URL construction in `app/client/src/components/PriceChart.jsx` line 56-58
- If CORS is blocking WebSocket, verify `app/server/server.py` CORS middleware allows WebSocket connections
- If the backend port is different from 8000, update the URL accordingly
- If the endpoint path is incorrect, fix the path construction
- Ensure the WebSocket endpoint accepts connections without authentication headers (WebSocket doesn't support custom headers during handshake)

### Step 4: Add error logging and diagnostics
- Add detailed error logging to `useWebSocket.js` hook to capture connection failures
- Add backend logging in `server.py` WebSocket endpoint to log incoming connection attempts
- Log the exact error event details (code, reason, message)
- Log the WebSocket readyState transitions (CONNECTING, OPEN, CLOSING, CLOSED)

### Step 5: Verify connection establishment
- Restart backend and frontend servers
- Navigate to Strategy page and select pair/timeframe
- Verify WebSocket connection establishes successfully
- Verify 'Connected' status badge appears in the UI
- Verify chart receives real-time data updates (simulated ticks every 2 seconds)
- Verify browser console shows successful WebSocket connection
- Verify backend logs show successful client connection

## Validation
Execute every command to validate the patch is complete with zero regressions.

- `cd app/server && uv run uvicorn server:app --reload` - Start backend server (run in background)
- `cd app/client && npm run dev` - Start frontend dev server (run in background)
- Manually test: Navigate to http://localhost:5173/strategy, select EUR_USD and M5, verify WebSocket connects and chart loads
- Verify browser console shows: `[useWebSocket] Connection opened` and `[PriceChart] WebSocket connected`
- Verify backend logs show: `[WEBSOCKET] Client connected for EUR_USD/M5` and `[WEBSOCKET] Using simulated tick data`
- Verify UI shows green 'Connected' badge (not 'WebSocket Error' or 'Disconnected')
- Verify chart displays and updates with real-time candle data
- `cd app/client && npm run build` - Verify frontend builds successfully
- `cd app/server && uv run pytest` - Verify backend tests pass

## Patch Scope
**Lines of code to change:** 5-20 lines (URL construction, error logging, or CORS config fix)
**Risk level:** low (fixing connection issue, not changing business logic)
**Testing required:** Manual testing of WebSocket connection, verify chart loads with real-time data, verify no console errors
