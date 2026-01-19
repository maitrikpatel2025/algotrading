# Feature: Indicator Library Panel

## Metadata
issue_number: `44`
adw_id: `4f076469`
issue_json: `{"number":44,"title":"Feature - View Indicator Library Panel US-VSB-005","body":"adw_sdlc_iso\n\n/feature\n\nmodel_set heavy\n\nI want to see a categorized library of available indicators in a left sidebar panel\nSo that I can easily find and select indicators to add to my strategy\nAcceptance Criteria:\n\n Left panel displays collapsible categories: Trend, Momentum, Volatility, Volume, Custom\n Each indicator shows icon, name, and brief tooltip description on hover\n Search bar at top filters indicators across all categories\n Categories expand/collapse on click with smooth animation\n Panel can be collapsed to maximize chart space\n Minimum indicators available:\n\nTrend: SMA, EMA, MACD, ADX\nMomentum: RSI, Stochastic, CCI, Williams %R\nVolatility: Bollinger Bands, ATR, Keltner Channel\nVolume: OBV, Volume Profile\n\nPlease make sure if there you just want implemented at the front end or you want to implement both front and back and think of the logic\n\nCan you make sure please to follow the styleguide.md for UI.\n"}`

## Feature Description
This feature implements a categorized indicator library panel as a collapsible left sidebar on the Strategy page. The panel provides traders with easy access to technical analysis indicators organized by category, with search functionality and smooth animations.

Key capabilities:
1. **Collapsible Left Sidebar**: A panel on the left side of the Strategy page that can be collapsed/expanded to maximize chart space
2. **Categorized Indicators**: Indicators organized into 5 categories (Trend, Momentum, Volatility, Volume, Custom)
3. **Search Functionality**: A search bar that filters indicators across all categories in real-time
4. **Collapsible Categories**: Each category can be expanded/collapsed with smooth CSS transitions
5. **Rich Indicator Display**: Each indicator shows an icon, name, and tooltip description on hover
6. **Minimum Indicator Set**: Pre-defined library of 13+ technical indicators

**Implementation Scope**: This feature is **frontend-only**. The indicator library serves as a UI catalog for displaying available indicators. Future features will implement the actual indicator calculation and chart overlay functionality. This phase focuses on building the panel UI, search, and category management.

## User Story
As a **forex trader**
I want to **see a categorized library of available indicators in a left sidebar panel**
So that **I can easily find and select indicators to add to my strategy**

## Problem Statement
Currently, the Strategy page shows price charts and technical analysis data, but there is no dedicated UI for browsing and discovering available technical indicators. Traders need a way to:
- Browse indicators by category (Trend, Momentum, Volatility, Volume)
- Search for specific indicators by name
- See descriptions of what each indicator does
- Have the ability to collapse the panel when they want more chart space

## Solution Statement
Create a new `IndicatorLibrary` component that provides:
1. A collapsible left sidebar panel integrated into the Strategy page layout
2. A search input at the top for filtering indicators across all categories
3. Collapsible category sections (Trend, Momentum, Volatility, Volume, Custom) with smooth animations
4. Indicator items showing icon, name, and tooltip description on hover
5. Panel collapse/expand toggle to maximize chart viewing area
6. Mobile-responsive design with appropriate touch targets

The indicator data is defined as a static frontend constant since this phase focuses on UI catalog functionality.

## Relevant Files
Use these files to implement the feature:

**Frontend (Client) - Core Files**
- `app/client/src/pages/Strategy.jsx` - Main Strategy page to integrate the IndicatorLibrary panel into the layout
- `app/client/src/index.css` - CSS variables and styling classes (card, btn, animations, etc.)
- `app/client/src/lib/utils.js` - `cn()` utility for conditional class merging
- `app/client/tailwind.config.js` - Tailwind configuration with custom colors and animations

