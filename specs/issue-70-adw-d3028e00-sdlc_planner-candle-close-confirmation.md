# Feature: Candle Close Confirmation

## Metadata
issue_number: `70`
adw_id: `d3028e00`
issue_json: `{"number":70,"title":"Feature Configure Candle Close Confirmation US-VSB-016","body":"/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n Configure Candle Close Confirmation\n\nI want to choose whether signals trigger immediately or wait for candle close\nSo that I can control signal reliability vs. entry speed based on my strategy style\nAcceptance Criteria:\n\n Setting in strategy configuration: \"Confirm signals on candle close: Yes/No\"\n Default: Yes (wait for candle close) - safer for most strategies\n When Yes: conditions only evaluate as true after candle closes\n When No: conditions evaluate in real-time on each tick\n Tooltip explains trade-off: \"Waiting for candle close reduces false signals but may delay entries\"\n Setting applies to all entry conditions (exit conditions always evaluate real-time for safety)\n Visual indicator in strategy summary shows confirmation setting"}`

## Feature Description
This feature adds a configurable setting that allows traders to choose whether their entry signals should trigger immediately on real-time price data (each tick) or wait for the candle to close before evaluating conditions. This is a critical trading configuration that impacts signal reliability versus entry speed:

- **Candle Close Confirmation (Yes)**: Conditions only evaluate as true after the candle closes. This reduces false signals from temporary price spikes during candle formation but may delay entries.
- **Real-time Evaluation (No)**: Conditions evaluate on each tick as prices update. This provides faster entries but may result in more false signals due to intra-candle price volatility.

The setting applies only to entry conditions (Long Entry, Short Entry) - exit conditions always evaluate in real-time for safety, ensuring positions can be closed quickly when exit conditions are met.

## User Story
As a forex trader
I want to choose whether signals trigger immediately or wait for candle close
So that I can control signal reliability vs. entry speed based on my strategy style

## Problem Statement
Traders currently have no control over when their entry conditions are evaluated. Some trading styles require quick entries on real-time price movements, while others benefit from waiting for candle close to confirm signals and reduce false positives. Without this setting, traders cannot optimize their strategy for their specific trading approach.

## Solution Statement
Add a "Confirm signals on candle close" Yes/No toggle to the Strategy page Controls Card. The setting will:
1. Default to "Yes" (safer for most strategies)
2. Persist to localStorage for session continuity
3. Display a tooltip explaining the trade-off between signal reliability and entry speed
4. Show a visual indicator in the strategy summary area
5. Apply only to entry conditions (exit conditions remain real-time for safety)

## Relevant Files
Use these files to implement the feature:

- `app/client/src/app/constants.js` - Add new constants for candle close confirmation (storage key, labels, descriptions)
- `app/client/src/pages/Strategy.jsx` - Add state management for the candle close setting, integrate the toggle component, update strategy summary display
- `app/client/src/components/TradeDirectionSelector.jsx` - Reference for UI toggle pattern with tooltips
- `app/client/src/components/LogicPanel.jsx` - Reference for localStorage persistence pattern
- `app/client/src/app/conditionDefaults.js` - Reference for condition evaluation logic (future integration point)
- `.claude/commands/test_e2e.md` - Reference for E2E test runner instructions
- `.claude/commands/e2e/test_trade_direction.md` - Reference for E2E test format with similar feature scope

### New Files

- `app/client/src/components/CandleCloseToggle.jsx` - New component for the Yes/No toggle with tooltip
- `.claude/commands/e2e/test_candle_close_confirmation.md` - E2E test specification for this feature

## Implementation Plan

### Phase 1: Foundation
1. Add constants for candle close confirmation setting in `constants.js`
2. Create the `CandleCloseToggle` component with tooltip functionality
3. Define localStorage key and default value patterns

### Phase 2: Core Implementation
1. Integrate the toggle component into the Strategy page Controls Card
2. Add state management with localStorage persistence in Strategy.jsx
3. Update the strategy summary section to display the current confirmation setting

### Phase 3: Integration
1. Connect the setting to the condition system (prepare for future condition evaluation logic)
2. Ensure the setting works alongside trade direction and other strategy settings
3. Create comprehensive E2E tests

## Step by Step Tasks

