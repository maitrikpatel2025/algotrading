# Feature: View Logic Builder Panel

## Metadata
issue_number: `64`
adw_id: `a73d36d3`
issue_json: `{"number":64,"title":"Feature View Logic Builder Panel US-VSB-013","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nView Logic Builder Panel \n\nI want to see a dedicated logic panel for defining entry and exit conditions\nSo that I can construct the trading rules for my strategy\nAcceptance Criteria:\n\n Right panel displays sections based on trade direction setting \n For \"Long Only\": \"Long Entry Conditions\" and \"Long Exit Conditions\"\n For \"Short Only\": \"Short Entry Conditions\" and \"Short Exit Conditions\"\n For \"Both\": All four sections (Long Entry, Long Exit, Short Entry, Short Exit)\n Each section has \"Add Condition\" button\n Empty state shows instructional text: \"Drag indicators to chart or click Add Condition\"\n Panel is resizable (drag border)\n Panel can be collapsed/expanded\n Visual distinction: Long sections (green header), Short sections (red header)"}`

## Feature Description
This feature enhances the existing Logic Panel to provide a dedicated four-section logic builder for defining comprehensive entry and exit conditions for both long and short trading strategies. The panel will dynamically display sections based on the selected trade direction, providing visual distinction between long (green) and short (red) condition sections. The panel will also be resizable via a draggable border and maintain its collapse/expand functionality.

## User Story
As a forex trader
I want to see a dedicated logic panel for defining entry and exit conditions
So that I can construct the trading rules for my strategy with clear separation between long and short positions

## Problem Statement
The current Logic Panel has only two sections (Entry Conditions and Exit Conditions), which doesn't provide enough granularity for traders who want to define different conditions for long vs short trades. When "Both" trade direction is selected, traders need to be able to specify:
- When to enter a long position (Long Entry)
- When to exit a long position (Long Exit)
- When to enter a short position (Short Entry)
- When to exit a short position (Short Exit)

Additionally, the panel lacks an "Add Condition" button for manual condition creation and doesn't support resizing.

## Solution Statement
Enhance the LogicPanel component to support four condition sections (Long Entry, Long Exit, Short Entry, Short Exit) that are dynamically displayed based on the trade direction setting. Add visual distinction with green headers for long sections and red headers for short sections. Implement a draggable resize handle on the left border of the panel for width adjustment, and add "Add Condition" buttons to each section. Update the empty state instructional text to guide users on how to add conditions.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/components/LogicPanel.jsx` - Main component to enhance with four sections, resize functionality, and Add Condition buttons
- `app/client/src/pages/Strategy.jsx` - Parent component managing Logic Panel state, needs updates for new section handling and resize state
- `app/client/src/app/constants.js` - Add new constants for condition section types (LONG_ENTRY, LONG_EXIT, SHORT_ENTRY, SHORT_EXIT)
- `app/client/src/app/conditionDefaults.js` - Update CONDITION_SECTIONS and createConditionFromIndicator/createConditionFromPattern functions for new sections
- `app/client/src/components/ConditionBlock.jsx` - May need updates for section-specific styling
- `app/client/src/components/TradeDirectionSelector.jsx` - Reference for trade direction integration
- `app/client/src/index.css` - Add resize handle styles if needed
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test format

### New Files
- `.claude/commands/e2e/test_logic_builder_panel.md` - E2E test specification for this feature

## Implementation Plan

### Phase 1: Foundation
1. Update constants and condition defaults to support four section types
2. Add resize state management and localStorage persistence for panel width
3. Define the section visibility logic based on trade direction

### Phase 2: Core Implementation
1. Refactor LogicPanel to render four sections conditionally
2. Implement section headers with proper color coding (green for long, red for short)
3. Add "Add Condition" buttons to each section
4. Implement draggable resize handle on the left border
5. Update empty state text: "Drag indicators to chart or click Add Condition"

### Phase 3: Integration
1. Update Strategy.jsx to handle new section types when creating conditions
2. Update condition move logic for four sections
3. Ensure trade direction filtering works correctly with four sections
4. Test drag-and-drop between all sections

## Step by Step Tasks

### Task 1: Create E2E Test Specification
- Create `.claude/commands/e2e/test_logic_builder_panel.md` following the format of existing E2E tests
- Define test steps for all acceptance criteria:
  - Section visibility based on trade direction
  - Visual distinction (green/red headers)
  - Add Condition buttons
  - Resize functionality
  - Collapse/expand functionality
  - Empty state instructional text

### Task 2: Update Constants and Condition Defaults
- In `app/client/src/app/constants.js`:
  - Add CONDITION_SECTIONS_V2 with LONG_ENTRY, LONG_EXIT, SHORT_ENTRY, SHORT_EXIT
  - Add section labels and colors for visual distinction
  - Add localStorage key for panel width
- In `app/client/src/app/conditionDefaults.js`:
  - Update CONDITION_SECTIONS to include all four section types
  - Update createConditionFromIndicator to accept section parameter
  - Update createConditionFromPattern to accept section parameter
  - Add helper functions for section type validation

### Task 3: Implement Resizable Panel Logic
- In `app/client/src/components/LogicPanel.jsx`:
  - Add state for panel width (default: 288px / w-72)
  - Add resize handle element on the left border
  - Implement mouse drag handlers for resize
  - Persist panel width to localStorage
  - Add minimum (200px) and maximum (480px) width constraints
  - Style the resize handle (cursor: ew-resize, visible on hover)

### Task 4: Implement Four-Section Layout
- In `app/client/src/components/LogicPanel.jsx`:
  - Refactor to render four sections: Long Entry, Long Exit, Short Entry, Short Exit
  - Add section visibility logic based on tradeDirection prop:
    - 'long': Show Long Entry, Long Exit
    - 'short': Show Short Entry, Short Exit
    - 'both': Show all four sections
  - Style long sections with green headers (bg-green-500/10 or bg-success/10)
  - Style short sections with red headers (bg-red-500/10 or bg-destructive/10)
  - Use appropriate icons: LogIn for entry, LogOut for exit
  - Add "Long" or "Short" prefix to section titles

### Task 5: Add "Add Condition" Buttons
- In `app/client/src/components/LogicPanel.jsx`:
  - Add a new onAddCondition callback prop
  - Add "Add Condition" button to each section (below condition list)
  - Style button with Plus icon, subtle appearance
  - Button should trigger onAddCondition with the section type
- In `app/client/src/pages/Strategy.jsx`:
  - Add handleAddCondition callback
  - Open a dialog or create a placeholder condition in the specified section

### Task 6: Update Empty State Text
- In `app/client/src/components/LogicPanel.jsx`:
  - Update empty state text from "No entry/exit conditions" to "Drag indicators to chart or click Add Condition"
  - Ensure the text fits nicely in the section layout

### Task 7: Update Strategy Page Integration
- In `app/client/src/pages/Strategy.jsx`:
  - Update handlePatternDrop and handleSettingsConfirm to use new section types:
    - 'long' direction: default to 'long_entry'
    - 'short' direction: default to 'short_entry'
    - 'both' direction: allow user to choose or default to 'long_entry'
  - Update handleConditionMove for four sections
  - Update handleTradeDirectionChange confirmation logic:
    - When switching to 'long': warn about short conditions
    - When switching to 'short': warn about long conditions
  - Pass handleAddCondition to LogicPanel

### Task 8: Update Drag-and-Drop Between Sections
- In `app/client/src/components/LogicPanel.jsx`:
  - Update drag over and drop handlers for four sections
  - Ensure visual feedback (highlight) works for all sections
  - Allow dragging conditions between any sections

### Task 9: Add CSS Styles for Resize Handle
- In `app/client/src/index.css`:
  - Add .resize-handle class with appropriate cursor
  - Add hover/active states for visual feedback
  - Ensure resize works smoothly without text selection issues

### Task 10: Run Validation Commands
- Run `cd app/server && uv run pytest` to verify server tests pass
- Run `cd app/client && npm run build` to verify frontend builds without errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_logic_builder_panel.md` to validate this functionality works

