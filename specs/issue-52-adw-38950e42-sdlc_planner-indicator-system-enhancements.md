# Feature: Indicator System Enhancements

## Metadata
issue_number: `52`
adw_id: `38950e42`
issue_json: `{"number":52,"title":"Bug Indicator System Limitations","body":"/bug\n\nadw_sdlc_iso\n\nmodel_set heavy\n\n\ncharting system has indicators (EMA, SMA, RSI, etc.) but they don't work like TradingView: \n\n1. **Can't customize periods** - EMA always shows period 20, can't change it to 50 or 200\n2. **Can't add multiple of same indicator** - Can't have EMA(20), EMA(50), and EMA(200) at the same time\n3. **Not enough historical data** - Chart only shows max 200 candles, but EMA(200) needs 200+ candles to calculate properly\n4. **Indicators don't span the full chart** - They only show on a few candles instead of the entire chart\n5. **Can't edit indicators after adding** - Once added, you can only remove them, not change settings\n\n## **What Needs to Be Done**\n\n### 1. **Add Settings Dialog**\n- When user drags & drops an indicator, show a popup to customize: \n  - Period (20, 50, 200, etc.)\n  - Colors\n  - Other parameters (like standard deviation for Bollinger Bands)\n\n### 2. **Allow Multiple Instances**\n- Let users add the same indicator multiple times with different settings\n- Example: EMA(20) in orange + EMA(50) in blue + EMA(200) in purple\n\n### 3. **Add Edit Capability**\n- Click on indicator badge to reopen settings and modify parameters\n- Don't have to remove and re-add to change settings\n\n### 4. **Increase Historical Data**\n- Add more candle count options:  500, 1000, 2000\n- Make sure backend API can fetch that much data\n- Ensure calculations work across the full dataset\n\n### 5. **Fix Indicator Calculations**\n- Make sure indicators calculate and display across ALL candles in the chart\n- Currently only showing partial data\n\n---\n\n**End Result:** Chart works exactly like TradingView - professional indicator management with full customization. \n\nFollow style guide for ui"}`

## Feature Description
This feature enhances the indicator system to provide TradingView-like functionality for technical analysis indicators. Users will be able to customize indicator parameters (period, color, etc.), add multiple instances of the same indicator with different settings, edit indicator settings after adding them, and work with larger datasets up to 2000 candles for more accurate long-period indicator calculations.

## User Story
As a forex trader
I want to customize indicator parameters, add multiple instances of the same indicator, and edit settings after adding
So that I can perform professional-grade technical analysis with full flexibility like TradingView

## Problem Statement
The current indicator system has several limitations that prevent professional technical analysis:
1. Fixed default parameters - EMA always uses period 20, cannot be changed to 50 or 200
2. Single instance restriction - Cannot add EMA(20), EMA(50), and EMA(200) simultaneously
3. Limited historical data - Maximum 200 candles, but EMA(200) requires 200+ candles for accurate calculation
4. No edit capability - Must remove and re-add indicators to change settings
5. Indicator calculations may not span the full chart properly

## Solution Statement
Implement a comprehensive indicator settings system with:
1. **Settings Dialog** - Modal that appears when dropping an indicator, allowing customization of period, color, and indicator-specific parameters
2. **Multiple Instances** - Each indicator instance gets a unique ID allowing multiple of the same type with different settings
3. **Edit Capability** - Clicking an indicator badge opens the settings dialog to modify parameters
4. **Extended Data** - Add candle count options for 500, 1000, and 2000 candles to support long-period indicators
5. **Full Chart Calculations** - Ensure indicator calculations span the entire dataset and render across all candles

## Relevant Files
Use these files to implement the feature:

**Frontend - Core Indicator System:**
- `app/client/src/app/indicators.js` - Contains indicator definitions with `defaultParams`, `color`, and type metadata. Will need to ensure parameter schema is properly defined for each indicator.
- `app/client/src/app/indicatorCalculations.js` - Contains pure calculation functions for all 14 indicators. Already spans full dataset - no changes needed.
- `app/client/src/app/chart.js` - Renders indicator overlays and subcharts. Will need to use custom parameters from indicator instances instead of only default params.
- `app/client/src/app/data.js` - Contains `COUNTS` array with candle count options. Will add 500, 1000, 2000 options.

