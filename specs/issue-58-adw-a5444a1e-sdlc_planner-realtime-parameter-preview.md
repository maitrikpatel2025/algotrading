# Feature: Real-Time Parameter Adjustment Preview

## Metadata
issue_number: `58`
adw_id: `a5444a1e`
issue_json: `{"number":58,"title":"Feature Real-Time Parameter Adjustment Preview US-VSB-009","body":"/feature\n\nadw_sdlc_iso\n\nI want to see the indicator update instantly on the chart as I adjust parameters\nSo that I can visually tune settings to match my trading preferences\nAcceptance Criteria:\n\n Slider or input field changes trigger immediate chart recalculation\n Debounce applied (200ms) to prevent excessive recalculations during rapid changes\n \"Preview\" mode indicator shows changes are not yet saved\n \"Apply\" button confirms changes; \"Cancel\" reverts to original\n Parameter validation with min/max bounds and appropriate error messages\n Side-by-side before/after toggle available for comparison\n Calculation performance: update completes within 500ms for 1000 candles"}`

## Feature Description
This feature enhances the existing indicator settings dialog to provide real-time visual preview of indicator parameter changes directly on the chart. When users adjust indicator parameters (period, standard deviation, color, etc.) in the settings dialog, they will instantly see the updated indicator rendered on the chart with a visual distinction showing it's a preview that hasn't been saved yet. This TradingView-like experience allows traders to visually fine-tune indicator settings to match their analysis preferences before committing changes.

The feature includes debounced recalculation (200ms) to maintain performance during rapid parameter adjustments, a side-by-side before/after comparison toggle to evaluate changes, and optimized calculation performance ensuring updates complete within 500ms even for 1000 candles. All parameter changes respect existing validation constraints with clear error messaging.

## User Story
As a forex trader
I want to see the indicator update instantly on the chart as I adjust parameters
So that I can visually tune settings to match my trading preferences

## Problem Statement
Currently, when traders configure indicator parameters in the settings dialog, they must commit changes blindly without seeing how the indicator will appear on the chart. This forces a trial-and-error workflow where users must:
1. Set parameters based on guesswork
2. Apply changes to see the result
3. Reopen settings to adjust if unsatisfactory
4. Repeat until satisfied

This workflow is inefficient and frustrating, especially when fine-tuning multiple parameters (e.g., MACD fast/slow/signal periods) or comparing different parameter combinations. Traders cannot make informed decisions about optimal settings without visual feedback, leading to suboptimal technical analysis configurations.

## Solution Statement
Implement a real-time preview system within the indicator settings dialog that renders a live preview of the indicator on the chart as parameters are adjusted. The solution uses a dual-layer approach:

1. **Preview Layer**: Render a temporary "preview" indicator instance on the chart with updated parameters, visually distinguished (dashed lines, reduced opacity) to show it's not saved
2. **Debounced Recalculation**: Apply 200ms debounce to parameter changes to batch rapid adjustments and prevent excessive computation
3. **Before/After Toggle**: Provide a comparison mode that shows both original and preview indicators simultaneously, allowing side-by-side evaluation
4. **Performance Optimization**: Ensure calculations complete within 500ms for 1000 candles by optimizing pure calculation functions
5. **State Management**: Maintain original parameters in memory, only committing changes when user clicks "Apply" button

