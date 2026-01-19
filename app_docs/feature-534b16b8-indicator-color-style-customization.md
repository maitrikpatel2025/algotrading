# Feature: Indicator Color and Style Customization

**Feature ID:** 534b16b8
**Issue:** #60
**Status:** Implemented

## Overview

This feature extends the existing indicator customization system to provide comprehensive visual styling controls for technical indicators. Users can now customize not only colors and parameters but also line thickness, line style (solid, dashed, dotted), and fill opacity for indicators rendered on charts.

## User Story

As a forex trader
I want to customize indicator colors, line thickness, and style
So that I can distinguish multiple indicators and match my visual preferences

## Problem Statement

While users could customize indicator parameters and colors through the IndicatorSettingsDialog, they lacked control over visual presentation aspects like line thickness, line style, and fill opacity. When multiple indicators are displayed on the same chart, especially overlay indicators like moving averages or Bollinger Bands, it becomes difficult to visually distinguish between them without additional styling controls. Professional traders using platforms like TradingView expect granular control over indicator appearance to create personalized, easily readable chart layouts.

## Solution

We extended the IndicatorSettingsDialog component to include additional styling controls:

1. **Line Thickness Selector**: Button group with options for 1px, 2px, 3px, and 4px line widths
2. **Line Style Selector**: Button group with options for Solid, Dashed, and Dotted line styles
3. **Opacity Slider**: Range slider (0-100%) to control fill opacity for indicators with filled areas (Bollinger Bands, Keltner Channel)
4. **Reset to Default Button**: Button to restore all styling properties to their original default values

The solution leverages the existing indicator instance model where each indicator stores custom `params`, `color`, and now also stores `lineWidth`, `lineStyle`, and `fillOpacity`. The chart rendering code applies these styling properties when creating Plotly traces. The real-time preview system extends to show styling changes immediately in the settings dialog.

## Technical Implementation

### Architecture

The feature builds upon these existing systems:
- **Indicator Settings System** (`feature-38950e42`): Provides the base dialog and parameter customization
- **Real-Time Preview System** (`feature-a5444a1e`): Provides the infrastructure for live preview updates

### Key Components

#### 1. Chart Constants (`app/client/src/app/chartConstants.js`)

New constants define the available styling options:

```javascript
export const LINE_WIDTH_OPTIONS = [1, 2, 3, 4];
export const LINE_STYLE_OPTIONS = {
  SOLID: 'solid',
  DASHED: 'dash',
  DOTTED: 'dot'
};
export const LINE_STYLE_LABELS = {
  solid: 'Solid',
  dash: 'Dashed',
  dot: 'Dotted'
};
export const DEFAULT_LINE_WIDTH = 1.5;
export const DEFAULT_LINE_STYLE = 'solid';
export const DEFAULT_FILL_OPACITY = 0.2;
```

#### 2. Indicator Definitions (`app/client/src/app/indicators.js`)

Each indicator definition now includes default styling properties:

```javascript
{
  id: 'sma',
  name: 'Simple Moving Average (SMA)',
  // ... other properties
  defaultLineWidth: 1.5,
  defaultLineStyle: 'solid',
}
```

For indicators with fill areas (Bollinger Bands, Keltner Channel):

```javascript
{
  id: 'bollinger_bands',
  name: 'Bollinger Bands',
  // ... other properties
  defaultLineWidth: 1.5,
  defaultLineStyle: 'solid',
  defaultFillOpacity: 0.2,
}
```

#### 3. Indicator Settings Dialog (`app/client/src/components/IndicatorSettingsDialog.jsx`)

Extended with new UI controls and state management:

**State Variables:**
```javascript
const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
const [lineStyle, setLineStyle] = useState(DEFAULT_LINE_STYLE);
const [fillOpacity, setFillOpacity] = useState(DEFAULT_FILL_OPACITY);
```

**UI Controls:**
- Line thickness button group (1px, 2px, 3px, 4px)
- Line style button group with visual previews (solid, dashed, dotted lines)
- Fill opacity slider with percentage display (0-100%)
- Reset to Default button in footer

