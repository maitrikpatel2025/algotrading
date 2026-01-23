# Bug: Datetime Timezone Comparison Error in Backtest Executor

## Metadata
issue_number: `114`
adw_id: `4620e8ed`
issue_json: `{"number":114,"title":"bug backest issue","body":"/bug \n\nadw_sdlc_iso\n\ncore.backtest_executor - ERROR - [BACKTEST_EXECUTOR] Error executing backtest c521fd33-9db3-4f7d-8fbe-2f24f77087ce: can't compare offset-naive and offset-aware datetimes\n\nHere are all the bugs and issues found in the backtest functionality:                                        \n                                                                                                               \n  Critical Issues                                                                                              \n                                                                                                               \n  - Simulated data is unrealistic - Candle generation uses random values (±0.2%) with no market correlation    \n  (backtest_executor.py:631-650)                                                                               \n  - Strategy conditions NOT actually evaluated - Uses hardcoded 2% random entry probability instead of real    \n  strategy logic (backtest_executor.py:664)                                                                    \n  - Random 5% exit probability - Exits are random, not based on actual exit conditions                         \n  (backtest_executor.py:709)                                                                                   \n  - Risk management not enforced - Stop loss compares percentages to pips (dimensional mismatch)               \n  (backtest_executor.py:692)                                                                                   \n  - Trailing stops not implemented - Config exists but logic is completely missing (backtest_executor.py:707)  \n  - No slippage or spread simulation - All trades execute at exact candle close prices                         \n                                                                                                               \n  Position Sizing & Calculations                                                                               \n                                                                                                               \n  - Hardcoded 50% position cap - Fixed dollar method caps at 50% without justification                         \n  (backtest_executor.py:722)                                                                                   \n  - Leverage ignored - Position sizing doesn't account for leverage configuration                              \n  - Forex P/L hardcoded - Assumes forex with * 10000 multiplier, incorrect for other pairs                     \n  (backtest_executor.py:741)                                                                                   \n  - No pip decimal adjustment - Doesn't handle 5-decimal vs 4-decimal pairs                                    \n                                                                                                               \n  Statistics & Math Errors                                                                                     \n                                                                                                               \n  - Division by zero risks - Win/loss ratio when avg_loss = 0 (backtest_executor.py:1067)                      \n  - Profit factor division by zero - When total_losses = 0 (backtest_executor.py:1075)                         \n  - Recovery factor division by zero - When max_dd_dollars = 0 (backtest_executor.py:1100)                     \n  - Sharpe/Sortino return None - Instead of infinity when all returns are positive                             \n  (backtest_executor.py:791-794)                                                                               \n  - Risk-free rate hardcoded to 0% - No configuration option (backtest_executor.py:750, 779)                   \n                                                                                                               \n  Data & Memory Issues                                                                                         \n                                                                                                               \n  - Equity curve limited to 50 points - Truncates live display data (backtest_executor.py:557-560)             \n  - Trades truncated to last 100 - User not clearly informed what was lost (backtest_executor.py:1192)         \n  - Delayed cleanup (5 seconds) - Could leave stale data in memory (backtest_executor.py:602)                  \n  - Potential memory leak - Cancelled backtest cleanup threads accumulate                                      \n                                                                                                               \n  Database Issues                                                                                              \n                                                                                                               \n  - No transaction atomicity - Multiple fields updated without transaction guarantee                           \n  (backtest_executor.py:1285-1303)                                                                             \n  - No rollback on partial failure - Database could have inconsistent states                                   \n  - Results could fail silently - If too large, update fails but status already \"completed\"                    \n                                                                                                               \n  Performance Issues                                                                                           \n                                                                                                               \n  - O(n*m) trade counting - Inefficient nested loop for each trade × each candle                               \n  (backtest_executor.py:1146-1158)                                                                             \n  - Polling instead of WebSockets - Uses 1.5-5s polling intervals (BacktestConfiguration.jsx:80-82)            \n  - No maximum runtime limit - Backtests could run indefinitely                                                \n                                                                                                               \n  Validation Gaps                                                                                              \n                                                                                                               \n  - No date range validation - start_date/end_date not validated (backtest_executor.py:415-423)                \n  - No minimum period check - Could backtest with insufficient data                                            \n  - Pair not validated - Doesn't verify valid trading pair                                                     \n  - Strategy conditions not validated - Format/completeness not checked                                        \n                                                                                                               \n  Dead Code & Incomplete Features                                                                              \n                                                                                                               \n  - Unused variables - _pair, _long_exit_conditions, _short_exit_conditions assigned but never used            \n  (backtest_executor.py:418, 471-472)                                                                          \n  - Partial closes config ignored - Config exists but never used in trading logic                              \n  - Generic exception catching - No differentiation or recovery mechanism (backtest_executor.py:589)           \n                                                                                                               \n  Date/Time Issues                                                                                             \n                                                                                                               \n  - Timezone handling inconsistent - .replace(tzinfo=None) could cause AttributeError                          \n  (backtest_executor.py:651)                                                                                   \n  - Mixed date formats - Some ISO strings, some datetime objects                                               \n                                                                "}`

## Bug Description
When executing a backtest, the system crashes with the error: "can't compare offset-naive and offset-aware datetimes". This occurs during the simulated candle generation process in the backtest executor. The error is caused by inconsistent timezone handling where timezone-aware datetime objects are compared with timezone-naive datetime objects.

**Symptoms:**
- Backtest execution fails immediately after starting
- Error message: "can't compare offset-naive and offset-aware datetimes"
- No backtest results are produced
- Database status may show "running" but execution has failed

