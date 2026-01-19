# Feature: Indicator Color and Style Customization

## Metadata
issue_number: `60`
adw_id: `534b16b8`
issue_json: `{"number":60,"title":"Feature Indicator Color and Style Customization US-VSB-011","body":"/feature\n\nadw_sdlc_iso\n\nIndicator Color and Style Customization\n\nI want to customize indicator colors, line thickness, and style\nSo that I can distinguish multiple indicators and match my visual preferences\nAcceptance Criteria:\n\n Color picker for each indicator line/fill\n Line thickness options: 1px, 2px, 3px, 4px\n Line style options: Solid, Dashed, Dotted\n Opacity slider for indicator fill areas (0-100%)\n \"Reset to Default\" option restores original styling\n Changes preview in real-time on chart\n Custom styles persist when saving strategy\n"}`

## Feature Description
This feature extends the existing indicator customization system to provide comprehensive visual styling controls for technical indicators. Users will be able to customize not only colors and parameters but also line thickness, line style (solid, dashed, dotted), and fill opacity for indicators rendered on charts. This enables professional traders to create highly customized chart layouts that match their visual preferences and help distinguish between multiple overlapping indicators.

The feature builds upon the existing indicator settings infrastructure (introduced in feature-38950e42) and adds visual styling options to the IndicatorSettingsDialog component. All styling preferences persist with indicator instances and are saved when strategies are saved.

## User Story
As a forex trader
I want to customize indicator colors, line thickness, and style
So that I can distinguish multiple indicators and match my visual preferences

## Problem Statement
Currently, while users can customize indicator parameters and colors through the IndicatorSettingsDialog, they lack control over visual presentation aspects like line thickness, line style (solid/dashed/dotted), and fill opacity. When multiple indicators are displayed on the same chart, especially overlay indicators like moving averages or Bollinger Bands, it becomes difficult to visually distinguish between them without additional styling controls. Professional traders using platforms like TradingView expect granular control over indicator appearance to create personalized, easily readable chart layouts.

## Solution Statement
We will extend the IndicatorSettingsDialog component to include additional styling controls:
1. **Line Thickness Selector**: A button group with options for 1px, 2px, 3px, and 4px line widths
2. **Line Style Selector**: A button group with options for Solid, Dashed, and Dotted line styles
3. **Opacity Slider**: A range slider (0-100%) to control fill opacity for indicators with filled areas (Bollinger Bands, Keltner Channel)
4. **Reset to Default Button**: A button to restore all styling properties to their original default values

