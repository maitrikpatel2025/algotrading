# Price-Based Conditions

**ADW ID:** f5db94d8
**Date:** 2026-01-19
**Specification:** /home/ubuntu/algotrading/trees/f5db94d8/specs/issue-66-adw-f5db94d8-sdlc_planner-price-based-conditions.md

## Overview

This feature enhances the condition builder system to allow users to create standalone price-based trading conditions directly from the Logic Panel. Users can now define conditions comparing price elements (Open, High, Low, Close) against indicator values, fixed prices, or other price elements without first dragging an indicator onto the chart. The system provides natural language previews, real-time validation, and autocomplete suggestions for available indicators.

## What Was Built

- **Add Condition Button Functionality**: Clicking "Add Condition" in any Logic Panel section now creates a new standalone condition block
- **Natural Language Preview**: Each condition displays a human-readable preview (e.g., "When Close Price crosses above EMA (20)")
- **Comprehensive Condition Validation**: Validates both indicator-linked and standalone conditions, checking if referenced indicators/patterns exist
- **Standalone Condition Support**: Conditions can be created without being linked to a specific indicator instance
- **Pattern Validation**: Extended validation to check if pattern conditions reference existing patterns on the chart
- **E2E Test Specification**: Created comprehensive test specification for price-based conditions feature

## Technical Implementation

### Files Modified

- `app/client/src/app/conditionDefaults.js`: Added new functions for natural language preview, condition validation, and standalone condition creation
- `app/client/src/components/ConditionBlock.jsx`: Enhanced to display natural language previews and use comprehensive validation
- `app/client/src/components/LogicPanel.jsx`: Added `activePatterns` prop support for pattern validation
- `app/client/src/pages/Strategy.jsx`: Implemented `handleAddCondition` to create standalone conditions, added `activePatterns` prop to LogicPanel
- `.claude/commands/e2e/test_price_based_conditions.md`: New E2E test specification

### Key Changes

- **`formatNaturalLanguageCondition(condition)`**: New function that generates human-readable condition strings like "When Close Price crosses above Upper Bollinger Band". Handles pattern conditions, incomplete conditions, and all operand types.

- **`validateCondition(condition, activeIndicators, activePatterns)`**: Comprehensive validation function that checks both left and right operands, validates indicator references exist on the chart, validates pattern references, and returns detailed error information including which operand is invalid.

- **`createStandaloneCondition(section)`**: New function that creates a condition not linked to any indicator. Defaults to Close Price as left operand with `crosses_above` operator and null right operand for user selection.

- **`handleAddCondition(section)` in Strategy.jsx**: Changed from showing an info message to actually creating a standalone condition in the specified section with undo support via history tracking.

- **ConditionBlock natural language display**: Added a subtitle below condition dropdowns showing the natural language preview in muted, italic styling.

## How to Use

1. Navigate to the Strategy page
2. Click "Load Data" to load price data onto the chart
3. Locate the Logic Panel on the right side of the page
4. Click the "Add Condition" button in any section (Long Entry, Long Exit, Short Entry, Short Exit)
5. A new condition block appears with default values:
   - Left operand: Close Price
   - Operator: crosses above
   - Right operand: (not selected)
6. Use the dropdowns to configure the condition:
   - **Left operand**: Select from Price (Open, High, Low, Close) or available indicators
   - **Operator**: Choose from crosses above, crosses below, is above, is below, equals
   - **Right operand**: Select from Price, Indicators (if any on chart), or Custom Value
7. The natural language preview updates in real-time as you configure the condition
8. To reference indicators, first drag them onto the chart from the Indicator Library
9. Invalid conditions (e.g., referencing a removed indicator) display a warning icon with an explanatory tooltip

## Configuration

No additional configuration required. The feature uses the existing condition storage and state management system.

## Testing

Run the E2E test specification to validate the feature:

1. Read `.claude/commands/test_e2e.md` for test runner documentation
2. Execute `.claude/commands/e2e/test_price_based_conditions.md` which covers:
   - Add Condition button creating new condition blocks
   - Price element dropdown options (Open, High, Low, Close)
   - Comparison operator dropdown options
   - Reference dropdown with indicators and values
   - Search/autocomplete functionality
   - Natural language preview display and updates
   - Invalid condition warning states
   - Multi-component indicator references (e.g., Bollinger Bands bands)
   - Multiple conditions per section
   - Condition deletion

## Notes

- Standalone conditions (created via "Add Condition") are not linked to any indicator and remain valid unless they reference an indicator that gets removed
- Pattern conditions use a special `is_detected` operator and don't have a right operand
- The natural language preview shows "..." for incomplete conditions missing a right operand
- The existing ConditionDropdown search functionality serves as autocomplete, filtering by all groups (Price, Indicators, Values)
- Validation error messages are specific to which operand is invalid and why