**Expected Behavior:**
- Backtests should execute successfully regardless of input date timezone format
- All datetime comparisons should be consistent (either all timezone-aware or all timezone-naive)
- Simulated candles should generate correctly across the specified date range

**Actual Behavior:**
- Backtest crashes during candle generation
- Comparison between `current_time` and `end_date` fails in the while loop at line 630
- System cannot proceed with backtest execution

## Problem Statement
The `_generate_simulated_candles` method in `backtest_executor.py` has inconsistent timezone handling. The `start_date` and `end_date` parameters are timezone-aware (parsed with timezone info at lines 426-428), but within the candle generation loop, the `current_time` variable has its timezone information stripped (line 651), creating a timezone-naive datetime. This causes a comparison error when the while loop condition `current_time <= end_date` is evaluated.

## Solution Statement
Ensure consistent timezone handling throughout the backtest execution flow by:
1. Normalizing all datetime objects to timezone-naive immediately after parsing input dates
2. Removing the timezone stripping operation inside the candle generation loop (line 651)
3. Ensuring all datetime comparisons use the same timezone awareness state

This surgical fix will resolve the immediate comparison error without modifying the broader backtest architecture or simulation logic.

## Steps to Reproduce
1. Navigate to the Backtest Configuration page (`/backtests/new`)
2. Select any saved strategy from the dropdown
3. Set a date range (e.g., 1 month, 3 months, or custom dates)
4. Configure position sizing and risk management settings
5. Save the backtest configuration
6. Click "Run Backtest" button
7. Observe the backtest execution progress modal
8. Error appears: "Error executing backtest: can't compare offset-naive and offset-aware datetimes"

## Root Cause Analysis
The root cause is a timezone inconsistency introduced by the code flow:

1. **Lines 426-428**: `start_date` and `end_date` are parsed from ISO strings using `datetime.fromisoformat()`, which preserves timezone information when present (e.g., "2024-01-01T00:00:00Z" becomes a timezone-aware datetime with UTC timezone)

2. **Line 627**: `current_time = start_date` - At this point, `current_time` is timezone-aware (inherits from `start_date`)

3. **Line 630**: `while current_time <= end_date:` - First iteration works because both are timezone-aware

4. **Line 651**: `current_time = current_time.replace(tzinfo=None) if current_time.tzinfo else current_time` - Timezone info is stripped, making `current_time` timezone-naive

5. **Line 655**: `current_time += timedelta(minutes=minutes)` - Increments the now timezone-naive datetime

6. **Line 630 (next iteration)**: `while current_time <= end_date:` - Comparison fails because `current_time` is now timezone-naive but `end_date` is still timezone-aware

The line 651 operation was likely added to handle some datetime serialization concern, but it creates the comparison bug. The correct approach is to normalize timezone awareness at the start of the method, not in the middle of the loop.

## Relevant Files
Use these files to fix the bug:

- **app/server/core/backtest_executor.py** (lines 610-657)
  - Contains the `_generate_simulated_candles` method with the timezone bug
  - Lines 426-428: Date parsing that creates timezone-aware datetimes
  - Line 630: While loop comparison that fails
  - Line 651: Timezone stripping operation that causes the inconsistency
  - This is the only file that needs modification to fix this specific bug

- **app/server/core/data_models.py**
  - Contains Pydantic models for backtest configuration
  - Relevant for understanding expected date format structures
  - No changes needed, but useful for context

- **README.md**
  - Project overview and validation commands
  - Provides context on testing procedures

### New Files
No new files are required for this bug fix.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix timezone handling in backtest executor
- Open `app/server/core/backtest_executor.py`
- Locate the `_generate_simulated_candles` method (starting around line 610)
- After the date parsing section (lines 426-428 in the `_execute_backtest_thread` method), normalize both `start_date` and `end_date` to timezone-naive by adding this conversion immediately after parsing:
  ```python
  # Normalize to timezone-naive for consistent comparisons
  if start_date.tzinfo is not None:
      start_date = start_date.replace(tzinfo=None)
  if end_date.tzinfo is not None:
      end_date = end_date.replace(tzinfo=None)
  ```
- Remove or comment out line 651: `current_time = current_time.replace(tzinfo=None) if current_time.tzinfo else current_time`
- Verify that `current_time` initialization (line 627) and increment (line 655) remain unchanged
- Add a code comment explaining the timezone normalization approach

### 2. Run validation commands
- Execute all validation commands to ensure the bug is fixed with zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

### Manual Reproduction Test (Before and After)
1. Start the application: `./scripts/start.sh`
2. Navigate to Backtest Configuration page
3. Select a strategy, set date range (e.g., last 1 month), configure settings
4. Click "Run Backtest"
5. Verify backtest executes without "can't compare offset-naive and offset-aware datetimes" error
6. Verify progress percentage increases from 0% to 100%
7. Verify backtest completes and shows results

### Automated Tests
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions

### Code Verification
- `cd app/server && uv run ruff check .` - Verify no linting errors introduced
- `cd app/server && uv run ruff format .` - Ensure code formatting is consistent

## Notes
- This fix addresses ONLY the datetime timezone comparison bug (the immediate crash)
- The issue description lists many other bugs in the backtest functionality (simulated data quality, strategy evaluation, risk management, etc.) that are NOT addressed by this fix
- This is a surgical fix focused on restoring basic backtest execution capability
- Future work should address the other critical issues listed in the bug report (realistic data simulation, actual strategy condition evaluation, proper risk management enforcement, etc.)
- The fix normalizes all datetime objects to timezone-naive to maintain backward compatibility and avoid potential serialization issues
- No database schema changes are required
- No API contract changes are required
- The fix is backward compatible with existing backtest configurations
