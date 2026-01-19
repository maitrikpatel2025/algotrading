# Feature: Searchable Currency Pair Selector with Categorization and Spread Display

## Metadata
issue_number: `42`
adw_id: `93082afa`
issue_json: `{"number":42,"title":"Feature  Searchable Currency Pair Selector with Categorization and Spread Display US-VSB-004","body":"\n\n/feature\n\nadw_sdlc_iso\n\nmodel_set heavy\n\nReplace the basic currency pair dropdown in Strategy.jsx with an enhanced searchable selector featuring pair categorization, recent history, and live spread display. The component integrates with the existing /api/options endpoint for pair list and adds a new spread data fetch from OpenFxApi.get_prices() to show real-time trading costs alongside each instrument.\n\nImplementation details:\n* Create new PairSelector.jsx component with search input, grouped sections (Majors, Minors, Exotics), and recent pairs section at top\n* Add search filter using pairs.filter(p => p.text.toLowerCase().includes(searchTerm)) with 150ms debounce on input change\n* Categorize pairs in api/routes.py by adding category field: Majors (EUR_USD, GBP_USD, USD_JPY, USD_CHF, AUD_USD, USD_CAD, NZD_USD), Minors (cross pairs), Exotics (ZAR, TRY, MXN, etc.)\n* Track recent pairs in localStorage: recentPairs = JSON.parse(localStorage.getItem('recent_pairs') || '[]').slice(0, 5), prepend on selection\n* On pair change with existing technicalsData, show ConfirmDialog component (reuse from BotStatus.jsx): \"Changing pair will reset indicators. Continue?\" with Cancel/Confirm buttons\n* Fetch spread via new endpoint /api/spread/{pair} calling api.get_prices([pair])[0].spread or compute from bid/ask in existing price data; display as badge \"Spread: 1.2 pips\"\n\nThe pair selector system should handle:\n* Keyboard navigation: Arrow keys move selection, Enter confirms, Escape closes dropdown, typing focuses search\n* Empty search results state showing \"No pairs match '{searchTerm}'\" with suggestion to clear filter\n* Spread update interval (every 5s when dropdown open) with stale indicator if fetch fails\n* Pair validation ensuring selected pair exists in broker's available instruments before triggering data load\n* Mobile touch interaction with larger tap targets (min 44px height per row) and virtual keyboard accommodation\n\nDisplay dropdown with max-height scroll container (300px); show category headers as sticky dividers; highlight matching search characters in bold; indicate currently selected pair with checkmark icon; show loading spinner replacing spread value during fetch; animate dropdown open/close with 150ms fade transition.\n\nCan you make sure please to follow the styleguide.md for UI."}`

## Feature Description
This feature replaces the basic currency pair dropdown selector in the Strategy page with an enhanced, searchable pair selector component. The new component provides:

1. **Search Functionality**: A text input with 150ms debounce allowing traders to quickly filter currency pairs by typing
2. **Pair Categorization**: Groups pairs into Majors (EUR_USD, GBP_USD, etc.), Minors (cross pairs), and Exotics (ZAR, TRY, MXN pairs)
3. **Recent Pairs History**: Tracks up to 5 recently selected pairs in localStorage for quick access
4. **Live Spread Display**: Shows real-time spread data fetched from a new API endpoint, updating every 5 seconds when dropdown is open
5. **Confirmation Dialog**: Warns users when changing pairs will reset loaded technical indicators
6. **Full Keyboard Navigation**: Arrow keys, Enter, Escape, and auto-focus on typing
7. **Mobile-Friendly**: Large tap targets (44px min height) and virtual keyboard accommodation

## User Story
As a **forex trader**
I want to **quickly search and select currency pairs with categorization, recent history, and live spread information**
So that **I can efficiently navigate between pairs and make informed decisions based on trading costs**

## Problem Statement
The current basic dropdown selector in Strategy.jsx requires traders to scroll through an unsorted list of all available currency pairs. This is inefficient for users who:
- Trade specific categories of pairs (majors vs exotics)
- Frequently switch between a small set of pairs
- Need to see trading costs (spread) before selecting a pair
- Use keyboard for navigation

## Solution Statement
Create a new `PairSelector.jsx` component that provides an enhanced selection experience with:
1. Searchable dropdown with 150ms debounced filtering
2. Categorized pair groups (Majors, Minors, Exotics) with sticky headers
3. Recent pairs section showing last 5 selected pairs
4. Live spread display from a new `/api/spread/{pair}` endpoint
5. Confirmation dialog when changing pairs would reset indicators
6. Full keyboard navigation support
7. Mobile-optimized touch targets

The backend will be extended with:
1. Category field added to pairs in `/api/options` response
2. New `/api/spread/{pair}` endpoint returning real-time spread data

## Relevant Files
Use these files to implement the feature:

**Backend (Server)**
- `app/server/api/routes.py` - Add category field to pair options, define pair categorization constants
- `app/server/server.py` - Add new `/api/spread/{pair}` endpoint
- `app/server/core/openfx_api.py` - Has existing `get_prices()` method for spread calculation
- `app/server/models/api_price.py` - ApiPrice model with bid/ask for spread calculation
- `app/server/config/settings.py` - Contains INVESTING_COM_PAIRS used for pair definitions

