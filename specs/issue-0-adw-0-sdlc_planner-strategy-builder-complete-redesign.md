# Feature: Strategy Builder Page Complete UI Redesign

## Metadata
issue_number: `0`
adw_id: `0`
issue_json: `N/A - User-initiated redesign request`

## Feature Description
Complete UI redesign of the Strategy Builder page (`/strategies/new` and `/strategies/:id/edit`) with a clean slate approach. The current implementation is visually cluttered and lacks professional polish. This redesign will create a clean, modern, TradingView-inspired interface following the Precision Swiss Design System documented in `ai_docs/ui_style_guide.md`. The goal is to maximize chart real estate, minimize visual noise, and create an intuitive workflow for building trading strategies.

## User Story
As a trader
I want a clean, professional strategy builder interface
So that I can focus on chart analysis and strategy creation without visual distractions

## Problem Statement
The current Strategy Builder page suffers from:
1. **Visual clutter** - Too many elements competing for attention
2. **Inconsistent spacing** - Elements don't follow a consistent grid system
3. **Poor hierarchy** - Unclear visual importance of different sections
4. **Messy layout** - Components feel crammed together without breathing room
5. **Inconsistent styling** - Mixed design patterns that don't follow a cohesive system
6. **Overcomplicated controls** - Too many buttons and options visible at once

## Solution Statement
Redesign the Strategy Builder from scratch with:
1. **Clean slate approach** - Remove all existing layout code and rebuild with proper structure
2. **TradingView-inspired layout** - Chart-centric design with minimal chrome
3. **Precision Swiss Design** - Follow the design system strictly (8px grid, proper typography, minimal decoration)
4. **Progressive disclosure** - Show only essential controls, hide advanced options behind clean interactions
5. **Maximum chart space** - Prioritize chart real estate above all else
6. **Consistent visual language** - Unified styling across all components

## Relevant Files
Use these files to implement the feature:

- `ai_docs/ui_style_guide.md` - **CRITICAL**: The Precision Swiss Design System specification. All styling decisions MUST follow this guide.
- `app/client/src/pages/Strategy.jsx` - The main Strategy page component that needs complete restructuring
- `app/client/src/components/PriceChart.jsx` - Price chart component (keep logic, may need style updates)
- `app/client/src/components/LogicPanel.jsx` - Logic panel component (keep logic, needs visual cleanup)
- `app/client/src/components/IndicatorSearchPopup.jsx` - Indicator search popup (keep logic, ensure styling matches)
- `app/client/src/components/StrategySettingsPopover.jsx` - Strategy settings popover
- `app/client/src/components/PairSelector.jsx` - Currency pair selector component
- `app/client/src/components/DrawingToolbar.jsx` - Drawing tools component
- `app/client/src/components/Technicals.jsx` - Technical analysis component
- `app/client/src/components/NavigationBar.jsx` - Navigation component for context
- `app/client/src/index.css` - Global CSS (may need CSS variable updates)
- `app/client/tailwind.config.js` - Tailwind configuration
- `.claude/commands/test_e2e.md` - E2E test runner documentation
- `.claude/commands/e2e/test_trading_dashboard.md` - Example E2E test for reference

### New Files
- `.claude/commands/e2e/test_strategy_builder_redesign.md` - E2E test specification for validating the redesigned Strategy Builder

## Implementation Plan

### Phase 1: Foundation - Clean Slate Setup
1. **Audit current Strategy.jsx** - Identify all state management, handlers, and business logic that MUST be preserved
2. **Extract reusable logic** - Ensure all indicator, pattern, condition, drawing, and strategy management logic is cleanly separated from UI
3. **Create new layout structure** - Build the new page structure from scratch using proper Tailwind classes following the design system
4. **Update CSS variables** - Ensure `index.css` has all required CSS custom properties from the design system

### Phase 2: Core Implementation - New Layout Architecture
Build a professional, TradingView-inspired layout with these key sections:

**Layout Structure:**
```
+----------------------------------------------------------+
| HEADER BAR (48px)                                        |
| [< Library] [Strategy Name]         [Settings] [Save]    |
+----------------------------------------------------------+
| TOOLBAR (40px)                                           |
| [Pair] [TF] [Candles] | [Drawing Tools] | [+ Indicator]  |
+----------------------------------------------------------+
| MAIN AREA (flex-1)                                       |
| +------------------------------------------------------+ |
| |                                                      | |
| |                    PRICE CHART                       | |
| |                  (maximized space)                   | |
| |                                                      | |
| +------------------------------------------------------+ |
| +------------------------------------------------------+ |
| |              TECHNICALS (collapsible)                | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Logic Panel: Slides in from right edge (overlay/push)    |
+----------------------------------------------------------+
```

