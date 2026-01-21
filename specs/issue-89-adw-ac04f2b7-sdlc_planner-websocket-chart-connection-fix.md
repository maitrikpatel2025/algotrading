# Bug: WebSocket Connection Failure and Chart.js Cleanup

## Metadata
issue_number: `89`
adw_id: `ac04f2b7`
issue_json: `{"number":89,"title":"bug WebSocket and  tradingViewChart light wieght chart js","body":"/bug\n\nadw_sdlc_iso\n\nWebSocket Error\n\nWebSocket\n\nerror\n\n\n\ndef get_signature(timestamp):\n    fullsec = timestamp + WEB_ID + WEB_KEY\n    \n    msg = fullsec.encode('utf-8')\n    secret = SECRET.encode('utf-8')\n\n    hashed = hmac.new(secret, msg, hashlib.sha256).digest()\n    encoded_string = base64.b64encode(hashed)\n\n    return encoded_string.decode('utf-8')\nimport threading\n\nfrom infrastructure.log_wrapper import LogWrapper\n\nclass StreamBase(threading.Thread):\n\n    def __init__(self, shared_prices, price_lock: threading.Lock, price_events, logname):\n        super().__init__()\n        self.shared_prices = shared_prices\n        self.price_lock = price_lock\n        self.price_events = price_events\n        self.log = LogWrapper(logname)\n\n    def log_message(self, msg, error=False):\n        if error == True:\n            self.log.logger.error(msg)\n        else:            \n            self.log.logger.debug(msg)\nand i am not able to see charts on UI\n\nimport json\nimport threading\nimport requests\nimport pandas as pd\nfrom timeit import default_timer as timer\n\nimport constants.defs as defs\nfrom infrastructure.log_wrapper import LogWrapper\nfrom models.live_api_price import LiveApiPrice\nfrom stream_example.stream_base import StreamBase\n\nSTREAM_URL = f\"https://stream-fxpractice.oanda.com/v3\"\n\nclass PriceStreamer(StreamBase):\n\n    LOG_FREQ = 60\n\n    def __init__(self, shared_prices, price_lock: threading.Lock, price_events):\n        super().__init__(shared_prices, price_lock, price_events, \"PriceStreamer\")\n        self.pairs_list = shared_prices.keys()\n        print(self.pairs_list)\n\n    def fire_new_price_event(self, instrument):\n        if self.price_events[instrument].is_set() == False:\n            self.price_events[instrument].set()\n\n    def update_live_price(self, live_price: LiveApiPrice ):\n        try:\n            self.price_lock.acquire()\n            self.shared_prices[live_price.instrument] = live_price\n            self.fire_new_price_event(live_price.instrument)\n        except Exception as error:\n            self.log_message(f\"Exception: {error}\", error=True)\n        finally:\n            self.price_lock.release()\n\n    def log_data(self):\n\n        self.log_message(\"\")\n        self.log_message(f\"\\n{pd.DataFrame.from_dict([v.get_dict() for _, v in self.shared_prices.items()])}\")\n\n\n    def run(self):\n\n        start = timer() - PriceStreamer.LOG_FREQ + 10\n\n        params = dict(\n            instruments=','.join(self.pairs_list)\n        )\n\n        url = f\"{STREAM_URL}/accounts/{defs.ACCOUNT_ID}/pricing/stream\"\n\n        resp = requests.get(url, params=params, headers=defs.SECURE_HEADER, stream=True)\n\n        for price in resp.iter_lines():\n            if price:\n                decoded_price = json.loads(price.decode('utf-8'))\n                if 'type' in decoded_price and decoded_price['type'] == 'PRICE':\n                    self.update_live_price(LiveApiPrice(decoded_price))\n                    if timer() - start > PriceStreamer.LOG_FREQ:\n                        print(LiveApiPrice(decoded_price).get_dict())\n                        self.log_data()\n                        start = timer()\n               \n\nimport copy\nfrom queue import Queue\nimport random\nimport threading\nimport time\nfrom stream_example.stream_base import StreamBase\n\nclass PriceProcessor(StreamBase):\n\n    def __init__(self, shared_prices, price_lock: threading.Lock, price_events, logname, pair, work_queue: Queue):\n        super().__init__(shared_prices, price_lock, price_events, logname)\n        self.pair = pair\n        self.work_queue = work_queue\n\n\n    def process_price(self):\n\n        price = None\n\n        try:\n            self.price_lock.acquire()\n            price = copy.deepcopy(self.shared_prices[self.pair])\n        except Exception as error:\n            self.log_message(f\"CRASH : {error}\", error=True)\n        finally:\n            self.price_lock.release()\n\n        if price is None:\n            self.log_message(\"NO PRICE\", error=True)\n        else:\n            self.log_message(f\"Found price : {price}\")\n            time.sleep(random.randint(2,5))\n            self.log_message(f\"Done processing price : {price}\")\n            if random.randint(0,5) == 3:\n                self.log_message(f\"Adding work : {price}\")\n                self.work_queue.put(price)\n\n    def run(self):\n\n        while True:\n            self.price_events[self.pair].wait()\n            self.process_price()\n            self.price_events[self.pair].clear()\nimport threading\nimport websocket\nimport json\nimport uuid\nimport datetime as dt\nfrom infrastructure.log_wrapper import LogWrapper\nfrom models.api_price import ApiPrice\n\nfrom stream_example.signature import get_signature, WEB_ID, WEB_KEY\n\n\ndef get_login(id):\n\n    ts = int(dt.datetime.now().timestamp()*1000)\n\n    sig = get_signature(str(ts))\n\n    login = {\n        \"Id\": id,\n        \"Request\": \"Login\",\n        \"Params\": {\n            \"AuthType\": \"HMAC\",\n            \"WebApiId\":  WEB_ID,\n            \"WebApiKey\": WEB_KEY,\n            \"Timestamp\": ts,\n            \"Signature\": sig,\n            \"DeviceId\":  \"WebBrowser\",\n            \"AppSessionId\":  \"1234\"\n        }\n    }\n\n    return login\n\n\ndef login_was_ok(msg_data):\n    print(f\"login_was_ok: {msg_data}\")\n    if \"Result\" in msg_data and \"Info\" in msg_data[\"Result\"]:\n        if msg_data[\"Result\"][\"Info\"] == \"ok\":\n           return True\n    return False\n\n\n\ndef sub_to_price_feed(ws, symbols, id):\n\n    params = []\n    for s in symbols:\n        params.append({\n                \"Symbol\": s,\n                \"BookDepth\": 1\n        })\n\n    data = {\n        \"Id\": id,\n        \"Request\": \"FeedSubscribe\",\n        \"Params\": {\n            \"Subscribe\": params\n        }\n     }\n\n    ws.send(json.dumps(data))\n\n\n\n\nclass SocketConnection(threading.Thread):\n\n    def __init__(self, shared_prices, price_lock: threading.Lock, price_events):\n        super().__init__()\n        self.id = str(uuid.uuid4())\n        self.log = LogWrapper(\"SocketConnection\")\n        self.price_lock = price_lock\n        self.shared_prices = shared_prices\n        self.price_events = price_events\n        self.pairs_list = shared_prices.keys()\n\n\n    def log_message(self, msg, error=False):\n        if error == True:\n            self.log.logger.error(msg)\n        else:            \n            self.log.logger.debug(msg)\n    \n\n    def fire_new_price_event(self, instrument):\n        if self.price_events[instrument].is_set() == False:\n            self.price_events[instrument].set()\n\n\n    def update_live_price(self, live_price: ApiPrice ):\n        print(live_price)\n        try:\n            self.price_lock.acquire()\n            self.shared_prices[live_price.instrument] = live_price\n            self.fire_new_price_event(live_price.instrument)\n        except Exception as error:\n            self.log_message(f\"Exception: {error}\", error=True)\n        finally:\n            self.price_lock.release()\n\n\n    def run(self):\n\n        ws_url = \"wss://marginalttdemowebapi.fxopen.net:3000\"\n        ws = websocket.WebSocketApp(ws_url)   \n        \n        def on_open(ws):\n            self.log_message(\"WebSocket connection established\")\n            l = get_login(self.id)\n            self.log_message(f\"Login with: {l}\")\n            ws.send(json.dumps(l))\n\n\n        def on_message(ws, message):\n            msg_data = json.loads(message)\n            #print(\"on_message():\", msg_data)\n            if msg_data['Response'] == \"Login\" and login_was_ok(msg_data) == True:\n                sub_to_price_feed(ws, self.pairs_list, self.id)\n            elif msg_data['Response'] == \"FeedTick\":\n                self.update_live_price(ApiPrice(msg_data['Result']))\n\n        \n        def on_error(ws, error):\n            self.log_message(f\"WebSocket error occurred: {error}\")\n            ws.close()\n        \n        def on_close(ws):\n            self.log_message(\"WebSocket connection closed\")\n        \n        ws.on_open = on_open\n        ws.on_message = on_message\n        ws.on_error = on_error\n        ws.on_close = on_close\n        \n        ws.run_forever()\n\n        \n    \nfrom queue import Queue\nimport threading\nimport time\nfrom infrastructure.log_wrapper import LogWrapper\nfrom models.live_api_price import LiveApiPrice\n\nclass WorkProcessor(threading.Thread):\n\n    def __init__(self, work_queue: Queue):\n        super().__init__()\n        self.work_queue = work_queue\n        self.log = LogWrapper(\"WorkProcessor\")\n\n    def run(self):\n        while True:\n            work: LiveApiPrice = self.work_queue.get()\n            self.log.logger.debug(f\"New Work: {work}\")\n            time.sleep(7)\n\n\nimport json\nfrom queue import Queue\nimport threading\nimport time\n\nfrom stream_example.stream_prices import PriceStreamer\nfrom stream_example.stream_processor import PriceProcessor\nfrom stream_example.stream_worker import WorkProcessor\n\ndef load_settings():\n    with open(\"./bot/settings.json\", \"r\") as f:\n        return json.loads(f.read())\n\ndef run_streamer():\n\n    settings = load_settings()\n\n    shared_prices = {}\n    shared_prices_events = {}\n    shared_prices_lock = threading.Lock()\n    work_queue = Queue()\n\n    for p in settings['pairs'].keys():\n        shared_prices_events[p] = threading.Event()\n        shared_prices[p] = {}\n\n    threads = []\n    \n    price_stream_t = PriceStreamer(shared_prices, shared_prices_lock, shared_prices_events)\n    price_stream_t.daemon = True\n    threads.append(price_stream_t)\n    price_stream_t.start()\n    \n    \n    worker_t = WorkProcessor(work_queue)\n    worker_t.daemon = True\n    threads.append(worker_t)\n    worker_t.start()\n\n    \n    for p in settings['pairs'].keys():\n        processing_t = PriceProcessor(shared_prices, shared_prices_lock, shared_prices_events, \n                                    f\"PriceProcessor_{p}\", p, work_queue)\n        processing_t.daemon = True\n        threads.append(processing_t)\n        processing_t.start()\n\n    '''\n    try:\n        for t in threads:\n            t.join()\n    except KeyboardInterrupt:\n        print(\"KeyboardInterrupt\")\n    '''\n\n    try:\n        while True:\n            time.sleep(0.5)\n    except KeyboardInterrupt:\n        print(\"KeyboardInterrupt\")\n\n    print(\"ALL DONE\")\n\nimport threading\nimport time\nfrom stream_example.stream_socket import SocketConnection\n\n\nshared_prices = {}\nshared_prices_events = {}\nshared_prices_lock = threading.Lock()\n\nfor p in [\"EURUSD\", \"GBPJPY\"]:\n    shared_prices_events[p] = threading.Event()\n    shared_prices[p] = {}\n\n# create and start the WebSocket thread\nsocket_t = SocketConnection(shared_prices, shared_prices_lock, shared_prices_events)\nsocket_t.daemon = True\nsocket_t.start()\n\ntry:\n    while True:\n        time.sleep(0.5)\nexcept KeyboardInterrupt:\n    print(\"KeyboardInterrupt\")\n\nWebSocket connection fails to establish. The UI shows 'WebSocket Error - WebSocket connection error' badge and 'Disconnected' status. The chart area remains empty with only 'Loading chart data...' message, indicating the WebSocket client cannot connect to ws://localhost:8000/ws/prices/{pair}/{granularity} endpoint. This prevents real-time data from being displayed.\n\nClean up or replace app/client/src/app/chart.js file to remove all Plotly.js references. According to the spec step 14, this file should either be \n\nreplaced with tradingViewChart.js or have Plotly-specific code removed while keeping library-agnostic utility functions."}`

