# Feature: Multi-Timeframe Conditions

## Metadata
issue_number: `74`
adw_id: `27834e18`
issue_json: `{"number":74,"title":"Feature Create Multi-Timeframe Conditions US-VSB-018","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\n Create Multi-Timeframe Conditions \n\nI want to create conditions that reference indicators on different timeframes\nSo that I can build strategies like \"H4 trend is up AND M15 RSI oversold\"\nAcceptance Criteria:\n\n \"Add Multi-Timeframe Condition\" option in condition builder\n Timeframe selector for condition: M1, M5, M15, M30, H1, H4, D1, W1\n Indicator selector shows all available indicators (not just those on current chart)\n Selected indicator auto-added to a \"Reference Indicators\" section (not displayed on main chart)\n Condition clearly labeled with timeframe: \"[H4] EMA(50) > EMA(200)\"\n Multi-timeframe indicators calculated in background on strategy load\n Performance note displayed: \"Multi-timeframe conditions may increase backtest time\"\n Maximum 3 additional timeframes per strategy to limit complexity\n Validation prevents circular references or conflicts"}`

## Feature Description
This feature enables traders to create conditions that reference technical indicators from different timeframes, allowing multi-timeframe analysis strategies. For example, a trader can create a strategy rule like "H4 EMA(50) is above H4 EMA(200) AND M15 RSI is below 30" - combining higher timeframe trend confirmation with lower timeframe entry signals.

The feature introduces:
1. A new "Add Multi-Timeframe Condition" button in the Logic Panel
2. A timeframe selector (M1, M5, M15, M30, H1, H4, D, W1) for reference indicators
3. A "Reference Indicators" panel to display and manage indicators from non-chart timeframes
4. Visual labeling showing timeframe prefix on conditions: `[H4] EMA(50) > EMA(200)`
5. Background calculation of reference indicator values when strategy loads
6. Validation to limit complexity (max 3 additional timeframes) and prevent conflicts

## User Story
As a forex trader
I want to create conditions that reference indicators on different timeframes
So that I can build strategies like "H4 trend is up AND M15 RSI oversold"

## Problem Statement
Currently, trading conditions can only reference indicators calculated on the currently displayed chart timeframe. This limits strategy complexity because traders cannot create multi-timeframe analysis rules - a common and powerful trading technique where higher timeframe trends are used to filter lower timeframe entry signals.

## Solution Statement
Extend the condition builder system to support "reference indicators" - indicators that are calculated on a different timeframe than the main chart. These reference indicators:
- Are stored separately from chart indicators
- Display their values in a dedicated "Reference Indicators" section
- Can be used as operands in conditions with clear timeframe labeling
- Are calculated in the background when price data loads
- Are limited to 3 additional timeframes to maintain performance

## Relevant Files
Use these files to implement the feature:

### Client Files
- `app/client/src/app/constants.js` - Add multi-timeframe constants (timeframes list, storage keys, limits)
- `app/client/src/app/conditionDefaults.js` - Extend operand structure with timeframe field, add multi-timeframe condition creators and validators
- `app/client/src/app/indicators.js` - Reference for indicator definitions and display name generation
- `app/client/src/app/indicatorCalculations.js` - Indicator calculation functions to be called for reference indicators
- `app/client/src/app/data.js` - Contains `GRANULARITY_SECONDS` mapping and API endpoint references
- `app/client/src/components/LogicPanel.jsx` - Add "Add Multi-Timeframe Condition" button and reference indicators display
- `app/client/src/components/ConditionBlock.jsx` - Display timeframe prefix in condition rendering
- `app/client/src/components/ConditionDropdown.jsx` - May need to show timeframe context in operand options
- `app/client/src/pages/Strategy.jsx` - Add reference indicators state, handlers, and background calculation logic

### Server Files
- `app/server/server.py` - Contains `/api/prices/{pair}/{granularity}/{count}` endpoint (already supports multiple timeframe calls)
- `app/server/config/settings.py` - Contains `TFS` timeframe mapping for reference

### Test Files
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test format reference
- `.claude/commands/e2e/test_condition_groups.md` - Similar feature E2E test for reference

### New Files
- `app/client/src/components/ReferenceIndicatorsPanel.jsx` - New panel component to display reference indicators from other timeframes
- `app/client/src/components/MultiTimeframeConditionDialog.jsx` - Dialog for adding multi-timeframe conditions with timeframe and indicator selection
- `.claude/commands/e2e/test_multi_timeframe_conditions.md` - E2E test specification for this feature

## Implementation Plan

### Phase 1: Foundation
Establish the data structures and constants needed to support multi-timeframe conditions:
1. Add multi-timeframe constants to `constants.js` (available timeframes, storage keys, max timeframes limit)
2. Extend the operand data structure in `conditionDefaults.js` to include optional `timeframe` field
3. Create reference indicator data structure (indicator definition + timeframe + calculated values)
4. Add localStorage persistence keys for reference indicators