The implementation leverages existing pure calculation functions in `indicatorCalculations.js` and the instance-based indicator architecture, requiring minimal changes to core chart rendering logic while providing a professional-grade user experience.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/components/IndicatorSettingsDialog.jsx` (lines 1-424) - Main settings dialog component. Handles parameter inputs, validation, and color selection. Will be enhanced to trigger real-time preview calculations and manage preview state.

- `app/client/src/pages/Strategy.jsx` (lines 1-1051) - Strategy page managing indicator state. Contains `activeIndicators` state and handlers for adding/editing indicators. Will be extended to support preview indicator instances and before/after comparison mode.

- `app/client/src/components/PriceChart.jsx` (lines 1-574) - Chart rendering component. Receives `activeIndicators` prop and renders chart. Will be updated to distinguish preview indicators with different visual styling (dashed lines, reduced opacity).

- `app/client/src/app/chart.js` (lines 1-1052) - Chart creation and indicator rendering logic. Contains `createOverlayIndicatorTraces()` and `createSubchartIndicatorTraces()` functions. Will be enhanced to support preview mode styling for indicator traces.

- `app/client/src/app/indicatorCalculations.js` (lines 1-453) - Pure calculation functions for all indicators (SMA, EMA, RSI, MACD, Bollinger Bands, etc.). Already optimized for performance. May need minor enhancements for performance profiling.

- `app/client/src/app/indicators.js` (lines 1-350) - Indicator definitions and metadata. Contains `INDICATOR_PARAM_CONFIG` with parameter constraints. Referenced for validation logic.

- `.claude/commands/test_e2e.md` (lines 1-169) - E2E test runner specification. Defines how to execute E2E tests using Playwright. Required reading for creating the E2E test.

- `.claude/commands/e2e/test_trading_dashboard.md` (lines 1-46) - Example E2E test for trading dashboard. Provides test structure template.

- `.claude/commands/conditional_docs.md` (lines 1-209) - Documentation guide for conditional reading. Reference to understand what additional docs may be needed.

- `app_docs/feature-38950e42-indicator-settings-customization.md` (lines 1-96) - Documentation for existing indicator settings system. Explains current parameter configuration flow, validation, and edit mode.

- `app_docs/feature-32ef6eda-indicator-click-configuration.md` (lines 1-128) - Documentation for indicator click events. Explains how indicators are clicked and edited on the chart.

### New Files

- `.claude/commands/e2e/test_realtime_parameter_preview.md` - E2E test specification for validating real-time parameter adjustment preview functionality with before/after comparison mode, debounced updates, and performance requirements.

## Implementation Plan

### Phase 1: Foundation
Establish the architecture for preview mode by extending the indicator instance structure to support temporary preview states. Create utility functions for debouncing parameter changes and performance tracking. Set up the dual-state management system where original indicator parameters are preserved while preview parameters are being adjusted.

Key foundation work:
- Add `isPreview` flag to indicator instance structure
- Implement debounce utility with 200ms delay for parameter changes
- Create performance monitoring hooks to track calculation time
- Define preview styling constants (dashed lines, 0.6 opacity)
- Establish state separation between committed and preview indicators

### Phase 2: Core Implementation
Implement the real-time preview calculation and rendering system. When users adjust parameters in the settings dialog, trigger debounced calculations that create a temporary preview indicator instance. Update the chart rendering logic to visually distinguish preview indicators from committed ones using dashed lines and reduced opacity. Ensure all indicator types (overlay and subchart) support preview mode.

Core functionality:
- Enhance `IndicatorSettingsDialog.jsx` to trigger preview on parameter change
- Add preview state management in `Strategy.jsx` with `previewIndicator` state
- Modify chart rendering in `chart.js` to apply preview styling (dash, opacity)
- Implement side-by-side comparison mode with before/after toggle
- Add apply/cancel logic that commits or discards preview changes

### Phase 3: Integration
Integrate the preview system with existing indicator workflows including add mode, edit mode, and multi-parameter indicators. Ensure seamless transitions between preview and committed states. Add performance optimizations and validation feedback. Create comprehensive E2E tests to validate the entire feature including edge cases like rapid parameter changes, comparison mode toggles, and performance benchmarks.

Integration tasks:
- Connect preview system to all indicator types (SMA, EMA, MACD, RSI, BB, etc.)
- Validate preview performance meets 500ms requirement for 1000 candles
- Add visual indicators showing preview state (e.g., "Preview (not saved)" label)
- Implement keyboard shortcuts for quick apply/cancel (Enter/Escape)
- Create E2E test file validating all acceptance criteria

## Step by Step Tasks

### 1. Set Up Preview Infrastructure

- Add `isPreview` boolean flag to indicator instance type definition
- Create `useDebounce` hook in `app/client/src/hooks/useDebounce.js` for 200ms debouncing
- Add `usePerformanceMonitor` hook in `app/client/src/hooks/usePerformanceMonitor.js` to track calculation timing
- Define preview styling constants in `app/client/src/app/chartConstants.js`:
  - `PREVIEW_LINE_DASH = 'dash'`
  - `PREVIEW_OPACITY = 0.6`
  - `PREVIEW_LABEL_SUFFIX = ' (Preview)'`

### 2. Enhance Strategy.jsx State Management

- Add `previewIndicator` state to manage temporary preview instance
- Add `comparisonMode` state (boolean) for before/after toggle
- Create `handlePreviewUpdate(previewParams, previewColor)` callback to update preview indicator
- Create `handleComparisonToggle()` callback to enable/disable comparison mode
- Update `handleSettingsConfirm()` to apply preview changes and clear preview state
- Update `handleSettingsCancel()` to discard preview and restore original
- Pass preview-related props to `<IndicatorSettingsDialog>` and `<PriceChart>`

### 3. Update IndicatorSettingsDialog.jsx for Real-Time Preview

- Import `useDebounce` hook
- Add internal state `debouncedParams` using the debounce hook with 200ms delay
- Modify `handleParamChange()` to update local params immediately (for UI responsiveness)
- Create effect to call `onPreviewUpdate(debouncedParams, selectedColor)` when debounced params change
- Add "Preview Mode" indicator in dialog header when `isEditMode` and preview is active
- Add "Before/After Comparison" toggle button in dialog footer
- Add performance indicator showing calculation time (if > 200ms, show warning)
- Ensure preview triggers on both parameter and color changes

### 4. Modify PriceChart.jsx to Support Preview Rendering

- Accept new props: `previewIndicator`, `comparisonMode`
- Update `drawChart()` to handle preview indicators:
  - If `previewIndicator` exists and NOT in comparison mode, temporarily replace the editing indicator with preview
  - If `comparisonMode` is true, render both original AND preview side-by-side
- Pass `isPreview` flag to `createChartData()` in chart.js
- Update indicator badge rendering to show preview badge with different styling (dashed border, lighter background)
- Add "(Preview)" suffix to preview indicator names in badges

### 5. Enhance chart.js for Preview Styling

- Update `createOverlayIndicatorTraces()` to accept and check `indicator.isPreview` flag
- When `isPreview` is true, modify trace properties:
  - Set `line.dash = 'dash'`
  - Set `opacity = 0.6`
  - Append ' (Preview)' to trace name
- Apply same logic to `createSubchartIndicatorTraces()` for RSI, MACD, etc.
- Ensure preview traces still include proper `customdata` and `meta` for click detection
- Test all indicator types render correctly in preview mode (SMA, EMA, BB, MACD, RSI, Stochastic, etc.)

### 6. Implement Before/After Comparison Mode

- Update `PriceChart.jsx` to render both indicators when `comparisonMode` is true:
  - Original indicator with normal styling
  - Preview indicator with preview styling (dashed, transparent)
- Add visual labels/legend distinguishing "Current" vs "Preview" in comparison mode
- Ensure both indicators are clearly visible and not overlapping in a confusing way
- For subchart indicators, render both traces in the same subchart
- Add toggle button in `IndicatorSettingsDialog` to enable/disable comparison

### 7. Add Performance Monitoring and Optimization

- Integrate `usePerformanceMonitor` hook in preview calculation flow
- Measure time from parameter change to chart update completion
- Display calculation time in dialog footer (e.g., "Updated in 145ms")
- If calculation exceeds 500ms, show warning: "Preview calculation is slow. Consider reducing candle count."
- Profile calculation functions for 1000 candles to ensure baseline performance
- Add performance test in validation commands to verify 500ms requirement

### 8. Implement Apply/Cancel Logic

- Update `handleSettingsConfirm()` in Strategy.jsx:
  - Replace editing indicator with preview indicator (removing `isPreview` flag)
  - Clear `previewIndicator` state
  - Update related condition blocks with new parameters
- Update dialog cancel handler:
  - Clear `previewIndicator` state without applying changes
  - Restore original indicator if in edit mode
- Add keyboard shortcuts:
  - Enter key: Apply preview
  - Escape key: Cancel preview

### 9. Add Visual Feedback and Error Handling

- Add "Preview (not saved)" label in IndicatorSettingsDialog header when preview is active
- Show parameter validation errors inline without disrupting preview
- Add loading spinner during preview calculation if it takes > 100ms
- Show error message if preview calculation fails (e.g., invalid parameters)
- Add success animation when applying changes
- Ensure all error states are gracefully handled and don't break the chart

### 10. Create E2E Test File

- Create `.claude/commands/e2e/test_realtime_parameter_preview.md`
- Test scenarios:
  - Load chart with indicator, edit indicator, adjust parameter → preview updates in real-time
  - Rapid parameter changes → debounce prevents excessive recalculation
  - Toggle before/after comparison → both indicators render side-by-side
  - Apply button → preview becomes committed, preview clears
  - Cancel button → preview discards, original remains
  - Parameter validation → errors shown without breaking preview
  - Performance test → measure update time for 1000 candles (must be < 500ms)
  - Test with multiple indicator types: SMA, EMA, MACD, RSI, Bollinger Bands
- Include screenshots for each major step (10+ screenshots)
- Follow structure from `test_indicator_settings.md`

### 11. Test All Indicator Types with Preview

- Manually test preview mode with every indicator type:
  - Overlay: SMA, EMA, Bollinger Bands, Keltner Channel
  - Subchart: RSI, MACD, Stochastic, CCI, Williams %R, ATR, ADX, OBV
- Verify dashed lines and opacity apply correctly to all trace types
- Test multi-parameter indicators (MACD, Bollinger Bands, Stochastic)
- Test color changes trigger preview update
- Ensure preview works for both add mode and edit mode (edit mode is priority)

### 12. Run Validation Commands

- Execute all validation commands to ensure zero regressions
- Read `.claude/commands/test_e2e.md`
- Execute `.claude/commands/e2e/test_realtime_parameter_preview.md` to validate this feature
- Run `cd app/server && uv run pytest` to validate server tests pass
- Run `cd app/client && npm run build` to validate frontend builds without errors
- Manually test the full workflow on localhost to confirm smooth UX

## Testing Strategy

### Unit Tests
- **Debounce Hook**: Test `useDebounce` correctly delays updates by 200ms and cancels pending updates on rapid changes
- **Performance Monitor Hook**: Test `usePerformanceMonitor` accurately tracks calculation timing
- **Preview State Management**: Test preview indicator state updates correctly in Strategy.jsx
- **Chart Rendering**: Test preview styling (dash, opacity) applies correctly to indicator traces
- **Apply/Cancel Logic**: Test applying preview commits changes, canceling discards changes

### Edge Cases
- **Rapid Parameter Changes**: User slides period from 20 to 100 quickly → only final value triggers calculation after 200ms debounce
- **Invalid Parameters During Typing**: User types "5" (valid) then "50" (valid) then "500" (invalid) → preview shows error without breaking
- **Switch Indicators While Preview Active**: User opens preview for EMA, then clicks different indicator → preview clears, new indicator opens
- **Large Dataset Performance**: 1000 candles with complex indicator (Bollinger Bands) → preview completes within 500ms
- **Comparison Mode with Overlapping Lines**: Original and preview have same color → preview uses dashed style for distinction
- **Multiple Rapid Toggle of Comparison Mode**: Toggle on/off/on quickly → chart renders correctly without race conditions
- **Parameter at Min/Max Bounds**: Period = 1, period = 500, stdDev = 0.1, stdDev = 5 → all extremes render correctly
- **Preview During Chart Zoom/Pan**: User adjusts parameters while zooming chart → preview updates don't interfere with zoom state
- **Network Latency**: If chart data is loading when preview triggered → graceful handling with loading state
- **Edit Mode Cancel**: User opens edit, changes params (preview shows), then cancels → original indicator restored exactly

## Acceptance Criteria
- ✅ Slider or input field changes trigger immediate chart recalculation with 200ms debounce
- ✅ Preview indicator renders on chart with visual distinction (dashed lines, 0.6 opacity)
- ✅ "Preview (not saved)" label visible in dialog when preview is active
- ✅ Apply button commits preview changes to active indicator and clears preview state
- ✅ Cancel button discards preview changes and restores original indicator
- ✅ Parameter validation with min/max bounds shows inline errors without breaking preview
- ✅ Side-by-side before/after toggle renders both original and preview indicators simultaneously
- ✅ Calculation performance: preview update completes within 500ms for 1000 candles
- ✅ Debounce prevents excessive recalculations during rapid parameter adjustments
- ✅ All indicator types support preview mode (overlay and subchart)
- ✅ Keyboard shortcuts work (Enter to apply, Escape to cancel)
- ✅ Performance indicator shows calculation time in dialog
- ✅ E2E test validates complete workflow with screenshots
- ✅ Zero regressions: all existing tests pass, frontend builds successfully

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md` to understand the E2E test execution process
- Read and execute `.claude/commands/e2e/test_realtime_parameter_preview.md` to validate real-time parameter preview functionality, before/after comparison mode, debounced updates, and performance requirements (< 500ms for 1000 candles)
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Manual validation on localhost:
  - Load Strategy page with price data
  - Add EMA indicator with period 20
  - Click EMA badge to edit
  - Adjust period slider from 20 to 50 → verify preview updates in real-time with dashed line
  - Toggle before/after comparison → verify both EMA(20) and EMA(50) render side-by-side
  - Note calculation time in dialog footer → verify < 500ms for current candle count
  - Click Apply → verify EMA updates to 50 and preview clears
  - Repeat test with MACD (multi-parameter) and RSI (subchart) indicators
  - Test with 1000 candle dataset → verify performance < 500ms
  - Test rapid parameter changes → verify only final value calculates after debounce