The solution leverages the existing indicator instance model where each indicator stores custom `params`, `color`, and now will also store `lineWidth`, `lineStyle`, and `fillOpacity`. The chart rendering code in `chart.js` will be updated to apply these styling properties when creating Plotly traces. The real-time preview system will be extended to show styling changes immediately in the settings dialog.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/components/IndicatorSettingsDialog.jsx` - Add line thickness selector, line style selector, opacity slider, and reset button to the existing settings dialog. Extend state management to handle new styling properties.

- `app/client/src/app/chart.js` - Modify `createOverlayIndicatorTraces` and `createSubchartIndicatorTraces` functions to apply custom line width, line style (dash), and fill opacity from indicator instances. Update trace generation to use `indicator.lineWidth`, `indicator.lineStyle`, and `indicator.fillOpacity`.

- `app/client/src/pages/Strategy.jsx` - Update indicator state management to include new styling properties. Modify the `handleIndicatorDrop` and `handleIndicatorSettingsConfirm` functions to handle lineWidth, lineStyle, and fillOpacity. Update preview update logic to include styling properties.

- `app/client/src/app/indicators.js` - Add default styling properties to each indicator definition: `defaultLineWidth`, `defaultLineStyle`, `defaultFillOpacity`. Update `getIndicatorDisplayName` if needed (likely no changes required).

- `app/client/src/app/chartConstants.js` - Add new constants for styling options: `LINE_WIDTH_OPTIONS`, `LINE_STYLE_OPTIONS`, `DEFAULT_LINE_WIDTH`, `DEFAULT_LINE_STYLE`, `DEFAULT_FILL_OPACITY`.

- `.claude/commands/conditional_docs.md` - Add entry for this feature documentation with conditions for when to read it.

- `app_docs/feature-38950e42-indicator-settings-customization.md` - Reference existing indicator settings system architecture.

- `app_docs/feature-a5444a1e-realtime-parameter-preview.md` - Reference real-time preview system for extending preview to styling changes.

### New Files

- `app_docs/feature-534b16b8-indicator-color-style-customization.md` - Documentation for the indicator styling feature, including usage guide, technical implementation details, styling configuration options, and testing procedures.

- `.claude/commands/e2e/test_indicator_color_style.md` - E2E test specification to validate indicator styling functionality including line thickness, line style, opacity slider, reset to default, real-time preview, and persistence.

## Implementation Plan

### Phase 1: Foundation
1. Define styling constants and default values in `chartConstants.js`
2. Extend indicator definitions in `indicators.js` with default styling properties
3. Study the existing IndicatorSettingsDialog component to understand its structure and state management
4. Study the chart rendering code to understand how Plotly traces are created and styled

### Phase 2: Core Implementation
1. Update the IndicatorSettingsDialog component to add UI controls for line thickness, line style, and opacity
2. Extend indicator instance state management in Strategy.jsx to store and handle styling properties
3. Modify chart rendering functions to apply custom styling properties from indicator instances
4. Extend the real-time preview system to show styling changes immediately

### Phase 3: Integration
1. Add "Reset to Default" functionality to restore original styling
2. Ensure styling properties persist when strategies are saved (verify existing persistence mechanism handles new properties)
3. Test with multiple indicator types (overlay, subchart, multi-component indicators)
4. Create comprehensive E2E test to validate all styling features
5. Document the feature for future developers

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Define Styling Constants
- Read `app/client/src/app/chartConstants.js` to understand existing constants
- Add new constants for line width options: `LINE_WIDTH_OPTIONS = [1, 2, 3, 4]`
- Add new constants for line style options: `LINE_STYLE_OPTIONS = { SOLID: 'solid', DASHED: 'dash', DOTTED: 'dot' }`
- Add default values: `DEFAULT_LINE_WIDTH = 1.5`, `DEFAULT_LINE_STYLE = 'solid'`, `DEFAULT_FILL_OPACITY = 0.2`
- Add line style display labels: `LINE_STYLE_LABELS = { solid: 'Solid', dash: 'Dashed', dot: 'Dotted' }`

### Task 2: Extend Indicator Definitions with Default Styling
- Read `app/client/src/app/indicators.js` to understand indicator structure
- Add `defaultLineWidth`, `defaultLineStyle`, and `defaultFillOpacity` properties to each indicator in the INDICATORS array
- For overlay indicators (SMA, EMA): Use lineWidth 1.5, solid style, no fill opacity needed
- For Bollinger Bands and Keltner Channel: Use lineWidth 1.5 for main line, 1 for bands, solid style, fillOpacity 0.2
- For subchart indicators (RSI, MACD, etc.): Use lineWidth 1.5, solid style, no fill opacity needed
- Write unit tests in `app/client/src/app/indicators.test.js` to validate default styling properties exist on all indicators

### Task 3: Update IndicatorSettingsDialog Component UI
- Read `app/client/src/components/IndicatorSettingsDialog.jsx` to understand current structure
- Import new constants from `chartConstants.js`
- Add state variables: `lineWidth`, `lineStyle`, `fillOpacity` (initialize from indicator defaults or initial values)
- Add "Line Thickness" section with button group UI (1px, 2px, 3px, 4px buttons)
- Add "Line Style" section with button group UI showing line style preview icons (solid line, dashed line, dotted line)
- Add "Fill Opacity" section with range slider (0-100%) - only show for indicators with fill areas (Bollinger Bands, Keltner Channel)
- Add "Reset to Default" button in the footer that restores all styling properties to indicator defaults
- Update the preview section to show a visual representation of the selected styling
- Style buttons to highlight selected option (similar to color picker styling)

### Task 4: Extend IndicatorSettingsDialog State Management
- Update the `useEffect` hook that initializes state to handle new styling properties
- Add `lineWidth`, `lineStyle`, `fillOpacity` to initial state setup (use initialValues in edit mode, or defaults for new indicators)
- Update the `handleSubmit` function to pass styling properties to `onConfirm` callback
- Update debounced preview logic to include styling properties in `onPreviewUpdate` callback
- Add validation for opacity slider (ensure value is between 0 and 100)
- Implement "Reset to Default" handler that resets all parameters and styling to indicator defaults

### Task 5: Update Strategy.jsx Indicator State Management
- Read `app/client/src/pages/Strategy.jsx` to understand indicator state management
- Locate `handleIndicatorSettingsConfirm` function
- Modify it to accept and store styling properties: `lineWidth`, `lineStyle`, `fillOpacity`
- Update the indicator instance creation/update to include styling properties in the indicator object
- Update `handlePreviewUpdate` function to pass styling properties when creating preview indicators
- Ensure styling properties are included in indicator state when adding or editing indicators

### Task 6: Modify Chart Rendering for Line Thickness
- Read `app/client/src/app/chart.js` to understand Plotly trace creation
- Locate `createOverlayIndicatorTraces` function
- Update line configuration to use `indicator.lineWidth || DEFAULT_LINE_WIDTH` instead of hardcoded 1.5
- Locate `createSubchartIndicatorTraces` function
- Update line configuration to use `indicator.lineWidth || DEFAULT_LINE_WIDTH`
- For multi-component indicators (MACD, Stochastic, ADX, Bollinger Bands, Keltner Channel), apply lineWidth to all components
- For Bollinger Bands and Keltner Channel, use slightly thinner lineWidth (lineWidth * 0.67) for upper/lower bands if desired for distinction

### Task 7: Modify Chart Rendering for Line Style
- In `createOverlayIndicatorTraces` function, update line configuration to include `dash: indicator.lineStyle || DEFAULT_LINE_STYLE`
- In `createSubchartIndicatorTraces` function, update line configuration to include `dash: indicator.lineStyle || DEFAULT_LINE_STYLE`
- Test that Plotly correctly renders 'solid', 'dash', and 'dot' line styles
- For Bollinger Bands upper/lower bands and Keltner Channel bands, keep existing 'dot' style or allow customization based on requirements
- Update MACD histogram rendering if line style should apply (likely only to lines, not histogram bars)

### Task 8: Modify Chart Rendering for Fill Opacity
- Locate fill area rendering for Bollinger Bands in `createOverlayIndicatorTraces`
- Update fillcolor to use custom opacity: `${indicator.color}${Math.round((indicator.fillOpacity || DEFAULT_FILL_OPACITY) * 255).toString(16).padStart(2, '0')}`
- Locate fill area rendering for Keltner Channel
- Update fillcolor to use custom opacity with the same approach
- Test that opacity values from 0-100% correctly translate to alpha channel values (0x00 to 0xFF)
- Ensure fill opacity only affects fill areas, not the line strokes

### Task 9: Extend Real-Time Preview for Styling
- Review `app_docs/feature-a5444a1e-realtime-parameter-preview.md` to understand preview system
- Verify that `handlePreviewUpdate` in Strategy.jsx passes styling properties
- Test that debounced styling changes trigger preview updates
- Ensure preview indicators render with new styling in real-time on the chart
- Test that preview visual styling (dashed lines, opacity) still works correctly with custom styling applied

### Task 10: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_indicator_settings.md` as a reference example
- Create `.claude/commands/e2e/test_indicator_color_style.md` with comprehensive test steps:
  - Add indicator and customize line thickness (verify 1px, 2px, 3px, 4px options)
  - Add indicator and customize line style (verify solid, dashed, dotted options)
  - Add Bollinger Bands and customize fill opacity (verify 0%, 50%, 100%)
  - Edit existing indicator styling and verify preview updates in real-time
  - Test "Reset to Default" button restores all styling
  - Add multiple indicators with different styling and verify visual distinction
  - Verify styling persists when saving and loading strategy (if applicable)
