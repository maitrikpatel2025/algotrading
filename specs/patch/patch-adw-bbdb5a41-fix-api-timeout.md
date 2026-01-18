# Patch: Fix OpenFX API Request Timeout Issue

## Metadata
adw_id: `bbdb5a41`
review_change_request: `Issue #1: Account page hangs indefinitely with 'Loading account data...' spinner when external FXOpen API is unreachable. The _make_request() method in openfx_api.py (lines 52-102) does not configure timeout parameters on the requests.Session HTTP calls, causing connection attempts to hang for 5+ minutes instead of failing fast. Server logs show: 'Connection to marginalttdemowebapi.fxopen.net timed out' after several minutes. This makes the Account page completely unusable in environments where the external API is slow or unreachable. Resolution: Add timeout parameter to all session.get/post/put/delete calls in _make_request() method. Recommended: timeout=(5, 10) for (connect_timeout, read_timeout). This will allow the page to show error states or empty data instead of hanging indefinitely. Example: response = self.session.post(full_url, params=params, data=data, headers=headers, timeout=(5, 10)) Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-21-adw-bbdb5a41-sdlc_planner-implement-trade-history-api.md
**Issue:** The Account page hangs indefinitely when the external FXOpen API is unreachable because HTTP requests in the `_make_request()` method (app/server/core/openfx_api.py:52-102) lack timeout parameters, causing 5+ minute hangs instead of failing fast.
**Solution:** Add `timeout=(5, 10)` parameter to all `session.get()`, `session.post()`, `session.put()`, and `session.delete()` calls in the `_make_request()` method to ensure connection timeouts occur after 5 seconds and read timeouts after 10 seconds.

## Files to Modify
Use these files to implement the patch:

- `app/server/core/openfx_api.py` - Add timeout parameter to HTTP calls in _make_request() method (lines 84-91)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add timeout parameter to all HTTP requests in _make_request() method
- Open `app/server/core/openfx_api.py`
- Locate the `_make_request()` method (lines 52-102)
- Add `timeout=(5, 10)` parameter to the `session.get()` call on line 85
- Add `timeout=(5, 10)` parameter to the `session.post()` call on line 87
- Add `timeout=(5, 10)` parameter to the `session.put()` call on line 89
- Add `timeout=(5, 10)` parameter to the `session.delete()` call on line 91
- The timeout tuple format is `(connect_timeout, read_timeout)` where connect_timeout=5 seconds and read_timeout=10 seconds

### Step 2: Verify exception handling covers timeout scenarios
- Confirm the existing `except Exception as error` block (line 101-102) properly catches `requests.exceptions.Timeout` exceptions
- The current exception handling already returns `False, {'Exception': str(error)}` which will properly handle timeout errors
- No changes needed to exception handling logic

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Python Syntax Check**
   ```bash
   cd app/server && uv run python -m py_compile core/openfx_api.py
   ```

2. **Backend Code Quality Check**
   ```bash
   cd app/server && uv run ruff check .
   ```

3. **Backend Unit Tests**
   ```bash
   cd app/server && uv run pytest tests/ -v --tb=short
   ```

4. **Frontend Build**
   ```bash
   cd app/client && npm run build
   ```

## Patch Scope
**Lines of code to change:** 4 lines (add timeout parameter to 4 HTTP method calls)
**Risk level:** low
**Testing required:** Verify all existing backend tests pass, confirm Account page loads without hanging when API is unreachable
