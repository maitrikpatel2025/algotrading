# Chore: Refactor Application Navigation and Page Structure

## Metadata
issue_number: `27`
adw_id: `bbcca085`
issue_json: `{"number":27,"title":"Chores - Refactor application navigation and page","body":"Refactor application navigation and page structure to create distinct Monitor, Strategy, and Account workflows for improved user experience.\n\n/Chore\n\nadw_sdlc_iso\n\n\nThis feature involves a comprehensive reorganization of the frontend user interface to align with the core trading workflow: We will replace the generic \"Home\" -> \"Monitor\"   and \"Dashboard\" -\"Strategy\".\n\nImplementation details:\n\n Refactor the Dashboard into a \"Strategy\" page, centralizing controls for currency pairs, timeframes, and technical analysis.\nImplement \"Strategy\" UI elements\n\nMove the \"Trading Bot Status Automated trading system\" execution controls to the Monitor page\nAlso keep the headlines into the monitor page as well\nMove home page  account summary to the account page\n\nStyling: Ensure all new page layouts adhere to the spacing and container standards defined in the UI Style Guide\n\n"}`

## Chore Description

This chore involves a comprehensive reorganization of the frontend user interface to align with the core trading workflow. The current navigation uses generic naming ("Home" and "Dashboard") that doesn't clearly communicate the purpose of each page. This refactor will create three distinct workflow-oriented pages:

1. **Monitor** (renamed from "Home"): Focus on real-time monitoring of trading bot status and market headlines
2. **Strategy** (renamed from "Dashboard"): Focus on technical analysis, currency pairs, and chart analysis
3. **Account**: Focus on account details, open trades, and trade history

This reorganization will improve user experience by:
- Creating clear, workflow-aligned navigation labels
- Grouping related functionality together
- Separating monitoring, analysis, and account management concerns
- Following the UI Style Guide spacing and container standards

## Relevant Files

### Files to Modify

- **app/client/src/App.jsx**
  - Update route paths from "/" and "/dashboard" to "/monitor" and "/strategy"
  - Rename page component imports
  - Maintain the "/account" route

- **app/client/src/components/NavigationBar.jsx**
  - Update navigation items from "Home" → "Monitor" and "Dashboard" → "Strategy"
  - Update href paths from "/" to "/monitor" and "/dashboard" to "/strategy"
  - Keep "Account" navigation item unchanged

- **app/client/src/pages/Home.jsx**
  - Rename file to `Monitor.jsx`
  - Update component name from `Home` to `Monitor`
  - Remove `AccountSummary` component (move to Account page)
  - Keep `BotStatus` component
  - Keep `Headlines` component
  - Update page title and descriptions to reflect monitoring focus

- **app/client/src/pages/Dashboard.jsx**
  - Rename file to `Strategy.jsx`
  - Update component name from `Dashboard` to `Strategy`
  - Update page header from "Trading Dashboard" to "Strategy"
  - Update descriptions to reflect strategy/analysis focus
  - Keep all existing chart and technical analysis functionality

- **app/client/src/pages/Account.jsx**
  - Add `AccountSummary` component at the top of the page
  - Maintain existing `OpenTrades` and `TradeHistory` components
  - Update page layout to accommodate the new AccountSummary section
  - Ensure proper spacing follows UI Style Guide standards

### New Files

- **app/client/src/pages/Monitor.jsx**
  - Created by renaming Home.jsx
  - Contains BotStatus and Headlines components
  - Hero section updated to reflect monitoring focus

- **app/client/src/pages/Strategy.jsx**
  - Created by renaming Dashboard.jsx
  - Contains PriceChart, Technicals, and strategy controls
  - Page header updated to "Strategy" terminology

## Step by Step Tasks

### Step 1: Update Navigation Component
- Open `app/client/src/components/NavigationBar.jsx`
- Update the `navItems` array:
  - Change `{ href: "/", label: "Home" }` to `{ href: "/monitor", label: "Monitor" }`
  - Change `{ href: "/dashboard", label: "Dashboard" }` to `{ href: "/strategy", label: "Strategy" }`
  - Keep `{ href: "/account", label: "Account" }` unchanged

### Step 2: Rename and Update Home Page to Monitor Page
- Rename `app/client/src/pages/Home.jsx` to `app/client/src/pages/Monitor.jsx`
- Update component name from `Home` to `Monitor`
- Remove the `AccountSummary` component import and usage
- Update page title in hero section from "Welcome to Forex Dash" to reflect monitoring focus
- Update page description to emphasize real-time monitoring of bot status and market news
- Keep `BotStatus` and `Headlines` components in the layout
- Remove the "Quick Actions" section at the bottom
- Ensure spacing follows UI Style Guide standards (use `py-8 space-y-8` for main container)

### Step 3: Rename and Update Dashboard Page to Strategy Page
- Rename `app/client/src/pages/Dashboard.jsx` to `app/client/src/pages/Strategy.jsx`
- Update component name from `Dashboard` to `Strategy`
- Update page header `h1` text from "Trading Dashboard" to "Strategy"
- Update page description from "Analyze currency pairs with technical indicators and live charts" to "Analyze currency pairs, timeframes, and technical indicators for trading decisions"
- Keep all existing functionality (currency pair selection, timeframe selection, technical analysis, price charts)
- Ensure spacing follows UI Style Guide standards