## Bug Description

Users cannot see real-time price charts in the Strategy Builder page. The WebSocket connection fails to establish, showing 'WebSocket Error' and 'Disconnected' status. The chart area displays only "Loading chart data..." without rendering any price data. Additionally, the legacy `app/client/src/app/chart.js` file contains Plotly.js code that should have been removed during the TradingView Lightweight Charts migration, creating technical debt and confusion.

## Problem Statement

Two critical issues prevent the trading dashboard from functioning correctly:

1. **WebSocket Connection Failure**: The frontend React application cannot establish a WebSocket connection to the backend endpoint at `ws://localhost:8000/ws/prices/{pair}/{granularity}`, preventing real-time price streaming
2. **Legacy Chart Code**: The `app/client/src/app/chart.js` file contains 1664 lines of Plotly.js-based charting code that was supposed to be replaced by `tradingViewChart.js` during feature 72441440, but was never removed

## Solution Statement

1. **Fix WebSocket Connection**: Enable the WebSocket endpoint in the backend by uncommenting the production FX Open WebSocket integration code that is currently disabled for simulated testing
2. **Clean Up Legacy Code**: Remove the obsolete `app/client/src/app/chart.js` file completely since all charting functionality has been migrated to TradingView Lightweight Charts via `tradingViewChart.js`