**Frontend (Client)**
- `app/client/src/pages/Strategy.jsx` - Replace Select component with new PairSelector, add confirmation dialog state
- `app/client/src/components/Select.jsx` - Reference for existing select component patterns
- `app/client/src/components/BotStatus.jsx` - Reference for ConfirmDialog component pattern (lines 37-66)
- `app/client/src/app/api.js` - Add new `spread()` endpoint function
- `app/client/src/lib/utils.js` - `cn()` utility for class merging

**E2E Testing**
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Reference for Strategy page E2E test format

### New Files
- `app/client/src/components/PairSelector.jsx` - New searchable pair selector component
- `app/server/core/data_models.py` - Add `SpreadResponse` model (if not using inline dict response)
- `.claude/commands/e2e/test_searchable_pair_selector.md` - E2E test for the new component

## Implementation Plan

### Phase 1: Foundation (Backend)
1. Define pair category constants in `api/routes.py`
2. Update `get_options()` to include category field for each pair
3. Create new `/api/spread/{pair}` endpoint that:
   - Validates pair exists
   - Calls `api.get_prices([pair])`
   - Calculates spread from bid/ask (spread = ask - bid)
   - Returns spread in pips

### Phase 2: Core Implementation (Frontend)
1. Create `PairSelector.jsx` component with:
   - Search input with 150ms debounce
   - Categorized dropdown sections with sticky headers
   - Recent pairs section (localStorage)
   - Live spread display
   - Keyboard navigation
   - Animations and styling
2. Extract and reuse `ConfirmDialog` component from BotStatus.jsx
3. Add `spread()` endpoint to api.js

### Phase 3: Integration
1. Replace basic Select with PairSelector in Strategy.jsx
2. Add confirmation dialog state and logic for pair changes
3. Wire up spread fetching interval (5s when dropdown open)
4. Add localStorage management for recent pairs
5. Handle edge cases (stale data, fetch failures, validation)

## Step by Step Tasks

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test structure
- Read `.claude/commands/e2e/test_trading_dashboard.md` as a reference
- Create `.claude/commands/e2e/test_searchable_pair_selector.md` with test steps for:
  - Opening the pair selector dropdown
  - Searching for a pair
  - Verifying categorized sections display
  - Selecting a pair from recent history
  - Verifying spread display updates
  - Testing keyboard navigation
  - Testing confirmation dialog when changing pair with data loaded

### Step 2: Add Pair Categories to Backend
- Edit `app/server/api/routes.py`:
  - Add `PAIR_CATEGORIES` constant defining Majors, Minors, Exotics
  - Majors: EUR_USD, GBP_USD, USD_JPY, USD_CHF, AUD_USD, USD_CAD, NZD_USD
  - Minors: Cross pairs without USD (EUR_GBP, EUR_JPY, GBP_JPY, etc.)
  - Exotics: Pairs with ZAR, TRY, MXN, PLN, SEK, SGD, DKK, NOK
  - Update `make_option()` to accept optional category parameter
  - Update `get_options()` to add category field to each pair

### Step 3: Create Spread API Endpoint
- Edit `app/server/server.py`:
  - Add new route `@app.get("/api/spread/{pair}")`
  - Validate pair exists in available instruments
  - Call `api.get_prices([pair.replace('_', '')])` to get current bid/ask
  - Calculate spread: `spread = ask - bid`
  - Convert to pips based on pair (JPY pairs have different pip calculation)
  - Return JSON: `{"pair": "EUR_USD", "spread": 1.2, "bid": 1.08451, "ask": 1.08463, "timestamp": "..."}`
  - Handle errors gracefully (pair not found, API unavailable)

### Step 4: Add Spread Endpoint to Frontend API
- Edit `app/client/src/app/api.js`:
  - Add `spread: (pair) => requests.get(`/spread/${pair}`)` to endPoints object

### Step 5: Create PairSelector Component - Structure
- Create `app/client/src/components/PairSelector.jsx`:
  - Import React hooks: useState, useEffect, useRef, useCallback, useMemo
  - Import cn from utils, lucide icons (Search, ChevronDown, Check, X, Loader2, Clock)
  - Import endPoints from api
  - Define component props: options, defaultValue, onSelected, technicalsData
  - Set up state: isOpen, searchTerm, highlightedIndex, recentPairs, spreads, spreadLoading

### Step 6: Implement Search and Filtering
- In PairSelector.jsx:
  - Add 150ms debounced search input handler using useCallback and setTimeout
  - Implement `filteredPairs` useMemo that filters pairs by searchTerm
  - Group filtered pairs by category (Majors, Minors, Exotics)
  - Include recent pairs section at top (filtered from localStorage)
  - Highlight matching characters in pair text using bold styling

### Step 7: Implement Dropdown UI
- In PairSelector.jsx:
  - Create dropdown container with max-height: 300px and overflow scroll
  - Add sticky category headers as dividers
  - Each pair row: 44px min height, hover state, checkmark for selected
  - Add spread badge next to each pair: "Spread: X.X pips"
  - Loading spinner while spread is being fetched
  - Empty state: "No pairs match '{searchTerm}'" with clear button
  - Animate open/close with 150ms fade transition (use CSS/Tailwind)