## Notes

### Performance Optimization Strategies
If preview calculations exceed 500ms for 1000 candles:
1. **Memoize Calculation Results**: Cache calculation results for unchanged parameters
2. **Incremental Calculation**: For SMA/EMA, use incremental algorithms instead of full recalculation
3. **Web Worker**: Move calculations to web worker thread to prevent UI blocking
4. **Reduce Precision**: Use lower precision for preview, full precision on apply
5. **Visible Range Only**: Calculate indicator only for visible chart range, not entire dataset

### Future Enhancements
- **Preset Comparisons**: Compare current settings against saved presets (e.g., "Conservative EMA(50)" vs "Aggressive EMA(20)")
- **A/B/C Testing**: Compare up to 3 parameter combinations simultaneously
- **Optimization Wizard**: AI-suggested parameter values based on current market conditions
- **Parameter Slider Ranges**: Dynamic slider ranges based on candle count (longer periods for more candles)
- **Preview Persistence**: Remember last preview settings when reopening dialog
- **Mobile Touch Gestures**: Swipe to adjust parameters on mobile devices

### Technical Considerations
- The existing calculation functions in `indicatorCalculations.js` are already pure and performant, requiring no modifications
- Preview instances should not create condition blocks until applied (avoid cluttering logic panel)
- Preview styling must work with all Plotly trace types (scatter, bar, candlestick)
- Ensure preview indicators don't interfere with existing click handlers for indicator configuration
- Memory management: clear preview instances promptly to avoid accumulation
- Consider React.memo for PriceChart if preview updates cause unnecessary re-renders of other components

### Design Specifications
- Preview indicator opacity: 0.6 (60% transparent)
- Preview line style: 'dash' (dashed line pattern)
- Debounce delay: 200ms (balance between responsiveness and performance)
- Performance target: < 500ms for 1000 candles (ensures smooth UX)
- Before/After colors: Use same color scheme but rely on dashed vs solid line for distinction
- Dialog header preview label: "Preview (not saved)" in yellow/warning color
- Calculation time display: "Updated in Xms" in dialog footer, green if < 200ms, yellow if 200-500ms, red if > 500ms
