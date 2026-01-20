# Patch: Fix FastAPI route ordering for strategies endpoints

## Metadata
adw_id: `61b69256`
review_change_request: `FastAPI route ordering issue: The route '@app.get("/api/strategies/extended")' at line 973 in server.py is positioned after '@app.get("/api/strategies/{strategy_id}")' at line 893. FastAPI matches routes in order, so requests to /api/strategies/extended are incorrectly caught by the {strategy_id} route, treating 'extended' as an ID. This causes a 404 error when the Load Strategy dialog tries to fetch the strategies list.`

## Issue Summary
**Original Spec:** N/A
**Issue:** The `/api/strategies/extended` endpoint is defined after the parameterized `/api/strategies/{strategy_id}` endpoint in server.py. FastAPI matches routes in registration order, so "extended" is being interpreted as a strategy ID, causing 404 errors.
**Solution:** Move the `/api/strategies/extended` route definition to appear before the `/api/strategies/{strategy_id}` route.

## Files to Modify
- `app/server/server.py` - Move the `list_strategies_extended` endpoint (lines 973-1010) to before the `get_strategy` endpoint (line 893)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Cut the `/api/strategies/extended` endpoint
- Remove the entire endpoint function at lines 973-1010 (including the route decorator and the `list_strategies_extended` function)
- This includes the docstring and full function body through the final exception handler

### Step 2: Paste the endpoint before `/api/strategies/{strategy_id}`
- Insert the cut endpoint immediately before line 893 (before the `@app.get("/api/strategies/{strategy_id}")` decorator)
- Ensure proper blank line spacing (two blank lines between functions per PEP8)

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Python Syntax Check**
   - Command: `cd app/server && uv run python -m py_compile server.py`

2. **Backend Linting**
   - Command: `cd app/server && uv run ruff check server.py`

3. **All Backend Tests**
   - Command: `cd app/server && uv run pytest tests/ -v --tb=short`

4. **Frontend Build**
   - Command: `cd app/client && npm run build`

## Patch Scope
**Lines of code to change:** ~40 lines (move only, no content changes)
**Risk level:** low
**Testing required:** Backend syntax check, linting, and API tests to verify route ordering is correct
