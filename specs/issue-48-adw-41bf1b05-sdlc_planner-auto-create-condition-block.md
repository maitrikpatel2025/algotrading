# Feature: Auto-Create Condition Block on Indicator Drop

## Metadata
issue_number: `48`
adw_id: `41bf1b05`
issue_json: `{"number":48,"title":"Feature Auto-Create Condition Block on Indicator Drop US-VSB-007","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\n-----\n\n**I want** a corresponding condition block to automatically appear in the logic panel when I drop an indicator on the chart  \n**So that** I can immediately start defining trading rules using that indicator with its specific configuration\n\n-----\n\n### Acceptance Criteria\n\n#### 1. Auto-Creation of Condition Block\n\n- [ ] Dropping any indicator on the chart automatically creates a linked condition block in the logic panel\n- [ ] Condition block appears in the \"Entry Conditions\" section by default (user can drag to \"Exit Conditions\" later)\n- [ ] Condition block creation is instantaneous (< 200ms after drop)\n- [ ] Animation shows the block \"flying\" from chart to logic panel for visual feedback\n\n#### 2. Indicator Instance Identification & Selection\n\n- [ ] Each dropped indicator is assigned a unique instance identifier based on its parameters\n- [ ] Condition block displays the **specific indicator instance** with its parameters, not just the indicator type\n- [ ] User can reference ANY indicator instance currently on the chart in condition dropdowns\n\n**Examples of Indicator Instance Naming:**\n\n|Indicator Type |Parameters                   |Display Name in Condition Block|\n|---------------|-----------------------------|-------------------------------|\n|EMA            |Period: 5                    |`EMA (5)`                      |\n|EMA            |Period: 50                   |`EMA (50)`                     |\n|EMA            |Period: 100                  |`EMA (100)`                    |\n|EMA            |Period: 200                  |`EMA (200)`                    |\n|SMA            |Period: 20                   |`SMA (20)`                     |\n|SMA            |Period: 50                   |`SMA (50)`                     |\n|RSI            |Period: 14                   |`RSI (14)`                     |\n|RSI            |Period: 7                    |`RSI (7)`                      |\n|Bollinger Bands|Period: 20, StdDev: 2.0      |`BB (20, 2.0)`                 |\n|Bollinger Bands|Period: 50, StdDev: 2.5      |`BB (50, 2.5)`                 |\n|MACD           |Fast: 12, Slow: 26, Signal: 9|`MACD (12, 26, 9)`             |\n|Stochastic     |K: 14, D: 3, Smooth: 3       |`Stoch (14, 3, 3)`             |\n|ATR            |Period: 14                   |`ATR (14)`                     |\n|ATR            |Period: 20                   |`ATR (20)`                     |\n\n..."}`

## Feature Description
This feature automatically creates a condition block in a new Logic Panel whenever a user drops an indicator onto the chart. The condition block is pre-populated with a default trading condition based on the indicator type, allowing traders to immediately start defining trading rules without manual setup.

The system tracks indicator instances with unique identifiers based on their parameters (e.g., "EMA (50)" vs "EMA (200)"), enabling traders to create sophisticated multi-indicator strategies like Golden Cross conditions. Visual connections between chart indicators and their corresponding condition blocks provide clear feedback, while synchronized deletion and parameter updates maintain consistency.

## User Story
As a forex trader
I want a corresponding condition block to automatically appear in the logic panel when I drop an indicator on the chart
So that I can immediately start defining trading rules using that indicator with its specific configuration

## Problem Statement
Currently, when traders add indicators to the chart, they must manually create condition blocks in a separate workflow. This breaks the user's flow and makes it cumbersome to quickly set up trading strategies. Traders want a seamless experience where dropping an indicator instantly gives them a starting point for defining entry/exit rules.

