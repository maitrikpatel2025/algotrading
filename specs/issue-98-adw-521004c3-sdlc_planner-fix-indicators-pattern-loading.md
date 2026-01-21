# Bug: INDICATORS and Pattern Loading Failures

## Metadata
issue_number: `98`
adw_id: `521004c3`
issue_json: `{"number":98,"title":"Bug INDICATORS and pattern","body":"/bug\n\n\nadw_sdlc_iso\n\n\nThink hard and help me solve all of them don't miss any please again think hard\nCritical Bugs                                                                                                \n                                                                                                               \n  - INDICATORS Array Access Bug (Strategy.jsx:356) - Code uses INDICATORS[ind.id] but INDICATORS is an array,  \n  not an object. Should use getIndicatorById(ind.id). This causes ALL indicators to be marked as \"unknown\" and \n  filtered out during load.                                                                                    \n  - Time Filter Save Path Bug (Strategy.jsx:1806-1813) - When saving, code tries to access                     \n  timeFilter.startHour, timeFilter.endHour, etc. but these properties don't exist. The actual structure uses   \n  sessions[] and customWindows[] arrays.                                                                       \n  - Time Filter Restore Path Mismatch (Strategy.jsx:607, 2081) - Database returns snake_case keys (start_hour, \n  days_of_week) but frontend expects camelCase keys (sessions, days). Direct assignment breaks the time filter \n  UI.                                                                                                          \n                                                                                                               \n  Major Bugs                                                                                                   \n                                                                                                               \n  - Cascading Validation Failures - Because indicators fail to load (bug #1), all conditions that reference    \n  those indicators are marked as \"broken\" and removed. Then groups referencing those conditions are also       \n  removed. User ends up with empty strategy.                                                                   \n  - Generic Error Messages - User only sees \"Failed to load strategy\" or \"X indicator(s) skipped due to missing\n   definitions\" without knowing which indicators or why they're missing.                                       \n  - Two Inconsistent Load Paths - URL-based loading (loadStrategyFromUrl) and dialog-based loading             \n  (handleLoadStrategy) behave differently:                                                                     \n    - URL load does NOT call loadTechnicals() to refresh chart                                                 \n    - URL load does NOT show success toast                                                                     \n    - Both have the same underlying bugs but different user feedback                                           \n  - Chart Not Refreshed on URL Load - When loading via URL path /strategies/{id}/edit, the chart data          \n  (loadTechnicals()) is never called, so chart doesn't update to show the loaded pair/timeframe.               \n                                                                                                               \n  Moderate Bugs                                                                                                \n                                                                                                               \n  - No Atomic Transaction Pattern - If loading fails partway through, UI can be left in inconsistent state     \n  (e.g., indicators restored but not conditions, or pair set but chart not loaded).                            \n  - Silent Failures - Detailed error information is logged to console.error() and console.warn() but users     \n  don't see console. Critical failures appear as minor warnings.                                               \n  - Error Information Hidden - When indicators are unknown, the specific indicator IDs are logged to console   \n  but not shown to user. User doesn't know which indicators failed or why.    \n\nPattern Loading Bugs (Additional)                                                                            \n                                                                                                               \n  - No Pattern Definition Validation (Strategy.jsx:550-565) - Unlike indicators, patterns are loaded blindly   \n  without checking if the pattern ID exists in the PATTERNS definition. Invalid patterns are not filtered out. \n  - Pattern Metadata Loss During Load - When patterns are restored, code only does {...pat, instanceId:        \n  pat.instance_id}. It does NOT merge with PATTERNS definition to get critical metadata like:                  \n    - patternType (bullish/bearish/neutral)                                                                    \n    - candleCount (number of candles in pattern)                                                               \n    - reliability (reliability score)                                                                          \n    - defaultConditionTemplate                                                                                 \n  - Pattern Metadata Not Saved to Database (Strategy.jsx:1740-1749) - When saving patterns, only id,           \n  instance_id, name, description, type, color are saved. Missing: patternType, candleCount, reliability,       \n  defaultConditionTemplate.                                                                                    \n  - Inconsistent Data Access Pattern - INDICATORS is accessed as object (INDICATORS[ind.id] - which is wrong), \n  but PATTERNS uses .find() (PATTERNS.find(p => p.id === pattern.id)). Both are arrays but handled differently.\n  - Pattern Type Information Loss - When patterns are first detected, patternType is set from definition. When \n  loaded from database, patternType is NOT looked up from definition, causing visualization and filtering      \n  issues.                                                                                                      \n  - Cascading Pattern → Condition Failure - If patterns load incompletely, condition validation                \n  (validateConditionReferences) marks all pattern-based conditions as \"broken\" because pattern_instance_id     \n  doesn't match any loaded pattern's instanceId.                                                               \n  - No validatePatterns() Function Exists - There's validateIndicators(), validateConditionReferences(), and   \n  validateGroupReferences(), but NO equivalent validatePatterns() to check pattern definitions before          \n  restoring.               \n                                 \n                                                                                                               \n  Data Structure Problems                                                                                      \n                                                                                                               \n  - TimeFilter Backend vs Frontend Mismatch:                                                                   \n    - Backend expects: start_hour, end_hour, days_of_week (numbers 0-6)                                        \n    - Frontend uses: sessions[], customWindows[], days (strings like 'monday')                                 \n    - No conversion layer exists between them                                                                  \n  - days_of_week Type Mismatch - Backend stores days as integers (0-6), frontend uses strings ('monday',       \n  'tuesday', etc.)      \n16. TimeFilter Backend vs Frontend Mismatch - Different field names and types                                \n  17. days_of_week Type Mismatch - Numbers vs strings        \n"}`

