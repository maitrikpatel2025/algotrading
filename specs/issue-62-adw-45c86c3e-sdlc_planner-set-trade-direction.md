# Feature: Set Trade Direction

## Metadata
issue_number: `62`
adw_id: `45c86c3e`
issue_json: `{"number":62,"title":"Feature Set Trade Direction US-VSB-012","body":"/feature\n\nadw_sdlc_iso\n\nSet Trade Direction\n\nI want to specify whether my strategy trades Long only, Short only, or Both directions\nSo that I can build strategies focused on my preferred trading style and see only relevant condition sections\nAcceptance Criteria:\n\n Trade direction selector prominently displayed at top of strategy builder\n Options: \"Long Only\", \"Short Only\", \"Both\"\n Default: \"Both\" for new strategies\n Changing direction updates logic panel sections immediately\n Confirmation if switching from \"Both\" to single direction with existing conditions: \"You have Short conditions defined. Switching to Long Only will remove them. Continue?\"\n Direction saved with strategy\n Direction displayed in strategy list/browser for quick identification\n Icon indicators: ↑ (Long), ↓ (Short), ↕ (Both)"}`

## Feature Description
This feature introduces trade direction configuration to the strategy builder, allowing traders to specify whether their strategy executes Long-only trades, Short-only trades, or Both trading directions. The trade direction selector will be prominently displayed at the top of the strategy builder interface, immediately below the pair/timeframe selectors. When a user changes the trade direction, the Logic Panel will dynamically update to show only the relevant condition sections - Long strategies show only Entry conditions (for buying), Short strategies show only Exit conditions (for selling), while Both shows both sections. The selected direction is persisted with the strategy configuration and displayed with visual icon indicators (↑ for Long, ↓ for Short, ↕ for Both) throughout the application for quick identification.

## User Story
As a forex trader
I want to specify whether my strategy trades Long only, Short only, or Both directions
So that I can build strategies focused on my preferred trading style and see only relevant condition sections

## Problem Statement
Currently, the strategy builder always displays both Entry and Exit condition sections in the Logic Panel, regardless of a trader's preferred trading direction. This creates unnecessary complexity for traders who focus exclusively on Long or Short positions. There is no way to configure or persist a strategy's intended trading direction, making it difficult to build focused, directional strategies. Additionally, when browsing multiple strategies, users cannot quickly identify which trading direction each strategy is designed for, leading to confusion and inefficiency in strategy management.

## Solution Statement
Implement a Trade Direction selector component that is prominently placed at the top of the Strategy page, grouped with the pair and timeframe selectors in the Controls Card. The selector will offer three options: "Long Only" (↑), "Short Only" (↓), and "Both" (↕), with "Both" as the default for new strategies. When the direction changes, the Logic Panel will dynamically show/hide sections - Long Only displays Entry conditions only, Short Only displays Exit conditions only, and Both displays both sections. A confirmation dialog will appear if the user attempts to switch from "Both" to a single direction when conditions exist in the section that would be hidden, warning them that those conditions will be removed. The trade direction will be stored in the strategy state, persisted to localStorage for the current session, and eventually saved to the database when strategy persistence is implemented. Icon indicators (↑, ↓, ↕) will be used consistently throughout the UI to visually represent the trade direction at a glance.

## Relevant Files
Use these files to implement the feature:

- `app/client/src/pages/Strategy.jsx` (1,099 lines) - Main Strategy page component containing all state management for indicators, patterns, conditions, and chart data. This is where we'll add the `tradeDirection` state and pass it down to child components. The Controls Card section (around line 850) is where the Trade Direction selector will be added.

- `app/client/src/components/LogicPanel.jsx` (291 lines) - Logic Panel component that displays Entry and Exit condition sections. We'll modify this to conditionally render sections based on the `tradeDirection` prop. The component uses collapsible sections with drag-and-drop support.

- `app/client/src/components/ConditionBlock.jsx` (approximately 200+ lines) - Individual condition block component. No major changes needed here, but we may need to update condition creation logic to respect trade direction.

- `app/client/src/app/conditionDefaults.js` - Contains default condition configurations and operators. May need to reference this for condition templates when creating direction-specific conditions.

- `app/client/src/app/indicators.js` - Indicator definitions with default condition templates. The `defaultConditionTemplate` property includes a `section` field that specifies 'entry' or 'exit', which we'll use to filter conditions based on trade direction.

