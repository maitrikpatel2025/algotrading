# Auto-Create Condition Block on Indicator Drop

**ADW ID:** 41bf1b05
**Date:** 2026-01-19
**Specification:** /home/ubuntu/algotrading/trees/41bf1b05/specs/issue-48-adw-41bf1b05-sdlc_planner-auto-create-condition-block.md

## Overview

This feature automatically creates a condition block in a new Logic Panel whenever a user drops an indicator onto the chart. The condition block is pre-populated with a default trading condition based on the indicator type (e.g., "Close crosses above EMA (50)"), allowing traders to immediately start defining trading rules without manual setup.

## What Was Built

- **Logic Panel** - A collapsible right sidebar with Entry and Exit condition sections
- **Condition Block Component** - Individual condition cards with indicator reference, comparison operators, and right operand dropdowns
- **Condition Dropdown** - Reusable dropdown for selecting indicator instances, price sources, and numeric values
- **Confirm Dialog** - Confirmation dialogs for indicator/condition deletion
- **Condition Defaults System** - Default condition templates and comparison operators by indicator type
- **Visual Connections** - Hover highlighting between condition blocks and chart indicators
- **Drag-and-Drop** - Support for moving conditions between Entry and Exit sections

## Technical Implementation

### Files Modified

- `app/client/src/pages/Strategy.jsx`: Added LogicPanel integration, condition state management, confirmation dialogs, hover highlighting, and mobile panel toggle
- `app/client/src/app/indicators.js`: Added `getIndicatorDisplayName()` function and indicator display name generation with parameters
- `app/client/src/index.css`: Added fly-in animation keyframes for condition block creation

### New Files Created

- `app/client/src/components/LogicPanel.jsx`: Right sidebar panel with Entry/Exit sections, drag-drop support, and collapsible state with localStorage persistence
- `app/client/src/components/ConditionBlock.jsx`: Condition card with indicator color accent, dropdowns for condition configuration, delete button, and hover state
- `app/client/src/components/ConditionDropdown.jsx`: Searchable grouped dropdown with price sources, indicator instances, and numeric input support
- `app/client/src/components/ConfirmDialog.jsx`: Reusable confirmation dialog with customizable actions and warning/danger variants
- `app/client/src/app/conditionDefaults.js`: Comparison operators, price sources, condition sections, and default condition template generator

### Key Changes

- Dropping an indicator creates both the chart indicator AND a linked condition block simultaneously
- Each indicator has a unique instance ID format: `{indicator.id}-{timestamp}` for tracking
- Display names include parameters: "EMA (50)", "RSI (14)", "BB (20, 2.0)", "MACD (12, 26, 9)"
- Conditions support cross-indicator comparisons via grouped dropdown options
- Undo (Ctrl+Z) removes both indicators and their associated conditions
- Confirmation dialogs prevent accidental deletion of indicators with linked conditions

## How to Use

1. Navigate to the Strategy page
2. The Logic Panel appears on the right side of the screen (collapsible)
3. Drag any indicator from the Indicator Library onto the chart
4. A condition block automatically appears in the Entry Conditions section
5. Customize the condition using the three dropdowns:
   - Left operand (price sources or indicator values)
   - Comparison operator (crosses above, crosses below, is above, is below, equals)
   - Right operand (other indicators, price sources, or numeric values)
6. Drag condition blocks between Entry and Exit sections as needed
7. Hover over a condition block to highlight the corresponding indicator on the chart
8. Delete conditions individually (indicator remains) or delete indicator (with option to remove all conditions)

## Configuration

- Logic Panel collapsed state is persisted to `localStorage` key: `forex_dash_logic_panel_collapsed`
- No additional configuration required - feature works out of the box

## Testing

- E2E test specification created at `.claude/commands/e2e/test_auto_condition_block.md`
- Run E2E tests: `cd app/client && npx playwright test`
- Run frontend build: `cd app/client && npm run build`
- Run server tests: `cd app/server && uv run pytest`

## Notes

- This feature is frontend-only; no backend changes were required
- Condition evaluation and actual trading execution are out of scope
- The Logic Panel design mirrors the Indicator Library panel for visual consistency
- Multi-line indicators (Bollinger Bands, MACD, Stochastic) support sub-component selection (upper/middle/lower bands, signal/histogram lines)
- Future enhancements may include condition persistence to backend, import/export configurations, and condition templates