## Bug Description
The Strategy Builder has critical bugs that prevent strategies from loading correctly. When users save and reload strategies, indicators are marked as "unknown" and filtered out, causing all dependent conditions and groups to also be removed, leaving users with empty strategies. Additionally, patterns don't validate against definitions during load, losing critical metadata, and time filters fail to save/restore due to data structure mismatches between frontend and backend.

### Symptoms
1. All indicators marked as "unknown" and removed during strategy load
2. Conditions referencing indicators are marked "broken" and removed
3. Groups referencing conditions are also removed
4. User ends up with empty or incomplete strategy after load
5. Patterns load without metadata (patternType, candleCount, reliability)
6. Pattern-based conditions fail validation
7. Time filter settings are lost or corrupted during save/load
8. Generic error messages provide no actionable information
9. URL-based strategy loading doesn't refresh chart
10. No user feedback when patterns aren't detected

### Expected Behavior
1. Indicators should load correctly with all metadata preserved
2. Patterns should validate against definitions and preserve metadata
3. Time filters should save/restore with proper field mapping
4. Conditions and groups should remain intact when references are valid
5. Specific error messages should identify which indicators/patterns failed
6. Chart should refresh when loading strategy via URL
7. User should receive feedback when patterns are detected or not found

## Problem Statement
The core issues stem from:
1. **Critical**: Incorrect array access (`INDICATORS[ind.id]` instead of `getIndicatorById(ind.id)`)
2. **Critical**: Time filter data structure mismatch between frontend (sessions/customWindows/days) and backend (start_hour/end_hour/days_of_week)
3. **Major**: Missing pattern validation during load (no `validatePatterns()` function)
4. **Major**: Pattern metadata loss during save/load cycle
5. **Major**: Inconsistent load behavior between URL path and dialog path
6. **Moderate**: Generic error messages hiding root cause details
7. **Moderate**: Silent failures without user notification

## Solution Statement
We will fix these bugs surgically by:
1. Replace `INDICATORS[ind.id]` with `getIndicatorById(ind.id)` in validateIndicators
2. Create time filter conversion functions to map frontend ↔ backend data structures
3. Implement `validatePatterns()` function to validate pattern definitions during load
4. Enhance pattern save/load to preserve all metadata from PATTERNS definition
5. Align URL-based and dialog-based loading to both refresh chart and show feedback
6. Improve error messages to include specific indicator/pattern IDs and reasons
7. Add user toast notifications for pattern detection results

## Steps to Reproduce
1. Open Strategy Builder at `/strategies/new`
2. Add indicator (e.g., SMA with period 20)
3. Add pattern (e.g., Hammer)
4. Create condition based on indicator
5. Configure time filter with sessions and custom windows
6. Save strategy with name "Test Strategy"
7. Refresh page or navigate to `/strategies/{id}/edit`
8. Observe:
   - Indicator is marked "unknown" and removed
   - Condition referencing indicator is removed
   - Pattern loads but without metadata
   - Time filter settings are lost or corrupted
   - Chart doesn't refresh on URL load
   - No feedback about pattern detection status

## Root Cause Analysis

### Critical Bug 1: INDICATORS Array Access
**File**: `app/client/src/pages/Strategy.jsx:356`
**Root Cause**: INDICATORS is defined as an array in `indicators.js`, but code accesses it as object with `INDICATORS[ind.id]`. This always returns `undefined`, marking all indicators as unknown.
**Impact**: Cascading failure - all indicators removed → all conditions removed → all groups removed → empty strategy.

