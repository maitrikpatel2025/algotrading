# Patch: Fix Timezone Comparison in Trade Exit Time Processing

## Metadata
adw_id: `4620e8ed`
review_change_request: `Issue #1: Backtest execution still fails with timezone comparison error. After creating a new backtest named 'Timezone Fix Test' with a 3-month date range (Oct 23, 2025 - Jan 23, 2026), clicking 'Run Backtest' immediately shows 'Backtest Failed' dialog with 0% progress. Server logs confirm the same error: 'can't compare offset-naive and offset-aware datetimes' at line backtest_executor.py:801. Resolution: The timezone normalization code (lines 448-452) exists but does not prevent the error. Investigation needed to determine if: (1) the error occurs elsewhere in the code not covered by the fix, (2) the normalization is not being executed due to code flow issues, or (3) there are additional timezone-aware datetime objects being compared that were not normalized. The root cause needs to be properly identified and all datetime comparisons must be made consistent. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-114-adw-4620e8ed-sdlc_planner-datetime-timezone-comparison-fix.md
**Issue:** The previous fix at lines 448-452 normalized `start_date` and `end_date` to timezone-naive, which fixed the comparison at line 664 in `_generate_simulated_candles`. However, the error still occurs at line 1206 in the `_calculate_results` method where trade `exit_time` (parsed from ISO string with timezone) is compared with `candle_time` (timezone-naive from generated candles).
**Solution:** Normalize the `exit_time` datetime object to timezone-naive immediately after parsing it from the ISO string at line 1189, ensuring consistency with the candle times for the comparison at line 1206.

## Files to Modify
Use these files to implement the patch:

- **app/server/core/backtest_executor.py** (lines 1188-1190)
  - Add timezone normalization after parsing exit_time from ISO string

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Normalize exit_time to timezone-naive after parsing
- Open `app/server/core/backtest_executor.py`
- Locate the `_calculate_results` method around line 1188-1190
- After parsing `exit_time` from ISO string at line 1189, add timezone normalization:
  ```python
  if isinstance(exit_time, str):
      try:
          exit_time = datetime.fromisoformat(exit_time.replace("Z", "+00:00"))
          # Normalize to timezone-naive for consistent comparisons with candle times
          if exit_time.tzinfo is not None:
              exit_time = exit_time.replace(tzinfo=None)
      except (ValueError, TypeError):
          continue
  ```
- This ensures `exit_time` is timezone-naive before the comparison at line 1206

### Step 2: Apply the same normalization pattern to candle_time parsing
- In the same method, locate lines 1196-1202 where `candle_time` is parsed
- Although candle_time should already be timezone-naive from `_generate_simulated_candles`, add defensive normalization for safety:
  ```python
  if isinstance(candle_time, str):
      try:
          candle_time = datetime.fromisoformat(
              candle_time.replace("Z", "+00:00")
          )
          # Normalize to timezone-naive for consistent comparisons
          if candle_time.tzinfo is not None:
              candle_time = candle_time.replace(tzinfo=None)
      except (ValueError, TypeError):
          continue
  ```

## Validation
Execute every command to validate the patch is complete with zero regressions.

### 1. Python Syntax Check
```bash
cd app/server && uv run python -m py_compile core/backtest_executor.py
```

### 2. Backend Code Quality Check
```bash
cd app/server && uv run ruff check .
```

### 3. Run All Backend Tests
```bash
cd app/server && uv run pytest tests/ -v --tb=short
```

### 4. Frontend Build (ensure no regressions)
```bash
cd app/client && npm run build
```

### 5. Manual Backtest Execution Test
- Start the application: `./scripts/start.sh`
- Navigate to Backtest page in browser (http://localhost:5173)
- Create a new backtest named "Timezone Fix Test" with 3-month date range (Oct 23, 2025 - Jan 23, 2026)
- Click "Run Backtest"
- Verify backtest executes without "can't compare offset-naive and offset-aware datetimes" error
- Verify progress percentage increases from 0% to 100%
- Verify backtest completes and shows results with trades and statistics

## Patch Scope
**Lines of code to change:** ~6-8 lines (add timezone normalization in 2 locations)
**Risk level:** low
**Testing required:** Full test suite execution + manual backtest execution test with 3-month date range to confirm the exact error scenario is resolved