**Frontend (Client) - Reference Components**
- `app/client/src/components/PairSelector.jsx` - Reference for collapsible dropdown with search, keyboard navigation, animations
- `app/client/src/components/Technicals.jsx` - Reference for card layout, table styling, icon usage patterns
- `app/client/src/components/Select.jsx` - Reference for simple component patterns
- `app/client/src/components/BotStatus.jsx` - Reference for complex state management and UI patterns

**E2E Testing**
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Reference for Strategy page E2E test format

### New Files
- `app/client/src/components/IndicatorLibrary.jsx` - New indicator library sidebar panel component
- `app/client/src/app/indicators.js` - Static indicator definitions (name, category, icon, description)
- `.claude/commands/e2e/test_indicator_library_panel.md` - E2E test for the indicator library panel

## Implementation Plan

### Phase 1: Foundation
1. Create the indicator data structure with all required indicators organized by category
2. Define the indicator constants file with metadata (icon, name, description, category)
3. Set up the E2E test specification before implementation

### Phase 2: Core Implementation
1. Build the IndicatorLibrary component with:
   - Collapsible sidebar structure
   - Search input with real-time filtering
   - Collapsible category sections with smooth animations
   - Individual indicator items with icons and tooltips
2. Add expand/collapse toggle for the entire panel
3. Implement localStorage persistence for panel state and category collapse states

