# E2E Test: Real-Time Parameter Adjustment Preview

## Test ID
`test_realtime_parameter_preview`

## Description
Validates the real-time parameter adjustment preview feature for indicators, including debounced updates, before/after comparison mode, apply/cancel functionality, and performance requirements.

## Prerequisites
- Application running on `http://localhost:5173`
- Server running on `http://localhost:5000`
- Test strategy page accessible
- At least one trading pair with price data available

## Test Steps

### 1. Setup - Load Strategy Page with Price Data
**Action:**
- Navigate to `http://localhost:5173`
- Wait for the page to load
- Verify price chart is visible with candlestick data

**Expected Result:**
- Strategy page loads successfully
- Price chart displays with candles
- No indicators are active initially

**Screenshot:** `01-strategy-page-loaded.png`

---

### 2. Add EMA Indicator with Default Parameters
**Action:**
- Open indicator library panel (click indicators button if collapsed)
- Find EMA indicator in the list
- Click "Add" button on EMA indicator
- In the settings dialog, verify default period is 20
- Click "Add Indicator" button

**Expected Result:**
- EMA indicator settings dialog opens
- Default period is 20
- EMA(20) is added to the chart with blue line
- EMA(20) badge appears in active indicators list

**Screenshot:** `02-ema-indicator-added.png`

---

### 3. Open Edit Mode for EMA Indicator
**Action:**
- Click on the EMA(20) badge or click directly on the EMA line in the chart
- Settings dialog should open in edit mode

**Expected Result:**
- Settings dialog opens with title "Edit Exponential Moving Average (EMA)"
- Current period value is 20
- "Preview Mode" yellow badge is visible in dialog header
- "Compare Before/After" toggle button is visible
- "Update" button (not "Add Indicator") is shown

**Screenshot:** `03-edit-mode-opened.png`

---

### 4. Test Real-Time Preview - Adjust Period Parameter
**Action:**
- In the period input field, change value from 20 to 50
- Wait for 200ms+ for debounce to trigger
- Observe the chart

**Expected Result:**
- EMA line on chart updates to show EMA(50) with dashed line style and reduced opacity
- EMA badge shows "EMA(50) (Preview)" with amber/yellow background and dashed border
- Original EMA(20) is no longer visible (replaced by preview)
- Calculation time indicator appears in dialog footer (e.g., "Calculation time: 45ms" in green)
- Preview line is visually distinct with dashed pattern and 60% opacity

**Screenshot:** `04-preview-period-50.png`

---

### 5. Test Rapid Parameter Changes (Debounce Validation)
**Action:**
- Quickly change period: 50 → 60 → 70 → 80 (type rapidly without pausing)
- Observe that chart only updates after typing stops for 200ms

**Expected Result:**
- Chart does NOT update on every keystroke
- Only the final value (80) triggers a chart update after 200ms pause
- Calculation time shows single update, not multiple
- This validates debounce is working correctly

**Screenshot:** `05-debounced-update-period-80.png`

---

### 6. Test Color Change with Preview
**Action:**
- Click on the orange color swatch in the color palette
- Wait for debounce (200ms)

**Expected Result:**
- EMA preview line changes to orange color
- Line remains dashed with reduced opacity
- Preview badge updates to show orange border
- Calculation time updates again

**Screenshot:** `06-preview-color-change.png`

---

### 7. Enable Before/After Comparison Mode
**Action:**
- Click the "Compare Before/After" toggle button at the bottom left of the dialog

**Expected Result:**
- Button changes to "Comparison On" with eye icon
- Button has blue/primary background indicating active state
- Chart now shows BOTH indicators:
  - Original EMA(20) in blue with solid line (normal style)
  - Preview EMA(80) in orange with dashed line (preview style)
- Both indicators are visible simultaneously for comparison
- Badge list shows both EMA(20) and EMA(80) (Preview)

**Screenshot:** `07-comparison-mode-enabled.png`

---

### 8. Adjust Parameters in Comparison Mode
**Action:**
- While comparison mode is ON, change period from 80 to 100
- Wait for debounce

**Expected Result:**
- Original EMA(20) remains visible (blue, solid)
- Preview updates to EMA(100) (orange, dashed)
- Both lines clearly visible for side-by-side comparison
- Calculation time updates

**Screenshot:** `08-comparison-mode-period-100.png`

---

### 9. Disable Comparison Mode
**Action:**
- Click "Comparison On" button to toggle it off

**Expected Result:**
- Button changes back to "Compare Before/After" with eye-off icon
- Only preview indicator EMA(100) is visible (original is hidden)
- Chart shows single dashed orange line for EMA(100)

**Screenshot:** `09-comparison-mode-disabled.png`

---

### 10. Test Cancel Button - Discard Changes
**Action:**
- Click "Cancel" button in the dialog

**Expected Result:**
- Dialog closes
- Chart reverts to original EMA(20) in blue with solid line
- Preview indicator is removed completely
- EMA badge shows only "EMA(20)" without preview label
- All parameter changes are discarded

**Screenshot:** `10-cancel-reverts-changes.png`

---

### 11. Test Apply Button - Commit Changes
**Action:**
- Click on EMA(20) badge to reopen edit dialog
- Change period to 50
- Wait for preview to update (dashed line, EMA(50))
- Click "Apply" button

