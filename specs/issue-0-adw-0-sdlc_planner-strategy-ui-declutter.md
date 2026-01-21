# Feature: Strategy Builder UI Declutter

## Metadata
issue_number: `0`
adw_id: `0`
issue_json: `N/A`

## Feature Description
Simplify the Strategy Builder page by addressing four key UI issues: (1) sidebars open by default leave minimal chart space, (2) cluttered header with too many visible action buttons, (3) redundant UI elements with both sidebar and popup for indicators/logic, and (4) visual noise from competing toolbars and cramped empty states. This feature implements changes to collapse sidebars by default, simplify the header by moving secondary actions into a dropdown menu, and streamline the toolbar by removing redundant toggle buttons.

## User Story
As a trader
I want a clean, focused Strategy Builder interface
So that I can maximize chart visibility and reduce visual clutter when building trading strategies

## Problem Statement
The current Strategy Builder page has several UI issues that reduce usability:

1. **Too Many Sidebars Open by Default**: The Indicator Library (left, ~280px), Drawing toolbar (40px), and Logic Panel (right, ~320px) are all visible by default, leaving minimal space for the chart area.

2. **Cluttered Header Bar**: Multiple action buttons (Load, Import, Duplicate, Export, Save) are visible at once, making the header feel cramped compared to the clean library page design.

3. **Redundant UI Elements**: There's both a "+ Indicators" button in the toolbar AND a full Indicator Library sidebar. Similarly, there's both a "Logic" toggle button AND a visible Logic Panel by default.

4. **Visual Noise**: The empty state card looks cramped, and multiple toolbars and controls compete for attention.

## Solution Statement
Implement the following changes:

1. **Collapse sidebars by default**: Both Indicator Library and Logic Panel should start collapsed on initial load. Users who want them open can expand them. The collapsed state is already supported; we just need to change the default.

2. **Simplify header with actions dropdown**: Move Load, Import, Duplicate, and Export buttons into a "More" dropdown menu. Keep only the Save button prominently visible since it's the most common action.

3. **Remove redundant sidebar toggle**: Since we have the "+ Indicators" button that opens a search popup and the Logic toggle in the toolbar, we don't need the Indicator Library sidebar visible by default. The sidebar can be expanded when users want to browse categories.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/pages/Strategy.jsx` - Main Strategy Builder page containing the header bar, control bar, sidebar states, and three-column layout. This is the primary file to modify for:
  - Changing default collapsed state for sidebars (lines 107-126)
  - Moving action buttons into a dropdown menu (lines 2446-2506)
  - Adjusting toolbar layout

- `app/client/src/components/ui/DropdownMenu.jsx` - If this exists, use it for the actions dropdown. Otherwise, create a simple dropdown component.

- `ai_docs/ui_style_guide.md` - Reference for design system specifications (colors, spacing, typography) to ensure the dropdown follows the Precision Swiss design style.

- `app_docs/feature-81b4393a-strategy-builder-layout.md` - Reference documentation for the current Strategy Builder layout implementation.

- `.claude/commands/test_e2e.md` - Reference for E2E test structure.
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test file for structure reference.

### New Files
- `.claude/commands/e2e/test_strategy_ui_declutter.md` - E2E test to validate the UI declutter changes

## Implementation Plan
### Phase 1: Foundation
1. Analyze current sidebar default state logic and localStorage persistence
2. Design the "More Actions" dropdown component structure
3. Plan the header layout changes to maintain visual balance

### Phase 2: Core Implementation
1. Change sidebar default states from expanded to collapsed
2. Create or adapt a dropdown menu component for header actions
3. Restructure the header bar to show only Save and a "More" dropdown
4. Update the toolbar to remove redundant elements

### Phase 3: Integration
1. Ensure dropdown menu follows the Precision Swiss design system
2. Test sidebar collapse persistence with localStorage
3. Verify all action buttons remain accessible via the dropdown
4. Create E2E test to validate the changes

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Create `.claude/commands/e2e/test_strategy_ui_declutter.md` with test steps for:
  - Verifying sidebars are collapsed by default on initial load
  - Verifying "More" dropdown contains Load, Import, Duplicate, Export actions
  - Verifying Save button is prominently visible
  - Verifying sidebars can be expanded/collapsed via toggle buttons
  - Taking screenshots of the decluttered UI

