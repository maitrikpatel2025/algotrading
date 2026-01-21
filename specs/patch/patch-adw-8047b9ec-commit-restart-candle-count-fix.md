# Patch: Commit and Restart Server for candle_count Validation Fix

## Metadata
adw_id: `8047b9ec`
review_change_request: `Issue #1: Strategy import fails with Pydantic validation error: 'candle_count Input should be a valid string [type=string_type, input_value=100, input_type=int]'. The fix was implemented in app/server/core/data_models.py (changing candle_count from Optional[str] to Union[int, str, None]), but the changes are uncommitted and the server is running with the old code. Resolution: Commit the changes to app/server/core/data_models.py and restart the server to apply the candle_count validation fix. The code change is correct and present in the working directory but not active in the running server. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-91-adw-8047b9ec-sdlc_planner-strategy-import-pattern-display.md
**Issue:** The candle_count validation fix has been implemented in the working directory (changing from Optional[str] to Union[int, str, None]) but the changes are uncommitted and the server is still running with the old code, causing strategy import to fail with Pydantic validation errors
**Solution:** Commit the working directory changes to app/server/core/data_models.py and app/server/tests/core/test_data_models.py, then restart the server to apply the fix

## Files to Modify
Use these files to implement the patch:

- `app/server/core/data_models.py` - Already modified (commit required)
- `app/server/tests/core/test_data_models.py` - Already modified (commit required)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Verify the current uncommitted changes
- Run `git diff app/server/core/data_models.py` to confirm the candle_count type change from `Optional[str]` to `Union[int, str, None]`
- Run `git diff app/server/tests/core/test_data_models.py` to confirm the test cases for candle_count validation
- Verify changes match the expected fix: Union type import added, candle_count field type updated, test coverage added

### Step 2: Run validation tests before committing
- Execute backend tests to ensure all tests pass with the current changes
- Execute backend linting to ensure code quality
- Execute Python syntax check to ensure no syntax errors
- This ensures we're committing working, tested code

### Step 3: Commit the candle_count validation fix
- Stage the modified files: `git add app/server/core/data_models.py app/server/tests/core/test_data_models.py`
- Create a commit with descriptive message explaining the fix
- Commit message should reference the Pydantic validation error and the Union type fix

### Step 4: Restart the server to apply changes
- Stop the running server: `./scripts/stop.sh`
- Start the server with fresh code: `./scripts/start.sh`
- Wait for server to be ready (health check on http://localhost:5000/health)
- Verify the server is running the new code by checking logs for successful startup

### Step 5: Validate the fix is active
- Test strategy import with a JSON file containing `candle_count: 100` (integer)
- Verify the import succeeds without Pydantic validation error
- Verify the strategy loads correctly in the UI
- Check server logs to confirm no validation errors

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Verify Uncommitted Changes**
   ```bash
   git diff --stat
   ```
   Expected: Shows 2 files modified (data_models.py and test_data_models.py)

2. **Python Syntax Check**
   ```bash
   cd app/server && uv run python -m py_compile core/data_models.py
   ```

3. **Backend Linting**
   ```bash
   cd app/server && uv run ruff check core/data_models.py tests/core/test_data_models.py
   ```

4. **Run Backend Tests**
   ```bash
   cd app/server && uv run pytest tests/core/test_data_models.py::TestStrategyConfig -v --tb=short
   ```

5. **Run All Backend Tests**
   ```bash
   cd app/server && uv run pytest tests/ -v --tb=short
   ```

6. **Commit Changes**
   ```bash
   git add app/server/core/data_models.py app/server/tests/core/test_data_models.py
   git commit -m "fix: update StrategyConfig.candle_count to accept int or str

- Change candle_count type from Optional[str] to Union[int, str, None]
- Add Union import to typing imports
- Add test coverage for int, str, and None values
- Fixes Pydantic validation error when importing strategies with integer candle_count

Resolves: Strategy import fails with 'Input should be a valid string' error
Issue: #91"
   ```

7. **Verify Commit**
   ```bash
   git log -1 --stat
   ```
   Expected: Shows the commit with 2 files changed

8. **Check if Server is Running**
   ```bash
   curl -s http://localhost:5000/health || echo "Server not running"
   ```

9. **Restart Server**
   ```bash
   ./scripts/stop.sh && ./scripts/start.sh
   ```

10. **Verify Server Health**
    ```bash
    sleep 5 && curl -s http://localhost:5000/health
    ```
    Expected: Server responds with health status

11. **Test Strategy Import (Manual)**
    - Use the test_strategy_import.json file in the project root
    - Import via UI or API endpoint
    - Verify no Pydantic validation error for candle_count
    - Expected: Import succeeds with candle_count=100 (int)

12. **Frontend Build (No Regressions)**
    ```bash
    cd app/client && npm run build
    ```

## Patch Scope
**Lines of code to change:** 0 lines (changes already exist, only commit + restart required)
**Risk level:** low
**Testing required:** Backend unit tests must pass before commit, manual validation of strategy import after server restart