## Steps to Reproduce

1. Start the backend server: `cd app/server && uv run python server.py`
2. Start the frontend: `cd app/client && npm start`
3. Navigate to http://localhost:3000/strategy
4. Select a currency pair (e.g., EUR/USD) and timeframe (e.g., M5)
5. Click "Load Data"
6. Observe: Chart area shows "Loading chart data..." indefinitely
7. Observe: Connection status badge shows "Disconnected" or "WebSocket Error"
8. Check browser console: WebSocket connection errors appear
9. Check backend logs: WebSocket endpoint reports "Using simulated data - FX Open WebSocket not configured"

## Root Cause Analysis

### WebSocket Connection Failure

The root cause is in `app/server/server.py` lines 788-820. The production WebSocket code that connects to FX Open API is commented out with these lines:

```python
# NOTE: This is a placeholder for FX Open WebSocket connection
# In production, uncomment and configure with actual FX Open WebSocket URL
# ws_manager = WebSocketManager(...)
```

Instead, the endpoint uses simulated tick data (lines 822-856) which runs in a synchronous loop, preventing proper WebSocket communication. The frontend attempts to connect but receives only a "simulated" status message, not actual price updates in the expected format.

### Legacy Chart File

The `app/client/src/app/chart.js` file was created for Plotly.js-based charting but was never removed after the TradingView Lightweight Charts migration (feature 72441440). This creates confusion because:
- The PriceChart component imports from `tradingViewChart.js`, not `chart.js`
- The file contains 1664 lines of dead code
- It imports Plotly.js (line 1), which was removed from package.json dependencies
- The spec document (app_docs/feature-72441440-websocket-tradingview-realtime-chart.md line 203) states "All Plotly.js dependencies have been completely removed from the codebase"