### Step 4: Update Account Page with Account Summary
- Open `app/client/src/pages/Account.jsx`
- Import `AccountSummary` component: `import AccountSummary from '../components/AccountSummary';`
- Add `AccountSummary` component to the page layout as the first section before `OpenTrades`
- Structure the layout with proper spacing:
  - Place `AccountSummary` in its own section with bottom margin
  - Keep `OpenTrades` and `TradeHistory` in the existing `space-y-6` container
- Ensure the page follows UI Style Guide spacing standards (main container uses `py-8 space-y-6`)

### Step 5: Update App Router Configuration
- Open `app/client/src/App.jsx`
- Update imports:
  - Change `import Home from './pages/Home';` to `import Monitor from './pages/Monitor';`
  - Change `import Dashboard from './pages/Dashboard';` to `import Strategy from './pages/Strategy';`
  - Keep `import Account from './pages/Account';` unchanged
- Update Routes:
  - Change `<Route exact path="/" element={<Home />} />` to `<Route exact path="/monitor" element={<Monitor />} />`
  - Change `<Route exact path="/dashboard" element={<Dashboard />} />` to `<Route exact path="/strategy" element={<Strategy />} />`
  - Keep `<Route exact path="/account" element={<Account />} />` unchanged
- Add a redirect route from "/" to "/monitor" for backwards compatibility: `<Route path="/" element={<Navigate to="/monitor" replace />} />`
- Add import for Navigate: `import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';`

### Step 6: Verify Styling Consistency
- Review all modified pages to ensure they follow UI Style Guide standards:
  - Main page containers use `py-8 space-y-8` or `py-8 space-y-6` for section spacing
  - Cards use the `.card` class with proper padding
  - Page headers use proper hierarchy (h1 with `text-h2` class)
  - Descriptions use `text-muted-foreground` for secondary text
  - Grid layouts use proper gap spacing (`gap-6` for large sections, `gap-4` for smaller)
  - Icons are properly sized (`h-6 w-6` for page headers, `h-5 w-5` for cards, `h-4 w-4` for inline)
- Verify responsive behavior on all breakpoints (mobile, tablet, desktop)

### Step 7: Test Navigation Flow
- Verify that clicking "Monitor" navigates to `/monitor`
- Verify that clicking "Strategy" navigates to `/strategy`
- Verify that clicking "Account" navigates to `/account`
- Verify that accessing `/` redirects to `/monitor`
- Verify that all old routes still work or redirect appropriately
- Test browser back/forward buttons work correctly
- Test mobile menu navigation works properly

### Step 8: Verify Component Placement
- **Monitor page** should contain:
  - Hero section with monitoring focus
  - BotStatus component
  - Headlines component
- **Strategy page** should contain:
  - Page header with "Strategy" title
  - Currency pair and timeframe selectors
  - Load data button
  - Price chart
  - Technical analysis panel
- **Account page** should contain:
  - Page header with "Account" title
  - AccountSummary component (newly added)
  - OpenTrades component
  - TradeHistory component

### Step 9: Run Validation Commands
- Execute all validation commands listed below to ensure zero regressions
- Fix any TypeScript/build errors that arise
- Fix any test failures
- Verify the application runs without errors

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the chore is complete with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the chore is complete with zero regressions

## Notes

### Important Considerations

1. **Backwards Compatibility**: Add a redirect from "/" to "/monitor" to ensure existing bookmarks/links continue to work

2. **Route Structure**: The new route structure will be:
   - `/monitor` - Real-time monitoring (bot status, headlines)
   - `/strategy` - Strategy analysis (charts, technicals, pair selection)
   - `/account` - Account management (summary, trades, history)

3. **Component Reuse**: All existing components (BotStatus, Headlines, AccountSummary, PriceChart, Technicals, etc.) are being reused without modification. Only their placement changes.

4. **UI Style Guide Compliance**: All pages must follow the spacing standards:
   - Main container: `py-8 space-y-8` or `py-8 space-y-6`
   - Card padding: standard `.card` class handles this
   - Section gaps: `gap-6` for major sections, `gap-4` for minor sections
   - Grid layouts: responsive with proper breakpoints

5. **Mobile Experience**: Ensure the mobile hamburger menu properly reflects the new navigation labels

6. **Active States**: The navigation bar should properly highlight the active page based on the current route

7. **User Experience**: This refactor creates a clearer mental model:
   - **Monitor**: "What's happening right now?" (bot activity, news)
   - **Strategy**: "What should I do?" (analysis, charts, decisions)
   - **Account**: "How am I doing?" (balance, trades, history)

8. **No Backend Changes**: This is purely a frontend refactor. No API endpoints or server-side code needs to change.

9. **Testing Focus**: Pay special attention to:
   - Navigation links work correctly
   - Active route highlighting works
   - All components render properly in their new locations
   - Mobile navigation works properly
   - Browser back/forward navigation works
   - Direct URL access to each route works
