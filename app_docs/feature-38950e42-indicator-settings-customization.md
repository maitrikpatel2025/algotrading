# Indicator Settings and Customization System

**ADW ID:** 38950e42
**Date:** 2026-01-19
**Specification:** specs/issue-52-adw-38950e42-sdlc_planner-indicator-system-enhancements.md

## Overview

This feature enhances the indicator system to provide TradingView-like functionality for technical analysis indicators. Users can now customize indicator parameters (period, color, standard deviation, etc.), add multiple instances of the same indicator with different settings, and edit indicator settings after adding them to the chart.

## What Was Built

- **Indicator Settings Dialog** - Modal dialog for configuring indicator parameters before adding to chart
- **Multiple Instance Support** - Ability to add the same indicator multiple times with different settings (e.g., EMA(20), EMA(50), EMA(200))
- **Edit Capability** - Click indicator badges to modify parameters after adding
- **Extended Candle Counts** - Added 500, 1000, and 2000 candle options for long-period indicator calculations
- **Custom Parameter Rendering** - Chart renders indicators using custom parameters instead of defaults

## Technical Implementation

### Files Modified

- `app/client/src/components/IndicatorSettingsDialog.jsx`: New component providing modal dialog for indicator parameter configuration with color picker, parameter inputs, validation, and preview
- `app/client/src/pages/Strategy.jsx`: Added settings dialog state management, modified indicator drop flow to open dialog instead of immediate add, implemented edit capability
- `app/client/src/components/PriceChart.jsx`: Updated indicator badges to be clickable for editing, show custom parameter display names, added settings icon on hover
- `app/client/src/app/chart.js`: Modified to use `indicator.params` for custom parameters instead of only `defaultParams`
- `app/client/src/app/data.js`: Extended COUNTS array with 500, 1000, 2000 options and updated max candle count to 2000

### Key Changes

- **Settings Dialog Flow**: When an indicator is dropped, the settings dialog opens first. Users configure parameters and color, then click "Add Indicator" to add it to the chart
- **Parameter Configuration**: Each indicator type has defined parameter schema with min/max validation (e.g., SMA/EMA period 1-500, RSI period 1-100, Bollinger Bands stdDev 0.1-5)
- **Color Picker**: 12 predefined colors from UI style guide for indicator customization
- **Instance Storage**: Indicator instances now store custom `params` and `color` properties alongside the original definition
- **Edit Mode**: Clicking an indicator badge opens the dialog in edit mode, pre-populated with current values

## How to Use

1. **Adding an Indicator**:
   - Drag an indicator from the Indicator Library panel
   - Drop it onto the chart area
   - Configure parameters (period, color, etc.) in the settings dialog
   - Click "Add Indicator" to add it to the chart

2. **Editing an Indicator**:
   - Click on the indicator badge below the chart (badges show indicator name with parameters)
   - Modify parameters in the settings dialog
   - Click "Update" to apply changes

3. **Multiple Instances**:
   - Add the same indicator type multiple times with different settings
   - Example: Add EMA(20) in orange, then EMA(50) in blue, then EMA(200) in purple

4. **Extended Historical Data**:
   - Use the candle count selector to choose 500, 1000, or 2000 candles
   - Long-period indicators like EMA(200) require more candles for accurate calculation

## Configuration

### Indicator Parameter Limits

| Indicator | Parameter | Min | Max | Default |
|-----------|-----------|-----|-----|---------|
| SMA/EMA | Period | 1 | 500 | 20 |
| RSI | Period | 1 | 100 | 14 |
| CCI | Period | 1 | 100 | 20 |
| Williams %R | Period | 1 | 100 | 14 |
| ATR | Period | 1 | 100 | 14 |
| ADX | Period | 1 | 100 | 14 |
| MACD | Fast/Slow/Signal | 1 | 100 | 12/26/9 |
| Stochastic | K/D Period | 1 | 100 | 14/3 |
| Bollinger Bands | Period | 1 | 500 | 20 |
| Bollinger Bands | Std Dev | 0.1 | 5 | 2 |
| Keltner Channel | Period | 1 | 500 | 20 |
| Keltner Channel | ATR Mult | 0.1 | 5 | 2 |

### Available Colors

Blue (#3B82F6), Orange (#F97316), Green (#22C55E), Purple (#A855F7), Violet (#8B5CF6), Pink (#EC4899), Teal (#14B8A6), Amber (#F59E0B), Red (#EF4444), Cyan (#06B6D4), Lime (#84CC16), Sky (#0EA5E9)

## Testing

- Run E2E test: `.claude/commands/e2e/test_indicator_settings.md`
- Manual verification:
  - Drop indicator → settings dialog opens
  - Configure parameters and add → indicator renders with custom settings
  - Click badge → edit dialog opens with current values
  - Add multiple instances of same indicator with different colors/periods

## Notes

- Indicator calculations already support variable parameters - the calculation functions accept parameters dynamically
- The settings dialog validates inputs to prevent invalid values (e.g., period below 1)
- Existing indicators without custom `params` fall back to `defaultParams` for backward compatibility
- Future enhancement: Allow saving indicator presets for quick reuse