### Step 2: Change Default Sidebar States
- In `app/client/src/pages/Strategy.jsx`:
  - Modify `isIndicatorPanelCollapsed` default state initialization (around line 107) to default to `true` (collapsed)
  - Modify `isLogicPanelCollapsed` default state initialization (around line 118) to default to `true` (collapsed)
  - The localStorage check should only override if explicitly set to `'false'`
- Current implementation already defaults to collapsed - verify this is working correctly

### Step 3: Create Dropdown Menu Component (if needed)
- Check if `app/client/src/components/ui/DropdownMenu.jsx` exists
- If not, create a simple dropdown component following the UI style guide:
  - Use Lucide icons for trigger (MoreHorizontal or ChevronDown)
  - Apply Precision Swiss styling: neutral colors, 6px border-radius, subtle shadow
  - Support click-outside-to-close behavior
  - Support keyboard navigation (Escape to close)

### Step 4: Refactor Header Bar Actions
- In `app/client/src/pages/Strategy.jsx`:
  - Import the dropdown component
  - Create a new "More" dropdown button to replace the inline action buttons
  - Move Load, Import, Duplicate, Export actions into the dropdown menu
  - Keep Save button as a standalone primary button
  - Maintain existing functionality (disabled states, click handlers)
- Header should show: [Back | Strategy Name] ---- [More v] [Save]

### Step 5: Update Action Button Styling in Dropdown
- Style dropdown menu items to match the current button style
- Include icons for each action (FolderOpen, Upload, Copy, Download)
- Maintain disabled states for Duplicate and Export when no strategy is loaded
- Add visual separator between destructive and non-destructive actions if needed

### Step 6: Clean Up Redundant Toolbar Elements
- Review the chart toolbar for any redundant toggle buttons
- Ensure "+ Indicators" button and "Logic" toggle are the only ways to access these panels
- Consider removing or simplifying the Indicator Library sidebar toggle since the search popup provides better UX

### Step 7: Run Validation Commands
- Run frontend build to check for errors
- Run E2E test to validate UI changes
- Run server tests to ensure no regressions

## Testing Strategy
### Unit Tests
- No new unit tests required - this is primarily a UI restructuring
- Existing tests should pass without modification

### Edge Cases
- Verify dropdown closes when clicking outside
- Verify dropdown closes when pressing Escape key
- Verify disabled menu items are not clickable
- Verify sidebar states persist to localStorage correctly
- Verify mobile view still works (action buttons may need different treatment)

## Acceptance Criteria
- [ ] Both sidebars (Indicator Library and Logic Panel) are collapsed by default on first visit
- [ ] Sidebar collapsed state persists to localStorage and is restored on page reload
- [ ] Header bar shows only Save button prominently, with other actions in a "More" dropdown
- [ ] "More" dropdown contains: Load, Import, Duplicate, Export actions
- [ ] Dropdown menu follows Precision Swiss design system (colors, spacing, typography)
- [ ] All action buttons in dropdown maintain their existing functionality
- [ ] Disabled states for Duplicate/Export work correctly when no strategy is loaded
- [ ] Chart area is maximized by default (both sidebars collapsed)
- [ ] E2E test passes validating the decluttered UI
- [ ] No regressions in existing functionality (save, load, export, etc.)

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate no backend regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature compiles without errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_strategy_ui_declutter.md` to validate the UI declutter changes work as expected

## Notes
- The current implementation already defaults sidebars to collapsed (see lines 107-126 in Strategy.jsx). Verify this is working correctly before making changes.
- The dropdown menu should use a simple, non-animated approach for faster perceived performance.
- Consider adding keyboard shortcut hints in the dropdown menu items (e.g., "Load... Ctrl+O") for power users.
- Mobile responsiveness: On mobile, the "More" dropdown pattern may need adjustment since touch targets should be at least 44px.
- Future consideration: A "View" menu could control sidebar visibility settings (e.g., "Show Indicator Library", "Show Logic Panel").
