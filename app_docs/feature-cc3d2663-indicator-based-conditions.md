# Indicator-Based Conditions

**ADW ID:** cc3d2663
**Date:** 2026-01-20
**Specification:** /home/ubuntu/algotrading/trees/cc3d2663/specs/issue-68-adw-cc3d2663-sdlc_planner-indicator-based-conditions.md

## Overview

This feature extends the condition builder to support indicator-based conditions where the left operand is an indicator value (e.g., "RSI > 70", "MACD Histogram > 0"). Users can create conditions comparing indicator values against fixed numbers, percentages, or other indicators, including range conditions ("RSI between 30 and 70") with numeric bounds validation for oscillator indicators.

## What Was Built

- **Indicator Values as Left Operand**: Dropdown now includes "Indicator Values" group for selecting indicators as the primary condition subject
- **New Comparison Operators**: Added `is_greater_or_equal` (>=), `is_less_or_equal` (<=), and `is_between` (range) operators
- **Range Conditions**: Support for "between X and Y" conditions with dual value inputs
- **Percentage Values**: Toggle to enter percentage values with % symbol display
- **Numeric Bounds Validation**: Out-of-bounds warnings for oscillator indicators (RSI: 0-100, Stochastic: 0-100, Williams %R: -100-0, ADX: 0-100)
- **Natural Language Preview**: Updated to handle all new condition types including ranges and percentages

## Technical Implementation

### Files Modified

- `app/client/src/app/conditionDefaults.js`: Added new operators, `buildOperandOptions` with `isLeftOperand` flag, `createIndicatorCondition()`, `createRangeCondition()`, `isRangeCondition()`, `getIndicatorBounds()`, `validateNumericBounds()`, and `getOperandBounds()` functions
- `app/client/src/app/indicators.js`: Added `numericBounds` metadata to oscillator indicators (RSI, Stochastic, ADX, CCI, Williams %R)
- `app/client/src/components/ConditionBlock.jsx`: Added range condition rendering with dual inputs, bounds validation display, and warning indicators
- `app/client/src/components/ConditionDropdown.jsx`: Added percentage toggle, bounds validation styling, and percentage mode handling

### Key Changes

- **Indicator Values Group**: When `isLeftOperand: true`, `buildOperandOptions()` includes an "Indicator Values" group listing all active indicators with their components (e.g., MACD Line, Signal Line, Histogram)
- **Range Condition Structure**: Range conditions use `is_between` operator with `rightOperand` (min) and `rightOperandMax` (max) fields
- **Bounds Validation**: `validateNumericBounds()` checks values against indicator metadata and returns warning messages for out-of-bounds values
- **Percentage Support**: New `type: 'percentage'` operand with `isPercentage: true` flag, displayed with % suffix

## How to Use

1. **Create Indicator-Based Condition**: In the Logic Panel, add a condition and click the left operand dropdown. Select an indicator from the "Indicator Values" group.

2. **Select Operator**: Choose from standard operators (is above, is below, equals) or new operators (>=, <=, is between).

3. **Set Threshold**: Enter a fixed numeric value, select another indicator, or toggle to percentage mode using the % button.

4. **Range Conditions**: Select "is between" operator to show two input fields. Enter minimum and maximum values.

5. **Bounds Validation**: If entering a value outside the indicator's valid range (e.g., RSI > 100), a warning icon and message will appear.

## Configuration

Indicator bounds are defined in `app/client/src/app/indicators.js`:

```javascript
numericBounds: {
  min: 0,
  max: 100,
  commonThresholds: [30, 70] // RSI example
}
```

Supported bounded indicators:
- RSI: 0-100
- Stochastic %K/%D: 0-100
- ADX: 0-100
- Williams %R: -100-0
- CCI: unbounded (has common thresholds only)

## Testing

Run the E2E test for this feature:
```bash
# Follow instructions in .claude/commands/e2e/test_indicator_based_conditions.md
```

Verify:
- Indicator values appear in left operand dropdown
- Range conditions show dual inputs with "and" separator
- Out-of-bounds values display warning with amber styling
- Natural language preview shows correctly for all condition types

## Notes

- This feature builds on the existing price-based conditions system (feature-f5db94d8)
- Multi-component indicators (MACD, Bollinger Bands) list each component separately
- Percentage values are useful for comparing indicator values relative to their range
- Bounds validation is visual only (warning, not blocking) to allow flexibility