### Step 8: Implement Keyboard Navigation
- In PairSelector.jsx:
  - Add keydown event listener on component
  - ArrowDown: move highlightedIndex down
  - ArrowUp: move highlightedIndex up
  - Enter: select highlighted pair
  - Escape: close dropdown
  - Any letter/number: focus search input and start typing
  - Manage focus properly for accessibility

### Step 9: Implement Recent Pairs
- In PairSelector.jsx:
  - Add `RECENT_PAIRS_KEY = 'forex_dash_recent_pairs'` constant
  - Load recent pairs from localStorage on mount
  - When pair selected: prepend to recent, dedupe, keep max 5, save to localStorage
  - Display recent pairs section at top of dropdown when exists

### Step 10: Implement Spread Fetching
- In PairSelector.jsx:
  - Create `fetchSpread(pair)` function calling endPoints.spread()
  - Set up 5-second interval to refresh spreads when dropdown is open
  - Track loading state per pair
  - Handle stale indicator if fetch fails (show "Stale" or "--" for spread)
  - Clean up interval on dropdown close or unmount

### Step 11: Extract ConfirmDialog Component
- Create reusable ConfirmDialog or extract from BotStatus.jsx
- Props: isOpen, title, message, onConfirm, onCancel, isLoading, confirmText, confirmVariant
- Style with existing card/modal patterns from BotStatus.jsx

### Step 12: Integrate PairSelector in Strategy.jsx
- Edit `app/client/src/pages/Strategy.jsx`:
  - Import PairSelector instead of Select for currency pair
  - Add showConfirmDialog state and pendingPair state
  - When pair changes and technicalsData exists:
    - Store pending pair, show confirmation dialog
    - On confirm: update selectedPair, close dialog
    - On cancel: close dialog, don't change pair
  - Pass technicalsData to PairSelector for confirmation logic
  - Remove old Select usage for currency pair

### Step 13: Mobile Optimization
- In PairSelector.jsx:
  - Ensure 44px minimum row height for touch targets
  - Handle virtual keyboard: dropdown should reposition if needed
  - Add touch event handlers alongside click
  - Test responsive behavior on smaller screens

### Step 14: Run Validation Commands
- Run backend tests: `cd app/server && uv run pytest`
- Run frontend build: `cd app/client && npm run build`
- Read `.claude/commands/test_e2e.md` and execute `.claude/commands/e2e/test_searchable_pair_selector.md`

## Testing Strategy

### Unit Tests
**Backend Tests (app/server/tests/)**
- Test `get_options()` returns pairs with category field
- Test pair categorization is correct (EUR_USD -> Major, USD_ZAR -> Exotic)
- Test `/api/spread/{pair}` endpoint:
  - Returns valid spread for known pair
  - Returns 404 for unknown pair
  - Returns correct pip calculation for JPY pairs vs non-JPY pairs

**Frontend Tests**
- Test PairSelector renders correctly
- Test search filtering works with debounce
- Test category grouping displays correctly
- Test keyboard navigation cycles through items
- Test recent pairs persist to localStorage
- Test spread display shows loading, value, and error states

### Edge Cases
- Empty search results
- API timeout on spread fetch
- All pairs filtered out
- Single pair in category
- Rapid pair switching (debounce handling)
- LocalStorage unavailable or full
- Very long pair lists
- Invalid pair validation
- Mobile keyboard interaction

## Acceptance Criteria
1. PairSelector component replaces basic Select for currency pair selection
2. Search input filters pairs with 150ms debounce
3. Pairs are grouped into Majors, Minors, and Exotics categories with sticky headers
4. Recent pairs (up to 5) are shown at top and persist in localStorage
5. Live spread displays next to each pair, updating every 5s when dropdown open
6. Confirmation dialog appears when changing pair with loaded indicators
7. Keyboard navigation works: Arrow keys, Enter, Escape, auto-focus on typing
8. Empty search state shows helpful message
9. Minimum 44px row height for mobile touch targets
10. Dropdown animates open/close with 150ms fade
11. Selected pair shows checkmark indicator
12. All existing tests pass
13. Frontend builds without errors
14. E2E test validates new functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_searchable_pair_selector.md` to validate the searchable pair selector functionality works correctly

## Notes
- The spread calculation for JPY pairs uses a different pip multiplier (0.01 vs 0.0001 for non-JPY pairs)
- ConfirmDialog pattern from BotStatus.jsx should be reused for consistency
- Consider extracting ConfirmDialog to a shared component if not already done
- The existing timeframe localStorage persistence pattern (PREFERRED_TIMEFRAME_KEY) can be referenced for recent pairs implementation
- Spread API should use throttling to avoid overwhelming the price service
- Mobile virtual keyboard may require additional handling for dropdown positioning
- The `cn()` utility from lib/utils.js should be used for conditional class merging
- Follow existing component patterns (BotStatus, Select) for consistent styling
