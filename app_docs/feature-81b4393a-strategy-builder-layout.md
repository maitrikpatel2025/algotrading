# Feature: Strategy Builder Three-Column Layout

**ADW ID:** 81b4393a
**Date:** 2026-01-20
**Specification:** specs/issue-84-adw-81b4393a-sdlc_planner-strategy-builder-layout.md

## Overview

This feature reorganizes the Strategy Builder page into a well-structured three-column layout with a dedicated Page Header Bar, Control Bar, and clear separation between the Indicator Library (left), Chart (center), and Logic Panel (right). The update improves visual organization and responsive behavior while preserving all existing functionality.

## What Was Built

- **Page Header Bar** - Dedicated header section with editable strategy name and action buttons (Load, Import, Export, Duplicate, Save)
- **Control Bar** - Consolidated controls including currency pair selector, timeframe toggle buttons, active indicator chips, trade direction selector, candle close toggle, and layout toggle buttons
- **Three-Column Layout** - CSS Grid-based layout with Indicator Library (280px left), Chart (flexible center), and Logic Panel (320px right)
- **Collapsible Sidebars** - Both left (Indicator Library) and right (Logic Panel) sidebars can be collapsed with smooth transitions
- **Active Indicators Chips** - Moved from PriceChart component to Control Bar with removable chips showing indicator color coding
- **Timeframe Toggle Buttons** - Changed from Select dropdown to button group (1m, 5m, 15m, 1h, 4h, 1d) for better UX
- **Responsive Mobile Layout** - Overlay panels for mobile/tablet with floating action buttons

## Technical Implementation

### Files Modified

- `app/client/src/pages/Strategy.jsx`: Major restructuring with new header bar, control bar, three-column grid layout, active indicator chips, timeframe button group, editable strategy name, and collapsible sidebar state management
- `app/client/src/components/LogicPanel.jsx`: Added support for controlled collapsed state via `isCollapsed` and `onToggleCollapse` props to enable parent-controlled collapse behavior
- `.claude/commands/e2e/test_strategy_builder_layout.md`: New E2E test specification for validating the updated layout

### Key Changes

- **Page Header Bar**: New section with inline-editable strategy name (click to edit, Enter to save, Escape to cancel) and relocated action buttons (Load, Import, Export, Duplicate, Save)
- **Control Bar**: Consolidated controls with PairSelector, timeframe toggle button group (replaced Select dropdown), active indicator chips with color-coded left borders and X remove buttons, trade direction selector, candle close toggle, and layout toggle buttons for sidebar visibility
- **Three-Column Grid**: Uses flexbox layout with fixed-width sidebars (280px left, 320px right) and flexible center chart area. Sidebars collapse to 40px width with smooth transitions
- **State Management**: Added `isLogicPanelCollapsed` state with localStorage persistence (`forex_dash_logic_panel_collapsed`), `isEditingName` and `editingNameValue` for strategy name editing
- **Mobile Responsive**: Changed breakpoint from `md` to `lg` for three-column layout, overlay panels for both sidebars on mobile with backdrop

## How to Use

1. **Strategy Name Editing**: Click on the strategy name in the header bar to enter edit mode. Press Enter to save or Escape to cancel
2. **Timeframe Selection**: Click any timeframe button (1m, 5m, 15m, 1h, 4h, 1d) in the control bar to change the chart timeframe
3. **Active Indicators**: View all active indicators as chips in the control bar. Click a chip to edit settings, click X to remove
4. **Sidebar Toggle**: Use the layout toggle buttons in the control bar to show/hide the Indicator Library (left) or Logic Panel (right)
5. **Mobile View**: On smaller screens, use the floating action buttons at the bottom to open the Indicator Library or Logic Panel as overlays

## Configuration

- **localStorage Keys**:
  - `forex_dash_preferred_timeframe`: Persists selected timeframe
  - `forex_dash_indicator_panel_collapsed`: Persists left sidebar collapsed state
  - `forex_dash_logic_panel_collapsed`: Persists right sidebar collapsed state

## Testing

Run the E2E test to validate the layout:
1. Read `.claude/commands/test_e2e.md` for test runner instructions
2. Execute `.claude/commands/e2e/test_strategy_builder_layout.md` to validate:
   - Page Header Bar displays with editable strategy name and action buttons
   - Control Bar shows currency pair selector, timeframe buttons, and active indicator chips
   - Three-column layout with proper sidebar widths and chart in center
   - Collapsible sidebars on desktop
   - Responsive behavior on tablet and mobile viewports
   - All existing functionality preserved (no regressions)

## Notes

- This is a **UI-only change** - no business logic, API calls, or state management patterns were modified
- The layout uses CSS flexbox instead of CSS Grid for the three-column structure, with fixed sidebar widths and flexible center
- Active indicator chips retain all existing functionality: click to edit, X to remove, color coding from indicator settings
- Timeframe selection now uses toggle buttons for better visual feedback of the selected timeframe
- Sidebar collapse state is persisted separately for left and right panels
- Mobile breakpoint changed from `md` (768px) to `lg` (1024px) for better tablet experience
