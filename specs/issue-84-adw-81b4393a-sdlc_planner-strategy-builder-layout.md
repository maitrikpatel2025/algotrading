# Feature: Update Strategy Builder Page Layout

## Metadata
issue_number: `84`
adw_id: `81b4393a`
issue_json: `{"number":84,"title":"Feature Update Strategy Builder Page Layout","body":"..."}`

## Feature Description
Update the Strategy Builder page layout to implement a well-organized three-column layout with clear separation between indicators, chart, and logic building. This is a **UI/UX only change** - no functionality modifications are allowed. The update must follow the UI style guide for component design while preserving all existing features and behaviors.

The redesign focuses on:
- A dedicated Page Header Bar with strategy name editing and action buttons
- A Control Bar for currency pair selection, timeframe, and active indicators display
- Clear three-column layout: Left Sidebar (Indicator Library), Center (Chart), Right Sidebar (Logic Panel)
- Improved responsive behavior with collapsible sidebars on smaller screens

## User Story
As a trader
I want a well-organized three-column layout with clear separation between indicators, chart, and logic building
So that I can efficiently analyze charts, add indicators, and build trading conditions all in one view

## Problem Statement
The current Strategy page layout, while functional, can be improved for better organization and user experience. Users need:
- A dedicated header bar for strategy management actions (Save, Duplicate, Export)
- A control bar that consolidates pair selection, timeframe, and active indicator chips
- Better visual separation between the three main functional areas
- Improved responsive behavior on smaller screens

## Solution Statement
Reorganize the Strategy page UI into clearly defined sections:
1. **Page Header Bar** - Strategy name (editable) + action buttons (Save Draft, Duplicate, Export JSON)
2. **Control Bar** - Currency pair dropdown, timeframe buttons, active indicator chips, settings/layout toggles
3. **Three-Column Layout** - Indicator Library (left), Price Chart (center), Logic Panel (right)

All existing functionality remains unchanged - this is purely a visual/layout restructuring following the UI style guide's 4px base unit spacing system and component patterns.

## Relevant Files
Use these files to implement the feature:

**Primary Files to Modify:**
- `app/client/src/pages/Strategy.jsx` - Main Strategy page component that orchestrates the layout, needs restructuring for new header bar, control bar, and three-column layout
- `app/client/src/components/PriceChart.jsx` - Price chart component that displays active indicators as chips; may need adjustment for control bar integration
- `app/client/src/components/IndicatorLibrary.jsx` - Left sidebar component for indicator selection; may need collapse/expand enhancements
- `app/client/src/components/LogicPanel.jsx` - Right sidebar component for condition building; may need collapse/expand enhancements

**Supporting Files:**
- `app/client/src/components/Button.jsx` - Button component for consistent styling
- `app/client/src/components/Select.jsx` - Select component for dropdowns
- `app/client/src/components/PairSelector.jsx` - Currency pair selector component
- `app/client/src/components/TradeDirectionSelector.jsx` - Trade direction component
- `app/client/src/components/CandleCloseToggle.jsx` - Candle close confirmation toggle
- `ai_docs/ui_style_guide.md` - UI style guide with spacing, color, and component guidelines

**Documentation to Reference:**
- `app_docs/feature-b11af5b7-strategy-page-layout-redesign.md` - Previous layout redesign documentation
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test for Strategy page
- `.claude/commands/e2e/test_strategy_page_layout.md` - Existing layout E2E test to update

### New Files
- `.claude/commands/e2e/test_strategy_builder_layout.md` - New E2E test file to validate the updated three-column layout and new UI structure

## Implementation Plan

### Phase 1: Foundation - Header Bar and Control Bar Components
Create the new header bar and control bar sections within the Strategy page. These will consolidate existing elements into dedicated UI regions.

### Phase 2: Core Implementation - Three-Column Layout Restructuring
Reorganize the main content area into a proper three-column grid layout with the indicator library on the left, chart in the center, and logic panel on the right. Update responsive behavior for the new layout structure.

