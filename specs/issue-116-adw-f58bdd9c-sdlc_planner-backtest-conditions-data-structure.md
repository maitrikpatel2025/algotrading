# Bug: Backtest Conditions Data Structure Fix

## Metadata
issue_number: `116`
adw_id: `f58bdd9c`
issue_json: `{"number":116,"title":"Bug backtest fix","body":"/bug \n\nAdw_sdlc_iso\n\n Backtests fail with 'list' object has no attribute 'get' error at line 495 in backtest_executor.py. This is a separate, pre-existing bug where the strategy conditions are returned as a list instead of a dictionary with 'long_entry' and 'short_entry' keys. - - \nThis is NOT caused by the timezone fix.\nResolution: Fix the strategy conditions data structure handling in the backtest executor to handle both list and dictionary formats, or ensure the API returns conditions in the expected dictionary format.\n\n"}`

## Bug Description
Backtests fail during execution with an `AttributeError: 'list' object has no attribute 'get'` error at line 495 in `app/server/core/backtest_executor.py`. The bug occurs because the strategy conditions are stored as a list of condition objects with a 'section' field (new format) in the database, but the backtest executor expects conditions to be a dictionary with 'long_entry' and 'short_entry' keys (legacy format).

## Problem Statement
The backtest executor's `_execute_backtest` method at lines 493-498 attempts to call `.get()` on the conditions object, assuming it's a dictionary. However, when strategies are saved through the current API (via `strategy_service.py`), conditions are stored as a list of `StrategyCondition` objects that have a 'section' field to categorize them. This format mismatch causes backtests to immediately fail when trying to extract entry conditions.

## Solution Statement
Update the backtest executor's `_execute_backtest` method to handle both the legacy dictionary format and the new list format for strategy conditions. The fix will check the type of the conditions object and extract entry/exit conditions appropriately based on the format detected. This approach maintains backward compatibility with any legacy strategies stored in the old format while supporting the current data structure.

## Steps to Reproduce
1. Create a strategy in the Strategy Builder with at least one entry condition
2. Save the strategy to the database (conditions are stored as a list with 'section' fields)
3. Create a backtest configuration using that strategy
4. Start the backtest execution
5. Observe the error: `AttributeError: 'list' object has no attribute 'get'` at line 495 in backtest_executor.py
6. The backtest fails immediately without processing any candles

## Root Cause Analysis
The root cause is a data structure inconsistency between how strategies are saved and how they are read during backtest execution:

1. **Current Save Format (strategy_service.py)**: Conditions are saved as a list of dictionaries, where each condition object has a 'section' field (values: 'long_entry', 'short_entry', 'long_exit', 'short_exit') to categorize it. This is the StrategyCondition model format.

2. **Expected Read Format (backtest_executor.py line 494-498)**: The executor expects conditions to be a dictionary with top-level keys like `{'long_entry': [...], 'short_entry': [...], 'long_exit': [...], 'short_exit': [...]}`.

3. **Validation Logic Handles Both**: The `validate_strategy_for_execution` method (lines 114-123) correctly handles both formats by checking `isinstance(conditions, list)`, but the main execution logic does not have this check.

The bug was introduced when the strategy data model was updated to use a list-based format with 'section' fields, but the backtest execution code was not updated to match.

## Relevant Files
Use these files to fix the bug:

- **app/server/core/backtest_executor.py** (lines 493-498) - Contains the bug where conditions.get() is called on a list. The `_execute_backtest` method needs to be updated to detect and handle both data formats, similar to the validation method at lines 114-123.

- **app/server/core/data_models.py** - Contains the StrategyCondition Pydantic model definition to understand the 'section' field structure.

- **app/server/core/strategy_service.py** (lines 48-49, 91-100) - Shows how conditions are saved as a list and provides the `_db_row_to_strategy` function that demonstrates the expected data structure.

- **app/server/tests/test_backtest_executor.py** (lines 89-147) - Contains existing validation tests that show both data formats are expected. New tests should be added to verify the execution logic handles both formats.

### New Files
None required - this is a data structure handling fix in existing code.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update backtest_executor.py to handle both condition formats
- Read `app/server/core/backtest_executor.py` and locate the `_execute_backtest` method around lines 493-498
- Add format detection logic similar to the `validate_strategy_for_execution` method (lines 114-123)
- Replace the direct `conditions.get()` calls with a type check:
  - If `isinstance(conditions, list)`: filter by 'section' field to extract conditions
  - If `isinstance(conditions, dict)`: use the existing `.get()` approach for backward compatibility
- Extract long_entry_conditions, short_entry_conditions, long_exit_conditions, and short_exit_conditions using the appropriate method for each format
- Ensure the extracted conditions are always lists (or empty lists if none exist)

### 2. Add comprehensive unit tests for both condition formats
- Read `app/server/tests/test_backtest_executor.py` to understand the test structure
- Add a new test class `TestConditionFormatHandling` with the following test cases:
  - `test_execute_backtest_with_legacy_dict_format` - Verify backtest executes successfully with old dictionary format
  - `test_execute_backtest_with_new_list_format` - Verify backtest executes successfully with new list format (primary test for this bug fix)
  - `test_execute_backtest_with_empty_conditions_list` - Verify graceful handling of empty conditions
  - `test_execute_backtest_with_mixed_section_types` - Verify all four section types are extracted correctly from list format
- Use mocking to simulate the full backtest execution flow without requiring a real database

### 3. Run validation commands
- Execute the validation commands listed below to ensure the bug is fixed with zero regressions
- Verify both unit tests and any integration tests pass
- Confirm the build completes without errors

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd app/server && uv run pytest tests/test_backtest_executor.py::TestConditionFormatHandling -v` - Run new tests for condition format handling
- `cd app/server && uv run pytest tests/test_backtest_executor.py::TestStrategyValidation -v` - Verify validation tests still pass
- `cd app/server && uv run pytest tests/test_backtest_executor.py -v` - Run all backtest executor tests to ensure no regressions
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions

## Notes
- This bug affects all backtests created after the strategy data model was updated to use the list-based format with 'section' fields
- The fix maintains backward compatibility with any legacy strategies that might still use the dictionary format
- The validation logic in `validate_strategy_for_execution` already handles both formats correctly (lines 114-123), so the fix mirrors that approach
- The four condition section types are: 'long_entry', 'short_entry', 'long_exit', 'short_exit'
- After this fix, backtests should execute successfully regardless of which format the strategy conditions are stored in
- No database migration is required - this is purely a code logic fix to handle existing data correctly
