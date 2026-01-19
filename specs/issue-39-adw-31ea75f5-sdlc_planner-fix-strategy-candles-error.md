# Bug: Invalid Time Value Error When Changing Candle Counts on Strategy Page

## Metadata
issue_number: `39`
adw_id: `31ea75f5`
issue_json: `{"number":39,"title":"bug - candles for the strategy page","body":"\n/bug\n\nadw_sdlc_iso\n\nWhile loading the candles for the strategy page, it gives me this error after pair, timeframe and clicking on the load and enterprise chart selecting candle from candlestick type and changing from changing from 50 to 200 candles or 100  candles, it's giving me this error\n\nUncaught runtime errors:\n\n×\nERROR\nInvalid time value\nRangeError: Invalid time value\n    at Date.toISOString (<anonymous>)\n    at clampZoomRange (http://localhost:3000/static/js/bundle.js:358051:24)\n    at EventEmitter.<anonymous> (http://localhost:3000/static/js/bundle.js:358442:32)\n    at EventEmitter.emit (http://localhost:3000/static/js/bundle.js:237150:13)\n    at plotObj.emit (http://localhost:3000/static/js/bundle.js:38524:18)\n    at http://localhost:3000/static/js/bundle.js:46442:16"}`

## Bug Description
When using the Strategy page to analyze forex price charts, a runtime error occurs when changing the candle count from the default 50 candles to higher values like 100 or 200 candles. The error manifests as an uncaught RangeError with the message "Invalid time value" and originates from the `clampZoomRange` function in the chart.js module.

**Symptoms:**
- Application crashes with uncaught runtime error overlay
- Error occurs specifically when changing candle count values (e.g., 50→200 or 50→100)
- Error triggers after: selecting pair → selecting timeframe → clicking Load Data → selecting Candlestick chart type → changing candle count
- Stack trace points to `Date.toISOString()` call in the `clampZoomRange` function at chart.js line 97

**Expected Behavior:**
- Changing candle count should smoothly update the chart with the new number of candles
- No runtime errors should occur during normal chart interactions
- Chart should re-render with the updated data seamlessly

**Actual Behavior:**
- Runtime error overlay appears with "Invalid time value" message
- Application becomes unresponsive until page is reloaded
- User cannot interact with the chart after the error

## Problem Statement
The `clampZoomRange` function in `app/client/src/app/chart.js` does not validate intermediate calculation results before calling `.toISOString()` on Date objects. When calculating average time deltas between candles and determining new zoom ranges, invalid or NaN values can propagate through the calculations, resulting in invalid Date objects that throw RangeError when attempting to convert to ISO strings.

## Solution Statement
Add robust input validation and NaN/invalid Date checks throughout the `clampZoomRange` function to ensure all Date objects are valid before calling `.toISOString()`. Implement early returns with the original range when invalid data is detected, and add defensive checks for NaN values in time delta calculations. This will prevent invalid Date errors while maintaining the zoom constraint functionality.

## Steps to Reproduce
1. Start the application: `./scripts/start.sh`
2. Navigate to http://localhost:3000
3. Click "Strategy" in the navigation bar
4. Select a currency pair (e.g., "EUR/USD") from the dropdown
5. Select a timeframe (e.g., "H1") from the granularity dropdown
6. Click "Load Data" button
7. Wait for the chart to load with candlestick data
8. In the chart controls, ensure "Candlestick" is selected as the chart type
9. Click the candle count dropdown (currently showing "50")
10. Select "100" or "200" from the dropdown
11. **Observe:** Uncaught runtime error appears: "RangeError: Invalid time value"

## Root Cause Analysis
The root cause is in the `clampZoomRange` function at `app/client/src/app/chart.js` lines 48-98:

1. **Line 74-77**: Time delta calculation between consecutive candles can produce NaN values if timestamps are malformed or missing:
   ```javascript
   for (let i = 1; i < chartData.time.length; i++) {
     timeDeltas.push(new Date(chartData.time[i]).getTime() - new Date(chartData.time[i - 1]).getTime());
   }
   ```

2. **Line 77**: Average delta calculation can result in NaN if any timeDeltas contain NaN:
   ```javascript
   const avgDelta = timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length;
   ```

3. **Line 86-88**: When `avgDelta` is NaN, the `targetRange` becomes NaN, and `newStart`/`newEnd` become invalid Date objects:
   ```javascript
   const targetRange = avgDelta * targetCandles;
   const newStart = new Date(center - targetRange / 2);
   const newEnd = new Date(center + targetRange / 2);
   ```

4. **Line 97**: Calling `.toISOString()` on invalid Date objects throws RangeError:
   ```javascript
   return [clampedStart.toISOString(), clampedEnd.toISOString()];
   ```

