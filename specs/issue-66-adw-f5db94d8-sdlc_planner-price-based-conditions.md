# Feature: Price-Based Conditions

## Metadata
issue_number: `66`
adw_id: `f5db94d8`
issue_json: `{"number":66,"title":"Feature Create Price-Based Conditions US-VSB-014","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nCreate Price-Based Conditions\n\nI want to create conditions based on price action (e.g., \"Close crosses above Upper BB\")\nSo that I can define precise entry and exit triggers\nAcceptance Criteria:\n\n Condition builder provides dropdowns for:\n\nPrice element: Open, High, Low, Close\nComparison: Crosses Above, Crosses Below, Is Above, Is Below, Equals\nReference: Indicator value, Fixed price, Another price element\n\n\n Auto-complete suggests available indicators and values\n Condition validates that referenced indicators exist on chart\n Invalid conditions highlighted with error tooltip\n Natural language preview: \"When Close Price crosses above Upper Bollinger Band\""}`

## Feature Description
This feature enhances the condition builder system to allow users to create precise price-based trading conditions. Users will be able to define conditions comparing price elements (Open, High, Low, Close) against indicator values, fixed prices, or other price elements. The system will provide autocomplete suggestions for available indicators, validate that referenced indicators exist on the chart, highlight invalid conditions with error tooltips, and display a natural language preview of each condition (e.g., "When Close Price crosses above Upper Bollinger Band").

## User Story
As a forex trader
I want to create conditions based on price action (e.g., "Close crosses above Upper BB")
So that I can define precise entry and exit triggers

## Problem Statement
Currently, condition blocks are automatically created when indicators are dropped onto the chart, but users cannot easily create standalone price-based conditions without first adding an indicator. The condition builder needs enhanced capabilities to:
1. Allow users to create conditions directly from the Logic Panel without requiring an indicator drop
2. Provide intuitive autocomplete suggestions for available indicators and their components
3. Validate that referenced indicators exist on the chart in real-time
4. Display clear error states when conditions become invalid (e.g., indicator removed)
5. Show a human-readable natural language preview of each condition for better understanding

## Solution Statement
Implement an enhanced condition builder system that:
1. Adds an "Add Condition" button functionality that opens a condition configuration flow
2. Enhances the ConditionDropdown component with autocomplete/search that suggests available indicators and their values
3. Adds real-time validation to check if referenced indicators exist on the chart
4. Displays invalid conditions with a warning icon and error tooltip explaining the issue
5. Shows a natural language preview below each condition block (e.g., "When Close Price crosses above Upper Bollinger Band")

## Relevant Files
Use these files to implement the feature:

### Core Condition System Files
- `app/client/src/app/conditionDefaults.js` - Contains PRICE_SOURCES, OPERATORS, condition creation functions, and `buildOperandOptions()`. This is where we'll add the natural language preview formatter and any new validation functions.
- `app/client/src/components/ConditionBlock.jsx` - The main condition block component that renders individual conditions. This will be enhanced to show the natural language preview and improved error tooltips.
- `app/client/src/components/ConditionDropdown.jsx` - The searchable dropdown component for operand selection. Already has search functionality that serves as autocomplete; may need minor enhancements.
- `app/client/src/components/LogicPanel.jsx` - The right sidebar that contains all condition sections. The "Add Condition" button click handler needs to be implemented.

### Integration Files
- `app/client/src/pages/Strategy.jsx` - The main Strategy page that manages indicators and conditions state. Contains `handleAddCondition` callback and indicator/condition state management.
- `app/client/src/app/indicators.js` - Contains indicator definitions including `getIndicatorDisplayName()` function used for building dropdown options.
- `app/client/src/app/constants.js` - Contains condition-related constants like CONDITION_SECTIONS_V2, section labels, colors, and types.

### Styling
- `app/client/src/index.css` - Contains animation keyframes and any global styles that may need updates.

### Documentation
- `app_docs/feature-41bf1b05-auto-condition-block.md` - Documentation for the existing condition block system, useful for understanding current patterns.
- `app_docs/feature-a73d36d3-logic-builder-panel.md` - Documentation for the Logic Panel four-section layout.
- `.claude/commands/test_e2e.md` - E2E test runner documentation.
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test file for reference.

### New Files
- `.claude/commands/e2e/test_price_based_conditions.md` - New E2E test file for validating price-based conditions feature.

## Implementation Plan
### Phase 1: Foundation
1. Enhance `conditionDefaults.js` with a `formatNaturalLanguageCondition()` function that generates human-readable strings like "When Close Price crosses above Upper Bollinger Band"
2. Add validation helper functions to check if indicator references in conditions are valid
3. Define constants for error messages and tooltip content

### Phase 2: Core Implementation
1. Enhance `ConditionBlock.jsx` to display the natural language preview below the dropdowns
2. Improve the invalid condition warning with a more descriptive error tooltip using the existing AlertTriangle icon
3. Implement the "Add Condition" button functionality in `LogicPanel.jsx` and `Strategy.jsx`
4. Create a new blank condition when "Add Condition" is clicked, allowing users to configure it from scratch

### Phase 3: Integration
1. Connect the "Add Condition" flow with the condition state management in Strategy.jsx
2. Ensure autocomplete (search) in ConditionDropdown properly filters and suggests available indicators
3. Add real-time validation that updates when indicators are added/removed from the chart
4. Test the complete flow from adding conditions to validation to display

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test structure
- Read `.claude/commands/e2e/test_auto_condition_block.md` for reference on testing condition functionality
- Create `.claude/commands/e2e/test_price_based_conditions.md` with test steps for:
  - Creating a new condition via "Add Condition" button
  - Verifying price element dropdown options (Open, High, Low, Close)
  - Verifying comparison operator dropdown options
  - Verifying reference dropdown shows indicator values and price elements
  - Verifying autocomplete suggests available indicators
  - Verifying invalid condition error state when indicator is removed
  - Verifying natural language preview is displayed correctly

