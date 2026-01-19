# Bug Fix: Invalid Time Value Error When Changing Candle Counts

**ADW ID:** 31ea75f5
**Date:** 2026-01-19
**Specification:** specs/issue-39-adw-31ea75f5-sdlc_planner-fix-strategy-candles-error.md
**Issue:** #39

## Overview

Fixed a critical runtime error that occurred when users changed candle count values (50→100, 50→200) on the Strategy page. The error "RangeError: Invalid time value" was caused by insufficient validation in the chart zoom range calculation logic, where NaN or invalid Date objects would propagate through calculations and throw errors when calling `.toISOString()`.

## What Was Fixed

The fix adds comprehensive validation throughout the chart zoom and scroll calculation functions to handle edge cases gracefully:

- Input timestamp validation in `clampZoomRange`
- Time delta calculation validation (skip invalid or negative deltas)
- Average delta validation (check for NaN or zero values)
- Date object validation before `.toISOString()` calls
- Data boundary validation before clamping ranges
- Similar validation in helper functions: `computeZoomedInRange`, `computeZoomedOutRange`, `computeScrolledRange`

## Technical Implementation

### Files Modified

- `app/client/src/app/chart.js`: Added validation checks throughout zoom range calculation functions to prevent invalid Date errors

### Key Changes

1. **Input Validation** - Added checks at function entry to validate input timestamps are valid before processing
2. **Time Delta Validation** - Enhanced the time delta calculation loop to skip invalid timestamps and only accept positive time progressions
3. **Intermediate Result Validation** - Added NaN checks for avgDelta and return original range if calculations produce invalid results
4. **Date Object Validation** - Added validation before all `.toISOString()` calls using `isNaN(date.getTime())` checks
5. **Defensive Programming** - Implemented early returns with original range as fallback whenever invalid data is detected

### Code Changes in `clampZoomRange` (app/client/src/app/chart.js:48-98)

**Before:**
```javascript
const timeDeltas = [];
for (let i = 1; i < chartData.time.length; i++) {
  timeDeltas.push(new Date(chartData.time[i]).getTime() - new Date(chartData.time[i - 1]).getTime());
}
const avgDelta = timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length;
```

**After:**
```javascript
const timeDeltas = [];
for (let i = 1; i < chartData.time.length; i++) {
  const currentTime = new Date(chartData.time[i]).getTime();
  const prevTime = new Date(chartData.time[i - 1]).getTime();

  // Skip invalid timestamps
  if (!isNaN(currentTime) && !isNaN(prevTime)) {
    const delta = currentTime - prevTime;
    // Only add positive deltas (valid time progression)
    if (delta > 0) {
      timeDeltas.push(delta);
    }
  }
}

// If we don't have valid time deltas, return original range
if (timeDeltas.length === 0) {
  return newRange;
}

const avgDelta = timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length;

// Validate avgDelta is a valid number
if (isNaN(avgDelta) || avgDelta <= 0) {
  return newRange;
}
```

## How the Bug Occurred

1. User loaded chart data with valid timestamps (default 50 candles)
2. User changed candle count dropdown from 50 to 100 or 200
3. Chart re-rendered and Plotly emitted `plotly_relayout` event
4. Event handler called `clampZoomRange` to enforce zoom constraints
5. Time delta calculation produced NaN due to edge case in data
6. NaN propagated through avgDelta → targetRange → newStart/newEnd calculations
7. `.toISOString()` called on invalid Date object threw RangeError

## How the Fix Works

The fix implements a defensive validation strategy:

1. **Early Validation** - Check input timestamps are valid at function entry
2. **Skip Invalid Data** - Filter out invalid timestamps during time delta calculation
3. **Validate Intermediates** - Check avgDelta is valid number before using it
4. **Fallback Strategy** - Return original range whenever invalid data detected
5. **Final Safeguard** - Validate all Date objects before `.toISOString()` calls

This ensures that even if unexpected data occurs, the function gracefully returns the original range instead of crashing.

## Testing

### Manual Testing
1. Navigate to Strategy page
2. Select EUR/USD pair and H1 timeframe
3. Click "Load Data" button
4. Change candle count from 50 to 100 - verify no errors
5. Change candle count from 100 to 200 - verify no errors
6. Change candle count from 200 to 50 - verify no errors
7. Verify chart updates smoothly at each step

### E2E Testing
A new E2E test was created at `.claude/commands/e2e/test_strategy_candle_count_change.md` that validates:
- Chart renders with default 50 candles
- Candle count changes to 100 without errors
- Candle count changes to 200 without errors
- Candle count changes back to 50 without errors
- No "Invalid time value" errors appear in console

## Performance Impact

The validation checks add minimal overhead:
- A few milliseconds per zoom/scroll operation
- Early returns on invalid data actually improve performance
- No impact on chart rendering or user experience

## Related Features

This fix improves the robustness of:
- Chart zoom constraint system (feature 947a25d2)
- Keyboard zoom shortcuts (+/-, arrow keys)
- Date range buttons (1D, 5D, 1M, etc.)
- Interactive chart zoom and scroll controls

## Notes

The root cause was insufficient validation in the zoom constraint feature that was added in a previous implementation. The original code assumed all timestamps would be valid and consecutive, but changing candle counts could introduce gaps or formatting inconsistencies. This fix adds defensive programming to handle these edge cases gracefully.
