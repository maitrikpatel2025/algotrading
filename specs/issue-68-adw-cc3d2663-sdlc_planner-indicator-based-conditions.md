# Feature: Create Indicator-Based Conditions

## Metadata
issue_number: `68`
adw_id: `cc3d2663`
issue_json: `{"number":68,"title":"Feature Create Indicator-Based Conditions US-VSB-015","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nCreate Indicator-Based Conditions \nI want to create conditions comparing indicator values (e.g., \"RSI > 70\")\nSo that I can incorporate technical analysis signals into my strategy\nAcceptance Criteria:\n\n Dropdown lists all indicators currently on chart\n Indicator-specific values available (e.g., RSI value, MACD histogram, BB upper/middle/lower)\n Comparison operators: >, <, >=, <=, ==, crosses above, crosses below\n Right-hand value can be: fixed number, another indicator, percentage\n Range conditions supported: \"RSI between 30 and 70\"\n Condition validates numeric bounds appropriate to indicator"}`

## Feature Description
This feature enhances the condition builder system to support indicator-based conditions where the left operand is an indicator value rather than a price element. Users will be able to create conditions like "RSI > 70", "MACD Histogram > 0", or "RSI between 30 and 70". The system will provide indicator-specific options, including individual components for multi-component indicators (MACD Line, Signal Line, Histogram for MACD; Upper, Middle, Lower Bands for Bollinger Bands). The feature also introduces range conditions for bounded indicators (RSI, Stochastic, Williams %R) and validates that numeric thresholds are appropriate for each indicator's scale.

## User Story
As a forex trader
I want to create conditions comparing indicator values (e.g., "RSI > 70")
So that I can incorporate technical analysis signals into my strategy

## Problem Statement
Currently, the condition builder primarily supports price-based conditions (e.g., "Close crosses above EMA"). Traders need the ability to create conditions based on indicator values themselves (e.g., "RSI > 70" for overbought signals, "MACD Histogram > 0" for bullish momentum). Without this capability, traders cannot fully express common technical analysis strategies that rely on indicator thresholds and cross-indicator comparisons.

## Solution Statement
Extend the condition builder system to:
1. Allow selecting indicator values as the left operand (e.g., RSI value, MACD components)
2. Support all comparison operators including range operators ("between")
3. Enable right-hand operand selection from: fixed numeric values, other indicator values, or percentage values
4. Implement indicator-specific numeric bounds validation (RSI: 0-100, Stochastic: 0-100, etc.)
5. Support range conditions ("RSI between 30 and 70") through a new condition type
6. Provide natural language previews for all new condition types

## Relevant Files
Use these files to implement the feature:

### Core Condition System
- `app/client/src/app/conditionDefaults.js` - Central location for condition configuration, operators, operand builders, and validation logic. Add range operators, indicator bounds metadata, and range condition creation.
- `app/client/src/app/indicators.js` - Indicator definitions with metadata. Add numeric bounds (min/max values) for oscillator indicators and percentage threshold support.
- `app/client/src/app/constants.js` - Application constants. May need new constants for range condition types.

### UI Components
- `app/client/src/components/ConditionBlock.jsx` - Displays individual condition blocks. Update to support range conditions with two right operands and indicator-as-left-operand styling.
- `app/client/src/components/ConditionDropdown.jsx` - Searchable dropdown for operand selection. Update to show indicator values as selectable left operands and support percentage value input.
- `app/client/src/components/LogicPanel.jsx` - Right sidebar panel containing condition sections. May need minor updates for range condition display.

### Strategy Page
- `app/client/src/pages/Strategy.jsx` - Main strategy page. Update condition creation handlers and validation logic.

### Documentation
- `app_docs/feature-f5db94d8-price-based-conditions.md` - Reference for existing price-based conditions implementation
- `app_docs/feature-41bf1b05-auto-condition-block.md` - Reference for auto-condition creation from indicators
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test specification format

### New Files
- `.claude/commands/e2e/test_indicator_based_conditions.md` - New E2E test specification for this feature
- `app_docs/feature-cc3d2663-indicator-based-conditions.md` - Feature documentation (created by documenter agent)