### Critical Bug 2: Time Filter Save Path
**File**: `app/client/src/pages/Strategy.jsx:1806-1813`
**Root Cause**: Save code tries to access `timeFilter.startHour`, `timeFilter.endHour`, `timeFilter.days` but actual structure uses `timeFilter.sessions[]`, `timeFilter.customWindows[]`, `timeFilter.days` (with string values). No conversion layer exists.
**Impact**: Time filter data is saved incorrectly, breaking restoration on load.

### Critical Bug 3: Time Filter Restore Path
**File**: `app/client/src/pages/Strategy.jsx:607, 2081`
**Root Cause**: Database returns snake_case keys (`start_hour`, `days_of_week` with integers) but frontend expects camelCase keys (`sessions`, `days` with strings). Direct assignment via `setTimeFilter(strategy.time_filter)` overwrites frontend structure with incompatible backend structure.
**Impact**: Time filter UI breaks, user loses configured sessions and windows.

### Major Bug 4: Pattern Validation Missing
**File**: `app/client/src/pages/Strategy.jsx:550-565`
**Root Cause**: Unlike indicators (which use `validateIndicators()`), patterns are restored blindly without checking if pattern ID exists in PATTERNS definition. No `validatePatterns()` function exists.
**Impact**: Invalid patterns can be loaded, breaking condition validation.

### Major Bug 5: Pattern Metadata Loss
**File**: `app/client/src/pages/Strategy.jsx:550-565, 1740-1749`
**Root Cause**: Pattern restoration only does `{...pat, instanceId: pat.instance_id}` without merging PATTERNS definition. Pattern save only stores `id, instance_id, name, description, type, color` - missing `patternType, candleCount, reliability, defaultConditionTemplate`.
**Impact**: Patterns load without critical metadata needed for visualization and condition logic.

### Major Bug 6: Inconsistent Load Paths
**File**: `app/client/src/pages/Strategy.jsx:500-629 (URL load), 2030-2110 (dialog load)`
**Root Cause**: URL-based load (`loadStrategyFromUrl`) doesn't call `loadTechnicals()` to refresh chart, doesn't show success toast. Dialog-based load (`handleLoadStrategy`) does both.
**Impact**: Inconsistent UX - URL load leaves stale chart, no user feedback.

## Relevant Files
Use these files to fix the bug:

### Core Files
- `app/client/src/pages/Strategy.jsx` - Contains all the bugs in validateIndicators, pattern load/save, time filter load/save, and URL vs dialog load paths. This is the main file requiring surgical fixes.
  - Line 356: INDICATORS array access bug
  - Lines 550-565: Pattern restoration without validation
  - Line 607: Time filter direct assignment bug
  - Lines 1740-1749: Pattern save missing metadata
  - Lines 1806-1813: Time filter save accessing wrong properties
  - Line 2081: Time filter direct assignment bug
  - Lines 500-629: URL-based load path (missing chart refresh)
  - Lines 2030-2110: Dialog-based load path

- `app/client/src/app/indicators.js` - Exports INDICATORS array and `getIndicatorById()` helper function. Reference this to understand correct usage pattern.

- `app/client/src/app/patterns.js` - Exports PATTERNS array with metadata definitions. Needed to implement pattern validation and metadata merging.

- `app/client/src/app/timeFilterUtils.js` - Time filter utility functions. We need to add conversion functions here to map frontend ↔ backend data structures.

- `app/client/src/app/constants.js` - Contains DEFAULT_TIME_FILTER structure definition and DAYS_OF_WEEK mapping.

### Testing Files
- `app/client/src/pages/Strategy.jsx` - E2E test will validate fixes by loading strategies with indicators, patterns, and time filters.
- `app/server/tests/` - Server tests to validate backend doesn't break with structure changes.

### New Files

#### `.claude/commands/e2e/test_indicators_pattern_loading.md`
E2E test file to validate:
1. Indicators load correctly with metadata preserved
2. Patterns load with full metadata from definitions
3. Time filters save and restore correctly with sessions/customWindows
4. Conditions and groups remain intact with valid references
5. URL-based and dialog-based loads both refresh chart and show feedback
6. Error messages are specific when indicators/patterns are missing
7. Pattern detection provides user feedback (count or "not found" message)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Fix Critical Bug: INDICATORS Array Access

- Replace `INDICATORS[ind.id]` with `getIndicatorById(ind.id)` in validateIndicators function (Strategy.jsx:356)
- Verify INDICATORS is imported from indicators.js
- Import getIndicatorById helper function from indicators.js
- Update the validation logic to use `const indicatorDef = getIndicatorById(ind.id);`
- This fixes the root cause preventing all indicators from loading