**Props Extended:**
- `initialLineWidth`: Initial line width value for edit mode
- `initialLineStyle`: Initial line style value for edit mode
- `initialFillOpacity`: Initial fill opacity value for edit mode

**Callbacks Extended:**
- `onConfirm(params, color, lineWidth, lineStyle, fillOpacity)`: Passes styling properties on confirm
- `onPreviewUpdate(params, color, lineWidth, lineStyle, fillOpacity)`: Includes styling in preview updates

#### 4. Strategy Page State Management (`app/client/src/pages/Strategy.jsx`)

Extended indicator state to include styling properties:

```javascript
const newIndicator = {
  ...indicator,
  instanceId: `${indicator.id}-${Date.now()}`,
  params: params,
  color: color,
  lineWidth: lineWidth,
  lineStyle: lineStyle,
  fillOpacity: fillOpacity,
};
```

Settings dialog state extended:
```javascript
const [settingsDialog, setSettingsDialog] = useState({
  isOpen: false,
  indicator: null,
  isEditMode: false,
  editingInstanceId: null,
  initialParams: null,
  initialColor: null,
  initialLineWidth: null,
  initialLineStyle: null,
  initialFillOpacity: null,
});
```

#### 5. Chart Rendering (`app/client/src/app/chart.js`)

Updated `createOverlayIndicatorTraces` and `createSubchartIndicatorTraces` to apply custom styling:

**Line Styling:**
```javascript
line: {
  color: indicator.color,
  width: indicator.lineWidth ?? DEFAULT_LINE_WIDTH,
  dash: indicator.lineStyle ?? DEFAULT_LINE_STYLE
}
```

**Fill Opacity:**
```javascript
const fillOpacity = indicator.fillOpacity ?? DEFAULT_FILL_OPACITY;
const opacityHex = Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
fillcolor: `${indicator.color}${opacityHex}`
```

**Applied to all indicators:**
- Overlay: SMA, EMA, Bollinger Bands (with fill), Keltner Channel (with fill)
- Subchart: RSI, MACD, Stochastic, CCI, Williams %R, ADX, ATR, OBV

### Data Flow

1. **Adding Indicator:**
   - User drops indicator from library
   - Settings dialog opens with default styling from indicator definition
   - User customizes styling (line width, line style, fill opacity)
   - User clicks "Add Indicator"
   - Indicator instance created with custom styling properties
   - Chart renders indicator with custom styling applied

2. **Editing Indicator:**
   - User clicks indicator badge
   - Settings dialog opens with current styling values
   - User modifies styling
   - Real-time preview updates with debouncing (200ms)
   - User clicks "Apply"
   - Indicator instance updated with new styling
   - Chart re-renders with updated styling

3. **Reset to Default:**
   - User clicks "Reset to Default" button
   - All styling properties (and parameters) reset to indicator defaults
   - Preview updates immediately
   - User can apply or continue editing

## Usage Guide

### Customizing Line Thickness

1. Open indicator settings dialog (drop from library or click badge)
2. Locate "Line Thickness" section
3. Click desired thickness button (1px, 2px, 3px, or 4px)
4. Selected button highlights with primary color
5. Apply changes to see effect on chart

**Best Practices:**
- Use thicker lines (3px-4px) for primary indicators you focus on
- Use thinner lines (1px-2px) for secondary reference indicators
- Bollinger Bands and Keltner Channel use slightly thinner lines for upper/lower bands (0.67x main line width)

### Customizing Line Style

1. Open indicator settings dialog
2. Locate "Line Style" section
3. Click desired style button (Solid, Dashed, or Dotted)
4. Selected button highlights with visual line preview
5. Apply changes to see effect on chart

**Best Practices:**
- Use solid lines for primary indicators
- Use dashed lines for secondary or reference indicators
- Use dotted lines for tertiary indicators or support/resistance levels
- Mix line styles with different colors for maximum visual distinction

### Customizing Fill Opacity

**Only available for:** Bollinger Bands and Keltner Channel

