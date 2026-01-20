# Feature: Combine Conditions with AND/OR Logic

## Metadata
issue_number: `72`
adw_id: `6d049c54`
issue_json: `{"number":72,"title":"Feature Combine Conditions with AND/OR Logic US-VSB-017","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\n\n Combine Conditions with AND/OR Logic\n\nI want to combine multiple conditions using AND/OR operators\nSo that I can create complex, multi-factor trading rules\nAcceptance Criteria:\n\n Conditions can be grouped with AND or OR operators\n Visual grouping with brackets/boxes shows logic structure\n Drag-and-drop to reorder conditions within groups\n Nested groups supported: \"(A AND B) OR (C AND D)\"\n Maximum nesting depth: 3 levels\n Logic tree view available as alternative to inline view\n \"Test Logic\" button evaluates conditions against current candle"}`

## Feature Description
This feature extends the condition builder system to support combining multiple conditions using AND/OR logical operators. Users will be able to create complex, multi-factor trading rules by grouping conditions together with explicit logic operators. The feature includes visual grouping with brackets/boxes, drag-and-drop reordering within groups, nested group support (up to 3 levels deep), an alternative logic tree view, and a "Test Logic" button to evaluate conditions against current market data.

Currently, all conditions within a section are implicitly treated as AND (all conditions must be true). This feature makes the logical relationship explicit and allows OR logic, enabling trading strategies like "(RSI oversold AND price at support) OR (MACD bullish crossover)".

## User Story
As a forex trader
I want to combine multiple conditions using AND/OR operators
So that I can create complex, multi-factor trading rules that capture nuanced market conditions

## Problem Statement
The current condition system only supports implicit AND logic - all conditions in a section must be true for the signal to fire. Traders need more flexibility to create complex rules like:
- "Enter long when (RSI < 30 AND price at support) OR (MACD bullish cross)"
- "Exit when (price hits resistance AND momentum decreasing) OR (stop loss triggered)"
This limitation prevents traders from implementing sophisticated multi-factor trading strategies.

## Solution Statement
Implement a condition grouping system that allows users to:
1. Wrap conditions in logical groups with AND/OR operators
2. Visually see the logic structure with brackets and connecting lines
3. Reorder conditions within groups via drag-and-drop
4. Create nested groups up to 3 levels deep
5. View conditions in an alternative tree format
6. Test their logic against current market data

The solution builds on the existing condition system, extending the data model to support groups while maintaining backward compatibility with existing flat conditions.

## Relevant Files
Use these files to implement the feature:

### Core Files to Modify
- `app/client/src/app/conditionDefaults.js` - Extend with group creation functions, group validation, logic evaluation, and tree-building utilities
- `app/client/src/app/constants.js` - Add GROUP_OPERATORS, MAX_NESTING_DEPTH, logic panel constants
- `app/client/src/components/LogicPanel.jsx` - Integrate ConditionGroup component, add tree view toggle, add Test Logic button
- `app/client/src/components/ConditionBlock.jsx` - Add group membership styling, update drag-drop for group context
- `app/client/src/pages/Strategy.jsx` - Add group state management, group handlers, Test Logic handler

### Documentation Files to Read
- `app_docs/feature-a73d36d3-logic-builder-panel.md` - Understand current Logic Panel architecture
- `app_docs/feature-f5db94d8-price-based-conditions.md` - Understand condition creation and validation
- `app_docs/feature-cc3d2663-indicator-based-conditions.md` - Understand indicator-based conditions
- `.claude/commands/test_e2e.md` - Understand E2E test format
- `.claude/commands/e2e/test_logic_builder_panel.md` - Example E2E test for Logic Panel

### New Files
- `app/client/src/components/ConditionGroup.jsx` - New component for displaying a group of conditions with AND/OR operator
- `app/client/src/components/LogicTreeView.jsx` - New component for tree-based visualization of condition logic
- `app/client/src/components/TestLogicDialog.jsx` - New component for Test Logic dialog showing evaluation results
- `.claude/commands/e2e/test_condition_groups.md` - New E2E test specification for AND/OR logic feature