### Phase 2: Core Implementation
Build the reference indicator management and calculation infrastructure:
1. Create the `ReferenceIndicatorsPanel` component to display indicators from other timeframes
2. Create the `MultiTimeframeConditionDialog` for adding conditions with timeframe selection
3. Implement background price data fetching for reference timeframes in Strategy.jsx
4. Implement indicator calculation for reference timeframes using existing `indicatorCalculations.js` functions
5. Add reference indicator state management (add, update, delete, persist)

### Phase 3: Integration
Connect multi-timeframe conditions with the existing condition builder:
1. Extend `buildOperandOptions()` to include reference indicators with timeframe labels
2. Update `ConditionBlock` to display timeframe prefix `[H4]` for multi-timeframe operands
3. Update `formatNaturalLanguageCondition()` to include timeframe context
4. Update `validateCondition()` to check reference indicator availability
5. Extend `TestLogicDialog` to include reference indicator values in evaluation

## Step by Step Tasks

### Step 1: Create E2E Test Specification
- Create `.claude/commands/e2e/test_multi_timeframe_conditions.md` with test steps covering:
  - Adding a multi-timeframe condition via the new dialog
  - Selecting a different timeframe (H4, D, etc.)
  - Selecting an indicator for the reference timeframe
  - Verifying the Reference Indicators panel shows the indicator
  - Verifying conditions display with timeframe prefix `[H4]`
  - Verifying the performance warning is displayed
  - Testing the 3-timeframe limit validation
  - Verifying persistence across page refresh
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_condition_groups.md` for format reference

### Step 2: Add Multi-Timeframe Constants
- Edit `app/client/src/app/constants.js` to add:
  - `AVAILABLE_TIMEFRAMES` array: `['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D', 'W1']`
  - `TIMEFRAME_LABELS` object mapping codes to display names
  - `MAX_REFERENCE_TIMEFRAMES` constant set to 3
  - `REFERENCE_INDICATORS_STORAGE_KEY` for localStorage persistence
  - `MULTI_TIMEFRAME_WARNING_TEXT` performance warning message

### Step 3: Extend Operand Data Structure
- Edit `app/client/src/app/conditionDefaults.js` to:
  - Add optional `timeframe` field to operand structure documentation
  - Create `createMultiTimeframeCondition(section, timeframe, indicator, params)` function
  - Create `createReferenceIndicator(timeframe, indicatorId, params)` function
  - Update `formatNaturalLanguageCondition()` to prepend `[TF]` when operand has timeframe
  - Add `validateReferenceIndicator()` function
  - Add `getTimeframeLabel(timeframeCode)` helper function

### Step 4: Create ReferenceIndicatorsPanel Component
- Create `app/client/src/components/ReferenceIndicatorsPanel.jsx`:
  - Collapsible panel showing "Reference Indicators" header with count badge
  - Group indicators by timeframe with timeframe header (e.g., "H4 Indicators")
  - Display each reference indicator with: name, parameters, current value
  - Delete button for each reference indicator (with confirmation if used in conditions)
  - Empty state: "No reference indicators. Add multi-timeframe conditions to see indicators from other timeframes."
  - Performance warning banner when reference indicators exist

### Step 5: Create MultiTimeframeConditionDialog Component
- Create `app/client/src/components/MultiTimeframeConditionDialog.jsx`:
  - Dialog title: "Add Multi-Timeframe Condition"
  - Step 1: Timeframe selector dropdown (exclude current chart timeframe)
  - Step 2: Indicator selector (all available indicators from INDICATORS catalog)
  - Step 3: Parameter configuration (period, etc.) using existing indicator defaults
  - Step 4: Operator and right operand selection (reuse existing dropdown patterns)
  - Condition section selector (Long Entry, Long Exit, etc.)
  - Warning text: "Multi-timeframe conditions may increase backtest time"
  - Validation: Check if adding this timeframe exceeds the 3-timeframe limit
  - "Add Condition" button to create the condition and reference indicator

### Step 6: Update Strategy.jsx State Management
- Edit `app/client/src/pages/Strategy.jsx` to add:
  - `referenceIndicators` state array to store reference indicators
  - `referenceTimeframeData` state object to cache price data by timeframe
  - `referenceIndicatorValues` state to store calculated values
  - `loadingReferenceData` state for loading indicator
  - `handleAddReferenceIndicator(timeframe, indicatorId, params)` handler
  - `handleDeleteReferenceIndicator(referenceIndicatorId)` handler
  - `fetchReferenceTimeframeData(timeframe)` async function using existing API
  - `calculateReferenceIndicatorValues()` function using indicatorCalculations
  - useEffect to recalculate reference values when price data or params change
  - localStorage persistence for referenceIndicators

### Step 7: Update LogicPanel Component
- Edit `app/client/src/components/LogicPanel.jsx` to:
  - Add "Add Multi-Timeframe Condition" button below "Add Condition" in each section
  - Import and render `MultiTimeframeConditionDialog` when button is clicked
  - Pass `onAddMultiTimeframeCondition` callback prop
  - Add `referenceIndicators` prop to access reference indicator data
  - Update operand options building to include reference indicators with timeframe labels

### Step 8: Update ConditionBlock Component
- Edit `app/client/src/components/ConditionBlock.jsx` to:
  - Check if operand has `timeframe` field
  - Prepend timeframe badge `[H4]` before operand label when timeframe is present
  - Style the timeframe badge distinctly (e.g., muted background, smaller font)
  - Update natural language preview to include timeframe context

### Step 9: Update buildOperandOptions Function
- Edit `app/client/src/app/conditionDefaults.js` `buildOperandOptions()` to:
  - Accept optional `referenceIndicators` parameter
  - Add new "Reference Indicators" option group when reference indicators exist
  - Format reference indicator options with timeframe prefix: `[H4] EMA (50)`
  - Include `timeframe` field in the returned operand object

### Step 10: Add Reference Indicator Calculation Logic
- Edit `app/client/src/pages/Strategy.jsx` to:
  - Create `calculateReferenceIndicators(referenceIndicators, referenceTimeframeData)` function
  - For each reference indicator:
    - Get price data for its timeframe from `referenceTimeframeData`
    - Call appropriate calculation function from `indicatorCalculations.js`
    - Store the latest value(s) in `referenceIndicatorValues` state
  - Trigger recalculation when `referenceTimeframeData` changes
  - Handle calculation errors gracefully (show "N/A" if data unavailable)

### Step 11: Update Test Logic Dialog
- Edit `app/client/src/components/TestLogicDialog.jsx` to:
  - Accept `referenceIndicatorValues` prop
  - Display reference indicator values in a separate "Reference Timeframes" section
  - Group values by timeframe with clear labels
  - Include reference indicator values in condition evaluation

### Step 12: Add Validation and Error Handling
- Edit `app/client/src/app/conditionDefaults.js` to:
  - Update `validateCondition()` to check reference indicator availability
  - Add `validateTimeframeLimits(referenceIndicators, newTimeframe)` function
  - Return appropriate error messages when validation fails
- Edit `app/client/src/pages/Strategy.jsx` to:
  - Show error toast when exceeding 3-timeframe limit
  - Show loading state while fetching reference timeframe data
  - Handle API errors when fetching price data for reference timeframes

### Step 13: Add Persistence
- Edit `app/client/src/pages/Strategy.jsx` to:
  - Save `referenceIndicators` to localStorage on change
  - Load `referenceIndicators` from localStorage on mount
  - Clear cached reference timeframe data on pair change (pair-specific data)

### Step 14: Run Validation Commands
- Execute all validation commands to ensure zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_multi_timeframe_conditions.md` to validate this functionality works