### Phase 3: Integration - Active Indicators in Control Bar
Move the active indicators display from the PriceChart component to the new control bar, displaying them as removable chips with proper styling.

## Step by Step Tasks

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand the E2E test structure
- Read `.claude/commands/e2e/test_trading_dashboard.md` and `.claude/commands/e2e/test_strategy_page_layout.md` as examples
- Create `.claude/commands/e2e/test_strategy_builder_layout.md` with test steps validating:
  - Page Header Bar displays with editable strategy name and action buttons
  - Control Bar shows currency pair selector, timeframe buttons, and active indicator chips
  - Three-column layout with proper sidebar widths and chart in center
  - Collapsible sidebars on smaller screens
  - Responsive behavior on tablet and mobile viewports
  - All existing functionality still works (no regressions)

### Step 2: Implement Page Header Bar in Strategy.jsx
- Locate the current page header section in Strategy.jsx
- Create a new dedicated header bar container below the navigation
- Add editable strategy name field with inline editing (reuse existing strategy name state)
- Move/reorganize action buttons: Save Draft, Duplicate, Export JSON
- Apply proper spacing following UI style guide (py-4, px-6, gap-4)
- Style using existing Button component with appropriate icons (Save, Copy, Download)
- Ensure header bar spans full width and has border-bottom separation

### Step 3: Implement Control Bar in Strategy.jsx
- Create a new control bar container below the header bar
- Move PairSelector component into the control bar
- Create timeframe selector button group (1m, 5m, 15m, 1h, 4h, 1d) - refactor existing Select into toggle buttons
- Add active indicators section with removable chips/tags
- Add settings icon button (use existing settings functionality if available)
- Add layout toggle icon button for sidebar collapse
- Apply proper spacing (py-3, px-6, gap-4)
- Ensure control bar is responsive (flex-wrap on smaller screens)

### Step 4: Restructure Three-Column Layout
- Modify the main content area to use CSS Grid for three-column layout
- Configure grid: `grid-cols-[280px_1fr_320px]` for desktop
- Configure responsive breakpoints:
  - lg and above: three columns visible
  - md: two columns (chart + right panel), left panel collapsible overlay
  - sm and below: single column with overlay panels
- Ensure chart area takes remaining flex space with min-width constraints
- Apply proper gap spacing between columns (gap-6)

### Step 5: Update Left Sidebar (Indicator Library) Styling
- Ensure IndicatorLibrary has proper width (280px default, min 250px, max 320px)
- Update collapse behavior to animate smoothly (transition-all duration-200)
- When collapsed, show minimal 40px bar with expand icon
- Add resize handle on right edge for user-adjustable width
- Ensure proper border-right styling for visual separation
- Verify search, categories, and drag-drop still work correctly

### Step 6: Update Center Chart Area Styling
- Remove any fixed width constraints - chart should fill available space
- Ensure PriceChart container respects the grid column
- Maintain existing chart controls (type selector, volume toggle, drawing tools)
- Verify current price display is prominent at top of chart area
- Ensure chart zoom/pan functionality works correctly
- Verify indicators render correctly on chart when dragged

### Step 7: Update Right Sidebar (Logic Panel) Styling
- Ensure LogicPanel has proper width (320px default, min 280px, max 400px)
- Update collapse behavior to animate smoothly (transition-all duration-200)
- When collapsed, show minimal 40px bar with expand icon
- Add resize handle on left edge for user-adjustable width
- Ensure proper border-left styling for visual separation
- Verify condition cards, AND/OR logic, execution mode selector all work

### Step 8: Move Active Indicators to Control Bar
- In PriceChart.jsx, identify the active indicators chip display section
- Move this display logic to the control bar in Strategy.jsx
- Create removable chip components for each active indicator
- Style chips with indicator color stripe on left border
- Add X button on each chip for removal
- Wire up remove handler to existing onRemoveIndicator callback
- Ensure clicking chip opens indicator settings dialog (existing functionality)