### Phase 3: Integration
1. Integrate the IndicatorLibrary into Strategy.jsx layout
2. Adjust the existing grid layout to accommodate the left sidebar
3. Add responsive behavior for different screen sizes
4. Ensure smooth transitions when panel is collapsed/expanded

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` to understand E2E test structure
- Read `.claude/commands/e2e/test_trading_dashboard.md` as a reference for Strategy page tests
- Create `.claude/commands/e2e/test_indicator_library_panel.md` with test steps for:
  - Navigating to Strategy page and verifying panel is visible
  - Testing search functionality filters indicators correctly
  - Testing category expand/collapse animations
  - Testing indicator hover tooltips display
  - Testing panel collapse/expand toggle
  - Testing keyboard navigation through indicators
  - Verifying all required indicators are present (SMA, EMA, MACD, ADX, RSI, Stochastic, CCI, Williams %R, Bollinger Bands, ATR, Keltner Channel, OBV, Volume Profile)

### Step 2: Create Indicator Data Constants
- Create `app/client/src/app/indicators.js`:
  - Define `INDICATOR_CATEGORIES` array: `['Trend', 'Momentum', 'Volatility', 'Volume', 'Custom']`
  - Define `INDICATORS` array with objects containing:
    - `id`: Unique identifier (e.g., 'sma', 'ema', 'macd')
    - `name`: Display name (e.g., 'Simple Moving Average (SMA)')
    - `shortName`: Short display name (e.g., 'SMA')
    - `category`: Category name ('Trend', 'Momentum', 'Volatility', 'Volume', 'Custom')
    - `description`: Brief description for tooltip
    - `icon`: Lucide icon name or custom icon identifier
  - Include all required indicators:
    - Trend: SMA, EMA, MACD, ADX
    - Momentum: RSI, Stochastic, CCI, Williams %R
    - Volatility: Bollinger Bands, ATR, Keltner Channel
    - Volume: OBV, Volume Profile
  - Export `INDICATORS` and `INDICATOR_CATEGORIES`

### Step 3: Create IndicatorLibrary Component - Structure
- Create `app/client/src/components/IndicatorLibrary.jsx`:
  - Import React hooks: useState, useEffect, useMemo, useCallback
  - Import `cn` from `../lib/utils`
  - Import Lucide icons: Search, ChevronDown, ChevronRight, ChevronLeft, X, TrendingUp, Activity, BarChart3, Volume2, Settings2
  - Import `INDICATORS`, `INDICATOR_CATEGORIES` from `../app/indicators`
  - Define component props: `isCollapsed`, `onToggleCollapse`, `onIndicatorSelect` (optional callback for future use)
  - Set up state:
    - `searchTerm`: string for search input
    - `expandedCategories`: object tracking which categories are expanded (default all expanded)
  - Define localStorage keys for persistence:
    - `PANEL_COLLAPSED_KEY = 'forex_dash_indicator_panel_collapsed'`
    - `CATEGORY_STATE_KEY = 'forex_dash_indicator_categories'`

### Step 4: Implement Search and Filtering Logic
- In IndicatorLibrary.jsx:
  - Create `filteredIndicators` useMemo that:
    - Filters `INDICATORS` by searchTerm (match on name, shortName, or description)
    - Case-insensitive matching
    - Returns filtered array
  - Create `groupedIndicators` useMemo that:
    - Groups filtered indicators by category
    - Returns object with category keys and indicator arrays

### Step 5: Implement Category Expand/Collapse
- In IndicatorLibrary.jsx:
  - Create `toggleCategory(category)` function that:
    - Updates `expandedCategories` state
    - Persists state to localStorage
  - Add smooth CSS transitions for category content:
    - Use `max-height` transition or CSS grid animation
    - Animate `rotate` on chevron icon
  - Load initial category state from localStorage on mount

### Step 6: Implement Panel UI - Collapsed State
- In IndicatorLibrary.jsx:
  - When `isCollapsed` is true, render minimal vertical bar:
    - Width: ~40px
    - Show expand icon (ChevronRight)
    - Optional: Show category icons vertically
    - Add hover effect to indicate clickability
  - Click on collapsed bar triggers `onToggleCollapse`

### Step 7: Implement Panel UI - Expanded State
- In IndicatorLibrary.jsx:
  - Panel header with:
    - Title "Indicators"
    - Collapse button (ChevronLeft icon)
  - Search input section:
    - Search icon on left
    - Text input with placeholder "Search indicators..."
    - Clear button (X icon) when searchTerm is not empty
  - Categories section:
    - Map over `INDICATOR_CATEGORIES`
    - Each category header:
      - Category icon (TrendingUp for Trend, Activity for Momentum, BarChart3 for Volatility, Volume2 for Volume, Settings2 for Custom)
      - Category name
      - Count badge showing number of indicators
      - Chevron icon (rotates on expand/collapse)
      - Click handler to toggle expand/collapse
    - Category content (when expanded):
      - Map over grouped indicators
      - Smooth height animation on toggle

### Step 8: Implement Indicator Item UI
- In IndicatorLibrary.jsx:
  - Each indicator item:
    - Minimum height 44px for touch targets
    - Icon based on indicator type
    - Indicator short name (e.g., "SMA")
    - Hover state with background color change
    - Optional: Click handler for future indicator selection
  - Tooltip on hover:
    - Show full indicator name and description
    - Use CSS tooltip or title attribute initially
    - Position above or to the right of item
  - Highlight matching search text in indicator names

### Step 9: Add Animations and Transitions
- In IndicatorLibrary.jsx and index.css if needed:
  - Panel expand/collapse: smooth width transition (200ms)
  - Category expand/collapse: smooth max-height transition (150ms)
  - Chevron icon rotation: transform transition (150ms)
  - Search clear: fade transition
  - Indicator hover: background color transition
  - Use existing animation classes from index.css (animate-fade-in, etc.)

### Step 10: Integrate IndicatorLibrary into Strategy.jsx
- Edit `app/client/src/pages/Strategy.jsx`:
  - Import IndicatorLibrary component
  - Add state for panel collapse: `isPanelCollapsed`, `setIsPanelCollapsed`
  - Load initial collapse state from localStorage on mount
  - Update layout to accommodate left sidebar:
    - Change main content grid to include sidebar column
    - When panel is expanded: sidebar takes ~256px (w-64)
    - When panel is collapsed: sidebar takes ~40px (w-10)
    - Main content flexes to fill remaining space
  - Pass props to IndicatorLibrary:
    - `isCollapsed={isPanelCollapsed}`
    - `onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}`
  - Ensure chart area resizes smoothly with transitions

### Step 11: Add Responsive Behavior
- In IndicatorLibrary.jsx and Strategy.jsx:
  - On mobile (< 768px md breakpoint):
    - Panel starts collapsed by default
    - When expanded, panel overlays content (fixed position) instead of pushing
    - Add backdrop/overlay behind expanded panel on mobile
    - Close panel on backdrop click
  - On tablet (768px - 1024px):
    - Panel can be expanded/collapsed
    - Consider smaller default width
  - On desktop (> 1024px):
    - Full panel experience with all features

### Step 12: Implement localStorage Persistence
- In IndicatorLibrary.jsx:
  - On mount: load panel collapse state and category states from localStorage
  - On collapse toggle: save panel state to localStorage
  - On category toggle: save category states to localStorage
- In Strategy.jsx:
  - On mount: load panel collapse state and pass to IndicatorLibrary

### Step 13: Run Validation Commands
- Run backend tests: `cd app/server && uv run pytest` - Verify no regressions
- Run frontend build: `cd app/client && npm run build` - Verify build succeeds
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_indicator_library_panel.md` to validate the indicator library panel functionality works correctly