The bug is triggered when:
- Chart data is loaded with valid timestamps
- User changes candle count, which triggers a chart re-render
- Plotly emits a `plotly_relayout` event with new axis ranges
- The event handler calls `clampZoomRange` to enforce zoom constraints
- If any intermediate calculation produces NaN or invalid values, the error occurs

## Relevant Files
Use these files to fix the bug:

- `app/client/src/app/chart.js` (lines 48-98) - Contains the buggy `clampZoomRange` function that needs validation fixes. This is the primary file requiring changes.

- `app/client/src/components/PriceChart.jsx` - Uses the chart.js module and passes priceData to drawChart. No changes needed but useful for understanding data flow.

- `app/client/src/pages/Strategy.jsx` - Manages state for selectedCount and calls loadPrices when count changes. No changes needed but useful for understanding the trigger sequence.

### New Files

- `.claude/commands/e2e/test_strategy_candle_count_change.md` - E2E test specification to validate the bug fix by testing candle count changes (50→100, 50→200, 200→50) and verifying no errors occur.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Fix the `clampZoomRange` Function with Validation

- Read `app/client/src/app/chart.js` and locate the `clampZoomRange` function (lines 48-98)
- Add input validation at the start of the function to check for null/undefined/empty chartData
- Add validation for valid timestamps in the newRange parameter (check they can be converted to valid Dates)
- Add NaN checking in the time delta calculation loop - skip invalid deltas
- Add validation after `avgDelta` calculation - if NaN or zero, return the original newRange
- Add validation before calling `.toISOString()` - check if Dates are valid using `!isNaN(date.getTime())`
- If invalid Dates are detected, return the original newRange as fallback
- Add similar validation to helper functions `computeZoomedInRange`, `computeZoomedOutRange`, and `computeScrolledRange` to prevent NaN propagation

### Create E2E Test for Candle Count Changes

- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_trading_dashboard.md` to understand the E2E test format
- Create a new E2E test file in `.claude/commands/e2e/test_strategy_candle_count_change.md`
- The test should:
  - Navigate to Strategy page
  - Select EUR/USD pair and H1 timeframe
  - Click Load Data and wait for chart to render
  - Verify chart renders with 50 candles (default)
  - Change candle count to 100 and verify no errors occur
  - Verify chart updates with 100 candles visible
  - Change candle count to 200 and verify no errors occur
  - Verify chart updates with 200 candles visible
  - Change candle count back to 50 and verify no errors occur
  - Take screenshots at each step to prove the bug is fixed
- The test should explicitly check that no "Invalid time value" errors appear in console

### Run Validation Commands

- Execute all validation commands listed in the "Validation Commands" section below to ensure the bug is fixed with zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

**Manual Reproduction Test (Before Fix):**
- Start the application: `./scripts/start.sh`
- Manually reproduce the bug following the "Steps to Reproduce" section
- Confirm the error occurs before applying the fix

**Manual Reproduction Test (After Fix):**
- After implementing the fix, manually reproduce the same steps
- Verify that changing candle counts (50→100, 50→200, 100→50) works without errors
- Verify the chart updates smoothly with the new candle count
- Verify the zoom level indicator updates correctly

**E2E Test Execution:**
- Read `.claude/commands/test_e2e.md`, then read and execute your new `.claude/commands/e2e/test_strategy_candle_count_change.md` test file to validate this functionality works with zero errors

**Server Tests:**
- `cd app/server && uv run pytest` - Run server tests to validate the bug is fixed with zero regressions

**Frontend Build:**
- `cd app/client && npm run build` - Run frontend build to validate the bug is fixed with zero regressions and no TypeScript/build errors

## Notes

**Browser Console Debugging:**
- If additional debugging is needed, add console.log statements in `clampZoomRange` to inspect:
  - Input parameters (newRange, chartData)
  - Calculated avgDelta value
  - newStart and newEnd Date objects before toISOString() calls
  - Remove console.log statements after debugging

**Testing Edge Cases:**
- Test with different pairs and timeframes to ensure the fix works across all data sets
- Test with very small candle counts (10-20) and very large counts (500+)
- Test with different chart types (OHLC, Line, Area) in addition to Candlestick
- Test the volume toggle in combination with candle count changes

**Performance Considerations:**
- The validation checks add minimal overhead (a few milliseconds)
- Early returns on invalid data actually improve performance by avoiding unnecessary calculations
- No impact on chart rendering performance or user experience

**Related Features:**
- This fix also improves robustness of the zoom constraint system (feature 947a25d2)
- The keyboard zoom shortcuts (+/-, arrow keys) will benefit from more robust validation
- Date range buttons (1D, 5D, 1M, etc.) will be more stable with the validation

**Why This Bug Occurred:**
- The zoom constraint feature (947a25d2) was added recently and didn't account for edge cases in time delta calculations
- The original implementation assumed all timestamps would be valid and consecutive
- When changing candle counts, new data might have gaps or formatting inconsistencies
- The fix adds defensive programming to handle these edge cases gracefully