### Step 9: Update Mobile Responsive Layout
- Ensure left sidebar collapses to overlay on mobile (<md breakpoint)
- Ensure right sidebar collapses to overlay on mobile
- Update floating action buttons positioning (bottom-6)
- Ensure toggle buttons show/hide overlays correctly
- Add backdrop overlay when mobile panels are open
- Ensure chart area expands to full width when sidebars are collapsed

### Step 10: Apply UI Style Guide Consistency
- Review all new elements against ai_docs/ui_style_guide.md
- Verify spacing uses 4px base unit system (space-2, space-4, space-6, space-8)
- Verify colors use CSS variables (--primary, --muted, --border, etc.)
- Verify typography follows style guide (font sizes, weights)
- Ensure consistent border-radius using --radius variable
- Verify button variants match style guide patterns

### Step 11: Verify No Functionality Changes
- Test currency pair selection loads correct chart data
- Test timeframe selection updates chart correctly
- Test drag-and-drop adds indicator to chart
- Test indicator removal works from chip
- Test indicator parameter customization via click
- Test all indicator categories expand/collapse
- Test indicator search filters correctly
- Test condition cards save correctly
- Test AND/OR logic between conditions
- Test execution mode selection
- Test Save Draft, Duplicate, Export functionality
- Test sidebar collapse/expand works

### Step 12: Run Validation Commands
- Run `cd app/server && uv run pytest` to validate server tests pass
- Run `cd app/client && npm run build` to validate frontend build succeeds
- Run the new E2E test `.claude/commands/e2e/test_strategy_builder_layout.md` to validate UI changes
- Verify no console errors or warnings in browser

## Testing Strategy

### Unit Tests
- No new unit tests required as this is a UI-only change with no new business logic
- Existing tests should continue to pass as functionality is unchanged

### Edge Cases
- Test with 0 active indicators (chips section empty)
- Test with maximum indicators (5 overlay + 3 subchart)
- Test with very long strategy name (truncation handling)
- Test with collapsed sidebars and overlay panels open
- Test rapid toggle of collapse/expand
- Test resize handles at min/max boundaries
- Test on various screen sizes (320px, 768px, 1024px, 1440px, 1920px)

## Acceptance Criteria

1. Page displays three-column layout with indicator library on left, chart in center, and logic panel on right
2. Header bar shows editable strategy name and action buttons (Save Draft, Duplicate, Export JSON)
3. Control bar allows selecting currency pair and timeframe, and displays active indicators as removable chips
4. Users can drag indicators from the library onto the chart (existing functionality preserved)
5. Users can build conditions in the logic panel with WHEN/IS/VALUE/THEN structure (existing functionality preserved)
6. All work is auto-saved as draft to prevent data loss (existing functionality preserved)
7. Layout is responsive and sidebars can be collapsed on smaller screens
8. All spacing follows UI style guide 4px base unit system
9. No functionality changes - all existing features work exactly as before

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_strategy_builder_layout.md` to validate the new layout works correctly

## Notes

- **CRITICAL: UI-only changes** - Do not modify any business logic, API calls, state management patterns, or data handling. This is purely a visual/layout restructuring.
- The existing Strategy.jsx is approximately 1500+ lines with complex state management. Be careful to only modify JSX structure and CSS classes, not the JavaScript logic.
- The existing layout was recently redesigned (see app_docs/feature-b11af5b7-strategy-page-layout-redesign.md) to use a stacked full-width layout. This feature reverts to a proper three-column grid layout as specified in the requirements.
- Follow the UI style guide strictly for all spacing, colors, and component patterns.
- The timeframe selector currently uses a Select dropdown. The feature requires changing this to button group (toggle buttons) for better UX. This is a visual change only - the underlying state management remains the same.
- Active indicators are currently displayed inside PriceChart component. Moving them to the control bar requires careful prop threading but no logic changes.
- All localStorage keys and persistence mechanisms must remain unchanged.
- Use existing icon components from lucide-react (Save, Copy, Download, Settings, LayoutGrid, etc.)