## Implementation Plan
### Phase 1: Foundation
- Extend the data model in `conditionDefaults.js` to support condition groups
- Add constants for group operators (AND/OR), nesting limits, and storage keys
- Create utility functions for group creation, validation, and serialization
- Ensure backward compatibility with existing flat conditions

### Phase 2: Core Implementation
- Create `ConditionGroup.jsx` component with visual brackets/boxes styling
- Implement AND/OR operator toggle within groups
- Add drag-and-drop support for reordering conditions within groups
- Implement nested group support with depth validation (max 3 levels)
- Create `LogicTreeView.jsx` as alternative visualization

### Phase 3: Integration
- Integrate `ConditionGroup` into `LogicPanel.jsx`
- Add "Create Group" functionality to combine existing conditions
- Add "Ungroup" functionality to flatten groups
- Implement "Test Logic" button and evaluation dialog
- Update Strategy page state management for groups

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_logic_builder_panel.md` and `.claude/commands/e2e/test_indicator_based_conditions.md` as examples
- Create `.claude/commands/e2e/test_condition_groups.md` with comprehensive test steps for:
  - Creating condition groups with AND/OR operators
  - Visual grouping verification (brackets/boxes)
  - Drag-and-drop reordering within groups
  - Nested groups (up to 3 levels)
  - Logic tree view toggle
  - Test Logic button functionality

### Step 2: Extend Constants
- Open `app/client/src/app/constants.js`
- Add `GROUP_OPERATORS` constant: `{ AND: 'and', OR: 'or' }`
- Add `GROUP_OPERATOR_LABELS`: `{ and: 'AND', or: 'OR' }`
- Add `MAX_NESTING_DEPTH` constant: `3`
- Add `LOGIC_VIEW_MODES`: `{ INLINE: 'inline', TREE: 'tree' }`
- Add `LOGIC_VIEW_MODE_STORAGE_KEY`: `'forex_dash_logic_view_mode'`

### Step 3: Extend Condition Data Model
- Open `app/client/src/app/conditionDefaults.js`
- Add `generateGroupId()` function to create unique group IDs
- Add `createConditionGroup(operator, section, conditions, parentGroupId)` function:
  ```javascript
  {
    id: "group-{timestamp}-{random}",
    type: 'group',
    operator: 'and' | 'or',
    conditions: [], // Child condition IDs or nested group IDs
    section: 'long_entry' | 'long_exit' | 'short_entry' | 'short_exit',
    parentGroupId: null | "group-xxx", // For nested groups
    depth: 0-2, // Calculated from parent chain
  }
  ```
- Add `isConditionGroup(item)` helper to check if item is a group
- Add `getGroupDepth(groupId, groups)` to calculate nesting depth
- Add `canAddToGroup(groupId, groups)` to check if depth allows adding
- Add `validateGroupStructure(groups, conditions)` for integrity checks
- Add `flattenGroupToConditions(group, groups)` to extract conditions from group
- Add `buildLogicTree(conditions, groups)` to build tree structure for display

### Step 4: Add Group Evaluation Logic
- In `app/client/src/app/conditionDefaults.js`, add:
- `evaluateCondition(condition, candleData, indicators)` - Evaluate single condition against data
- `evaluateGroup(group, conditions, candleData, indicators)` - Recursively evaluate group logic
- `evaluateLogic(section, conditions, groups, candleData, indicators)` - Entry point for section evaluation
- Return evaluation result with details: `{ result: boolean, details: [...] }`

### Step 5: Create ConditionGroup Component
- Create `app/client/src/components/ConditionGroup.jsx`
- Props: `group`, `conditions`, `groups`, `onOperatorChange`, `onConditionReorder`, `onUngroup`, `onAddCondition`, `activeIndicators`, `getIndicatorDisplayName`, `onConditionUpdate`, `onConditionDelete`, `onIndicatorHover`, `highlightedIndicatorId`, `depth`
- Visual design:
  - Rounded container with subtle border/background showing group boundary
  - AND/OR toggle button between conditions
  - Visual bracket/line on left side indicating grouping
  - Depth indication via border color or indentation
  - Drag handle for reordering conditions within group
- Render child conditions using ConditionBlock
- Render nested groups recursively (check depth < MAX_NESTING_DEPTH)
- Show "Add Condition" and "Create Sub-group" buttons
- Show "Ungroup" button to flatten group

### Step 6: Create LogicTreeView Component
- Create `app/client/src/components/LogicTreeView.jsx`
- Props: `conditions`, `groups`, `section`, `onConditionSelect`
- Tree visualization showing:
  - Root node for section (e.g., "Long Entry")
  - AND/OR nodes for groups with operator label
  - Leaf nodes for individual conditions with natural language preview
  - Connecting lines between nodes
  - Expand/collapse for groups
- Click on condition to highlight it in inline view
- Use lucide-react icons for tree elements (ChevronRight, ChevronDown, GitBranch)

### Step 7: Create TestLogicDialog Component
- Create `app/client/src/components/TestLogicDialog.jsx`
- Props: `isOpen`, `onClose`, `section`, `conditions`, `groups`, `candleData`, `indicators`
- Dialog content:
  - Header: "Test Logic - {Section Name}"
  - Current candle data display (OHLC values, timestamp)
  - Current indicator values display
  - Logic evaluation tree showing:
    - Each condition with its current values and pass/fail status
    - Group results with AND/OR evaluation
    - Final result (signal would/would not fire)
  - Color coding: green checkmarks for pass, red X for fail
- Uses `evaluateLogic` function from conditionDefaults.js
- "Close" button to dismiss

### Step 8: Update LogicPanel Component
- Open `app/client/src/components/LogicPanel.jsx`
- Add imports for new components (ConditionGroup, LogicTreeView, TestLogicDialog)
- Add state for logic view mode (inline/tree)
- Add view mode toggle button in panel header (inline view icon, tree view icon)
- Modify section rendering to:
  - Render ConditionGroup components for grouped conditions
  - Render ConditionBlock for ungrouped conditions
  - Add "Group Selected" button when multiple conditions selected
- Add "Test Logic" button in section footer
- Handle group-related callbacks (onGroupCreate, onGroupUpdate, onGroupDelete, onOperatorChange)
- Persist view mode preference to localStorage

### Step 9: Update ConditionBlock for Groups
- Open `app/client/src/components/ConditionBlock.jsx`
- Add `isInGroup` prop to indicate condition is part of a group
- Add `groupOperator` prop to show AND/OR connector
- Update drag-and-drop to work within group context:
  - Set drag data to include group context
  - Accept drops for reordering within same group
- Add visual connector line showing AND/OR between conditions in group
- Add checkbox for selection (for grouping multiple conditions)
- Style changes when `isInGroup` is true (slight indent, connected appearance)

### Step 10: Update Strategy Page State Management
- Open `app/client/src/pages/Strategy.jsx`
- Add `groups` state: `const [groups, setGroups] = useState([])`
- Add group handlers:
  - `handleGroupCreate(conditionIds, operator, section)` - Create new group from conditions
  - `handleGroupUpdate(groupId, updates)` - Update group properties
  - `handleGroupDelete(groupId)` - Delete group (preserves conditions as ungrouped)
  - `handleGroupOperatorChange(groupId, newOperator)` - Toggle AND/OR
  - `handleConditionReorderInGroup(groupId, conditionId, newIndex)` - Reorder
- Add test logic handler:
  - `handleTestLogic(section)` - Open TestLogicDialog with current data
- Pass groups and handlers to LogicPanel
- Update condition undo/history to include group changes
- Persist groups to localStorage alongside conditions

### Step 11: Add Drag-and-Drop for Groups
- Update drag-and-drop handlers to support:
  - Dragging conditions between groups
  - Dragging conditions into a group (adds to group)
  - Dragging conditions out of a group (removes from group)
  - Dragging entire groups (reorder groups within section)
- Update drop zones to indicate:
  - Drop as standalone condition
  - Drop into existing group
  - Drop to create new group with dropped condition
- Visual feedback during drag showing valid drop targets

### Step 12: Implement Nested Groups
- Update ConditionGroup to handle nested groups:
  - Render child groups recursively
  - Pass depth prop to children (depth + 1)
  - Disable "Create Sub-group" when depth >= MAX_NESTING_DEPTH - 1
- Update group creation to:
  - Check nesting depth before allowing
  - Show warning/error if max depth exceeded
  - Set parentGroupId for nested groups
- Visual indication of nesting level (increased indent, different border style)

### Step 13: Style and Polish
- Add CSS/Tailwind styles for:
  - Group container with bracket visual
  - AND/OR badge styling
  - Nested group indentation
  - Tree view node styling
  - Test Logic dialog styling
- Ensure responsive design works on different screen widths
- Add transitions for group expand/collapse
- Add hover states for interactive elements
- Ensure accessibility (keyboard navigation, ARIA labels)

### Step 14: Run Validation Commands
- Run `cd app/client && npm run build` to verify frontend builds without errors
- Run `cd app/server && uv run pytest` to verify server tests pass
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_condition_groups.md` to validate the feature works