### Step 2: Add Natural Language Preview Function
- Read `app/client/src/app/conditionDefaults.js` to understand existing functions
- Add a new `formatNaturalLanguageCondition(condition)` function that:
  - Returns a string like "When Close Price crosses above Upper Bollinger Band"
  - Handles all operand types: price, indicator, value, pattern
  - Uses existing `getOperatorLabel()` for operator text
  - Capitalizes appropriately for readability
- Export the new function

### Step 3: Enhance ConditionBlock with Natural Language Preview
- Read `app/client/src/components/ConditionBlock.jsx`
- Import `formatNaturalLanguageCondition` from conditionDefaults
- Add a new section below the dropdowns that displays the natural language preview
- Style the preview text with a subtle appearance (smaller font, muted color, italic)
- Only show preview when condition has both operands selected

### Step 4: Improve Invalid Condition Error Tooltip
- In `ConditionBlock.jsx`, enhance the warning display for invalid conditions
- Add a tooltip to the AlertTriangle icon that explains "The referenced indicator has been removed from the chart"
- Use the existing `cn` utility for conditional styling
- Consider adding a "Fix" or "Select new indicator" prompt

### Step 5: Implement Add Condition Button Functionality
- Read `app/client/src/components/LogicPanel.jsx` to understand current "Add Condition" button behavior
- Read `app/client/src/pages/Strategy.jsx` to understand `handleAddCondition` callback
- Modify `handleAddCondition` in Strategy.jsx to create a new blank condition with:
  - Unique ID from `generateConditionId()`
  - Default leftOperand as Close Price
  - Default operator as 'crosses_above'
  - No rightOperand initially (null or placeholder)
  - Assigned to the clicked section (long_entry, long_exit, etc.)
  - `isNew: true` for animation
  - No `indicatorInstanceId` (standalone condition)
- Update LogicPanel to properly call the handleAddCondition with the section parameter

### Step 6: Add Validation for Standalone Conditions
- In `ConditionBlock.jsx`, update the validation logic to handle conditions without an `indicatorInstanceId`
- A standalone condition is valid if:
  - leftOperand is a price source (always valid) OR
  - leftOperand references an indicator that exists in activeIndicators
  - AND rightOperand is a price source, value, or references an existing indicator
- Update the warning message to be more specific about which operand is invalid

### Step 7: Ensure Autocomplete Works Properly
- Review `ConditionDropdown.jsx` search functionality
- Verify that the search filters all groups: Price, Indicators, and Values
- Ensure indicator options include all active indicators and their components
- Test that search is case-insensitive and matches partial strings

### Step 8: Integration Testing
- Test the complete flow:
  1. Click "Add Condition" in any section
  2. A new condition block appears with default values
  3. Use dropdowns to configure the condition
  4. Verify autocomplete suggests available indicators
  5. Add an indicator to the chart, verify it appears in dropdown
  6. Remove an indicator, verify condition shows warning
  7. Verify natural language preview updates as condition is configured

### Step 9: Run Validation Commands
- Run `cd app/server && uv run pytest` to ensure no server regressions
- Run `cd app/client && npm run build` to ensure frontend builds without errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_price_based_conditions.md` to validate the feature works end-to-end

## Testing Strategy
### Unit Tests
- Test `formatNaturalLanguageCondition()` with various condition configurations:
  - Price vs Price: "When Close Price is above Open Price"
  - Price vs Indicator: "When Close Price crosses above EMA (50)"
  - Indicator vs Indicator: "When SMA (20) crosses above SMA (50)"
  - Price vs Value: "When Close Price is above 1.5000"
  - Pattern conditions: "When Hammer is detected"

### Edge Cases
- Condition with missing/null rightOperand (should show partial preview or placeholder)
- Condition with indicator that has been removed (validation error)
- Condition with multi-component indicator (e.g., Bollinger Bands Upper Band)
- Very long indicator names (text overflow handling)
- Empty conditions list (empty state should still work)
- Switching trade direction with standalone conditions

## Acceptance Criteria
- [ ] Condition builder provides dropdowns for price elements (Open, High, Low, Close)
- [ ] Condition builder provides dropdowns for comparison operators (Crosses Above, Crosses Below, Is Above, Is Below, Equals)
- [ ] Condition builder provides dropdowns for references (Indicator value, Fixed price, Another price element)
- [ ] Autocomplete (search) suggests available indicators and their component values
- [ ] Condition validates that referenced indicators exist on the chart
- [ ] Invalid conditions are highlighted with error tooltip explaining the issue
- [ ] Natural language preview is displayed below each condition (e.g., "When Close Price crosses above Upper Bollinger Band")
- [ ] "Add Condition" button creates a new configurable condition block
- [ ] Frontend builds without errors
- [ ] Server tests pass without regressions

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_price_based_conditions.md` to validate the price-based conditions feature works end-to-end

## Notes
- This feature builds on the existing condition block system from issue #48 (Auto-Create Condition Block)
- The existing ConditionDropdown already has search functionality that serves as autocomplete - no major changes needed there
- The existing validation in ConditionBlock.jsx checks for `indicatorInstanceId` - this needs to be extended for standalone conditions
- Consider future enhancements: condition templates, condition groups (AND/OR logic), condition import/export
- The "Add Condition" button currently shows an info message - this will be replaced with actual condition creation
- Pattern conditions use a special `is_detected` operator and don't have a right operand - ensure natural language preview handles this case