- Include 20+ test steps with screenshot capture points
- Define clear success criteria for all styling features

### Task 11: Integration Testing
- Manually test the complete styling workflow:
  - Drop SMA indicator, set line thickness to 3px, dashed style, orange color
  - Drop EMA indicator, set line thickness to 2px, solid style, blue color
  - Drop Bollinger Bands, set line thickness to 2px, dotted style for bands, fill opacity 30%, purple color
  - Verify all indicators render with correct styling on chart
  - Edit one indicator, change styling, verify preview and final render
  - Use "Reset to Default" on one indicator, verify it returns to defaults
- Test with all indicator types: overlay (SMA, EMA, BB, KC) and subchart (RSI, MACD, Stochastic, etc.)
- Test edge cases: opacity at 0% (invisible fill), line thickness at 4px (very thick), dotted style with thick lines

### Task 12: Validate Styling Persistence
- Add multiple indicators with custom styling
- Verify that indicator state includes all styling properties
- If strategy saving is implemented, verify styling properties are saved and restored
- Test that page reload maintains indicator styling (via local storage if used)
- Verify that exported strategy JSON includes styling properties

### Task 13: Write Unit Tests
- Create/update `app/client/src/components/IndicatorSettingsDialog.test.jsx`:
  - Test styling controls render correctly
  - Test line thickness selection updates state
  - Test line style selection updates state
  - Test opacity slider updates state
  - Test "Reset to Default" restores all values
  - Test that styling properties are passed to onConfirm callback
