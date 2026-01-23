# Backtest Conditions Data Structure Fix

**ADW ID:** f58bdd9c
**Date:** 2026-01-23
**Specification:** specs/issue-116-adw-f58bdd9c-sdlc_planner-backtest-conditions-data-structure.md

## Overview

Fixed a critical bug in the backtest executor that caused all backtests to fail with `AttributeError: 'list' object has no attribute 'get'`. The executor now correctly handles both the legacy dictionary format and the current list-based format for strategy conditions, maintaining backward compatibility while supporting the modern data structure.

## What Was Built

- Updated `BacktestExecutor._execute_backtest()` to detect and handle both condition data formats
- Added comprehensive unit tests for all condition format scenarios
- Ensured zero regression across existing backtest functionality

## Technical Implementation

### Files Modified

- `app/server/core/backtest_executor.py`: Added format detection logic in `_execute_backtest()` method (lines 494-509) to handle both list and dictionary condition formats
- `app/server/tests/test_backtest_executor.py`: Added `TestConditionFormatHandling` test class with 4 comprehensive test cases (219 new lines)

### Key Changes

- **Format Detection**: Added `isinstance(conditions, list)` check to determine condition data structure type
- **List Format Handling**: Filters conditions by 'section' field to extract long_entry, short_entry, long_exit, and short_exit conditions
- **Dictionary Format Support**: Maintains backward compatibility with legacy `.get()` approach for old dictionary-based conditions
- **Comprehensive Testing**: Added tests for both formats, empty conditions, and mixed section types to prevent future regressions

## How to Use

This fix is transparent to users - backtests will now execute successfully regardless of which format strategy conditions are stored in:

1. **New Format (Current)**: Strategies saved through the Strategy Builder store conditions as a list of objects with a 'section' field
2. **Legacy Format**: Older strategies with dictionary-based conditions continue to work without modification
3. **No Migration Required**: Existing data works automatically without database updates

## Configuration

No configuration changes required. The fix automatically detects and handles both data formats.

## Testing

Run the following commands to validate the fix:

```bash
cd app/server && uv run pytest tests/test_backtest_executor.py::TestConditionFormatHandling -v
cd app/server && uv run pytest tests/test_backtest_executor.py -v
cd app/server && uv run pytest
cd app/client && npm run build
```

## Notes

- The bug occurred because the strategy data model was updated to use a list-based format with 'section' fields, but the backtest execution code wasn't updated to match
- The validation logic in `validate_strategy_for_execution()` already handled both formats correctly; this fix mirrors that approach in the execution path
- Four condition section types are supported: 'long_entry', 'short_entry', 'long_exit', 'short_exit'
- No performance impact - format detection happens once per backtest execution
