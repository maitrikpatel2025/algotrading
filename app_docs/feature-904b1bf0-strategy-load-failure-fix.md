# Strategy Load Failure Fix

**ADW ID:** 904b1bf0
**Date:** 2026-01-21
**Specification:** specs/issue-95-adw-904b1bf0-sdlc_planner-fix-strategy-load-failure.md

## Overview

Fixed critical bugs in the strategy loading mechanism that prevented users from reliably loading previously saved strategies. The fix implements comprehensive validation, error handling, and reference integrity checks across both frontend and backend, ensuring strategies load correctly with all components (indicators, patterns, conditions, groups) properly restored and validated.

## Screenshots

![Strategy Builder with Indicators](assets/01_strategy_builder_with_indicators.png)

## What Was Built

The implementation addresses two primary failure scenarios:

1. **Indicator Reference Errors**: Strategies that reference indicators not in the INDICATORS definition now fail gracefully with specific error messages and recovery options
2. **State Restoration Failures**: The loading process now validates all component references (indicators, patterns, conditions, groups) before committing state changes, preventing partial loads that leave the UI in an inconsistent state

Key components implemented:

- Unified indicator validation function (`validateIndicators()`)
- Condition reference validation (`validateConditionReferences()`)
- Group reference validation (`validateGroupReferences()`)
- Backend deserialization of nested Pydantic models
- Enhanced error messaging with specific, actionable feedback
- Instance ID preservation to maintain reference integrity
- Unit tests for backend deserialization

## Technical Implementation

### Files Modified

- `app/client/src/pages/Strategy.jsx`: Added three validation functions (166 lines), updated loading logic in both `loadStrategyFromUrl()` and `handleLoadStrategy()` with proper validation and warning handling
- `app/server/core/strategy_service.py`: Replaced raw array assignments with proper Pydantic model deserialization in `_db_row_to_strategy()` function (111 lines changed)
- `app/server/tests/core/test_strategy_service.py`: Added comprehensive unit tests for deserialization (211 lines added)
- `.claude/commands/e2e/test_strategy_load_failure.md`: Created E2E test specification for strategy load scenarios (371 lines)

### Key Changes

1. **Frontend Validation Functions** (Strategy.jsx:335-494):
   - `validateIndicators()`: Checks each indicator ID exists in INDICATORS definition, returns unknown IDs and valid indicators list, preserves instance_id from database
   - `validateConditionReferences()`: Uses Set-based lookup for performance, validates indicator_instance_id and pattern_instance_id references
   - `validateGroupReferences()`: Validates condition_ids and parent_id references, prevents orphaned groups

2. **Backend Deserialization** (strategy_service.py:55-142):
   - Deserializes indicators → `List[StrategyIndicator]`
   - Deserializes patterns → `List[StrategyPattern]`
   - Deserializes conditions → `List[StrategyCondition]`
   - Deserializes groups → `List[ConditionGroup]`
   - Deserializes reference_indicators → `List[ReferenceIndicator]`
   - Deserializes time_filter → `TimeFilter`
   - Added try-catch blocks with warning logs for malformed data
   - Raises `ValueError` for complete deserialization failures

3. **Instance ID Preservation** (Strategy.jsx:371):
   - ALWAYS uses `instance_id` from database during load (never generates new ones)
   - Only generates new instance IDs during drag-drop or new creation
   - Logs error if instance_id is missing

4. **User Experience Improvements**:
   - Warning toasts for strategies loaded with issues (e.g., "Strategy loaded with 2 warnings")
   - Specific error messages: "Strategy contains unknown indicators: [custom_ema, custom_sma]"
   - Broken references removed automatically with detailed console warnings
   - Validation applied consistently to both URL-based and dialog-based loading

## How to Use

### Loading a Strategy Successfully

1. Navigate to Strategy Builder (`/strategies/new`)
2. Click "Load Strategy" button or use the URL parameter (`/strategies/edit/{id}`)
3. Select a strategy from the list
4. The system validates all components before loading
5. If validation passes, all indicators, patterns, conditions, and groups restore exactly as saved

### Handling Missing Indicators

If you load a strategy with indicators not in your current INDICATORS definition:

1. You'll see an error: "Strategy contains unknown indicators: [indicator_name1, indicator_name2]"
2. The load will abort to prevent data loss
3. Options to recover:
   - Update your indicator library to include the missing indicators
   - Manually edit the strategy JSON to remove or replace missing indicators
   - Contact support if indicators should exist but don't

### Handling Broken References

If a strategy has broken condition or group references (rare, typically from manual data edits):

1. The system automatically removes invalid conditions/groups
2. You'll see a warning toast: "Strategy loaded with X warnings. Check console for details."
3. Console logs detail which conditions/groups were removed and why
4. The strategy loads successfully with valid components intact

## Configuration

No additional configuration required. The validation system works automatically for all strategy loads.

## Testing

### Manual Testing

1. **Successful Load Test**: Create a strategy with indicators, patterns, and conditions. Save it. Load it. Verify all components restore with exact parameters and colors.

2. **Missing Indicator Test**: Export a strategy JSON, manually change an indicator ID to a non-existent one (e.g., "custom_ema"), import it. Verify specific error message appears.

3. **URL Load Parity Test**: Save a strategy, copy its URL, navigate away, paste URL. Verify validation applies identically to dialog-based load.

### Automated Testing

Backend unit tests:
```bash
cd app/server && uv run pytest tests/core/test_strategy_service.py -v
```

E2E test specification available at:
```
.claude/commands/e2e/test_strategy_load_failure.md
```

Run with:
```bash
# Read the E2E test specification
cat .claude/commands/e2e/test_strategy_load_failure.md

# Execute the E2E test according to the specification
```

## Notes

### Performance Optimization

Validation uses Set-based lookups for indicator/pattern instance IDs to ensure O(1) lookup time. For strategies with 100+ conditions, this prevents O(n²) performance degradation.

### Backwards Compatibility

Existing strategies in the database continue to load. If new validation detects issues in old strategies, the system provides recovery options rather than breaking them entirely.

### Data Integrity

The backend now enforces Pydantic validation on all nested objects (indicators, conditions, patterns, groups). This prevents malformed data from reaching the frontend and causing cascading failures.

### Future Enhancements

Consider implementing:
- "Strategy Doctor" tool to analyze and repair saved strategies with issues
- Indicator library export alongside strategy to identify version mismatches
- Optional "force load" mode that attempts to load strategies with missing indicators by substituting similar alternatives
- Migration tools to update old strategies when indicator definitions change

### Instance ID Critical Behavior

**CRITICAL**: The `instance_id` field is preserved from the database during load. This is essential because conditions reference indicators by `indicator_instance_id`. If a new ID is generated during load, all condition references break. The fix ensures this never happens by:
1. Always using `ind.instance_id` from database
2. Logging an error if `instance_id` is missing (should never happen)
3. Only generating new IDs during drag-drop creation, not during loads
