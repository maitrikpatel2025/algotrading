# Bug: Load Strategy Fails

## Metadata
issue_number: `95`
adw_id: `904b1bf0`
issue_json: `{"number":95,"title":"bug  Load Strategy Fails","body":"using adw_sdlc_iso\n\n/bug\n\n\n Load Strategy Fails                                     \n                                                                    \n\nIndicator reference errors - Loaded strategy references       \n  indicators that don't exist in INDICATORS definition             \n State restoration failure - If any part of the restore process\n   fails (indicators, conditions, groups), the whole load silently \n  breaks            \nSo issue is basically if we load the strategy which is already been implemented it should implemented all the functionality of that strategy basically all the indicators all the patterns all the rules and all the logic condition. It should bring it back, but unfortunately currently it's showing me error saying that everything shows error like it should also pull up the craft or pull up the time taker and the And the pair directly when we load."}`

## Bug Description
When loading a saved strategy, the restoration process fails to properly reconstruct indicators, patterns, conditions, and other strategy components. The bug manifests in two primary scenarios:

1. **Indicator Reference Errors**: Loaded strategies reference indicators that don't exist in the INDICATORS definition, causing silent failures or cascading errors
2. **State Restoration Failure**: If any part of the restore process fails (indicators, conditions, groups), the entire load breaks, leaving users with errors and an empty strategy builder

The expected behavior is that loading a strategy should fully restore all its components: indicators with parameters, patterns, conditions with operands, condition groups with logic operators, reference indicators for multi-timeframe analysis, time filters, and drawings. The current implementation has inconsistent validation between URL-based loading and dialog-based loading, leading to unpredictable failures.

## Problem Statement
The strategy loading mechanism has critical gaps in validation and error recovery that prevent users from reliably loading previously saved strategies. Specifically:

- The `loadStrategyFromUrl()` function (lines 351-450 in Strategy.jsx) lacks indicator validation, allowing unknown indicators to slip through
- Both loading paths fail to validate that indicator instance IDs and condition references remain consistent
- Pattern instance IDs are regenerated on load, potentially breaking pattern-condition associations
- The backend `_db_row_to_strategy()` function (lines 49-70 in strategy_service.py) performs raw array assignment without proper deserialization of nested objects
- No rollback mechanism exists if partial restoration fails, leaving the UI in an inconsistent state
- Error messages are generic and don't help users identify root causes (e.g., missing indicators, broken references)

## Solution Statement
Implement comprehensive validation and error handling across the strategy loading pipeline:

1. **Add Unified Validation**: Extract indicator validation logic into a shared function and apply it to both URL-based and dialog-based loading paths
2. **Preserve Instance IDs**: Ensure instance IDs for indicators and patterns are preserved from the database to maintain condition references
3. **Validate References**: Before restoring conditions, verify that all referenced indicators and patterns exist in the restored collections
4. **Implement Atomic Loading**: Use a transaction-like pattern where all components are validated before any state updates occur
5. **Enhanced Error Messages**: Provide specific, actionable error messages identifying which indicators are missing, which conditions have broken references, etc.
6. **Add Missing Indicator Fallback**: Allow users to remove or replace missing indicators rather than aborting the entire load
7. **Backend Deserialization**: Ensure `_db_row_to_strategy()` properly constructs nested data models (StrategyIndicator, StrategyCondition, etc.) from JSON

## Steps to Reproduce