- `app/client/src/components/ConfirmDialog.jsx` (if exists) or similar confirmation modal component - We'll need to show a confirmation dialog when switching from "Both" to a single direction with existing conditions in the section to be removed.

- `app/server/core/data_models.py` (313 lines) - Backend Pydantic models for API requests/responses. We'll add a `StrategyConfigRequest` and `StrategyConfigResponse` model to support future strategy persistence with trade direction.

- `app/server/db/database.py` (187 lines) - Supabase database wrapper. When implementing strategy persistence, we'll add methods to save/load strategy configurations including trade direction.

- `app/client/src/app/api.js` (if exists) or API client module - We'll add API client methods for saving and loading strategy configurations.

### New Files

- `.claude/commands/e2e/test_trade_direction.md` - E2E test specification file to validate the trade direction feature. This test will verify the selector appears, changes the Logic Panel sections, shows confirmation dialogs appropriately, and persists the selection. The test should demonstrate changing trade directions and verify the UI updates correctly with screenshots showing each state.

## Implementation Plan

### Phase 1: Foundation
1. Add trade direction state management to `Strategy.jsx` with three possible values: 'long', 'short', 'both'
2. Create localStorage persistence for trade direction preferences using key `forex_dash_trade_direction`
3. Define trade direction constants and types in a shared constants file
4. Create a reusable TradeDirectionSelector component with icon indicators (↑, ↓, ↕)
5. Set up confirmation dialog logic for handling direction changes with existing conditions

### Phase 2: Core Implementation
6. Integrate the TradeDirectionSelector into the Strategy page Controls Card
7. Modify LogicPanel component to conditionally render Entry/Exit sections based on trade direction prop
8. Implement condition filtering logic to remove incompatible conditions when direction changes
9. Add backend data models for strategy persistence with trade direction field
10. Create API endpoints for saving and loading strategy configurations (future-proofing)

### Phase 3: Integration
11. Wire up the trade direction selector to update state and trigger Logic Panel re-renders
12. Implement the confirmation dialog flow when switching directions with existing conditions
13. Add visual indicators throughout the UI to display the current trade direction
14. Test the complete flow from direction selection through condition management to persistence
15. Validate accessibility, keyboard navigation, and mobile responsiveness

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Set up trade direction state and constants
- Create or update `app/client/src/app/constants.js` with trade direction constants:
  - `TRADE_DIRECTIONS` object with keys: 'long', 'short', 'both'
  - `TRADE_DIRECTION_LABELS` with user-friendly labels
  - `TRADE_DIRECTION_ICONS` with icon characters (↑, ↓, ↕)
  - `TRADE_DIRECTION_STORAGE_KEY` for localStorage persistence
- Add `tradeDirection` state to `Strategy.jsx` with default value 'both'
- Add `tradeDirectionHistory` state for undo functionality
- Implement localStorage persistence: save on change, load on mount

### 2. Create TradeDirectionSelector component
- Create new file `app/client/src/components/TradeDirectionSelector.jsx`
- Build a button group or radio button component with three options
- Each option displays the icon and label (e.g., "↑ Long Only")
- Style with Tailwind CSS to match existing Controls Card UI
- Highlight the active selection with appropriate colors
- Emit `onChange` event when selection changes
- Make responsive for mobile devices (stack vertically if needed)

