# Patch: Fix candle_count Backend Validation Error

## Metadata
adw_id: `8047b9ec`
review_change_request: `Issue #1: Backend validation error prevents strategy import. When importing a strategy with candle_count as an integer (100), the backend returns: '1 validation error for StrategyConfig candle_count Input should be a valid string [type=string_type, input_value=100, input_type=int]'. This is a Pydantic validation error indicating the backend schema expects candle_count to be a string, but the standard export format (and the E2E test file) provides it as an integer. Resolution: Fix the backend StrategyConfig Pydantic model to accept candle_count as either an integer or a string (using Union type or type coercion). The export format uses integers for candle_count, so the import validation should match. Alternatively, update the export to stringify candle_count, but this would be inconsistent with JSON best practices. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-91-adw-8047b9ec-sdlc_planner-strategy-import-pattern-display.md
**Issue:** Backend StrategyConfig Pydantic model expects candle_count as string, but export format and JSON best practices use integers, causing Pydantic validation error on import
**Solution:** Update StrategyConfig model to accept candle_count as Union[int, str] to handle both integer and string inputs gracefully

## Files to Modify
Use these files to implement the patch:

- `app/server/core/data_models.py` - Update StrategyConfig.candle_count field type from `Optional[str]` to `Union[int, str, None]`
- `app/server/tests/core/test_data_models.py` - Add test cases to verify candle_count accepts both int and str values

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update StrategyConfig candle_count field type
- Add Union to the imports from typing module (line 8)
- Modify `app/server/core/data_models.py:394` to change candle_count field type
- Change from: `candle_count: Optional[str] = Field(None, description="Number of candles to display")`
- Change to: `candle_count: Union[int, str, None] = Field(None, description="Number of candles to display")`
- This allows the field to accept integers (from JSON exports), strings (from form inputs), or None
- Maintains backwards compatibility with existing strategies that may have candle_count as string

### Step 2: Add test coverage for candle_count validation
- Add new test class `TestStrategyConfig` to `app/server/tests/core/test_data_models.py`
- Import StrategyConfig at the top of the test file
- Create test cases:
  - `test_strategy_config_candle_count_as_int`: Verify candle_count=100 (int) is valid
  - `test_strategy_config_candle_count_as_str`: Verify candle_count="100" (str) is valid
  - `test_strategy_config_candle_count_as_none`: Verify candle_count=None is valid
  - `test_strategy_config_minimal`: Verify StrategyConfig with only required fields (name) works

### Step 3: Verify the fix with test_strategy_import.json
- Run manual validation by attempting to parse the test file with updated model
- Execute: `cd app/server && uv run python -c "from core.data_models import StrategyConfig; import json; data = json.load(open('../../test_strategy_import.json')); StrategyConfig(**data['strategy']); print('Validation success')"`
- This confirms the actual test file now validates correctly

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Python Syntax Check**
   ```bash
   cd app/server && uv run python -m py_compile core/data_models.py
   ```

2. **Backend Linting**
   ```bash
   cd app/server && uv run ruff check core/data_models.py tests/core/test_data_models.py
   ```

3. **Run Backend Tests**
   ```bash
   cd app/server && uv run pytest tests/core/test_data_models.py -v --tb=short
   ```

4. **Run All Backend Tests**
   ```bash
   cd app/server && uv run pytest tests/ -v --tb=short
   ```

5. **Manual Validation with test_strategy_import.json**
   ```bash
   cd app/server && uv run python -c "from core.data_models import StrategyConfig; import json; data = json.load(open('../../test_strategy_import.json')); StrategyConfig(**data['strategy']); print('✓ Validation successful - candle_count=100 (int) accepted')"
   ```

6. **Frontend Build (No Regressions)**
   ```bash
   cd app/client && npm run build
   ```

## Patch Scope
**Lines of code to change:** ~5 lines (1 import, 1 type change, 3 test cases)
**Risk level:** low
**Testing required:** Backend unit tests for StrategyConfig validation with int, str, and None values for candle_count field