1. Start the application (server on http://localhost:8000, client on http://localhost:3000)
2. Navigate to Strategy Builder at `/strategies/new`
3. Create a test strategy:
   - Select pair: EUR_USD
   - Select timeframe: 1h
   - Select candle count: 100
   - Add indicator: SMA with period 20
   - Add pattern: Hammer
   - Add condition: "SMA (20) > Close"
   - Set trade direction to "Long Only"
4. Save the strategy with name "Test Strategy Load Failure"
5. Clear the strategy builder (refresh page or navigate away)
6. Open Load Strategy dialog
7. Select "Test Strategy Load Failure"
8. Observe the bug: Strategy fails to load completely, or loads with missing/broken components

**Alternative Reproduction (Indicator Reference Error)**:
1. Save a strategy with an indicator (e.g., EMA)
2. Manually edit the database or exported JSON to reference a non-existent indicator ID (e.g., change "ema" to "ema_custom")
3. Attempt to load the strategy
4. Observe: Silent failure or generic error message

## Root Cause Analysis

### Primary Root Cause: Inconsistent Validation and Missing Reference Integrity Checks

**Location 1: Strategy.jsx - loadStrategyFromUrl() (lines 371-385)**
```javascript
// Restore indicators
if (strategy.indicators && Array.isArray(strategy.indicators)) {
  const restoredIndicators = strategy.indicators.map(ind => {
    const indicatorDef = INDICATORS[ind.id];  // No check if indicatorDef is undefined!
    return {
      ...indicatorDef,  // Will spread undefined if indicator doesn't exist
      instanceId: ind.instance_id || `${ind.id}_${Date.now()}...`,
      params: ind.params || indicatorDef?.defaultParams,  // Optional chaining added later
      // ...
    };
  }).filter(Boolean);  // filter(Boolean) removes undefined, but silently!
  setActiveIndicators(restoredIndicators);
}
```
**Problem**: No validation that `INDICATORS[ind.id]` exists before spreading. If indicator is missing, it spreads `undefined`, creating a malformed object. The `filter(Boolean)` removes it silently, but conditions referencing this indicator's `instance_id` will break.

**Location 2: Strategy.jsx - handleLoadStrategy() (lines 1801-1833)**
```javascript
// Validate indicator IDs exist in INDICATORS definition
const unknownIndicators = strategy.indicators
  .filter(ind => !INDICATORS[ind.id])
  .map(ind => ind.id);

if (unknownIndicators.length > 0) {
  console.error('Strategy contains unknown indicators:', unknownIndicators);
  showError(`Strategy contains unknown indicators: ${unknownIndicators.join(', ')}...`);
  return;  // Aborts entire load - no partial recovery
}
```
**Problem**: This validation exists in `handleLoadStrategy()` but NOT in `loadStrategyFromUrl()`, causing inconsistent behavior. Additionally, aborting the entire load prevents users from recovering by removing or replacing missing indicators.

**Location 3: Strategy.jsx - Condition Restoration (lines 1850-1868)**
```javascript
setConditions(strategy.conditions.map(c => ({
  id: c.id,
  section: c.section,
  leftOperand: c.left_operand,
  operator: c.operator,
  rightOperand: c.right_operand,
  indicatorInstanceId: c.indicator_instance_id,  // No validation this exists!
  indicatorDisplayName: c.indicator_display_name,
  patternInstanceId: c.pattern_instance_id,  // No validation this exists!
  isPatternCondition: c.is_pattern_condition,
})));
```
**Problem**: Conditions are restored without verifying that `indicator_instance_id` or `pattern_instance_id` reference actual indicators/patterns that were successfully restored. Broken references cause conditions to display as invalid or fail to evaluate.

**Location 4: strategy_service.py - _db_row_to_strategy() (lines 61-65)**
```python
indicators=row.get("indicators", []),
patterns=row.get("patterns", []),
conditions=row.get("conditions", []),
groups=row.get("groups", []),
reference_indicators=row.get("reference_indicators", []),
```
**Problem**: Raw array assignment. Supabase returns JSON, but Pydantic expects typed objects (StrategyIndicator, StrategyCondition, etc.). Without proper deserialization, nested validation rules in data_models.py are bypassed, allowing malformed data to reach the frontend.

### Secondary Root Cause: Instance ID Regeneration Breaking References

**Location: Strategy.jsx - Pattern Restoration (lines 389-392, 1838-1841)**
```javascript
setActivePatterns(strategy.patterns.map(pat => ({
  ...pat,
  instanceId: pat.instance_id || `${pat.id}_${Date.now()}_${Math.random()...}`,
})));
```
**Problem**: If `pat.instance_id` is missing, a new one is generated. However, if conditions reference the original `pattern_instance_id` from the database, this regeneration breaks the association. Conditions will reference an instance ID that no longer exists.

### Tertiary Root Cause: No Atomic Transaction Pattern

When loading fails partway through (e.g., indicators restore successfully, but conditions fail), the UI is left in an inconsistent state with partially loaded data. There's no rollback mechanism to revert to the pre-load state.

## Relevant Files
Use these files to fix the bug:

- **`app/client/src/pages/Strategy.jsx`** - Main strategy page with load/save logic
  - Lines 351-450: `loadStrategyFromUrl()` - Missing indicator validation
  - Lines 1783-1923: `handleLoadStrategy()` - Has validation but aborts entire load
  - Lines 371-385, 1802-1833: Indicator restoration logic
  - Lines 396-408, 1850-1868: Condition restoration without reference validation
  - Lines 411-419, 1871-1885: Group restoration without reference validation

- **`app/client/src/app/indicators.js`** - Indicator definitions (INDICATORS object)
  - Used to validate that strategy indicators exist in the system
  - Lines 1-50: Indicator display name generation and category definitions

- **`app/server/core/strategy_service.py`** - Backend strategy service
  - Lines 49-70: `_db_row_to_strategy()` - Raw array assignment without deserialization
  - Lines 133-161: `get_strategy()` - Returns strategy for loading

- **`app/server/core/data_models.py`** - Data models for strategy components
  - Lines 319-328: `StrategyIndicator` - Should be used for deserialization
  - Lines 330-340: `StrategyCondition` - Should be used for deserialization
  - Lines 343-350: `StrategyPattern` - Should be used for deserialization
  - Lines 353-359: `ConditionGroup` - Should be used for deserialization
  - Lines 381-403: `StrategyConfig` - Main strategy configuration model

- **`app/client/src/components/LoadStrategyDialog.jsx`** - Load strategy UI component
  - Lines 32-42: Component state management
  - Lines 160-186: Strategy selection and load handlers
  - Used to trigger `handleLoadStrategy()` callback

- **`app/client/src/app/conditionDefaults.js`** - Condition management utilities
  - May contain helper functions for condition validation

- **`app/client/src/app/patterns.js`** - Pattern definitions (PATTERNS object)
  - Used to validate that strategy patterns exist in the system

### New Files
- **`.claude/commands/e2e/test_strategy_load_failure.md`** - E2E test specification for strategy load functionality
  - Follow format from `.claude/commands/e2e/test_strategy_import_pattern.md`
  - Test scenarios: successful load, missing indicator recovery, broken reference detection, partial load rollback

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Backend Deserialization for Nested Objects

- Update `app/server/core/strategy_service.py` in `_db_row_to_strategy()` function
- Replace raw array assignments with proper deserialization using Pydantic models
- Deserialize `indicators` array into list of `StrategyIndicator` objects
- Deserialize `patterns` array into list of `StrategyPattern` objects
- Deserialize `conditions` array into list of `StrategyCondition` objects
- Deserialize `groups` array into list of `ConditionGroup` objects
- Deserialize `reference_indicators` array into list of `ReferenceIndicator` objects
- Add error handling for malformed data with specific error messages
- Add unit tests in `app/server/tests/core/test_strategy_service.py` to validate deserialization

### Step 2: Create Shared Indicator Validation Function

- Add a new validation function `validateIndicators()` in `app/client/src/pages/Strategy.jsx`
- Function should accept `indicators` array and return `{ valid: boolean, unknownIds: string[], validIndicators: object[] }`
- Check each indicator ID exists in `INDICATORS` definition
- Collect unknown indicator IDs for error reporting
- Return filtered list of valid indicators with proper structure
- Include defensive checks for missing `defaultParams`, `defaultColor`, etc.

### Step 3: Apply Indicator Validation to Both Loading Paths

- Update `loadStrategyFromUrl()` (lines 371-385) to use `validateIndicators()`
- Update `handleLoadStrategy()` (lines 1802-1833) to use `validateIndicators()`
- Display user-friendly error messages when unknown indicators are found
- Offer options: "Continue without missing indicators" or "Cancel load"
- If user chooses to continue, remove conditions referencing missing indicators
- Show warning toast listing which indicators were skipped

### Step 4: Add Reference Integrity Validation for Conditions

- Create `validateConditionReferences()` function in `app/client/src/pages/Strategy.jsx`
- Function should accept `conditions` array, `activeIndicators` array, and `activePatterns` array
- For each condition, verify:
  - If `indicator_instance_id` is set, it exists in `activeIndicators`
  - If `pattern_instance_id` is set, it exists in `activePatterns`
- Return `{ valid: boolean, brokenConditions: object[], validConditions: object[] }`
- Log detailed warnings for broken references

### Step 5: Apply Reference Validation to Condition Restoration

- Update condition restoration in both `loadStrategyFromUrl()` and `handleLoadStrategy()`
- Call `validateConditionReferences()` after indicators and patterns are restored
- Remove conditions with broken references or offer user choice to fix manually
- Display warning message: "X conditions removed due to missing references"
- Log which specific conditions were removed and why

### Step 6: Add Reference Integrity Validation for Groups

- Create `validateGroupReferences()` function in `app/client/src/pages/Strategy.jsx`
- Function should accept `groups` array and `conditions` array
- For each group, verify:
  - All `condition_ids` exist in the `conditions` array
  - If `parent_id` is set, it references a valid parent group
- Return `{ valid: boolean, brokenGroups: object[], validGroups: object[] }`
- Handle nested group validation to prevent orphaned child groups

### Step 7: Apply Reference Validation to Group Restoration

- Update group restoration in both `loadStrategyFromUrl()` and `handleLoadStrategy()`
- Call `validateGroupReferences()` after conditions are validated
- Remove groups with broken references or orphaned parent IDs
- Display warning message if groups are removed
- Ensure no circular parent-child references that could cause infinite loops

### Step 8: Implement Atomic Loading with Rollback

- Wrap all restoration logic in a try-catch block with state preservation
- Before starting restoration, save current state to temporary variables
- If any validation fails critically (user chooses to cancel), restore previous state
- Only commit state updates (`setState` calls) after ALL validations pass
- Show comprehensive error message listing all issues found
- Add loading spinner during validation to indicate processing

### Step 9: Preserve Instance IDs During Restoration

- Update indicator restoration to ALWAYS use `ind.instance_id` from database
- Update pattern restoration to ALWAYS use `pat.instance_id` from database
- Only generate new instance IDs during drag-drop or new creation, NOT during load
- Add validation that instance IDs are unique within their collections
- If duplicate instance IDs detected, regenerate with warning

### Step 10: Enhanced Error Messaging

- Update all error messages to be specific and actionable
- For missing indicators: "Strategy contains indicators not in your library: [SMA Custom, EMA v2]. Update your indicator library or load without these indicators."
- For broken condition references: "3 conditions reference missing indicators and will be removed: [Condition 1, Condition 2, Condition 3]"
- For group validation failures: "2 condition groups have broken references and will be removed"
- Add console.error logs with full context for debugging
- Show success toast even with warnings: "Strategy loaded with 2 warnings. Check console for details."

### Step 11: Create E2E Test Specification

- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_strategy_import_pattern.md` as example reference
- Create `.claude/commands/e2e/test_strategy_load_failure.md`
- Include test cases:
  1. Load valid strategy - all components restore successfully
  2. Load strategy with missing indicator - user offered choice to continue or cancel
  3. Load strategy with broken condition references - conditions removed with warning
  4. Load strategy with malformed data - comprehensive error message shown
  5. Load strategy from URL parameter - validation applied same as dialog load
  6. Load strategy with missing patterns - patterns removed, conditions referencing them cleaned up
- Add verification steps for error messages, warnings, and UI state consistency
- Include screenshots for each scenario

### Step 12: Run Validation Commands

- Execute all validation commands listed below to ensure bug is fixed with zero regressions
- Fix any issues discovered during validation
- Repeat validation until all tests pass

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

1. **Manual Test - Successful Load**: Create a strategy with indicators, patterns, conditions, and groups. Save it. Load it. Verify all components restore correctly with exact parameters, colors, and references intact.

2. **Manual Test - Missing Indicator Handling**: Export a strategy JSON. Manually edit the JSON to reference a non-existent indicator ID (e.g., "custom_ema"). Import or load the strategy. Verify error message is specific and offers recovery options.

3. **Manual Test - Broken Reference Recovery**: Create a strategy with condition "SMA (20) > Close". Save it. Manually delete the indicator from the JSON but keep the condition. Load the strategy. Verify condition is removed with appropriate warning.

4. **Manual Test - URL Load Parity**: Save a strategy. Copy its URL (e.g., `/strategies/edit/{id}`). Navigate away. Paste the URL. Verify validation applies the same as dialog-based load.

5. **Backend Deserialization Test**:
```bash
cd app/server && uv run pytest tests/core/test_strategy_service.py::test_db_row_to_strategy_deserialization -v
```

6. **Frontend Build Validation**:
```bash
cd app/client && npm run build
```

7. **Server Test Suite**:
```bash
cd app/server && uv run pytest
```

8. **E2E Test Execution**: Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_strategy_load_failure.md` to validate all load scenarios work correctly.

9. **Console Error Check**: During manual testing, monitor browser console for any errors or warnings. All errors should be caught and displayed to user, not leaked to console.

10. **Performance Check**: Load a complex strategy with 10+ indicators, 20+ conditions, and 5+ groups. Verify load completes in under 2 seconds with no UI freezing.

## Notes

- **Read-only Validation First**: The validation functions should not modify state directly. They should return validation results that the calling code uses to decide whether to proceed.

- **User Experience Priority**: When validation finds issues, default to recovering gracefully (remove broken references) rather than blocking the load entirely. Always offer users a choice when possible.

- **Backwards Compatibility**: Existing strategies in the database should continue to load. If new validation detects issues in old strategies, provide migration/fix options rather than breaking them.

- **Performance Consideration**: Validation adds processing overhead. For strategies with 100+ conditions, optimize by using Sets for instance ID lookups rather than array `.find()` calls.

- **Indicator Library Sync**: Consider adding a feature to export the current INDICATORS definition alongside the strategy, so users can identify version mismatches between when the strategy was created and when it's loaded.

- **Future Enhancement**: Implement a "Strategy Doctor" tool that analyzes saved strategies for issues and offers automated repairs (e.g., "Missing indicator SMA detected. Replace with EMA?" or "Condition references non-existent indicator. Remove condition?").

- **Testing with Supabase**: The E2E test requires Supabase to be configured. If Supabase is not available, backend tests will fail with database connection errors (expected behavior).

- **Pattern Type Preservation**: Based on the solution in feature-8047b9ec, ensure `patternType` property is preserved during pattern restoration for correct marker coloring (green for bullish, red for bearish, gray for neutral).

- **Data Model Flexibility**: The backend `StrategyConfig.candle_count` field accepts both `int` and `str` types (Union[int, str, None]) for flexibility. Ensure frontend sends consistent types to avoid validation issues.
