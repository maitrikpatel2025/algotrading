# Combine Conditions with AND/OR Logic

**ADW ID:** 6d049c54
**Date:** 2026-01-20
**Specification:** /home/ubuntu/algotrading/trees/6d049c54/specs/issue-72-adw-6d049c54-sdlc_planner-combine-conditions-and-or-logic.md

## Overview

This feature extends the condition builder system to support combining multiple conditions using AND/OR logical operators. Users can create complex, multi-factor trading rules by grouping conditions together with explicit logic operators, enabling strategies like "(RSI oversold AND price at support) OR (MACD bullish crossover)". The feature includes visual grouping, nested group support (up to 3 levels), a tree view visualization, and a Test Logic button to evaluate conditions against current market data.

## What Was Built

- **ConditionGroup Component**: Visual container for grouped conditions with AND/OR operator toggle, drag-and-drop reordering, and nested group support
- **LogicTreeView Component**: Alternative tree-based visualization showing condition hierarchy with AND/OR operators as nodes
- **TestLogicDialog Component**: Dialog for testing condition logic against current candle data, showing pass/fail status for each condition
- **Group State Management**: Full state management in Strategy.jsx for creating, updating, deleting, and persisting condition groups
- **Extended conditionDefaults.js**: Utility functions for group creation, validation, nesting depth checks, and logic evaluation
- **View Mode Toggle**: Switch between inline (default) and tree view in the Logic Panel header
- **Selection System**: Checkbox-based selection for grouping multiple conditions
- **Nested Groups**: Support for creating subgroups within groups, up to 3 levels deep

## Technical Implementation

### Files Modified

- `app/client/src/app/constants.js`: Added GROUP_OPERATORS, GROUP_OPERATOR_LABELS, MAX_NESTING_DEPTH, LOGIC_VIEW_MODES, LOGIC_VIEW_MODE_STORAGE_KEY, and CONDITION_GROUPS_STORAGE_KEY constants
- `app/client/src/app/conditionDefaults.js`: Added 600+ lines of group-related functions including createConditionGroup, generateGroupId, canAddToGroup, getGroupDepth, evaluateCondition, evaluateGroup, evaluateLogic, and buildLogicTree
- `app/client/src/components/LogicPanel.jsx`: Integrated ConditionGroup, LogicTreeView, and TestLogicDialog components; added view mode toggle, selection state, and group action handlers
- `app/client/src/components/ConditionBlock.jsx`: Added isInGroup and groupOperator props for group context styling
- `app/client/src/pages/Strategy.jsx`: Added groups state, group handlers (create, update, delete, operator change, ungroup, reorder), testLogicData memoization, and localStorage persistence

### New Files Created

- `app/client/src/components/ConditionGroup.jsx`: 355-line component for displaying grouped conditions with visual brackets, AND/OR toggle, drag-and-drop, and nested group rendering
- `app/client/src/components/LogicTreeView.jsx`: 273-line component for tree visualization with expandable/collapsible nodes and condition selection
- `app/client/src/components/TestLogicDialog.jsx`: 371-line dialog component for evaluating conditions against current market data with pass/fail indicators
- `.claude/commands/e2e/test_condition_groups.md`: E2E test specification for the AND/OR logic feature

### Key Changes

- Groups are stored as objects with `id`, `type: 'group'`, `operator`, `conditionIds`, `section`, `parentGroupId`, and `depth` properties
- The `conditionIds` array can contain both condition IDs and nested group IDs
- Maximum nesting depth is enforced at 3 levels via `canAddToGroup()` validation
- Logic evaluation supports recursive group evaluation with AND/OR operators
- Groups persist to localStorage under `forex_dash_condition_groups` key
- View mode preference persists to localStorage under `forex_dash_logic_view_mode` key

## How to Use

1. **Create a Group**: Select two or more ungrouped conditions using the checkboxes that appear to the left of each condition, then click the "Group Selected" button that appears
2. **Toggle Operator**: Click the AND/OR badge in the group header to switch between AND and OR logic
3. **Reorder Conditions**: Drag conditions within a group to reorder them
4. **Create Nested Groups**: Within an existing group, select conditions and click "Create Subgroup" (available when depth < 3)
5. **Ungroup Conditions**: Click the ungroup icon in the group header to flatten conditions back to the parent level
6. **Delete Group**: Click the X icon in the group header to delete the group (conditions are preserved as ungrouped)
7. **Switch View Mode**: Click the tree/list icon in the Logic Panel header to toggle between inline and tree views
8. **Test Logic**: Click the "Test Logic" button at the bottom of any section to open a dialog showing how conditions evaluate against the current candle

## Configuration

- **MAX_NESTING_DEPTH**: Set to 3 in constants.js, controls maximum allowed nesting levels for groups
- **LOGIC_VIEW_MODE_STORAGE_KEY**: localStorage key for persisting view mode preference
- **CONDITION_GROUPS_STORAGE_KEY**: localStorage key for persisting groups

## Testing

Run the E2E test specification:
```bash
# Read and execute the E2E test
cat .claude/commands/e2e/test_condition_groups.md
```

The E2E test covers:
- Creating condition groups with AND/OR operators
- Visual grouping verification (brackets/boxes)
- Toggling between AND and OR operators
- Nested group creation and depth limits
- Logic tree view toggle
- Test Logic button functionality

## Notes

- **Backward Compatibility**: Existing conditions without groups continue to work. Ungrouped conditions in a section maintain implicit AND behavior.
- **Default Operator**: New groups default to AND operator to match existing implicit behavior.
- **Auto-Persistence**: Groups automatically save to localStorage whenever they change.
- **Depth Styling**: Each nesting level uses different border colors (primary, blue, purple) for visual distinction.
- **Evaluation**: The Test Logic dialog shows real-time evaluation but currently uses placeholder indicator values; full integration with live indicator calculations is planned.