## Testing Strategy

### Unit Tests
- Test `createMultiTimeframeCondition()` creates correct condition structure
- Test `createReferenceIndicator()` creates correct reference indicator structure
- Test `formatNaturalLanguageCondition()` includes timeframe prefix
- Test `validateCondition()` validates reference indicator availability
- Test `validateTimeframeLimits()` enforces 3-timeframe maximum
- Test `buildOperandOptions()` includes reference indicators correctly

### Edge Cases
- Current chart timeframe not shown in timeframe selector (avoid confusion)
- Adding same indicator with same params on same timeframe (should reuse existing)
- Deleting reference indicator that's used in multiple conditions (confirmation required)
- Switching currency pair should clear reference timeframe data cache
- Reference indicator with no data available (API error) shows "N/A"
- Condition with deleted reference indicator shows validation warning
- Maximum 3 reference timeframes enforced with clear error message

## Acceptance Criteria
1. "Add Multi-Timeframe Condition" option appears in condition builder sections
2. Timeframe selector shows: M1, M5, M15, M30, H1, H4, D, W1 (excluding current chart timeframe)
3. Indicator selector shows all available indicators from the catalog
4. Selected indicator auto-added to "Reference Indicators" panel (not displayed on main chart)
5. Conditions clearly labeled with timeframe: `[H4] EMA(50) > EMA(200)`
6. Reference indicator values calculated in background on strategy load
7. Performance note displayed: "Multi-timeframe conditions may increase backtest time"
8. Maximum 3 additional timeframes per strategy enforced with validation error
9. Reference indicators persist across page refresh via localStorage
10. Test Logic dialog shows reference indicator values grouped by timeframe

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_multi_timeframe_conditions.md` to validate this functionality works

## Notes

### Architecture Decisions
- Reference indicators are stored separately from chart indicators to avoid UI confusion
- Reference timeframe price data is cached per-pair to avoid redundant API calls
- Indicator calculations reuse existing `indicatorCalculations.js` functions for consistency
- The 3-timeframe limit balances flexibility with performance (each timeframe requires separate API call)

### Future Enhancements
- Add ability to visualize reference indicator values on a mini-chart
- Support cross-timeframe comparisons (e.g., M15 RSI > H4 RSI)
- Add presets for common multi-timeframe strategies
- Optimize with batch API endpoint for multiple timeframes

### Performance Considerations
- Each reference timeframe requires a separate `/api/prices` call
- Reference indicator calculations run in background (non-blocking)
- Consider adding debounce on recalculation when multiple indicators change rapidly
- Cache reference timeframe data with TTL to reduce API calls

### Dependencies
- No new libraries required
- Reuses existing indicator calculation infrastructure
- Reuses existing API endpoint for price data
