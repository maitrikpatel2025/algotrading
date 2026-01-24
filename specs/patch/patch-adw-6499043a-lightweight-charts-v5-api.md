# Patch: Clear webpack cache for lightweight-charts v5 API fix

## Metadata
adw_id: `6499043a`
review_change_request: `The backtest results page fails to load with JavaScript error 'chart.addAreaSeries is not a function'. Code is correctly updated to lightweight-charts v5 API but webpack dev server serves cached bundle with old code. Clear webpack cache and restart dev server.`

## Issue Summary
**Original Spec:** N/A (runtime caching issue, not code issue)
**Issue:** The EquityCurveChart component code has been correctly updated to use lightweight-charts v5 API (`chart.addAreaSeries()` and `chart.addLineSeries()` instead of the deprecated `chart.addSeries('Area')` and `chart.addSeries('Line')`), but the webpack dev server is serving a cached bundle containing the old v4 API calls, causing the runtime error `chart.addAreaSeries is not a function`.
**Solution:** Clear the webpack cache directory (`node_modules/.cache`) and restart the dev server to serve the correctly updated code.

## Files to Modify
This is a cache/environment issue, not a code change:

- `app/client/node_modules/.cache/` - Delete webpack cache directory

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Clear webpack cache
- Delete the webpack cache directory at `app/client/node_modules/.cache/`
- This forces webpack to recompile all modules from the updated source files

### Step 2: Verify code changes are correct
- Confirm the git diff shows the correct v5 API usage:
  - Line 112: `chart.addAreaSeries({` (was `chart.addSeries('Area', {`)
  - Line 137: `chart.addLineSeries({` (was `chart.addSeries('Line', {`)

### Step 3: Restart development server
- Stop any running dev server process
- Start fresh dev server with `npm start` in `app/client/`
- The new bundle will be compiled with the updated lightweight-charts v5 API calls

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Clear cache and verify deletion:**
   ```bash
   rm -rf app/client/node_modules/.cache && ls app/client/node_modules/.cache 2>&1 | grep -q "No such file" && echo "Cache cleared successfully"
   ```

2. **Run frontend build to verify code compiles:**
   ```bash
   cd app/client && npm run build
   ```

3. **Run all backend tests:**
   ```bash
   cd app/server && uv run pytest tests/ -v --tb=short
   ```

4. **Start application and verify backtest results page loads:**
   - Start the application
   - Navigate to backtest results page
   - Verify EquityCurveChart renders without JavaScript errors
   - Verify Performance by Time Period section is visible

## Patch Scope
**Lines of code to change:** 0 (cache clearing only, code already correct)
**Risk level:** low
**Testing required:** Verify frontend build succeeds and backtest results page renders correctly with no console errors