**Expected Result:**
- Dialog closes
- EMA indicator updates to EMA(50) with solid line (no longer preview)
- Badge shows "EMA(50)" without "(Preview)" label
- Line is solid blue, not dashed (preview style removed)
- Changes are permanently applied

**Screenshot:** `11-apply-commits-changes.png`

---

### 12. Test with Multi-Parameter Indicator (MACD)
**Action:**
- Add MACD indicator to the chart (default params: 12, 26, 9)
- Click MACD badge to edit
- Change fast period from 12 to 10
- Change slow period from 26 to 20
- Observe preview updates

**Expected Result:**
- MACD preview updates with dashed lines for all three components (MACD line, signal line, histogram)
- All traces have reduced opacity (60%)
- Preview shows "MACD (Preview)" labels
- Calculation time displayed in dialog
- Multiple parameter changes work correctly

**Screenshot:** `12-macd-multi-param-preview.png`

---

### 13. Test with Subchart Indicator (RSI)
**Action:**
- Add RSI indicator (default period 14)
- Click RSI badge to edit
- Change period to 21
- Observe preview in RSI subchart

**Expected Result:**
- RSI subchart shows preview line with dashed style
- Preview line has reduced opacity
- RSI label shows "(Preview)" suffix
- Subchart indicators support preview correctly

**Screenshot:** `13-rsi-subchart-preview.png`

---

### 14. Test Parameter Validation with Preview
**Action:**
- Edit RSI indicator
- Try to enter invalid period: 0 (below minimum)
- Then try 200 (above maximum 100)
- Then enter valid value 30

**Expected Result:**
- Period = 0: Inline error "Min: 1", preview does NOT update (validation prevents it)
- Period = 200: Inline error "Max: 100", preview does NOT update
- Period = 30: Error clears, preview updates correctly with RSI(30)
- Validation errors do not break the preview functionality

**Screenshot:** `14-parameter-validation.png`

---

### 15. Test Performance with 1000 Candles (if data available)
**Action:**
- Set candle count to highest available (up to 1000 if supported)
- Edit an indicator (e.g., EMA)
- Change a parameter
- Observe calculation time in dialog footer

**Expected Result:**
- Calculation time is displayed in milliseconds
- If < 200ms: Green color (good performance)
- If 200-500ms: Yellow/amber color (acceptable)
- If > 500ms: Red color with warning message
- Preview should complete within 500ms even for 1000 candles

**Screenshot:** `15-performance-1000-candles.png`

---

### 16. Test Keyboard Shortcuts
**Action:**
- Open EMA edit dialog
- Change period to a different value
- Press Enter key (should apply)
- Reopen dialog
- Make a change
- Press Escape key (should cancel)

**Expected Result:**
- Enter key: Changes are applied, dialog closes, indicator updates
- Escape key: Changes are discarded, dialog closes, indicator reverts to original
- Keyboard shortcuts work correctly

**Screenshot:** `16-keyboard-shortcuts.png`

---

### 17. Test Multiple Indicators with Preview
**Action:**
- Add EMA(20), SMA(50), and RSI(14) to chart
- Edit EMA to preview EMA(30)
- While preview is active, click SMA badge

**Expected Result:**
- EMA preview is cleared when switching to SMA edit
- SMA edit dialog opens with no preview active
- Chart shows original EMA(20), SMA(50), and RSI(14)
- Preview state is properly managed when switching between indicators

**Screenshot:** `17-switch-indicators-clears-preview.png`

---

### 18. Test Bollinger Bands Preview (Band Indicator)
**Action:**
- Add Bollinger Bands with default params (period=20, stdDev=2)
- Edit and change stdDev from 2 to 3
- Enable comparison mode

**Expected Result:**
- Preview shows three dashed bands (upper, middle, lower) with reduced opacity
- Original bands remain visible in comparison mode (solid lines)
- Fill area between bands is also rendered with reduced opacity for preview
- All three traces work correctly with preview styling

**Screenshot:** `18-bollinger-bands-preview.png`

---

## Success Criteria
- ✅ Real-time preview updates on parameter change after 200ms debounce
- ✅ Preview indicator renders with dashed line style and 60% opacity
- ✅ Preview badge shows "(Preview)" label with amber background and dashed border
- ✅ Before/after comparison mode works (shows both original and preview)
- ✅ Comparison toggle button updates state correctly
- ✅ Apply button commits changes and removes preview styling
- ✅ Cancel button discards changes and restores original indicator
- ✅ Debounce prevents excessive recalculations during rapid typing
- ✅ Calculation time indicator shows performance in ms with color coding
- ✅ Parameter validation prevents invalid preview updates
- ✅ Multi-parameter indicators (MACD, Bollinger Bands) work correctly
- ✅ Subchart indicators (RSI, MACD) support preview mode
- ✅ Keyboard shortcuts (Enter to apply, Escape to cancel) work
- ✅ Performance: Updates complete within 500ms for large datasets
- ✅ Switching between indicators properly clears preview state
- ✅ All indicator types tested: SMA, EMA, RSI, MACD, Bollinger Bands

## Notes
- Test should be run on a development build with full price data loaded
- If 1000 candle data is not available, test with maximum available candles
- Performance threshold: < 500ms for preview calculation is acceptable, < 200ms is ideal
- Visual distinction between preview and committed indicators is critical for UX
- Comparison mode is particularly useful for fine-tuning multi-parameter indicators
