# Searchable Currency Pair Selector

**ADW ID:** 93082afa
**Date:** 2026-01-19
**Specification:** /home/ubuntu/algotrading/trees/93082afa/specs/issue-42-adw-93082afa-sdlc_planner-searchable-pair-selector.md

## Overview

This feature replaces the basic currency pair dropdown in the Strategy page with an enhanced searchable selector component. The new PairSelector provides categorized pair grouping (Majors, Minors, Exotics), recent pairs history stored in localStorage, live spread display from a new API endpoint, keyboard navigation, and a confirmation dialog when changing pairs with loaded data.

## What Was Built

- **PairSelector Component**: New searchable dropdown with 150ms debounced filtering, category headers, recent pairs section, and live spread badges
- **Pair Categorization**: Backend categorization of pairs into Major, Minor, and Exotic groups
- **Spread API Endpoint**: New `/api/spread/{pair}` endpoint returning real-time spread in pips with bid/ask prices
- **Confirmation Dialog**: Modal warning when changing pairs while technical data is loaded
- **Recent Pairs History**: localStorage persistence of up to 5 recently selected pairs
- **Keyboard Navigation**: Full keyboard support with Arrow keys, Enter, Escape, and type-to-search
- **E2E Test**: Comprehensive test specification for the searchable pair selector

## Technical Implementation

### Files Modified

- `app/client/src/components/PairSelector.jsx`: New 537-line component implementing the searchable selector with all features
- `app/client/src/pages/Strategy.jsx`: Replaced Select component with PairSelector for currency pair selection
- `app/client/src/app/api.js`: Added `spread()` endpoint function for fetching spread data
- `app/server/api/routes.py`: Added pair category constants and `get_pair_category()` function, updated `make_option()` to include category
- `app/server/server.py`: Added new `/api/spread/{pair}` endpoint with pip calculation logic
- `app/server/core/data_models.py`: Added `category` field to `OptionItem` and new `SpreadResponse` model
- `.claude/commands/e2e/test_searchable_pair_selector.md`: E2E test specification

### Key Changes

- **Category Classification**: Pairs are classified as Major (EUR_USD, GBP_USD, USD_JPY, USD_CHF, AUD_USD, USD_CAD, NZD_USD), Minor (cross pairs without exotic currencies), or Exotic (pairs containing ZAR, TRY, MXN, PLN, SEK, SGD, DKK, NOK, BTC)
- **Spread Calculation**: JPY pairs use pip multiplier of 100, all other pairs use 10000 for accurate pip display
- **Debounced Search**: 150ms debounce on search input to prevent excessive filtering operations
- **Spread Refresh**: Spreads refresh every 5 seconds while the dropdown is open, with stale indicator after 30 seconds
- **Mobile Touch Targets**: Minimum 44px row height for accessibility on touch devices

## How to Use

1. Navigate to the Strategy page
2. Click the Currency Pair selector to open the dropdown
3. Use the search input to filter pairs by typing (e.g., "EUR" to see all Euro pairs)
4. Pairs are organized in sections: Recent (if any), Major, Minor, and Exotic
5. Live spread values display next to each pair (loading spinner while fetching)
6. Click a pair or press Enter on a highlighted pair to select it
7. If technical data is already loaded, a confirmation dialog will appear asking to confirm the change
8. Recent selections are saved and appear at the top for quick access

### Keyboard Shortcuts

- **Arrow Up/Down**: Navigate through pairs
- **Enter**: Select highlighted pair
- **Escape**: Close dropdown
- **Any letter/number**: Focus search input and start typing

## Configuration

- `RECENT_PAIRS_KEY`: localStorage key `forex_dash_recent_pairs` stores recent pair history
- `MAX_RECENT_PAIRS`: Maximum of 5 recent pairs stored
- `SPREAD_REFRESH_INTERVAL`: 5000ms (5 seconds) refresh rate for spread data
- `SEARCH_DEBOUNCE_MS`: 150ms debounce delay on search input

## Testing

### Backend Tests
```bash
cd app/server && uv run pytest
```

### Frontend Build
```bash
cd app/client && npm run build
```

### E2E Test
Execute the E2E test specification at `.claude/commands/e2e/test_searchable_pair_selector.md` which validates:
- Dropdown opens and displays categories
- Search filtering works correctly
- Recent pairs section appears after selection
- Spread values display with loading states
- Keyboard navigation functions properly
- Confirmation dialog appears when changing pairs with loaded data

## Notes

- The spread API endpoint validates that the requested pair exists in available instruments before fetching prices
- Stale spread data (older than 30 seconds) displays with a warning indicator
- The component uses Tailwind CSS animations for smooth dropdown open/close transitions
- Error states for spread fetching display "--" with an alert icon
- The component follows the existing styleguide patterns with proper color tokens and spacing
