# Patch: Add category field to OptionItem data model

## Metadata
adw_id: `93082afa`
review_change_request: `Issue #1: The PairSelector dropdown shows 'No pairs match' instead of displaying categorized pairs (Majors, Minors, Exotics). The root cause is that the OptionItem data model in app/server/core/data_models.py is missing the 'category' field. While api/routes.py correctly adds categories to each pair option, the Pydantic model validation strips this field out before the response is sent to the frontend, causing the PairSelector component to filter out all pairs. Resolution: Add 'category: Optional[str] = None' field to the OptionItem class in app/server/core/data_models.py (around line 74). This will allow the category field to pass through the API response validation and reach the frontend PairSelector component, enabling the categorized display of Majors, Minors, and Exotics as specified. Severity: blocker`

## Issue Summary
**Original Spec:** `specs/issue-42-adw-93082afa-sdlc_planner-searchable-pair-selector.md`
**Issue:** The `OptionItem` Pydantic model lacks a `category` field, causing Pydantic to strip the category data added in `api/routes.py` before the API response reaches the frontend. This results in the PairSelector showing "No pairs match" instead of categorized pairs.
**Solution:** Add `category: Optional[str] = None` field to the `OptionItem` class in `data_models.py` to allow category data to pass through validation.

## Files to Modify
Use these files to implement the patch:

- `app/server/core/data_models.py` - Add `category` field to `OptionItem` class (line 61-65)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add category field to OptionItem class
- Edit `app/server/core/data_models.py`
- Locate the `OptionItem` class (lines 61-65)
- Add `category: Optional[str] = None` field after the existing fields (key, text, value)
- The updated class should look like:
  ```python
  class OptionItem(BaseModel):
      """Single option item for dropdowns."""
      key: str
      text: str
      value: str
      category: Optional[str] = None
  ```

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/server && uv run python -m py_compile server.py core/*.py` - Verify Python syntax is valid
2. `cd app/server && uv run ruff check .` - Verify code quality passes
3. `cd app/server && uv run pytest tests/ -v --tb=short` - Verify all backend tests pass
4. `cd app/client && npm run build` - Verify frontend builds successfully
5. Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_searchable_pair_selector.md` - Verify the PairSelector displays categorized pairs correctly

## Patch Scope
**Lines of code to change:** 1
**Risk level:** low
**Testing required:** Backend syntax check, linting, unit tests, frontend build, and E2E test for PairSelector component
