# Indicators and Pattern Loading Fix

**ADW ID:** 521004c3
**Date:** 2026-01-21
**Specification:** specs/issue-98-adw-521004c3-sdlc_planner-fix-indicators-pattern-loading.md

## Overview

Fixed critical bugs preventing strategies from loading correctly. The Strategy Builder was incorrectly accessing indicators as an object instead of an array, causing all indicators to be marked "unknown" and removed during load. This cascaded to remove dependent conditions and groups, leaving users with empty strategies. Additionally, patterns weren't validated against definitions during load, time filters had data structure mismatches between frontend and backend, and URL-based loading didn't refresh the chart.

## Screenshots

![Strategy Builder with Chart](assets/indicators-pattern-loading-01-strategy-builder.png)

## What Was Built

- Fixed indicator validation to use correct array access pattern
- Implemented pattern validation with metadata preservation
- Created time filter conversion utilities for frontend/backend data structure compatibility
- Aligned URL-based and dialog-based strategy loading behavior
- Improved error messages with specific indicator/pattern IDs
- Added user feedback for pattern detection results

## Technical Implementation

### Files Modified

- `app/client/src/pages/Strategy.jsx`: Core strategy loading, validation, and save logic
  - Lines 24-25: Added imports for `getIndicatorById`, `getPatternById`, and time filter converters
  - Line 357: Fixed INDICATORS array access bug (was `INDICATORS[ind.id]`, now `getIndicatorById(ind.id)`)
  - Lines 391-432: Added `validatePatterns()` function to validate patterns against definitions and preserve metadata
  - Lines 594-620: Enhanced pattern restoration with validation and specific error messages
  - Line 656: Fixed time filter restoration using `convertTimeFilterFromBackend()`
  - Lines 667-675: Added success toast and chart refresh for URL-based loading
  - Line 1163: Improved pattern detection feedback with `showInfo()` for zero results
  - Lines 1814-1816: Added pattern metadata fields to save (pattern_type, candle_count, reliability)
  - Line 1866+: Updated time filter save using `convertTimeFilterToBackend()`

- `app/client/src/app/timeFilterUtils.js`: Time filter conversion utilities (new 121 lines)
  - Lines 496-556: `convertTimeFilterToBackend()` - converts frontend structure (sessions, customWindows, days as strings) to backend format (start_hour, end_hour, days_of_week as integers)
  - Lines 558-613: `convertTimeFilterFromBackend()` - converts backend structure to frontend format
  - Handles edge cases: null/undefined values, empty arrays, invalid day strings

- `.claude/commands/e2e/test_indicators_pattern_loading.md`: E2E test specification (259 lines)
  - Validates indicator metadata preservation
  - Tests pattern validation and metadata round-trip
  - Verifies time filter conversion in both directions
  - Confirms URL and dialog load paths both refresh chart
  - Checks specific error messages for missing indicators/patterns

### Key Changes

1. **Fixed INDICATORS array access**: Replaced `INDICATORS[ind.id]` with `getIndicatorById(ind.id)` helper function to correctly lookup indicator definitions from array.

2. **Implemented pattern validation**: Created `validatePatterns()` function that validates each pattern against the PATTERNS definition array and merges metadata (patternType, candleCount, reliability) during load.

3. **Time filter data structure conversion**: Created utility functions to convert between frontend structure (sessions/customWindows arrays, day strings) and backend structure (start_hour/end_hour, day indices).

4. **Aligned load paths**: URL-based loading now calls `loadTechnicals()` to refresh chart and shows success toast, matching dialog-based loading behavior.

5. **Improved error messages**: Validation warnings now include specific indicator/pattern IDs that failed, e.g., "3 indicator(s) skipped due to missing definitions: custom_indicator_1, invalid_macd, unknown_rsi"

6. **Pattern detection feedback**: Shows `showInfo()` toast when zero patterns detected with guidance to try different timeframe/candle count.

## How to Use

### For Users