The file does contain some utility functions (zoom/scroll calculations lines 106-318, drawing shape creation lines 1060-1363) that may have been intended to be reused, but they rely on Plotly.js-specific date handling and are not being imported anywhere in the current codebase.

## Relevant Files

Use these files to fix the bug:

- **app/server/server.py** (lines 705-872)
  - Contains the WebSocket endpoint `/ws/prices/{pair}/{granularity}` with commented-out production code
  - Currently uses simulated data loop instead of actual FX Open WebSocket connection
  - Needs production WebSocket manager code to be enabled

- **app/server/core/websocket_manager.py**
  - Contains WebSocketManager class for managing connections to FX Open API
  - Already implements authentication, subscription management, and auto-reconnect
  - Ready to use but not being instantiated in server.py

- **app/server/core/candle_aggregator.py**
  - Contains CandleAggregator class for tick-to-candle aggregation
  - Already being used in server.py (line 742)
  - Working correctly

- **app/client/src/components/PriceChart.jsx** (lines 55-83)
  - Constructs WebSocket URL: `ws://localhost:8000/ws/prices/${pair}/${granularity}`
  - Uses useWebSocket hook to manage connection
  - Expects messages with types: "connection_status", "candle_completed", "candle_update", "error"
  - Currently shows "Disconnected" because backend doesn't send proper updates

