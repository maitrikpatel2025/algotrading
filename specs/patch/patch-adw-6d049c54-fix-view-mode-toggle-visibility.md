# Patch: Fix view mode toggle button visibility in Logic Panel header

## Metadata
adw_id: `6d049c54`
review_change_request: `Issue #2: View mode toggle button (inline/tree view) is not rendering in the Logic Panel header. The code exists at LogicPanel.jsx lines 648-665 with proper onClick handler (handleViewModeToggle), but the button with aria-label 'Switch to tree view' cannot be found in the DOM. This prevents users from switching to the tree view visualization.`

## Issue Summary
**Original Spec:** N/A (feature implementation issue)
**Issue:** The view mode toggle button in the Logic Panel header (lines 648-665) is not visible in the DOM, despite the code being present. Screenshots show only the collapse button (ChevronRight) is visible, while the view mode toggle button (ListTree/List icons) is missing.
**Solution:** After investigating the code structure, imports, and screenshots, the button JSX appears correct. The issue may be that the button is rendering but the lucide-react icons (ListTree/List) are not displaying due to an import/rendering issue, or there could be a CSS issue affecting visibility. Need to verify the button element exists and debug why it's not visible.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/components/LogicPanel.jsx` - Contains the view mode toggle button (lines 648-665)

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Verify button rendering with browser dev tools
- Start the application and navigate to Strategy page
- Open browser dev tools and inspect the Logic Panel header
- Search for the button with `aria-label="Switch to tree view"` or the ListTree icon
- Determine if the button element exists in the DOM but is hidden/invisible

### Step 2: Add explicit data-testid and verify icon rendering
- Add `data-testid="view-mode-toggle"` to the view mode toggle button for easier debugging and testing
- Ensure the ListTree and List icons from lucide-react are rendering correctly
- If icons are not rendering, check for CSS issues or try adding explicit width/height attributes

### Step 3: Debug potential CSS visibility issues
- Check if the button has any CSS that could hide it (visibility: hidden, opacity: 0, display: none, overflow clipping)
- Verify the parent container `flex items-center gap-1` is properly displaying both buttons
- Check if there's any overflow:hidden on the header that could be clipping the first button

### Step 4: Test the fix
- Run the frontend build to verify no compilation errors
- Manually test that the view mode toggle button is now visible and clickable
- Verify clicking the button toggles between inline and tree view modes

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/server && uv run python -m py_compile server.py core/*.py` - Python syntax check
2. `cd app/server && uv run ruff check .` - Backend linting
3. `cd app/server && uv run pytest tests/ -v --tb=short` - Backend tests
4. `cd app/client && npm run build` - Frontend build verification
5. Manual verification: Navigate to Strategy page, verify view mode toggle button is visible in Logic Panel header with aria-label "Switch to tree view"

## Patch Scope
**Lines of code to change:** ~5-10 lines
**Risk level:** low
**Testing required:** Frontend build verification + manual visual verification that the button appears and functions correctly