1. Create a strategy with indicators, patterns, and time filters as normal
2. Save the strategy using the Save button or Ctrl+S
3. Load the strategy via:
   - Load Strategy dialog (File menu → Load Strategy)
   - Direct URL navigation to `/strategies/{id}/edit`
4. Verify all indicators, patterns, and time filter settings are preserved
5. If any indicators/patterns are missing from definitions, you'll see specific error messages with the missing IDs

### For Developers

**Understanding the Fix**:
- Indicators and patterns are both defined as arrays in `indicators.js` and `patterns.js`
- Always use `getIndicatorById(id)` and `getPatternById(id)` helper functions to lookup definitions
- Never access arrays with bracket notation like `INDICATORS[id]` or `PATTERNS[id]`

**Time Filter Conversion**:
- Frontend uses: `sessions: ['london', 'new_york']`, `customWindows: [{ start: "09:00", end: "17:00" }]`, `days: ['monday', 'tuesday']`
- Backend expects: `start_hour: 9`, `end_hour: 17`, `days_of_week: [1, 2, 3, 4, 5]` (integers 0-6)
- Use `convertTimeFilterToBackend()` before saving to database
- Use `convertTimeFilterFromBackend()` after loading from database

**Pattern Metadata Fields**:
- Always preserve from definition: `patternType`, `candleCount`, `reliability`, `defaultConditionTemplate`
- When saving, include: `pattern_type`, `candle_count`, `reliability` in database payload
- When loading, merge database data with pattern definition to restore all metadata

## Configuration

No configuration changes required. The fixes work automatically for all strategy save/load operations.

## Testing

### Manual Testing
1. Start frontend: `cd app/client && npm start`
2. Start backend: `cd app/server && uv run python server.py`
3. Create strategy with SMA indicator (period 20)
4. Add Hammer pattern
5. Configure time filter with London session
6. Save strategy
7. Reload via dialog → Verify all settings preserved ✅
8. Navigate to URL `/strategies/{id}/edit` → Verify chart refreshes and success toast shown ✅

### E2E Testing
Run `.claude/commands/e2e/test_indicators_pattern_loading.md` to validate:
- Indicator validation with correct array access
- Pattern metadata preservation through save/load cycle
- Time filter conversion in both directions
- URL and dialog load paths both refresh chart
- Specific error messages for unknown indicators/patterns

### Regression Testing
- `cd app/server && uv run pytest` - Server tests pass
- `cd app/client && npm run build` - Frontend builds successfully

## Notes

### Root Cause
The critical bug was `INDICATORS[ind.id]` treating an array as an object. Since `INDICATORS` is an array, bracket notation looks for a numeric index, not an object key. `INDICATORS[0]` would work, but `INDICATORS['sma']` returns `undefined`. This marked ALL indicators as "unknown" during validation, causing cascading failures removing conditions and groups.

### Data Structure Mismatch
The time filter had incompatible structures between frontend and backend:
- Frontend: `{ sessions: ['london'], customWindows: [{start: "09:00", end: "17:00"}], days: ['monday'] }`
- Backend: `{ start_hour: 9, end_hour: 17, days_of_week: [1] }`

Direct assignment via `setTimeFilter(strategy.time_filter)` overwrote the frontend structure with incompatible backend data, breaking the UI.

### Pattern Validation Parity
Previously, indicators had `validateIndicators()` but patterns had no equivalent validation. This created an inconsistency where invalid indicator IDs were caught but invalid pattern IDs were not. The fix adds `validatePatterns()` to provide the same validation and error handling for patterns.

### Chart Refresh on URL Load
URL-based loading (`/strategies/{id}/edit`) didn't call `loadTechnicals()`, leaving the chart with stale data from previous strategy or empty state. Dialog-based loading did refresh the chart. The fix ensures both paths call `loadTechnicals()` when pair and timeframe are set.

### Error Message Improvements
Before: `"3 indicator(s) skipped due to missing definitions."`
After: `"3 indicator(s) skipped due to missing definitions: custom_indicator_1, invalid_macd, unknown_rsi"`

This helps users identify which specific indicators are causing issues and whether they need to update their indicator library or fix the strategy definition.