- **app/client/src/hooks/useWebSocket.js**
  - React hook for WebSocket connection management
  - Implements auto-reconnect with exponential backoff
  - Working correctly on the client side

- **app/client/src/app/chart.js**
  - 1664 lines of legacy Plotly.js charting code
  - Not imported by any component in the current codebase
  - Contains drawing utilities and zoom/scroll functions that are Plotly.js-specific
  - Should be deleted entirely

- **app/client/src/app/tradingViewChart.js**
  - 323 lines of TradingView Lightweight Charts helper functions
  - Currently being used by PriceChart.jsx
  - Complete replacement for chart.js functionality

- **app/server/config/settings.py**
  - Contains API_ID, API_KEY, API_SECRET for FX Open authentication
  - Settings are loaded from .env file

- **app_docs/feature-72441440-websocket-tradingview-realtime-chart.md**
  - Specification document for the TradingView migration
  - Line 194-203: Documents migration from Plotly.js to TradingView
  - Line 203: States "All Plotly.js dependencies have been completely removed from the codebase"

### New Files

None. All necessary components already exist.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Enable Production WebSocket Connection in Backend

- Read `app/server/server.py` lines 705-872 to understand the current WebSocket endpoint implementation
- Read `app/server/core/websocket_manager.py` to understand the WebSocketManager API
- In `app/server/server.py`, locate the `/ws/prices/{pair}/{granularity}` endpoint (starting at line 705)
- Remove or comment out the simulated tick data section (lines 810-856)
- Uncomment and properly configure the production WebSocket manager code (lines 787-808)
- Update the WebSocket manager initialization to use the correct FX Open WebSocket URL from the `websocket_manager.py` default: `wss://marginalttdemowebapi.fxopen.net/api/v2/websocket`
- Ensure the on_tick callback properly formats tick data with required fields: timestamp, bid, ask, mid, volume
- Ensure error handling sends proper error messages to the frontend client
- Test that the WebSocket manager authenticates correctly using credentials from config/settings.py

### Step 2: Remove Legacy Plotly.js Chart File

- Verify that `app/client/src/app/chart.js` is not imported anywhere in the codebase using grep: `cd app/client && grep -r "from.*chart.js" src/` and `cd app/client && grep -r "import.*chart" src/`
- Verify that all imports point to `tradingViewChart.js` instead
- Delete `app/client/src/app/chart.js` completely
- Verify that the frontend builds successfully after deletion: `cd app/client && npm run build`