## Solution Statement
Implement an integrated Logic Panel as a right sidebar on the Strategy page that automatically creates condition blocks when indicators are dropped on the chart. Each condition block is pre-populated with a sensible default condition based on the indicator type (e.g., "Close Price crosses above EMA (50)"). The system supports multiple instances of the same indicator type with different parameters, visual connections between chart and logic panel, and synchronized updates when indicators are modified or removed.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/pages/Strategy.jsx` - Main Strategy page component that will orchestrate the indicator-condition relationship and contain the Logic Panel. Currently manages indicator state with `activeIndicators`, `indicatorHistory`, and handles `onIndicatorDrop`.
- `app/client/src/app/indicators.js` - Indicator definitions with `type`, `defaultParams`, and `color` fields. Will need to add `defaultConditionTemplate` for each indicator type.
- `app/client/src/components/PriceChart.jsx` - Price chart component with drag-drop handling. Will need hover event support for visual connections.
- `app/client/src/components/IndicatorLibrary.jsx` - Indicator library sidebar with drag functionality. No changes needed but serves as reference for existing patterns.
- `app/client/src/app/chart.js` - Chart rendering logic. Will need hover highlight functionality for visual connections.
- `ai_docs/ui_style_guide.md` - UI style guide for consistent styling of new components.
- `.claude/commands/test_e2e.md` - E2E test runner documentation for creating the E2E test.
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test for reference patterns.
- `.claude/commands/e2e/test_drag_indicator_onto_chart.md` - Related E2E test for drag-drop indicators (reference for extending tests).

### New Files
- `app/client/src/components/LogicPanel.jsx` - New Logic Panel component (right sidebar) containing entry/exit condition sections.
- `app/client/src/components/ConditionBlock.jsx` - New Condition Block component for individual conditions with dropdowns and visual styling.
- `app/client/src/components/ConditionDropdown.jsx` - Reusable dropdown component for selecting indicator instances and comparison operators.
- `app/client/src/app/conditionDefaults.js` - Default condition templates by indicator type.
- `.claude/commands/e2e/test_auto_condition_block.md` - E2E test specification for this feature.

## Implementation Plan
### Phase 1: Foundation
1. Add default condition templates to indicator definitions
2. Create the condition data model and state management in Strategy.jsx
3. Create the LogicPanel component skeleton with Entry/Exit sections
4. Create the ConditionBlock component with basic structure

### Phase 2: Core Implementation
1. Implement auto-creation of condition blocks when indicators are dropped
2. Implement indicator instance naming with parameters
3. Implement condition dropdowns with indicator instance selection
4. Implement default condition pre-population by indicator type
5. Add indicator sub-components for multi-line indicators (Bollinger Bands, MACD, Stochastic)

### Phase 3: Integration
1. Implement visual connection between chart and logic panel (hover highlights)
2. Implement synchronized deletion with confirmation dialogs
3. Implement parameter sync when indicator settings change
4. Add animation for condition block creation ("fly-in" effect)
5. Create E2E test specification

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Task 1: Create E2E Test Specification
- Create `.claude/commands/e2e/test_auto_condition_block.md` E2E test file
- Define test steps for:
  - Verifying Logic Panel appears on Strategy page
  - Dropping indicator creates condition block
  - Condition block shows correct indicator instance name
  - Default condition is pre-populated correctly
  - Multiple instances of same indicator work correctly
  - Condition dropdowns show all chart indicators
  - Hover highlights work between chart and logic panel
  - Deletion confirmation dialogs work correctly
- Reference existing E2E tests for format consistency

### Task 2: Add Default Condition Templates to Indicator Definitions
- Modify `app/client/src/app/indicators.js`:
  - Add `defaultConditionTemplate` object to each indicator
  - Add `components` array for multi-line indicators (e.g., Bollinger Bands: upper, middle, lower)
  - Add `displayName(params)` function generator for each indicator
- Create `app/client/src/app/conditionDefaults.js`:
  - Define comparison operators: `crosses above`, `crosses below`, `is above`, `is below`, `equals`
  - Define price sources: `Close Price`, `Open Price`, `High Price`, `Low Price`
  - Export condition template lookup function

### Task 3: Create Condition Data Model and State Management
- Modify `app/client/src/pages/Strategy.jsx`:
  - Add `conditions` state array: `[{ id, indicatorInstanceId, leftOperand, operator, rightOperand, section }]`
  - Add `conditionHistory` for undo support
  - Update `handleIndicatorDrop` to also create a condition block
  - Add `handleConditionUpdate` function
  - Add `handleConditionDelete` function with confirmation
  - Add `handleIndicatorHover` and `handleConditionHover` for visual connections
  - Add `highlightedIndicatorId` and `highlightedConditionId` state

### Task 4: Create LogicPanel Component
- Create `app/client/src/components/LogicPanel.jsx`:
  - Collapsible right sidebar (mirror design of IndicatorLibrary)
  - Two sections: "Entry Conditions" (default) and "Exit Conditions"
  - Drag-drop support for moving conditions between sections
  - Empty state when no conditions exist
  - Responsive design with mobile overlay support
  - Follow UI style guide for colors, typography, and spacing

### Task 5: Create ConditionBlock Component
- Create `app/client/src/components/ConditionBlock.jsx`:
  - Display indicator instance name with colored left border matching indicator color
  - Three dropdowns: left operand, operator, right operand
  - X button to delete condition (with confirmation)
  - Hover state that triggers chart indicator highlight
  - Animation support for "fly-in" effect on creation
  - Warning icon for invalid conditions (insufficient data)
  - Follow UI style guide for card styling

### Task 6: Create ConditionDropdown Component
- Create `app/client/src/components/ConditionDropdown.jsx`:
  - Searchable dropdown with grouped options
  - Groups: Price Sources, Indicators (by type), Numeric Values
  - Indicator options show color indicator matching chart
  - Support for numeric input for threshold values
  - Follow existing Select component patterns

### Task 7: Integrate LogicPanel into Strategy Page
- Modify `app/client/src/pages/Strategy.jsx`:
  - Add LogicPanel as right sidebar alongside main content
  - Pass conditions, activeIndicators, and handlers as props
  - Add responsive layout adjustments for three-panel layout
  - Add mobile toggle button for Logic Panel
  - Ensure proper z-index stacking for mobile overlays

### Task 8: Implement Auto-Creation on Indicator Drop
- Modify `app/client/src/pages/Strategy.jsx`:
  - Enhance `handleIndicatorDrop` to:
    - Generate unique instance display name: `{shortName} ({param1}, {param2}, ...)`
    - Create condition with default template for indicator type
    - Animate condition block appearance
    - Scroll Logic Panel to show new condition
  - Support indicator instance numbering for duplicates: "EMA (50) #2"

### Task 9: Implement Indicator Sub-Components
- Modify `app/client/src/app/indicators.js`:
  - Add `components` array to multi-line indicators:
    - Bollinger Bands: `['BB Upper', 'BB Middle', 'BB Lower', 'BB Width', 'BB %B']`
    - MACD: `['MACD Line', 'MACD Signal', 'MACD Histogram']`
    - Stochastic: `['Stoch %K', 'Stoch %D']`
    - ADX: `['ADX', '+DI', '-DI']`
    - Keltner Channel: `['KC Upper', 'KC Middle', 'KC Lower']`
- Update ConditionDropdown to show sub-components

### Task 10: Implement Visual Connections (Hover Highlights)
- Modify `app/client/src/components/PriceChart.jsx`:
  - Add `highlightedIndicatorId` prop
  - Pass highlight state to chart rendering
- Modify `app/client/src/app/chart.js`:
  - Add highlight styling for indicator traces when highlighted
  - Increase line width and add glow effect on highlight
- Modify `app/client/src/components/ConditionBlock.jsx`:
  - Add `onMouseEnter` / `onMouseLeave` handlers
  - Highlight border when corresponding indicator is hovered on chart

### Task 11: Implement Synchronized Deletion
- Modify `app/client/src/pages/Strategy.jsx`:
  - Update `handleRemoveIndicator` to:
    - Find all conditions using this indicator
    - Show confirmation dialog with condition count
    - Offer "Remove indicator only" vs "Remove indicator and conditions"
  - Update `handleConditionDelete` to:
    - Show confirmation: "Remove this condition? The indicator will remain on the chart."
    - Remove only the condition, keep indicator
- Create confirmation dialog component or use existing modal pattern

### Task 12: Implement Parameter Sync
- Modify `app/client/src/pages/Strategy.jsx`:
  - Add `handleIndicatorParamChange(instanceId, newParams)` function
  - Update condition display names when parameters change
  - Show warning if parameter change invalidates a condition
- Note: This requires indicator parameter editing UI which may be future work; implement the sync mechanism now

### Task 13: Add Animation for Condition Block Creation
- Modify `app/client/src/components/ConditionBlock.jsx`:
  - Add CSS animation for "fly-in" effect from chart area
  - Use Tailwind `animate-` classes or custom keyframes
  - Animation duration < 200ms for snappy feel
- Add animation trigger when condition is newly created

### Task 14: Final Integration and Polish
- Ensure all components follow UI style guide
- Add localStorage persistence for Logic Panel collapsed state
- Add aria-labels and keyboard navigation for accessibility
- Test responsive behavior on mobile, tablet, desktop
- Verify Ctrl+Z undo works for both indicators and conditions

### Task 15: Run Validation Commands
- Execute all validation commands to ensure zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_auto_condition_block.md`