- Create/update `app/client/src/app/chart.test.js`:
  - Test that indicator traces use custom lineWidth property
  - Test that indicator traces use custom lineStyle property
  - Test that fill areas use custom fillOpacity property
  - Test fallback to defaults when styling properties are not set

### Task 14: Create Feature Documentation
- Create `app_docs/feature-534b16b8-indicator-color-style-customization.md`
- Document the feature overview and user story
- Explain technical implementation details:
  - Styling properties stored on indicator instances
  - Chart rendering applies styling via Plotly trace configuration
  - Real-time preview system extended to show styling changes
- Provide usage guide with examples and screenshots
- List styling configuration options and limits
- Add troubleshooting section for common issues
- Include testing instructions and E2E test reference

### Task 15: Update Conditional Documentation
- Read `.claude/commands/conditional_docs.md`
- Add entry for `app_docs/feature-534b16b8-indicator-color-style-customization.md`
- Define conditions:
  - When implementing or modifying indicator styling controls
  - When working with indicator visual customization features
  - When modifying IndicatorSettingsDialog styling sections
  - When working with Plotly line styling properties
  - When troubleshooting indicator rendering or styling issues

### Task 16: Run Full Validation Suite
- Execute all validation commands listed in the "Validation Commands" section below
- Verify zero regressions in existing tests
- Verify E2E test passes completely with all screenshots captured
- Address any test failures or issues discovered
- Confirm that build completes without errors or warnings

## Testing Strategy

### Unit Tests
- **IndicatorSettingsDialog Component**:
  - Verify line thickness selector renders with 4 options
  - Verify line style selector renders with 3 options
  - Verify opacity slider renders and accepts values 0-100
  - Verify "Reset to Default" button restores all styling properties
  - Verify styling properties are included in onConfirm callback
  - Verify state updates correctly when user changes styling options

- **Chart Rendering Functions**:
  - Verify `createOverlayIndicatorTraces` applies custom lineWidth from indicator
  - Verify `createOverlayIndicatorTraces` applies custom lineStyle from indicator
  - Verify fill opacity calculation for Bollinger Bands and Keltner Channel
  - Verify fallback to default values when properties are not set
  - Verify preview indicators render with preview styling plus custom styling