### Fix Critical Bug: Time Filter Data Structure Conversion

- Read `app/client/src/app/constants.js` to understand DAYS_OF_WEEK structure and DEFAULT_TIME_FILTER
- Create time filter conversion functions in `app/client/src/app/timeFilterUtils.js`:
  - `convertTimeFilterToBackend(timeFilter)` - converts frontend structure (sessions, customWindows, days as strings) to backend structure (start_hour, end_hour, days_of_week as integers)
  - `convertTimeFilterFromBackend(backendTimeFilter)` - converts backend structure to frontend structure
  - Handle edge cases: null/undefined values, empty arrays, invalid day strings
- Use the new conversion functions in Strategy.jsx:
  - In save path (line 1806-1813): `time_filter: timeFilter.enabled ? convertTimeFilterToBackend(timeFilter) : null`
  - In restore paths (line 607, 2081): `setTimeFilter(convertTimeFilterFromBackend(strategy.time_filter))`
- This fixes time filter data corruption during save/load cycles

### Implement Pattern Validation and Metadata Preservation

- Create `validatePatterns()` function in Strategy.jsx (similar to validateIndicators):
  - Import PATTERNS from patterns.js
  - Create helper function `getPatternById(id)` similar to getIndicatorById
  - Validate each pattern against PATTERNS definition
  - Merge pattern data from database with PATTERNS definition to preserve metadata
  - Return `{ valid: boolean, unknownIds: [], validPatterns: [] }`
  - For valid patterns, merge: `{ ...patternDef, ...pat, instanceId: pat.instance_id }`
  - This ensures patternType, candleCount, reliability, defaultConditionTemplate are preserved
- Update pattern restoration in both load paths (URL and dialog):
  - Replace blind restoration `{...pat, instanceId: pat.instance_id}` with validation call
  - Call `validatePatterns(strategy.patterns)` before setActivePatterns
  - Show warning toast if patterns are unknown: "X pattern(s) skipped due to missing definitions: [pattern IDs]"
- This fixes pattern metadata loss and adds validation parity with indicators

### Fix Pattern Save to Include Metadata

- Update pattern save mapping (Strategy.jsx:1740-1749) to include metadata fields:
  - Add `pattern_type: pat.patternType || null`
  - Add `candle_count: pat.candleCount || null`
  - Add `reliability: pat.reliability || null`
  - Note: defaultConditionTemplate is template data, doesn't need to be saved (can be reconstructed from definition)
- This ensures pattern metadata round-trips correctly through save/load

### Align URL Load Path with Dialog Load Path

- In `loadStrategyFromUrl` function (Strategy.jsx:500-629):
  - Add success toast after successful load: `showSuccess(\`Strategy '\${strategy.name}' loaded successfully\`)`
  - Add loadTechnicals() call if pair and timeframe are set: `if (strategy.pair && strategy.timeframe) { loadTechnicals(); }`
  - This ensures URL-based load has same UX as dialog-based load
- Verify both load paths now:
  - Call validateIndicators() and validatePatterns()
  - Show warning toasts for unknown indicators/patterns
  - Refresh chart with loadTechnicals()
  - Show success toast

### Improve Error Messages for Debugging

- Update validateIndicators warning message to include specific indicator IDs:
  - Change from: `"X indicator(s) skipped due to missing definitions."`
  - Change to: `"X indicator(s) skipped due to missing definitions: [id1, id2, ...]"`
- Update validatePatterns warning message similarly
- Update condition validation warnings to include which indicator/pattern instance IDs are missing
- Update strategy load error handling to provide specific error types:
  - Database errors: "Database connection failed..."
  - Missing strategy: "Strategy not found or deleted"
  - Network errors: "Network error - check connection"
- This helps users understand what went wrong and how to fix it

### Add Pattern Detection User Feedback

- When pattern is dropped/added to chart (in handlePatternDrop or equivalent):
  - Count detected patterns: `const detectedCount = detectedPatterns.length`
  - Show toast feedback:
    - If count > 0: `showSuccess(\`Found \${detectedCount} \${pattern.name} pattern(s)\`)`
    - If count === 0: `showInfo(\`No \${pattern.name} patterns detected in current price data. Try different timeframe or candle count.\`)`
- This provides immediate feedback so users know if pattern detection succeeded

### Create E2E Test File