**Frontend - Components:**
- `app/client/src/components/IndicatorLibrary.jsx` - Drag source for indicators. Will need to trigger settings dialog on drop instead of immediate add.
- `app/client/src/components/PriceChart.jsx` - Drop target and active indicator display. Will need to handle settings dialog trigger and edit capability.
- `app/client/src/pages/Strategy.jsx` - Main orchestrator with indicator state management. Will manage settings dialog state and handle parameter updates.

**Backend:**
- `app/server/server.py` - Contains `/api/prices/{pair}/{granularity}/{count}` endpoint. Will need to verify it can handle larger candle counts.

**Styling:**
- `ai_docs/ui_style_guide.md` - UI style guide to follow for dialog design.

**E2E Testing:**
- `.claude/commands/test_e2e.md` - E2E test runner instructions.
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test file.
- `.claude/commands/e2e/test_drag_indicator_onto_chart.md` - Existing indicator drag test to reference.

### New Files
- `app/client/src/components/IndicatorSettingsDialog.jsx` - New dialog component for indicator parameter configuration
- `.claude/commands/e2e/test_indicator_settings.md` - E2E test for the indicator settings functionality

## Implementation Plan

### Phase 1: Foundation
1. Extend candle count options in `data.js` to include 500, 1000, 2000
2. Verify backend can handle larger data requests
3. Define parameter schema for each indicator type (what fields are editable, min/max values)

### Phase 2: Core Implementation
1. Create `IndicatorSettingsDialog` component with form fields for period, color, and indicator-specific parameters
2. Modify Strategy.jsx to show settings dialog on indicator drop instead of immediate add
3. Update indicator instance structure to store custom parameters
4. Update chart.js to use instance-specific parameters instead of defaults

### Phase 3: Integration
1. Implement edit capability - clicking badge opens settings dialog with current values
2. Update indicator badges to show custom parameters in display name
3. Ensure multiple instances of same indicator render with distinct colors
4. Test full chart calculation spans with long-period indicators (e.g., EMA 200)

## Step by Step Tasks

### Task 1: Create E2E Test Specification
- Create `.claude/commands/e2e/test_indicator_settings.md` E2E test file
- Define test steps for: opening settings dialog, customizing parameters, adding multiple instances, editing existing indicators
- Include success criteria for validating the feature works as expected

### Task 2: Extend Candle Count Options
- Edit `app/client/src/app/data.js` to add 500, 1000, 2000 to `COUNTS` array
- Verify the backend `/api/prices` endpoint can handle these larger counts without timeout
- Update any validation in `calculateCandleCount` if needed to support larger max values

### Task 3: Create Indicator Settings Dialog Component
- Create `app/client/src/components/IndicatorSettingsDialog.jsx`
- Use Shadcn UI Dialog component pattern from style guide
- Include fields based on indicator type:
  - All indicators: Color picker (select from preset colors)
  - SMA/EMA/RSI/CCI/Williams %R/ATR/ADX: Period input (number field with min/max validation)
  - MACD: Fast Period, Slow Period, Signal Period
  - Stochastic: K Period, D Period
  - Bollinger Bands: Period, Standard Deviation
  - Keltner Channel: Period, ATR Multiplier
- Include "Add Indicator" and "Cancel" buttons
- For edit mode: Include "Update" and "Cancel" buttons
- Follow UI style guide for colors, spacing, and typography

### Task 4: Integrate Settings Dialog with Drag-Drop Flow
- Modify `app/client/src/pages/Strategy.jsx`:
  - Add state for settings dialog: `isSettingsDialogOpen`, `pendingIndicator`, `editingIndicator`
  - Update `handleIndicatorDrop` to open settings dialog instead of immediately adding
  - Create `handleSettingsConfirm` to add indicator with custom parameters
  - Create `handleSettingsCancel` to close dialog without adding