1. Open indicator settings dialog
2. Locate "Fill Opacity" section
3. Drag slider from 0% (invisible) to 100% (opaque)
4. Percentage value updates in real-time
5. Slider shows visual preview of opacity
6. Apply changes to see effect on chart

**Best Practices:**
- Use 10-30% opacity for subtle shaded areas
- Use 30-50% opacity for moderate visibility
- Use 50-100% opacity for strong emphasis
- Use 0% opacity to hide fill entirely (only show band lines)

### Resetting to Defaults

1. Open indicator settings dialog
2. Click "Reset to Default" button
3. All properties reset:
   - Line width → indicator's default (usually 1.5px)
   - Line style → solid
   - Color → indicator's default color
   - Fill opacity → 0.2 (20%) for fill-based indicators
   - Parameters → indicator's default parameters
4. Apply to save reset values or continue editing

### Real-Time Preview with Styling

1. Click existing indicator badge to edit
2. Dialog opens in edit mode
3. Click "Compare Before/After" button
4. Original indicator shows with solid line
5. Preview indicator shows with dashed line (preview style)
6. Make styling changes (thickness, style, opacity)
7. Wait 200ms for debounced update
8. Preview indicator updates with new styling
9. Compare side-by-side before applying

## Styling Configuration Options

### Line Width Options
- **1px**: Very thin, subtle lines
- **2px**: Standard thin lines
- **3px**: Medium thickness, good visibility
- **4px**: Thick lines, high emphasis

### Line Style Options
- **Solid**: Continuous unbroken line (Plotly: `'solid'`)
- **Dashed**: Line with regular gaps (Plotly: `'dash'`)
- **Dotted**: Line with dot pattern (Plotly: `'dot'`)

### Fill Opacity Range
- **0%**: Completely transparent (invisible)
- **25%**: Very subtle shading
- **50%**: Moderate transparency
- **75%**: Mostly opaque
- **100%**: Completely opaque (solid color)

### Default Values
- **Line Width**: 1.5px (balanced visibility)
- **Line Style**: Solid (standard continuous line)
- **Fill Opacity**: 0.2 (20% - subtle shading)

## Persistence

All styling properties persist as part of the indicator instance:

```javascript
{
  id: 'ema',
  instanceId: 'ema-1234567890',
  params: { period: 50 },
  color: '#F97316',
  lineWidth: 3,
  lineStyle: 'dash',
  // fillOpacity only for Bollinger Bands / Keltner Channel
}
```

These properties:
- Persist throughout the session in component state
- Are included when strategies are saved (if save feature exists)
- Are restored when strategies are loaded

## Testing

### E2E Test

Comprehensive end-to-end test validates all styling features:
- `.claude/commands/e2e/test_indicator_color_style.md`

**Test Coverage:**
- Line thickness selection (1px, 2px, 3px, 4px)
- Line style selection (solid, dashed, dotted)
- Fill opacity slider (0%, 50%, 100%)
- Reset to default functionality
- Real-time preview with styling changes
- Comparison mode with styling
- Multiple indicators with distinct styling
- Styling persistence throughout session

### Manual Testing Checklist

- [ ] Add SMA with 3px solid orange line
- [ ] Add EMA with 2px dashed blue line
- [ ] Add second EMA with 1px dotted purple line
- [ ] Add Bollinger Bands with 50% fill opacity, 2px solid gray
- [ ] Verify all indicators visually distinct
- [ ] Edit SMA, change to 4px dotted red, verify preview
- [ ] Reset SMA to defaults, verify returns to default styling
- [ ] Edit Bollinger Bands opacity to 0%, verify fill invisible
- [ ] Edit Bollinger Bands opacity to 100%, verify fill opaque
- [ ] Add Keltner Channel with 30% opacity, 2px dashed cyan
- [ ] Verify all styling persists when editing other indicators
- [ ] Verify comparison mode shows styling differences clearly

## Troubleshooting

### Line Style Not Visible
**Problem:** Dashed or dotted line looks solid
**Solution:** Increase line thickness (2px minimum recommended for dashed/dotted)

### Fill Opacity Not Working
**Problem:** Opacity slider has no effect
**Solution:** Only Bollinger Bands and Keltner Channel support fill opacity