- Read `.claude/commands/test_e2e.md` to understand E2E test format and requirements
- Read `.claude/commands/e2e/test_strategy_import_pattern.md` as example
- Create new E2E test file `.claude/commands/e2e/test_indicators_pattern_loading.md` with sections:
  - User Story: Validate indicators and patterns load correctly with full metadata
  - Test Steps covering:
    1. Create strategy with SMA indicator, Hammer pattern, time filter sessions
    2. Save strategy
    3. Load via dialog - verify indicator metadata, pattern metadata, time filter settings preserved
    4. Navigate to URL path `/strategies/{id}/edit` - verify chart refreshes, success toast shown
    5. Verify error messages are specific when invalid indicator/pattern IDs exist
    6. Verify pattern detection shows feedback toast
  - Success Criteria: All indicators/patterns/time filters round-trip correctly
  - Failure Conditions: Any metadata loss, generic errors, missing toasts, chart not refreshing

### Run Validation Commands

- Run all validation commands listed in the "Validation Commands" section below
- Ensure every command executes without errors
- Fix any regressions before proceeding

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

Before Fix (Reproduce Bug):
- `cd app/client && npm start` - Start frontend (background)
- `cd app/server && uv run python server.py` - Start backend (background)
- Manually test: Create strategy with indicator → Save → Reload → Verify indicator is removed (BUG)
- Manually test: Create strategy with time filter sessions → Save → Reload → Verify time filter settings lost (BUG)
- Manually test: Load strategy via URL `/strategies/{id}/edit` → Verify chart doesn't refresh (BUG)

After Fix (Verify Fix):
- `cd app/client && npm start` - Start frontend
- `cd app/server && uv run python server.py` - Start backend
- Manually test: Create strategy with indicator → Save → Reload → Verify indicator loads with all metadata ✅
- Manually test: Create strategy with pattern → Verify pattern detection shows toast feedback ✅
- Manually test: Create strategy with time filter sessions → Save → Reload → Verify sessions preserved ✅
- Manually test: Load strategy via URL → Verify chart refreshes and success toast shown ✅
- Manually test: Load strategy with invalid indicator ID → Verify specific error message with IDs ✅

E2E Test Validation:
- Read `.claude/commands/test_e2e.md`
- Read and execute `.claude/commands/e2e/test_indicators_pattern_loading.md` to validate all functionality works end-to-end

Regression Tests:
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions

## Notes

### Critical Path Dependencies
1. INDICATORS array access fix is the root cause - MUST be fixed first
2. Time filter conversion functions must be implemented before fixing save/load paths
3. Pattern validation function must exist before updating pattern restoration logic
4. All validation fixes must be complete before running E2E tests

### Data Structure Reference

Frontend timeFilter structure:
```javascript
{
  enabled: boolean,
  mode: 'include' | 'exclude',
  sessions: ['london', 'new_york'],  // session IDs
  customWindows: [{ start: "09:00", end: "17:00" }],  // HH:MM strings
  days: ['monday', 'tuesday', ...],  // day ID strings
  timezone: 'UTC'
}
```

Backend time_filter structure (to be created via conversion):
```javascript
{
  enabled: boolean,
  mode: 'include' | 'exclude',
  start_hour: 9,  // from first session/window
  end_hour: 17,   // from first session/window
  days_of_week: [1, 2, 3, 4, 5],  // integers 0-6
  timezone: 'UTC'
}
```

Note: Backend structure is simplified and may not support multiple sessions/windows. Conversion function should serialize sessions/customWindows into a single representative time range, or store as JSON if backend supports it. This needs verification during implementation.

### Pattern Metadata Fields
All fields from PATTERNS definition that must be preserved:
- `id` - unique identifier
- `name` - full display name
- `shortName` - abbreviated name
- `category` - always 'Patterns'
- `description` - tooltip text
- `patternType` - 'bullish' | 'bearish' | 'neutral' (CRITICAL for visualization)
- `candleCount` - 1, 2, or 3 (CRITICAL for detection)
- `reliability` - 0-1 score (CRITICAL for filtering)
- `color` - display color based on pattern type
- `defaultConditionTemplate` - template for auto-conditions (can be reconstructed, doesn't need DB storage)

### Error Message Examples
Before: `"Failed to load strategy"`
After: `"Database connection failed. Please check your Supabase configuration."`

Before: `"3 indicator(s) skipped due to missing definitions."`
After: `"3 indicator(s) skipped due to missing definitions: custom_indicator_1, invalid_macd, unknown_rsi"`

### Testing Notes
- Use EUR_USD, 1h, 100 candles for reliable pattern detection in E2E tests
- Test with multiple patterns to verify metadata preservation for each
- Test time filter with both sessions and custom windows to ensure both convert correctly
- Test URL load path separately from dialog load path to verify both refresh chart
- If Supabase is not configured, database save/load tests will fail (expected)
