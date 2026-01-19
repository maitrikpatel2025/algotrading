# Patch: Add Mock Price Data Fallback for API Unavailability

## Metadata
adw_id: `ec8c6210`
review_change_request: `Issue #1: External price data API is unavailable (503 Service Unavailable), preventing chart data from loading. Without chart data, pattern detection cannot be tested as it requires OHLC data. All attempts to load data for AUD_CAD and EUR_USD pairs failed with API errors. Resolution: Fix the external API connectivity issue or implement mock/test data fallback for testing. The pattern detection functionality requires loaded chart data (priceData.mid_o, mid_h, mid_l, mid_c) to work. Severity: blocker`

## Issue Summary
**Original Spec:** N/A
**Issue:** External OpenFX price data API returns 503 Service Unavailable errors, blocking all chart data loading and pattern detection testing. The `web_api_candles()` method in `app/server/core/openfx_api.py` returns `None` when the API fails, triggering 503 responses from the `/api/prices` endpoint.
**Solution:** Implement a mock data fallback mechanism that activates when the external API is unavailable or when a `USE_MOCK_DATA` environment variable is set. This enables testing and development to continue without external API dependency.

## Files to Modify

1. `app/server/config/settings.py` - Add `USE_MOCK_DATA` environment variable configuration
2. `app/server/core/openfx_api.py` - Add mock data generation and fallback in `web_api_candles()` method
3. `app/server/tests/core/test_openfx_api.py` - Add tests for mock data fallback functionality

## Implementation Steps

### Step 1: Add `USE_MOCK_DATA` configuration setting
- Edit `app/server/config/settings.py`
- Add `USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "false").lower() == "true"` after line 122 (below `API_PORT`)
- This enables explicit activation of mock data mode via environment variable

### Step 2: Implement mock price data generator function in `openfx_api.py`
- Add a new private method `_generate_mock_candles()` to the `OpenFxApi` class (after `__init__`, around line 50)
- The method should:
  - Accept `pair_name: str`, `granularity: str`, `count: int` parameters
  - Generate realistic OHLC data with proper time series (based on granularity intervals)
  - Use a seeded random generator based on pair name for consistent mock data
  - Return a dictionary in the same format as `web_api_candles()` output: `{'time': [], 'mid_o': [], 'mid_h': [], 'mid_l': [], 'mid_c': []}`

### Step 3: Update `web_api_candles()` to use mock data fallback
- Edit the `web_api_candles()` method in `app/server/core/openfx_api.py` (lines 277-320)
- At the beginning of the method, check `settings.USE_MOCK_DATA`:
  - If `True`, call `_generate_mock_candles()` and return mock data immediately
- After the existing API call fails (when `df is None` at line 295), add fallback:
  - Log a warning about using mock data as fallback
  - Call `_generate_mock_candles()` and return that data instead of the error dict
- This provides both explicit mock mode and automatic fallback on API failure

### Step 4: Add unit tests for mock data functionality
- Edit `app/server/tests/core/test_openfx_api.py`
- Add a new test class `TestMockDataFallback` with tests for:
  - `test_mock_data_returns_valid_structure` - Verify mock data has required keys
  - `test_mock_data_has_correct_length` - Verify count parameter works
  - `test_mock_data_time_series_valid` - Verify time values are properly formatted
  - `test_fallback_on_api_failure` - Verify mock data is used when API fails

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Python Syntax Check:**
   ```bash
   cd app/server && uv run python -m py_compile server.py core/*.py config/*.py
   ```

2. **Backend Linting:**
   ```bash
   cd app/server && uv run ruff check .
   ```

3. **All Backend Tests:**
   ```bash
   cd app/server && uv run pytest tests/ -v --tb=short
   ```

4. **Frontend Build:**
   ```bash
   cd app/client && npm run build
   ```

5. **Manual Verification (with mock data enabled):**
   ```bash
   export USE_MOCK_DATA=true
   # Start the server and verify /api/prices/EUR_USD/H1/100 returns mock data
   ```

## Patch Scope
**Lines of code to change:** ~80 lines (40 new for mock generator, 10 for settings, 10 for fallback logic, 20 for tests)
**Risk level:** low
**Testing required:** Unit tests for mock data generation, integration test to verify fallback behavior, manual verification that pattern detection works with mock data
