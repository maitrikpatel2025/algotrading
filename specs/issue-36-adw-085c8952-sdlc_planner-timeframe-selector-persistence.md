# Feature: Timeframe Selector with Session Persistence for Multi-Scale Analysis

## Metadata
issue_number: `36`
adw_id: `085c8952`
issue_json: `{"number":36,"title":"Feature - Timeframe Selector with Session Persistence for Multi-Scale Analysis US-VSB-003","body":"..."}`

## Feature Description
Enhance the existing timeframe selector in the Strategy page to support an expanded set of granularity options with session persistence. This enables traders to analyze markets across multiple time scales while retaining their preferred timeframe across page refreshes. The feature extends the current timeframe dropdown with M1, M5, M15, M30, H1, H4, D1, W1 options, adds localStorage persistence for user preferences, and includes visual enhancements like a timeframe badge in the chart header and active state styling in the dropdown.

## User Story
As a **forex trader**
I want to **select from expanded timeframe options and have my preference remembered**
So that **I can analyze markets at my preferred time scale without re-selecting the timeframe on every visit**

## Problem Statement
The current timeframe selector has limited granularity options (M5, M15, H1, H4, D) and does not persist user preferences. Traders who prefer specific timeframes must re-select them on every page load, disrupting their workflow. Additionally, there's no visual indicator of the currently active timeframe in the chart header, making it harder to quickly identify the selected timeframe at a glance.

## Solution Statement
Extend the timeframe selector system with:
1. Full set of granularities: M1, M5, M15, M30, H1, H4, D1, W1 with human-readable display labels
2. localStorage persistence for preferred timeframe selection
3. Visual timeframe badge pill displayed in chart header next to pair name
4. Active state styling in the Select dropdown for the selected option
5. Debounced timeframe switching (300ms) to prevent API flooding
6. Zoom context preservation when switching timeframes by calculating equivalent candle counts
7. Loading overlay on chart during timeframe change with indicator recalculation

## Relevant Files
Use these files to implement the feature:

**Backend Files:**
- `app/server/config/settings.py` - Contains TFS dictionary with timeframe-to-seconds mappings. Needs to be extended with M1, M30, W1 timeframes.
- `app/server/api/routes.py` - Contains `get_options()` function that returns granularities to frontend. Needs to return display labels.

**Frontend Files:**
- `app/client/src/pages/Strategy.jsx` - Main strategy page component. Needs localStorage init/persistence for timeframe, debouncing, and passing timeframe to chart header.
- `app/client/src/components/Select.jsx` - Select dropdown component. Needs active state styling with `bg-primary text-primary-foreground`.
- `app/client/src/components/PriceChart.jsx` - Price chart component. Needs timeframe badge pill in header.
- `app/client/src/app/data.js` - Client-side constants including GRANULARITY_SECONDS. Needs to be extended with new timeframes.
- `app/client/src/app/api.js` - API client. May need modification for technicals re-fetch on timeframe change.

**Documentation Files:**
- `ai_docs/ui_style_guide.md` - UI style guide for consistent styling patterns.
- `.claude/commands/test_e2e.md` - E2E test runner guide.
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test for reference.

### New Files
- `.claude/commands/e2e/test_timeframe_selector.md` - E2E test file for validating timeframe selector functionality.

## Implementation Plan

### Phase 1: Foundation
Extend the backend and data constants to support the full set of timeframes. This includes updating the TFS dictionary in settings.py to include M1, M30, D1 (as alias for D), and W1 timeframes with their corresponding seconds values. The frontend data.js constants also need to be synchronized with these new timeframe options.

### Phase 2: Core Implementation
Implement the main feature functionality:
1. Update `get_options()` in routes.py to return display labels (e.g., "1 Min", "5 Min", "1 Hour")
2. Add localStorage persistence logic in Strategy.jsx for timeframe preferences
3. Implement 300ms debounce for timeframe switching to prevent API flooding
4. Add zoom context preservation calculation when switching timeframes
5. Style active option in Select.jsx dropdown with primary colors