**Design Principles:**
- Header: Minimal, clean, 48px height
- Toolbar: Single row, 40px height, grouped controls
- Chart: Takes ALL remaining vertical space
- Logic Panel: Hidden by default, slides in on demand
- All spacing follows 8px grid
- Colors strictly from design system

### Phase 3: Integration
1. Reconnect all existing business logic to new UI components
2. Ensure all dialogs and popups work correctly
3. Validate responsive behavior (mobile/tablet/desktop)
4. Test all existing functionality (indicators, patterns, conditions, drawings, save/load)

## Step by Step Tasks

### Step 1: Create E2E Test Specification
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_trading_dashboard.md` for test format
- Create `.claude/commands/e2e/test_strategy_builder_redesign.md` with comprehensive test steps covering:
  - Clean header bar with back button, strategy name, and action buttons
  - Compact toolbar with pair selector, timeframe buttons, and indicator button
  - Maximized chart area
  - Logic panel slide-in behavior
  - All existing functionality preserved (no regressions)

### Step 2: Audit and Document Current State Management
- Read `app/client/src/pages/Strategy.jsx` completely
- Create a mental map of all state variables, effects, and handlers
- Identify which logic MUST be preserved vs. which is UI-only
- Document the expected behavior for each major feature

### Step 3: Update CSS Foundation
- Review `ai_docs/ui_style_guide.md` for all required CSS variables
- Update `app/client/src/index.css` to include any missing variables
- Ensure Tailwind config in `app/client/tailwind.config.js` aligns with design system
- Add utility classes for common patterns (e.g., `.toolbar-button`, `.header-bar`)

### Step 4: Redesign Strategy.jsx Layout Structure
- Remove the current layout JSX (keep all logic/state at the top)
- Implement new layout structure:

**Header Bar (48px):**
```jsx
<header className="h-12 border-b border-neutral-200 bg-white flex items-center justify-between px-4">
  {/* Left: Back + Strategy Name */}
  <div className="flex items-center gap-3">
    <button onClick={handleBackToLibrary}>
      <ChevronLeft className="h-5 w-5 text-neutral-500" />
    </button>
    <span className="text-sm font-medium text-neutral-900">{strategyName || 'Untitled Strategy'}</span>
  </div>
  {/* Right: Actions */}
  <div className="flex items-center gap-2">
    <button className="btn-secondary">Settings</button>
    <button className="btn-primary">Save</button>
  </div>
</header>
```

**Toolbar (40px):**
```jsx
<div className="h-10 border-b border-neutral-200 bg-neutral-50 flex items-center px-4 gap-4">
  {/* Controls Section */}
  <PairSelector value={selectedPair} onChange={setSelectedPair} />
  <TimeframeButtons value={selectedGran} onChange={handleTimeframeChange} />
  <CandleCountSelector value={selectedCount} onChange={handleCountChange} />

  <div className="h-5 w-px bg-neutral-200" /> {/* Divider */}

  {/* Drawing Tools */}
  <DrawingToolbar activeDrawingTool={activeDrawingTool} onChange={handleDrawingToolChange} />

  <div className="flex-1" /> {/* Spacer */}

  {/* Add Indicator */}
  <button onClick={() => setIsIndicatorSearchOpen(true)} className="btn-secondary h-8 text-sm">
    <Plus className="h-4 w-4 mr-1" />
    Indicator
  </button>

  {/* Logic Panel Toggle */}
  <button onClick={handleLogicPanelToggle} className="btn-ghost h-8">
    <Sparkles className="h-4 w-4" />
  </button>
</div>
```

**Main Content Area:**
```jsx
<div className="flex-1 flex overflow-hidden">
  {/* Chart Area - Takes all available space */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Chart */}
    <div className="flex-1 min-h-0">
      <PriceChart ... />
    </div>
    {/* Technicals (collapsible) */}
    {showTechnicals && <Technicals data={technicalsData} />}
  </div>

  {/* Logic Panel - Slides in from right */}
  <div className={cn(
    "border-l border-neutral-200 bg-white transition-all duration-200",
    isLogicPanelCollapsed ? "w-0" : "w-80"
  )}>
    {!isLogicPanelCollapsed && <LogicPanel ... />}
  </div>