### 3. Create confirmation dialog utility
- Create or update `app/client/src/components/ConfirmDialog.jsx` (if it doesn't exist)
- Create a reusable modal component with title, message, and action buttons
- Support "Continue" and "Cancel" buttons with appropriate styling
- Make it keyboard accessible (Enter to confirm, Escape to cancel)
- Style consistently with the existing UI design

### 4. Integrate TradeDirectionSelector into Strategy page
- Open `app/client/src/pages/Strategy.jsx`
- Locate the Controls Card section (around line 850 in the render method)
- Add TradeDirectionSelector component next to the pair/timeframe selectors
- Create `handleTradeDirectionChange` callback function
- Implement logic to check for existing conditions before allowing direction change
- Show confirmation dialog if switching from 'both' to 'long'/'short' with incompatible conditions
- Update `tradeDirection` state after confirmation
- Remove incompatible conditions from state when direction changes

### 5. Update LogicPanel to conditionally render sections
- Open `app/client/src/components/LogicPanel.jsx`
- Add `tradeDirection` prop to component props
- Modify the render logic:
  - If `tradeDirection === 'long'`: show only Entry Conditions section
  - If `tradeDirection === 'short'`: show only Exit Conditions section
  - If `tradeDirection === 'both'`: show both sections (current behavior)
- Update section headers to include trade direction context
- Ensure drag-and-drop behavior respects the visible sections only

### 6. Filter conditions based on trade direction
- In `Strategy.jsx`, create a utility function `filterConditionsByDirection(conditions, direction)`
- This function returns only conditions that match the selected trade direction:
  - 'long' → keep conditions where `section === 'entry'`
  - 'short' → keep conditions where `section === 'exit'`
  - 'both' → keep all conditions
- Apply this filter when trade direction changes
- Store removed conditions in history for potential undo

### 7. Update indicator drop handling
- In `Strategy.jsx`, locate the `handleIndicatorDrop` function
- Modify the auto-created condition logic to respect trade direction:
  - If direction is 'long', only create 'entry' conditions
  - If direction is 'short', only create 'exit' conditions
  - If direction is 'both', create conditions based on indicator's default template
- Update the condition section assignment based on trade direction

### 8. Create E2E test specification
- Create `.claude/commands/e2e/test_trade_direction.md` based on the template from `.claude/commands/e2e/test_trading_dashboard.md`
- Define user story: "As a trader, I want to set my strategy's trade direction so I can focus on my preferred trading style"
- Create test steps:
  1. Navigate to Strategy page
  2. Verify TradeDirectionSelector is present with all three options
  3. Verify default selection is "Both" (↕)
  4. Select "Long Only" (↑) and verify Entry section shows, Exit section hides
  5. Add an entry condition
  6. Switch to "Short Only" (↓) and verify confirmation dialog appears
  7. Confirm the switch and verify entry condition is removed, Exit section shows
  8. Switch to "Both" (↕) and verify both sections show
  9. Verify trade direction persists after page reload
  10. Take screenshots at each step
- Define success criteria: All sections toggle correctly, confirmation works, persistence works

### 9. Add backend data models for strategy persistence
- Open `app/server/core/data_models.py`
- Add new Pydantic models:
  - `StrategyCondition` model for individual conditions with fields: id, section, leftOperand, operator, rightOperand, indicatorInstanceId
  - `StrategyIndicator` model for indicator instances with fields: id, instanceId, params, color, lineWidth, lineStyle, fillOpacity
  - `StrategyConfig` model with fields: name, description, tradeDirection, pair, timeframe, indicators (List[StrategyIndicator]), conditions (List[StrategyCondition]), createdAt, updatedAt
  - `SaveStrategyRequest` model extending StrategyConfig
  - `SaveStrategyResponse` model with fields: success, strategyId, message, error
  - `LoadStrategyResponse` model with fields: success, strategy (StrategyConfig), error

### 10. Create database table migration (preparation for persistence)
- Create migration file: `app/server/db/migrations/001_create_strategies_table.sql`
- Define SQL schema for `forex_strategies` table:
  - id (UUID primary key)
  - name (text, not null)
  - description (text)
  - trade_direction (text, not null, check constraint: 'long', 'short', 'both')
  - pair (text)
  - timeframe (text)
  - indicators (jsonb)
  - conditions (jsonb)
  - created_at (timestamp with time zone, default now())
  - updated_at (timestamp with time zone, default now())
- Add comment explaining this is for future use when strategy saving is implemented

### 11. Add API endpoints for strategy persistence (future-proofing)
- Create new file `app/server/api/strategy_routes.py`
- Implement `POST /api/strategies` endpoint to save a strategy
- Implement `GET /api/strategies` endpoint to list all strategies
- Implement `GET /api/strategies/{strategy_id}` endpoint to load a specific strategy
- Implement `PUT /api/strategies/{strategy_id}` endpoint to update a strategy
- Implement `DELETE /api/strategies/{strategy_id}` endpoint to delete a strategy
- Register routes in `app/server/server.py`
- Add error handling for database operations
- Write unit tests in `app/server/tests/test_strategy_endpoints.py`

### 12. Create API client methods
- Create or update `app/client/src/app/api.js`
- Add `saveStrategy(strategyConfig)` method
- Add `loadStrategies()` method
- Add `loadStrategy(strategyId)` method
- Add `updateStrategy(strategyId, strategyConfig)` method
- Add `deleteStrategy(strategyId)` method
- Handle errors and return appropriate response objects

### 13. Add visual indicators throughout UI
- Update page title or breadcrumb to show current trade direction with icon
- Add a small badge next to the strategy builder title showing the direction
- Consider adding tooltip explanations for each direction option
- Ensure color coding is consistent:
  - Long (↑) - Green/Success theme
  - Short (↓) - Red/Destructive theme
  - Both (↕) - Blue/Primary theme

### 14. Implement accessibility features
- Ensure TradeDirectionSelector has proper ARIA labels
- Add keyboard navigation support (arrow keys, Enter, Space)
- Verify screen reader announces direction changes
- Test with keyboard-only navigation
- Add focus indicators for all interactive elements
- Ensure confirmation dialog is keyboard accessible

### 15. Test trade direction on mobile devices
- Test TradeDirectionSelector on mobile viewport (375px width)
- Verify buttons are properly sized for touch targets (minimum 44x44px)
- Test confirmation dialog on mobile
- Verify Logic Panel sections toggle correctly on mobile
- Test with mobile floating action buttons

### 16. Add undo/redo support for direction changes
- Update the history management in `Strategy.jsx`
- Add direction changes to the undo stack
- When user presses Ctrl+Z, restore previous direction and conditions
- Test undo after direction change with condition removal

### 17. Write unit tests for new components
- Create test file `app/client/src/components/__tests__/TradeDirectionSelector.test.jsx`
- Test rendering all three options
- Test click handlers and onChange events
- Test active state styling
- Test icon rendering
- Mock localStorage and test persistence

### 18. Run validation commands
- Execute all validation commands listed in the "Validation Commands" section below
- Run backend tests: `cd app/server && uv run pytest`
- Run frontend build: `cd app/client && npm run build`
- Read and execute E2E test: Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_trade_direction.md`
- Verify zero errors and all tests pass

## Testing Strategy

### Unit Tests

**Frontend (Jest/React Testing Library):**
- `TradeDirectionSelector.test.jsx`:
  - Renders all three direction options
  - Highlights the active selection correctly
  - Calls onChange handler with correct value when clicked
  - Displays correct icons for each option
  - Applies correct styling for active/inactive states

- `LogicPanel.test.jsx` (update existing tests):
  - Renders only Entry section when tradeDirection='long'
  - Renders only Exit section when tradeDirection='short'
  - Renders both sections when tradeDirection='both'
  - Handles missing tradeDirection prop (defaults to 'both')

- `Strategy.test.jsx` (integration tests):
  - Trade direction defaults to 'both' on mount
  - Direction change updates state correctly
  - Shows confirmation dialog when removing conditions
  - Filters conditions correctly based on direction
  - Persists direction to localStorage
  - Loads direction from localStorage on mount

**Backend (pytest):**
- `test_strategy_endpoints.py`:
  - POST /api/strategies creates new strategy with trade_direction
  - GET /api/strategies returns all strategies
  - GET /api/strategies/{id} returns specific strategy with correct trade_direction
  - PUT /api/strategies/{id} updates trade_direction
  - DELETE /api/strategies/{id} removes strategy
  - Invalid trade_direction value returns validation error
  - Missing required fields return 400 error

- `test_data_models.py` (update existing):
  - StrategyConfig validates trade_direction enum ('long', 'short', 'both')
  - StrategyConfig rejects invalid trade_direction values
  - StrategyCondition section field validates ('entry', 'exit')

### Edge Cases

1. **Switching from "Both" to "Long Only" with exit conditions:**
   - User has both entry and exit conditions defined
   - User switches to "Long Only"
   - Confirmation dialog shows: "You have Exit conditions defined. Switching to Long Only will remove them. Continue?"
   - On confirm: exit conditions removed, entry conditions remain
   - On cancel: direction stays "Both", all conditions remain

2. **Switching from "Both" to "Short Only" with entry conditions:**
   - Similar to above but removes entry conditions, keeps exit conditions

3. **Switching from "Long Only" to "Short Only":**
   - All entry conditions are removed
   - User can start fresh with exit conditions
   - No confirmation needed (already in single-direction mode)

4. **Adding indicator with trade direction "Long Only":**
   - Auto-created condition should be in 'entry' section only
   - Should not create exit condition even if indicator's default template specifies 'exit'

5. **Undo after direction change:**
   - User switches from "Both" to "Long", removing exit conditions
   - User presses Ctrl+Z
   - Direction reverts to "Both", exit conditions restored

6. **Page reload with trade direction "Short Only":**
   - User sets direction to "Short Only"
   - User refreshes page
   - Direction loads from localStorage as "Short Only"
   - Only Exit section visible in Logic Panel

7. **No conditions exist when switching direction:**
   - User switches between any directions
   - No confirmation dialog appears
   - Direction changes immediately

8. **Mobile touch interaction:**
   - User taps direction options on mobile
   - Touch target is large enough (44x44px minimum)
   - Visual feedback on tap
   - Confirmation dialog is mobile-friendly

9. **Keyboard navigation:**
   - User tabs to TradeDirectionSelector
   - Arrow keys move between options
   - Enter/Space selects option
   - Escape closes confirmation dialog

10. **API persistence edge cases:**
    - Database connection fails during save
    - Invalid strategy data sent to API
    - Concurrent updates to same strategy
    - Loading non-existent strategy ID

## Acceptance Criteria

1. ✅ Trade direction selector is prominently displayed at the top of the Strategy page, grouped with pair/timeframe selectors in the Controls Card
2. ✅ Three options are available: "Long Only" (↑), "Short Only" (↓), "Both" (↕)
3. ✅ Default selection is "Both" for new strategies
4. ✅ Changing direction updates Logic Panel sections immediately:
   - "Long Only" shows Entry conditions section only
   - "Short Only" shows Exit conditions section only
   - "Both" shows both Entry and Exit sections
5. ✅ Confirmation dialog appears when switching from "Both" to single direction with existing incompatible conditions
   - Dialog message clearly indicates which conditions will be removed
   - User can confirm or cancel the change
6. ✅ Trade direction is saved to localStorage for the current session
7. ✅ Trade direction persists across page reloads (via localStorage)
8. ✅ Backend data models support trade direction field for future database persistence
9. ✅ Icon indicators (↑, ↓, ↕) are displayed consistently throughout the UI
10. ✅ API endpoints are created for future strategy saving/loading with trade direction
11. ✅ E2E test validates complete trade direction workflow
12. ✅ All backend tests pass with zero errors
13. ✅ Frontend builds successfully with zero errors
14. ✅ Component is keyboard accessible and mobile responsive

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

```bash
# 1. Run server tests to validate backend changes
cd app/server && uv run pytest

# 2. Run frontend build to validate no TypeScript/build errors
cd app/client && npm run build

# 3. Start the application (if not already running)
./scripts/start.sh

# 4. Execute E2E test for trade direction feature
# First read the E2E test runner documentation
# Then read and execute the trade direction E2E test
```

Manual validation steps:
1. Read `.claude/commands/test_e2e.md` to understand the E2E testing process
2. Read `.claude/commands/e2e/test_trade_direction.md` to review the specific test steps
3. Execute the E2E test by following the test specification manually or using Playwright automation
4. Verify all screenshots are captured and show correct UI states
5. Confirm zero errors in browser console during the test
6. Verify the following specific behaviors:
   - Trade direction selector appears in Strategy page Controls Card
   - All three options (Long, Short, Both) are clickable and visually distinct
   - Default selection is "Both" on first visit
   - Clicking "Long Only" hides Exit conditions section, shows Entry section only
   - Clicking "Short Only" hides Entry conditions section, shows Exit section only
   - Clicking "Both" shows both sections
   - Adding conditions in "Long Only" mode creates only entry conditions
   - Switching from "Both" with exit conditions to "Long Only" shows confirmation
   - Confirmation dialog has "Continue" and "Cancel" buttons
   - Clicking "Cancel" keeps direction as "Both" and preserves all conditions
   - Clicking "Continue" changes to "Long Only" and removes exit conditions
   - Page reload preserves the selected trade direction
   - Icons (↑, ↓, ↕) display correctly for each option

## Notes

### Future Enhancements
1. **Strategy Templates:** Create pre-configured strategy templates with specific trade directions (e.g., "Breakout Long Strategy", "Mean Reversion Short Strategy")
2. **Strategy Browser:** Add a UI to browse, search, and filter saved strategies by trade direction
3. **Backtesting Integration:** When backtesting is implemented, respect trade direction to only execute trades in the specified direction
4. **Bot Integration:** When starting the trading bot, pass the strategy's trade direction to ensure the bot only opens trades in the configured direction
5. **Statistics Dashboard:** Show performance metrics segmented by trade direction to help users identify their strengths (e.g., "You have 65% win rate on Long trades vs 52% on Short trades")
6. **Smart Suggestions:** Analyze market conditions and suggest optimal trade direction (e.g., "Current trend is bullish, consider Long Only strategy")
7. **Multi-Strategy Comparison:** Allow users to compare performance of Long vs Short vs Both strategies on the same pair/timeframe

### Technical Considerations
1. **Database Schema:** The `forex_strategies` table uses JSONB columns for indicators and conditions to provide flexibility as the strategy structure evolves. This avoids complex relational schemas for nested data.
2. **LocalStorage vs Database:** Currently using localStorage for immediate persistence during the session. Full database persistence will be implemented when user authentication is added, allowing strategies to be saved per user account.
3. **Condition Section Field:** The existing condition data structure already includes a `section` field ('entry' or 'exit'). This makes filtering conditions by trade direction straightforward without data migration.
4. **Backward Compatibility:** Existing strategies (once persistence is implemented) without a trade_direction field should default to 'both' to maintain current behavior.
5. **Performance:** Filtering conditions on direction change is O(n) where n is the number of conditions. This is acceptable for typical strategy sizes (< 100 conditions), but consider memoization if performance becomes an issue.
6. **Undo Stack:** Trade direction changes are added to the history stack, allowing users to undo direction changes. This is important because direction changes can remove conditions, and users may want to revert.

### UI/UX Considerations
1. **Visual Hierarchy:** The TradeDirectionSelector should be prominent but not overpower the pair/timeframe selectors. Use consistent sizing and spacing with existing controls.
2. **Color Coding:** Use semantic colors that traders associate with Long (green/up) and Short (red/down) positions. The "Both" option uses a neutral blue/primary color.
3. **Confirmation Dialog Wording:** The confirmation message should be specific about what will be removed. Use clear, non-technical language: "You have 3 Exit conditions defined. Switching to Long Only will remove them. Continue?"
4. **Mobile Experience:** On mobile, consider stacking the three direction options vertically for easier touch interaction. Ensure minimum 44x44px touch targets.
5. **Tooltips:** Add tooltips explaining each direction option for new users: "Long Only: Strategy will only enter buy positions (betting price goes up)"
6. **Loading States:** When loading a saved strategy with trade direction, show a loading indicator while the strategy data is fetched and applied.

### Development Workflow
1. Start with frontend changes first (steps 1-8) to get immediate visual feedback
2. Implement backend models and endpoints (steps 9-12) to support future persistence
3. Add tests and validation (steps 17-18) last to ensure everything works correctly
4. The E2E test can be run multiple times during development to catch regressions early

### Dependencies
- No new npm packages required for frontend (using existing React, Tailwind CSS)
- No new Python packages required for backend (using existing FastAPI, Pydantic, Supabase client)
- May need to add `@testing-library/react` and `jest` if not already present for frontend unit tests

### Migration Notes
When implementing full strategy persistence:
1. Run the database migration to create the `forex_strategies` table
2. Add a "Save Strategy" button to the Strategy page UI
3. Implement a strategy browser page to load saved strategies
4. Add user authentication to associate strategies with user accounts
5. Consider adding strategy versioning to track changes over time

### Accessibility Standards
- WCAG 2.1 Level AA compliance
- Semantic HTML elements (use `<button>` for clickable elements, not `<div>`)
- ARIA labels for icon-only buttons
- Keyboard navigation support (Tab, Arrow keys, Enter, Space, Escape)
- Focus visible indicators for all interactive elements
- Screen reader announcements for dynamic content changes (e.g., "Exit conditions section hidden")
- Sufficient color contrast ratios (4.5:1 minimum for text)
- Support for prefers-reduced-motion for users who prefer minimal animations