### Preview Styling Interferes with Custom Styling
**Problem:** Preview shows unexpected line style
**Solution:** Preview mode applies dashed lines and reduced opacity on top of custom styling - this is expected behavior to distinguish preview from original

### Styling Reset Unexpectedly
**Problem:** Custom styling lost after editing
**Solution:** Verify "Reset to Default" wasn't clicked accidentally. Styling persists in indicator instance state.

### Thick Lines Obscure Chart
**Problem:** 4px lines too thick, hide price data
**Solution:** Use 4px sparingly for primary indicators only. Use 1-2px for most indicators.

## Performance Considerations

- Styling properties are native Plotly.js features - no performance impact
- Line thickness does not affect calculation performance
- Line style (dash pattern) has minimal rendering overhead
- Fill opacity uses hex alpha channel - efficient rendering
- Real-time preview debouncing (200ms) prevents excessive re-renders

## Limitations

- Line width limited to 1-4px (reasonable range for chart readability)
- Line style limited to solid/dash/dot (most common patterns)
- Fill opacity only for Bollinger Bands and Keltner Channel (only indicators with fill areas)
- No gradient fills or pattern fills (future enhancement)
- No line cap/join customization (native Plotly defaults used)

## Future Enhancements

1. **Styling Presets**: Save and reuse favorite styling combinations
2. **Apply to All**: Apply styling to all indicators of the same type
3. **Advanced Fill Options**: Gradient fills, pattern fills
4. **Line Cap/Join Options**: Customize line endpoints and corners
5. **Shadow/Glow Effects**: Add visual effects for enhanced visibility
6. **Copy Styling**: Copy styling from one indicator to another

## Related Documentation

- `app_docs/feature-38950e42-indicator-settings-customization.md`: Base indicator settings system
- `app_docs/feature-a5444a1e-realtime-parameter-preview.md`: Real-time preview infrastructure
- `.claude/commands/e2e/test_indicator_color_style.md`: E2E test specification

## Dependencies

- **Plotly.js**: Line styling uses native Plotly trace properties (`line.width`, `line.dash`, `fillcolor` alpha)
- **React**: State management for styling controls
- **Existing indicator system**: Builds on indicator instance model
- **Existing preview system**: Extends preview to include styling

## Technical Notes

### Plotly Line Styling

Plotly `dash` property accepts:
- `'solid'`: Continuous line
- `'dot'`: Dotted pattern
- `'dash'`: Dashed pattern
- `'longdash'`, `'dashdot'`, `'longdashdot'`: Additional patterns (not used)

Plotly `line.width` is specified as a number (pixels).

### Fill Opacity Implementation

Fill opacity uses hex alpha channel in color format:
```javascript
const opacityHex = Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
const fillcolor = `${color}${opacityHex}`; // e.g., '#6B728033' for 20% opacity
```

Opacity slider uses 0-1 range internally but displays 0-100% to users.

### Multi-Component Indicators

For indicators with multiple components (MACD, Stochastic, ADX, Bollinger Bands, Keltner Channel):
- Main line uses full custom line width and style
- Secondary lines use 0.67x line width for visual distinction
- All components use the same line style
- Histograms (MACD) do not use line styling (bar type)

## Acceptance Criteria (Completed)

✅ Line thickness options: 1px, 2px, 3px, 4px available in settings dialog
✅ Line thickness selection renders correctly on chart for all indicator types
✅ Line style options: Solid, Dashed, Dotted available in settings dialog
✅ Line style selection renders correctly on chart using Plotly dash property
✅ Opacity slider (0-100%) available for Bollinger Bands and Keltner Channel
✅ Opacity slider correctly controls fill transparency on chart
✅ "Reset to Default" button restores all styling properties to indicator defaults
✅ Changes preview in real-time on chart when editing indicator (debounced)
✅ Custom styles persist when indicator is edited or session continues
✅ Multiple indicators can have distinct styling to aid visual differentiation
✅ All existing indicator functionality remains intact (no regressions)
✅ E2E test validates all styling features work correctly
✅ Build and test suites pass with zero errors
