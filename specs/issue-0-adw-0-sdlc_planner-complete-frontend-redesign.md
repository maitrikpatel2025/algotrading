# Feature: Complete Frontend UI/UX Redesign

## Metadata
issue_number: `0`
adw_id: `0`
issue_json: `{"title": "Complete Frontend UI/UX Redesign", "body": "Redesign complete frontend for our application user experience. Everything fresh using UI style guide to keep it consistent."}`

## Feature Description
A comprehensive redesign of the entire Forex Trading Dashboard frontend to create a modern, professional, and user-centric trading experience. This redesign will transform the application from its current state into a clean, Swiss-design-inspired interface following the "Precision Swiss" design system defined in the UI Style Guide.

The redesign focuses on:
- **Clean Visual Language**: Grid-based mathematics with 8px spacing, typography-driven hierarchy, generous whitespace
- **Functional Minimalism**: No decorative elements - every pixel serves a purpose
- **Professional Trading UX**: TradingView-inspired layouts with maximum data clarity
- **Consistent Design System**: Unified components, colors, and patterns across all pages
- **Performance**: Streamlined components for fast rendering

## User Story
As a forex trader
I want a clean, professional, and intuitive trading interface
So that I can focus on making informed trading decisions without UI distractions

## Problem Statement
The current frontend has evolved organically with inconsistent styling patterns, redundant UI elements, visual clutter, and a dark theme that doesn't align with the professional Swiss design aesthetic. Key issues include:

1. **Inconsistent styling**: Mix of design patterns, gradients, and color schemes
2. **Visual clutter**: Redundant headers, scattered controls, excessive decorative elements
3. **Dark theme dependency**: Current design relies on dark mode with gradients
4. **Component fragmentation**: 44+ components with varying styling approaches
5. **Typography inconsistency**: Multiple font families and weight patterns
6. **Spacing irregularities**: Non-grid-based spacing throughout
7. **Color palette mismatch**: Current colors don't match the Precision Swiss system

## Solution Statement
Implement a complete frontend redesign following the Precision Swiss design system:

