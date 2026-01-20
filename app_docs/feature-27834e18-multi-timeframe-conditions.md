# Multi-Timeframe Conditions

**ADW ID:** 27834e18
**Date:** 2026-01-20
**Specification:** specs/issue-74-adw-27834e18-sdlc_planner-multi-timeframe-conditions.md

## Overview

This feature enables traders to create conditions that reference technical indicators from different timeframes, allowing multi-timeframe analysis strategies. Traders can now build rules like "H4 EMA(50) is above H4 EMA(200) AND M15 RSI is below 30" - combining higher timeframe trend confirmation with lower timeframe entry signals.

## What Was Built

- **Multi-Timeframe Condition Dialog** - A new dialog for adding conditions that reference indicators on different timeframes with timeframe selection, indicator selection, and parameter configuration
- **Reference Indicators Panel** - A collapsible panel displaying indicators from non-chart timeframes with their calculated values
- **Timeframe Badge Display** - Conditions clearly labeled with timeframe prefix `[H4]` in the condition block
- **Reference Indicator State Management** - Full state management including persistence, validation, and background calculation
- **Timeframe Limit Validation** - Maximum 3 additional timeframes per strategy enforced with clear error messages
- **Test Logic Integration** - Reference indicator values grouped by timeframe in the Test Logic dialog

## Technical Implementation

### Files Modified

- `app/client/src/app/constants.js`: Added multi-timeframe constants including `AVAILABLE_TIMEFRAMES`, `TIMEFRAME_LABELS`, `MAX_REFERENCE_TIMEFRAMES`, and `REFERENCE_INDICATORS_STORAGE_KEY`
- `app/client/src/app/conditionDefaults.js`: Extended with multi-timeframe support including `validateTimeframeLimits()`, `getAvailableReferenceTimeframes()`, `findConditionsUsingReferenceIndicator()`, and updated `buildOperandOptions()` to include reference indicators
- `app/client/src/components/ConditionBlock.jsx`: Added timeframe badge display with Clock icon for multi-timeframe conditions and updated validation to check reference indicators
- `app/client/src/components/ConditionGroup.jsx`: Added `referenceIndicators` prop pass-through to ConditionBlock
- `app/client/src/components/LogicPanel.jsx`: Added "Add Multi-Timeframe Condition" button in each section and reference indicator handling
- `app/client/src/components/TestLogicDialog.jsx`: Added reference indicator values display section grouped by timeframe
- `app/client/src/pages/Strategy.jsx`: Added comprehensive reference indicator state management, persistence, background calculation, and dialog handling

### New Files Created

- `app/client/src/components/MultiTimeframeConditionDialog.jsx`: Full-featured dialog with step-by-step workflow for adding multi-timeframe conditions (578 lines)
- `app/client/src/components/ReferenceIndicatorsPanel.jsx`: Collapsible panel component for displaying and managing reference indicators (217 lines)
- `.claude/commands/e2e/test_multi_timeframe_conditions.md`: E2E test specification for the feature

### Key Changes

- Extended operand data structure to include optional `timeframe` field for multi-timeframe operands
- Added reference indicator validation to condition validation logic (`validateOperandWithReference()`)
- Implemented background price data fetching for reference timeframes using existing `/api/prices` endpoint
- Reference indicators are stored separately from chart indicators and persisted via localStorage
- Natural language condition previews now include timeframe prefix when operand has a timeframe

## How to Use

1. Navigate to the Strategy page
2. In any condition section (Long Entry, Long Exit, Short Entry, Short Exit), click the "Add Multi-Timeframe Condition" button
3. In the dialog that appears:
   - Select a timeframe (M1, M5, M15, M30, H1, H4, D, W1) - the current chart timeframe is excluded
   - Select an indicator from the available catalog
   - Configure indicator parameters (period, etc.)
   - Select the comparison operator and right operand value
4. Click "Add Condition" to create the condition
5. The condition will appear in the Logic Panel with a timeframe badge (e.g., `[H4]`)
6. A Reference Indicators panel will appear showing indicators from other timeframes with their current values
7. Use the Test Logic dialog to see all reference indicator values grouped by timeframe

## Configuration

- **MAX_REFERENCE_TIMEFRAMES**: Maximum 3 different timeframes allowed per strategy (configurable in `constants.js`)
- **AVAILABLE_TIMEFRAMES**: M1, M5, M15, M30, H1, H4, D, W1
- **REFERENCE_INDICATORS_STORAGE_KEY**: `forex_dash_reference_indicators` (localStorage key)

## Testing

Run the E2E test specification:
```bash
# Read and execute the E2E test
.claude/commands/e2e/test_multi_timeframe_conditions.md
```

The test covers:
- Opening the multi-timeframe condition dialog
- Selecting a different timeframe
- Selecting and configuring an indicator
- Verifying the Reference Indicators panel appears
- Verifying conditions display with timeframe prefix
- Testing the 3-timeframe limit validation
- Verifying persistence across page refresh

## Notes

### Architecture Decisions
- Reference indicators are stored separately from chart indicators to avoid UI confusion
- Reference timeframe price data is fetched on-demand and cached per-pair
- Indicator calculations reuse existing `indicatorCalculations.js` functions for consistency
- The 3-timeframe limit balances flexibility with performance (each timeframe requires separate API call)

### Performance Considerations
- Each reference timeframe requires a separate `/api/prices` API call
- Reference indicator calculations run in background (non-blocking)
- Data is re-fetched when the currency pair changes
- Performance warning is displayed when reference indicators exist

### Limitations
- Cannot reference the current chart timeframe (would be redundant)
- Maximum 3 additional timeframes per strategy
- Reference indicator values show "N/A" if price data is unavailable
