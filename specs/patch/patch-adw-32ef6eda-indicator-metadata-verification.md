# Patch: Verify Indicator Trace Metadata Integrity

## Metadata
adw_id: `32ef6eda`
review_change_request: `Issue #2: Indicator traces do not have the required metadata. Browser inspection showed 0 out of 4 traces have indicator metadata (meta.instanceId). This means even if click events worked, they couldn't identify which indicator was clicked. Resolution: Verify that the metadata additions in chart.js are being applied correctly. Check that the drawChart function is using the updated code with customdata and meta fields, and that indicators are being passed with the correct structure including instanceId. Severity: blocker`

## Issue Summary
**Original Spec:** specs/issue-56-adw-32ef6eda-sdlc_planner-indicator-configuration-modal.md
**Issue:** Browser inspection revealed that 0 out of 4 indicator traces have the required metadata (meta.instanceId). The code in chart.js appears to add `customdata` and `meta` fields to traces, but they are not appearing in the rendered Plotly chart, preventing indicator identification during click events.
**Solution:** Verify that indicators being passed to drawChart have the `instanceId` property set correctly, and ensure Plotly is not stripping or ignoring the metadata during chart rendering. Add explicit verification that metadata is preserved through the Plotly rendering pipeline.

## Files to Modify
Use these files to implement the patch:

- `app/client/src/app/chart.js` - Verify and ensure metadata is properly applied to all indicator traces
- `app/client/src/components/PriceChart.jsx` - Add debugging to verify metadata presence after chart render

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Verification Logging to Chart Rendering
- Open `app/client/src/components/PriceChart.jsx`
- After the `drawChart` call in the useEffect, add temporary logging to verify:
  - That indicators passed to drawChart include `instanceId` property
  - That the rendered Plotly chart div has traces with metadata
  - Use `chartElement.data` to inspect trace metadata after rendering
- Log the structure: `console.log('Indicators:', activeIndicators)` and `console.log('Chart traces:', chartElement.data)`

### Step 2: Verify Metadata Persistence in chart.js
- Open `app/client/src/app/chart.js`
- In the `createOverlayIndicatorTraces` function, verify all trace objects include both `customdata` and `meta` fields
- In the `createSubchartIndicatorTraces` function, verify all trace objects include both `customdata` and `meta` fields
- Ensure the metadata is added BEFORE traces are pushed to the data array
- Check that the metadata format matches Plotly's expected structure (object for `meta`, array for `customdata`)

### Step 3: Verify Indicator Structure in Strategy.jsx
- Open `app/client/src/pages/Strategy.jsx`
- Verify that when indicators are added to `activeIndicators`, they include the `instanceId` property
- Check the indicator creation/addition logic to ensure `instanceId` is generated and assigned
- Verify the indicator object structure matches what chart.js expects: `{ id, instanceId, type, params, color, ... }`

### Step 4: Test Metadata Presence
- Build and run the application
- Open browser DevTools console
- Navigate to Strategy page and add SMA and Stochastic indicators
- Check console logs for indicator structure and trace metadata
- Use browser inspection: `document.querySelector('#chart-div').data` to verify trace metadata
- Confirm that each trace has `meta.instanceId` and `customdata` populated

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. `cd app/client && npm run build` - Verify frontend builds without errors
2. `cd app/server && uv run pytest` - Verify backend tests pass
3. Manual browser testing:
   - Start application with `./scripts/start.sh`
   - Navigate to Strategy page
   - Add SMA (overlay) and Stochastic (subchart) indicators
   - Open DevTools Console and verify logs show indicators with instanceId
   - In DevTools Console, run: `document.querySelector('[id*="chart"]').data` to inspect traces
   - Verify each indicator trace has `meta: { indicatorId: '...', instanceId: '...' }` and `customdata` array
   - Count traces with metadata - should match number of indicator traces added
4. If metadata is missing, investigate where instanceId is lost in the data flow

## Patch Scope
**Lines of code to change:** ~10-15 lines (mostly adding verification and debugging)
**Risk level:** low
**Testing required:** Manual browser inspection to verify metadata is present on rendered traces. This is purely diagnostic to identify where the metadata is being lost.