- Ensure indicator instance stores custom `params` and `color` from dialog

### Task 5: Update Indicator Instance Structure
- Modify indicator instance creation in `Strategy.jsx` to include:
  ```javascript
  {
    ...indicatorDef,
    instanceId: `${indicator.id}-${Date.now()}`,
    params: customParams, // From dialog, not just defaultParams
    color: customColor,   // From dialog, not just indicator.color
  }
  ```
- Update `getIndicatorDisplayName` in `indicators.js` to use instance params

### Task 6: Update Chart Rendering to Use Custom Parameters
- Modify `app/client/src/app/chart.js`:
  - Update `createOverlayIndicatorTraces` to accept and use `indicator.params` instead of `indicator.defaultParams`
  - Update `createSubchartIndicatorTraces` similarly
  - Ensure indicator color from instance is used for trace rendering
- Verify calculations span the full candle dataset

### Task 7: Implement Edit Capability
- Modify `app/client/src/components/PriceChart.jsx`:
  - Make indicator badges clickable (add onClick handler)
  - Pass `onEditIndicator` callback prop from Strategy.jsx
- Modify `app/client/src/pages/Strategy.jsx`:
  - Create `handleEditIndicator` to open settings dialog with existing indicator's params
  - Create `handleUpdateIndicator` to update indicator params in state
  - Ensure chart re-renders with updated parameters

### Task 8: Update Indicator Badge Display
- Modify badge rendering in `PriceChart.jsx` to:
  - Show indicator display name with custom params (e.g., "EMA (50)" instead of just "EMA")
  - Use the indicator's custom color as badge accent color
  - Add visual affordance indicating badge is clickable (cursor-pointer, hover effect)

### Task 9: Test Multiple Instances
- Manually verify:
  - Can add EMA(20) + EMA(50) + EMA(200) simultaneously
  - Each instance renders with its own color
  - Each instance calculates with its own period
  - Removing one instance doesn't affect others
  - Editing one instance doesn't affect others

### Task 10: Run Validation Commands
- Run all validation commands to ensure zero regressions
- Execute E2E test to validate the feature works end-to-end

## Testing Strategy

### Unit Tests
- Test indicator calculation functions with various periods (covered by existing tests)
- Test `getIndicatorDisplayName` with custom parameters

### Edge Cases
- EMA(200) on 200 candles - should show calculation starting from last candle
- EMA(200) on 2000 candles - should show full line from candle 200 onwards
- Adding 5 overlay indicators (max limit) with different parameters
- Adding same indicator twice with identical parameters (should be allowed, unique instanceId)
- Editing indicator to have period larger than candle count
- Color picker with invalid or empty selection

## Acceptance Criteria
1. Dropping an indicator onto chart opens a settings dialog
2. Settings dialog allows customization of period, color, and indicator-specific parameters
3. Multiple instances of the same indicator can be added with different settings
4. Each indicator instance displays with its configured color
5. Each indicator instance calculates with its configured parameters
6. Clicking an indicator badge opens settings dialog for editing
7. Updated parameters reflect immediately on the chart
8. Candle count selector includes 500, 1000, 2000 options
9. Long-period indicators (e.g., EMA 200) calculate correctly on large datasets
10. Indicator badge displays custom parameters (e.g., "EMA (50)" not just "EMA")
11. All existing indicator functionality continues to work (overlay, subchart, undo, remove)

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_indicator_settings.md` E2E test to validate this functionality works

## Notes
- The current indicator system already supports multiple instances via unique `instanceId` - this feature extends that by allowing different parameters per instance
- Indicator calculations already span the full dataset and return `null` for indices with insufficient data - no changes needed to calculation functions
- The settings dialog should use controlled form inputs with validation to prevent invalid parameter values
- Consider debouncing chart updates when editing parameters to prevent performance issues
- Color picker can use a predefined palette of colors that work well with the chart theme (from UI style guide)
- Future enhancement: Allow saving indicator presets for quick reuse