### Step 1: Add Constants for Candle Close Confirmation
- Read `app/client/src/app/constants.js` to understand existing patterns
- Add `CANDLE_CLOSE_CONFIRMATION` object with `YES` and `NO` values
- Add `CANDLE_CLOSE_CONFIRMATION_LABELS` for display text ("Yes - Wait for candle close" / "No - Real-time")
- Add `CANDLE_CLOSE_CONFIRMATION_STORAGE_KEY` for localStorage persistence
- Add `CANDLE_CLOSE_CONFIRMATION_DEFAULT` set to `YES`
- Add `CANDLE_CLOSE_CONFIRMATION_TOOLTIP` with the explanation text

### Step 2: Create CandleCloseToggle Component
- Create new file `app/client/src/components/CandleCloseToggle.jsx`
- Follow the pattern from `TradeDirectionSelector.jsx` for toggle button styling
- Implement two buttons: "Yes" and "No" with appropriate icons (clock icon for Yes, zap icon for No)
- Add tooltip using the standard `title` attribute pattern for accessibility
- Include `aria-label` and `aria-pressed` for accessibility
- Style the active state (primary color for Yes, muted for No)
- Accept `value` and `onChange` props for controlled component pattern
- Add a label "Confirm on Candle Close" above the toggle

### Step 3: Integrate Toggle into Strategy Page
- Read `app/client/src/pages/Strategy.jsx` to understand state management patterns
- Import `CandleCloseToggle` component and new constants
- Add state for `confirmOnCandleClose` initialized from localStorage with fallback to default (YES)
- Add `handleCandleCloseChange` callback to update state and persist to localStorage
- Place the toggle in the Controls Card section, after the TradeDirectionSelector
- Ensure proper responsive layout with flex-wrap

### Step 4: Update Strategy Summary Display
- Locate the "Selected Info Badge" section in Strategy.jsx (around line 971)
- Add a visual indicator showing the current candle close confirmation setting
- Use appropriate icon (Clock for Yes, Zap for No)
- Display text like "Signals confirmed on candle close" or "Real-time signal evaluation"
- Style consistently with existing summary badges

### Step 5: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` for test runner instructions
- Read `.claude/commands/e2e/test_trade_direction.md` as a template for similar feature tests
- Create `.claude/commands/e2e/test_candle_close_confirmation.md`
- Include test steps for:
  - Verifying toggle visibility in Controls Card
  - Default state is "Yes" (candle close confirmation enabled)
  - Switching between Yes and No modes
  - Visual indicator updates in strategy summary
  - Tooltip displays on hover
  - localStorage persistence across page reload
  - Keyboard accessibility (Tab, Enter, Space)
  - Mobile responsiveness

### Step 6: Run Validation Commands
- Run `cd app/server && uv run pytest` to ensure no server regressions
- Run `cd app/client && npm run build` to validate client builds without errors
- Execute E2E test: Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_candle_close_confirmation.md`

## Testing Strategy

### Unit Tests
- No additional unit tests required for this UI-only feature
- The component follows established patterns that are already tested
- E2E tests will validate the complete functionality

### Edge Cases
- Corrupted localStorage value should fall back to default (YES)
- Empty localStorage should use default value
- Invalid localStorage value (not YES or NO) should reset to default
- Toggle should work correctly after page reload
- Setting should be independent of trade direction selection

## Acceptance Criteria

1. Setting is visible in strategy configuration Controls Card: "Confirm signals on candle close: Yes/No"
2. Default selection is "Yes" (wait for candle close) for new sessions
3. Tooltip explains trade-off: "Waiting for candle close reduces false signals but may delay entries"
4. Visual indicator in strategy summary shows current confirmation setting
5. Setting persists across page reloads via localStorage
6. Yes button shows clock icon with text "Yes - Wait for close"
7. No button shows zap icon with text "No - Real-time"
8. Active button is highlighted with primary color
9. Toggle is keyboard accessible (Tab, Enter, Space)
10. Mobile layout is responsive and touch-friendly

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_candle_close_confirmation.md` to validate this functionality works.

## Notes

- **Future Integration**: The candle close confirmation setting is prepared for future integration with condition evaluation logic. Currently, it stores the user preference and displays it visually. When the trading bot or backtesting engine is integrated, this setting will control actual condition evaluation timing.
- **Exit Conditions**: The acceptance criteria specifies that exit conditions always evaluate real-time for safety. This distinction is noted but doesn't require additional implementation at this stage since condition evaluation happens server-side.
- **Icon Choices**: Clock icon (⏱) represents waiting for candle close, Zap icon (⚡) represents real-time immediate evaluation.
- **Color Coding**: Uses primary color for the active selection to maintain consistency with other toggles, rather than introducing new colors.