### Step 3: Validation Testing

Run all validation commands listed in the "Validation Commands" section below to ensure the bug is fixed with zero regressions.

### Step 4: Create E2E Test for WebSocket Chart Validation

Read `.claude/commands/e2e/test_websocket_realtime_chart.md` and `.claude/commands/e2e/test_trading_dashboard.md` to understand the E2E test format. The existing test_websocket_realtime_chart.md already covers this functionality, so no new E2E test file is needed. We will use this existing test in validation.

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

### Backend WebSocket Validation
- `cd app/server && uv run python server.py` - Start the backend and verify no errors in startup logs
- Check logs for: "WebSocket connection established", "WebSocket authentication successful", "Subscribed to [PAIR]" messages
- Verify NO log messages saying "Using simulated data - FX Open WebSocket not configured"

### Frontend Build Validation
- `cd app/client && npm run build` - Verify the frontend builds without errors
- Check build output for: No references to Plotly.js, no import errors for chart.js
- Verify build completes successfully with exit code 0

### WebSocket Connection Validation (Manual)
- Start backend: `cd app/server && uv run python server.py`
- Start frontend: `cd app/client && npm start`
- Navigate to http://localhost:3000/strategy
- Select EUR/USD pair and M5 timeframe
- Click "Load Data"
- Verify: Connection status badge shows "Connected" (green)
- Verify: Chart displays historical candlestick data
- Wait 30 seconds
- Verify: Current candle updates in real-time with tick data
- Verify: No "Loading chart data..." message remains
- Verify: No WebSocket errors in browser console

### Legacy Code Cleanup Validation
- `cd app/client/src/app && ls -la chart.js` - Verify file does not exist (should return "No such file or directory")
- `cd app/client && grep -r "from.*chart.js" src/ || echo "No imports found"` - Verify no imports of chart.js
- `cd app/client && grep -r "import Plotly" src/ || echo "No Plotly imports found"` - Verify no Plotly.js imports

### E2E Test Validation
Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_websocket_realtime_chart.md` to validate WebSocket functionality works end-to-end with screenshots proving real-time updates.

### Test Suite Validation
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions

## Notes

### WebSocket Endpoint Configuration

The WebSocket manager should connect to: `wss://marginalttdemowebapi.fxopen.net/api/v2/websocket` (not the `:3000` port URL shown in the issue body - that's from the separate stream_example code which is unrelated to the web application).

### Authentication Flow

The WebSocketManager class handles authentication automatically in the `authenticate()` method. Credentials are loaded from environment variables via `config/settings.py`.

### Message Format

The frontend expects WebSocket messages in this JSON format:
```json
{
  "type": "candle_update" | "candle_completed" | "connection_status" | "error",
  "data": {
    "time": "2026-01-21T10:30:00Z",
    "open": 1.0850,
    "high": 1.0855,
    "low": 1.0848,
    "close": 1.0853,
    "volume": 1000
  }
}
```

### Error Handling

If the FX Open WebSocket connection fails, the backend should send an error message to the frontend client:
```json
{
  "type": "error",
  "data": {"message": "Failed to connect to FX Open API"}
}
```

The frontend will display this error in the connection status indicator.

### Chart.js File History

The `chart.js` file was created before feature 72441440 (WebSocket TradingView Real-Time Chart) was implemented. During that feature, a new `tradingViewChart.js` file was created to replace it, but the cleanup step to remove the old file was missed. The spec document states the migration was complete, but the file deletion was never executed.

### Future Enhancements

Once the WebSocket connection is working with production data, consider:
- Adding connection health monitoring and automatic recovery
- Implementing candle snapshot persistence for reconnection scenarios
- Adding configurable retry limits for WebSocket reconnection
- Implementing WebSocket message compression for bandwidth optimization

### Related Issues

This bug is related to feature 72441440 (WebSocket TradingView Real-Time Chart) which introduced the WebSocket infrastructure but left the production integration code commented out for testing purposes.