- **Indicator Definitions**:
  - Verify all indicators have defaultLineWidth property
  - Verify all indicators have defaultLineStyle property
  - Verify fill-based indicators have defaultFillOpacity property

### Edge Cases
- **Line Thickness Edge Cases**:
  - Minimum thickness (1px) - ensure lines are visible
  - Maximum thickness (4px) - ensure lines don't obscure chart data
  - Multiple overlapping thick lines - verify visual clarity

- **Line Style Edge Cases**:
  - Dotted style with thick lines (4px) - verify dots are visible and not just a thick line
  - Dashed style with thin lines (1px) - verify dashes are visible
  - Multiple indicators with same color but different line styles - verify distinguishability

- **Opacity Edge Cases**:
  - 0% opacity - fill should be invisible
  - 100% opacity - fill should be completely opaque
  - Multiple overlapping fills with different opacities - verify visual layering

- **Reset to Default Edge Cases**:
  - Reset after changing only styling (not parameters) - verify parameters stay, styling resets
  - Reset in edit mode with preview active - verify preview updates correctly
  - Reset with comparison mode enabled - verify both indicators show default styling

- **Persistence Edge Cases**:
  - Add indicator, customize styling, refresh page - verify styling persists (if applicable)
  - Edit indicator styling, save strategy, reload - verify styling restored (if save feature exists)

## Acceptance Criteria
- Color picker for each indicator line/fill (EXISTING FEATURE - verify still works)
- Line thickness options: 1px, 2px, 3px, 4px available in settings dialog
- Line thickness selection renders correctly on chart for all indicator types
- Line style options: Solid, Dashed, Dotted available in settings dialog
- Line style selection renders correctly on chart using Plotly dash property
- Opacity slider for indicator fill areas (0-100%) available for Bollinger Bands and Keltner Channel
- Opacity slider correctly controls fill transparency on chart
- "Reset to Default" button restores all styling properties (color, lineWidth, lineStyle, fillOpacity) to indicator defaults
- Changes preview in real-time on chart when editing indicator (debounced)
- Custom styles persist when saving strategy (if strategy save feature exists)
- Multiple indicators can have distinct styling to aid visual differentiation
- All existing indicator functionality remains intact (no regressions)
- E2E test validates all styling features work correctly
- Build and test suites pass with zero errors

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute the new E2E test file `.claude/commands/e2e/test_indicator_color_style.md` to validate indicator styling functionality works end-to-end with visual confirmation via screenshots

## Notes

### Design Considerations
- Line thickness options (1px, 2px, 3px, 4px) align with professional charting platforms and provide sufficient visual distinction without being excessive
- Line style options (solid, dashed, dotted) match Plotly's supported dash values and are standard across charting libraries
- Opacity slider range (0-100%) provides intuitive percentage-based control and maps cleanly to hex alpha values (0x00-0xFF)
- "Reset to Default" is valuable for users who experiment with styling and want to quickly return to optimal defaults

### Technical Notes
- Plotly dash property accepts: 'solid', 'dot', 'dash', 'longdash', 'dashdot', 'longdashdot' - we use the three most common
- Plotly line width is specified as a number (pixels)
- Fill opacity in Plotly is specified via alpha channel in hex color format: `#RRGGBBAA`
- The existing color picker already provides 12 predefined colors; this feature adds styling dimensions
- The existing real-time preview system with debouncing (200ms) will work seamlessly with styling properties
- Chart performance should not be significantly impacted by styling options as they are native Plotly properties

### Future Enhancements
- Save styling presets for quick reuse ("My Blue Thick Dashed Style")
- Apply styling to all indicators of the same type at once
- Advanced fill options: gradient fills, pattern fills
- Line cap and join options for aesthetic control
- Shadow or glow effects for enhanced visibility

### Dependencies
- This feature builds directly on `feature-38950e42-indicator-settings-customization.md` which introduced the IndicatorSettingsDialog
- This feature extends `feature-a5444a1e-realtime-parameter-preview.md` which provides the real-time preview infrastructure
- No new external libraries required - all styling is native Plotly.js functionality