1. **New Color Palette**: Light-mode-first with neutral grays + single blue accent (#2563EB)
2. **Typography System**: Inter font, defined type scale, tabular-nums for financial data
3. **8px Grid System**: All spacing aligned to 8px multiples
4. **Component Library Overhaul**: Rebuild all components to match design specifications
5. **Page Layouts**: Clean, data-focused layouts with generous whitespace
6. **Unified Patterns**: Consistent cards, buttons, inputs, tables, and status indicators

## Relevant Files
Use these files to implement the feature:

**Design System & Configuration:**
- `ai_docs/ui_style_guide.md` - The Precision Swiss design system specification (PRIMARY REFERENCE)
- `app/client/tailwind.config.js` - Tailwind configuration to update with new design tokens
- `app/client/src/index.css` - Global styles to replace with new design system
- `app/client/postcss.config.js` - PostCSS configuration

**Core Application:**
- `app/client/src/App.jsx` - Main app wrapper and routing
- `app/client/src/index.js` - Entry point

**Pages to Redesign:**
- `app/client/src/pages/StrategyLibrary.jsx` - Strategy library landing page
- `app/client/src/pages/Strategy.jsx` - Strategy builder page (largest component - 112KB)
- `app/client/src/pages/Monitor.jsx` - Trading bot monitoring dashboard
- `app/client/src/pages/Account.jsx` - Account overview page

**Layout Components:**
- `app/client/src/components/NavigationBar.jsx` - Header navigation (remove gradients)
- `app/client/src/components/Footer.jsx` - Footer (remove gradients, simplify)

**Reusable UI Components:**
- `app/client/src/components/Button.jsx` - Button variants (redesign completely)
- `app/client/src/components/Select.jsx` - Dropdown component
- `app/client/src/components/Toast.jsx` - Notification system
- `app/client/src/components/ConfirmDialog.jsx` - Modal dialogs
- `app/client/src/components/Progress.jsx` - Progress bars

**Trading Components:**
- `app/client/src/components/PriceChart.jsx` - Price chart (31KB)
- `app/client/src/components/Technicals.jsx` - Technical analysis display
- `app/client/src/components/LogicPanel.jsx` - Logic builder panel (31KB)
- `app/client/src/components/BotStatus.jsx` - Bot status cards (20KB)
- `app/client/src/components/AccountSummary.jsx` - Account metrics
- `app/client/src/components/Headlines.jsx` - Market news

**Strategy Components:**
- `app/client/src/components/IndicatorLibrary.jsx` - Indicator selection panel
- `app/client/src/components/IndicatorSearchPopup.jsx` - Indicator search
- `app/client/src/components/ConditionBlock.jsx` - Condition cards
- `app/client/src/components/ConditionGroup.jsx` - Condition groups
- `app/client/src/components/DrawingToolbar.jsx` - Drawing tools
- `app/client/src/components/PairSelector.jsx` - Currency pair selector

**Dialog Components:**
- `app/client/src/components/SaveStrategyDialog.jsx` - Save dialog
- `app/client/src/components/LoadStrategyDialog.jsx` - Load dialog
- `app/client/src/components/IndicatorSettingsDialog.jsx` - Settings dialog
- `app/client/src/components/DrawingPropertiesDialog.jsx` - Properties dialog

**Utility Files:**
- `app/client/src/lib/utils.js` - Utility functions (cn helper)
- `app/client/src/app/chartConstants.js` - Chart styling constants

**E2E Testing Reference:**
- Read `.claude/commands/test_e2e.md` for E2E test execution guide
- Read `.claude/commands/e2e/test_trading_dashboard.md` for E2E test example

### New Files

**New Design System Files:**
- `app/client/src/styles/design-tokens.css` - CSS custom properties for design tokens
- `app/client/src/components/ui/Card.jsx` - New card component
- `app/client/src/components/ui/Badge.jsx` - Status badge component
- `app/client/src/components/ui/Input.jsx` - Form input component
- `app/client/src/components/ui/Table.jsx` - Data table component
- `app/client/src/components/ui/KPICard.jsx` - KPI display component

**E2E Test Files:**
- `.claude/commands/e2e/test_frontend_redesign.md` - E2E test for redesigned UI

## Implementation Plan

### Phase 1: Foundation - Design System Setup
Establish the core design system foundation that all components will build upon:
- Update Tailwind configuration with Precision Swiss tokens
- Replace global CSS with new design system styles
- Create design token CSS variables
- Set up Inter font family
- Create base utility classes

### Phase 2: Core Components - Building Blocks
Rebuild fundamental UI components that are used across all pages:
- Button component (primary, secondary, danger variants)
- Input component (text, search, with error states)
- Card component (default and elevated variants)
- Badge component (status badges)
- Table component (headers, rows, zebra striping)
- KPICard component (large number displays)
- Progress bar component
- Toast notification component

### Phase 3: Layout Components
Redesign structural components that define page layout:
- NavigationBar - Clean horizontal nav with no gradients
- Footer - Simplified, minimal footer
- Page containers with proper max-width and padding

### Phase 4: Page Redesigns
Apply new design system to each page:

**Monitor Page:**
- Clean bot status cards with left-border status indicators
- Headlines section with proper typography hierarchy
- KPI cards for quick stats
- Remove gradient hero section

**Strategy Library Page:**
- Clean strategy list with proper table styling
- Action buttons following button specifications
- Search and filter with new input styling

**Strategy Builder Page:**
- Clean TradingView-inspired layout
- Left toolbar for drawing tools
- Price chart with proper chart container styling
- Logic panel with clean condition blocks
- Indicator library with proper card styling

**Account Page:**
- Account summary with KPI cards
- Open trades table with proper styling
- Trade history with pagination

### Phase 5: Specialized Components
Redesign trading-specific components:
- Indicator settings dialogs
- Condition blocks and groups
- Time filter components
- Drawing property dialogs
- Pair selector with new input styling

### Phase 6: Integration & Polish
Final integration and refinements:
- Dark mode adaptation (optional enhancement)
- Responsive breakpoint testing
- Animation and transition refinements
- Accessibility audit
- Performance optimization

## Step by Step Tasks

### Step 1: Create E2E Test Specification
Create the E2E test file for validating the redesigned UI.

- Create `.claude/commands/e2e/test_frontend_redesign.md` with test steps covering:
  - All four pages load with new design (no gradients, proper colors)
  - Navigation bar displays correctly
  - Button styles match design system
  - Card components have proper borders (no shadows on default cards)
  - KPI numbers display with tabular-nums
  - Tables have proper header styling
  - Status badges display correctly
  - Forms have proper input styling with focus states
  - Typography hierarchy is consistent
  - Screenshot captures for visual verification

### Step 2: Update Tailwind Configuration
Update `app/client/tailwind.config.js` with Precision Swiss design tokens.

- Replace custom colors with new palette (primary: #2563EB, neutrals: #171717-#FAFAFA)
- Update font family to Inter
- Configure 8px-based spacing scale
- Add custom animations (ease-out, ease-in-out)
- Configure shadow tokens (shadow-sm, shadow-md, shadow-lg)
- Remove gradient utilities (not needed)

### Step 3: Create Design Tokens CSS
Create `app/client/src/styles/design-tokens.css` with CSS custom properties.

- Define all color tokens as CSS variables
- Define shadow variables
- Define typography tokens
- Include dark mode overrides in `.dark` class

### Step 4: Replace Global Styles
Rewrite `app/client/src/index.css` to match Precision Swiss specifications.

- Import Inter font from Google Fonts
- Import design-tokens.css
- Define base styles with new neutral palette
- Create component layer with new .card, .btn, .badge, .table classes
- Create utility layer with .financial, .kpi-number, .label classes
- Add reduced motion media queries
- Remove all gradient definitions
- Remove old color variables

### Step 5: Create Base UI Components
Create new component files in `app/client/src/components/ui/`:

**Card.jsx:**
- Default card: white background, 1px neutral-200 border, 8px radius, 24px padding
- Elevated card: shadow-md, no border

**Badge.jsx:**
- Running: green-50 background, green-700 text
- Stopped: neutral-100 background, neutral-600 text
- Error: red-50 background, red-700 text

**Input.jsx:**
- Height 44px, 16px horizontal padding
- 1px neutral-200 border, 6px radius
- Focus: blue border with 3px blue/10 ring

**Table.jsx:**
- Container with border and overflow hidden
- Header row: neutral-100 background, uppercase, letter-spacing
- Body rows: hover state, zebra striping option

**KPICard.jsx:**
- Label: 12px uppercase with letter-spacing
- Value: 36px semibold tabular-nums

### Step 6: Redesign Button Component
Update `app/client/src/components/Button.jsx`:

- Primary: #2563EB background, white text, hover #1D4ED8
- Secondary: transparent with neutral-200 border, hover neutral-100 bg
- Danger: #DC2626 background, white text, hover #B91C1C
- Remove gradient variants
- Add active state with scale(0.98) transform
- Consistent 12px 24px padding, 6px radius, 500 weight, 14px font

### Step 7: Redesign NavigationBar
Update `app/client/src/components/NavigationBar.jsx`:

- Remove gradient background (use white/neutral-50)
- Simple 1px bottom border
- Clean horizontal nav links
- Active state: primary color text
- Mobile menu with clean styling
- Remove decorative elements

### Step 8: Redesign Footer
Update `app/client/src/components/Footer.jsx`:

- Light background (neutral-50)
- Simple border-top
- Minimal content: copyright, essential links
- Remove multi-column complex layout
- Remove social media placeholders

### Step 9: Redesign Monitor Page
Update `app/client/src/pages/Monitor.jsx`:

- Remove gradient hero section
- Clean page title with heading-1 styling
- Bot status using new card component with left-border status
- Headlines section with proper spacing
- KPI cards for quick stats (if applicable)
- White background for entire page

Update `app/client/src/components/BotStatus.jsx`:
- Use new card with left-border status indicator
- Proper KPI number styling for metrics
- Clean status badges
- Consistent button styling

Update `app/client/src/components/Headlines.jsx`:
- Clean list styling
- Proper typography hierarchy
- Hover states on items

### Step 10: Redesign Strategy Library Page
Update `app/client/src/pages/StrategyLibrary.jsx`:

- Clean page header with heading-1
- Strategy list using new table component
- Action buttons with proper styling
- Search input with new input component
- Create button as primary CTA

### Step 11: Redesign Strategy Builder Page
Update `app/client/src/pages/Strategy.jsx`:

- Clean top control bar with proper spacing
- Pair selector with new input styling
- Timeframe buttons with proper toggle styling
- Chart container with new card styling
- Logic panel with clean card styling

Update `app/client/src/components/PriceChart.jsx`:
- Chart container with proper border and padding
- Clean legend overlay styling
- Remove any gradient backgrounds

Update `app/client/src/components/LogicPanel.jsx`:
- Clean panel styling with proper header
- Condition blocks with new card styling
- Proper button styling for actions

Update `app/client/src/components/ConditionBlock.jsx`:
- Clean card styling
- Proper badge for condition type
- Consistent spacing

Update `app/client/src/components/IndicatorLibrary.jsx`:
- Clean list styling
- Draggable items with proper hover/drag states

### Step 12: Redesign Account Page
Update `app/client/src/pages/Account.jsx`:

- Clean page header
- Account summary with KPI cards
- Proper section spacing

Update `app/client/src/components/AccountSummary.jsx`:
- KPI cards for balance, margin, P&L
- Proper financial number formatting with tabular-nums
- P&L coloring (profit green, loss red)

Update `app/client/src/components/OpenTrades.jsx`:
- New table component styling
- Proper P&L coloring
- Clean action buttons

Update `app/client/src/components/TradeHistory.jsx`:
- New table component styling
- Pagination with proper button styling

### Step 13: Redesign Dialog Components
Update all dialog components to match design system:

- `SaveStrategyDialog.jsx` - Clean modal with proper input styling
- `LoadStrategyDialog.jsx` - Clean list with proper selection states
- `IndicatorSettingsDialog.jsx` - Clean form layout
- `ConfirmDialog.jsx` - Clean modal with proper button hierarchy
- `DrawingPropertiesDialog.jsx` - Clean property form

Common patterns:
- White background
- Subtle shadow (shadow-lg for modals)
- Proper heading hierarchy
- Primary/secondary button pattern (primary on right)
- Consistent padding (24px)

### Step 14: Update Progress Component
Update `app/client/src/components/Progress.jsx`:

- Clean progress bar styling
- Proper colors for bullish/bearish
- Consistent height and radius

### Step 15: Update Toast Component
Update `app/client/src/components/Toast.jsx`:

- Clean toast styling with proper shadows
- Status-specific left border
- Proper typography
- Clean dismiss button

### Step 16: Update Select Component
Update `app/client/src/components/Select.jsx`:

- Match input styling (44px height, proper border)
- Clean dropdown styling
- Proper hover and selected states
- Checkmark indicator

### Step 17: Update Technicals Component
Update `app/client/src/components/Technicals.jsx`:

- Clean collapsible header styling
- Proper table styling for pivot points
- Consistent status coloring

### Step 18: Update Chart Constants
Update `app/client/src/app/chartConstants.js`:

- Candlestick colors: profit #16A34A, loss #DC2626
- Grid lines: #F5F5F5
- Axis labels: #737373, 11px
- Clean, minimal chart styling

### Step 19: Accessibility Audit
Verify accessibility compliance:

- Test color contrast (4.5:1 minimum for text)
- Verify focus indicators (3px blue ring)
- Test keyboard navigation
- Verify touch targets (44px minimum)
- Add prefers-reduced-motion support
- Test with screen reader

### Step 20: Responsive Testing
Test all breakpoints:

- Mobile (640px) - Stack layouts, mobile nav
- Tablet (768px) - Adjusted grids
- Desktop (1024px) - Full layouts
- Large (1280px) - Max container width

### Step 21: Run Validation Commands
Execute all validation commands to ensure the redesign works correctly:

- Run server tests: `cd app/server && uv run pytest`
- Run frontend build: `cd app/client && npm run build`
- Execute E2E test: Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_frontend_redesign.md`

## Testing Strategy

### Unit Tests
- Component rendering tests for new UI components
- Button variant tests
- Card variant tests
- Badge status tests
- Input state tests (focus, error, disabled)

### Edge Cases
- Empty states (no data, loading, error)
- Long text overflow handling
- Very large numbers in KPI displays
- Mobile viewport edge cases
- Dark mode transitions (if implemented)
- High contrast mode
- Reduced motion preference

## Acceptance Criteria
1. All pages use the Precision Swiss color palette (no gradients, blues as accent only)
2. All text uses Inter font family
3. All spacing follows 8px grid system
4. All financial numbers use tabular-nums
5. All buttons match specified styles (primary/secondary/danger)
6. All cards have proper 1px borders (no shadows on default cards)
7. Navigation bar is clean with no gradient background
8. Status badges follow specified patterns
9. Tables have proper header styling with uppercase labels
10. Input fields have proper focus states with blue ring
11. All pages are responsive across defined breakpoints
12. Build completes without errors
13. All existing functionality remains intact
14. E2E tests pass validating new design

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the feature works with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the feature works with zero regressions
- `cd app/client && npm start` - Start development server to manually verify visual changes
- Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_frontend_redesign.md` to validate redesigned UI functionality

## Notes

### Design System Reference
The primary reference document is `ai_docs/ui_style_guide.md` (Precision Swiss v2.0.0). All implementation decisions should align with this specification.

### Key Design Principles
1. **Grid Mathematics**: Every element aligns to 8px grid
2. **Typographic Hierarchy**: Typography drives visual organization
3. **Generous Whitespace**: Let data breathe
4. **Functional Minimalism**: No decoration, only function

### Color Philosophy
- Use grayscale (neutral palette) for most UI elements
- Reserve primary blue (#2563EB) for CTAs and interactive elements only
- Use semantic colors sparingly (success green, error red, warning yellow)

### Font Loading
Add Inter font from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Breaking Changes
This redesign will significantly change the visual appearance of the application. Users should be informed of the new design. Consider:
- Changelog entry documenting the redesign
- Screenshot comparisons in release notes

### Future Enhancements
- Dark mode implementation (design tokens already support this)
- Animation library for micro-interactions
- Component library documentation (Storybook)
- Design token export for external tools

### Performance Considerations
- Remove unused CSS from build
- Optimize font loading with font-display: swap
- Lazy load dialog components
- Consider CSS containment for complex components