## Testing Strategy

### Unit Tests
**Frontend Tests**
- Test IndicatorLibrary renders in expanded and collapsed states
- Test search filtering correctly filters indicators by name, shortName, and description
- Test category expand/collapse toggles correctly
- Test all required indicators are present in the data
- Test localStorage persistence works for panel and category states
- Test responsive behavior at different breakpoints

### Edge Cases
- Empty search results: Show "No indicators match '{searchTerm}'" message
- All categories collapsed: Panel should still show category headers
- Search with special characters: Handle gracefully
- localStorage unavailable: Default to expanded state
- Very long indicator names: Truncate with ellipsis
- Rapid expand/collapse clicks: Debounce or queue animations
- Panel resize during chart loading: Ensure smooth transition

## Acceptance Criteria
1. Left sidebar panel displays on the Strategy page with collapsible categories: Trend, Momentum, Volatility, Volume, Custom
2. Each indicator shows an icon, name, and brief tooltip description on hover
3. Search bar at top filters indicators across all categories in real-time
4. Categories expand/collapse on click with smooth animation (150ms transition)
5. Panel can be collapsed to a minimal bar (~40px) to maximize chart space
6. Panel expand/collapse uses smooth width transition (200ms)
7. All required indicators are available:
   - Trend: SMA, EMA, MACD, ADX
   - Momentum: RSI, Stochastic, CCI, Williams %R
   - Volatility: Bollinger Bands, ATR, Keltner Channel
   - Volume: OBV, Volume Profile
8. Panel state (collapsed/expanded) persists in localStorage
9. Category expand/collapse states persist in localStorage
10. Minimum 44px touch targets for mobile accessibility
11. Responsive behavior: overlay mode on mobile, inline on desktop
12. All existing tests pass
13. Frontend builds without errors
14. E2E test validates the panel functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate no regressions (no backend changes expected, but verify)
- `cd app/client && npm run build` - Run frontend build to validate the feature builds without errors
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_indicator_library_panel.md` to validate the indicator library panel functionality works correctly

## Notes
- This is a **frontend-only** feature. No backend changes are required since the indicator library serves as a UI catalog.
- Future features will implement actual indicator calculation logic and chart overlay functionality. This phase focuses on the panel UI, search, and category management.
- The `cn()` utility from `lib/utils.js` should be used for all conditional class merging
- Follow existing component patterns (PairSelector for search/dropdown, Technicals for card layout) for consistent styling
- Use CSS variables defined in `index.css` for colors (--primary, --muted, --border, etc.)
- Lucide React icons are already installed and should be used for all icons
- The indicator `icon` field in the data can reference Lucide icon names for flexibility
- Consider adding keyboard navigation (arrow keys, enter to expand/collapse) as an enhancement
- The Custom category is included for future user-defined indicators
- Panel width of 256px (w-64) was chosen to accommodate longer indicator names while leaving ample chart space