### Phase 3: Integration
Complete the visual integration and edge case handling:
1. Add timeframe badge pill in PriceChart.jsx chart header
2. Implement loading overlay during timeframe switch
3. Add validation for timeframe existence before API fetch
4. Handle edge case of insufficient historical data with info toast
5. Ensure technicals indicators are recalculated on timeframe change

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_trading_dashboard.md` for E2E test format
- Create `.claude/commands/e2e/test_timeframe_selector.md` with test steps covering:
  - Verify expanded timeframe options are visible in dropdown
  - Verify timeframe badge displays in chart header
  - Verify active timeframe is styled with primary colors in dropdown
  - Verify localStorage persistence by refreshing page
  - Verify debouncing prevents rapid API calls
  - Take screenshots at key verification points

### Step 2: Extend Backend Timeframe Configuration
- Update `app/server/config/settings.py`:
  - Add M1 (60 seconds), M30 (1800 seconds) to TFS dictionary
  - Add W1 (604800 seconds = 7 days) to TFS dictionary
  - Keep D1 as alias for D (86400 seconds) for API compatibility
- Verify TFS dictionary order matches expected dropdown order

### Step 3: Update get_options() to Return Display Labels
- Update `app/server/api/routes.py`:
  - Modify `make_option()` to accept a display label parameter
  - Create GRANULARITY_LABELS dictionary mapping codes to human-readable labels:
    - M1: "1 Min", M5: "5 Min", M15: "15 Min", M30: "30 Min"
    - H1: "1 Hour", H4: "4 Hour", D: "1 Day", W1: "1 Week"
  - Update `get_options()` to use labels for the `text` field
- Add unit test for get_options() to verify label format

### Step 4: Update Frontend Data Constants
- Update `app/client/src/app/data.js`:
  - Add M1, M30, W1 to GRANULARITY_SECONDS mapping
  - Ensure values match backend TFS exactly:
    - M1: 60, M5: 300, M15: 900, M30: 1800
    - H1: 3600, H4: 14400, D: 86400, W1: 604800
- Verify calculateCandleCount() works correctly with new timeframes

### Step 5: Add Active State Styling to Select Component
- Update `app/client/src/components/Select.jsx`:
  - Pass `selectedValue` as a prop (using `defaultValue`)
  - Add conditional class to option elements for active state:
    - When `option.value === defaultValue`, apply `bg-primary text-primary-foreground`
  - Follow style guide patterns for primary color usage
  - Note: Native HTML `<select>` doesn't support per-option styling in all browsers; if needed, convert to a custom dropdown or use CSS-only approach for the visual indicator

### Step 6: Implement localStorage Persistence in Strategy.jsx
- Update `app/client/src/pages/Strategy.jsx`:
  - Create localStorage key constant: `PREFERRED_TIMEFRAME_KEY = 'preferred_timeframe'`
  - In `loadOptions()` useEffect, after options load:
    - Read preferred timeframe from localStorage
    - Validate it exists in available granularities
    - Set `selectedGran` state from localStorage or fallback to first option
  - In `setSelectedGran` handler:
    - Save selection to localStorage: `localStorage.setItem(PREFERRED_TIMEFRAME_KEY, value)`
  - Export a function to clear preference (for logout/reset if implemented)

### Step 7: Implement Debounced Timeframe Switching
- Update `app/client/src/pages/Strategy.jsx`:
  - Install or use existing debounce utility (or implement simple debounce with useRef + setTimeout)
  - Create `debouncedTimeframeChange` function with 300ms delay
  - When timeframe changes:
    - Clear any pending debounce timer
    - Set new timer to call `loadPrices(selectedCount)` and `loadTechnicals()`
    - Show loading state immediately but delay API call
  - Clean up timer on component unmount

### Step 8: Add Zoom Context Preservation on Timeframe Switch
- Update `app/client/src/pages/Strategy.jsx`:
  - Import GRANULARITY_SECONDS from data.js
  - Before switching timeframe, capture current candle count
  - Calculate new candle count using formula:
    ```javascript
    newCandleCount = oldCandleCount * (oldTfSeconds / newTfSeconds)
    ```
  - Clamp result to [50, 500] range
  - Apply new candle count when loading prices with new timeframe

### Step 9: Add Timeframe Badge to Chart Header
- Update `app/client/src/components/PriceChart.jsx`:
  - Add `selectedGranularity` prop (already passed)
  - In chart header, after pair name info, add timeframe badge pill:
    ```jsx
    <span className="ml-2 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold">
      {selectedGranularity}
    </span>
    ```
  - Follow style guide Badge patterns for styling
  - Ensure badge is visible on all viewport sizes

### Step 10: Add Loading Overlay During Timeframe Fetch
- Update `app/client/src/components/PriceChart.jsx`:
  - The loading skeleton already exists and is controlled by `loading` prop
  - Ensure loading state is properly triggered when timeframe changes
  - Verify the overlay appears during technicals recalculation as well
  - The current implementation should work; verify loading prop is passed correctly

### Step 11: Validate Timeframe Before API Fetch
- Update `app/client/src/pages/Strategy.jsx`:
  - Before calling `endPoints.prices()`, validate that selected timeframe exists in options
  - If invalid (edge case from stale localStorage), reset to first available option
  - Log warning if preferred timeframe was invalid

### Step 12: Handle Insufficient Historical Data Edge Case
- Update `app/client/src/pages/Strategy.jsx`:
  - After price data loads, check if returned data length < requested count
  - If fewer candles than requested, display info toast/message:
    - "Showing {actual} candles - insufficient historical data for {requested} candles"
  - Use existing error display pattern but with info styling instead of error styling

### Step 13: Write Backend Unit Tests
- Create/update `app/server/tests/test_routes.py`:
  - Test `get_options()` returns all 8 granularities (M1, M5, M15, M30, H1, H4, D, W1)
  - Test each granularity has proper display label in `text` field
  - Test `make_option()` correctly constructs option objects

### Step 14: Run Validation Commands
- Run all validation commands to ensure feature works correctly with zero regressions

## Testing Strategy

### Unit Tests
- Backend: Test `get_options()` returns correct granularity options with labels
- Backend: Test TFS dictionary has correct second values for all timeframes
- Frontend: Test `calculateCandleCount()` works with new timeframes (M1, M30, W1)
- Frontend: Test debounce logic correctly delays API calls

### Edge Cases
- localStorage contains invalid/removed timeframe code - should fallback gracefully
- User switches timeframe rapidly multiple times - only last selection should trigger API call (debounce)
- New timeframe has insufficient historical data - should display available data with info message
- Network error during timeframe switch - should show error and maintain previous timeframe display
- User clears localStorage manually - should fallback to first option
- W1 timeframe with 1D date range - should handle very small candle counts gracefully

## Acceptance Criteria
- [ ] Timeframe dropdown shows all 8 options: M1 (1 Min), M5 (5 Min), M15 (15 Min), M30 (30 Min), H1 (1 Hour), H4 (4 Hour), D (1 Day), W1 (1 Week)
- [ ] Selected timeframe persists in localStorage and is restored on page refresh
- [ ] Timeframe badge pill displays prominently in chart header next to pair name
- [ ] Active timeframe option in dropdown has visual distinction (primary colors or checkmark)
- [ ] Rapid timeframe switching is debounced (300ms) to prevent API flooding
- [ ] Loading overlay displays during timeframe fetch and indicator recalculation
- [ ] Zoom context is preserved when switching timeframes using candle count ratio calculation
- [ ] Invalid localStorage timeframe gracefully falls back to first available option
- [ ] All existing chart functionality (zoom, pan, chart types, volume) works with new timeframes
- [ ] Backend unit tests pass with 100% coverage for new/modified functions
- [ ] E2E test validates all timeframe selector functionality
- [ ] Frontend build completes without errors

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd /home/ubuntu/algotrading/trees/085c8952/app/server && uv run pytest tests/test_routes.py -v` - Run route tests to validate get_options() changes
- `cd /home/ubuntu/algotrading/trees/085c8952/app/server && uv run pytest` - Run all server tests to validate no regressions
- `cd /home/ubuntu/algotrading/trees/085c8952/app/client && npm run build` - Run frontend build to validate TypeScript/JSX compiles without errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_timeframe_selector.md` to validate E2E functionality

## Notes
- The OpenFX API may not support all timeframes equally. M1 and W1 are the most likely to have limited data availability. The implementation should gracefully handle cases where the broker's available granularities don't include all options.
- Native HTML `<select>` elements have limited styling options for individual options. The active state styling requirement may need a CSS-only solution (using `:checked` pseudo-class if supported) or converting to a custom dropdown component. For MVP, visual distinction in the header badge may be sufficient.
- The debounce implementation should be cleanup-safe to prevent memory leaks on component unmount.
- localStorage key should be consistent and potentially namespaced to avoid conflicts with other applications.
- Consider adding a "Reset Preferences" button or integrating with a future logout flow to clear localStorage.