## Testing Strategy

### Unit Tests
- Test section visibility logic with different trade direction values
- Test resize constraints (min/max width)
- Test localStorage persistence for panel width
- Test condition creation with new section types

### Edge Cases
- Switching trade direction when conditions exist in sections that will be hidden
- Resizing panel to minimum/maximum width
- Panel state persistence across page reloads
- Mobile view where resize may not be applicable
- Dragging conditions between entry and exit sections of different directions

## Acceptance Criteria
- [ ] Right panel displays sections based on trade direction setting
- [ ] For "Long Only": "Long Entry Conditions" and "Long Exit Conditions" sections visible
- [ ] For "Short Only": "Short Entry Conditions" and "Short Exit Conditions" sections visible
- [ ] For "Both": All four sections (Long Entry, Long Exit, Short Entry, Short Exit) visible
- [ ] Each section has "Add Condition" button
- [ ] Empty state shows instructional text: "Drag indicators to chart or click Add Condition"
- [ ] Panel is resizable via draggable left border
- [ ] Panel can be collapsed/expanded (existing functionality preserved)
- [ ] Visual distinction: Long sections have green header, Short sections have red header
- [ ] Panel width persists across page reloads
- [ ] Drag-and-drop works between all four sections
- [ ] Confirmation dialog appears when switching directions would remove conditions

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_logic_builder_panel.md` to validate this functionality works

## Notes

### Migration Considerations
- Existing conditions with 'entry' or 'exit' sections need to be migrated to 'long_entry', 'long_exit', etc.
- Consider backward compatibility: if section is 'entry', treat as 'long_entry'; if 'exit', treat as 'long_exit'
- localStorage may have old condition data that needs graceful handling

### Future Enhancements
- Condition templates for quick creation via Add Condition button
- Drag indicators directly to specific sections
- Section-specific indicator type restrictions
- Copy/paste conditions between sections
- Condition grouping with AND/OR logic

### Technical Considerations
- Panel resize should use CSS resize or custom drag implementation with requestAnimationFrame for smooth performance
- Consider using CSS custom properties for section colors to maintain theme consistency
- Mobile view should hide resize handle and use fixed width
- The resize handle should be 4-6px wide with a clear visual indicator