</div>
```

### Step 5: Update PairSelector Component Styling
- Ensure PairSelector follows the design system
- Compact styling for toolbar integration
- Height: 32px (h-8)
- Border: `border-neutral-200`
- Font: `text-sm`

### Step 6: Create TimeframeButtons Component
- Replace timeframe select with compact button group
- Active state: `bg-primary text-white`
- Inactive state: `bg-white text-neutral-600 hover:bg-neutral-50`
- Buttons: 1m, 5m, 15m, 1h, 4h, 1d

### Step 7: Update DrawingToolbar for Compact Mode
- Ensure drawing toolbar fits in the new toolbar row
- Icons only (no labels) in toolbar mode
- Height: 32px buttons
- Proper spacing and hover states

### Step 8: Update LogicPanel Visual Styling
- Clean up internal styling to match design system
- Proper card styling for condition blocks
- Consistent typography
- Proper spacing following 8px grid

### Step 9: Update PriceChart Container Styling
- Remove any internal padding that creates wasted space
- Ensure chart fills available space
- Clean chart toolbar styling
- Proper loading and empty states

### Step 10: Implement Responsive Behavior
- Desktop (>1024px): Full three-column layout
- Tablet (768-1024px): Chart full width, logic panel as overlay
- Mobile (<768px): Full width everything, floating action buttons

### Step 11: Clean Up Dialogs and Popups
- Ensure all dialogs follow the design system:
  - IndicatorSettingsDialog
  - SaveStrategyDialog
  - LoadStrategyDialog
  - ImportStrategyDialog
  - ConfirmDialog
  - TimeFilterDialog
  - DrawingPropertiesDialog
  - MultiTimeframeConditionDialog

### Step 12: Remove Unused Code
- Delete any commented-out code
- Remove unused imports
- Clean up unused CSS classes
- Remove deprecated component references

### Step 13: Run Validation Commands
- Execute all validation commands to ensure zero regressions

## Testing Strategy

### Unit Tests
- No new unit tests required (this is UI restructuring, not logic changes)
- Existing tests should continue to pass

### Edge Cases
- Empty state (no data loaded)
- Loading state (data fetching)
- Error state (API failures)
- Long strategy names (text truncation)
- Many indicators (performance)
- Mobile viewport (responsive design)
- Logic panel open/closed states
- All dialog interactions

## Acceptance Criteria
1. **Clean Visual Design** - Page looks professional and uncluttered at first glance
2. **Chart Maximized** - Price chart takes maximum available space
3. **8px Grid Alignment** - All spacing follows the design system
4. **Consistent Colors** - Only colors from the design system are used
5. **Proper Typography** - Font sizes, weights match design system
6. **Responsive Layout** - Works on desktop, tablet, and mobile
7. **All Functionality Preserved** - Every existing feature works:
   - Pair/timeframe/candle selection
   - Indicator add/edit/remove
   - Pattern detection
   - Condition management (CRUD, grouping, multi-timeframe)
   - Drawing tools
   - Strategy save/load/import/export
   - Time filters
   - Trade direction
   - Candle close confirmation
8. **No Console Errors** - Clean browser console
9. **Build Passes** - `npm run build` completes successfully
10. **Backend Tests Pass** - `uv run pytest` passes

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_strategy_builder_redesign.md` to validate the redesigned UI
- `cd app/server && uv run pytest` - Run server tests to validate no backend regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- `cd app/client && npm start` - Start development server and manually verify at http://localhost:3000/strategies/new

## Notes

### Design System References (from ai_docs/ui_style_guide.md)
- **Primary Color**: `#2563EB` (blue-600)
- **Borders**: `#E5E5E5` (neutral-200)
- **Background**: `#FAFAFA` (neutral-50) for page, `#FFFFFF` for cards
- **Text Primary**: `#171717` (neutral-900)
- **Text Secondary**: `#737373` (neutral-500)
- **Spacing Base**: 8px multiples (4, 8, 12, 16, 24, 32, 48)
- **Border Radius**: 6px for buttons/inputs, 8px for cards
- **Transitions**: 150ms ease-out

### Key Principles
1. **Less is more** - Remove visual noise ruthlessly
2. **Data breathes** - Generous whitespace around important data
3. **Typography drives hierarchy** - Use font size/weight, not color
4. **One accent color** - Blue for primary actions only
5. **No decoration** - Every element must serve a function

### Future Considerations
- Dark mode support (design system includes dark mode variables)
- Keyboard shortcuts overlay (show on `?` key)
- Strategy templates
- Collaborative features