## Testing Strategy
### Unit Tests
- Test condition creation from indicator drop
- Test indicator instance naming logic
- Test default condition template lookup
- Test condition state management (add, update, delete)
- Test parameter sync updates condition display names
- Test deletion cascade logic

### Edge Cases
- User drops same indicator with same parameters twice (should show warning, create "EMA (50) #2")
- User deletes indicator used in 5 conditions (confirmation lists all conditions)
- User changes EMA (50) to EMA (50) (no change - no action taken)
- Indicator calculation fails (condition block shows warning icon)
- User tries to compare incompatible indicators (error: "Cannot compare RSI (percentage) with EMA (price level)")
- User adds 6th overlay indicator (error message, no new condition created)
- User presses Ctrl+Z repeatedly (undo stack works correctly)

## Acceptance Criteria
1. Dropping any indicator on the chart automatically creates a linked condition block in the logic panel
2. Condition block appears in the "Entry Conditions" section by default
3. Condition block creation is instantaneous (< 200ms after drop)
4. Animation shows the block "flying" from chart to logic panel for visual feedback
5. Each dropped indicator is assigned a unique instance identifier based on its parameters
6. Condition block displays the specific indicator instance with its parameters
7. User can reference ANY indicator instance currently on the chart in condition dropdowns
8. User CAN add multiple instances of the same indicator with different parameters
9. Each instance appears as a separate selectable option in condition dropdowns
10. Condition block pre-populates with the most common/logical condition for that indicator type
11. For multi-line indicators, user can select specific components in conditions
12. Hovering over condition block highlights the corresponding indicator on the chart
13. Hovering over indicator on chart highlights the corresponding condition block(s)
14. Color coding matches between chart indicator and condition block border/accent
15. Deleting indicator from chart triggers confirmation with condition count
16. Deleting condition block triggers confirmation (indicator remains on chart)
17. If user changes indicator parameters on chart, condition block updates automatically
18. User can create conditions comparing two indicators (cross-indicator conditions)

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_auto_condition_block.md` - Validate the new feature E2E
- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions

## Notes
- This feature is frontend-only; no backend changes required
- Condition evaluation and actual trading execution are out of scope for this feature
- The Logic Panel design mirrors the Indicator Library panel for visual consistency
- Indicator parameter editing UI may be implemented in a future feature; this feature implements the sync mechanism
- Consider future enhancement: persist conditions to localStorage or backend
- Consider future enhancement: import/export condition configurations
- Consider future enhancement: condition templates (saved strategies)
