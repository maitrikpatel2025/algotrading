# Patch: Debug Timezone Normalization in Backtest Execution

## Metadata
adw_id: `4620e8ed`
review_change_request: `Issue #2: All backtests in the system remain in 'Failed' status, including the newly created 'Timezone Fix Test' backtest and previously failed backtests 'Review Test Backtest' and 'S2'. This confirms the fix does not resolve the issue for any backtest configuration. Resolution: The fix needs to be debugged to understand why the timezone normalization is not preventing the comparison error. Consider adding debug logging to verify that start_date and end_date are actually being normalized, and trace where the actual timezone comparison failure occurs in the execution flow. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-114-adw-4620e8ed-sdlc_planner-datetime-timezone-comparison-fix.md
**Issue:** All backtests remain in 'Failed' status despite timezone normalization fix being applied at lines 448-452. The fix normalized start_date and end_date to timezone-naive, but backtests are still failing. This suggests the timezone comparison error is occurring elsewhere in the execution flow, or the normalization is incomplete.
**Solution:** Add comprehensive debug logging to trace timezone awareness throughout the backtest execution flow. Identify where timezone-aware datetime objects are being created or compared. Ensure all datetime operations in trade duration calculations (lines 1023-1029) are also normalized to timezone-naive.

## Files to Modify
Use these files to implement the patch:

- **app/server/core/backtest_executor.py**
  - Add debug logging after timezone normalization (lines 448-452)
  - Add timezone normalization to entry_time and exit_time parsing (lines 1023-1025)
  - Add debug logging to trace datetime timezone awareness in key comparison points
  - Verify candle time objects maintain timezone-naive state throughout execution

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add debug logging to verify timezone normalization at entry point
- Locate the timezone normalization section at lines 448-452 in `_execute_backtest_thread` method
- Add debug logging immediately after normalization to confirm start_date and end_date are timezone-naive:
  ```python
  # Normalize to timezone-naive for consistent comparisons
  if start_date.tzinfo is not None:
      start_date = start_date.replace(tzinfo=None)
  if end_date.tzinfo is not None:
      end_date = end_date.replace(tzinfo=None)

  logger.debug(f"[BACKTEST_EXECUTOR] Normalized dates - start_date: {start_date} (tzinfo: {start_date.tzinfo}), end_date: {end_date} (tzinfo: {end_date.tzinfo})")
  ```

### Step 2: Fix timezone normalization in trade duration calculation
- Locate the trade duration calculation at lines 1023-1025 in the `_calculate_average_trade_duration` method
- Add timezone normalization after parsing entry_time and exit_time:
  ```python
  # Parse times if they're strings
  if isinstance(entry_time, str):
      entry_time = datetime.fromisoformat(entry_time.replace("Z", "+00:00"))
      # Normalize to timezone-naive for consistent comparisons
      if entry_time.tzinfo is not None:
          entry_time = entry_time.replace(tzinfo=None)
  if isinstance(exit_time, str):
      exit_time = datetime.fromisoformat(exit_time.replace("Z", "+00:00"))
      # Normalize to timezone-naive for consistent comparisons
      if exit_time.tzinfo is not None:
          exit_time = exit_time.replace(tzinfo=None)
  ```

### Step 3: Add debug logging to trace candle generation
- Locate the `_generate_simulated_candles` method at line 650
- Add debug logging at the start of the method to verify input dates are timezone-naive:
  ```python
  logger.debug(f"[BACKTEST_EXECUTOR] Generating candles - start_date: {start_date} (tzinfo: {start_date.tzinfo}), end_date: {end_date} (tzinfo: {end_date.tzinfo})")
  ```
- Add debug logging in the while loop at line 664 to verify current_time remains timezone-naive:
  ```python
  while current_time <= end_date:
      if len(candles) == 0:  # Log only first candle
          logger.debug(f"[BACKTEST_EXECUTOR] First candle - current_time: {current_time} (tzinfo: {current_time.tzinfo})")
  ```

### Step 4: Add comprehensive error logging in exception handler
- Locate the exception handler at line 629 in `_execute_backtest_thread` method
- Enhance the error logging to include full traceback:
  ```python
  except Exception as e:
      import traceback
      logger.error(f"[BACKTEST_EXECUTOR] Error executing backtest {backtest_id}: {e}")
      logger.error(f"[BACKTEST_EXECUTOR] Full traceback:\n{traceback.format_exc()}")
  ```

## Validation
Execute every command to validate the patch is complete with zero regressions.

### 1. Run Python syntax check
```bash
cd app/server && uv run python -m py_compile core/backtest_executor.py
```

### 2. Run backend linting
```bash
cd app/server && uv run ruff check .
```

### 3. Start the application and test backtest execution
```bash
./scripts/start.sh
```
- Navigate to Backtest page (http://localhost:5173/backtests)
- Create a new backtest with:
  - Name: "Debug Timezone Test"
  - Strategy: s1
  - Date Range: Last 3 months
  - Initial Balance: $10,000
- Click "Run Backtest"
- Check server logs: `tail -f app/server/logs/bot_stderr.log | grep BACKTEST_EXECUTOR`
- Verify debug logs show timezone normalization is working correctly
- Identify the exact line where the comparison error occurs (if it still fails)

### 4. Run all backend tests
```bash
cd app/server && uv run pytest tests/ -v --tb=short
```

### 5. Run frontend build
```bash
cd app/client && npm run build
```

## Patch Scope
**Lines of code to change:** ~25 lines (adding debug logging and timezone normalization in trade duration calculation)
**Risk level:** low
**Testing required:** Manual backtest execution with log monitoring to identify exact failure point, backend tests, frontend build verification