## Testing Strategy
### Unit Tests
- `conditionDefaults.test.js`:
  - Test `createConditionGroup` creates valid group structure
  - Test `getGroupDepth` calculates depth correctly
  - Test `canAddToGroup` respects MAX_NESTING_DEPTH
  - Test `validateGroupStructure` catches invalid structures
  - Test `evaluateCondition` returns correct boolean results
  - Test `evaluateGroup` handles AND/OR logic correctly
  - Test `evaluateGroup` handles nested groups recursively
  - Test `buildLogicTree` creates correct tree structure

### Edge Cases
- Empty groups (no conditions) - should display placeholder
- Single condition in group - should still show group wrapper
- Maximum nesting depth reached - should disable further nesting
- Condition deletion from group with only 2 conditions - should auto-ungroup
- Group deletion - conditions should become ungrouped
- Circular references (A contains B, B contains A) - should be prevented
- Mixing conditions from different sections - should be prevented
- Drag condition to different section while in group - should remove from group
- Test Logic with missing indicator data - should show "N/A" values
- Test Logic with incomplete conditions - should skip evaluation

## Acceptance Criteria
- [ ] Conditions can be grouped with AND or OR operators via "Group" button
- [ ] Visual grouping with brackets/boxes clearly shows logic structure
- [ ] AND/OR operator is displayed between conditions in a group and can be toggled
- [ ] Drag-and-drop reorders conditions within groups
- [ ] Nested groups are supported up to 3 levels deep: "(A AND B) OR (C AND D)"
- [ ] Nesting depth is enforced - cannot create groups deeper than 3 levels
- [ ] Logic tree view is available as alternative to inline view via toggle
- [ ] "Test Logic" button opens dialog showing condition evaluation against current candle
- [ ] Groups persist to localStorage and reload correctly
- [ ] Existing ungrouped conditions continue to work (backward compatibility)
- [ ] Frontend builds without errors
- [ ] Server tests pass without regressions
- [ ] E2E test validates all major functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_condition_groups.md` to validate the AND/OR logic feature works end-to-end

## Notes
- **Backward Compatibility**: Existing conditions without groups should continue to work. The implicit AND behavior for ungrouped conditions in a section remains unchanged.
- **Default Operator**: When creating a new group, default to AND operator as this matches the current implicit behavior.
- **Auto-Ungroup**: When a group has only one condition remaining after deletion, consider auto-ungrouping to reduce visual clutter.
- **Performance**: The logic evaluation should be efficient even with complex nested groups. Consider memoization if needed.
- **Future Enhancement**: Consider adding quick templates like "All conditions must be true (AND)" vs "Any condition can be true (OR)" for common patterns.
- **Mobile Considerations**: The tree view may need a simplified mobile layout. Consider showing only inline view on small screens.
- **Serialization**: Groups should be serialized alongside conditions for localStorage and potential future server-side storage.