## Implementation Plan
### Phase 1: Foundation
1. Add indicator numeric bounds metadata to `indicators.js` for oscillator indicators (RSI: 0-100, Stochastic %K/%D: 0-100, Williams %R: -100-0, CCI: no bounds but common thresholds, ADX: 0-100)
2. Add new operators to `conditionDefaults.js`: `is_between`, `is_greater_or_equal`, `is_less_or_equal`
3. Create `createIndicatorCondition()` function for conditions where the left operand is an indicator
4. Create `createRangeCondition()` function for "between" conditions with two right operands

### Phase 2: Core Implementation
1. Update `buildOperandOptions()` in `conditionDefaults.js` to include indicator values as left operand options (separate from "Indicators" group used for right operands)
2. Update `ConditionDropdown.jsx` to support:
   - "Indicator Values" group for left operand selection
   - Percentage value input mode alongside fixed numeric input
   - Dual value input for range conditions
3. Update `ConditionBlock.jsx` to:
   - Display range conditions with "between X and Y" layout
   - Show indicator color accent for indicator-value conditions
   - Validate numeric bounds and show warnings for out-of-range values

### Phase 3: Integration
1. Update `validateCondition()` to check numeric bounds against indicator metadata
2. Update `formatNaturalLanguageCondition()` to handle range conditions and indicator-left-operand conditions
3. Update `Strategy.jsx` condition handlers to support the new condition types
4. Create E2E test specification file
5. Run validation tests

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_trading_dashboard.md` to understand the E2E test format
- Create `.claude/commands/e2e/test_indicator_based_conditions.md` with comprehensive test steps covering:
  - Creating conditions with indicator value as left operand
  - Selecting indicator components (RSI value, MACD histogram, BB bands)
  - Using all comparison operators including range operators
  - Setting right-hand values: fixed numbers, other indicators, percentages
  - Range condition creation ("RSI between 30 and 70")
  - Numeric bounds validation warnings
  - Natural language preview accuracy

### Step 2: Add Indicator Numeric Bounds Metadata
- Update `app/client/src/app/indicators.js` to add numeric bounds for oscillator indicators:
  - RSI: `{ min: 0, max: 100, commonThresholds: [30, 70] }`
  - Stochastic %K/%D: `{ min: 0, max: 100, commonThresholds: [20, 80] }`
  - Williams %R: `{ min: -100, max: 0, commonThresholds: [-20, -80] }`
  - CCI: `{ min: null, max: null, commonThresholds: [-100, 100] }`
  - ADX: `{ min: 0, max: 100, commonThresholds: [25, 50] }`
- Unit test: Verify indicators have proper bounds metadata

### Step 3: Add New Operators to conditionDefaults.js
- Add operators: `is_greater_or_equal` ("≥"), `is_less_or_equal` ("≤"), `is_between` ("is between")
- Update `OPERATORS` array with new operator definitions
- Update `getOperatorLabel()` to return proper labels
- Ensure operators have proper descriptions for UI tooltips

### Step 4: Create Indicator Condition and Range Condition Functions
- Add `createIndicatorCondition(indicatorInstance, displayName, section)` function for conditions where left operand is an indicator value
- Add `createRangeCondition(leftOperand, minValue, maxValue, section)` function for "between" conditions
- Update `generateConditionId()` if needed to support new condition types
- Add helper function `isRangeCondition(condition)` to identify range conditions
- Add helper function `getIndicatorBounds(indicatorId)` to retrieve bounds from indicator metadata

### Step 5: Update buildOperandOptions for Indicator Left Operands
- Create new group "Indicator Values" for left operand dropdown that lists all active indicator values
- For multi-component indicators, list each component separately (MACD: MACD Line, Signal Line, Histogram)
- Include indicator instance display name and color in options
- Ensure this only appears when building left operand options, not right operand

### Step 6: Update ConditionDropdown for New Features
- Add support for "Percentage" value type in the Values group (shows % symbol after input)
- Add percentage toggle button next to numeric input
- For range conditions, modify to show two value inputs ("between [X] and [Y]")
- Add validation visual feedback (red border for out-of-bounds values)

### Step 7: Update ConditionBlock for Range Conditions and Validation
- Add rendering logic for range conditions showing "between X and Y" layout
- Add numeric bounds validation display:
  - Subtle warning icon for values outside recommended thresholds
  - Error styling for values outside absolute bounds
  - Tooltip explaining the valid range for the indicator
- Update hover highlighting for indicator-value conditions
- Ensure natural language preview shows correctly for new condition types

### Step 8: Update Validation Functions
- Update `validateCondition()` to:
  - Check numeric values against indicator bounds
  - Return specific error messages for out-of-bounds values
  - Validate range conditions (min < max, both operands valid)
- Update `validateOperandIndicator()` to handle indicator-value operands
- Add `validateNumericBounds(value, indicatorId)` helper function

### Step 9: Update Natural Language Preview
- Update `formatNaturalLanguageCondition()` to handle:
  - Indicator value as left operand: "When RSI (14) is above 70"
  - Range conditions: "When RSI (14) is between 30 and 70"
  - Percentage values: "When RSI (14) is above 50%"
  - Indicator vs indicator: "When MACD Line crosses above Signal Line"

### Step 10: Update Strategy.jsx Handlers
- Update `handleAddCondition()` to support creating indicator-based conditions
- Add handler for range condition creation if using a different flow
- Ensure undo/history tracking works for new condition types
- Update any condition filtering logic to include new condition types

### Step 11: Run Validation Commands
- Execute `cd app/client && npm run build` to verify no build errors
- Execute `cd app/server && uv run pytest` to verify no server test regressions
- Read `.claude/commands/test_e2e.md`, then execute `.claude/commands/e2e/test_indicator_based_conditions.md` to validate the feature

## Testing Strategy
### Unit Tests
- Test `createIndicatorCondition()` creates proper condition structure
- Test `createRangeCondition()` creates proper condition with two right operands
- Test `getIndicatorBounds()` returns correct bounds for each oscillator
- Test `validateNumericBounds()` correctly identifies out-of-bounds values
- Test `formatNaturalLanguageCondition()` formats all new condition types correctly
- Test `isRangeCondition()` correctly identifies range conditions

### Edge Cases
- Indicator with no numeric bounds (trend indicators like SMA, EMA)
- Multi-component indicator selection (selecting specific MACD component)
- Range condition with inverted values (max < min should be rejected or auto-corrected)
- Percentage values near bounds (99%, 1%)
- Zero and negative values for indicators that support them (Williams %R)
- Indicator removed while condition uses its value
- Multiple conditions using same indicator with different operators

## Acceptance Criteria
- [x] Dropdown lists all indicators currently on chart as left operand options
- [x] Indicator-specific values available (e.g., RSI value, MACD histogram, BB upper/middle/lower)
- [x] Comparison operators include: >, <, >=, <=, ==, crosses above, crosses below
- [x] Right-hand value can be: fixed number, another indicator, percentage
- [x] Range conditions supported: "RSI between 30 and 70"
- [x] Condition validates numeric bounds appropriate to indicator
- [x] Natural language preview displays correctly for all new condition types
- [x] Invalid conditions show appropriate warning indicators
- [x] E2E test passes all steps

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_indicator_based_conditions.md` E2E test file to validate this functionality works

## Notes
- This feature builds on the existing price-based conditions system (feature-f5db94d8)
- The existing `ConditionDropdown` already supports searchable grouped options, so the main work is adding new groups and input modes
- Indicator bounds metadata could also be useful for future features like automated threshold suggestions
- Range conditions require a different UI layout (three elements: operand, min value, max value) compared to regular conditions (two elements: operand, operator, operand)
- Consider using slider components for common threshold indicators (RSI, Stochastic) in a future enhancement
- The percentage value type is primarily useful for comparing indicator values relative to their range (e.g., "RSI > 50%" meaning "RSI > 50 on the 0-100 scale")
